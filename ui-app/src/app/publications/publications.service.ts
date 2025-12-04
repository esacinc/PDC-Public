import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable ,  Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryPublicationsData, publicationsFiltersData } from '../types';

export type PubmedIDSearchData = {
	pubmed_id: string;
	title: string;
}

/*This is a service class used for the API queries */
@Injectable()
export class PublicationsService {

	headers: HttpHeaders;
	options: {};
	private notify = new Subject<any>();
	notifyObservable$ = this.notify.asObservable();

    //constructor(private http: Http, private apollo: Apollo) {
    constructor(private apollo: Apollo) {
		this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}
	//@@@PDC-3646 - add program_name field for the program filter on publications page
	publicationsQuery = gql`
	  query FilterdPaginatedPublicationsQuery ($offset_value: Int, $limit_value: Int, $year_filter: String!, $disease_type_filter: String!, $program_filter: String!, $pubmedid_filter: String!) {
		getPaginatedUIPublication(offset: $offset_value, limit: $limit_value, year: $year_filter, disease_type: $disease_type_filter, program: $program_filter, pubmed_id: $pubmedid_filter) {
			total
			uiPublication {
				publication_id
				program_name
				pubmed_id
				doi
				author
				title
				journal
				journal_url
				year
				abstract
				citation
				studies {
					study_id
					pdc_study_id
					submitter_id_name
				}
				disease_types
				supplementary_data
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


	getFilteredPaginatedPublications (offset: number, limit: number, filters:any) {
		console.log(filters);
		return this.apollo.watchQuery<QueryPublicationsData>({
			query: this.publicationsQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				year_filter: filters["year"] || '',
				disease_type_filter: filters["disease_type"] || '',
				program_filter: filters["program"] || '',
				pubmedid_filter: filters["pubmed_id"] || ''
			}
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}

	getPublicationsFilters(){
		return this.apollo.watchQuery<publicationsFiltersData>({
		query: gql`
			query allPublicationsFilters{
				getUIPublicationFilters {
					disease_types
					years
					programs
				 }
		   } `
		  })
		  .valueChanges
		  .pipe(
			map(result => { console.log(result.data); return result.data;})
		  );
	}

	//@@@PDC-3698 update publication page to add a string field in the filters for pubmed ID
	pubmedSearchQuery = gql`
		query PubmedIDSearchQuery($search_term: String!){
		  getPaginatedUIPublication(pubmed_id: $search_term) {
			uiPublication {
			  pubmed_id
			  title
			}
		  }
		}`
	;

	//Helper function to return pubmed ids for autocomplete search by pubmed id
	getPubmedIDSearchResults(search_term_param: string){
		return this.apollo.watchQuery<PubmedIDSearchData>({
			query: this.pubmedSearchQuery,
			variables: {
				search_term: search_term_param
			}
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}

	/* public notifyChangeTabEvents(data: any) {
		if (data) {
		  this.notify.next(data);
		}
	}*/
}
