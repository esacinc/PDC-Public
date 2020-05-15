//@@@PDC-191 experimental metadata API
//@@@PDC-774 add downloadable
//@@@PDC-1874 add pdc_study_id to study-related APIs
const File = `
type File {
	file_id: String
	study_submitter_id: String
	pdc_study_id: String
	file_name: String
	file_type: String
	data_category : String
	md5sum: String
	file_size: Int
	files_count: Int
	file_location: String
	downloadable: String
	study_run_metadata: [StudyRunMetadata]
	studies: [Study]
}`
;

export default File;