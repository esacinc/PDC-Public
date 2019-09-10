import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Observable } from 'rxjs';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllStudiesData, QueryAllStudiesData, QueryAllFiltersData, SearchResultsGenesProteins  } from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class GeneFiltersService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {	
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
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
						data_category {
							filterName
							filterValue
						}
						file_type {
							filterName
							filterValue
						}
						access {
							filterName
							filterValue
						}
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
	
	GeneQuery = gql`
			query GeneSearchQuery($gene_name: String!){
					geneSearch(name: $gene_name){
						genes {
							record_type
							name
							description
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
	
    private extractData(res: Response){
	    console.log('extract data');
	    console.log(res);
	    let body = res.json();
	    return body || {};
    }
  
    private handleError(error: any): Promise<any> {
	    console.error('An error occured', error);
	    return Promise.reject(error.message || error);
    }
}