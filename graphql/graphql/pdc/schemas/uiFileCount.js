//@@@PDC-759 add data_category to file count group
const UIFileCount = `
type UIFileCount {
	acquisition_type: String
	submitter_id_name: String 
	experiment_type: String
	file_type: String
	data_category: String
	files_count: Int
}`
;

export default UIFileCount;