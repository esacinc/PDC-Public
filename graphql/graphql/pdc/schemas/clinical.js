//@@@PDC-898 new public APIs-- clinicalPerStudy
//@@@PDC-1011 replace gdc_case_id with external_case_id
const Clinical = `
type Clinical {
	case_id: String
	case_submitter_id: String
	status: String
	external_case_id: String
	disease_type: String
	primary_site: String
	ethnicity: String
	gender: String
	race: String
	morphology: String
	primary_diagnosis: String
	site_of_resection_or_biopsy: String
	tissue_or_organ_of_origin: String
	tumor_grade: String
	tumor_stage: String
}`
;


export default Clinical;