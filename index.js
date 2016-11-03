#!/usr/bin/env node
const moment = require('moment')
const _ = require('lodash')
const co = require('co')
const colors = require('colors/safe')
const PV = require('./lib/helpers/pv')

const argv = require('yargs')
  .demand(['token'])
  .argv

const { token } = argv

co(function *(){
  const {
    getProjects,
    getProjectStories,
    getProjectMembership,
  } = PV({ token })

  const projects = yield getProjects()
  const projectsWithStories = yield projects.map(project => getProjectStories({
    projectId: project.id,
  })) 
  console.log(colors.green(`${projectsWithStories.reduce((acc, p) => p.length + acc, 0)} stories`))
  const projectsMemberships = yield projects.map(project => ({
    projectId: project.id,
    memberships: getProjectMembership({
      projectId: project.id,
    }),
  }))

  console.log(colors.white.bold('Parsing data...'))
  const stories = _(projectsWithStories)
    .flatten()
    // Put the owner email instead of Pivotal's ID for easy checking
    .map(story => {
      const projectMemberships = _.find(projectsMemberships, { projectId: story.project_id }).memberships
      const ownerId = _.first(story.owner_ids)
      const owner = _.find(projectMemberships, membership => membership.person.id === ownerId )

      if(!owner){
        console.log(colors.red(`Owner #${ownerId} for story ${story.name} (#${story.id}) wasn't found.`))
      }

      return Object.assign(story, {
        owner: _.get(owner, 'person.email', null),
      })
    })
    // Should filter only the accepted ones because they are the ones the client approved?
    // Or finished and accepted should go because they represent things worked on?
    .filter(story => !_.isEmpty(story.owner))
    .groupBy('owner')
    .mapValues(stories => {
      return {
        totalPoints: stories.reduce((acc, { estimate = 0 }) => acc + estimate, 0),
        // averageDeliveryTime: stories.map(({ accepted_at, finished_at, started_at }) => {
        //   return 0
        // })
      }
    })
    .value()

  printStoriesStats(stories)
})

function printStoriesStats(stories){
  console.log('\n')
  console.log(colors.green.bold('Parsed stats by contributor for the stories of last month:'))
  Object.keys(stories)
    .forEach(contributorEntry => {
      console.log(`${colors.cyan(contributorEntry)} =>`)
      const contributor = stories[contributorEntry]
      Object.keys(contributor)
        .forEach(stat => {
          logIndented(2, `${colors.white(stat)}: ${colors.red.bold(contributor[stat])}`)
        })
    })
}

function logIndented(indentation, ...args){
  console.log(_.times(indentation, () => ' ').join(''), ...args)
}
