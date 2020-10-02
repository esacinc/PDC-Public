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
	
}