const fetch = require('node-fetch')
const colors = require('colors/safe')

module.exports = function getProjectMembership(token, { projectId }){
  console.log(colors.white.bold(`Fetching project #${projectId} members...`))
  return fetch(`https://www.pivotaltracker.com/services/v5/projects/${projectId}/memberships`, {
    headers: {
      'X-TrackerToken': token,
    },
  }).then(response => response.json())
}
