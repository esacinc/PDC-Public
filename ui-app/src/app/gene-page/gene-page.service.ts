import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';

import { Subject }    from 'rxjs/Subject';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { GeneProteinData, GeneStudySpectralCountData, GeneAliquotSpectralCountData, 
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmDataPaginated } from '../types';

/*This is a service class used for the API queries */ 

@Injectable()
export class GenePageService { 

	headers: Headers;
	options: RequestOptions;
	
	private notify = new Subject<any>();
	notifyObservable$ = this.notify.asObservable();

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	proteinDetailsQuery = gql`
				query ProteinQuery($protein_name: String!){
					protein(protein: $protein_name){
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


	geneDetailsQuery = gql`
				query ProteinQuery($gene_name: String!){
					geneSpectralCount(gene_name: $gene_name){
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
								  study_submitter_id
						  plex
						  spectral_count
						  distinct_peptide
						  unshared_peptide
					  }
					}
				}`;
	
	getGeneDetails(gene:any){
		return this.apollo.watchQuery<GeneProteinData>({
			query: this.geneDetailsQuery,
			variables: {
				gene_name: gene
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	// Updated query for @@@PDC-557: Add the protein abundance data to the Gene Summary screen
	//@@@PDC-669 gene_abundance table change
	geneAliquotSpectralCountQuery = gql`
				query aliquotSpectralCountQuery($gene_name:String!, $offset_param: Int, $limit_param: Int, $program_name_filter: String!, 
											$project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
											$analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!,
											$gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!){
					getPaginatedUIGeneAliquotSpectralCountFiltered(gene_name: $gene_name, offset: $offset_param, limit: $limit_param, program_name: $program_name_filter , 
										project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, 
										analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, 
										gender: $gender_filter, tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter){
						total
						uiGeneAliquotSpectralCounts {
							aliquot_id 
							plex
							label
							submitter_id_name 
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
				
	
	getAliquotSpectralCount(gene:any, offset:number, limit:number, sort: string, filters: any){
		return this.apollo.watchQuery<GeneAliquotSpectralCountDataPaginated>({
			query: this.geneAliquotSpectralCountQuery,
			variables: {
				gene_name: gene,
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
				acquisition_type_filter: filters["acquisition_type"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	
	geneStudySpectralCountQuery = gql`
		query studySpectralCountQuery($gene_name:String!, $offset_param: Int, $limit_param: Int, $program_name_filter: String!, 
											$project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!,
											$analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!,
											$gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!){
			getPaginatedUIGeneStudySpectralCountFiltered(gene_name: $gene_name, offset: $offset_param, limit: $limit_param, program_name: $program_name_filter , 
										project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, 
										analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, 
										gender: $gender_filter, tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter){
				total
				uiGeneStudySpectralCounts {
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
		
	getStudySpectralCount(gene:any, offset:number, limit:number, sort: string, filters: any){
		console.log(filters);
		return this.apollo.watchQuery<GeneStudySpectralCountDataPaginated>({
			query: this.geneStudySpectralCountQuery,
			variables: {
				gene_name: gene,
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
				acquisition_type_filter: filters["acquisition_type"] || ''
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	//PDC-716 Add PTM data
	genePTMDataQuery = gql`
		query PTMDataByGeneQuery($gene_name:String!, $offset_param: Int, $limit_param: Int){
			getPaginatedUIPtm(gene_name: $gene_name offset: $offset_param limit: $limit_param){
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
		
	getGenePTMData(gene:any, offset:number, limit:number){
		return this.apollo.watchQuery<ptmDataPaginated>({
			query: this.genePTMDataQuery,
			variables: {
				gene_name: gene,
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