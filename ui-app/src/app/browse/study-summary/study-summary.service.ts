import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program, QueryPrograms, Project, 
		QueryCases, Case, DiseaseType, DiseaseTypeQuery, AllStudiesData, QueryAllStudiesData, WorkflowMetadata, ProtocolData,
		PublicationData, QueryPublicationData, FilesCountsPerStudyData, QueryAllClinicalDataPaginated, QueryAllCasesDataPaginated, QueryStudyExperimentalDesign, QueryBiospecimenPerStudy, EntityReferencePerStudy } from '../../types';

/*This is a service class used for the API queries */

//@@@PDC-674 - UI changes to accomodate new protocol structure
//@@@PDC-758: Study summary overlay window opened through search is missing data
//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1219: Add a new experimental design tab on the study summary page
//@@@PDC-1355: Use uuid as API search parameter
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
	//@@@PDC-1883: Add external references to study summary page
	getFilteredStudyData(study_name = '', pdc_study_id = ''){
		return this.apollo.watchQuery<QueryAllStudiesData>({
			query: this.filteredStudyDataQuery,
			variables: {
				study_name: study_name,
				pdc_study_id: pdc_study_id
			}
		})
		.valueChanges
		.pipe(
        map(result => { console.log(result.data); return result.data;})
      ); 
	}
		
	//@@@PDC-758: Study summary overlay window opened through search is missing data
	//Query to fetch study summary details from a new API.
	//@@@PDC-1358  add study uuid	
	//@@@PDC-1883: Add external references to study summary page
	filteredStudyDataQuery = gql`
		query paginatedUIStudyQuery($study_name: String!, $pdc_study_id: String!){
			getPaginatedUIStudy(study_name: $study_name, pdc_study_id: $pdc_study_id) {
				total
				uiStudies {
					study_id
					pdc_study_id
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
					supplementaryFilesCount {
						data_category
						file_type
						files_count
					}
					nonSupplementaryFilesCount {
						data_category
						file_type
						files_count
					}
					contacts {
						name
						institution
						email
						url
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
	
	//@@@PDC-1123 call ui wrapper API
	workflowMetadataQuery = gql`
					query WorkflowMetadataQery($study_id: String!){
						uiWorkflowMetadata(study_id: $study_id) {
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
		  uiProtocol (study_id: $study_id ){
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
			fractions_analyzed_count
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
							uiPublication (study_id: $study_id ){
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
	
    //@@@PDC-1123 call ui wrapper API
	filesCountPerStudyQuery = gql`
						query FilesCountsQuery($study_id: String!){
							uiFilesCountPerStudy (study_id: $study_id ){
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

	//@@@PDC-1160: Add cases and aliquots to the study summary page
	//@@@PDC-1305 add age_at_diagnosis et al 	
	filteredCinicalDataPaginatedQuery = gql`
	query FilteredClinicalDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!, $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $case_status_filter: String!, $biospecimen_status_filter: String!){
		getPaginatedUIClinical(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , project_name: $project_name_filter, 
								study_name: $study_name_filter, disease_type: $disease_filter, primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, 
								experiment_type: $exp_type_filter, ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, 
								tumor_grade: $tumor_grade_filter, sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, case_status: $case_status_filter, biospecimen_status: $biospecimen_status_filter) {
			total
			uiClinical{
				case_submitter_id
				external_case_id
				ethnicity
				gender
				race
				morphology
				primary_diagnosis
				site_of_resection_or_biopsy
				tissue_or_organ_of_origin
				tumor_grade
				tumor_stage
				age_at_diagnosis
				classification_of_tumor
				days_to_recurrence				
				case_id
				disease_type
				primary_site
				program_name
				project_name
				status
				externalReferences {
					reference_resource_shortname
					reference_entity_location
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
	
	getFilteredClinicalDataPaginated(offset: number, limit:number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
		filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
		filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllClinicalDataPaginated>({
		query: this.filteredCinicalDataPaginatedQuery,
		variables: {
			offset_value: offset,
			limit_value: limit,
			sort_value: sort,
			program_name_filter: filters["program_name"] || "",
			project_name_filter: filters["project_name"] || "" ,
			study_name_filter: filters["study_name"] || "",
			disease_filter: filters["disease_type"]|| "",
			filterValue: filters["primary_site"] || "",
			analytical_frac_filter: filters["analytical_fraction"] || "",
			exp_type_filter: filters["experiment_type"] || "",
			ethnicity_filter: filter_ethnicity || "",
			race_filter: filter_race || "",
			gender_filter: filters["gender"] || "",
			tumor_grade_filter: filters["tumor_grade"] || "",
			sample_type_filter: filters["sample_type"],
			acquisition_type_filter: filters["acquisition_type"],
			data_category_filter: filters["data_category"] || '',
			file_type_filter: filters["file_type"] || '',
			access_filter: filters["access"] || '',
			downloadable_filter: filters["downloadable"] || '',
			case_status_filter: filters["case_status"] || '',
			biospecimen_status_filter: filters["biospecimen_status"] || ''
		}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		); 
	}

	//@@@PDC-1160: Add cases and aliquots to the study summary page
	filteredCasesPaginatedQuery = gql`
	query FilteredCasesDataPaginated($offset_value: Int, $limit_value: Int, $sort_value: String, $program_name_filter: String!, $project_name_filter: String!, $study_name_filter: String!, $disease_filter: String!, $filterValue: String!, $analytical_frac_filter: String!, $exp_type_filter: String!,  $ethnicity_filter: String!, $race_filter: String!, $gender_filter: String!, $tumor_grade_filter: String!, $sample_type_filter: String!, $acquisition_type_filter: String!, $data_category_filter: String!, $file_type_filter: String!, $access_filter: String!, $downloadable_filter: String!, $biospecimen_status_filter: String!, $case_status_filter: String!){
		getPaginatedUICase(offset: $offset_value, limit: $limit_value, sort: $sort_value, program_name: $program_name_filter , 
							project_name: $project_name_filter, study_name: $study_name_filter, disease_type: $disease_filter,
							primary_site: $filterValue, analytical_fraction: $analytical_frac_filter, experiment_type: $exp_type_filter,
							ethnicity: $ethnicity_filter, race: $race_filter, gender: $gender_filter, tumor_grade: $tumor_grade_filter,
							sample_type: $sample_type_filter, acquisition_type: $acquisition_type_filter, data_category: $data_category_filter, file_type: $file_type_filter, access: $access_filter, downloadable: $downloadable_filter, biospecimen_status: $biospecimen_status_filter, case_status: $case_status_filter) {
			total					
			uiCases{
				aliquot_submitter_id 
				sample_submitter_id
				case_id
				case_submitter_id
				project_name
				program_name
				sample_type
				disease_type
				primary_site
				aliquot_status
				case_status
				sample_status
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

	getFilteredCasesPaginated(offset: number, limit: number, sort: string, filters:any){
		let filter_ethnicity = filters["ethnicity"];
		if (filter_ethnicity === "Empty value"){
		filter_ethnicity = "";
		}
		let filter_race = filters["race"];
		if (filter_race === "Empty value"){
		filter_race = "";
		}
		return this.apollo.watchQuery<QueryAllCasesDataPaginated>({
		query: this.filteredCasesPaginatedQuery,
		variables: {
			offset_value: offset,
			limit_value: limit,
			sort_value: sort,
			program_name_filter: filters["program_name"] || "",
			project_name_filter: filters["project_name"] || "" ,
			study_name_filter: filters["study_name"] || "",
			disease_filter: filters["disease_type"]|| "",
			filterValue: filters["primary_site"] || "",
			analytical_frac_filter: filters["analytical_fraction"] || "",
			exp_type_filter: filters["experiment_type"] || "",
			ethnicity_filter: filter_ethnicity || "",
			race_filter: filter_race || "",
			gender_filter: filters["gender"] || "",
			tumor_grade_filter: filters["tumor_grade"] || "",
			sample_type_filter: filters["sample_type"],
			acquisition_type_filter: filters["acquisition_type"],
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

	//@@@PDC-1219: Add a new experimental design tab on the study summary page
	//@@@PDC-3253 call api with acceptDUA
	studyExperimentalDesignQuery = gql`
	query StudyExperimentalDesign($study_id_value: String) {
		studyExperimentalDesign(study_id: $study_id_value, acceptDUA: true) {
			study_id 
			study_submitter_id    
			study_run_metadata_id
			study_run_metadata_submitter_id
			experiment_number
			experiment_type
			plex_dataset_name
			acquisition_type
			number_of_fractions
			analyte
			label_free
			itraq_113
			itraq_114
			itraq_115
			itraq_116
			itraq_117
			itraq_118
			itraq_119
			itraq_121
			tmt_126
			tmt_127n
			tmt_127c
			tmt_128n
			tmt_128c
			tmt_129n
			tmt_129c
			tmt_130c
			tmt_130n
			tmt_131
			tmt_131c
		}
	}`;

	getStudyExperimentalDesign(study_id:any){
		return this.apollo.watchQuery<QueryStudyExperimentalDesign>({
		query: this.studyExperimentalDesignQuery,
		variables: {
			study_id_value: study_id
		}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		); 
	}
	
	//@@@PDC-3253 call ui wrapper api
	biospecimenPerStudyQuery = gql`
	query BiospecimenPerStudy($study_id_value: String) {
		uiBiospecimenPerStudy(study_id: $study_id_value) {
			aliquot_id 
			sample_id
			case_id
			aliquot_submitter_id 
			sample_submitter_id
			case_submitter_id
			aliquot_is_ref
			aliquot_status
			case_status
			sample_status
			project_name
			sample_type
			disease_type
			primary_site
			pool
			taxon
		}
	}`;

	getBiospecimenPerStudy(study_id:any){
		return this.apollo.watchQuery<QueryBiospecimenPerStudy>({
		query: this.biospecimenPerStudyQuery,
		variables: {
			study_id_value: study_id
		}
		})
		.valueChanges
		.pipe(
		map(result => {console.log(result.data); return result.data;
		})
		); 
	}

	//@@@PDC-1883: Add external references to study summary page
	//@@@PDC-3253 call ui wrapper api
	entityReferenceQuery = gql`
	query EntityReferenceQueryData($entity_type_filter: String!, $entity_id_filter: String!, $reference_type_filter: String!){
		uiPdcEntityReference(entity_type: $entity_type_filter , entity_id: $entity_id_filter, reference_type: $reference_type_filter) {
			reference_id
			entity_type
			entity_id
			reference_type
			reference_entity_type
			reference_entity_alias
			reference_resource_name
			reference_resource_shortname
			reference_entity_location
			submitter_id_name
		}
	}`;

	//@@@PDC-1883: Add external references to study summary page
	getEntityReferenceData(entity_type, entity_id, reference_type){
		return this.apollo.watchQuery<EntityReferencePerStudy>({
		query: this.entityReferenceQuery,
		variables: {
			entity_type_filter: entity_type,
			entity_id_filter: entity_id,
			reference_type_filter: reference_type
		}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
		); 
	}
	
}