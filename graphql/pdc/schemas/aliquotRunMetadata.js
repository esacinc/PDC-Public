//@@@PDC-191 experimental metadata API
const AliquotRunMetadata =`
type AliquotRunMetadata {
	aliquot_run_metadata_id: String
	aliquot_run_metadata_submitter_id: String
	aliquot_submitter_id: String
	label: String
	pcc: String
	experiment_number: Int
	acquisition_file_name: String
	lab: String
	fraction: String
	instrument: String
	operator: String
	replicate_number: String
	date: Date
	condition: String
	alias: String
	analyte: String
	aliquot: Aliquot
	protocol: Protocol
	study: Study
}`
;
//export default [AliquotRunMetadata, Study, Protocol, Aliquot, Date];
export default AliquotRunMetadata;