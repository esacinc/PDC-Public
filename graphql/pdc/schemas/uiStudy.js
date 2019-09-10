//@@@PDC-657 add study_description
//@@@PDC-788 remove hard-coded file types
//@@@PDC-857 add embargo date
const UIStudy = `
type UIStudy {
	study_submitter_id: String 
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