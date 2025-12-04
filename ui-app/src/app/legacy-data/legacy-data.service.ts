import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable ,  Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryLegacyStudies, publicationsFiltersData } from '../types';

/*This is a service class used for the API queries */
@Injectable()
export class LegacyDataService {

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

	publicationsQuery = gql`
	  query FilterdPaginatedPublicationsQuery ($offset_value: Int, $limit_value: Int, $year_filter: String!, $disease_type_filter: String!, $program_filter: String!) {
		getPaginatedUIPublication(offset: $offset_value, limit: $limit_value, year: $year_filter, disease_type: $disease_type_filter, program: $program_filter) {
			total
			uiPublication {
				publication_id
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


/*	getFilteredPaginatedPublications (offset: number, limit: number, filters:any) {
		return this.apollo.watchQuery<QueryPublicationsData>({
			query: this.publicationsQuery,
			variables: {
				offset_value: offset,
				limit_value: limit,
				year_filter: filters["year"] || '',
				disease_type_filter: filters["disease_type"] || '',
				program_filter: filters["program"] || ''
			}
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}*/

	getAllLegacyStudies(){
		return this.apollo.watchQuery<QueryLegacyStudies>({
		query: gql`
			query allLegacyStudies{
				uiLegacyStudies {
					study_id
					submitter_id_name
					study_submitter_id
					pdc_study_id
					study_description
					project_submitter_id
					analytical_fraction
					experiment_type
					sort_order
					embargo_date
					supplementaryFilesCount {
						data_category
						file_type
						files_count
					}
					nonSupplementaryFilesCount{
						data_category
						file_type
						files_count
					}
					publications {
						publication_id
						pubmed_id
						doi
						author
						title
						journal
						journal_url
						year
						abstract
						citation
					}
				}
		   } `
		  })
		  .valueChanges
		  .pipe(
			map(result => { console.log(result.data); return result.data;})
		  );
	}

}
