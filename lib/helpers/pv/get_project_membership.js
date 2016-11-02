const fetch = require('node-fetch')

module.exports = function getProjectMembership(token, { projectId }){
  return fetch(`https://www.pivotaltracker.com/services/v5/projects/${projectId}/memberships`, {
    headers: {
      'X-TrackerToken': token,
    }
  }).then(response => response.json())
}
