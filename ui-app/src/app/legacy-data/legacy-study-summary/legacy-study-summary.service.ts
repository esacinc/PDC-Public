import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryLegacyStudies, QueryAllStudiesData, QueryPublicationData, FilesCountsPerStudyData,  EntityReferencePerStudy } from '../../types';

/*This is a service class used for the API queries */

//@@@PDC-674 - UI changes to accomodate new protocol structure
//@@@PDC-758: Study summary overlay window opened through search is missing data
//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1219: Add a new experimental design tab on the study summary page
//@@@PDC-1355: Use uuid as API search parameter
@Injectable()
export class LegacyStudySummaryService {

	headers: Headers;
	options: RequestOptions;

//constructor(private http: Http, private apollo: Apollo) {
constructor(private apollo: Apollo) {
	this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
	}
	
	//PDC-3860 Add related PDC studies to Legacy study summaries
	//PDC-3969 Update UI to make legacy studies filter by PDC id
	legacyStudyDataQuery = gql`
		query UILegacyStudyQuery($study_name: String!){
			uiLegacyStudies(pdc_study_id: $study_name) {
				study_id
				submitter_id_name
				study_submitter_id
				pdc_study_id
				study_description
				project_submitter_id
				analytical_fraction
				experiment_type
				embargo_date
				sort_order
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
				publications {
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
				}
			  }
	}`;

	getLegacyStudyData(study_name = ''){
		console.log("getLegacyStudyData - " + study_name);
		return this.apollo.watchQuery<QueryLegacyStudies>({
			query: this.legacyStudyDataQuery,
			variables: {
				study_name: study_name || ''
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

	entityReferenceLegacyDataQuery = gql`
	query LegacyDataEntityReferenceQueryData($entity_id_filter: String!, $reference_type_filter: String!){
		uiLegacyStudyReference(entity_id: $entity_id_filter, reference_type: $reference_type_filter) {
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

	//PDC-3860, PDC-3859 - add external references and related PDC studies to legacy study summary
	getEntityReferenceData(entity_id, reference_type){
		return this.apollo.watchQuery<EntityReferencePerStudy>({
		query: this.entityReferenceLegacyDataQuery,
		variables: {
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