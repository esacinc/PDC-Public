//@@@PDC-485 spectral count per study/aliquot API
const SpectralCount = `
type Spectral_count {
  gene_name: String
  study_submitter_id: String
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