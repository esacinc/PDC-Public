import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { SearchResults, QueryAllCasesData, SearchResultsStudy, SearchResultsGenesProteins, SearchResultsProteins, SearchbyStudyUUID, UUIDForStudy, SearchbyCaseUUID, UUIDForCase, AllCasesData, SearchCaseResults, SearchResultsForAliquot, ObjectSearched  } from '../types';

//@@@PDC-264 - added cases_count field to uiStudy query
//@@@PDC-440 - add description field to gene/protein search results
/*This is a service class used for the API queries */
@Injectable()
export class SearchService {

	headers: HttpHeaders;
	options: {};

constructor(private apollo: Apollo) {
	this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
	}

	searchCaseQuery = gql`
			query CaseSearchQuery($case_name: String!){
					caseSearch(name: $case_name){
						searchCases {
							record_type
							name
							case_id
						}
					}
			}`;

	getCaseSearchResults(case_param:any){
		return this.apollo.watchQuery<SearchCaseResults>({
			query: this.searchCaseQuery,
			variables: {
				case_name: case_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}
	//@@@PDC-7657 add ncbi_gene_id
	//@@@PDC-8588 add alias
	searchGeneQuery = gql`
			query GeneSearchQuery($gene_name: String!){
					geneSearch(name: $gene_name){
						genes {
							record_type
							name
							description
							gene_id
							ncbi_gene_id
							alias
						}
					}
			}`;

	getGeneSearchResults(gene_param:any){
		return this.apollo.watchQuery<SearchResultsGenesProteins>({
			query: this.searchGeneQuery,
			variables: {
				gene_name: gene_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	//@@@PDC-438
	//@@@PDC-465
	//@@@PDC-7657 add ncbi_gene_id and gene_id
	searchProteinQuery = gql`
			query ProteinSearchQuery($protein_name: String!){
					proteinSearch(name: $protein_name){
						genesWithProtein  {
							record_type
							name
							description
							gene_id
							ncbi_gene_id
							proteins
						}
					}
			}`;

	getProteinSearchResults(protein_param:any){
		return this.apollo.watchQuery<SearchResultsProteins>({
			query: this.searchProteinQuery,
			variables: {
				protein_name: protein_param,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	searchStudyQuery = gql`
			query StudySearchQuery($study_name: String!){
					studySearch(name: $study_name){
						studies{
							record_type
							name
							submitter_id_name
							study_id
							study_submitter_id
							pdc_study_id
						}
					}
			}`;

	getStudySearchResults(study_id:any){
		return this.apollo.watchQuery<SearchResultsStudy>({
			query: this.searchStudyQuery,
			variables: {
				study_name: study_id,
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	//@@@PDC-1875: Update search to be able to search by new PDC ID
	studySearchByPDCStudyIdQuery = gql`
	query StudySearchByPDCStudyIdQuery($pdc_study_id: String!){
		studySearchByPDCStudyId(pdc_study_id: $pdc_study_id){
			studies {
				record_type
				name
				submitter_id_name
				study_id
				study_submitter_id
				pdc_study_id
			}
		}
	}`;

	//@@@PDC-1875: Update search to be able to search by new PDC ID
	getStudySearchByPDCStudyId(pdc_study_id:any){
	return this.apollo.watchQuery<SearchResultsStudy>({
		query: this.studySearchByPDCStudyIdQuery,
		variables: {
			pdc_study_id: pdc_study_id,
		}
	})
	.valueChanges
	.pipe(
		map(result => {
			console.log(result.data);
			return result.data;})
	);
	}

	//@@@PDC-1931: Enable search based on the external references
	studySearchByExternalRefQuery = gql`
	query StudySearchByExternalRefQuery($reference_entity_alias: String!){
		studySearchByExternalId(reference_entity_alias: $reference_entity_alias){
			studies {
				record_type
				name
				submitter_id_name
				study_id
				study_submitter_id
				pdc_study_id
			}
		}
	}`;

	//@@@PDC-1931: Enable search based on the external references
	getStudySearchByExternalRef(reference_entity_alias:any){
	return this.apollo.watchQuery<SearchResultsStudy>({
		query: this.studySearchByExternalRefQuery,
		variables: {
			reference_entity_alias: reference_entity_alias,
		}
	})
	.valueChanges
	.pipe(
		map(result => {
			console.log(result.data);
			return result.data;})
	);
	}

	searchAliquotsQuery = gql`
	query AliquotSearchQuery($aliquot_submitter_id: String!){
		aliquotSearch(name: $aliquot_submitter_id){
			searchAliquots{
				aliquot_id
				aliquot_submitter_id
			}
		}
	}`;

	getAliquotSearchResults(aliquot_submitter_id:any){
	return this.apollo.watchQuery<SearchResultsForAliquot>({
		query: this.searchAliquotsQuery,
		variables: {
			aliquot_submitter_id: aliquot_submitter_id,
		}
	})
	.valueChanges
	.pipe(
		map(result => {
			console.log(result.data);
			return result.data;})
	);
	}

	searchStudyUUIDQuery = gql`
	query studyByUUIDQuery($study_id: String!, $study_submitter_id: String!, $source: String!){
		uiStudySummary(study_id: $study_id, study_submitter_id: $study_submitter_id, source: $source){
			study_submitter_id
			study_shortname
		}
	}`;

	getStudybyUUIDResults(study_id = '', study_submitter_id = ''){
		return this.apollo.watchQuery<SearchbyStudyUUID>({
			query: this.searchStudyUUIDQuery,
			variables: {
				study_id: study_id,
				study_submitter_id: study_submitter_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	//@@@PDC-1876: Allow deep linking to study summary page by PDC ID - add PDC ID
	fetchStudySubmitterIDQuery = gql`
	query studyByUUIDQuery($study_id: String!, $pdc_study_id: String!, $source: String!){
		uiStudySummary(study_id: $study_id, pdc_study_id: $pdc_study_id, source: $source){
			study_submitter_id
			study_name
			pdc_study_id
			study_id
		}
	}`;

	getStudySubmitterID(study_id:any, pdc_study_id: any){
		return this.apollo.watchQuery<UUIDForStudy>({
			query: this.fetchStudySubmitterIDQuery,
			variables: {
				study_id: study_id,
				pdc_study_id: pdc_study_id || '',
				source: "search"
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	searchCaseUUIDQuery = gql`
	query caseByUUIDQuery($case_id: String!, $source: String!){
		uiCaseSummary(case_id: $case_id, source: $source){
			case_submitter_id
			case_id
		}
	}`;

	getCaseUUIDResults(case_id:any){
		return this.apollo.watchQuery<SearchbyCaseUUID>({
			query: this.searchCaseUUIDQuery,
			variables: {
				case_id: case_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
			map(result => {
				console.log(result.data);
				return result.data;})
		);
	}

	caseSummaryData = gql`
	query CaseSummaryDataQuery($case_id: String!, $case_submitter_id: String!, $source: String!){
		uiCase (case_id: $case_id, case_submitter_id: $case_submitter_id, source: $source) {
			case_id
			case_submitter_id
			aliquot_id
			sample_id
			project_name
			program_name
			sample_type
			disease_type
			primary_site
			aliquot_submitter_id
			sample_submitter_id
		}
	}`;

	//@@@PDC-2956: issue with opening case summary via direct URL
	getCaseSummaryData(case_id:any, case_submitter_id:any){
		console.log(case_id + ", " + case_submitter_id);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.caseSummaryData,
			variables: {
				case_id: case_id,
				case_submitter_id: case_submitter_id || "",
				source: "search"
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

	searchSampleUUIDQuery = gql`
	query SampleDataQuery($sample_id: String!, $source: String!){
		uiSampleSummary (sample_id: $sample_id, source: $source) {
			case_submitter_id
			sample_submitter_id
			sample_id
		}
	}`;

	getSampleUUIDResults(sample_id:any){
		//console.log(case_submitter_id);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.searchSampleUUIDQuery,
			variables: {
				sample_id: sample_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

	searchSampleSubmitterIDQuery = gql`
	query SampleDataQuery($sample_submitter_id: String!, $source: String!){
		uiSampleSummary (sample_submitter_id: $sample_submitter_id, source: $source) {
			case_submitter_id
			sample_submitter_id
			sample_id
		}
	}`;

	getSampleSubmitterIDResults(sample_submitter_id: any){
		//console.log(case_submitter_id);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.searchSampleSubmitterIDQuery,
			variables: {
				sample_submitter_id: sample_submitter_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

	searchAliquotUUIDQuery = gql`
	query AliquotDataQuery($aliquot_id: String!, $source: String!){
		uiAliquotSummary (aliquot_id: $aliquot_id, source: $source) {
			case_submitter_id
			aliquot_submitter_id
			aliquot_id
		}
	}`;

	getAliquotUUIDResults(aliquot_id:any){
		//console.log(case_submitter_id);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.searchAliquotUUIDQuery,
			variables: {
				aliquot_id: aliquot_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

	searchAliquotSubmitterIDQuery = gql`
	query AliquotDataQuery($aliquot_submitter_id: String!, $source: String!){
		uiAliquotSummary (aliquot_submitter_id: $aliquot_submitter_id, source: $source) {
			case_submitter_id
			aliquot_submitter_id
			aliquot_id
		}
	}`;

	getAliquotSubmitterIDResults(aliquot_submitter_id:any){
		//console.log(case_submitter_id);
		return this.apollo.watchQuery<AllCasesData>({
			query: this.searchAliquotSubmitterIDQuery,
			variables: {
				aliquot_submitter_id: aliquot_submitter_id,
				source: "search"
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

	objectSearchedQuery = gql`
	query ObjectSearchedQuery($type: String!, $parameterType: String!, $parameterValue: String!){
		objectSearched (type: $type, parameterType: $parameterType, parameterValue: $parameterValue)
	}`;

	//@@@PDC-5778: UI call logging API for search statistics
	getObjectSearchedResults(type: any, parameterType: any, parameterValue: any){
		return this.apollo.watchQuery<ObjectSearched>({
			query: this.objectSearchedQuery,
			variables: {
				type: type,
				parameterType: parameterType,
				parameterValue: parameterValue
			}
		})
		.valueChanges
		.pipe(
		map(result => { console.log(result.data); return result.data;})
  		);
	}

}
