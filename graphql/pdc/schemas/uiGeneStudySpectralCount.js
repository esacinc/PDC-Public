//@@@PDC-415 get aliquot label
//@@@PDC-564 add gene abundance data
//@@@PDC-669 gene_abundance table change
//@@@PDC-1874 add pdc_study_id to study-related APIs
const UIGeneStudySpectralCount = `
type UIGeneStudySpectralCount {
	study_submitter_id: String 
	pdc_study_id: String
	submitter_id_name: String 
	experiment_type: String
	aliquot_id: String 
	plex: String
	label: String
	spectral_count: Int
	distinct_peptide: Int
	unshared_peptide: Int
	precursor_area: String
	log2_ratio: String
	unshared_log2_ratio: String
	unshared_precursor_area: String
	aliquots_count: Int
	plexes_count: Int	
}`
;

export default UIGeneStudySpectralCount;