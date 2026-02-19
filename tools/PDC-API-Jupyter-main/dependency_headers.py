import pandas as pd
import numpy as np


# Project-program

program_project_header = ["program_name", 'project_name']

# Case_matrix
case_matrix_header = ['case_submitter_id', "sample_submitter_id", "aliquot_submitter_id"]

# Case
case_header = ['case_submitter_id', 'external_case_id', 'disease_type', 'pool',
       'primary_site', 'status', 'taxon', 'case_is_ref', 'consent_type',
       'days_to_consent', 'days_to_lost_to_followup', 'index_date',
       'lost_to_followup']

# Demographics


demographics_header = ['case_submitter_id', 'ethnicity', 'gender', 'race', 'age_at_index',
       'age_is_obfuscated', 'cause_of_death', 'cause_of_death_source',
       'country_of_residence_at_enrollment', 'days_to_birth', 'days_to_death',
       'occupation_duration_years', 'premature_at_birth', 'vital_status',
       'weeks_gestation_at_birth', 'year_of_birth', 'year_of_death']

# Diagnoses

diagnose_header = ['case_submitter_id', 'age_at_diagnosis', 'days_to_last_follow_up', 'days_to_last_known_disease_status', 
       'days_to_recurrence', 'diagnosis_is_primary_disease', 'last_known_disease_status', 'morphology', 
       'primary_diagnosis', 'progression_or_recurrence', 'site_of_resection_or_biopsy', 'tissue_or_organ_of_origin', 
       'tumor_grade', 'tumor_stage', 'adrenal_hormone', 'ajcc_clinical_m', 'ajcc_clinical_n', 'ajcc_clinical_stage', 
       'ajcc_clinical_t', 'ajcc_pathologic_m', 'ajcc_pathologic_n', 'ajcc_pathologic_stage', 'ajcc_pathologic_t',
       'ajcc_staging_system_edition', 'anaplasia_present', 'anaplasia_present_type', 'ann_arbor_b_symptoms',
       'ann_arbor_b_symptoms_described', 'ann_arbor_clinical_stage', 'ann_arbor_extranodal_involvement', 
       'ann_arbor_pathologic_stage', 'best_overall_response', 'breslow_thickness', 'burkitt_lymphoma_clinical_variant',
       'child_pugh_classification', 'circumferential_resection_margin', 'classification_of_tumor', 'cog_liver_stage', 
       'cog_neuroblastoma_risk_group', 'cog_renal_stage', 'cog_rhabdomyosarcoma_risk_group', 'colon_polyps_history',
       'days_to_best_overall_response', 'days_to_diagnosis', 'days_to_hiv_diagnosis', 'days_to_new_event', 
       'eln_risk_classification', 'enneking_msts_grade', 'enneking_msts_metastasis', 'enneking_msts_stage', 
       'enneking_msts_tumor_site', 'esophageal_columnar_dysplasia_degree', 'esophageal_columnar_metaplasia_present', 
       'figo_stage', 'figo_staging_edition_year', 'first_symptom_prior_to_diagnosis', 
       'gastric_esophageal_junction_involvement', 'gleason_grade_group', 'gleason_grade_tertiary', 
       'gleason_patterns_percent', 'goblet_cells_columnar_mucosa_present', 'gross_tumor_weight', 
       'hiv_positive', 'hpv_positive_type', 'hpv_status', 'icd_10_code', 'igcccg_stage', 'inpc_grade',
       'inpc_histologic_group', 'inrg_stage', 'inss_stage', 'international_prognostic_index', 'irs_group', 
       'irs_stage', 'ishak_fibrosis_score', 'iss_stage', 'largest_extrapelvic_peritoneal_focus', 'laterality',
       'ldh_level_at_diagnosis', 'ldh_normal_range_upper', 'lymph_nodes_positive', 'lymph_nodes_tested', 
       'lymphatic_invasion_present', 'margin_distance', 'margins_involved_site', 'masaoka_stage',
       'medulloblastoma_molecular_classification', 'metastasis_at_diagnosis', 'metastasis_at_diagnosis_site',
       'method_of_diagnosis', 'mitosis_karyorrhexis_index', 'new_event_anatomic_site', 'new_event_type', 
       'non_nodal_regional_disease', 'non_nodal_tumor_deposits', 'ovarian_specimen_status', 
       'ovarian_surface_involvement', 'overall_survival', 'percent_tumor_invasion', 
       'perineural_invasion_present', 'peripancreatic_lymph_nodes_positive', 
       'peripancreatic_lymph_nodes_tested', 'peritoneal_fluid_cytological_status',
       'pregnant_at_diagnosis', 'primary_gleason_grade', 'prior_malignancy', 
       'prior_treatment', 'progression_free_survival', 'progression_free_survival_event', 
       'residual_disease', 'satellite_nodule_present', 'secondary_gleason_grade', 
       'sites_of_involvement', 'supratentorial_localization', 'synchronous_malignancy', 
       'tumor_cell_content', 'tumor_confined_to_organ_of_origin', 'tumor_depth', 
       'tumor_focality', 'tumor_largest_dimension_diameter', 'tumor_regression_grade', 
       'vascular_invasion_present', 'vascular_invasion_type', 'weiss_assessment_score', 
       'who_cns_grade', 'who_nte_grade', 'wilms_tumor_histologic_subtype', 'year_of_diagnosis']

# Exposure

exposure_header = ['case_submitter_id', 'age_at_onset', 'alcohol_days_per_week',
    'alcohol_drinks_per_day', 'alcohol_history', 'alcohol_intensity',
    'alcohol_type', 'asbestos_exposure', 'cigarettes_per_day', 
    'coal_dust_exposure', 'environmental_tobacco_smoke_exposure', 
    'exposure_duration', 'exposure_duration_years', 'exposure_type', 
    'marijuana_use_per_week', 'pack_years_smoked', 'parent_with_radiation_exposure', 
    'radon_exposure', 'respirable_crystalline_silica_exposure', 'secondhand_smoke_as_child', 
    'smokeless_tobacco_quit_age', 'smoking_frequency', 'time_between_waking_and_first_smoke', 
    'tobacco_smoking_onset_year', 'tobacco_smoking_quit_year', 'tobacco_smoking_status', 
    'tobacco_use_per_day', 'type_of_smoke_exposure', 'type_of_tobacco_used', 'years_smoked']

# Treatment
treatment_header = ['case_submitter_id', 'chemo_concurrent_to_radiation', 
               'days_to_treatment_end', 'days_to_treatment_start', 
               'initial_disease_status', 'number_of_cycles', 'reason_treatment_ended', 
               'regimen_or_line_of_therapy', 'route_of_administration', 
               'therapeutic_agents', 'treatment_anatomic_site', 'treatment_arm', 
               'treatment_dose', 'treatment_dose_units', 'treatment_effect', 
               'treatment_effect_indicator', 'treatment_frequency', 'treatment_intent_type', 
               'treatment_or_therapy', 'treatment_outcome', 'treatment_type']

follow_ups_header = ['case_submitter_id', 'days_to_follow_up', 'adverse_event',
       'adverse_event_grade', 'aids_risk_factors',
       'barretts_esophagus_goblet_cells_present', 'bmi', 'body_surface_area',
       'cause_of_response', 'cd4_count', 'cdc_hiv_risk_factors', 'comorbidity',
       'comorbidity_method_of_diagnosis', 'days_to_adverse_event',
       'days_to_comorbidity', 'days_to_imaging', 'days_to_progression',
       'days_to_progression_free', 'days_to_recurrence',
       'diabetes_treatment_type', 'disease_response',
       'dlco_ref_predictive_percent', 'ecog_performance_status',
       'evidence_of_recurrence_type', 'eye_color',
       'fev1_fvc_post_bronch_percent', 'fev1_fvc_pre_bronch_percent',
       'fev1_ref_post_bronch_percent', 'fev1_ref_pre_bronch_percent',
       'haart_treatment_indicator', 'height',
       'hepatitis_sustained_virological_response', 'history_of_tumor',
       'history_of_tumor_type', 'hiv_viral_load',
       'hormonal_contraceptive_type', 'hormonal_contraceptive_use',
       'hormone_replacement_therapy_type', 'hpv_positive_type',
       'hysterectomy_margins_involved', 'hysterectomy_type', 'imaging_result',
       'imaging_type', 'immunosuppressive_treatment_type',
       'karnofsky_performance_status', 'menopause_status', 'nadir_cd4_count',
       'pancreatitis_onset_year', 'pregnancy_outcome', 'procedures_performed',
       'progression_or_recurrence', 'progression_or_recurrence_anatomic_site',
       'progression_or_recurrence_type', 'recist_targeted_regions_number',
       'recist_targeted_regions_sum', 'reflux_treatment_type', 'risk_factor',
       'risk_factor_treatment', 'scan_tracer_used',
       'undescended_testis_corrected', 'undescended_testis_corrected_age',
       'undescended_testis_corrected_laterality',
       'undescended_testis_corrected_method', 'undescended_testis_history',
       'undescended_testis_history_laterality', 'viral_hepatitis_serologies',
       'weight']

# Sample
sample_header = ['sample_submitter_id', 'composition', 'pool', 'sample_type', 'status',
       'tissue_type', 'gdc_project_id', 'gdc_sample_id',
       'biospecimen_anatomic_site', 'biospecimen_laterality',
       'catalog_reference', 'current_weight', 'days_to_collection',
       'days_to_sample_procurement', 'diagnosis_pathologically_confirmed',
       'distance_normal_to_tumor', 'distributor_reference', 'freezing_method',
       'growth_rate', 'initial_weight', 'intermediate_dimension',
       'longest_dimension', 'method_of_sample_procurement', 'passage_count',
       'pathology_report_uuid', 'preservation_method', 'sample_is_ref',
       'sample_ordinal', 'sample_type_id', 'shortest_dimension',
       'time_between_clamping_and_freezing',
       'time_between_excision_and_freezing', 'tissue_collection_type',
       'tumor_code', 'tumor_code_id', 'tumor_descriptor']

# aliquots
aliquots_header = ['aliquot_submitter_id', 'aliquot_is_ref', 'pool', 'status',
       'aliquot_quantity', 'aliquot_volume', 'amount', 'analyte_type',
       'analyte_type_id', 'concentration']

# Study-info
study_header = ['study_submitter_id', 'analytical_fraction', 'experiment_type',
       'acquisition_type', 'study_description', 'embargo_date']

# Protocol
protocol_header = ['study_submitter_id', 'protocol_name', 'protocol_date', 'document_name',
       'quantitation_strategy', 'experiment_type', 'label_free_quantitation',
       'labeled_quantitation', 'isobaric_labeling_reagent',
       'reporter_ion_ms_level', 'starting_amount', 'starting_amount_uom',
       'digestion_reagent', 'alkylation_reagent', 'enrichment_strategy',
       'enrichment', 'chromatography_dimensions_count',
       '1d_chromatography_type', '2d_chromatography_type',
       'fractions_analyzed_count', 'column_type', 'amount_on_column',
       'amount_on_column_uom', 'column_length', 'column_length_uom',
       'column_inner_diameter', 'column_inner_diameter_uom', 'particle_size',
       'particle_size_uom', 'particle_type', 'gradient_length',
       'gradient_length_uom', 'instrument_make', 'instrument_model',
       'serial_number', 'dissociation_type', 'ms1_resolution',
       'ms2_resolution', 'dda_topn', 'normalized_collision_energy',
       'acquistion_type', 'dia_multiplexing', 'dia_ims']

# Experimental Metadata 
exp_metadata_header = ['study_submitter_id', 'experiment_type', 'experiment_number',
       'plex_or_folder_name', 'fraction', 'date', 'operator',
       'replicate_number', 'condition', 'label_free', 'itraq_113', 'itraq_114',
       'itraq_115', 'itraq_116', 'itraq_117', 'itraq_118', 'itraq_119',
       'itraq_121', 'tmt_126', 'tmt_127n', 'tmt_127c', 'tmt_128n', 'tmt_128c',
       'tmt_129n', 'tmt_129c', 'tmt_130n', 'tmt_130c', 'tmt_131', 'tmt_131c',
       'tmt_132n', 'tmt_132c', 'tmt_133n', 'tmt_133c', 'tmt_134n', 'tmt_134c',
       'tmt_135n']

# File Metadata
file_metadata_header = ['study_submitter_id', 'plex_or_folder_name', 'file_name',
       'fraction_number', 'data_category', 'file_type', 'file_format',
       'md5sum', 'file_size', "signedUrl"]

file_metadata_header_2 = ['file_id', 'file_name', 'run_metadata_id', 'protocol', 'study_name',
       'pdc_study_id', #'pdc_study_version', 'study_id', #'project_name',
       'data_category', 'file_type', 'access', 'file_size',
       'md5sum', "plex_or_folder_name"]