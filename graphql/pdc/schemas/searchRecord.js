//@@@PDC-372 add submitter_id_name for study type
//@@@PDC-398 Add description to the APIs for search
//@@@PDC-468 Add proteins to protein search
const SearchRecord = `
type SearchRecord {
	record_type: String
	name: String
	submitter_id_name: String
	description: String
	proteins: String
}`
;

export default SearchRecord;