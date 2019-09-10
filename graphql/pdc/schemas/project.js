const Project = `
type Project {
  project_id: String
  project_submitter_id: String
  name: String
  program: Program
  studies: [Study]
  cases: [Case]
}`
;

export default Project;