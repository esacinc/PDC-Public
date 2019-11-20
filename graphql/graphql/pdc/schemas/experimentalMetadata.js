//@@@PDC-191 experimental metadata API
const ExperimentalMetadata = `
type ExperimentalMetadata {
  study_submitter_id: String
  experiment_type: String
  analytical_fraction: String
  instrument: String
  study_run_metadata: [StudyRunMetadata]
}`
;

export default ExperimentalMetadata;