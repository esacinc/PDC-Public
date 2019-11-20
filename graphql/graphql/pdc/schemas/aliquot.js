//@@@PDC-898 new public APIs--fileMetadata
const Aliquot =`
type Aliquot {
	aliquot_id: String
	aliquot_submitter_id: String
	label: String
	sample_id: String
	sample_submitter_id: String
	case_id: String
	case_submitter_id: String
	aliquot_quantity: Float
	aliquot_volume: Float
	amount: Float
	analyte_type: String
	concentration: Float
	aliquot_run_metadata: AliquotRunMetadata
	sample: Sample
	project: Project
}`
;

//export default [Aliquot, Sample, Project, AliquotRunMetadata];
export default Aliquot;