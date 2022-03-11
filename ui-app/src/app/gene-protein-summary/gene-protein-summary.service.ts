import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { GeneProteinData, GeneStudySpectralCountData, GeneAliquotSpectralCountData, 
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmDataPaginated } from '../types';

/*This is a service class used for the API queries */ 

@Injectable()
export class GeneProteinSummaryService { 

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
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
	geneDetailsQuery = gql`
				query ProteinQuery($gene_name: String!, $source: String!){
					uiGeneSpectralCount(gene_name: $gene_name, source: $source){
					  gene_name
					  ncbi_gene_id
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
	
	getGeneDetails(gene:any, source = ''){
		return this.apollo.watchQuery<GeneProteinData>({
			query: this.geneDetailsQuery,
			variables: {
				gene_name: gene,
				source: source
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
				query aliquotSpectralCountQuery($gene_name:String!, $offset_param: Int, $limit_param: Int, $source: String!){
					getPaginatedUIGeneAliquotSpectralCount(gene_name: $gene_name, offset: $offset_param, limit: $limit_param, source: $source){
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
				
	
	getAliquotSpectralCount(gene:any, offset:number, limit:number, source = ''){
		return this.apollo.watchQuery<GeneAliquotSpectralCountDataPaginated>({
			query: this.geneAliquotSpectralCountQuery,
			variables: {
				gene_name: gene,
				offset_param:offset,
				limit_param: limit,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	
	geneStudySpectralCountQuery = gql`
		query studySpectralCountQuery($gene_name:String!, $offset_param: Int, $limit_param: Int, $source: String!){
			getPaginatedUIGeneStudySpectralCount(gene_name: $gene_name, offset: $offset_param, limit: $limit_param, source: $source){
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
		
	getStudySpectralCount(gene:any, offset:number, limit:number, source = ''){
		return this.apollo.watchQuery<GeneStudySpectralCountDataPaginated>({
			query: this.geneStudySpectralCountQuery,
			variables: {
				gene_name: gene,
				offset_param:offset,
				limit_param: limit,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	//PDC-716 Add PTM data
	genePTMDataQuery = gql`
		query PTMDataByGeneQuery($gene_name:String!, $offset_param: Int, $limit_param: Int, $source: String!){
			getPaginatedUIPtm(gene_name: $gene_name offset: $offset_param limit: $limit_param, source: $source){
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
		
	getGenePTMData(gene:any, offset:number, limit:number, source = ''){
		return this.apollo.watchQuery<ptmDataPaginated>({
			query: this.genePTMDataQuery,
			variables: {
				gene_name: gene,
				offset_param: offset,
				limit_param: limit,
				source: source
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
}