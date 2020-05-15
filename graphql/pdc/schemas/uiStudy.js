//@@@PDC-657 add study_description
//@@@PDC-788 remove hard-coded file types
//@@@PDC-857 add embargo date
//@@@PDC-1358 add study_id (uuid) to study summary page
//@@@PDC-1874 add pdc_study_id to study-related APIs
const UIStudy = `
type UIStudy {
	study_id: String
	study_submitter_id: String 
	pdc_study_id: String
	submitter_id_name: String
	study_description: String
	program_name: String
	project_name: String
	disease_type: String
	primary_site: String
	analytical_fraction: String
	experiment_type: String
	embargo_date: Date
	cases_count: Int
	aliquots_count: Int
	filesCount: [File]
}`
;

export default UIStudy;