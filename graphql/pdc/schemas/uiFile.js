//@@@PDC-774 add downloadable
//@@@PDC-827 Add md5sum  and StudyId
const UIFile = `
type UIFile {
	file_id: String
	study_id: String
	submitter_id_name: String
	file_name: String
	study_run_metadata_submitter_id: String
	project_name: String
	data_category: String
	file_type: String
	downloadable: String
	access: String
	md5sum: String
	file_size: String
}`
;

export default UIFile;