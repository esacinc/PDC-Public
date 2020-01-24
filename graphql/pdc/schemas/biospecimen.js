//@@@PDC-898 new public APIs--biospecimenPerStudy
//@@@PDC-1127 add pool and taxon
//@@@PDC-1156 add is_ref
//@@@PDC-1396 add external_case_id
const Biospecimen = `
type Biospecimen {
	aliquot_id: String 
	sample_id: String
	case_id: String
	case_submitter_id: String	
	external_case_id: String
	aliquot_submitter_id: String 
	case_status: String
	aliquot_is_ref: String
	aliquot_status: String
	sample_status: String
	sample_submitter_id: String
	project_name: String
	sample_type: String
	disease_type: String
	primary_site: String
	pool: String
	taxon: String
}`
;

export default Biospecimen;