import _ from "lodash";

//@@@PDC-1874 add pdc_study_id to all study-related APIs
//query to get list of filter values mapping studies for program project study tables
const prog_proj_filter = `
SELECT DISTINCT
    s.study_submitter_id,
    s.pdc_study_id,
    s.submitter_id_name,
    s.acquisition_type,
    s.analytical_fraction,
    s.experiment_type,
    prog.name AS program_name,
    proj.name AS project_name
FROM
    study s,
    project proj,
    program prog
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
`;

//query to get list of filter values mapping studies for aliquot sample case demographic diagnosis study tables
const al_sam_ca_dem_dia_filter = `
SELECT DISTINCT
    s.study_submitter_id,
    s.pdc_study_id,
    s.submitter_id_name,
    s.acquisition_type,
    s.analytical_fraction,
    s.experiment_type,    
    al.status AS biospecimen_status,
    sam.sample_type,
    c.disease_type,
    c.primary_site,
    c.status AS case_status,    
    dem.ethnicity,
    dem.race,
    dem.gender,
    dia.morphology,
    dia.primary_diagnosis,
    dia.site_of_resection_or_biopsy,
    dia.tissue_or_organ_of_origin,
    dia.tumor_grade,
    dia.tumor_stage
FROM
    study s,
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;

//query to get list of filter values mapping studies for file study tables
const file_filter = `
SELECT DISTINCT
    s.study_submitter_id,
    s.pdc_study_id,
    s.submitter_id_name,
    s.acquisition_type,
    s.analytical_fraction,
    s.experiment_type,
    f.data_category,
    f.file_type,
    f.downloadable,
    f.access
FROM
    study s,
    study_file sf,
    file f
WHERE
    s.study_id = sf.study_id
        AND sf.file_id = f.file_id
`;

//query to get list of filter values mapping studies for aliquot sample case demographic diagnosis study project program tables
const prog_proj_al_sam_ca_dem_dia_filter = `
SELECT DISTINCT
    s.study_submitter_id,
    s.pdc_study_id,
    s.submitter_id_name,
    s.acquisition_type,
    s.analytical_fraction,
    s.experiment_type,    
    prog.name AS program_name,
    proj.name AS project_name,    
    al.status AS biospecimen_status,
    sam.sample_type,
    c.disease_type,
    c.primary_site,
    c.status AS case_status,    
    dem.ethnicity,
    dem.race,
    dem.gender,
    dia.morphology,
    dia.primary_diagnosis,
    dia.site_of_resection_or_biopsy,
    dia.tissue_or_organ_of_origin,
    dia.tumor_grade,
    dia.tumor_stage
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
		AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;

//query to get list of study for program project study tables
const prog_proj_study = `
SELECT DISTINCT
    s.study_submitter_id
FROM
    study s,
    project proj,
    program prog
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
`;

//query to get list of study for aliquot sample case demographic diagnosis study tables
const al_sam_ca_dem_dia_study = `
SELECT DISTINCT
    s.study_submitter_id
FROM
    study s,
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;

//query to get list of study for file study tables
const file_study = `
SELECT DISTINCT
    s.study_submitter_id
FROM
    study s,
    study_file sf,
    file f
WHERE
    s.study_id = sf.study_id
        AND sf.file_id = f.file_id
`;

//query to get list of study for aliquot sample case demographic diagnosis study project program tables
const prog_proj_al_sam_ca_dem_dia_study = `
SELECT DISTINCT
    s.study_submitter_id
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
		    AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;

//@@@PDC-1758 count file-study combo
const file_tab_count = `
SELECT 
    COUNT(DISTINCT f.file_id, s.study_id) AS total
FROM
    study s,
    project proj,
    program prog,
    study_file sf,
    file f
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
        AND s.study_id = sf.study_id
        AND sf.file_id = f.file_id
`;

//@@@PDC-1960 add pdc_study_id to getPaginatedUIFile API
//@@@PDC-2815 add embargo_date to getPaginatedUIFile API
const file_tab_data=`
SELECT DISTINCT
    BIN_TO_UUID(f.file_id) AS file_id,
    BIN_TO_UUID(s.study_id) AS study_id,
	s.pdc_study_id,
    s.submitter_id_name,
	s.embargo_date,
    f.file_name,
    sf.study_run_metadata_submitter_id,
    proj.name AS project_name,
    f.data_category,
    f.file_type,
    f.downloadable,
    f.md5sum,
    f.access,
    CAST(f.file_size AS UNSIGNED) AS file_size
FROM
    study s,
    project proj,
    program prog,
    study_file sf,
    file f
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
        AND s.study_id = sf.study_id
        AND sf.file_id = f.file_id
`;

const case_tab_count = `
SELECT 
    COUNT(DISTINCT al.aliquot_id) AS total
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
        AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
`;
//@@@PDC-2396 add attributes to uiCase
//@@@PDC-4569 remove is_ffpe and oct_embedded
//@@@PDC-4687 add tissue_collection_type and sample_ordinal
//@@@PDC-4968 expose case_is_ref
const case_tab_data = `
SELECT DISTINCT
    proj.name AS project_name,
    prog.name AS program_name,
    BIN_TO_UUID(c.case_id) AS case_id,
    c.status AS case_status,
    c.case_submitter_id,
	c.case_is_ref,
    c.disease_type,
    c.primary_site,
    BIN_TO_UUID(al.aliquot_id) AS aliquot_id,
    al.aliquot_submitter_id,
	al.aliquot_is_ref,
    al.status AS aliquot_status,
	al.aliquot_quantity,
	al.aliquot_volume,
	al.amount,
	al.analyte_type,
	al.concentration,
    BIN_TO_UUID(sam.sample_id) AS sample_id,
    sam.sample_submitter_id,
    sam.status AS sample_status,
	sam.sample_is_ref,
	sam.biospecimen_anatomic_site,
	sam.composition,
	sam.current_weight,
	sam.days_to_collection,
	sam.days_to_sample_procurement,
	sam.diagnosis_pathologically_confirmed,
	sam.freezing_method,
	sam.initial_weight, 
	sam.intermediate_dimension,
	sam.longest_dimension,
	sam.method_of_sample_procurement,
	sam.pathology_report_uuid,
	sam.preservation_method,
	sam.sample_type_id,
	sam.shortest_dimension,
	sam.tissue_collection_type, 
	sam.sample_ordinal,
	sam.time_between_clamping_and_freezing,
	sam.time_between_excision_and_freezing,
	sam.tissue_type,
	sam.tumor_code,
	sam.tumor_code_id,
	sam.tumor_descriptor,
    sam.sample_type
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
		    AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
`;

const clinical_tab_count = `
SELECT 
    COUNT(DISTINCT dia.diagnosis_id) AS total
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND proj.project_id = s.project_id
        AND proj.program_id = prog.program_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;
//@@@PDC-2395 add attributes to uiClinical
//@@@PDC-2335 get ext id from reference
//@@@PDC-2606 ext id from reference not required
//@@@PDC-3266 add icd_10_code and synchronous_malignancy
//@@@PDC-3428 add tumor_largest_dimension_diameter
//@@@PDC-4391 add new columns
//@@@PDC-5205 add auxiliary_data and tumor_cell_content
//@@@PDC-5252 fetch diagnosis-sample association
//@@@PDC-5647 return space if null
//@@@PDC-5648 return space if null
const clinical_tab_data = `
SELECT DISTINCT
    prog.name AS program_name,
    proj.name AS project_name,
    BIN_TO_UUID(c.case_id) AS case_id,
    c.case_submitter_id,
    c.status,
    c.disease_type,
    c.primary_site,
	c.consent_type,
	c.days_to_consent,
    dem.ethnicity,
    dem.gender,
    dem.race,
	IFNULL(dem.cause_of_death, ' ') as cause_of_death,
	IFNULL(dem.days_to_birth, ' ') as days_to_birth,
	IFNULL(dem.days_to_death, ' ') as days_to_death,
	IFNULL(dem.vital_status, ' ') as vital_status,
	IFNULL(dem.year_of_birth, ' ') as year_of_birth,
	IFNULL(dem.year_of_death, ' ') as year_of_death,
	IFNULL(dem.age_at_index, ' ') as age_at_index,
	IFNULL(dem.premature_at_birth, ' ') as premature_at_birth,
	IFNULL(dem.weeks_gestation_at_birth, ' ') as weeks_gestation_at_birth, 
	IFNULL(dem.age_is_obfuscated, ' ') as age_is_obfuscated,
	IFNULL(dem.cause_of_death_source, ' ') as cause_of_death_source,
	IFNULL(dem.occupation_duration_years, ' ') as occupation_duration_years,
	IFNULL(dem.country_of_residence_at_enrollment, ' ') as country_of_residence_at_enrollment,
    BIN_TO_UUID(dia.diagnosis_id) AS diagnosis_id,
	IFNULL( dia.morphology, ' ') as  morphology,
	IFNULL( dia.primary_diagnosis, ' ') as  primary_diagnosis,
	IFNULL( dia.site_of_resection_or_biopsy, ' ') as  site_of_resection_or_biopsy,
	IFNULL( dia.tissue_or_organ_of_origin, ' ') as  tissue_or_organ_of_origin,
	IFNULL( dia.tumor_grade, ' ') as  tumor_grade,
	IFNULL( dia.tumor_stage, ' ') as  tumor_stage,
	IFNULL( dia.tumor_largest_dimension_diameter, ' ') as  tumor_largest_dimension_diameter,  
	IFNULL( dia.age_at_diagnosis, ' ') as  age_at_diagnosis,
	IFNULL( dia.classification_of_tumor, ' ') as  classification_of_tumor,
	IFNULL(dia.days_to_last_follow_up, ' ') as days_to_last_follow_up, 
	IFNULL(dia.days_to_last_known_disease_status, ' ') as days_to_last_known_disease_status,
	IFNULL(dia.days_to_recurrence, ' ') as days_to_recurrence,
	IFNULL( dia.last_known_disease_status, ' ') as  last_known_disease_status,
	IFNULL( dia.progression_or_recurrence, ' ') as  progression_or_recurrence,
	IFNULL( dia.prior_malignancy, ' ') as  prior_malignancy,
	IFNULL( dia.ajcc_clinical_m, ' ') as  ajcc_clinical_m,
	IFNULL( dia.ajcc_clinical_n, ' ') as  ajcc_clinical_n,
	IFNULL( dia.ajcc_clinical_stage, ' ') as  ajcc_clinical_stage,
	IFNULL( dia.ajcc_clinical_t, ' ') as  ajcc_clinical_t,
	IFNULL( dia.ajcc_pathologic_m, ' ') as  ajcc_pathologic_m,
	IFNULL( dia.ajcc_pathologic_n, ' ') as  ajcc_pathologic_n,
	IFNULL( dia.ajcc_pathologic_stage, ' ') as  ajcc_pathologic_stage,
	IFNULL( dia.ajcc_pathologic_t, ' ') as  ajcc_pathologic_t,
	IFNULL( dia.ajcc_staging_system_edition, ' ') as  ajcc_staging_system_edition,
	IFNULL( dia.ann_arbor_b_symptoms, ' ') as  ann_arbor_b_symptoms,
	IFNULL( dia.ann_arbor_clinical_stage, ' ') as  ann_arbor_clinical_stage,
	IFNULL( dia.ann_arbor_extranodal_involvement, ' ') as  ann_arbor_extranodal_involvement,
	IFNULL( dia.ann_arbor_pathologic_stage, ' ') as  ann_arbor_pathologic_stage,
	IFNULL( dia.best_overall_response, ' ') as  best_overall_response,
	IFNULL( dia.burkitt_lymphoma_clinical_variant, ' ') as  burkitt_lymphoma_clinical_variant,
	IFNULL( dia.circumferential_resection_margin, ' ') as  circumferential_resection_margin,
	IFNULL( dia.colon_polyps_history, ' ') as  colon_polyps_history,
	IFNULL( dia.days_to_best_overall_response, ' ') as  days_to_best_overall_response,
	IFNULL( dia.days_to_diagnosis, ' ') as  days_to_diagnosis,
	IFNULL( dia.days_to_hiv_diagnosis, ' ') as  days_to_hiv_diagnosis,
	IFNULL( dia.days_to_new_event, ' ') as  days_to_new_event,
	IFNULL( dia.figo_stage, ' ') as  figo_stage,
	IFNULL( dia.hiv_positive, ' ') as  hiv_positive,
	IFNULL( dia.hpv_positive_type, ' ') as  hpv_positive_type,
	IFNULL( dia.hpv_status, ' ') as  hpv_status,
	IFNULL( dia.iss_stage, ' ') as  iss_stage,
	IFNULL( dia.laterality, ' ') as  laterality,
	IFNULL( dia.ldh_level_at_diagnosis, ' ') as  ldh_level_at_diagnosis,
	IFNULL( dia.ldh_normal_range_upper, ' ') as  ldh_normal_range_upper,
	IFNULL( dia.lymph_nodes_positive, ' ') as  lymph_nodes_positive,
	IFNULL( dia.lymphatic_invasion_present, ' ') as  lymphatic_invasion_present,
	IFNULL( dia.method_of_diagnosis, ' ') as  method_of_diagnosis,
	IFNULL( dia.new_event_anatomic_site, ' ') as  new_event_anatomic_site,
	IFNULL( dia.new_event_type, ' ') as  new_event_type,
	IFNULL( dia.overall_survival, ' ') as  overall_survival,
	IFNULL( dia.perineural_invasion_present, ' ') as  perineural_invasion_present,
	IFNULL( dia.prior_treatment, ' ') as  prior_treatment,
	IFNULL( dia.progression_free_survival, ' ') as  progression_free_survival,
	IFNULL( dia.progression_free_survival_event, ' ') as  progression_free_survival_event,
	IFNULL( dia.residual_disease, ' ') as  residual_disease,
	IFNULL( dia.vascular_invasion_present, ' ') as  vascular_invasion_present,
	IFNULL( dia.year_of_diagnosis, ' ') as  year_of_diagnosis,
	IFNULL( dia.icd_10_code,  ' ') as icd_10_code,
	IFNULL( dia.synchronous_malignancy, ' ') as  synchronous_malignancy,
	IFNULL( dia.anaplasia_present, ' ') as  anaplasia_present,
	IFNULL( dia.anaplasia_present_type, ' ') as  anaplasia_present_type,
	IFNULL( dia.child_pugh_classification, ' ') as  child_pugh_classification,
	IFNULL( dia.cog_liver_stage, ' ') as  cog_liver_stage,
	IFNULL( dia.cog_neuroblastoma_risk_group, ' ') as  cog_neuroblastoma_risk_group,
	IFNULL( dia.cog_renal_stage, ' ') as  cog_renal_stage,
	IFNULL( dia.cog_rhabdomyosarcoma_risk_group, ' ') as  cog_rhabdomyosarcoma_risk_group,
	IFNULL( dia.enneking_msts_grade, ' ') as  enneking_msts_grade,
	IFNULL( dia.enneking_msts_metastasis, ' ') as  enneking_msts_metastasis,
	IFNULL( dia.enneking_msts_stage, ' ') as  enneking_msts_stage,
	IFNULL( dia.enneking_msts_tumor_site, ' ') as  enneking_msts_tumor_site,
	IFNULL( dia.esophageal_columnar_dysplasia_degree, ' ') as  esophageal_columnar_dysplasia_degree,
	IFNULL( dia.esophageal_columnar_metaplasia_present, ' ') as  esophageal_columnar_metaplasia_present,
	IFNULL( dia.first_symptom_prior_to_diagnosis, ' ') as  first_symptom_prior_to_diagnosis,
	IFNULL( dia.gastric_esophageal_junction_involvement, ' ') as  gastric_esophageal_junction_involvement,
	IFNULL( dia.goblet_cells_columnar_mucosa_present, ' ') as  goblet_cells_columnar_mucosa_present,
	IFNULL( dia.gross_tumor_weight, ' ') as  gross_tumor_weight,
	IFNULL( dia.inpc_grade, ' ') as  inpc_grade,
	IFNULL( dia.inpc_histologic_group, ' ') as  inpc_histologic_group,
	IFNULL( dia.inrg_stage, ' ') as  inrg_stage,
	IFNULL( dia.inss_stage, ' ') as  inss_stage,
	IFNULL( dia.irs_group, ' ') as  irs_group,
	IFNULL( dia.irs_stage, ' ') as  irs_stage,
	IFNULL( dia.ishak_fibrosis_score, ' ') as  ishak_fibrosis_score,
	IFNULL( dia.lymph_nodes_tested, ' ') as  lymph_nodes_tested,
	IFNULL( dia.medulloblastoma_molecular_classification, ' ') as  medulloblastoma_molecular_classification,
	IFNULL( dia.metastasis_at_diagnosis, ' ') as  metastasis_at_diagnosis,
	IFNULL( dia.metastasis_at_diagnosis_site, ' ') as  metastasis_at_diagnosis_site,
	IFNULL( dia.mitosis_karyorrhexis_index, ' ') as  mitosis_karyorrhexis_index,
	IFNULL( dia.peripancreatic_lymph_nodes_positive, ' ') as  peripancreatic_lymph_nodes_positive,
	IFNULL( dia.peripancreatic_lymph_nodes_tested, ' ') as  peripancreatic_lymph_nodes_tested,
	IFNULL( dia.supratentorial_localization, ' ') as  supratentorial_localization,
	IFNULL( dia.tumor_confined_to_organ_of_origin, ' ') as  tumor_confined_to_organ_of_origin,
	IFNULL( dia.tumor_focality, ' ') as  tumor_focality,
	IFNULL( dia.tumor_regression_grade, ' ') as  tumor_regression_grade,
	IFNULL( dia.vascular_invasion_type, ' ') as  vascular_invasion_type,
	IFNULL( dia.wilms_tumor_histologic_subtype, ' ') as  wilms_tumor_histologic_subtype,
	IFNULL( dia.breslow_thickness, ' ') as  breslow_thickness,
	IFNULL( dia.gleason_grade_group, ' ') as  gleason_grade_group,
	IFNULL( dia.igcccg_stage, ' ') as  igcccg_stage,
	IFNULL( dia.international_prognostic_index, ' ') as  international_prognostic_index,
	IFNULL( dia.largest_extrapelvic_peritoneal_focus, ' ') as  largest_extrapelvic_peritoneal_focus,
	IFNULL( dia.masaoka_stage, ' ') as  masaoka_stage,
	IFNULL( dia.non_nodal_regional_disease, ' ') as  non_nodal_regional_disease,
	IFNULL( dia.non_nodal_tumor_deposits, ' ') as  non_nodal_tumor_deposits,
	IFNULL( dia.ovarian_specimen_status, ' ') as  ovarian_specimen_status,
	IFNULL( dia.ovarian_surface_involvement, ' ') as  ovarian_surface_involvement,
	IFNULL( dia.percent_tumor_invasion, ' ') as  percent_tumor_invasion,
	IFNULL( dia.peritoneal_fluid_cytological_status, ' ') as  peritoneal_fluid_cytological_status,
	IFNULL( dia.primary_gleason_grade, ' ') as  primary_gleason_grade,
	IFNULL( dia.secondary_gleason_grade, ' ') as  secondary_gleason_grade,
	IFNULL( dia.weiss_assessment_score, ' ') as  weiss_assessment_score,
	IFNULL( dia.adrenal_hormone, ' ') as  adrenal_hormone,
	IFNULL( dia.ann_arbor_b_symptoms_described, ' ') as  ann_arbor_b_symptoms_described,
	IFNULL( dia.diagnosis_is_primary_disease, ' ') as  diagnosis_is_primary_disease,
	IFNULL( dia.eln_risk_classification, ' ') as  eln_risk_classification,
	IFNULL( dia.figo_staging_edition_year, ' ') as  figo_staging_edition_year,
	IFNULL( dia.gleason_grade_tertiary, ' ') as  gleason_grade_tertiary,
	IFNULL( dia.gleason_patterns_percent, ' ') as  gleason_patterns_percent,
	IFNULL( dia.margin_distance, ' ') as  margin_distance,
	IFNULL( dia.margins_involved_site, ' ') as  margins_involved_site,
	IFNULL( dia.pregnant_at_diagnosis, ' ') as  pregnant_at_diagnosis,
	IFNULL( dia.satellite_nodule_present, ' ') as  satellite_nodule_present,
	IFNULL( dia.sites_of_involvement, ' ') as  sites_of_involvement,
	IFNULL( dia.tumor_depth, ' ') as  tumor_depth,
	IFNULL( dia.tumor_cell_content, ' ') as  tumor_cell_content,
	IFNULL( dia.auxiliary_data, ' ') as  auxiliary_data,
	IFNULL( dia.who_cns_grade, ' ') as  who_cns_grade,
	IFNULL( dia.who_nte_grade, ' ') as  who_nte_grade,
	IFNULL(dia.diagnosis_uuid, ' ') as diagnosis_uuid
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    sample sam,
    demographic dem,
    diagnosis dia,
    \`case\` c
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
		    AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;

const study_tab_count=`
SELECT 
    COUNT(DISTINCT s.study_id) AS total
FROM
    study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia
WHERE
    alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
        AND proj.project_id = s.project_id
        AND proj.program_id = prog.program_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
`;
//@@@PDC-1358 add study_id (uuid) to study summary page
const study_tab_data=`
SELECT 
	BIN_TO_UUID(s.study_id) AS study_id,
    s.study_submitter_id,
    s.pdc_study_id,
    s.submitter_id_name,
    s.study_description,
    prog.name AS program_name,
    proj.name AS project_name,
    GROUP_CONCAT(DISTINCT c.disease_type
        SEPARATOR ';') AS disease_type,
    GROUP_CONCAT(DISTINCT c.primary_site
        SEPARATOR ';') AS primary_site,
    s.analytical_fraction,
    s.experiment_type,
    s.embargo_date,
 	  count(DISTINCT c.case_id) as cases_count,
    count(DISTINCT al.aliquot_id) as aliquots_count   
FROM    
	study s,
    project proj,
    program prog,	
    aliquot al,
    aliquot_run_metadata alm,
    \`case\` c,
    sample sam,
    demographic dem,
    diagnosis dia   
WHERE
    proj.program_id = prog.program_id
        AND proj.project_id = s.project_id
        AND c.case_id = dem.case_id
        AND c.case_id = dia.case_id
        AND alm.study_id = s.study_id
        AND al.aliquot_id = alm.aliquot_id
        AND al.sample_id = sam.sample_id
        AND sam.case_id = c.case_id
`;

//list of filter columns in study table
//@@@PDC-2936 add study_version
//@@@PDC-2969 get latest version by default
const study_filter_columns = {
  study_name: "s.submitter_id_name",
  analytical_fraction: "s.analytical_fraction",
  experiment_type: "s.experiment_type",
  study_submitter_id: "s.study_submitter_id",
  study_id: "s.study_id",
  pdc_study_id: "s.pdc_study_id",
  study_version: "s.study_version",
  acquisition_type: "s.acquisition_type",
  is_latest_version: "s.is_latest_version"
};

//list of filter columns in program project tables
const prog_proj_filter_columns = {
  program_name: "prog.name",
  project_name: "proj.name",
  program_submitter_id: "prog.program_submitter_id",
  project_submitter_id: "proj.project_submitter_id"
};

//list of filter columns in file tables
const file_filter_column = {
  file_type: "f.file_type",
  downloadable: "f.downloadable",
  data_category: "f.data_category",
  access: "f.access"
};

//list of filter columns in aliquot sample case demographic diagnosis tables
const al_sam_ca_dem_dia_filter_column = {
  biospecimen_status: "al.status",
  sample_type: "sam.sample_type",
  disease_type: "c.disease_type",
  primary_site: "c.primary_site",
  case_status: "c.status",
  case_submitter_id: "c.case_submitter_id",
  ethnicity: "dem.ethnicity",
  race: "dem.race",
  gender: "dem.gender",
  tumor_grade: "dia.tumor_grade",
  morphology: "dia.morphology",
  primary_diagnosis: "dia.primary_diagnosis",
  site_of_resection_or_biopsy: "dia.site_of_resection_or_biopsy",
  tissue_or_organ_of_origin: "dia.tissue_or_organ_of_origin",
  tumor_stage: "dia.tumor_stage"
};

//generate query for study filter
function applyStudyFilter(args, cache = { name: "" }) {
  let studyFilterQuery = " ";
  for (const property in study_filter_columns) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = study_filter_columns[property];
      let filterValue = args[property].split(";").join("','");
      studyFilterQuery += ` and ${columnName} IN ('${filterValue}') `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  //@@@PDC-2969 get latest version by default
  /*if ((typeof args['study_version'] == "undefined" || args['study_version'].length <= 0)&&
  (typeof args['study_name'] == "undefined"|| args['study_name'].length <= 0) &&
  (typeof args['study_submitter_id'] == "undefined"|| args['study_submitter_id'].length <= 0) &&
  (typeof args['study_id'] == "undefined"|| args['study_id'].length <= 0) &&
  (typeof args['pdc_study_id'] == "undefined"|| args['pdc_study_id'].length <= 0)) {*/
  if (typeof args['study_version'] == "undefined" || args['study_version'].length <= 0) {
      studyFilterQuery += ` and s.is_latest_version = 1 `;
      cache.name += `s.is_latest_version:1;`;
  }

  return studyFilterQuery;
}

function applyProgProjFilter(args, cache = { name: "" }) {
  let progProjFilterQuery = " ";
  for (const property in prog_proj_filter_columns) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = prog_proj_filter_columns[property];
      let filterValue = args[property].split(";").join("','");
      progProjFilterQuery += ` and ${columnName} IN ('${filterValue}') `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return progProjFilterQuery;
}

function applyFileFilter(args, cache = { name: "" }) {
  let fileFilterQuery = " ";
  for (const property in file_filter_column) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = file_filter_column[property];
      let filterValue = args[property].split(";").join("','");
      fileFilterQuery += ` and ${columnName} IN ('${filterValue}') `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return fileFilterQuery;
}

function applyAlSamCaDemDiaFilter(args, cache = { name: "" }) {
  let alSamCaDemDiaFilterQuery = " ";
  for (const property in al_sam_ca_dem_dia_filter_column) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = al_sam_ca_dem_dia_filter_column[property];
      let filterValue = args[property].split(";").join("','");
      alSamCaDemDiaFilterQuery += ` and ${columnName} IN ('${filterValue}') `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return alSamCaDemDiaFilterQuery;
}

function addStudyInQuery(studyResult){
  let studyArray = [];
  let studyQueryCondition = '';
  studyResult.forEach(element => studyArray.push(element.dataValues.study_submitter_id));
  let columnName = study_filter_columns.study_submitter_id;
  let filterValue = studyArray.join("','");
  studyQueryCondition = ` and ${columnName} IN ('${filterValue}') `;
  return studyQueryCondition;
}

function studyIntersection(filter1, filter2) {
  let studyArray1 = [];
  let studyArray2 = [];
  //let studyArray3 = [];

  filter1.forEach(element => studyArray1.push(element.dataValues.study_submitter_id));

  filter2.forEach(element => studyArray2.push(element.dataValues.study_submitter_id));

  //filter3.forEach(element => studyArray3.push(element.dataValues.study_submitter_id));

  return _.intersection(studyArray1, studyArray2);
}

function studyIdIntersection(filter1, filter2) {
  let studyArray1 = [];
  let studyArray2 = [];
  //let studyArray3 = [];

  filter1.forEach(element => studyArray1.push(element.dataValues.study_id));

  filter2.forEach(element => studyArray2.push(element.dataValues.study_id));

  //filter3.forEach(element => studyArray3.push(element.dataValues.study_submitter_id));

  return _.intersection(studyArray1, studyArray2);
}

const progProjFilterCategory = [
  "submitter_id_name",
  "acquisition_type",
  "analytical_fraction",
  "experiment_type",
  "program_name",
  "project_name"
];

const fileFilterCategory = ["data_category", "file_type", "downloadable", "access"];

const alSamCaDemDiaFilterCategory = [
  "biospecimen_status",
  "sample_type",
  "disease_type",
  "primary_site",
  "case_status",
  "ethnicity",
  "race",
  "gender",
  "tumor_grade"
];

function uiFilterSubqueryProcess(filterName, uiFilters, intersectedStudy) {
  let progProjFilterData = {
    submitter_id_name: new Map(),
    acquisition_type: new Map(),
    analytical_fraction: new Map(),
    experiment_type: new Map(),
    program_name: new Map(),
    project_name: new Map()
  };

  let fileFilterData = {
    data_category: new Map(),
    file_type: new Map(),
    downloadable: new Map(),
    access: new Map()
  };

  let alSamCaDemDiaFilterData = {
    biospecimen_status: new Map(),
    sample_type: new Map(),
    disease_type: new Map(),
    primary_site: new Map(),
    case_status: new Map(),
    ethnicity: new Map(),
    race: new Map(),
    gender: new Map(),
    tumor_grade: new Map()
  };

  let progProjAlSamCaDemDiaFilterData = {
    submitter_id_name: new Map(),
    acquisition_type: new Map(),
    analytical_fraction: new Map(),
    experiment_type: new Map(),
    program_name: new Map(),
    project_name: new Map(),
    biospecimen_status: new Map(),
    sample_type: new Map(),
    disease_type: new Map(),
    primary_site: new Map(),
    case_status: new Map(),
    ethnicity: new Map(),
    race: new Map(),
    gender: new Map(),
    tumor_grade: new Map()
  }

  let filterDataList = {
    progProj: progProjFilterData,
    file: fileFilterData,
    alSamCaDemDia: alSamCaDemDiaFilterData,
    progProjAlSamCaDemDia: progProjAlSamCaDemDiaFilterData
  };

  let filterCategoryList = {
    progProj: progProjFilterCategory,
    file: fileFilterCategory,
    alSamCaDemDia: alSamCaDemDiaFilterCategory,
    progProjAlSamCaDemDia: [...progProjFilterCategory, ...alSamCaDemDiaFilterCategory]
  };

  let currentFilterData = filterDataList[filterName];
  let currentFilterCategory = filterCategoryList[filterName];
  if (currentFilterData == null || currentFilterCategory == null) {
    return {};
  } else {
    return processFilterData(
      currentFilterCategory,
      currentFilterData,
      uiFilters,
      intersectedStudy
    );
  }
}

function processFilterData(filterCategory, filterData, uiFilters, intersectedStudy) {
  for (let i = 0; i < uiFilters.length; i++) {
    let filter = uiFilters[i].dataValues;
    let studyId = filter.study_submitter_id;
    filterCategory.forEach(filterName => {
      let filterValue = filter[filterName];
      if (filterValue != null) {
        if (filterData[filterName].get(filterValue) == null) {
          let valueSet = new Set();
          valueSet.add(studyId);
          filterData[filterName].set(filterValue, valueSet);
        } else {
          filterData[filterName].get(filterValue).add(studyId);
        }
      }
    });
  }

  let finalFilterData = {};
  filterCategory.forEach(filterName => {
    let mapValue = filterData[filterName];
    finalFilterData[filterName] = [];
    mapValue.forEach((value, key) => {
      let valueArray = [...value];
      let finialValueArray = _.intersection(valueArray, intersectedStudy);
      let obj = {
        filterName: key,
        filterStudyCount: finialValueArray.length,
        filterValue: finialValueArray
      };
      finalFilterData[filterName].push(obj);
    });
  });
  return finalFilterData;
}
//@@@PDC-3171 new ptm abundance tables
const abundance_suffix = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z"
];

const queryList = {
  abundance_suffix: abundance_suffix,
  prog_proj_study: prog_proj_study,
  prog_proj_filter: prog_proj_filter,
  file_study: file_study,
  file_filter: file_filter,
  al_sam_ca_dem_dia_study: al_sam_ca_dem_dia_study,
  al_sam_ca_dem_dia_filter: al_sam_ca_dem_dia_filter,
  prog_proj_al_sam_ca_dem_dia_study: prog_proj_al_sam_ca_dem_dia_study,
  prog_proj_al_sam_ca_dem_dia_filter: prog_proj_al_sam_ca_dem_dia_filter,
  file_tab_count:file_tab_count,
  file_tab_data:file_tab_data,
  case_tab_count:case_tab_count,
  case_tab_data:case_tab_data,
  clinical_tab_count:clinical_tab_count,
  clinical_tab_data:clinical_tab_data,
  study_tab_count:study_tab_count,
  study_tab_data:study_tab_data
};

export {
  queryList,
  study_filter_columns,
  prog_proj_filter_columns,
  file_filter_column,
  al_sam_ca_dem_dia_filter_column,

  applyStudyFilter,
  applyProgProjFilter,
  applyFileFilter,
  applyAlSamCaDemDiaFilter,
  addStudyInQuery,
  studyIntersection,
  studyIdIntersection,
  uiFilterSubqueryProcess
};
