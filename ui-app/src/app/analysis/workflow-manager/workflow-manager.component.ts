

import {Component, ViewEncapsulation, OnInit, Inject, Injectable} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

import { WorkflowManagerFileService } from './workflow-manager.service';

import gql from 'graphql-tag';

import { BehaviorSubject} from 'rxjs';
import { TreeNode } from 'primeng/api';
import { FileMetadata } from '../../types';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
const CLUSTER_NAME = 'master: PDC-CDAP';
const CLUSTER_LABEL = 'PDC-CDAP';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-workflow-manager',
  templateUrl: './workflow-manager.component.html',
  styleUrls: ['./workflow-manager.component.scss'],
  providers: [WorkflowManagerFileService]
})

//@@@PDC-447 new Angular 6 http.get returns data in JSON format by default - no need in JSON.parse
export class WorkflowManagerComponent implements OnInit {
  data_loading = true;
  file_metadata: TreeNode[];
  file_metadata_list: any[];
  cluster_status = 'Available';
  cluster_available = true;
  available_workflows: any[] = [];
  error_message: string = '';
  run_enabled = true;
  selectedWorkflow = '';
  workflow_params: any;


  analytes_list: string;
  instrument_list: string;
  experiment_types_list: string;
  file_type_list: string;

    //@@@PDC-1123 call ui wrapper API
  fileMedatdataQuery = gql`
        query FileMetadata($file_names: String!){
					uiFileMetadata(file_name: $file_names) {
                        file_name
                        file_location
                        sample_id
                        sample_submitter_id
                        acquisition_file_name
                        analyte
                        instrument
                        folder_name
                        fraction
                    }
        }`;
  constructor( private workflowManagerFileService: WorkflowManagerFileService,
      @Inject(MAT_DIALOG_DATA) public selectedFiles: any,
      private dialogRef: MatDialogRef<WorkflowManagerComponent>) {
      }

  workflowEnabled(): boolean {
    if (this.selectedWorkflow.length > 1 ) {
      return true;
    } else {
      return false;
    }
  }
  ngOnInit() {

    let f_lists: string[];
    f_lists = [];
   console.log('Summary Data:', this.selectedFiles.summaryData);
    this.selectedFiles.summaryData.map((x) => f_lists.push(x.file_name));
    let file_names = '';
    file_names += f_lists.join(';');
    // remove whitespaces
    file_names.replace(/\s/g, '');
    console.log(file_names);
    this.data_loading = true;
    this.workflowManagerFileService.getMetadataForFiles(file_names).subscribe((data: any) => {
    //@@@PDC-1123 call ui wrapper API
      this.workflow_params = data.uiFileMetadata;
      
      this.file_metadata_list = this.buildMetadataTree(data);
      this.file_metadata = <TreeNode[]>this.file_metadata_list;
      // Now get the metadata list for the files
   
      this.workflowManagerFileService.getAvailableWorkflows(this.file_type_list, this.instrument_list, 
                                    this.analytes_list, this.experiment_types_list).subscribe(
        (workflows: any) => {
		  //PDC-447 no need in JSON.parse
          const available_workflows = workflows;
          if ( available_workflows.workflows.length < 1 ) {
            console.log('No matching workflows available for selected files');
            this.error_message = 'No relevant workflows available for selected files';
            this.run_enabled = false;
          } else {
              console.log(available_workflows);
              available_workflows.workflows.map(aWorkflow => { this.available_workflows.push({menu_label: aWorkflow.menu_label,
                                  value: aWorkflow.menu_label});
                                  this.data_loading = false; });
          }
          this.data_loading = false;
      });

    });
    
    this.workflowManagerFileService.getClusterStatus(CLUSTER_NAME).subscribe((data: any) => {
	  //PDC-447 no need in JSON.parse
      const status_details = data;

      console.log(status_details);
      if ( status_details.Reservations.length > 0 ) {
        this.cluster_status = 'Available';
        this.cluster_available = true;
      } else {
        this.cluster_status = 'Not Available';
        this.cluster_available = false;
      }
    });
  }
  close() {
    this.dialogRef.close();
  }

  submitWorkflow() {
    console.log('Submitting workflow params:', this.workflow_params);
    this.workflowManagerFileService.submitCDAPWorkflow(this.workflow_params, this.selectedWorkflow,
                                                    CLUSTER_LABEL).subscribe((data: any) => {
      console.log(data);
    });
  }

  private buildMetadataTree(queryResults: any) {
    const fileMap: Map<string, any> = new Map;
    const experiement_types:  string[] = [];
    const file_types: string[] = [];
    const instruments: string[] = [];
    const analytic_fractions: string[] = [];

    console.log('Query Results:', queryResults);
    //@@@PDC-1123 call ui wrapper API
    queryResults.uiFileMetadata.map(aFile => {
        if (! fileMap.has(aFile.file_name)) {
            const rootNode = {label: aFile.file_name,
                            data: aFile.file_name,
                            expandedIcon: 'fa fa-file-open',
                            collapsedIcon: 'fa fa-file',
                            children: [] };
            let file_type = aFile.file_name.split('.')[1].toUpperCase();
            if ( file_type === 'MZID') { file_type = 'PSM-MZID'; }
            file_types.push(file_type);

            rootNode.children.push(this.addChildNode('Location: ' + aFile.file_location, aFile.file_location,
                                                     'fa fa-folder-open', 'fa fa-folder'));
            rootNode.children.push(this.addChildNode('Analyte: ' + aFile.analyte, aFile.analyte));
            analytic_fractions.push(aFile.analyte);
            rootNode.children.push(this.addChildNode('Instrument: ' + aFile.instrument, aFile.instrument));
            instruments.push(aFile.instrument);

            rootNode.children.push(this.addChildNode('Fraction: ' + aFile.fraction, aFile.fraction));
            

            rootNode.children.push(this.addChildNode('Experiment Type: ' + aFile.experiment_type,
                                                      aFile.experiment_type) );
            experiement_types.push(aFile.experiment_type);

            rootNode.children.push(this.addChildNode('Original File Name: ' + aFile.original_file_name,
                                                      aFile.original_file_name));
            // Samples are newer nodes
            rootNode.children.push({label: 'Samples', data: 'samples',
                                    children: [this.addChildNode(aFile.sample_id, aFile.sample_id)]});
            fileMap.set(aFile.file_name, rootNode );
        } else {
            const aNode = fileMap.get(aFile.file_name);
            aNode.children.map(aChild => {
                if (aChild.label === 'Samples') {
                    aChild.children.push(this.addChildNode(aFile.sample_id, aFile.sample_id));
                }
            });
            // (this.addChildNode('Id: ' + aFile.sample_id, aFile.sample_id));
            fileMap.set(aFile.file_name, aNode);
        }
    });
    
    this.analytes_list = analytic_fractions.join(',');
    this.file_type_list = file_types.join(',');
    this.instrument_list = instruments.join(',');
    this.experiment_types_list = experiement_types.join(',');


    return Array.from(fileMap.values());
}

private addChildNode(label: string, value: string, expandedIcon: string = null, collapsedIcon: string = null) {
  let aNode = {label: label, data: value};
  if ( expandedIcon !== null) {
      aNode['expandedIcon'] = expandedIcon;
  }
  if ( collapsedIcon !== null ) {
      aNode['collapsedIcon'] = collapsedIcon;
  }
  return aNode;
}
}
