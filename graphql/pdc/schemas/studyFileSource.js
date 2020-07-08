//@@@PDC-2167 group files by data source
const StudyFileSource = `
type StudyFileSource {
	study_submitter_id: String
	pdc_study_id: String
	data_source : String
	fileCounts: [File]
}`
;

export default StudyFileSource;