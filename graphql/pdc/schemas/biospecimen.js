//@@@PDC-898 new public APIs--biospecimenPerStudy
const Biospecimen = `
type Biospecimen {
	aliquot_id: String 
	sample_id: String
	case_id: String
	case_submitter_id: String	
	aliquot_submitter_id: String 
	case_status: String
	aliquot_status: String
	sample_status: String
	sample_submitter_id: String
	project_name: String
	sample_type: String
	disease_type: String
	primary_site: String
}`
;

export default Biospecimen;