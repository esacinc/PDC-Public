import { Injectable } from '@angular/core';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { SearchResults, QueryAllCasesData, SearchResultsStudy, SearchResultsGenesProteins, SearchResultsProteins  } from '../types'; 

//@@@PDC-264 - added cases_count field to uiStudy query
//@@@PDC-440 - add description field to gene/protein search results
/*This is a service class used for the API queries */
@Injectable()
export class SearchService {

	headers: Headers;
	options: RequestOptions;

constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	searchCaseQuery = gql`
			query CaseSearchQuery($case_name: String!){
					caseSearch(name: $case_name){
						searchCases {
							record_type
							name
						}
					}
			}`;
	
	getCaseSearchResults(case_param:any){
		return this.apollo.watchQuery<SearchResults>({
			query: this.searchCaseQuery,
			variables: {
				case_name: case_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		); 
	}
	
	searchGeneQuery = gql`
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
			query: this.searchGeneQuery,
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

	//@@@PDC-438
	//@@@PDC-465
	searchProteinQuery = gql`
			query ProteinSearchQuery($protein_name: String!){
					proteinSearch(name: $protein_name){
						genesWithProtein  {
							record_type
							name
							description
							proteins
						}
					}
			}`;
	
	getProteinSearchResults(protein_param:any){
		return this.apollo.watchQuery<SearchResultsProteins>({
			query: this.searchProteinQuery,
			variables: {
				protein_name: protein_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		); 
	}
	
	searchStudyQuery = gql`
			query StudySearchQuery($study_name: String!){
					studySearch(name: $study_name){
						studies{
							record_type
							name
							submitter_id_name
						}
					}
			}`;
	
	getStudySearchResults(study_id:any){
		return this.apollo.watchQuery<SearchResultsStudy>({
			query: this.searchStudyQuery,
			variables: {
				study_name: study_id,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		); 
	}
	
}