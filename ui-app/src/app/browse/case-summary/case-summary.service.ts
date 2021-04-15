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
		query CaseSummaryDataQuery($case_id: String!, $case_submitter_id: String!){
			uiCase (case_id: $case_id, case_submitter_id: $case_submitter_id) {
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

	getCaseSummaryData(case_id_value:any, case_submitter_id:any){
		console.log(case_id_value);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.caseSummaryData,
			variables: {
				case_id: case_id_value,
				case_submitter_id: case_submitter_id
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
	caseDataDetailedQuery = gql`
				query FilteredStudiesData($case_id: String!){
					  uiCaseSummary(case_id: $case_id) {
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
							}
							diagnoses{
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
								is_ffpe
								longest_dimension
								method_of_sample_procurement
								oct_embedded
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
	getDetailedCaseSummaryData(case_id_value:any){
		console.log(case_id_value);
		return this.apollo.watchQuery<CaseData>({
			query: this.caseDataDetailedQuery,
			variables: {
				case_id: case_id_value
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	exprimentFileByCaseCountQuery = gql`
				query ExperimentFileByCaseCountQuery($case_id_filter: String){
				  uiExperimentFileCount(case_id: $case_id_filter) {
					acquisition_type
					submitter_id_name
					experiment_type
					files_count
				}
			}`;
	
	getExprimentFileByCaseCountData(filters:any){
		return this.apollo.watchQuery<ExperimentFileByCaseCount>({
			query: this.exprimentFileByCaseCountQuery,
			variables: {
				case_id_filter: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	dataCategoryFileByCaseCountQuery = gql`
				query DataCategoryFileByCaseCountQuery($case_id_filter: String){
				  uiDataCategoryFileCount (case_id: $case_id_filter) {
					file_type
					submitter_id_name
					data_category
					files_count
				}
			}`;
	
	getDataCategoryFileByCaseCountData(filters:any){
		return this.apollo.watchQuery<DataCategoryFileByCaseCount>({
			query: this.dataCategoryFileByCaseCountQuery,
			variables: {
				case_id_filter: filters
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
	query FilteredStudiesDataPaginated($study_name_filter: String!){
			getPaginatedUIStudy(study_name: $study_name_filter) {
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
	getFilteredStudyDetailsForSummaryPage(studyName:any){
		return this.apollo.watchQuery<QueryAllStudyDataPaginated>({
			query: this.filteredStudiesDataPaginatedQuery,
			variables: {
				study_name_filter: studyName
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		); 
	}
}
