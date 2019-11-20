//@@@PDC-1011 replace gdc_case_id with external_case_id
const Case =`
type Case {
  case_id: String
  case_submitter_id: String
  project_submitter_id: String
  external_case_id: String
  tissue_source_site_code: String
  days_to_lost_to_followup: Int
  disease_type: String
  index_date: String
  lost_to_followup: String
  primary_site: String
  project: Project  
  demographics: [Demographic]  
  samples: [Sample]
  diagnoses: [Diagnosis]
  count: Int
}`
;

//export default [Case, Sample, Project, Demographic, Diagnosis];
export default Case;