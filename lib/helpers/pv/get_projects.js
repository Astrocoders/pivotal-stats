const fetch = require('node-fetch')

const endpoint = 'https://www.pivotaltracker.com/services/v5/projects'
module.exports = function getProjects(token){
  return fetch(endpoint, {
    headers: {
      'X-TrackerToken': token,
    }
  }).then(response => response.json())
}
