//@@@PDC-191 experimental metadata API
const StudyRunMetadata = `
type StudyRunMetadata {
	study_run_metadata_id: String
	study_run_metadata_submitter_id: String
	pcc: String
	experiment_number: Int
	experiment_type: String
	folder_name: String
	acquisition_file_name: String
	fraction: String
	analyte: String
	date: Date
	alias: String
	instrument: String
	operator: String
	replicate_number: String
	condition: String
	label_free: String
	itraq_114: String
	itraq_115: String
	itraq_116: String
	itraq_117: String
	tmt10_126: String
	tmt10_127n: String
	tmt10_127c: String
	tmt10_128n: String
	tmt10_128c: String
	tmt10_129n: String
	tmt10_129c: String
	tmt10_129cc: String
	tmt10_130n: String
	tmt10_131: String
	study: Study
	protocol: Protocol
	aliquot_run_metadata: [AliquotRunMetadata]	
	files: [File]
}`
;

//export default [StudyRunMetadata, Study, Protocol, Date];
export default StudyRunMetadata;