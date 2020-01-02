//@@@PDC-462 add submitter id
//@@@PDC-759 add case summary fields
//@@@PDC-893 add case status
//@@@PDC-1011 replace gdc_case_id with external_case_id
//@@@PDC-1234 add imaging_resource
//@@@PDC-1237 add age_at_diagnosis et al
const UIClinical = `
type UIClinical {
	case_id: String
	case_submitter_id: String
	status: String
	external_case_id: String
	imaging_resource: String
	disease_type: String
	primary_site: String
	program_name: String
	project_name: String
	ethnicity: String
	gender: String
	race: String
	morphology: String
	primary_diagnosis: String
	site_of_resection_or_biopsy: String
	tissue_or_organ_of_origin: String
	tumor_grade: String
	tumor_stage: String
	age_at_diagnosis:  String
	classification_of_tumor:  String
	days_to_recurrence:  String
}`
;


export default UIClinical;