import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';

import { Subject ,  Observable }    from 'rxjs';

import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { GeneProteinData, GeneStudySpectralCountData, GeneAliquotSpectralCountData,
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmDataPaginated } from '../types';

/*This is a service class used for the API queries */

@Injectable()
export class GenePageService {

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

    //@@@PDC-1123 call ui wrapper API
	proteinDetailsQuery = gql`
				query ProteinQuery($protein_name: String!){
					uiProtein(protein: $protein_name){
					  gene_name
					  NCBI_gene_id
					  authority
					  description
					  organism
					  chromosome
					  locus
					  proteins
					  assays
					  spectral_counts {
						  project_submitter_id
						  plex
						  spectral_count
						  distinct_peptide
						  unshared_peptide
					  }
					}
				}`;

	getProteinDetails(protein:any){
		return this.apollo.watchQuery<GeneProteinData>({
			query: this.proteinDetailsQuery,
			variables: {
				protein_name: protein
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}


    //@@@PDC-1123 call ui wrapper API
	//@@@PDC-2450 gene/protein summary missing NCBI gene id
	//@@@PDC-7690 use gene_id to get gene info
	geneDetailsQuery = gql`
				query ProteinQuery($gene_name: String, $gene_id: String){
					uiGeneSpectralCount(gene_name: $gene_name, gene_id: $gene_id){
					  gene_id
					  gene_name
					  ncbi_gene_id
					  alias
					  authority
					  description
					  organism
					  chromosome
					  locus
					  proteins
					  assays
					  spectral_counts {
						  project_submitter_id
						  study_submitter_id
						  plex
						  spectral_count
						  distinct_peptide
						  unshared_peptide
					  }
					}
				}`;

	getGeneDetails(gene:any, uuid:any){
		return this.apollo.watchQuery<GeneProteinData>({
			query: this.geneDetailsQuery,
			variables: {
				gene_name: gene,
				gene_id: uuid
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}
	// Updated query for @@@PDC-557: Add the protein abundance data to the Gene Summary screen
	//@@@PDC-669 gene_abundance table change
	//@@@PDC-10116 add new gene filters
	geneAliquotSpectralCountQuery = gql`
				query aliquotSpectralCountQuery($gene_name:String, $gene_id:String, $offset_param: Int, $limit_param: Int, $program_name_filter: String!,
											$project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
											$analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!,
											$gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!,
											$vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!, $ajcc_pathologic_stage_filter: String!,
											$morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!, $progression_or_recurrence_filter: String!,
											$therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,  $treatment_outcome_filter: String!,
											$treatment_type_filter: String!,  $alcohol_history_filter: String!, $alcohol_intensity_filter: String!,
											$tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!) {
					getPaginatedUIGeneAliquotSpectralCountFiltered(gene_name: $gene_name, gene_id:  $gene_id, offset: $offset_param, limit: $limit_param, program_name: $program_name_filter ,
										project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue,
										analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter,
										gender: $gender_filter, tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter,
										vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter, ajcc_pathologic_stage: $ajcc_pathologic_stage_filter,
										morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter, progression_or_recurrence: $progression_or_recurrence_filter,
										therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter,
										treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter, alcohol_intensity: $alcohol_intensity_filter,
										tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter) {
						total
						uiGeneAliquotSpectralCounts {
							aliquot_id
							plex
							label
							submitter_id_name
							pdc_study_id
							experiment_type
							spectral_count
							distinct_peptide
							unshared_peptide
							precursor_area
							log2_ratio
							unshared_precursor_area
							unshared_log2_ratio
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


	getAliquotSpectralCount(gene:any, uuid:any, offset:number, limit:number, sort: string, filters: any){
		return this.apollo.watchQuery<GeneAliquotSpectralCountDataPaginated>({
			query: this.geneAliquotSpectralCountQuery,
			variables: {
				gene_name: gene,
				gene_id: uuid,
				offset_param:offset,
				limit_param: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || '',
				project_name_filter: filters["project_name"] || '',
				study_name_filter: filters["study_name"] || '',
				disease_filter: filters["disease_type"] || '',
				filterValue: filters["primary_site"] || '',
				analytical_frac_filter: filters["analytical_fraction"] || '',
				exp_type_filter: filters["experiment_type"] || '',
				ethnicity_filter: filters['ethnicity'] || '',
				race_filter: filters['race'] || '',
				gender_filter: filters["gender"] || '',
				tumor_grade_filter: filters["tumor_grade"] || '',
				sample_type_filter: filters["sample_type"]  || '',
				acquisition_type_filter: filters["acquisition_type"] || '',
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
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}


	geneStudySpectralCountQuery = gql`
		query studySpectralCountQuery(
		                  $gene_name:String, $gene_id:String, $offset_param: Int, $limit_param: Int, $program_name_filter: String!,
											$project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
											$analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!,
											$gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!,
											$vital_status_filter: String!, $age_at_diagnosis_filter: String!, $ajcc_clinical_stage_filter: String!,
											$ajcc_pathologic_stage_filter: String!, $morphology_filter: String!, $site_of_resection_or_biopsy_filter: String!,
											$progression_or_recurrence_filter: String!,  $therapeutic_agents_filter: String!, $treatment_intent_type_filter: String!,
											$treatment_outcome_filter: String!, $treatment_type_filter: String!,  $alcohol_history_filter: String!,
											$alcohol_intensity_filter: String!,  $tobacco_smoking_status_filter: String!, $cigarettes_per_day_filter: String!) {
			getPaginatedUIGeneStudySpectralCountFiltered(
			                gene_name: $gene_name, gene_id: $gene_id, offset: $offset_param, limit: $limit_param, program_name: $program_name_filter ,
										  project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue,
										  analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter,
										  gender: $gender_filter, tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter,
										  vital_status: $vital_status_filter, age_at_diagnosis: $age_at_diagnosis_filter, ajcc_clinical_stage: $ajcc_clinical_stage_filter,
										  ajcc_pathologic_stage: $ajcc_pathologic_stage_filter, morphology: $morphology_filter, site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter,
										  progression_or_recurrence: $progression_or_recurrence_filter, therapeutic_agents: $therapeutic_agents_filter, treatment_intent_type: $treatment_intent_type_filter,
										  treatment_type: $treatment_type_filter, treatment_outcome: $treatment_outcome_filter, alcohol_history: $alcohol_history_filter,
										  alcohol_intensity: $alcohol_intensity_filter, tobacco_smoking_status: $tobacco_smoking_status_filter, cigarettes_per_day: $cigarettes_per_day_filter){
				total
				uiGeneStudySpectralCounts {
					pdc_study_id
					submitter_id_name
					experiment_type
					spectral_count
					distinct_peptide
					unshared_peptide
					aliquots_count
					plexes_count
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

	getStudySpectralCount(gene:any, uuid:any, offset:number, limit:number, sort: string, filters: any){
		console.log(filters);
		return this.apollo.watchQuery<GeneStudySpectralCountDataPaginated>({
			query: this.geneStudySpectralCountQuery,
			variables: {
				gene_name: gene,
				gene_id: uuid,
				offset_param:offset,
				limit_param: limit,
				sort_value: sort,
				program_name_filter: filters["program_name"] || '',
				project_name_filter: filters["project_name"] || '',
				study_name_filter: filters["study_name"] || '',
				disease_filter: filters["disease_type"] || '',
				filterValue: filters["primary_site"] || '',
				analytical_frac_filter: filters["analytical_fraction"] || '',
				exp_type_filter: filters["experiment_type"] || '',
				ethnicity_filter: filters['ethnicity'] || '',
				race_filter: filters['race'] || '',
				gender_filter: filters["gender"] || '',
				tumor_grade_filter: filters["tumor_grade"] || '',
				sample_type_filter: filters["sample_type"]  || '',
				acquisition_type_filter: filters["acquisition_type"] || '',
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
				cigarettes_per_day_filter: filters["cigarettes_per_day"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      );
	}

	//PDC-716 Add PTM data
	genePTMDataQuery = gql`
		query PTMDataByGeneQuery($gene_name:String!, $gene_id:String, $offset_param: Int, $limit_param: Int){
			getPaginatedUIPtm(gene_name: $gene_name gene_id: $gene_id offset: $offset_param limit: $limit_param){
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

	getGenePTMData(gene:any, uuid:any, offset:number, limit:number){
		return this.apollo.watchQuery<ptmDataPaginated>({
			query: this.genePTMDataQuery,
			variables: {
				gene_name: gene,
				gene_id: uuid,
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
