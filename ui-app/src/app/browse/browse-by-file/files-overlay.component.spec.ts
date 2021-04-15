import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatMenuModule } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { PDCUserService } from './../../pdcuser.service';
import { SizeUnitsPipe } from './../../sizeUnitsPipe.pipe';
import { FilesOverlayComponent } from './files-overlay.component';
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
  };
  //@@@PDC-3307 add study version to file manifest
  getStudiesVersions(): Observable<any> {
    return of({
		getPaginatedUIStudy: {
			uiStudies:[
			{	
				pdc_study_id: "PDC000120",
​​				submitter_id_name: "Prospective Breast BI Proteome",
​​				versions: [
					{ number: "2"},
					{ number: "1"}]
			}]
		}
	});
  };
				
}

class MockSizeUnitsPipe {
  transform(): string {
    return '';
  }
}

class MockPDCUserService {

}

describe("FilesOverlayComponent", () => {
  let component: FilesOverlayComponent;
  let fixture: ComponentFixture<FilesOverlayComponent>;
  let serviceSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilesOverlayComponent],
      imports: [RouterTestingModule, MatMenuModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    TestBed.overrideComponent(FilesOverlayComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: BrowseByFileService,
            useClass: MockBrowseByFileService
          },
          {
            provide: SizeUnitsPipe,
            useClass: MockSizeUnitsPipe
          },
          { provide: MatDialog, useClass: MockDialog },
          { provide: PDCUserService, useClass: MockPDCUserService },
		  { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
             summaryData: {
				data_category: "Raw Mass Spectra",
				file_type: "Proprietary",
				study_name: "Prospective Ovarian JHU Intact Glycoproteome",
​				versions: false
			
			 }
            }
          },
          { provide: MatDialog, useValue: {} },
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByFileService.prototype,
        "getFilteredFilesPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(FilesOverlayComponent);
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
  
  
  it("test getAllFilesData", () => {
	component.getAllFilesData();
	fixture.whenStable().then(() => {
		expect(component.offset).toBe(0);
		expect(component.pageSize).toBe(10);
		expect(component.limit).toBe(10);
	});
  });
  
  it("test iscompleteManifestDisabled", () => {
	  component.filtersSelected = 2;
	  expect(component.iscompleteManifestDisabled()).toBe(false);
  });
  
  it("test getStyleClass", () => {
	  expect(component.getStyleClass("")).toBe('');
  });
  
  it("test prepareTSVExportManifestData", () => {
	  let manifestData = [];
	  let headers = [];
	  expect(component.prepareTSVExportManifestData(manifestData, headers)).toBe("\r\n");
  });

  it("test download disable", () => {
    expect(component.isDownloadDisabled()).toBeTruthy();
    let selectedData = [];
    component.selectedFiles = selectedData;
    expect(component.isDownloadDisabled()).toBeTruthy();
    selectedData.push("");
    expect(component.isDownloadDisabled()).toBeFalsy();
  });
  
  it("test fileExportCompleteManifest", () => {
	component.totalRecords = 5;
	component.fileExportCompleteManifest();
    expect(serviceSpy).toHaveBeenCalled();
  });
  
  it("test onRowSelected", () => {
	  component.currentPageSelectedFile = [];
	  component.onRowSelected({data: {file_id: "xxx", pdc_study_id: "yyy"}});
	  expect(component.headercheckbox).toBe(false);
  });
  
  
  it("test onRowUnselected", () => {
	  component.currentPageSelectedFile = [];
	  component.onRowUnselected({data: {file_id: "xxx", pdc_study_id: "yyy"}});
	  expect(component.headercheckbox).toBe(false);
  });
  
  it("test onTableHeaderCheckboxToggle", () => {
	  component.headercheckbox = false;
	  component.onTableHeaderCheckboxToggle();
	  expect(component.selectedFiles).toEqual([]);
	  expect(component.currentPageSelectedFile).toEqual([]);
	  expect(component.pageHeaderCheckBoxTrack).toEqual([]);
	  expect(component.selectedHeaderCheckbox).toBe(''); 
  });
  
  it("test changeHeaderCheckbox select none option", () => {
	  component.selectedHeaderCheckbox = "Select None";
	  component.changeHeaderCheckbox({});
	  expect(component.selectedFiles).toEqual([]);
	  expect(component.currentPageSelectedFile).toEqual([]);
	  expect(component.pageHeaderCheckBoxTrack).toEqual([]);
	  expect(component.selectedHeaderCheckbox).toBe(''); 
  });
  
});
