import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Subject }    from 'rxjs/Subject';

import { QueryDiseases, ExperimentTypeCount, AnalyticFractionCount } from '../types';

/*This is a service class used for the API queries */
//@@@PDC-616 Add acquisition type to the general filters
@Injectable()
export class BrowseService {

	headers: Headers;
	options: RequestOptions;
	//@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
	private notify = new Subject<any>();
	notifyObservable$ = this.notify.asObservable();

	filteredDiseasesCountsQuery = gql`
				query ExperimentsTypes($program_name_filter: String!,
				$project_name_filter: String!, $study_name_filter: String!, 
				$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, 
				$exp_type_filter: String!, $acquisition_type_filter: String!){
					uiExperimentPie(program_name: $program_name_filter , project_name: $project_name_filter, 
					study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, 
					analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, acquisition_type: $acquisition_type_filter) {
					disease_type
					cases_count
				}
			}`;

	filteredAnalyticFractionsQuery = gql`
		query AnalyticFractionTypes($program_name_filter: String!, $project_name_filter: String!,
			$study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
			$analytical_frac_filter: String!, $exp_type_filter: String!, $acquisition_type_filter: String!){
		uiAnalyticalFractionsCount(program_name: $program_name_filter , project_name: $project_name_filter,
				study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue,
				analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, acquisition_type: $acquisition_type_filter) {
		analytical_fraction
		cases_count
		}
	}`;
	filteredExperimentsCountsQuery = gql`
		query ExperimentsTypes($program_name_filter: String!, $project_name_filter: String!,
		$study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
		$analytical_frac_filter: String!, $exp_type_filter: String!, $acquisition_type_filter: String!){
		uiExperimentBar(program_name: $program_name_filter , project_name: $project_name_filter,
			study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue,
			analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, acquisition_type: $acquisition_type_filter) {
				experiment_type
				cases_count
			}
		}`;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}
	
	//@@@PDC-221 - New API
	getDiseases(){
		return this.apollo.watchQuery<QueryDiseases>({
		query: gql`
			query allDiseases{
			 uiExperimentPie {
				disease_type
				cases_count	
			}
		   } `
		  })
		  .valueChanges
		  .pipe(
			map(result => result.data)
		  ); 
	}
	//@@@PDC-221 - New API
	
	//@@@PDC-221 - New API		
	getFilteredDiseases(filters:any){
		return this.apollo.watchQuery<QueryDiseases>({
			query: this.filteredDiseasesCountsQuery,
			variables: {
				program_name_filter: filters['program_name'],
				project_name_filter: filters['project_name'],
				study_name_filter: filters['study_name'],
				disease_filter: filters['disease_type'],
				filterValue: filters['primary_site'],
				analytical_frac_filter: filters['analytical_fraction'],
				exp_type_filter: filters['experiment_type'],
				acquisition_type_filter: filters["acquisition_type"]
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	//@@@PDC-221 - New API
	getExperimentTypeCasesCount(){
		return this.apollo.watchQuery<ExperimentTypeCount>({
			query: gql`
				query ExperimentsTypes{
					uiExperimentBar {
					experiment_type
					cases_count
				}
				}`
		})
		.valueChanges
		.pipe(map(result => result.data));
	}

	// @@PDC-266 New bar chart for browse page
	getAnalyticFractionTypeCasesCount() {
		return this.apollo.watchQuery<AnalyticFractionCount>({
			query: gql`
				query AnalyticFractionTypes{
					uiAnalyticalFractionsCount {
					analytical_fraction
					cases_count
				}
				}`
		})
		.valueChanges
		.pipe(map(result => result.data));
	}
	
	getFilteredAnalyticFractionTypeCasesCount(filters: any) {
		return this.apollo.watchQuery<AnalyticFractionCount>({
			query: this.filteredAnalyticFractionsQuery,
			variables: {
				program_name_filter: filters['program_name'],
				project_name_filter: filters['project_name'],
				study_name_filter: filters['study_name'],
				disease_filter: filters['disease_type'],
				filterValue: filters['primary_site'],
				analytical_frac_filter: filters['analytical_fraction'],
				exp_type_filter: filters['experiment_type'],
				acquisition_type_filter: filters["acquisition_type"]
			}
		})
		.valueChanges
		.pipe(map(result => result.data));
	}

	
    
	
	//@@@PDC-221 - New API
	getFilteredExperimentTypeCasesCount(filters:any){
		return this.apollo.watchQuery<ExperimentTypeCount>({
			query: this.filteredExperimentsCountsQuery,
			variables: {
				program_name_filter: filters['program_name'],
				project_name_filter: filters['project_name'],
				study_name_filter: filters['study_name'],
				disease_filter: filters['disease_type'],
				filterValue: filters['primary_site'],
				analytical_frac_filter: filters['analytical_fraction'],
				exp_type_filter: filters['experiment_type'],
				acquisition_type_filter: filters["acquisition_type"]
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}

	//@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
	public notifyChangeTabEvents(data: any) {
		if (data) {
		  this.notify.next(data);
		}
	}
}