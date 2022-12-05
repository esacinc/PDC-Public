import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable ,  Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

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
				query ExperimentsTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, 
					$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, 
					$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, 
					$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, 
					$access_filter: String!, $downloadable_filter: String!, $biospecimen_status_filter: String!, $case_status_filter: String!){
				uiExperimentPie(program_name: $program_name_filter , project_name: $project_name_filter,	study_name: $study_name_filter, 
					disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, 
					ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter, 
					acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, 
					downloadable: $downloadable_filter, biospecimen_status: $biospecimen_status_filter, case_status: $case_status_filter) {
					disease_type
					cases_count
				}
			}`;

	filteredAnalyticFractionsQuery = gql`
		query AnalyticFractionTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, 
			$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, 
			$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, 
			$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, 
			$access_filter: String!, $downloadable_filter: String!, $biospecimen_status_filter: String!, $case_status_filter: String!){
		uiAnalyticalFractionsCount(program_name: $program_name_filter , project_name: $project_name_filter,	study_name: $study_name_filter, 
			disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, 
			ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter, 
			acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, 
			downloadable: $downloadable_filter, biospecimen_status: $biospecimen_status_filter, case_status: $case_status_filter) {
		analytical_fraction
		cases_count
		}
	}`;
	filteredExperimentsCountsQuery = gql`
		query ExperimentsTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, 
			$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, 
			$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, 
			$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, 
			$access_filter: String!, $downloadable_filter: String!, $biospecimen_status_filter: String!, $case_status_filter: String!){
		uiExperimentBar(program_name: $program_name_filter , project_name: $project_name_filter,	study_name: $study_name_filter, 
			disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, 
			ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter, 
			acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, 
			downloadable: $downloadable_filter, biospecimen_status: $biospecimen_status_filter, case_status: $case_status_filter) {
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
	//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
	getFilteredDiseases(filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}		
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
				ethnicity_filter: filter_ethnicity,
				race_filter: filter_race,
				gender_filter: filters["gender"],
				tumor_grade_filter: filters["tumor_grade"],
				sample_type_filter: filters["sample_type"] ||'',
				acquisition_type_filter: filters["acquisition_type"] ||'',
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || '',
				case_status_filter: filters["case_status"] || ''
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
	
	//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
	getFilteredAnalyticFractionTypeCasesCount(filters: any) {
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}		
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
				ethnicity_filter: filter_ethnicity,
				race_filter: filter_race,
				gender_filter: filters["gender"],
				tumor_grade_filter: filters["tumor_grade"],
				sample_type_filter: filters["sample_type"] ||'',
				acquisition_type_filter: filters["acquisition_type"] ||'',
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || '',
				case_status_filter: filters["case_status"] || ''
			}
		})
		.valueChanges
		.pipe(map(result => result.data));
	}

	//@@@PDC-221 - New API
	//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
	getFilteredExperimentTypeCasesCount(filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
			filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
			filter_race = "";
		}		
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
				ethnicity_filter: filter_ethnicity,
				race_filter: filter_race,
				gender_filter: filters["gender"],
				tumor_grade_filter: filters["tumor_grade"],
				sample_type_filter: filters["sample_type"] ||'',
				acquisition_type_filter: filters["acquisition_type"] ||'',
				data_category_filter: filters["data_category"] || '',
				file_type_filter: filters["file_type"] || '',
				access_filter: filters["access"] || '',
				downloadable_filter: filters["downloadable"] || '',
				biospecimen_status_filter: filters["biospecimen_status"] || '',
				case_status_filter: filters["case_status"] || ''
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