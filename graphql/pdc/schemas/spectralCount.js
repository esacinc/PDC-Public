//@@@PDC-485 spectral count per study/aliquot API
//@@@PDC-1874 add pdc_study_id to study-related APIs
const SpectralCount = `
type Spectral_count {
  gene_name: String
  study_submitter_id: String
  pdc_study_id: String
  project_submitter_id: String
  aliquot_id: String
  plex: String
  spectral_count: Int
  distinct_peptide: Int
  unshared_peptide: Int
  gene: Gene
}`
;

export default SpectralCount;