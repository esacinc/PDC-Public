import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { SearchResultsStudy} from '../types'; 

//@@@PDC-3901: Develop backend study forwarding
/*This is a service class used for the API queries */
@Injectable()
export class ForwardingSearchService {

	headers: Headers;
	options: RequestOptions;

	constructor(private apollo: Apollo) {
		this.headers = new Headers({ 'Content-Type': 'application/json',
										'Accept': 'q=0.8;application/json;q=0.9' });
			this.options = new RequestOptions({ headers: this.headers });
	}

	//@@@PDC-3901: Develop backend study forwarding
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

	//@@@PDC-3901: Develop backend study forwarding
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
	
}