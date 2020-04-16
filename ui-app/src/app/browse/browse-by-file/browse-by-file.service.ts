import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { AllFilesData, QueryAllFilesData, QueryAllFilesDataPaginated } from '../../types';
import { environment } from '../../../environments/environment';
import { element } from '@angular/core/src/render3/instructions';

/*This is a service class used for the API queries */

@Injectable()
export class BrowseByFileService {
  headers: Headers;
  options: RequestOptions;

  //constructor(private http: Http, private apollo: Apollo) {
  constructor(private apollo: Apollo, private http: HttpClient) {
    this.headers = new Headers({
      "Content-Type": "application/json",
      Accept: "q=0.8;application/json;q=0.9"
    });
    this.options = new RequestOptions({ headers: this.headers });
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
  filteredFilesPaginatedQuery = gql`
    query FilteredFilesDataPaginated(
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
      $file_type_filter: String!
      $access_filter: String!
      $downloadable_filter: String!,
      $biospecimen_status_filter: String!, 
      $case_status_filter: String!
    ) {
      getPaginatedUIFile(
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
        file_type: $file_type_filter
        access: $access_filter
        downloadable: $downloadable_filter,
        biospecimen_status: $biospecimen_status_filter, 
        case_status: $case_status_filter
      ) {
        total
        uiFiles {
          submitter_id_name
          study_id
          file_name
          study_run_metadata_submitter_id
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

  getFilteredFilesPaginated(offset: number, limit: number, sort: string, filters: any) {
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
          file_type_filter: filters["file_type"] || "",
          access_filter: filters["access"] || "",
          downloadable_filter: filters["downloadable"] || "",
          biospecimen_status_filter: filters["biospecimen_status"] || '',
          case_status_filter: filters["case_status"] || ''
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
}