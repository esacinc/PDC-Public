import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable ,  Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryDiseases, ExperimentTypeCount, AnalyticFractionCount } from '../types';

/*This is a service class used for the API queries */
//@@@PDC-616 Add acquisition type to the general filters
@Injectable()
export class BrowseService {

	headers: HttpHeaders;
	options: {};
	//@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
	private notify = new Subject<any>();
	notifyObservable$ = this.notify.asObservable();

	//@@@PDC-10026 apply new filters to browse page charts
	filteredDiseasesCountsQuery = gql`
				query ExperimentsTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!,
					$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!,
					$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!,
					$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!, $treatment_type_filter: String!, $alcohol_history_filter: String!, $alcohol_intensity_filter: String!, $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!, $case_status_filter: String!){
				uiExperimentPie(program_name: $program_name_filter , project_name: $project_name_filter, study_name: $study_name_filter,
					disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter,
					ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter,
					acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter, treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter, case_status: $case_status_filter) {
					disease_type
					cases_count
				}
			}`;

	filteredAnalyticFractionsQuery = gql`
		query AnalyticFractionTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!,
			$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!,
			$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!,
			$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!, $treatment_type_filter: String!, $alcohol_history_filter: String!, $alcohol_intensity_filter: String!, $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!, $case_status_filter: String!){
		uiAnalyticalFractionsCount(program_name: $program_name_filter , project_name: $project_name_filter,	study_name: $study_name_filter,
			disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter,
			ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter,
			acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter, treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter,  case_status: $case_status_filter) {
		analytical_fraction
		cases_count
		}
	}`;
	filteredExperimentsCountsQuery = gql`
		query ExperimentsTypes($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!,
			$disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!,
			$ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!,
			$sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!, $treatment_type_filter: String!, $alcohol_history_filter: String!, $alcohol_intensity_filter: String!, $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!, $case_status_filter: String!){
		uiExperimentBar(program_name: $program_name_filter , project_name: $project_name_filter,	study_name: $study_name_filter,
			disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter,
			ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,	sample_type: $sample_type_filter,
			acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter, treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter, case_status: $case_status_filter) {
				experiment_type
				cases_count
			}
		}`;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}

	//@@@PDC-221 - New API
	getDiseases() {
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
				vital_status_filter: filters["vital_status"] || '',
				age_at_diagnosis_filter: filters["age_at_diagnosis"] || '',
				ajcc_clinical_stage_filter: filters["ajcc_clinical_stage"] || '',
				ajcc_pathologic_stage_filter: filters["ajcc_pathologic_stage"] || '',
				morphology_filter: filters["morphology"] || '',
				site_of_resection_or_biopsy_filter: filters["site_of_resection_or_biopsy"] || '',
				progression_or_recurrence_filter: filters["progression_or_recurrence"] || '',
				therapeutic_agents_filter: filters["therapeutic_agents"] || '',
				treatment_intent_type_filter: filters["treatment_intent_type"] || '',
				treatment_outcome_filter: filters["treatment_outcome"] || '',
				treatment_type_filter: filters["treatment_type"] || '',
				alcohol_history_filter: filters["alcohol_history"] || '',
				alcohol_intensity_filter: filters["alcohol_intensity"] || '',
				tobacco_smoking_status_filter: filters["tobacco_smoking_status"] || '',
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || '',
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
				vital_status_filter: filters["vital_status"] || '',
				age_at_diagnosis_filter: filters["age_at_diagnosis"] || '',
				ajcc_clinical_stage_filter: filters["ajcc_clinical_stage"] || '',
				ajcc_pathologic_stage_filter: filters["ajcc_pathologic_stage"] || '',
				morphology_filter: filters["morphology"] || '',
				site_of_resection_or_biopsy_filter: filters["site_of_resection_or_biopsy"] || '',
				progression_or_recurrence_filter: filters["progression_or_recurrence"] || '',
				therapeutic_agents_filter: filters["therapeutic_agents"] || '',
				treatment_intent_type_filter: filters["treatment_intent_type"] || '',
				treatment_outcome_filter: filters["treatment_outcome"] || '',
				treatment_type_filter: filters["treatment_type"] || '',
				alcohol_history_filter: filters["alcohol_history"] || '',
				alcohol_intensity_filter: filters["alcohol_intensity"] || '',
				tobacco_smoking_status_filter: filters["tobacco_smoking_status"] || '',
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || '',
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
				vital_status_filter: filters["vital_status"] || '',
				age_at_diagnosis_filter: filters["age_at_diagnosis"] || '',
				ajcc_clinical_stage_filter: filters["ajcc_clinical_stage"] || '',
				ajcc_pathologic_stage_filter: filters["ajcc_pathologic_stage"] || '',
				morphology_filter: filters["morphology"] || '',
				site_of_resection_or_biopsy_filter: filters["site_of_resection_or_biopsy"] || '',
				progression_or_recurrence_filter: filters["progression_or_recurrence"] || '',
				therapeutic_agents_filter: filters["therapeutic_agents"] || '',
				treatment_intent_type_filter: filters["treatment_intent_type"] || '',
				treatment_outcome_filter: filters["treatment_outcome"] || '',
				treatment_type_filter: filters["treatment_type"] || '',
				alcohol_history_filter: filters["alcohol_history"] || '',
				alcohol_intensity_filter: filters["alcohol_intensity"] || '',
				tobacco_smoking_status_filter: filters["tobacco_smoking_status"] || '',
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || '',
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
