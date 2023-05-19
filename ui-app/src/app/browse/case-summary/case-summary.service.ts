import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { CaseData, QueryAllStudiesData, ExperimentFileByCaseCount, DataCategoryFileByCaseCount, AllCasesData, QueryAllStudyDataPaginated } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class CaseSummaryService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	//@@@PDC-1355: Use uuid as API search parameter
	caseSummaryData = gql`
		query CaseSummaryDataQuery($case_id: String!, $case_submitter_id: String!, $source: String!){
			uiCase (case_id: $case_id, case_submitter_id: $case_submitter_id, source: $source) {
				aliquot_id
				sample_id
				case_id
				project_name
				program_name
				sample_type
				disease_type
				primary_site
			}
		}`;

	getCaseSummaryData(case_id_value:any, case_submitter_id:any, source = ''){
		console.log(case_id_value);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.caseSummaryData,
			variables: {
				case_id: case_id_value,
				case_submitter_id: case_submitter_id,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

    //@@@PDC-1123 call ui wrapper API
	//@@@PDC-2535 Update UI with the changes to Diagnosis table columns
	//@@@PDC-2691 Add properties to Case Summary view
	//@@@PDC-3095 - remove external_case_id field from uiCaseSummary API
	//@@@PDC-4615 Sample and Exposure Deprecated Properties should be deleted from the Case Summary modal window
	caseDataDetailedQuery = gql`
				query FilteredStudiesData($case_id: String!, $source: String!){
					  uiCaseSummary(case_id: $case_id, source: $source) {
						  case_id
						  case_submitter_id
						  project_submitter_id
						  disease_type
						  tissue_source_site_code
						  days_to_lost_to_followup
						  index_date
						  lost_to_followup
						  primary_site
							demographics {
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
							samples{
								sample_id
								gdc_sample_id
								gdc_project_id
								sample_submitter_id
								sample_type
								status
								pool
								sample_is_ref
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
								annotation
								aliquots{
									aliquot_id
									aliquot_submitter_id
									aliquot_quantity
									aliquot_volume
									status
									pool
									aliquot_is_ref
									amount
									analyte_type
									concentration
								}

							}
						}
					}`;
	getDetailedCaseSummaryData(case_id_value:any, source = ''){
		console.log(case_id_value);
		return this.apollo.watchQuery<CaseData>({
			query: this.caseDataDetailedQuery,
			variables: {
				case_id: case_id_value,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	caseAdditionalDataDetailedQuery = gql`
	query FilteredStudiesData($case_id: String!, $source: String!){
		  uiCaseSummary(case_id: $case_id, source: $source) {
			  case_id
			  case_submitter_id
			  project_submitter_id
			  disease_type
			  tissue_source_site_code
			  days_to_lost_to_followup
			  index_date
			  lost_to_followup
			  primary_site
			  exposures {
				age_at_onset
				alcohol_days_per_week
				alcohol_drinks_per_day
				alcohol_history
				alcohol_intensity
				alcohol_type
				asbestos_exposure
				cigarettes_per_day
				coal_dust_exposure
				environmental_tobacco_smoke_exposure
				exposure_id
				exposure_submitter_id
				exposure_duration
				exposure_duration_years
				exposure_type
				marijuana_use_per_week
				pack_years_smoked
				parent_with_radiation_exposure
				radon_exposure
				respirable_crystalline_silica_exposure
				secondhand_smoke_as_child
				smokeless_tobacco_quit_age
				smoking_frequency
				time_between_waking_and_first_smoke
				tobacco_smoking_onset_year
				tobacco_smoking_quit_year
				tobacco_smoking_status
				tobacco_use_per_day
				type_of_smoke_exposure
				type_of_tobacco_used
				years_smoked
			  }
			  follow_ups {
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
				follow_up_id
				follow_up_submitter_id
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
		}`;

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	//Call the same API twice to fix "URI too long" error
	getAdditionalDetailedCaseSummaryData(case_id_value:any, source = ''){
		console.log(case_id_value);
		return this.apollo.watchQuery<CaseData>({
		query: this.caseAdditionalDataDetailedQuery,
		variables: {
			case_id: case_id_value,
			source: source
		}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		);
	}

	diagnosisDataDetailedQuery = gql`
	query FilteredStudiesData($case_id: String!, $source: String!){
		  uiCaseSummary(case_id: $case_id, source: $source) {
			  case_id
			  case_submitter_id
			  project_submitter_id
			  disease_type
			  tissue_source_site_code
			  days_to_lost_to_followup
			  index_date
			  lost_to_followup
			  primary_site
			  diagnoses{
					age_at_diagnosis
					morphology
					primary_diagnosis
					tumor_grade
					tumor_stage
					tissue_or_organ_of_origin
					diagnosis_submitter_id
					classification_of_tumor
					days_to_last_follow_up
					days_to_last_known_disease_status
					days_to_recurrence
					last_known_disease_status
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
					diagnosis_uuid
				}
			}
		}`;

	getDiagnosisCaseSummaryData(case_id_value:any, source = ''){
		console.log(case_id_value);
		return this.apollo.watchQuery<CaseData>({
		query: this.diagnosisDataDetailedQuery,
		variables: {
			case_id: case_id_value,
			source: source
		}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		);
	}

	exprimentFileByCaseCountQuery = gql`
				query ExperimentFileByCaseCountQuery($case_id_filter: String, $source: String!){
				  uiExperimentFileCount(case_id: $case_id_filter, source: $source) {
					acquisition_type
					submitter_id_name
					experiment_type
					files_count
				}
			}`;

	getExprimentFileByCaseCountData(filters:any, source = ''){
		return this.apollo.watchQuery<ExperimentFileByCaseCount>({
			query: this.exprimentFileByCaseCountQuery,
			variables: {
				case_id_filter: filters,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	dataCategoryFileByCaseCountQuery = gql`
				query DataCategoryFileByCaseCountQuery($case_id_filter: String, $source: String!){
				  uiDataCategoryFileCount (case_id: $case_id_filter, source: $source) {
					file_type
					submitter_id_name
					data_category
					files_count
				}
			}`;

	getDataCategoryFileByCaseCountData(filters:any, source = ''){
		return this.apollo.watchQuery<DataCategoryFileByCaseCount>({
			query: this.dataCategoryFileByCaseCountQuery,
			variables: {
				case_id_filter: filters,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-1042: Enable links to studies and files from case summary page
	//@@@PDC-2436 - Update study summary screen to add contact details
	//Query to return study sumamry details for a Study Name
	filteredStudiesDataPaginatedQuery = gql`
	query FilteredStudiesDataPaginated($study_name_filter: String!, $source: String!){
			getPaginatedUIStudy(study_name: $study_name_filter, source: $source) {
			total
			uiStudies {
				study_id
				pdc_study_id
				submitter_id_name
				study_description
				study_submitter_id
				program_name
				project_name
				disease_type
				primary_site
				analytical_fraction
				experiment_type
				embargo_date
				cases_count
				aliquots_count
				filesCount {
					file_type
					data_category
					files_count
				}
				supplementaryFilesCount {
					data_category
					file_type
					files_count
				}
				nonSupplementaryFilesCount {
					data_category
					file_type
					files_count
				}
				contacts {
					name
					institution
					email
					url
				}
				versions {
							number
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

	//@@@PDC-1042: Enable links to studies and files from case summary page
	//Returns study sumamry details for a Study Name
	getFilteredStudyDetailsForSummaryPage(studyName:any, source = ''){
		return this.apollo.watchQuery<QueryAllStudyDataPaginated>({
			query: this.filteredStudiesDataPaginatedQuery,
			variables: {
				study_name_filter: studyName,
				source: source
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		);
	}

	//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
	//@@@PDC-6543: external ref case summary
	caseDataDetailedPostQuery = gql`
	query FilteredStudiesData($case_id: String!, $source: String!){
		  uiCaseSummary(case_id: $case_id, source: $source) {
			  case_id
			  case_submitter_id
			  project_submitter_id
			  disease_type
			  tissue_source_site_code
			  days_to_lost_to_followup
			  index_date
			  lost_to_followup
			  primary_site
				externalReferences {
					reference_resource_shortname
					reference_entity_location
					reference_resource_name
					external_reference_id
				}
				demographics {
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
				diagnoses{
					samples {
						sample_id
						 sample_submitter_id
						 annotation
					}
					age_at_diagnosis
					morphology
					primary_diagnosis
					tumor_grade
					tumor_stage
					tissue_or_organ_of_origin
					diagnosis_submitter_id
					classification_of_tumor
					days_to_last_follow_up
					days_to_last_known_disease_status
					days_to_recurrence
					last_known_disease_status
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
					diagnosis_uuid
				}
				samples{
					sample_id
					gdc_sample_id
					gdc_project_id
					sample_submitter_id
					sample_type
					status
					pool
					sample_is_ref
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
					annotation
					aliquots{
						aliquot_id
						aliquot_submitter_id
						aliquot_quantity
						aliquot_volume
						status
						pool
						aliquot_is_ref
						amount
						analyte_type
						concentration
					}
					diagnoses {
						diagnosis_id
						diagnosis_submitter_id
					}
				}
				exposures {
					age_at_onset
					alcohol_days_per_week
					alcohol_drinks_per_day
					alcohol_history
					alcohol_intensity
					alcohol_type
					asbestos_exposure
					cigarettes_per_day
					coal_dust_exposure
					environmental_tobacco_smoke_exposure
					exposure_id
					exposure_submitter_id
					exposure_duration
					exposure_duration_years
					exposure_type
					marijuana_use_per_week
					pack_years_smoked
					parent_with_radiation_exposure
					radon_exposure
					respirable_crystalline_silica_exposure
					secondhand_smoke_as_child
					smokeless_tobacco_quit_age
					smoking_frequency
					time_between_waking_and_first_smoke
					tobacco_smoking_onset_year
					tobacco_smoking_quit_year
					tobacco_smoking_status
					tobacco_use_per_day
					type_of_smoke_exposure
					type_of_tobacco_used
					years_smoked
				  }
				  follow_ups {
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
					follow_up_id
					follow_up_submitter_id
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
		}`;

//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
getDetailedCaseSummaryDataPost(case_id_value:any, source = ''){
	console.log(case_id_value);
	return this.apollo.watchQuery<CaseData>({
		query: this.caseDataDetailedPostQuery,
		variables: {
			case_id: case_id_value,
			source: source
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
