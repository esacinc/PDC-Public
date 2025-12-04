import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllFilesData, QueryAllFilesData, QueryAllFilesDataPaginated } from '../../types';
import { environment } from '../../../environments/environment';


/*This is a service class used for the API queries */

@Injectable()
export class BrowseByFileService {
  headers: HttpHeaders;
  options: {};

  //constructor(private http: Http, private apollo: Apollo) {
  constructor(private apollo: Apollo, private http: HttpClient) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "q=0.8;application/json;q=0.9"
    });
    this.options = { headers: this.headers };
  }

  //@@@PDC-193 - New API
  getAllData() {
    return this.apollo
      .watchQuery<QueryAllFilesData>({
        query: gql`
          query FilesData {
            uiFile {
              submitter_id_name
              file_name
              study_run_metadata_submitter_id
              project_name
              file_type
              file_size
            }
          }
        `
      })
      .valueChanges.pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-193 - adding filters
  filteredFilesQuery = gql`
    query FilteredFilesData(
      $program_name_filter: String!
      $project_name_filter: String!
      $study_name_filter: String!
      $disease_filter: String!
      $filterValue: String!
      $analytical_frac_filter: String!
      $exp_type_filter: String!
    ) {
      uiFile(
        program_name: $program_name_filter
        project_name: $project_name_filter
        study_name: $study_name_filter
        disease_type: $disease_filter
        primary_site: $filterValue
        analytical_fraction: $analytical_frac_filter
        experiment_type: $exp_type_filter
      ) {
        submitter_id_name
        file_name
        study_run_metadata_submitter_id
        project_name
        file_type
        file_size
      }
    }
  `;

  //@@@PDC-193 - adding filters
  getFilteredFiles(filters: any) {
    console.log(filters);
    return this.apollo
      .watchQuery<QueryAllFilesData>({
        query: this.filteredFilesQuery,
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
      .valueChanges.pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-237
  //@@@PDC-497 Make table column headers sortable on the browse page tabs
  //@@@PDC-567 add sample_type filter
  //@@@PDC-616 Add acquisition type to the general filters
  //@@@PDC-2795 Add embargo date to Files tab on Browse page and files manifest
  //@@@PDC-3283 Show files for different versions of study
  filteredFilesPaginatedQuery = gql`
    query FilteredFilesDataPaginated(
	  $study_version_value: String!
      $offset_value: Int
      $limit_value: Int
      $sort_value: String
      $program_name_filter: String!
      $project_name_filter: String!
      $study_name_filter: String!
      $disease_filter: String!
      $filterValue: String!
      $analytical_frac_filter: String!
      $exp_type_filter: String!
      $ethnicity_filter: String!
      $race_filter: String!
      $gender_filter: String!
      $tumor_grade_filter: String!
      $sample_type_filter: String!
      $acquisition_type_filter: String!
      $data_category_filter: String!
	    $vital_status_filter: String!
	    $age_at_diagnosis_filter: String!
	    $ajcc_clinical_stage_filter: String!
	    $ajcc_pathologic_stage_filter: String!
	    $progression_or_recurrence_filter: String!
	    $therapeutic_agents_filter: String!
	    $treatment_intent_type_filter: String!
	    $treatment_outcome_filter: String!
	    $treatment_type_filter: String!
	    $alcohol_history_filter: String!
	    $alcohol_intensity_filter: String!
	    $tobacco_smoking_status_filter: String!
	    $cigarettes_per_day_filter: String!
	    $case_status_filter: String!
	    $file_type_filter: String!
    ) {
      getPaginatedUIFile(
	      study_version: $study_version_value
        offset: $offset_value
        limit: $limit_value
        sort: $sort_value
        program_name: $program_name_filter
        project_name: $project_name_filter
        study_name: $study_name_filter
        disease_type: $disease_filter
        primary_site: $filterValue
        analytical_fraction: $analytical_frac_filter
        experiment_type: $exp_type_filter
        ethnicity: $ethnicity_filter
        race: $race_filter
        gender: $gender_filter
        tumor_grade: $tumor_grade_filter
        sample_type: $sample_type_filter
        acquisition_type: $acquisition_type_filter
        data_category: $data_category_filter
		    vital_status: $vital_status_filter
		    age_at_diagnosis: $age_at_diagnosis_filter
		    ajcc_clinical_stage: $ajcc_clinical_stage_filter
		    ajcc_pathologic_stage: $ajcc_pathologic_stage_filter
		    progression_or_recurrence: $progression_or_recurrence_filter
		    therapeutic_agents: $therapeutic_agents_filter
		    treatment_intent_type: $treatment_intent_type_filter
		    treatment_type: $treatment_type_filter
		    treatment_outcome: $treatment_outcome_filter
		    alcohol_history: $alcohol_history_filter
		    alcohol_intensity: $alcohol_intensity_filter
		    tobacco_smoking_status: $tobacco_smoking_status_filter
		    cigarettes_per_day: $cigarettes_per_day_filter
        case_status: $case_status_filter
        file_type: $file_type_filter
      ) {
        total
        uiFiles {
          submitter_id_name
          study_id
          pdc_study_id
		      embargo_date
          file_name
          study_run_metadata_submitter_id
          protocol_submitter_id
          project_name
          data_category
          file_type
          access
          file_size
          file_id
          md5sum
          downloadable
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
    }
  `;

  getFilteredFilesPaginated(version: string, offset: number, limit: number, sort: string, filters: any) {
    let filter_ethnicity = filters["ethnicity"];
    if (filter_ethnicity === "Empty value") {
      filter_ethnicity = "";
    }
    let filter_race = filters["race"];
    if (filter_race === "Empty value") {
      filter_race = "";
    }
    return this.apollo
      .watchQuery<QueryAllFilesDataPaginated>({
        query: this.filteredFilesPaginatedQuery,
        variables: {
          study_version_value: version || "",
          offset_value: offset,
          limit_value: limit,
          sort_value: sort,
          program_name_filter: filters["program_name"] || "",
          project_name_filter: filters["project_name"] || "",
          study_name_filter: filters["study_name"] || "",
          disease_filter: filters["disease_type"] || "",
          filterValue: filters["primary_site"] || "",
          analytical_frac_filter: filters["analytical_fraction"] || "",
          exp_type_filter: filters["experiment_type"] || "",
          ethnicity_filter: filter_ethnicity || "",
          race_filter: filter_race || "",
          gender_filter: filters["gender"] || "",
          tumor_grade_filter: filters["tumor_grade"] || "",
          sample_type_filter: filters["sample_type"],
          acquisition_type_filter: filters["acquisition_type"],
          data_category_filter: filters["data_category"] || "",
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
          case_status_filter: filters["case_status"] || '',
          file_type_filter: filters["file_type"] || ''
        },
        context: {
          method: 'POST'
        }
      })
      .valueChanges.pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-3622 add legacy studies data
  //@@@PDC-3788 fix issues found with Files overlay in legacy data page
  //@@@PDC-3911 add data source field to distinquish files supplementary from non-supplementary data
  filteredLegacyDataFilesPaginatedQuery = gql`
    query FilteredFilesLegacyDataPaginated(
	  $offset_value: Int
	  $limit_value: Int
	  $sort_value: String!
	  $study_id_filter: String!
	  $data_source_filter: String!
	  $data_category_filter: String!
	  $file_type_filter: String!) {
		  getPaginatedUILegacyFile(
			study_id: $study_id_filter
			data_source: $data_source_filter
			offset: $offset_value
			limit:  $limit_value
			sort: $sort_value
			data_category:$data_category_filter
			file_type:$file_type_filter
		  ) {
			total
			uiLegacyFiles {
			  file_id
			  pdc_study_id
			  submitter_id_name
			  embargo_date
			  file_name
			  study_run_metadata_submitter_id
			  project_name
			  data_category
			  file_type
			  file_size
			  md5sum
			  downloadable
			  access
			  study_id
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


  getFilteredLegacyDataFilesPaginated( offset: number, limit: number, sort: string, filters: any) {
    return this.apollo
      .watchQuery<QueryAllFilesDataPaginated>({
        query: this.filteredLegacyDataFilesPaginatedQuery,
        variables: {
          offset_value: offset,
          limit_value: limit,
		  sort_value: sort,
          study_id_filter: filters["study_id"] || "",
		  data_source_filter: filters["data_source"] || "",
          data_category_filter: filters["data_category"] || "",
          file_type_filter: filters["file_type"] || "",
        }
      })
      .valueChanges.pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );

  }

  exchangeForAccessToken(authorizationCode: string): Promise<any> {
    const requestBody = new HttpParams()
      .set("grant_type", "authorization_code")
      .set("code", authorizationCode)
      .set("redirect_uri", environment.dcf_redirect_url)
      .set("client_id", environment.dcf_client_id)
      .set("client_secret", environment.dcf_client_secret);

      let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Accept", "*/*");
    return this.http
      .post(environment.dcf_oauth2_url, requestBody.toString(), { headers: headers })
      .toPromise();
  }

  searchForFileIndex(uuidList: string[]): Promise<any> {
    let prefixUuidList = uuidList.map(x => "dg.4DFC/" + x);
    let ids = prefixUuidList.join(",");
    let params = new HttpParams();
    params = params.append("ids", ids);

    let headers = new HttpHeaders();

    return this.http
      .get(environment.dcf_index_url, { params: params, headers: headers })
      .toPromise();
  }

  getSignedUrlFromFence(accessToken: string, guid: string): Promise<any> {
    let params = new HttpParams();
    params = params.append("file_id", guid);
    let headers = new HttpHeaders().set("Authorization", "Bearer " + accessToken);
    return this.http
      .get(environment.dcf_fence_signedurl_url + guid, {
        params: params,
        headers: headers
      })
      .toPromise();
  }

  recordControlledFileDownload(controlledFileDownloadInfo: any): Promise<any> {
    const url = environment.private_api_url + "controlledfile/download";
    let headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem('jwtToken'));

    return this.http.post(url, controlledFileDownloadInfo, {
      headers: headers
    }).toPromise();
  }

  getControlledFilesDetails(fileIds: string): Promise<any> {
	//@@@PDC-1123 call ui wrapper API
	return this.apollo
      .query<any>({
        query: gql`
          query CasePerFile($file_id: String!) {
            uiCasePerFile(file_id: $file_id) {
              file_id
              case_id
              case_submitter_id
            }
          }
        `,
        variables: {
          file_id: fileIds
        }
      })
      .toPromise();
  }

  //@@@PDC-801 For files that are marked downloadable call API to get signed URL and include in manifest
  getOpenFileSignedUrl(fileName: string): Promise<any> {
    return this.http.get(environment.openfile_signedurl_url + fileName).toPromise();
  }

  //@@@PDC-5770 get file using uuid
  getOpenFileUuidSignedUrl(uuid: string): Promise<any> {
    return this.http.get(environment.openfile_uuid_signedurl_url + uuid).toPromise();
  }

  //@@@PDC-1940: File manifest download is very slow
  //@@@PDC-3253 call api with acceptDUA
  //@@@PDC-3928 to get correct files for appropriate study version we need to provide study UUID
  filesDataQuery = gql`
    query FilesDataQuery(
      $file_name: String!
	  $study_id: String!
    ) {
      uiFilesPerStudy (file_name: $file_name, study_id: $study_id) {
          file_id
          file_name
          signedUrl {
            url
          }
      }
    }
  `;

  //@@@PDC-1940: File manifest download is very slow
  getFilesData(fileNameStr: any, study_id_param: any) {
    return this.apollo
      .watchQuery<QueryAllFilesData>({
        query: this.filesDataQuery,
        variables: {
          file_name: fileNameStr,
          study_id: study_id_param || ""
        },
        context: {
          method: 'POST'
        }
      })
      .valueChanges.pipe(
        map(result => {
          //console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-3937 Use new APIs for downloading legacy studies' files
  legacyFilesDataQuery = gql`
    query LegacyFilesDataQuery(
      $file_name: String!
    ) {
        uiLegacyFilesPerStudy (file_name: $file_name) {
          file_id
          file_name
          signedUrl {
            url
          }
      }
    }
  `;

  //@@@PDC-1940: File manifest download is very slow
  getLegacyFilesData(fileNameStr: any) {
     return this.apollo
      .watchQuery<QueryAllFilesData>({
        query: this.legacyFilesDataQuery,
        variables: {
          file_name: fileNameStr,
        },
        context: {
          method: 'POST'
        }
      })
      .valueChanges.pipe(
        map(result => {
          //console.log(result.data);
          return result.data;
        })
      );
  }


  //@@@PDC-3307 Add study version to file manifest
  //@@@PDC-3928 need study UUID to download files for appropriate study version
  //This API will return all studies and their versions
  getStudiesVersions(){
	  return this.apollo
      .watchQuery<any>({
        query: gql`
          query StudiesVersions{
            getPaginatedUIStudy(offset: 0, limit: 1000){
				uiStudies {
					study_id
					submitter_id_name
					pdc_study_id
					versions {
						number
					}
				}
			}
          }
        `
      }).valueChanges.pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  paginatedFilesForPublicationQuery = gql`
  query PaginatedFilesForPublication(
    $offset_value: Int
    $limit_value: Int
    $publication_id: String!
  ) {
    getPaginatedUIPancancerFiles(
      offset: $offset_value
      limit: $limit_value
      publication_id: $publication_id
    ) {
      total
      uiPancancerFiles {
        file_id
        file_name
        description
        characterization
        cohorts
        related_publications
        related_studies
        downloadable
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
  }
`;

getPaginatedFilesForPublication(publication_id: string, offset: number, limit: number) {
  return this.apollo
    .watchQuery<QueryAllFilesDataPaginated>({
      query: this.paginatedFilesForPublicationQuery,
      variables: {
        offset_value: offset,
        limit_value: limit,
        publication_id: publication_id,
      }
    })
    .valueChanges.pipe(
      map(result => {
        console.log(result.data);
        return result.data;
      })
    );
}

}
