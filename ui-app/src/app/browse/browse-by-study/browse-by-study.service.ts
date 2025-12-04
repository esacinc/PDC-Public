import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery, AllStudiesData, QueryAllStudiesData, QueryAllStudyDataPaginated } from '../../types';

//@@@PDC-264 - added cases_count field to uiStudy query

/*This is a service class used for the API queries */
@Injectable()
export class BrowseByStudyService {

	headers: HttpHeaders;
	options: {};

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}

	getAllData(){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: gql`
				query CasesData{
					uiStudy {
					study_submitter_id
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					cases_count
					aliquots_count
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

	filteredStudiesQuery = gql`
				query FilteredStudiesData($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!){
					uiStudy(program_name: $program_name_filter , project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter) {
					study_submitter_id
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					cases_count
					aliquots_count
				}
			}`;

	//@@@PDC-221 - New API
	getFilteredStudies(filters:any){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: this.filteredStudiesQuery,
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

	//@@@PDC-283 Adding pagination
	//@@@PDC-497 Make table column headers sortable on the browse page tabs
	//@@@PDC-567 add sample_type filter
	//@@@PDC-616 Add acquisition type to the general filters
	//@@@PDC-1358 add study_id (uuid) to study summary page
	//@@@PDC-2436 - Update study summary screen to add contact details
	filteredStudiesDataPaginatedQuery = gql`
			query FilteredStudiesDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!, $treatment_type_filter: String!, $alcohol_history_filter: String!, $alcohol_intensity_filter: String!, $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!, $case_status_filter: String!, $getAll: Boolean!){
					getPaginatedUIStudy(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter,
										study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
										experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,										sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter, treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter, data_category: $data_category_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter, case_status: $case_status_filter, getAll: $getAll) {
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
						has_genomic_data
						has_imaging_data
						has_lipidome_data
						has_metabolome_data
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

	//@@@PDC-535 adding clinical filters
	getFilteredStudiesPaginated(offset: number, limit: number, sort: string, filters:any, getAll = false){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		console.log("Study Name: "+ filters["study_name"]);

		return this.apollo.watchQuery<QueryAllStudyDataPaginated>({
			query: this.filteredStudiesDataPaginatedQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"],
				project_name_filter: filters["project_name"],
				study_name_filter: filters["study_name"],
				disease_filter: filters["disease_type"],
				filterValue: filters["primary_site"],
				analytical_frac_filter: filters["analytical_fraction"],
				exp_type_filter: filters["experiment_type"],
				ethnicity_filter: filter_ethnicity,
				race_filter: filter_race,
				gender_filter: filters["gender"],
				tumor_grade_filter: filters["tumor_grade"],
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
