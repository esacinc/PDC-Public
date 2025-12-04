import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
//import {Response, Headers, RequestOptions} from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';



import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
//import { Subject }    from 'rxjs/Subject';

import { QueryPublicationsData, publicationsFiltersData, PublicationsData } from '../types';
import {environment} from '../../environments/environment';

const SUPPLEMENTARY_DATA = 'assets/data-folder/pancancer-supplementary.json';
const ADDITIONAL_RESOURCES = 'assets/data-folder/pancancer-additional-resources.json';

export type PubmedIDSearchData = {
	pubmed_id: string;
	title: string;
}

@Injectable()
export class PancancerService {

  headers: HttpHeaders;
  options: {};
  //private notify = new Subject<any>();
  //notifyObservable$ = this.notify.asObservable();

  //constructor(private http: Http, private apollo: Apollo) {
  constructor(private apollo: Apollo, private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'q=0.8;application/json;q=0.9'
    });
    this.options = { headers: this.headers };
  }

	getPublicationsQuery = gql`
	query PubmedIDSearchQuery {
			getUIPancancerPublications {
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
				files {
					file_id
					file_name
					data_category
					description
					downloadable
					characterization
					cohorts
					related_publications
					related_studies
				}
				studies {
					study_id
					submitter_id_name
					pdc_study_id
				}
		}
	}`;

	getPublicationsResults() {
		return this.apollo.watchQuery<PublicationsData>({
			query: this.getPublicationsQuery
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}

	getPancancerFilesQuery = gql`
	query PancancerFilesQuery {
		getAllUIPancancerFiles {
			file_id
			file_name
			data_category
			description
			downloadable
			characterization
			cohorts
			related_publications
			related_studies
		}
	}`;

	//@@@PDC-6681: Update the Supplementary Information section to populate Pancancer files
	getPancancerFilesResults() {
		return this.apollo.watchQuery<PublicationsData>({
			query: this.getPancancerFilesQuery
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}

	getOpenFileUuidSignedUrl(uuid: string): Promise<any> {
		return this.http.get(environment.openfile_uuid_signedurl_url + uuid).toPromise();
	}
}
