#!/usr/bin/env node
const moment = require('moment')
const _ = require('lodash')
const {
  flow,
  map,
  mapValues,
  mapKeys,
  groupBy,
  uniqBy,
  flatten,
  filter,
  isEmpty,
  first,
  find,
} = require('lodash/fp')
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
  const projectsMemberships = flow(
    flatten,
    uniqBy('id'),
    map(member => Object.assign(member, {id: member.person.id.toString()}))
  )(
    yield projects.map(project => (
      getProjectMembership({
        projectId: project.id,
      })
    ))
  )

  console.log(colors.white.bold('Parsing data...'))
  const stories = flow(
    flatten,
    filter(story => !isEmpty(story.owner_ids)),
    groupBy(story => first(story.owner_ids)),
    mapKeys(ownerId => (
      find({ id: ownerId.toString() })(projectsMemberships).person.email
    )),
    mapValues(stories => ({
      totalPoints: stories.reduce((acc, { estimate = 0 }) => acc + estimate, 0),
    }))
  )(projectsWithStories)

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
