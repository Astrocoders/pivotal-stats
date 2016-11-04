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
  const projectsMemberships = _(
    yield projects.map(project => (
      getProjectMembership({
        projectId: project.id,
      })
    ))
  )
  .flatten()
  .uniqBy('id')
  .map(member => Object.assign(member, {id: member.person.id.toString()}))
  .value()

  console.log(colors.white.bold('Parsing data...'))
  const c = fn => (...args) => source => fn.call(_, source, ...args)
  const stories = _(projectsWithStories)
    .flatten()
    .filter(story => !_.isEmpty(story.owner_ids))
    .groupBy(story => _.first(story.owner_ids))
    .mapKeys((stories, ownerId) => {
      return _.find(projectsMemberships, { id: ownerId.toString() }).person.email
    })
    .mapValues(stories => {
      return {
        totalPoints: stories.reduce((acc, { estimate = 0 }) => acc + estimate, 0),
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
