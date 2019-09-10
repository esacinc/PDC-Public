const Gene = `
type Gene {
  gene_id: String
  gene_name: String
  NCBI_gene_id: Int
  authority: String
  description: String
  organism: String
  chromosome: String
  locus: String
  proteins: String
  assays: String
  spectral_counts: [Spectral_count]
}`
;

export default Gene;