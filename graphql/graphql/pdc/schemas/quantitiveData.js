//@@@PDC-503 quantitiveDataCPTAC2 API
//@@@PDC-669 gene_abundance table change
const QuantitiveData =`
type QuantitiveData {
		gene_abundance_id: String
		gene_id: String
		gene_name: String
		study_id: String
		study_submitter_id: String
		study_run_metadata_id: String
		study_run_metadata_submitter_id: String
		analytical_fraction: String
		experiment_type: String
		aliquot_id: String
		aliquot_submitter_id: String
		aliquot_run_metadata_id: String
		project_id: String
		project_submitter_id: String
		aliquot_alias: String
		log2_ratio: String
		unshared_log2_ratio: String
		unshared_precursor_area: String
		precursor_area: String
		cud_label: String
}`
;

export default QuantitiveData;