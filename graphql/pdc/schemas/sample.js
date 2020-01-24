//@@@PDC-1093 change data type of is_ffpe from int to string
//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id
const Sample = `
type Sample {
	sample_id: String
	gdc_sample_id: String
	gdc_project_id: String
	sample_submitter_id: String
	sample_type: String
	sample_type_id: String
	sample_is_ref: String
	status: String
	biospecimen_anatomic_site: String
	composition: String
	current_weight: Float
	days_to_collection: Int
	days_to_sample_procurement: Int
	diagnosis_pathologically_confirmed: String
	freezing_method: String
	initial_weight: Float 
	intermediate_dimension: String
	is_ffpe: String
	longest_dimension: String
	method_of_sample_procurement: String
	oct_embedded: String
	pathology_report_uuid: String
	preservation_method: String
	sample_type_id: String
	shortest_dimension: String
	time_between_clamping_and_freezing: String
	time_between_excision_and_freezing: String
	tissue_type: String
	tumor_code: String
	tumor_code_id: String
	tumor_descriptor: String
	aliquots: [Aliquot]
	case: Case
	project: Project
}`
;

export default Sample;