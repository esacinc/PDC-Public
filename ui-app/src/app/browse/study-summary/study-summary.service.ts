import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program, QueryPrograms, Project, 
		QueryCases, Case, DiseaseType, DiseaseTypeQuery, AllStudiesData, QueryAllStudiesData, WorkflowMetadata, ProtocolData,
		PublicationData, QueryPublicationData, FilesCountsPerStudyData } from '../../types';

/*This is a service class used for the API queries */

//@@@PDC-674 - UI changes to accomodate new protocol structure
//@@@PDC-758: Study summary overlay window opened through search is missing data
@Injectable()
export class StudySummaryService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}

	getAllData(){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: gql`
				query CasesData{
					uiStudy {
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					num_raw
					num_mzml
					num_prot
					num_prot_assem
					num_psm
					}
				}`
		})
		.valueChanges
		.pipe(
        map(result => {
				console.log(result.data);
		return result.data;})
      ); 
	}
	
	filteredStudiesQuery = gql`
				query FilteredStudiesData($program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!){
					uiStudy(program_name: $program_name_filter , project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter) {
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					num_raw
					num_mzml
					num_prot
					num_prot_assem
					num_psm
				}
			}`;
	
	getFilteredStudies(filters:any){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: this.filteredStudiesQuery,
			variables: {
				program_name_filter: filters["program_name"],
				project_name_filter: filters["project_name"],
				study_name_filter: filters["study_name"],
				disease_filter: filters["disease_type"],
				filterValue: filters["primary_site"],
				analytical_frac_filter: filters["analytical_fraction"],
				exp_type_filter: filters["experiment_type"]
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}

	//@@@PDC-758: Study summary overlay window opened through search is missing data
	//API call to fetch study summary details from a new API.
	getFilteredStudyData(filters:any){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: this.filteredStudyDataQuery,
			variables: {
				study_name_filter: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}

	//@@@PDC-758: Study summary overlay window opened through search is missing data
	//Query to fetch study summary details from a new API.
	filteredStudyDataQuery = gql`
		query paginatedUIStudyQuery($study_name_filter: String!){
			getPaginatedUIStudy(study_name: $study_name_filter) {
				total
				uiStudies {
					submitter_id_name
					study_description
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					embargo_date
					aliquots_count
					cases_count
					filesCount { 
						file_type 
						data_category 
						files_count 
					}
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
	
	workflowMetadataQuery = gql`
					query WorkflowMetadataQery($study_id: String!){
						workflowMetadata(study_submitter_id: $study_id) {
						  workflow_metadata_submitter_id
						  study_submitter_id
						  protocol_submitter_id
						  cptac_study_id
						  submitter_id_name
						  study_submitter_name
						  analytical_fraction
						  experiment_type
						  instrument
						  refseq_database_version
						  uniport_database_version
						  hgnc_version
						  raw_data_processing
						  raw_data_conversion
						  sequence_database_search
						  search_database_parameters
						  phosphosite_localization
						  ms1_data_analysis
						  psm_report_generation
						  cptac_dcc_mzidentml
						  mzidentml_refseq
						  mzidentml_uniprot
						  gene_to_prot
						  cptac_galaxy_workflows
						  cptac_galaxy_tools
						  cdap_reports
						  cptac_dcc_tools
						}
				}`;
	
	getWorkflowMetadata(filters:any){
		return this.apollo.watchQuery<WorkflowMetadata>({
			query: this.workflowMetadataQuery,
			variables: {
				study_id: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	//PDC-674 - UI changes to accomodate new protocol structure
	protocolQuery = gql` 
		query ProtocolQuery($study_id: String!){
		  uiProtocol (study_submitter_id: $study_id ){
			protocol_id
			protocol_submitter_id
			program_id
			program_submitter_id
			protocol_name
			protocol_date
			document_name
			quantitation_strategy
			experiment_type
			label_free_quantitation
			labeled_quantitation
			isobaric_labeling_reagent
			reporter_ion_ms_level
			starting_amount
			starting_amount_uom
			digestion_reagent
			alkylation_reagent
			enrichment_strategy
			enrichment
			chromatography_dimensions_count
			one_d_chromatography_type
			two_d_chromatography_type
			fractions_anatyzed_count
			column_type
			amount_on_column
			amount_on_column_uom
			column_length
			column_length_uom
			column_inner_diameter
			column_inner_diameter_uom
			particle_size
			particle_size_uom
			particle_type
			gradient_length
			gradient_length_uom
			instrument_make
			instrument_model
			dissociation_type
			ms1_resolution
			ms2_resolution
			dda_topn
			normalized_collision_energy
			acquistion_type
			dia_multiplexing
			dia_ims
			auxiliary_data
			cud_label
		}
	}`;
	
	getProtocolData(filters:any){
		return this.apollo.watchQuery<ProtocolData>({
			query: this.protocolQuery,
			variables: {
				study_id: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	publicationsQuery = gql`
						query PublicationsQuery($study_id: String!){
							uiPublication (study_submitter_id: $study_id ){
								publication_id
								pubmed_id
								title
							}
						}`;
						
	getPublicationsData(filters:any){
		return this.apollo.watchQuery<QueryPublicationData>({
			query: this.publicationsQuery,
			variables: {
				study_id: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
	
	filesCountPerStudyQuery = gql`
						query FilesCountsQuery($study_id: String!){
							filesCountPerStudy (study_submitter_id: $study_id ){
								study_submitter_id
								file_type
								files_count
								data_category 
							}
						}`;
	getFilesCounts(filters:any){
		return this.apollo.watchQuery<FilesCountsPerStudyData>({
			query: this.filesCountPerStudyQuery,
			variables: {
				study_id: filters
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
}