import { Injectable } from '@angular/core';
import {Response, Headers, RequestOptions} from '@angular/http';
import {HttpClient} from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
		QueryPrograms, QueryPortalStats, PortalStats, QueryAllCasesData, SunburstData, QuerySunburstData, HumanbodyImageData } from '../types';

const NEWS_FILE_NAME = 'assets/data-folder/news.json';
const RELEASE_FILE_NAME = 'assets/data-folder/release.json';

// @@@PDC-168 This service class provides Apollo client graphql queries for a summary view of the data that is in the PDC database.
@Injectable()
export class FrontPageService {

headers: Headers;
options: RequestOptions;
tissueSites: Observable<TissueSite[]>;
portalStats: Observable<PortalStats[]>;

private querySub: any;

constructor(private http: HttpClient, private apollo: Apollo) {

this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
this.options = new RequestOptions({ headers: this.headers });
}

// @@@PDC-363
getNewsItems() : Observable<any> {
	return this.http.get(NEWS_FILE_NAME);
}

// @@@PDC-5628 - release info json file
getReleaseItems() : Observable<any> {
	return this.http.get(RELEASE_FILE_NAME);
}

//@@@PDC-223
	getTissueSites() {
		return this.apollo.watchQuery<QueryTissueSites>({
		   query: gql`
			query allTissueSites{
				uiTissueSiteCaseCount {
					tissue_or_organ_of_origin
					cases_count
				}
			}`
		  })
		  .valueChanges
		  .pipe(
			map(result => result.data)
		  );
	}

// @@@PDC-210
getPortalStats() {
    //@@@PDC-1123 call ui wrapper API
	return this.apollo.watchQuery<QueryPortalStats>({
		query: gql`
	 query allStats{
		uiPdcDataStats{
    program,
    study,
    spectra,
    data_label,
    protein,
    project,
    peptide,
    data_size,
    data_label,
    data_file
  	}
	 }`
	}).valueChanges.pipe(map(result => result.data));
}

	getDiseases() {
    //@@@PDC-1123 call ui wrapper API
		return this.apollo.watchQuery<QueryDiseases>({
		   query: gql`
			query allDiseases{
			  uiDiseasesAvailable {
			  disease_type
			  tissue_or_organ_of_origin
			  project_submitter_id
			  cases_count
			}
		   } `
		  })
		  .valueChanges
		  .pipe(
			map(result => result.data.uiDiseasesAvailable)
		  );

	}

	getAllPrograms(){
		//@@@PDC-1123 call ui wrapper API
		return this.apollo.watchQuery<QueryPrograms>({
			query: gql`
				query Programs{
					 uiAllPrograms {
						program_submitter_id
						name
						sponsor
						start_date
						end_date
						program_manager
						projects {
						  project_submitter_id
						}
					  }
				}`
		})
		.valueChanges
		.pipe(
        map(result => result.data.uiAllPrograms)
      );
	}

	getSunburstChartData(){
		return this.apollo.watchQuery<QuerySunburstData>({
			query: gql`
				query sunburstChartData{
			    uiSunburstChart {
					project_submitter_id
					tissue_or_organ_of_origin
					disease_type
					sample_type
					cases_count
			    }
			}`
		})
		.valueChanges
		.pipe(
        map(result => result.data)
      );
	}

	getDataForHumanBody(){
		return this.apollo.watchQuery<HumanbodyImageData>({
			query: gql`
				query HumanBodyPrimarySiteData {
					uiPrimarySiteCaseCount{
					major_primary_site
					cases_count
					primarySites
				}
			} `
		})
		.valueChanges
		.pipe(
				map(result => result.data)
		);
	}
}
