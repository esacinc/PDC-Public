//@@@PDC-471 filePerStudy api enhancement
//@@@PDC-898 new public APIs--filesPerStudy
const FilePerStudy = `
type FilePerStudy {
	study_id: String
	study_submitter_id: String
	study_name: String
	file_id: String
	file_name: String
	file_submitter_id: String
	file_type: String
	data_category: String
	file_location: String
	md5sum: String
	file_size: String
	file_format: String
}`
;

export default FilePerStudy;