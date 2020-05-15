//@@@PDC-191 experimental metadata API
//@@@PDC-1874 add pdc_study_id to study-related APIs
const ExperimentalMetadata = `
type ExperimentalMetadata {
  study_submitter_id: String
  pdc_study_id: String
  experiment_type: String
  analytical_fraction: String
  instrument: String
  study_run_metadata: [StudyRunMetadata]
}`
;

export default ExperimentalMetadata;