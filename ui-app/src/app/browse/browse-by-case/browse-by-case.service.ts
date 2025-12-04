import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllCasesData, QueryAllCasesData, QueryAllCasesDataPaginated } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class BrowseByCaseService {

	headers: HttpHeaders;
	options: {};

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}
	//@@@PDC-192 - New API
	//@@@PDC-462 show submitter ids
	getAllData(){
		return this.apollo.watchQuery<QueryAllCasesData>({
			query: gql`
				query CasesData{
					uiCase {
					aliquot_submitter_id
					sample_submitter_id
					case_id
					case_submitter_id
					project_name
					program_name
					sample_type
					disease_type
					primary_site
				}
			}`
		})
		.valueChanges
		.pipe(
        map(result => {
				console.log(result.data);
		return result.data;})
      );
	}

	//@@@PDC-192 - adding filters
	//@@@PDC-462 show submitter ids
	filteredCasesQuery = gql`
				query FilteredCasesData($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!){
					uiCase(program_name: $program_name_filter , project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter) {
					aliquot_submitter_id
					sample_submitter_id
					case_id
					case_submitter_id
					project_name
					program_name
					sample_type
					disease_type
					primary_site
				}
			}`;

	//@@@PDC-192 - adding filters
	getFilteredCases(filters:any){
		console.log(filters);
		return this.apollo.watchQuery<QueryAllCasesData>({
			query: this.filteredCasesQuery,
			variables: {
				program_name_filter: filters["program_name"],
				project_name_filter: filters["project_name"],
				study_name_filter: filters["study_name"],
				disease_filter: filters["disease_type"],
				filterValue: filters["primary_site"],
				analytical_frac_filter: filters["analytical_fraction"],
				exp_type_filter: filters["experiment_type"]
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//@@@PDC-237 - Pagination
	//@@@PDC-462 show submitter ids
	//@@@PDC-497 Make table column headers sortable on the browse page tabs
	//@@@PDC-567 Add sample_type filter
	//@@@PDC-616 Add acquisition type to the general filters
	//@@@PDC-2399: Update biospecimen manifest generation to include new attributes
	//@@@PDC-4615 Sample and Exposure Deprecated Properties should be deleted from the Case Summary modal window

	filteredCasesPaginatedQuery = gql`
				query FilteredCasesDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!,  $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!, $treatment_type_filter: String!,  $alcohol_history_filter: String!, $alcohol_intensity_filter: String!,  $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!, $case_status_filter: String!, $getAll: Boolean!){
					getPaginatedUICase(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter ,
										project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter,
										primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter,
										ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter, tumor_grade: $tumor_grade_filter,data_category: $data_category_filter,  vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter, treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter, case_status: $case_status_filter, getAll: $getAll) {
						total
						uiCases{
							aliquot_id
							sample_id
							case_id
							aliquot_submitter_id
							aliquot_is_ref
							aliquot_status
							aliquot_quantity
							aliquot_volume
							amount
							analyte_type
							concentration
							case_status
							sample_status
							sample_submitter_id
							sample_is_ref
							biospecimen_anatomic_site
							biospecimen_laterality
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
							case_submitter_id
							program_name
							project_name
							sample_type
							disease_type
							primary_site
							tissue_collection_type
							sample_ordinal
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

	getFilteredCasesPaginated(offset: number, limit: number, sort: string, filters:any, getAll = false){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllCasesDataPaginated>({
			query: this.filteredCasesPaginatedQuery,
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
				vital_status_filter: filters["vital_status"] || '',
				age_at_diagnosis_filter: filters["age_at_diagnosis"] || '',
				ajcc_clinical_stage_filter: filters["ajcc_clinical_stage"] || '',
				ajcc_pathologic_stage_filter: filters["ajcc_pathologic_stage"] || '',
				morphology_filter: filters["morphology"] || '',
				site_of_resection_or_biopsy_filter: filters["site_of_resection_or_biopsy"] || '',
				progression_or_recurrence_filter: filters["progression_or_recurrence"] || '',
				therapeutic_agents_filter: filters["therapeutic_agents"] || '',
				treatment_intent_type_filter: filters["treatment_intent_type"] || '',
				treatment_outcome_filter: filters["treatment_outcome"] || '',
				treatment_type_filter: filters["treatment_type"] || '',
				alcohol_history_filter: filters["alcohol_history"] || '',
				alcohol_intensity_filter: filters["alcohol_intensity"] || '',
				tobacco_smoking_status_filter: filters["tobacco_smoking_status"] || '',
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || '',
				case_status_filter: filters["case_status"] || '',
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
