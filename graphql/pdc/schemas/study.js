//@@@PDC-474 programs-projects-studies API
//@@@PDC-191 experimental metadata API
//@@@PDC-898 new public APIs--study
//@@@PDC-1874 add pdc_study_id to study-related APIs
const Study = `
type Study {
  study_id: String
  study_submitter_id: String
  pdc_study_id: String
  submitter_id_name: String
  study_name: String
  study_shortname: String
  program_name: String
  project_name: String
  program_id: String
  project_id: String
  project_submitter_id: String
  disease_type: String
  primary_site: String
  analytical_fraction: String
  experiment_type: String
  acquisition_type: String
  project: Project
  cases_count: Int
  aliquots_count: Int
  filesCount: [File]
  diagnoses: [Diagnosis]
  cases: [Case]
  files: [File]
  study_run_metadata: [StudyRunMetadata]
}`
;

//export default [Study, Case, Project, Diagnosis, File, StudyRunMetadata];
export default Study;