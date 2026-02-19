# this script serves to help the main python file to retrieve data from different queries

# import libraries
import pandas as pd
import seaborn as sns

# queries
## Query_clinical_metadata

query_clinical_metadata = """ 
query getclinicalMetadata($pdc_study_identifier: String!) {
clinicalMetadata(pdc_study_id: $pdc_study_identifier) {
aliquot_id
aliquot_submitter_id
morphology
primary_diagnosis
tumor_grade
tumor_stage
tumor_largest_dimension_diameter
}
}
""" 
## Query_project_program

query_study_info = """
query getStudyInfo($pdc_study_identifier: String!) {
  study (pdc_study_id: $pdc_study_identifier) {
    study_id
    pdc_study_id
    study_submitter_id
    program_id
    project_id
    study_name
    study_description
    program_name
    project_name
    disease_type
    primary_site
    analytical_fraction
    experiment_type
    cases_count
    aliquots_count
    filesCount {
      data_category
      file_type
      files_count
    }
  }
}
"""
# query Biospecimen
query_biospecimen = """
query biospecimenPerStudy($pdc_study_identifier: String!) {
  biospecimenPerStudy(pdc_study_id: $pdc_study_identifier) {
    aliquot_id
    sample_id
    case_id
    aliquot_submitter_id
    sample_submitter_id
    case_submitter_id
    aliquot_status
    case_status
    sample_status
    project_name
    sample_type
    disease_type
    primary_site
    pool
    taxon
    externalReferences {
      external_reference_id
      reference_resource_shortname
      reference_resource_name
      reference_entity_location
    }
  }
}
"""
# Case

query_case = """
query case($pdc_study_identifier: String!) {
  case (pdc_study_id: $pdc_study_identifier) {
    case_id
    case_submitter_id
    project_submitter_id
    days_to_lost_to_followup
    disease_type
    index_date
    lost_to_followup
    primary_site
    consent_type
    days_to_consent
    externalReferences {
      external_reference_id
      reference_resource_shortname
      reference_resource_name
      reference_entity_location
    }
    demographics {
      demographic_id
      ethnicity
      gender
      demographic_submitter_id
      race
      cause_of_death
      days_to_birth
      days_to_death
      vital_status
      year_of_birth
      year_of_death
      age_at_index
      premature_at_birth
      weeks_gestation_at_birth
      age_is_obfuscated
      cause_of_death_source
      occupation_duration_years
      country_of_residence_at_enrollment
    }
    samples {
      sample_id
      sample_submitter_id
      sample_type
      sample_type_id
      gdc_sample_id
      gdc_project_id
      biospecimen_anatomic_site
      composition
      current_weight
      days_to_collection
      days_to_sample_procurement
      diagnosis_pathologically_confirmed
      freezing_method
      initial_weight
      intermediate_dimension
      longest_dimension
      method_of_sample_procurement
      pathology_report_uuid
      preservation_method
      sample_type_id
      shortest_dimension
      time_between_clamping_and_freezing
      time_between_excision_and_freezing
      tissue_type
      tumor_code
      tumor_code_id
      tumor_descriptor
      biospecimen_laterality
      catalog_reference
      distance_normal_to_tumor
      distributor_reference
      growth_rate
      passage_count
      sample_ordinal
      tissue_collection_type
      diagnoses {
        diagnosis_id
        diagnosis_submitter_id
        annotation
      }
      aliquots {
        aliquot_id
        aliquot_submitter_id
        analyte_type
        aliquot_run_metadata {
          aliquot_run_metadata_id
          label
          experiment_number
          fraction
          replicate_number
          date
          alias
          analyte
        }
      }
    }
    diagnoses {
      diagnosis_id
      tissue_or_organ_of_origin
      age_at_diagnosis
      primary_diagnosis
      tumor_grade
      tumor_stage
      diagnosis_submitter_id
      classification_of_tumor
      days_to_last_follow_up
      days_to_last_known_disease_status
      days_to_recurrence
      last_known_disease_status
      morphology
      progression_or_recurrence
      site_of_resection_or_biopsy
      prior_malignancy
      ajcc_clinical_m
      ajcc_clinical_n
      ajcc_clinical_stage
      ajcc_clinical_t
      ajcc_pathologic_m
      ajcc_pathologic_n
      ajcc_pathologic_stage
      ajcc_pathologic_t
      ann_arbor_b_symptoms
      ann_arbor_clinical_stage
      ann_arbor_extranodal_involvement
      ann_arbor_pathologic_stage
      best_overall_response
      burkitt_lymphoma_clinical_variant
      circumferential_resection_margin
      colon_polyps_history
      days_to_best_overall_response
      days_to_diagnosis
      days_to_hiv_diagnosis
      days_to_new_event
      figo_stage
      hiv_positive
      hpv_positive_type
      hpv_status
      iss_stage
      laterality
      ldh_level_at_diagnosis
      ldh_normal_range_upper
      lymph_nodes_positive
      lymphatic_invasion_present
      method_of_diagnosis
      new_event_anatomic_site
      new_event_type
      overall_survival
      perineural_invasion_present
      prior_treatment
      progression_free_survival
      progression_free_survival_event
      residual_disease
      vascular_invasion_present
      year_of_diagnosis
      icd_10_code
      synchronous_malignancy
      tumor_largest_dimension_diameter
      anaplasia_present
      anaplasia_present_type
      child_pugh_classification
      cog_liver_stage
      cog_neuroblastoma_risk_group
      cog_renal_stage
      cog_rhabdomyosarcoma_risk_group
      enneking_msts_grade
      enneking_msts_metastasis
      enneking_msts_stage
      enneking_msts_tumor_site
      esophageal_columnar_dysplasia_degree
      esophageal_columnar_metaplasia_present
      first_symptom_prior_to_diagnosis
      gastric_esophageal_junction_involvement
      goblet_cells_columnar_mucosa_present
      gross_tumor_weight
      inpc_grade
      inpc_histologic_group
      inrg_stage
      inss_stage
      irs_group
      irs_stage
      ishak_fibrosis_score
      lymph_nodes_tested
      medulloblastoma_molecular_classification
      metastasis_at_diagnosis
      metastasis_at_diagnosis_site
      mitosis_karyorrhexis_index
      peripancreatic_lymph_nodes_positive
      peripancreatic_lymph_nodes_tested
      supratentorial_localization
      tumor_confined_to_organ_of_origin
      tumor_focality
      tumor_regression_grade
      vascular_invasion_type
      wilms_tumor_histologic_subtype
      breslow_thickness
      gleason_grade_group
      igcccg_stage
      international_prognostic_index
      largest_extrapelvic_peritoneal_focus
      masaoka_stage
      non_nodal_regional_disease
      non_nodal_tumor_deposits
      ovarian_specimen_status
      ovarian_surface_involvement
      percent_tumor_invasion
      peritoneal_fluid_cytological_status
      primary_gleason_grade
      secondary_gleason_grade
      weiss_assessment_score
      adrenal_hormone
      ann_arbor_b_symptoms_described
      diagnosis_is_primary_disease
      eln_risk_classification
      figo_staging_edition_year
      gleason_grade_tertiary
      gleason_patterns_percent
      margin_distance
      margins_involved_site
      pregnant_at_diagnosis
      satellite_nodule_present
      sites_of_involvement
      tumor_depth
      who_cns_grade
      who_nte_grade
      samples {
        sample_id
        sample_submitter_id
        annotation
      }
    }
    exposures {
      exposure_id
      exposure_submitter_id
      alcohol_days_per_week
      alcohol_drinks_per_day
      alcohol_history
      alcohol_intensity
      asbestos_exposure
      cigarettes_per_day
      coal_dust_exposure
      environmental_tobacco_smoke_exposure
      pack_years_smoked
      radon_exposure
      respirable_crystalline_silica_exposure
      smoking_frequency
      time_between_waking_and_first_smoke
      tobacco_smoking_onset_year
      tobacco_smoking_quit_year
      tobacco_smoking_status
      type_of_smoke_exposure
      type_of_tobacco_used
      years_smoked
      age_at_onset
      alcohol_type
      exposure_duration
      exposure_duration_years
      exposure_type
      marijuana_use_per_week
      parent_with_radiation_exposure
      secondhand_smoke_as_child
      smokeless_tobacco_quit_age
      tobacco_use_per_day
    }
    follow_ups {
      follow_up_id
      follow_up_submitter_id
      adverse_event
      barretts_esophagus_goblet_cells_present
      bmi
      cause_of_response
      comorbidity
      comorbidity_method_of_diagnosis
      days_to_adverse_event
      days_to_comorbidity
      days_to_follow_up
      days_to_progression
      days_to_progression_free
      days_to_recurrence
      diabetes_treatment_type
      disease_response
      dlco_ref_predictive_percent
      ecog_performance_status
      fev1_ref_post_bronch_percent
      fev1_ref_pre_bronch_percent
      fev1_fvc_pre_bronch_percent
      fev1_fvc_post_bronch_percent
      height
      hepatitis_sustained_virological_response
      hpv_positive_type
      karnofsky_performance_status
      menopause_status
      pancreatitis_onset_year
      progression_or_recurrence
      progression_or_recurrence_anatomic_site
      progression_or_recurrence_type
      reflux_treatment_type
      risk_factor
      risk_factor_treatment
      viral_hepatitis_serologies
      weight
      adverse_event_grade
      aids_risk_factors
      body_surface_area
      cd4_count
      cdc_hiv_risk_factors
      days_to_imaging
      evidence_of_recurrence_type
      eye_color
      haart_treatment_indicator
      history_of_tumor
      history_of_tumor_type
      hiv_viral_load
      hormonal_contraceptive_type
      hormonal_contraceptive_use
      hormone_replacement_therapy_type
      hysterectomy_margins_involved
      hysterectomy_type
      imaging_result
      imaging_type
      immunosuppressive_treatment_type
      nadir_cd4_count
      pregnancy_outcome
      procedures_performed
      recist_targeted_regions_number
      recist_targeted_regions_sum
      scan_tracer_used
      undescended_testis_corrected
      undescended_testis_corrected_age
      undescended_testis_corrected_laterality
      undescended_testis_corrected_method
      undescended_testis_history
      undescended_testis_history_laterality
    }
    treatments {
      treatment_id
      treatment_submitter_id
      days_to_treatment_end
      days_to_treatment_start
      initial_disease_status
      regimen_or_line_of_therapy
      therapeutic_agents
      treatment_anatomic_site
      treatment_effect
      treatment_intent_type
      treatment_or_therapy
      treatment_outcome
      treatment_type
      chemo_concurrent_to_radiation
      number_of_cycles
      reason_treatment_ended
      route_of_administration
      treatment_arm
      treatment_dose
      treatment_dose_units
      treatment_effect_indicator
      treatment_frequency
    }
  }
}
"""

# Demographic

query_demographcis = """
query paginatedCaseDemographicsPerStudy($study_id: String!, $offset: Int!, $limit: Int!) {
  paginatedCaseDemographicsPerStudy(study_id: $study_id, offset: $offset, limit: $limit) {
    total
    caseDemographicsPerStudy {
      case_id
      case_submitter_id
      disease_type
      primary_site
      demographics {
        demographic_id
        ethnicity
        gender
        demographic_submitter_id
        race
        cause_of_death
        days_to_birth
        days_to_death
        vital_status
        year_of_birth
        year_of_death
        age_at_index
        premature_at_birth
        weeks_gestation_at_birth
        age_is_obfuscated
        cause_of_death_source
        occupation_duration_years
        country_of_residence_at_enrollment
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""
# Diagnoses
query_diagnose = """
query paginatedCaseDiagnosesPerStudy($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  paginatedCaseDiagnosesPerStudy(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    total
    caseDiagnosesPerStudy {
      case_id
      case_submitter_id
      disease_type
      primary_site
      diagnoses {
        diagnosis_id
        tissue_or_organ_of_origin
        age_at_diagnosis
        primary_diagnosis
        tumor_grade
        tumor_stage
        diagnosis_submitter_id
        classification_of_tumor
        days_to_last_follow_up
        days_to_last_known_disease_status
        days_to_recurrence
        last_known_disease_status
        morphology
        progression_or_recurrence
        site_of_resection_or_biopsy
        prior_malignancy
        ajcc_clinical_m
        ajcc_clinical_n
        ajcc_clinical_stage
        ajcc_clinical_t
        ajcc_pathologic_m
        ajcc_pathologic_n
        ajcc_pathologic_stage
        ajcc_pathologic_t
        ann_arbor_b_symptoms
        ann_arbor_clinical_stage
        ann_arbor_extranodal_involvement
        ann_arbor_pathologic_stage
        best_overall_response
        burkitt_lymphoma_clinical_variant
        circumferential_resection_margin
        colon_polyps_history
        days_to_best_overall_response
        days_to_diagnosis
        days_to_hiv_diagnosis
        days_to_new_event
        figo_stage
        hiv_positive
        hpv_positive_type
        hpv_status
        iss_stage
        laterality
        ldh_level_at_diagnosis
        ldh_normal_range_upper
        lymph_nodes_positive
        lymphatic_invasion_present
        method_of_diagnosis
        new_event_anatomic_site
        new_event_type
        overall_survival
        perineural_invasion_present
        prior_treatment
        progression_free_survival
        progression_free_survival_event
        residual_disease
        vascular_invasion_present
        year_of_diagnosis
        icd_10_code
        synchronous_malignancy
        tumor_largest_dimension_diameter
        anaplasia_present
        anaplasia_present_type
        child_pugh_classification
        cog_liver_stage
        cog_neuroblastoma_risk_group
        cog_renal_stage
        cog_rhabdomyosarcoma_risk_group
        enneking_msts_grade
        enneking_msts_metastasis
        enneking_msts_stage
        enneking_msts_tumor_site
        esophageal_columnar_dysplasia_degree
        esophageal_columnar_metaplasia_present
        first_symptom_prior_to_diagnosis
        gastric_esophageal_junction_involvement
        goblet_cells_columnar_mucosa_present
        gross_tumor_weight
        inpc_grade
        inpc_histologic_group
        inrg_stage
        inss_stage
        irs_group
        irs_stage
        ishak_fibrosis_score
        lymph_nodes_tested
        medulloblastoma_molecular_classification
        metastasis_at_diagnosis
        metastasis_at_diagnosis_site
        mitosis_karyorrhexis_index
        peripancreatic_lymph_nodes_positive
        peripancreatic_lymph_nodes_tested
        supratentorial_localization
        tumor_confined_to_organ_of_origin
        tumor_focality
        tumor_regression_grade
        vascular_invasion_type
        wilms_tumor_histologic_subtype
        breslow_thickness
        gleason_grade_group
        igcccg_stage
        international_prognostic_index
        largest_extrapelvic_peritoneal_focus
        masaoka_stage
        non_nodal_regional_disease
        non_nodal_tumor_deposits
        ovarian_specimen_status
        ovarian_surface_involvement
        percent_tumor_invasion
        peritoneal_fluid_cytological_status
        primary_gleason_grade
        secondary_gleason_grade
        weiss_assessment_score
        adrenal_hormone
        ann_arbor_b_symptoms_described
        diagnosis_is_primary_disease
        eln_risk_classification
        figo_staging_edition_year
        gleason_grade_tertiary
        gleason_patterns_percent
        margin_distance
        margins_involved_site
        pregnant_at_diagnosis
        satellite_nodule_present
        sites_of_involvement
        tumor_depth
        who_cns_grade
        who_nte_grade
        samples {
          sample_id
          sample_submitter_id
          annotation
        }
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""

# Exposure

query_exposure = """
query paginatedCaseExposuresPerStudy($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  paginatedCaseExposuresPerStudy(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    total
    caseExposuresPerStudy {
      case_id
      case_submitter_id
      disease_type
      primary_site
      exposures {
        exposure_id
        exposure_submitter_id
        alcohol_days_per_week
        alcohol_drinks_per_day
        alcohol_history
        alcohol_intensity
        asbestos_exposure
        cigarettes_per_day
        coal_dust_exposure
        environmental_tobacco_smoke_exposure
        pack_years_smoked
        radon_exposure
        respirable_crystalline_silica_exposure
        smoking_frequency
        time_between_waking_and_first_smoke
        tobacco_smoking_onset_year
        tobacco_smoking_quit_year
        tobacco_smoking_status
        type_of_smoke_exposure
        type_of_tobacco_used
        years_smoked
        age_at_onset
        alcohol_type
        exposure_duration
        exposure_duration_years
        exposure_type
        marijuana_use_per_week
        parent_with_radiation_exposure
        secondhand_smoke_as_child
        smokeless_tobacco_quit_age
        tobacco_use_per_day
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""

# Treatments

query_treatments = """
query paginatedCaseTreatmentsPerStudy($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  paginatedCaseTreatmentsPerStudy(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    total
    caseTreatmentsPerStudy {
      case_id
      case_submitter_id
      disease_type
      primary_site
      treatments {
        treatment_id
        treatment_submitter_id
        days_to_treatment_end
        days_to_treatment_start
        initial_disease_status
        regimen_or_line_of_therapy
        therapeutic_agents
        treatment_anatomic_site
        treatment_effect
        treatment_intent_type
        treatment_or_therapy
        treatment_outcome
        treatment_type
        chemo_concurrent_to_radiation
        number_of_cycles
        reason_treatment_ended
        route_of_administration
        treatment_arm
        treatment_dose
        treatment_dose_units
        treatment_effect_indicator
        treatment_frequency
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""

# Follow-ups

query_follow_up = """
query paginatedCaseFollowUpsPerStudy($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  paginatedCaseFollowUpsPerStudy(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    total
    caseFollowUpsPerStudy {
      case_id
      case_submitter_id
      disease_type
      primary_site
      follow_ups {
        follow_up_id
        follow_up_submitter_id
        adverse_event
        barretts_esophagus_goblet_cells_present
        bmi
        cause_of_response
        comorbidity
        comorbidity_method_of_diagnosis
        days_to_adverse_event
        days_to_comorbidity
        days_to_follow_up
        days_to_progression
        days_to_progression_free
        days_to_recurrence
        diabetes_treatment_type
        disease_response
        dlco_ref_predictive_percent
        ecog_performance_status
        fev1_ref_post_bronch_percent
        fev1_ref_pre_bronch_percent
        fev1_fvc_pre_bronch_percent
        fev1_fvc_post_bronch_percent
        height
        hepatitis_sustained_virological_response
        hpv_positive_type
        karnofsky_performance_status
        menopause_status
        pancreatitis_onset_year
        progression_or_recurrence
        progression_or_recurrence_anatomic_site
        progression_or_recurrence_type
        reflux_treatment_type
        risk_factor
        risk_factor_treatment
        viral_hepatitis_serologies
        weight
        adverse_event_grade
        aids_risk_factors
        body_surface_area
        cd4_count
        cdc_hiv_risk_factors
        days_to_imaging
        evidence_of_recurrence_type
        eye_color
        haart_treatment_indicator
        history_of_tumor
        history_of_tumor_type
        hiv_viral_load
        hormonal_contraceptive_type
        hormonal_contraceptive_use
        hormone_replacement_therapy_type
        hysterectomy_margins_involved
        hysterectomy_type
        imaging_result
        imaging_type
        immunosuppressive_treatment_type
        nadir_cd4_count
        pregnancy_outcome
        procedures_performed
        recist_targeted_regions_number
        recist_targeted_regions_sum
        scan_tracer_used
        undescended_testis_corrected
        undescended_testis_corrected_age
        undescended_testis_corrected_laterality
        undescended_testis_corrected_method
        undescended_testis_history
        undescended_testis_history_laterality
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""

# Aliquots

query_aliquots = """
query paginatedCasesSamplesAliquots($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  paginatedCasesSamplesAliquots(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    total
    casesSamplesAliquots {
      case_submitter_id
      tissue_source_site_code
      days_to_lost_to_followup
      disease_type
      index_date
      lost_to_followup
      primary_site
      samples {
        gdc_sample_id
        gdc_project_id
        sample_submitter_id
        sample_type
        biospecimen_anatomic_site
        composition
        current_weight
        days_to_collection
        days_to_sample_procurement
        diagnosis_pathologically_confirmed
        freezing_method
        initial_weight
        intermediate_dimension
        longest_dimension
        method_of_sample_procurement
        pathology_report_uuid
        preservation_method
        sample_type_id
        shortest_dimension
        time_between_clamping_and_freezing
        time_between_excision_and_freezing
        tissue_type
        tumor_code
        tumor_code_id
        biospecimen_laterality
        catalog_reference
        distance_normal_to_tumor
        distributor_reference
        growth_rate
        passage_count
        sample_ordinal
        tissue_collection_type
        aliquots {
          aliquot_submitter_id
          aliquot_quantity
          aliquot_volume
          amount
          analyte_type
          aliquot_quantity
          aliquot_volume
          concentration
          pool
          status
          aliquot_is_ref
          aliquot_run_metadata {
            aliquot_run_metadata_id
            label
            experiment_number
            fraction
            replicate_number
            date
            alias
            analyte
          }
        }
      }
    }
    pagination {
      count
      sort
      from
      page
      total
      pages
      size
    }
  }
}
"""

# Query protocol

query_protocol = """
query protocolPerStudy($pdc_study_identifier: String!){ 
    protocolPerStudy(pdc_study_id: $pdc_study_identifier) {
    protocol_id
    protocol_submitter_id
    study_id
    pdc_study_id
    study_submitter_id
    program_id
    program_submitter_id
    protocol_name
    protocol_date
    document_name
    quantitation_strategy
    experiment_type
    label_free_quantitation
    labeled_quantitation
    isobaric_labeling_reagent
    reporter_ion_ms_level
    starting_amount
    starting_amount_uom
    digestion_reagent
    alkylation_reagent
    enrichment_strategy
    enrichment
    chromatography_dimensions_count
    one_d_chromatography_type
    two_d_chromatography_type
    fractions_analyzed_count
    column_type
    amount_on_column
    amount_on_column_uom
    column_length
    column_length_uom
    column_inner_diameter
    column_inner_diameter_uom
    particle_size
    particle_size_uom
    particle_type
    gradient_length
    gradient_length_uom
    instrument_make
    instrument_model
    dissociation_type
    ms1_resolution
    ms2_resolution
    dda_topn
    normalized_collision_energy
    acquistion_type
    dia_multiplexing
    dia_ims
    analytical_technique
    chromatography_instrument_make
    chromatography_instrument_model
    polarity
    reconstitution_solvent
    reconstitution_volume
    reconstitution_volume_uom
    internal_standards
    extraction_method
    ionization_mode
  }
}
"""

# Experimental Metadata

query_expMetadata_2 = """
query studyExperimentalDesign($pdc_study_identifier: String!) {
  studyExperimentalDesign(pdc_study_id: $pdc_study_identifier) {
    pdc_study_id
    study_run_metadata_id
    study_run_metadata_submitter_id
    study_id
    study_submitter_id
    analyte
    acquisition_type
    protocol_id
    protocol_submitter_id
    polarity
    experiment_type
    plex_dataset_name
    experiment_number
    number_of_fractions
    label_free {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_113 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_114 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_115 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_116 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_117 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_118 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_119 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    itraq_121 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_126 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_127n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_127c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_128n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_128c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_129n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_129c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_130n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_130c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_131 {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_131c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_132n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_132c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_133n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_133c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_134n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_134c {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
    tmt_135n {
      aliquot_id
      aliquot_run_metadata_id
      aliquot_submitter_id
    }
  }
}
"""

# File metadata

query_file_metadata = """
query filesPerStudy($pdc_study_identifier: String!, $offset: Int!, $limit: Int!) {
  filesPerStudy(pdc_study_id: $pdc_study_identifier, offset: $offset, limit: $limit) {
    study_id
    pdc_study_id
    study_submitter_id
    study_name
    file_id
    file_name
    file_submitter_id
    file_type
    md5sum
    file_location
    file_size
    data_category
    file_format
    signedUrl {
      url
    }
  }
}
"""

query_file_metadata_2 = """
query fileMetadata($file_id: String!, $offset: Int!, $limit: Int!) {
    fileMetadata(file_id: $file_id, offset: $offset, limit: $limit) {
        file_id 
        file_name 
        file_size 
        md5sum 
        file_location 
        file_submitter_id 
        fraction_number 
        experiment_type 
        data_category 
        file_type 
        file_format 
        protocol_id 
        protocol_submitter_id 
        plex_or_dataset_name 
        analyte 
        instrument 
        study_run_metadata_submitter_id 
        study_run_metadata_id 
        aliquots { 
            aliquot_id 
            aliquot_submitter_id 
            sample_id 
            sample_submitter_id 
            case_id 
            case_submitter_id
        }
    }
}
"""


# Quantitative data

query_quantitative = """
query quantDataMatrix($pdc_study_identifier: String!, $data_type: String!) {
  quantDataMatrix(pdc_study_id: $pdc_study_identifier, data_type: $data_type)
}
"""