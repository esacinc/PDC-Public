import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllGeneData, QueryAllGeneDataPaginated, ptmDataPaginated } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class BrowseByGeneService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {	
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	filteredGenesDataPaginatedQuery = gql`
				query FilteredGenesDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $gene_names_filter: String!, $downloadable_filter: String!, $biospecimen_status_filter: String!, $case_status_filter: String!){
					getPaginatedUIGene(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter, 
											study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, 
											experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, 
											tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, gene_name: $gene_names_filter, downloadable: $downloadable_filter, biospecimen_status: $biospecimen_status_filter, case_status: $case_status_filter) {
						total
						uiGenes {
						  gene_name
						  chromosome
						  locus
						  num_study
						  proteins
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
				
	getFilteredGenesDataPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllGeneDataPaginated>({
			query: this.filteredGenesDataPaginatedQuery,
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
				acquisition_type_filter: filters["acquisition_type"] || "",
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				gene_names_filter: filters["gene_name"] || '',
				downloadable_filter: filters["downloadable"] || '',
                biospecimen_status_filter: filters['biospecimen_status'] || '',
                case_status_filter: filters['case_status'] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	genePTMDataQuery = gql`
		query PTMDataByGeneQuery($gene_name:String!, $offset_param: Int, $limit_param: Int){
			getPaginatedUIPtm(gene_name: $gene_name offset: $offset_param limit: $limit_param){
				total
				uiPtm {
					ptm_type 
					site
					peptide
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
		
	getGenePTMData(gene:any, offset:number, limit:number){
		return this.apollo.watchQuery<ptmDataPaginated>({
			query: this.genePTMDataQuery,
			variables: {
				gene_name: gene,
				offset_param: offset,
				limit_param: limit
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
}