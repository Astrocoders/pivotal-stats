const fetch = require('node-fetch')
const moment = require('moment')
const queryString = require('query-string')

module.exports = function getProjectStories(token, { projectId }){
  const lastMonth = moment().subtract(1, 'month')
  const query = {
    with_state: 'accepted',
    with_story_type: 'feature',
    accepted_after: lastMonth.startOf('month').toDate().toISOString(),
    accepted_before: lastMonth.clone().endOf('month').toDate().toISOString(),
  }

  return fetch(`https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories?${queryString.stringify(query)}`, {
    headers: {
      'X-TrackerToken': token,
      'X-Tracker-Pagination-Limit': 0,
      'Content-Type': 'application/json',
    }
  }).then(response => response.json())
}
