//@@@PDC-1874 add pdc_study_id to study-related APIs
const SearchStudyRecord = `
type SearchStudyRecord {
	record_type: String
	name: String
    submitter_id_name: String
	study_id: String
	study_submitter_id: String
	pdc_study_id: String
	description: String
	proteins: String
}`
;

export default SearchStudyRecord;