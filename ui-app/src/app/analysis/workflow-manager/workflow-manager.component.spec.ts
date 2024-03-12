import { Observable, of } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { WorkflowManagerComponent } from './workflow-manager.component';
import { WorkflowManagerFileService } from './workflow-manager.service';

class MockWorkflowManagerFileService {
  getMetadataForFiles(fileName: string): Observable<any> {
    return of();
  }

  getAvailableWorkflows(
    clusterName: string,
    instrument_list: string,
    analytes_list: string,
    experiment_types_list: string
  ) {
    return of();
  }

  getClusterStatus(clusterName: string) {
    return of();
  }

  submitCDAPWorkflow(
    files_list: any,
    workflow_name: string,
    cluster_name: string
  ) {
    return of();
  }
}

class MockDialogRef {
  close() {}
}

describe("WorkflowManagerComponent", () => {

  let service;
  let selectedFiles;
  let dialogRef;
  let component: WorkflowManagerComponent;

  beforeEach(() => {
    service = new MockWorkflowManagerFileService();
    selectedFiles = { summaryData: [{ file_name: "protein" }] };
    dialogRef = new MockDialogRef();
    component = new WorkflowManagerComponent(service, selectedFiles, dialogRef);
  });

  afterEach(() => {
    service = null;
    selectedFiles = null;
    dialogRef = null;
    component = null;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("work flow enabled", () => {
    component.selectedWorkflow = "";
    expect(component.workflowEnabled()).toBeFalsy();
    component.selectedWorkflow = "selected";
    expect(component.workflowEnabled()).toBeTruthy();
  });

    //@@@PDC-1123 call ui wrapper API
  it("test ngOnInit", () => {
    let queryResults = {
      uiFileMetadata: [
        {
          file_name: "0013936b-5a56-466f-8844-237d46e60a1f.raw",
          analyte: "Protein",
          file_location: "local",
          instrument: "Protein",
          fraction: "Protein",
          experiment_type: "Protein",
          original_file_name: "Prospective_Colon_VU_Proteome	",
          sample_id: "14CO003"
        },
        {
          file_name: "0013936b-5a56-466f-8844-237d46e60a1f.raw",
          analyte: "Proteome",
          file_location: "local",
          instrument: "Proteome",
          fraction: "Proteome",
          experiment_type: "Proteome",
          original_file_name: "Prospective_Colon",
          sample_id: "14CO123"
        }
      ]
    };

    let workflows = {
      workflows: [
        {
          menu_label: "Label free"
        },
        {
          menu_label: "Label free"
        }
      ]
    };

    let status_details = {
      Reservations: [{}]
    };

    spyOn(service, "getMetadataForFiles").and.returnValue(of(queryResults));
    spyOn(service, "getAvailableWorkflows").and.returnValue(of(workflows));
    spyOn(service, "getClusterStatus").and.returnValue(of(status_details));
    component.ngOnInit();

    expect(component.file_metadata_list.length).toBe(1);
    expect(component.file_metadata_list[0].label).toBe(
      "0013936b-5a56-466f-8844-237d46e60a1f.raw"
    );
    expect(component.error_message).toBe("");
    expect(component.run_enabled).toBeTruthy();
    expect(component.cluster_status).toBe("Available");
    expect(component.cluster_available).toBeTruthy();
  });

  it("test close", () => {
    component.close();
  });

  it("test submit workflow params", () => {
    let spy = spyOn(service, "submitCDAPWorkflow").and.callThrough();
    component.submitWorkflow();
    expect(spy).toHaveBeenCalled();
    expect(service.submitCDAPWorkflow.calls.count()).toEqual(1);
  });
});
