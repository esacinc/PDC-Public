const Demographic =`
type Demographic {
	demographic_id: String
	demographic_submitter_id: String
	ethnicity: String
	gender: String
	race: String
	cause_of_death: String
	days_to_birth: Int
	days_to_death: Int
	vital_status: String
	year_of_birth: Int
	year_of_death: Int 
	case: Case
	project: Project
}`
;

export default Demographic;