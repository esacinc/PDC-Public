import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Observable } from 'rxjs';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllStudiesData, QueryAllStudiesData, QueryAllFiltersData, SearchResultsGenesProteins  } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class GeneFiltersService {

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
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					num_raw
					num_mzml
					num_prot
					num_prot_assem
					num_psm
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

	geneStudyData = gql`
	query GeneStudyData($gene_name: String!){
		uiGeneStudySpectralCount(gene_name: $gene_name) {
			study_submitter_id
			submitter_id_name
		}
	}
	`;

	getStudyByGeneName(geneName: string) {
		return this.apollo.watchQuery({
			query: this.geneStudyData,
			variables:{
				gene_name: geneName
			}
		})
			.valueChanges
			.pipe(
				map(result => {
					return result.data;
				})
			);
	}

	//@@@PDC-616 Add acquisition type to the general filters
	//@@@PDC-10116 add new gene filters
	getAllFiltersData(){
		return this.apollo.watchQuery<QueryAllFiltersData>({
			query: gql`
				query FiltersData {
					uiFilters{
						project_name {
							filterName
							filterValue
						}
						primary_site {
							filterName
							filterValue
						}
						program_name {
							filterName
							filterValue
						}
						disease_type {
							filterName
							filterValue
						}
						analytical_fraction {
							filterName
							filterValue
						}
						experiment_type {
							filterName
							filterValue
						}
						acquisition_type {
							filterName
							filterValue
						}
						submitter_id_name {
							filterName
							filterValue
						}
						sample_type {
							filterName
							filterValue
						}
						ethnicity {
							filterName
							filterValue
						}
						race {
							filterName
							filterValue
						}
						gender {
							filterName
							filterValue
						}
						tumor_grade {
							filterName
							filterValue
						}
						vital_status {
							filterName
							filterValue
						}
						age_at_diagnosis {
							filterName
							filterValue
						}
						ajcc_clinical_stage {
							filterName
							filterValue
						}
						ajcc_pathologic_stage {
							filterName
							filterValue
						}
						morphology {
							filterName
							filterValue
						}
						site_of_resection_or_biopsy {
							filterName
							filterValue
						}
						progression_or_recurrence {
							filterName
							filterValue
						}
						therapeutic_agents {
							filterName
							filterValue
						}
						treatment_intent_type {
							filterName
							filterValue
						}
						treatment_outcome {
							filterName
							filterValue
						}
						treatment_type {
							filterName
							filterValue
						}
						alcohol_history {
							filterName
							filterValue
						}
						alcohol_intensity {
							filterName
							filterValue
						}
						tobacco_smoking_status {
							filterName
							filterValue
						}
						cigarettes_per_day {
							filterName
							filterValue
						}
					}
				}`,
				context: {
					method: 'POST'
				}
		})
		.valueChanges
		.pipe(
        map(result => {
				console.log(result.data);
		return result.data;})
      );
	}
	//@@@PDC-8588 add alias
	GeneQuery = gql`
			query GeneSearchQuery($gene_name: String!){
					geneSearch(name: $gene_name){
						genes {
							record_type
							name
							description
							alias
						}
					}
			}`;

	getGeneSearchResults(gene_param:any){
		return this.apollo.watchQuery<SearchResultsGenesProteins>({
			query: this.GeneQuery,
			variables: {
				gene_name: gene_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	filteredFiltersDataQuery = gql`
		query FiltersData($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $case_status_filter: String!){
			uiFilters(program_name: $program_name_filter , project_name: $project_name_filter,
									study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter,
									experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,
									sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter,  case_status: $case_status_filter) {
				project_name {
					filterName
					filterValue
				}
				primary_site {
					filterName
					filterValue
				}
				program_name {
					filterName
					filterValue
				}
				disease_type {
					filterName
					filterValue
				}
				analytical_fraction {
					filterName
					filterValue
				}
				experiment_type {
					filterName
					filterValue
				}
				acquisition_type {
					filterName
					filterValue
				}
				submitter_id_name {
					filterName
					filterValue
				}
				sample_type {
					filterName
					filterValue
				}
				ethnicity {
					filterName
					filterValue
				}
				race {
					filterName
					filterValue
				}
				gender {
					filterName
					filterValue
				}
				tumor_grade {
					filterName
					filterValue
				}
				data_category {
					filterName
					filterValue
				}
				case_status {
					filterName
					filterValue
				}
			}
		}
	`;

	getFilteredFiltersDataQuery(filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllFiltersData>({
			query: this.filteredFiltersDataQuery,
			variables: {
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
				case_status_filter: filters["case_status"] || ''
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
