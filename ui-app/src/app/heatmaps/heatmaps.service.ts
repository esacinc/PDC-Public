import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { Observable ,  Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryHeatmapsData, HeatmapsFiltersData } from '../types';

//@@@PDC-3629 Develop the heatmap screen UI
/*This is a service class used for the API queries */
@Injectable()
export class HeatmapsService {

	headers: HttpHeaders;
	options: {};
	private notify = new Subject<any>();
	notifyObservable$ = this.notify.asObservable();

    constructor(private apollo: Apollo) {
		this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}

	heatmapsDataQuery = gql`
	  query FilterdHeatmapsQuery ($sort_value: String!, $primary_sites_filter: String!, $disease_type_filter: String!, $analytical_fractions_filter: String!) {
		uiHeatmapStudies ( sort: $sort_value, primary_site: $primary_sites_filter, disease_type: $disease_type_filter, analytical_fraction: $analytical_fractions_filter) {
			study_id
			study_submitter_id
			submitter_id_name
			pdc_study_id
			study_description
			program_name
			project_name
			analytical_fraction
			primary_site
			disease_type
			experiment_type
			embargo_date
			heatmapFiles
		}
	}`;


	getFilteredHeatmaps(sort: string, filters:any) {
		//by default if sort is not defined sort by PDC Study ID
		return this.apollo.watchQuery<QueryHeatmapsData>({
			query: this.heatmapsDataQuery,
			variables: {
				sort_value: sort || 'pdc_study_id desc',
				primary_sites_filter: filters["primary_site"] || '',
				disease_type_filter: filters["disease_type"] || '',
				analytical_fractions_filter: filters["analytical_fraction"] || ''
			}
		})
		.valueChanges
		.pipe(
			map(result => { console.log(result.data); return result.data;})
		);
	}

	getHeatmapsFilters(){
		return this.apollo.watchQuery<HeatmapsFiltersData>({
		query: gql`
			query allHeatmapsFilters{
				getUIHeatmapFilters {
				filterCount
				disease_types
				primary_sites
				analytical_fractions
			  }
		   } `
		  })
		  .valueChanges
		  .pipe(
			map(result => { console.log(result.data); return result.data;})
		  );
	}
}
