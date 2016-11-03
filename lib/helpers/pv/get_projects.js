const fetch = require('node-fetch')
const colors = require('colors/safe')

const endpoint = 'https://www.pivotaltracker.com/services/v5/projects'
module.exports = function getProjects(token){
  console.log(colors.white.bold('Fetching projects...'))
  return fetch(endpoint, {
    headers: {
      'X-TrackerToken': token,
    }
  })
  .then(response => response.json())
  .then(projects => (console.log(colors.green(`${projects.length} projects`)), projects))
}
