import { PDCUserService } from './../../pdcuser.service';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatMenuModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

import { BrowseByFileComponent } from './browse-by-file.component';
import { BrowseByFileService } from './browse-by-file.service';

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}
class MockBrowseByFileService {
  getFilteredFilesPaginated(): Observable<any> {
    return of({
      getPaginatedUIFile: {
        total: 7469,
        uiFiles: [
          {
            submitter_id_name: "Prospective_Colon_VU_Proteome",
            file_name: "0013936b-5a56-466f-8844-237d46e60a1f.raw",
            study_run_metadata_submitter_id: "S037-1-62",
            project_name: "CPTAC-Confirmatory",
            file_type: "RAW",
            file_size: "914337231"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 7469,
          pages: 747,
          size: 10
        }
      }
    });
  }
}

class MockPDCUserService {

}

describe("BrowseByFileComponent", () => {
  let component: BrowseByFileComponent;
  let fixture: ComponentFixture<BrowseByFileComponent>;
  let serviceSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseByFileComponent],
      imports: [RouterTestingModule,MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers:[]
    });

    TestBed.overrideComponent(BrowseByFileComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: BrowseByFileService,
            useClass: MockBrowseByFileService
          },
          { provide: MatDialog, useClass: MockDialog },
          { provide: PDCUserService, useClass: MockPDCUserService }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByFileService.prototype,
        "getFilteredFilesPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(BrowseByFileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.filteredFilesData.length).toBe(1);
      expect(component.totalRecords).toBe(7469);
      expect(component.offset).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.limit).toBe(10);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  it("test show study summary", () => {
    let spy = spyOn(MockDialog.prototype, "open").and.callThrough();
    component.showStudySummary();
    expect(spy).toHaveBeenCalled();
  });

  it("test applySelectFilter", () => {
    let filterValue = "Files:MZML";
    component.newFilterSelected = {};
    component.applySelectFilter(filterValue);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test applyFilterOnFilterChanged with new filter", () => {
    let filterValue = "Primary_Sites:Ovary";
    component.newFilterValue = filterValue;
    component.applyFilterOnFilterChanged();
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test applyFilterOnFilterChanged with clear all selections", () => {
    let simpleChange = {};
    let newFilterValue = "Clear all selections: ";
    component.newFilterSelected = ["Primary_Sites", "Projects"];
    component.newFilterValue = newFilterValue;
    component.applyFilterOnFilterChanged();
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test laod new page", () => {
    let event = {
      sortField: "case_submitter_id",
      sortOrder: 1,
      first: 0,
      rows: 10
    };
    component.loadFiles(event);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test download disable", () => {
    expect(component.isDownloadDisabled()).toBeTruthy();
    let selectedData = [];
    component.selectedFiles = selectedData;
    expect(component.isDownloadDisabled()).toBeTruthy();
    selectedData.push("");
    expect(component.isDownloadDisabled()).toBeFalsy();
  });
});
