#demographic for loop
import pandas as pd

# Demographics


def for_demographics(matrix):
    demographics_info_per_case = []
    for case in matrix:
        if case['demographics'] is not None:
         for demographics in case['demographics']:
            demographics_info = {
                "demographic_id": demographics["demographic_id"],
                "ethnicity": demographics["ethnicity"],
                "gender": demographics["gender"],
                "demographic_submitter_id": demographics["demographic_submitter_id"],
                "race": demographics["race"],
                "cause_of_death": demographics["cause_of_death"],
                "days_to_birth": demographics["days_to_birth"],
                "days_to_death": demographics["days_to_death"],
                "vital_status": demographics["vital_status"],
                "year_of_birth": demographics["year_of_birth"],
                "year_of_death": demographics["year_of_death"],
                "age_at_index": demographics["age_at_index"],
                "premature_at_birth": demographics["premature_at_birth"],
                "weeks_gestation_at_birth": demographics["weeks_gestation_at_birth"],
                "age_is_obfuscated": demographics["age_is_obfuscated"],
                "cause_of_death_source": demographics["cause_of_death_source"],
                "occupation_duration_years": demographics["occupation_duration_years"],
                "country_of_residence_at_enrollment": demographics["country_of_residence_at_enrollment"],
            }
            demographics_info = {k: ("None" if v is None else v) for k, v in demographics_info.items()}
            demographics_info_per_case.append(demographics_info)
    if not demographics_info_per_case:
       columns = [
          "demographic_id", "ethnicity", "gender", "demographic_submitter_id", "race", 
          "cause_of_death", "days_to_birth", "days_to_death", "vital_status", "year_of_birth", 
          "year_of_death", "age_at_index", "premature_at_birth", "weeks_gestation_at_birth", 
          "age_is_obfuscated", "cause_of_death_source", "occupation_duration_years", 
          "country_of_residence_at_enrollment", 
       ]
       df = pd.DataFrame(columns= columns, index= range(10))
       df = df.fillna('data not available')
    else:
       df = pd.DataFrame(demographics_info_per_case)
    return(df)


# Diagnoses for loop

def for_diagnosis(matrix):
    diagnose_info_per_case = []
    for case in matrix:
        if case['diagnoses'] is not None:
            for diagnoses in case['diagnoses']:
                diagnose_info = {
                    "diagnosis_id": diagnoses["diagnosis_id"],
                    "tissue_or_organ_of_origin": diagnoses["tissue_or_organ_of_origin"],
                    "age_at_diagnosis": diagnoses["age_at_diagnosis"],
                    "primary_diagnosis": diagnoses["primary_diagnosis"],
                    "tumor_grade": diagnoses["tumor_grade"],
                    "tumor_stage": diagnoses["tumor_stage"],
                    "diagnosis_submitter_id": diagnoses["diagnosis_submitter_id"],
                    "classification_of_tumor": diagnoses["classification_of_tumor"],
                    "days_to_last_follow_up": diagnoses["days_to_last_follow_up"],
                    "days_to_last_known_disease_status": diagnoses["days_to_last_known_disease_status"],
                    "days_to_recurrence": diagnoses["days_to_recurrence"],
                    "last_known_disease_status": diagnoses["last_known_disease_status"],
                    "morphology": diagnoses["morphology"],
                    "progression_or_recurrence": diagnoses["progression_or_recurrence"],
                    "site_of_resection_or_biopsy": diagnoses["site_of_resection_or_biopsy"],
                    "prior_malignancy": diagnoses["prior_malignancy"],
                    "ajcc_clinical_m": diagnoses["ajcc_clinical_m"],
                    "ajcc_clinical_n": diagnoses["ajcc_clinical_n"],
                    "ajcc_clinical_stage": diagnoses["ajcc_clinical_stage"],
                    "ajcc_clinical_t": diagnoses["ajcc_clinical_t"],
                    "ajcc_pathologic_m": diagnoses["ajcc_pathologic_m"],
                    "ajcc_pathologic_n": diagnoses["ajcc_pathologic_n"],
                    "ajcc_pathologic_stage": diagnoses["ajcc_pathologic_stage"],
                    "ajcc_pathologic_t": diagnoses["ajcc_pathologic_t"],
                    "ann_arbor_b_symptoms": diagnoses["ann_arbor_b_symptoms"],
                    "ann_arbor_clinical_stage": diagnoses["ann_arbor_clinical_stage"],
                    "ann_arbor_extranodal_involvement": diagnoses["ann_arbor_extranodal_involvement"],
                    "ann_arbor_pathologic_stage": diagnoses["ann_arbor_pathologic_stage"],
                    "best_overall_response": diagnoses["best_overall_response"],
                    "burkitt_lymphoma_clinical_variant": diagnoses["burkitt_lymphoma_clinical_variant"],
                    "circumferential_resection_margin": diagnoses["circumferential_resection_margin"],
                    "colon_polyps_history": diagnoses["colon_polyps_history"],
                    "days_to_best_overall_response": diagnoses["days_to_best_overall_response"],
                    "days_to_diagnosis": diagnoses["days_to_diagnosis"],
                    "days_to_hiv_diagnosis": diagnoses["days_to_hiv_diagnosis"],
                    "days_to_new_event": diagnoses["days_to_new_event"],
                    "figo_stage": diagnoses["figo_stage"],
                    "hiv_positive": diagnoses["hiv_positive"],
                    "hpv_positive_type": diagnoses["hpv_positive_type"],
                    "hpv_status": diagnoses["hpv_status"],
                    "iss_stage": diagnoses["iss_stage"],
                    "laterality": diagnoses["laterality"],
                    "ldh_level_at_diagnosis": diagnoses["ldh_level_at_diagnosis"],
                    "ldh_normal_range_upper": diagnoses["ldh_normal_range_upper"],
                    "lymph_nodes_positive": diagnoses["lymph_nodes_positive"],
                    "lymphatic_invasion_present": diagnoses["lymphatic_invasion_present"],
                    "method_of_diagnosis": diagnoses["method_of_diagnosis"],
                    "new_event_anatomic_site": diagnoses["new_event_anatomic_site"],
                    "new_event_type": diagnoses["new_event_type"],
                    "overall_survival": diagnoses["overall_survival"],
                    "perineural_invasion_present": diagnoses["perineural_invasion_present"],
                    "prior_treatment": diagnoses["prior_treatment"],
                    "progression_free_survival": diagnoses["progression_free_survival"],
                    "progression_free_survival_event": diagnoses["progression_free_survival_event"],
                    "residual_disease": diagnoses["residual_disease"],
                    "vascular_invasion_present": diagnoses["vascular_invasion_present"],
                    "year_of_diagnosis": diagnoses["year_of_diagnosis"],
                    "icd_10_code": diagnoses["icd_10_code"],
                    "synchronous_malignancy": diagnoses["synchronous_malignancy"],
                    "tumor_largest_dimension_diameter": diagnoses["tumor_largest_dimension_diameter"],
                    "anaplasia_present": diagnoses["anaplasia_present"],
                    "anaplasia_present_type": diagnoses["anaplasia_present_type"],
                    "child_pugh_classification": diagnoses["child_pugh_classification"],
                    "cog_liver_stage": diagnoses["cog_liver_stage"],
                    "cog_neuroblastoma_risk_group": diagnoses["cog_neuroblastoma_risk_group"],
                    "cog_renal_stage": diagnoses["cog_renal_stage"],
                    "cog_rhabdomyosarcoma_risk_group": diagnoses["cog_rhabdomyosarcoma_risk_group"],
                    "enneking_msts_grade": diagnoses["enneking_msts_grade"],
                    "enneking_msts_metastasis": diagnoses["enneking_msts_metastasis"],
                    "enneking_msts_stage": diagnoses["enneking_msts_stage"],
                    "enneking_msts_tumor_site": diagnoses["enneking_msts_tumor_site"],
                    "esophageal_columnar_dysplasia_degree": diagnoses["esophageal_columnar_dysplasia_degree"],
                    "esophageal_columnar_metaplasia_present": diagnoses["esophageal_columnar_metaplasia_present"],
                    "first_symptom_prior_to_diagnosis": diagnoses["first_symptom_prior_to_diagnosis"],
                    "gastric_esophageal_junction_involvement": diagnoses["gastric_esophageal_junction_involvement"],
                    "goblet_cells_columnar_mucosa_present": diagnoses["goblet_cells_columnar_mucosa_present"],
                    "gross_tumor_weight": diagnoses["gross_tumor_weight"],
                    "inpc_grade": diagnoses["inpc_grade"],
                    "inpc_histologic_group": diagnoses["inpc_histologic_group"],
                    "inrg_stage": diagnoses["inrg_stage"],
                    "inss_stage": diagnoses["inss_stage"],
                    "irs_group": diagnoses["irs_group"],
                    "irs_stage": diagnoses["irs_stage"],
                    "ishak_fibrosis_score": diagnoses["ishak_fibrosis_score"],
                    "lymph_nodes_tested": diagnoses["lymph_nodes_tested"],
                    "medulloblastoma_molecular_classification": diagnoses["medulloblastoma_molecular_classification"],
                    "metastasis_at_diagnosis": diagnoses["metastasis_at_diagnosis"],
                    "metastasis_at_diagnosis_site": diagnoses["metastasis_at_diagnosis_site"],
                    "mitosis_karyorrhexis_index": diagnoses["mitosis_karyorrhexis_index"],
                    "peripancreatic_lymph_nodes_positive": diagnoses["peripancreatic_lymph_nodes_positive"],
                    "peripancreatic_lymph_nodes_tested": diagnoses["peripancreatic_lymph_nodes_tested"],
                    "supratentorial_localization": diagnoses["supratentorial_localization"],
                    "tumor_confined_to_organ_of_origin": diagnoses["tumor_confined_to_organ_of_origin"],
                    "tumor_focality": diagnoses["tumor_focality"],
                    "tumor_regression_grade": diagnoses["tumor_regression_grade"],
                    "vascular_invasion_type": diagnoses["vascular_invasion_type"],
                    "wilms_tumor_histologic_subtype": diagnoses["wilms_tumor_histologic_subtype"],
                    "breslow_thickness": diagnoses["breslow_thickness"],
                    "gleason_grade_group": diagnoses["gleason_grade_group"],
                    "igcccg_stage": diagnoses["igcccg_stage"],
                    "international_prognostic_index": diagnoses["international_prognostic_index"],
                    "largest_extrapelvic_peritoneal_focus": diagnoses["largest_extrapelvic_peritoneal_focus"],
                    "masaoka_stage": diagnoses["masaoka_stage"],
                    "non_nodal_regional_disease": diagnoses["non_nodal_regional_disease"],
                    "non_nodal_tumor_deposits": diagnoses["non_nodal_tumor_deposits"],
                    "ovarian_specimen_status": diagnoses["ovarian_specimen_status"],
                    "ovarian_surface_involvement": diagnoses["ovarian_surface_involvement"],
                    "percent_tumor_invasion": diagnoses["percent_tumor_invasion"],
                    "peritoneal_fluid_cytological_status": diagnoses["peritoneal_fluid_cytological_status"],
                    "primary_gleason_grade": diagnoses["primary_gleason_grade"],
                    "secondary_gleason_grade": diagnoses["secondary_gleason_grade"],
                    "weiss_assessment_score": diagnoses["weiss_assessment_score"],
                    "adrenal_hormone": diagnoses["adrenal_hormone"],
                    "ann_arbor_b_symptoms_described": diagnoses["ann_arbor_b_symptoms_described"],
                    "diagnosis_is_primary_disease": diagnoses["diagnosis_is_primary_disease"],
                    "eln_risk_classification": diagnoses["eln_risk_classification"],
                    "figo_staging_edition_year": diagnoses["figo_staging_edition_year"],
                    "gleason_grade_tertiary": diagnoses["gleason_grade_tertiary"],
                    "gleason_patterns_percent": diagnoses["gleason_patterns_percent"],
                    "margin_distance": diagnoses["margin_distance"],
                    "margins_involved_site": diagnoses["margins_involved_site"],
                    "pregnant_at_diagnosis": diagnoses["pregnant_at_diagnosis"],
                    "satellite_nodule_present": diagnoses["satellite_nodule_present"],
                    "sites_of_involvement": diagnoses["sites_of_involvement"],
                    "tumor_depth": diagnoses["tumor_depth"],
                    "who_cns_grade": diagnoses["who_cns_grade"],
                    "who_nte_grade": diagnoses["who_nte_grade"],
                    "tumor_depth": diagnoses["tumor_depth"],
                    "who_cns_grade": diagnoses["who_cns_grade"],
                    "who_nte_grade": diagnoses["who_nte_grade"],
            }
                diagnose_info = {k: ("None" if v is None else v) for k, v in diagnose_info.items()}
                diagnose_info_per_case.append(diagnose_info)
    if not diagnose_info_per_case:
        columns = [
            "diagnosis_id", "tissue_or_organ_of_origin", "age_at_diagnosis", "primary_diagnosis", 
            "tumor_grade", "tumor_stage", "diagnosis_submitter_id", "classification_of_tumor", 
            "days_to_last_follow_up", "days_to_last_known_disease_status", "days_to_recurrence", 
            "last_known_disease_status", "morphology", "progression_or_recurrence", 
            "site_of_resection_or_biopsy", "prior_malignancy", "ajcc_clinical_m", "ajcc_clinical_n", 
            "ajcc_clinical_stage", "ajcc_clinical_t", "ajcc_pathologic_m", "ajcc_pathologic_n", 
            "ajcc_pathologic_stage", "ajcc_pathologic_t", "ann_arbor_b_symptoms", "ann_arbor_clinical_stage", 
            "ann_arbor_extranodal_involvement", "ann_arbor_pathologic_stage", "best_overall_response", 
            "burkitt_lymphoma_clinical_variant", "circumferential_resection_margin", "colon_polyps_history", 
            "days_to_best_overall_response", "days_to_diagnosis", "days_to_hiv_diagnosis", "days_to_new_event", 
            "figo_stage", "hiv_positive", "hpv_positive_type", "hpv_status", "iss_stage", "laterality", 
            "ldh_level_at_diagnosis", "ldh_normal_range_upper", "lymph_nodes_positive", "lymphatic_invasion_present", 
            "method_of_diagnosis", "new_event_anatomic_site", "new_event_type", "overall_survival", 
            "perineural_invasion_present", "prior_treatment", "progression_free_survival", "progression_free_survival_event", 
            "residual_disease", "vascular_invasion_present", "year_of_diagnosis", "icd_10_code", 
            "synchronous_malignancy", "tumor_largest_dimension_diameter", "anaplasia_present", "anaplasia_present_type", 
            "child_pugh_classification", "cog_liver_stage", "cog_neuroblastoma_risk_group", "cog_renal_stage", 
            "cog_rhabdomyosarcoma_risk_group", "enneking_msts_grade", "enneking_msts_metastasis", "enneking_msts_stage", 
            "enneking_msts_tumor_site", "esophageal_columnar_dysplasia_degree", "esophageal_columnar_metaplasia_present", 
            "first_symptom_prior_to_diagnosis", "gastric_esophageal_junction_involvement", "goblet_cells_columnar_mucosa_present", 
            "gross_tumor_weight", "inpc_grade", "inpc_histologic_group", "inrg_stage", "inss_stage", "irs_group", "irs_stage", 
            "ishak_fibrosis_score", "lymph_nodes_tested", "medulloblastoma_molecular_classification", "metastasis_at_diagnosis", 
            "metastasis_at_diagnosis_site", "mitosis_karyorrhexis_index", "peripancreatic_lymph_nodes_positive", 
            "peripancreatic_lymph_nodes_tested", "supratentorial_localization", "tumor_confined_to_organ_of_origin", 
            "tumor_focality", "tumor_regression_grade", "vascular_invasion_type", "wilms_tumor_histologic_subtype", 
            "breslow_thickness", "gleason_grade_group", "igcccg_stage", "international_prognostic_index", 
            "largest_extrapelvic_peritoneal_focus", "masaoka_stage", "non_nodal_regional_disease", "non_nodal_tumor_deposits", 
            "ovarian_specimen_status", "ovarian_surface_involvement", "percent_tumor_invasion", "peritoneal_fluid_cytological_status", 
            "primary_gleason_grade", "secondary_gleason_grade", "weiss_assessment_score", "adrenal_hormone", 
            "ann_arbor_b_symptoms_described", "diagnosis_is_primary_disease", "eln_risk_classification", "figo_staging_edition_year", 
            "gleason_grade_tertiary", "gleason_patterns_percent", "margin_distance", "margins_involved_site", 
            "pregnant_at_diagnosis", "satellite_nodule_present", "sites_of_involvement", 
            "tumor_depth", "who_cns_grade", "who_nte_grade", 
        ]
        df = pd.DataFrame(columns = columns, index= range(10))
        df = df.fillna("data not available")
    else:
        df = pd.DataFrame(diagnose_info_per_case)
    return(df)

def for_exposure(matrix):
    exposure_info_per_case = []
    for case in matrix:
        if case['exposures'] is not None:
            for exposures in case['exposures']:
                exposure_info = {
                    "exposure_id": exposures["exposure_id"],
                    "exposure_submitter_id": exposures["exposure_submitter_id"],
                    "alcohol_days_per_week": exposures["alcohol_days_per_week"],
                    "alcohol_drinks_per_day": exposures["alcohol_drinks_per_day"],
                    "alcohol_history": exposures["alcohol_history"],
                    "alcohol_intensity": exposures["alcohol_intensity"],
                    "asbestos_exposure": exposures["asbestos_exposure"],
                    "cigarettes_per_day": exposures["cigarettes_per_day"],
                    "coal_dust_exposure": exposures["coal_dust_exposure"],
                    "environmental_tobacco_smoke_exposure": exposures["environmental_tobacco_smoke_exposure"],
                    "pack_years_smoked": exposures["pack_years_smoked"],
                    "radon_exposure": exposures["radon_exposure"],
                    "respirable_crystalline_silica_exposure": exposures["respirable_crystalline_silica_exposure"],
                    "smoking_frequency": exposures["smoking_frequency"],
                    "time_between_waking_and_first_smoke": exposures["time_between_waking_and_first_smoke"],
                    "tobacco_smoking_onset_year": exposures["tobacco_smoking_onset_year"],
                    "tobacco_smoking_quit_year": exposures["tobacco_smoking_quit_year"],
                    "tobacco_smoking_status": exposures["tobacco_smoking_status"],
                    "type_of_smoke_exposure": exposures["type_of_smoke_exposure"],
                    "type_of_tobacco_used": exposures["type_of_tobacco_used"],
                    "years_smoked": exposures["years_smoked"],
                    "age_at_onset": exposures["age_at_onset"],
                    "alcohol_type": exposures["alcohol_type"],
                    "exposure_duration": exposures["exposure_duration"],
                    "exposure_duration_years": exposures["exposure_duration_years"],
                    "exposure_type": exposures["exposure_type"],
                    "marijuana_use_per_week": exposures["marijuana_use_per_week"],
                    "parent_with_radiation_exposure": exposures["parent_with_radiation_exposure"],
                    "secondhand_smoke_as_child": exposures["secondhand_smoke_as_child"],
                    "smokeless_tobacco_quit_age": exposures["smokeless_tobacco_quit_age"],
                    "tobacco_use_per_day": exposures["tobacco_use_per_day"]
            }
                exposure_info = {k: ("None" if v is None else v) for k, v in exposure_info.items()}
                exposure_info_per_case.append(exposure_info)
    if not exposure_info_per_case:
        columns = [
            "exposure_id", "exposure_submitter_id", "alcohol_days_per_week", "alcohol_drinks_per_day",
            "alcohol_history", "alcohol_intensity", "asbestos_exposure", "cigarettes_per_day", "coal_dust_exposure",
            "environmental_tobacco_smoke_exposure", "pack_years_smoked", "radon_exposure", "respirable_crystalline_silica_exposure",
            "smoking_frequency", "time_between_waking_and_first_smoke", "tobacco_smoking_onset_year", 
            "tobacco_smoking_quit_year", "tobacco_smoking_status", "type_of_smoke_exposure", 
            "type_of_tobacco_used", "years_smoked", "age_at_onset", "alcohol_type", "exposure_duration", 
            "exposure_duration_years", "exposure_type", "marijuana_use_per_week", "parent_with_radiation_exposure", 
            "secondhand_smoke_as_child", "smokeless_tobacco_quit_age", 
            "tobacco_use_per_day"
        ]
        df = pd.DataFrame(columns = columns, index= range(10))
        df = df.fillna('data not available')
    else: 
        df = pd.DataFrame(exposure_info_per_case)
    return df

# Treatments
def for_treatment(matrix):
    treatments_info_per_case = []
    for case in matrix:
        if case['treatments'] is not None:
            for treatments in case['treatments']:
                treamtns_info = {
                    "treatment_id": treatments["treatment_id"],
                    "treatment_submitter_id": treatments["treatment_submitter_id"],
                    "days_to_treatment_start": treatments["days_to_treatment_start"],
                    "initial_disease_status": treatments["initial_disease_status"],
                    "regimen_or_line_of_therapy": treatments["regimen_or_line_of_therapy"],
                    "therapeutic_agents": treatments["therapeutic_agents"],
                    "treatment_anatomic_site": treatments["treatment_anatomic_site"],
                    "treatment_effect": treatments["treatment_effect"],
                    "treatment_intent_type": treatments["treatment_intent_type"],
                    "treatment_or_therapy": treatments["treatment_or_therapy"],
                    "treatment_outcome": treatments["treatment_outcome"],
                    "treatment_type": treatments["treatment_type"],
                    "chemo_concurrent_to_radiation": treatments["chemo_concurrent_to_radiation"],
                    "number_of_cycles": treatments["number_of_cycles"],
                    "reason_treatment_ended": treatments["reason_treatment_ended"],
                    "route_of_administration": treatments["route_of_administration"],
                    "treatment_arm": treatments["treatment_arm"],
                    "treatment_dose": treatments["treatment_dose"],
                    "treatment_dose_units": treatments["treatment_dose_units"],
                    "treatment_effect_indicator": treatments["treatment_effect_indicator"],
                    "treatment_frequency": treatments["treatment_frequency"],
            }
                treatments_info = {k: ("None" if v is None else v) for k, v in treatments_info.items()}
                treatments_info_per_case.append(treatments_info)
    
    if not treatments_info_per_case:
        columns = [
            "treatment_id", "treatment_submitter_id", "days_to_treatment_start", "initial_disease_status",
            "regimen_or_line_of_therapy", "therapeutic_agents", "treatment_anatomic_site", "treatment_effect",
            "treatment_intent_type", "treatment_or_therapy", "treatment_outcome", "treatment_type",
            "chemo_concurrent_to_radiation", "number_of_cycles", "reason_treatment_ended", "route_of_administration",
            "treatment_arm", "treatment_dose", "treatment_dose_units", "treatment_effect_indicator", "treatment_frequency"
        ]
        df = pd.DataFrame(columns=columns, index=range(10))
        df = df.fillna("data not available")
    else:
        df = pd.DataFrame(treatments_info_per_case)
    
    return df


# Follow up for loop

def for_follows_up(matrix):
    follow_up_info_per_case = []
    for case in matrix:
        if case['follow_ups'] is not None:
            for follow_ups in case['follow_ups']:
                follow_up_info = {
                    "follow_up_id": follow_ups["follow_up_id"],
                    "follow_up_submitter_id": follow_ups["follow_up_submitter_id"],
                    "adverse_event": follow_ups["adverse_event"],
                    "barretts_esophagus_goblet_cells_present": follow_ups["barretts_esophagus_goblet_cells_present"],
                    "bmi": follow_ups["bmi"],
                    "cause_of_response": follow_ups["cause_of_response"],
                    "comorbidity": follow_ups["comorbidity"],
                    "comorbidity_method_of_diagnosis": follow_ups["comorbidity_method_of_diagnosis"],
                    "days_to_adverse_event": follow_ups["days_to_adverse_event"],
                    "days_to_comorbidity": follow_ups["days_to_comorbidity"],
                    "days_to_follow_up": follow_ups["days_to_follow_up"],
                    "days_to_progression": follow_ups["days_to_progression"],
                    "days_to_progression_free": follow_ups["days_to_progression_free"],
                    "days_to_recurrence": follow_ups["days_to_recurrence"],
                    "diabetes_treatment_type": follow_ups["diabetes_treatment_type"],
                    "disease_response": follow_ups["disease_response"],
                    "dlco_ref_predictive_percent": follow_ups["dlco_ref_predictive_percent"],
                    "ecog_performance_status": follow_ups["ecog_performance_status"],
                    "fev1_ref_post_bronch_percent": follow_ups["fev1_ref_post_bronch_percent"],
                    "fev1_ref_pre_bronch_percent": follow_ups["fev1_ref_pre_bronch_percent"],
                    "fev1_fvc_pre_bronch_percent": follow_ups["fev1_fvc_pre_bronch_percent"],
                    "fev1_fvc_post_bronch_percent": follow_ups["fev1_fvc_post_bronch_percent"],
                    "height": follow_ups["height"],
                    "hepatitis_sustained_virological_response": follow_ups["hepatitis_sustained_virological_response"],
                    "hpv_positive_type": follow_ups["hpv_positive_type"],
                    "karnofsky_performance_status": follow_ups["karnofsky_performance_status"],
                    "menopause_status": follow_ups["menopause_status"],
                    "pancreatitis_onset_year": follow_ups["pancreatitis_onset_year"],
                    "progression_or_recurrence": follow_ups["progression_or_recurrence"],
                    "progression_or_recurrence_anatomic_site": follow_ups["progression_or_recurrence_anatomic_site"],
                    "progression_or_recurrence_type": follow_ups["progression_or_recurrence_type"],
                    "reflux_treatment_type": follow_ups["reflux_treatment_type"],
                    "risk_factor": follow_ups["risk_factor"],
                    "risk_factor_treatment": follow_ups["risk_factor_treatment"],
                    "viral_hepatitis_serologies": follow_ups["viral_hepatitis_serologies"],
                    "weight": follow_ups["weight"],
                    "adverse_event_grade": follow_ups["adverse_event_grade"],
                    "aids_risk_factors": follow_ups["aids_risk_factors"],
                    "body_surface_area": follow_ups["body_surface_area"],
                    "cd4_count": follow_ups["cd4_count"],
                    "cdc_hiv_risk_factors": follow_ups["cdc_hiv_risk_factors"],
                    "days_to_imaging": follow_ups["days_to_imaging"],
                    "evidence_of_recurrence_type": follow_ups["evidence_of_recurrence_type"],
                    "eye_color": follow_ups["eye_color"],
                    "haart_treatment_indicator": follow_ups["haart_treatment_indicator"],
                    "history_of_tumor": follow_ups["history_of_tumor"],
                    "history_of_tumor_type": follow_ups["history_of_tumor_type"],
                    "hiv_viral_load": follow_ups["hiv_viral_load"],
                    "hormonal_contraceptive_type": follow_ups["hormonal_contraceptive_type"],
                    "hormonal_contraceptive_use": follow_ups["hormonal_contraceptive_use"],
                    "hormone_replacement_therapy_type": follow_ups["hormone_replacement_therapy_type"],
                    "hysterectomy_margins_involved": follow_ups["hysterectomy_margins_involved"],
                    "hysterectomy_type": follow_ups["hysterectomy_type"],
                    "imaging_result": follow_ups["imaging_result"],
                    "imaging_type": follow_ups["imaging_type"],
                    "immunosuppressive_treatment_type": follow_ups["immunosuppressive_treatment_type"],
                    "nadir_cd4_count": follow_ups["nadir_cd4_count"],
                    "pregnancy_outcome": follow_ups["pregnancy_outcome"],
                    "procedures_performed": follow_ups["procedures_performed"],
                    "recist_targeted_regions_number": follow_ups["recist_targeted_regions_number"],
                    "recist_targeted_regions_sum": follow_ups["recist_targeted_regions_sum"],
                    "scan_tracer_used": follow_ups["scan_tracer_used"],
                    "undescended_testis_corrected": follow_ups["undescended_testis_corrected"],
                    "undescended_testis_corrected_age": follow_ups["undescended_testis_corrected_age"],
                    "undescended_testis_corrected_laterality": follow_ups["undescended_testis_corrected_laterality"],
                    "undescended_testis_corrected_method": follow_ups["undescended_testis_corrected_method"],
                    "undescended_testis_history": follow_ups["undescended_testis_history"],
                    "undescended_testis_history_laterality": follow_ups["undescended_testis_history_laterality"],
            }
                follow_up_info = {k: ("None" if v is None else v) for k, v in follow_up_info.items()}
                follow_up_info_per_case.append(follow_up_info)
    if not follow_up_info_per_case:
        columns = [
            "follow_up_id", "follow_up_submitter_id", "adverse_event", "barretts_esophagus_goblet_cells_present", 
            "bmi", "cause_of_response", "comorbidity", "comorbidity_method_of_diagnosis", "days_to_adverse_event", 
            "days_to_comorbidity", "days_to_follow_up", "days_to_progression", "days_to_progression_free", 
            "days_to_recurrence", "diabetes_treatment_type", "disease_response", "dlco_ref_predictive_percent", 
            "ecog_performance_status", "fev1_ref_post_bronch_percent", "fev1_ref_pre_bronch_percent", 
            "fev1_fvc_pre_bronch_percent", "fev1_fvc_post_bronch_percent", "height", "hepatitis_sustained_virological_response", 
            "hpv_positive_type", "karnofsky_performance_status", "menopause_status", "pancreatitis_onset_year", 
            "progression_or_recurrence", "progression_or_recurrence_anatomic_site", "progression_or_recurrence_type", 
            "reflux_treatment_type", "risk_factor", "risk_factor_treatment", "viral_hepatitis_serologies", "weight", 
            "adverse_event_grade", "aids_risk_factors", "body_surface_area", "cd4_count", "cdc_hiv_risk_factors", 
            "days_to_imaging", "evidence_of_recurrence_type", "eye_color", "haart_treatment_indicator", "history_of_tumor", 
            "history_of_tumor_type", "hiv_viral_load", "hormonal_contraceptive_type", "hormonal_contraceptive_use", 
            "hormone_replacement_therapy_type", "hysterectomy_margins_involved", "hysterectomy_type", "imaging_result", 
            "imaging_type", "immunosuppressive_treatment_type", "nadir_cd4_count", "pregnancy_outcome", "procedures_performed", 
            "recist_targeted_regions_number", "recist_targeted_regions_sum", "scan_tracer_used", "undescended_testis_corrected",
            "undescended_testis_corrected_age", "undescended_testis_corrected_laterality", "undescended_testis_corrected_method", 
            "undescended_testis_history", "undescended_testis_history_laterality", 
        ]
        df = pd.DataFrame(columns = columns, index=range(10))
        df = df.fillna('data not available')
    else:
        df = pd.DataFrame(follow_up_info_per_case)
    return(df)

# Aliquots for loop

def for_aliquots(matrix):
    aliqots_per_study = []
    for case in matrix:
        if case["samples"] is not None:
            for samples in case["samples"]:
                if samples["aliquots"] is not None:
                    for aliquots in samples["aliquots"]:
                        aliquots_info =  {
                            "aliquot_submitter_id": aliquots["aliquot_submitter_id"],
                            "aliquot_quantity": aliquots["aliquot_quantity"],
                            "aliquot_volume": aliquots["aliquot_volume"],
                            "amount": aliquots["amount"],
                            "analyte_type": aliquots["analyte_type"],
                            "aliquot_quantity": aliquots["aliquot_quantity"],
                            "aliquot_volume": aliquots["aliquot_volume"],
                            "concentration": aliquots["concentration"],
                            "pool": aliquots["pool"],
                            "status": aliquots["status"],
                            "aliquot_is_ref": aliquots["aliquot_is_ref"]
                        }
                        aliquots_info = {k: ("None" if v is None else v) for k, v in aliquots_info.items()}
                aliqots_per_study.append(aliquots_info)
    if not aliqots_per_study:
        columns = [
            "aliquot_submitter_id", "aliquot_quantity", "aliquot_volume", "amount", "analyte_type", 
            "aliquot_quantity", "aliquot_volume", "concentration", "pool", "status", "aliquot_is_ref", "aliquot_run_metadata", ]
        df = pd.DataFrame(columns= columns, index=range(10))
        df = df.fillna("data not available")
    else:
        df = pd.DataFrame(aliqots_per_study)
    return(df)

# Sample

def for_sample(matrix):
    sample_per_study = []
    for case in matrix:
        if case['samples'] is not None:
            for samples in case['samples']:
                sample_info = {
                    "sample_id": samples["sample_id"],
                    "sample_submitter_id": samples["sample_submitter_id"],
                    "sample_type": samples["sample_type"],
                    "sample_type_id": samples["sample_type_id"],
                    "gdc_sample_id": samples["gdc_sample_id"],
                    "gdc_project_id": samples["gdc_project_id"],
                    "biospecimen_anatomic_site": samples["biospecimen_anatomic_site"],
                    "composition": samples["composition"],
                    "current_weight": samples["current_weight"],
                    "days_to_collection": samples["days_to_collection"],
                    "days_to_sample_procurement": samples["days_to_sample_procurement"],
                    "diagnosis_pathologically_confirmed": samples["diagnosis_pathologically_confirmed"],
                    "freezing_method": samples["freezing_method"],
                    "initial_weight": samples["initial_weight"],
                    "intermediate_dimension": samples["intermediate_dimension"],
                    "longest_dimension": samples["longest_dimension"],
                    "method_of_sample_procurement": samples["method_of_sample_procurement"],
                    "pathology_report_uuid": samples["pathology_report_uuid"],
                    "preservation_method": samples["preservation_method"],
                    "sample_type_id": samples["sample_type_id"],
                    "shortest_dimension": samples["shortest_dimension"],
                    "time_between_clamping_and_freezing": samples["time_between_clamping_and_freezing"],
                    "time_between_excision_and_freezing": samples["time_between_excision_and_freezing"],
                    "tissue_type": samples["tissue_type"],
                    "tumor_code": samples["tumor_code"],
                    "tumor_code_id": samples["tumor_code_id"],
                    "tumor_descriptor": samples["tumor_descriptor"],
                    "biospecimen_laterality": samples["biospecimen_laterality"],
                    "catalog_reference": samples["catalog_reference"],
                    "distance_normal_to_tumor": samples["distance_normal_to_tumor"],
                    "distributor_reference": samples["distributor_reference"],
                    "growth_rate": samples["growth_rate"],
                    "passage_count": samples["passage_count"],
                    "sample_ordinal": samples["sample_ordinal"],
                    "tissue_collection_type": samples["tissue_collection_type"]
                }
                sample_info = {k: ("None" if v is None else v) for k, v in sample_info.items()}
                sample_per_study.append(sample_info)
    if not sample_per_study:
        columns = [
            "sample_id", "sample_submitter_id", "sample_type", "sample_type_id", "gdc_sample_id", 
            "gdc_project_id", "biospecimen_anatomic_site", "composition", "current_weight", 
            "days_to_collection", "days_to_sample_procurement", "diagnosis_pathologically_confirmed", 
            "freezing_method", "initial_weight", "intermediate_dimension", "longest_dimension", 
            "method_of_sample_procurement", "pathology_report_uuid", "preservation_method", "sample_type_id", 
            "shortest_dimension", "time_between_clamping_and_freezing", "time_between_excision_and_freezing", 
            "tissue_type", "tumor_code", "tumor_code_id", "tumor_descriptor", "biospecimen_laterality", 
            "catalog_reference", "distance_normal_to_tumor", "distributor_reference", "growth_rate", 
            "passage_count", "sample_ordinal", "tissue_collection_type", 
        ]
        df = pd.DataFrame(columns= columns, index=range(10))
        df = df.fillna("data not available")
    else:
        df = pd.DataFrame(sample_per_study)
    return(df)


    