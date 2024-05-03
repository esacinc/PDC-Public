import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllClinicalData, QueryAllClinicalDataPaginated } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class BrowseByClinicalService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	//@@@PDC-232
	//@@@PDC-462 show submitter id
	//@@@PDC-497 Make table column headers sortable on the browse page tabs
	//@@@PDC-567 add sample_type filter
	//@@@PDC-616 Add acquisition type to the general filters
	//@@@PDC-1305 add age_at_diagnosis et al
	//@@@PDC-2397 Update clinical manifest generation to include additional attributes
	//@@@PDC-2335 remove imaging_resource
	filteredCinicalDataPaginatedQuery = gql`
				query FilteredClinicalDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!){
					getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
											study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
											experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter,
											tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter) {
						total
						uiClinical{
							case_submitter_id
							external_case_id
							ethnicity
							gender
							race
							morphology
							primary_diagnosis
							site_of_resection_or_biopsy
							tissue_or_organ_of_origin
							tumor_grade
							tumor_stage
							age_at_diagnosis
							classification_of_tumor
							days_to_recurrence
							case_id
							disease_type
							primary_site
							program_name
							project_name
							status
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
							days_to_last_follow_up
							days_to_last_known_disease_status
							last_known_disease_status
							progression_or_recurrence
							prior_malignancy
							ajcc_clinical_m
							ajcc_clinical_n
							ajcc_clinical_stage
							ajcc_clinical_t
							ajcc_pathologic_m
							ajcc_pathologic_n
							ajcc_pathologic_stage
							ajcc_pathologic_t
							ajcc_staging_system_edition
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
							externalReferences {
								reference_resource_shortname
								reference_entity_location
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
				}`;

	getFilteredClinicalDataPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
			query: this.filteredCinicalDataPaginatedQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || "",
				project_name_filter: filters["project_name"] || "" ,
				study_name_filter: filters["study_name"] || "",
				disease_filter: filters["disease_type"]|| "",
				filterValue: filters["primary_site"] || "",
				analytical_frac_filter: filters["analytical_fraction"] || "",
				exp_type_filter: filters["experiment_type"] || "",
				ethnicity_filter: filter_ethnicity || "",
				race_filter: filter_race || "",
				gender_filter: filters["gender"] || "",
				tumor_grade_filter: filters["tumor_grade"] || "",
				sample_type_filter: filters["sample_type"],
				acquisition_type_filter: filters["acquisition_type"],
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				case_status_filter: filters["case_status"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	filteredCinicalAdditionalDataPaginatedQuery = gql`
	query FilteredCinicalAdditionalDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!){
		getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
								study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
								experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter,
								tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter) {
			total
			uiClinical{
				case_submitter_id
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
				metastasis_at_diagnosis
				metastasis_at_diagnosis_site
				mitosis_karyorrhexis_index
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
				diagnosis_uuid
			}
		}
	}`;

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	//2 calls for the same API due to "URI too long" error
	getFilteredClinicalAdditionalDataPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
			query: this.filteredCinicalAdditionalDataPaginatedQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || "",
				project_name_filter: filters["project_name"] || "" ,
				study_name_filter: filters["study_name"] || "",
				disease_filter: filters["disease_type"]|| "",
				filterValue: filters["primary_site"] || "",
				analytical_frac_filter: filters["analytical_fraction"] || "",
				exp_type_filter: filters["experiment_type"] || "",
				ethnicity_filter: filter_ethnicity || "",
				race_filter: filter_race || "",
				gender_filter: filters["gender"] || "",
				tumor_grade_filter: filters["tumor_grade"] || "",
				sample_type_filter: filters["sample_type"],
				acquisition_type_filter: filters["acquisition_type"],
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				case_status_filter: filters["case_status"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	filteredCinicalExposureDataPaginatedQuery = gql`
	query FilteredClinicalExposureDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!){
		getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
								study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
								experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter,
								tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter) {
			total
			uiClinical{
				case_submitter_id
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
		}
	}`;

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	//2 calls for the same API due to "URI too long" error
	getFilteredClinicalExposureDataPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
			query: this.filteredCinicalExposureDataPaginatedQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || "",
				project_name_filter: filters["project_name"] || "" ,
				study_name_filter: filters["study_name"] || "",
				disease_filter: filters["disease_type"]|| "",
				filterValue: filters["primary_site"] || "",
				analytical_frac_filter: filters["analytical_fraction"] || "",
				exp_type_filter: filters["experiment_type"] || "",
				ethnicity_filter: filter_ethnicity || "",
				race_filter: filter_race || "",
				gender_filter: filters["gender"] || "",
				tumor_grade_filter: filters["tumor_grade"] || "",
				sample_type_filter: filters["sample_type"],
				acquisition_type_filter: filters["acquisition_type"],
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				case_status_filter: filters["case_status"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	filteredCinicalFollowUpDataPaginatedQuery = gql`
	query FilteredCinicalFollowUpDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!){
		getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
								study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
								experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter,
								tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter) {
			total
			uiClinical{
				case_submitter_id
				follow_ups {
					follow_up_id
					follow_up_submitter_id
					adverse_event
					adverse_event_grade
					aids_risk_factors
					barretts_esophagus_goblet_cells_present
					bmi
					body_surface_area
					cause_of_response
					cd4_count
					cdc_hiv_risk_factors
					comorbidity
					comorbidity_method_of_diagnosis
					days_to_adverse_event
					days_to_comorbidity
					days_to_follow_up
					days_to_imaging
					days_to_progression
					days_to_progression_free
					days_to_recurrence
					diabetes_treatment_type
					disease_response
					dlco_ref_predictive_percent
					ecog_performance_status
					evidence_of_recurrence_type
					eye_color
					fev1_ref_post_bronch_percent
					fev1_ref_pre_bronch_percent
					fev1_fvc_pre_bronch_percent
					fev1_fvc_post_bronch_percent
					haart_treatment_indicator
					height
					hepatitis_sustained_virological_response
					history_of_tumor
					history_of_tumor_type
					hiv_viral_load
					hormonal_contraceptive_type
					hormonal_contraceptive_use
					hormone_replacement_therapy_type
					hpv_positive_type
					hysterectomy_margins_involved
					hysterectomy_type
					imaging_result
					imaging_type
					immunosuppressive_treatment_type
					karnofsky_performance_status
					menopause_status
					nadir_cd4_count
					pancreatitis_onset_year
					pregnancy_outcome
					procedures_performed
					progression_or_recurrence
					progression_or_recurrence_anatomic_site
					progression_or_recurrence_type
					recist_targeted_regions_number
					recist_targeted_regions_sum
					reflux_treatment_type
					risk_factor
					risk_factor_treatment
					scan_tracer_used
					undescended_testis_corrected
					undescended_testis_corrected_age
					undescended_testis_corrected_laterality
					undescended_testis_corrected_method
					undescended_testis_history
					undescended_testis_history_laterality
					viral_hepatitis_serologies
					weight
				}
			}
		}
	}`;

	//@@@PDC-4899: Records on the Clinical tab are '0' on the Explore page in Data Browser Stage
	//2 calls for the same API due to "URI too long" error
	getFilteredClinicalFollowUpDataPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
			query: this.filteredCinicalFollowUpDataPaginatedQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || "",
				project_name_filter: filters["project_name"] || "" ,
				study_name_filter: filters["study_name"] || "",
				disease_filter: filters["disease_type"]|| "",
				filterValue: filters["primary_site"] || "",
				analytical_frac_filter: filters["analytical_fraction"] || "",
				exp_type_filter: filters["experiment_type"] || "",
				ethnicity_filter: filter_ethnicity || "",
				race_filter: filter_race || "",
				gender_filter: filters["gender"] || "",
				tumor_grade_filter: filters["tumor_grade"] || "",
				sample_type_filter: filters["sample_type"],
				acquisition_type_filter: filters["acquisition_type"],
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				case_status_filter: filters["case_status"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
	//@@@PDC-8282 add treatment to manifest
	filteredCinicalDataPaginatedPostQuery = gql`
	query FilteredClinicalDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!, $getAll: Boolean!){
		getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
								study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
								experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter,
								tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter, getAll: $getAll) {
			total
			uiClinical{
				case_submitter_id
				external_case_id
				ethnicity
				gender
				race
				morphology
				primary_diagnosis
				site_of_resection_or_biopsy
				tissue_or_organ_of_origin
				tumor_grade
				tumor_stage
				age_at_diagnosis
				classification_of_tumor
				days_to_recurrence
				case_id
				disease_type
				primary_site
				program_name
				project_name
				status
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
				days_to_last_follow_up
				days_to_last_known_disease_status
				last_known_disease_status
				progression_or_recurrence
				prior_malignancy
				ajcc_clinical_m
				ajcc_clinical_n
				ajcc_clinical_stage
				ajcc_clinical_t
				ajcc_pathologic_m
				ajcc_pathologic_n
				ajcc_pathologic_stage
				ajcc_pathologic_t
				ajcc_staging_system_edition
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
				metastasis_at_diagnosis
				metastasis_at_diagnosis_site
				mitosis_karyorrhexis_index
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
				diagnosis_uuid
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
				externalReferences {
					reference_resource_shortname
					reference_entity_location
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
					adverse_event_grade
					aids_risk_factors
					barretts_esophagus_goblet_cells_present
					bmi
					body_surface_area
					cause_of_response
					cd4_count
					cdc_hiv_risk_factors
					comorbidity
					comorbidity_method_of_diagnosis
					days_to_adverse_event
					days_to_comorbidity
					days_to_follow_up
					days_to_imaging
					days_to_progression
					days_to_progression_free
					days_to_recurrence
					diabetes_treatment_type
					disease_response
					dlco_ref_predictive_percent
					ecog_performance_status
					evidence_of_recurrence_type
					eye_color
					fev1_ref_post_bronch_percent
					fev1_ref_pre_bronch_percent
					fev1_fvc_pre_bronch_percent
					fev1_fvc_post_bronch_percent
					haart_treatment_indicator
					height
					hepatitis_sustained_virological_response
					history_of_tumor
					history_of_tumor_type
					hiv_viral_load
					hormonal_contraceptive_type
					hormonal_contraceptive_use
					hormone_replacement_therapy_type
					hpv_positive_type
					hysterectomy_margins_involved
					hysterectomy_type
					imaging_result
					imaging_type
					immunosuppressive_treatment_type
					karnofsky_performance_status
					menopause_status
					nadir_cd4_count
					pancreatitis_onset_year
					pregnancy_outcome
					procedures_performed
					progression_or_recurrence
					progression_or_recurrence_anatomic_site
					progression_or_recurrence_type
					recist_targeted_regions_number
					recist_targeted_regions_sum
					reflux_treatment_type
					risk_factor
					risk_factor_treatment
					scan_tracer_used
					undescended_testis_corrected
					undescended_testis_corrected_age
					undescended_testis_corrected_laterality
					undescended_testis_corrected_method
					undescended_testis_history
					undescended_testis_history_laterality
					viral_hepatitis_serologies
					weight
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
				samples {
					sample_id
					sample_submitter_id
					annotation
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
	}`;

	//@@@PDC-1940: File manifest download is very slow
	//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
	getFilteredClinicalDataPaginatedPost(offset: number, limit: number, sort: string, filters:any, getAll:any = false) {
	let filter_ethnicity = filters["ethnicity"];
	if (filter_ethnicity === "Empty value"){
		filter_ethnicity = "";
	}
	let filter_race = filters["race"];
	if (filter_race === "Empty value"){
		filter_race = "";
	}

	return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
		query: this.filteredCinicalDataPaginatedPostQuery,
		variables: {
			offset_value: offset,
			limit_value: limit,
			sort_value: sort,
			program_name_filter: filters["program_name"] || "",
			project_name_filter: filters["project_name"] || "" ,
			study_name_filter: filters["study_name"] || "",
			disease_filter: filters["disease_type"]|| "",
			filterValue: filters["primary_site"] || "",
			analytical_frac_filter: filters["analytical_fraction"] || "",
			exp_type_filter: filters["experiment_type"] || "",
			ethnicity_filter: filter_ethnicity || "",
			race_filter: filter_race || "",
			gender_filter: filters["gender"] || "",
			tumor_grade_filter: filters["tumor_grade"] || "",
			sample_type_filter: filters["sample_type"],
			acquisition_type_filter: filters["acquisition_type"],
			data_category_filter: filters["data_category"] || '',
			file_type_filter: filters["file_type"] || '',
			access_filter: filters["access"] || '',
			downloadable_filter: filters["downloadable"] || '',
			case_status_filter: filters["case_status"] || '',
			biospecimen_status_filter: filters["biospecimen_status"] || '',
			getAll: getAll
		},
		context: {
			method: 'POST'
		}
	})
	.valueChanges
	.pipe(
	map(result => { console.log(result.data); return result.data;})
	);
	}

	getFilteredClinicalDataPaginatedPostTest(offset: number, limit: number, sort: string, filters:any, getAll:any = false) {

	let filter_ethnicity = filters["ethnicity"];
	if (filter_ethnicity === "Empty value"){
		filter_ethnicity = "";
	}
	let filter_race = filters["race"];
	if (filter_race === "Empty value"){
		filter_race = "";
	}

	return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
		query: this.filteredCinicalDataPaginatedPostQuery,
		variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || "",
				project_name_filter: filters["project_name"] || "" ,
				study_name_filter: filters["study_name"] || "",
				disease_filter: filters["disease_type"]|| "",
				filterValue: filters["primary_site"] || "",
				analytical_frac_filter: filters["analytical_fraction"] || "",
				exp_type_filter: filters["experiment_type"] || "",
				ethnicity_filter: filter_ethnicity || "",
				race_filter: filter_race || "",
				gender_filter: filters["gender"] || "",
				tumor_grade_filter: filters["tumor_grade"] || "",
				sample_type_filter: filters["sample_type"],
				acquisition_type_filter: filters["acquisition_type"],
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				case_status_filter: filters["case_status"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || '',
			getAll: getAll
		},
		context: {
			method: 'POST'
		}
	})
	.valueChanges
	.pipe(
	map(result => { console.log(result.data); return result.data;})
	);
	}

}
