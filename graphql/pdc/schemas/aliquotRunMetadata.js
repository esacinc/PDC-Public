//@@@PDC-191 experimental metadata API
//@@@PDC-1120 AliquotRunMetadata table change
const AliquotRunMetadata =`
type AliquotRunMetadata {
	aliquot_run_metadata_id: String
	aliquot_run_metadata_submitter_id: String
	aliquot_submitter_id: String
	label: String
	experiment_number: Int
	fraction: String
	replicate_number: String
	date: Date
	alias: String
	analyte: String
	aliquot: Aliquot
	protocol: Protocol
	study: Study
}`
;
//export default [AliquotRunMetadata, Study, Protocol, Aliquot, Date];
export default AliquotRunMetadata;