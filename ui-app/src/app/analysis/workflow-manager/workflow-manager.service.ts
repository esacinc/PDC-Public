import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { FileMetadata } from '../../types';
import {environment} from '../../../environments/environment';

const WORKFLOW_MANAGER_SERVER_URL = environment.server_url_workflow_local;
const CLUSTER_NAME = environment.PDC_CLUSTER_NAME;


/*This is a service class used for the API queries */

@Injectable()
export class WorkflowManagerFileService {
    
    query_result: any;
    cluster_status = 'Available';
    available_workflows: any[];
    //@@@PDC-1123 call ui wrapper API
    fileMedatdataQuery = gql`
        query FileMetadata($file_names: String!){
					uiFileMetadata(file_name: $file_names) {
                        file_name
                        file_location
                        sample_id
                        sample_submitter_id
                        original_file_name
                        analyte
                        instrument
                        experiment_type
                        folder_name
                        fraction
                    }
        }`;

    constructor(private http: HttpClient, private apollo: Apollo) {
        this.getClusterStatus(CLUSTER_NAME);
        this.available_workflows = [];
    }
    // The file ids parameter is passed to the graphql query
    // 'file_name:fn_1;fn_2;fn_3 etc. 
    getMetadataForFiles(f_names: string) {
        console.log('F_names:', f_names);
        return this.apollo.watchQuery<FileMetadata>({
            query: this.fileMedatdataQuery,
            variables: {
                file_names: f_names
            }
        })
        .valueChanges
        .pipe(
            map(result => { console.log(' Query Results:', result); this.query_result = result.data;
                            return result.data; })
        );
    }

    getClusterStatus(cluster_name: string) {
        return this.http.get(WORKFLOW_MANAGER_SERVER_URL + '/buckets/status/' + cluster_name);
    }
    submitCDAPWorkflow(files_list: any, workflow_name: string, cluster_name: string) {
        return this.http.post(WORKFLOW_MANAGER_SERVER_URL + '/workflows/submitCDAPWorkflow',
                            {workflow_params: files_list, workflow_name: workflow_name, cluster_name: cluster_name});
    }
    // Given the file types, etc. return the available workflows
    getAvailableWorkflows(file_types: string, instruments: string, analytic_fractions: string, experiment_type: string ) {
        // console.log(file_metadata_list);
        const params = file_types + '/' + experiment_type + '/' + instruments + '/' + analytic_fractions;
        return this.http.get(WORKFLOW_MANAGER_SERVER_URL + '/workflows/' + params);
    }
    

    
    


}
