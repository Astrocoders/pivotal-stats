module.exports = function PV({ token }){
  const binder = fn => fn.bind(null, token)
  return {
    getProjects: binder(require('./get_projects')),
    getProjectMembership: binder(require('./get_project_membership')),
    getProjectStories: binder(require('./get_project_stories')),
  }
}
