import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AllCasesData, AllUICasesData } from '../../types';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { BrowseByCaseComponent } from './browse-by-case.component';
import { BrowseByCaseService } from './browse-by-case.service';

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

class MockBrowseByCaseService {
  getFilteredCasesPaginated(): Observable<any> {
    return of({
      getPaginatedUICase: {
        total: 1038,
        uiCases: [
          {
            aliquot_id: "2de529de-6427-11e8-bcf1-0a2705229b82",
            sample_id: "25567fdb-641d-11e8-bcf1-0a2705229b82",
            case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
            aliquot_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05_D2",
            sample_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05",
            case_submitter_id: "14CO003",
            program_name: "Clinical Proteomic Tumor Analysis Consortium",
            project_name: "CPTAC-Confirmatory",
            sample_type: "Primary Tumor",
            disease_type: "Colon Adenocarcinoma",
            primary_site: "Colon"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 1038,
          pages: 104,
          size: 10
        }
      }
    });
  }
}

describe("BrowseByCaseComponent", () => {
  let component: BrowseByCaseComponent;
  let fixture: ComponentFixture<BrowseByCaseComponent>;
  let serviceSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseByCaseComponent, CaseSummaryComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Apollo, useValue: {} },
        { provide: MatDialog, useClass: MockDialog },
        { provide: BrowseByCaseService, useClass: MockBrowseByCaseService }
      ]
    });

    TestBed.overrideComponent(BrowseByCaseComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          { provide: MatDialog, useClass: MockDialog },
          { provide: BrowseByCaseService, useClass: MockBrowseByCaseService }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByCaseService.prototype,
        "getFilteredCasesPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(BrowseByCaseComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.filteredCasesData.length).toBe(1);
      expect(component.totalRecords).toBe(1038);
      expect(component.offset).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.limit).toBe(10);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  it("show case summary test", () => {
    let router = TestBed.get(Router);
    spyOn(router, "navigate");
    let spy = spyOn(MockDialog.prototype, "open").and.callThrough();
    component.showCaseSummary("cae72878-63d6-11e8-bcf1-0a2705229b82");
    expect(router.navigate).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

/*   it("test find case id", () => {
    let casesData: AllUICasesData = {
		aliquot_submitter_id: "",
		sample_submitter_id: "",
		case_id: "",
		case_submitter_id: "cae72878",
		project_name: "",
		program_name: "",
		sample_type: "",
		disease_type: "",
		primary_site: "",
		aliquot_id: "",
		sample_id: "",
		aliquot_is_ref: "",
		aliquot_status: "",
		aliquot_quantity: "",
		aliquot_volume: "",
		amount: "",
		analyte_type: "",
		concentration: "",
		case_status: "",
		sample_status: "",
		sample_is_ref: "",
		biospecimen_anatomic_site: "",
		composition: "",
		current_weight: "",
		days_to_collection: "",
		days_to_sample_procurement: "",
		diagnosis_pathologically_confirmed: "",
		freezing_method: "",
		initial_weight: "",
		intermediate_dimension: "",
		is_ffpe: "",
		longest_dimension: "",
		method_of_sample_procurement: "",
		oct_embedded: "",
		pathology_report_uuid: "",
		preservation_method: "",
		sample_type_id: "",
		shortest_dimension: "",
		time_between_clamping_and_freezing: "",
		time_between_excision_and_freezing: "",
		tissue_type: "",
		tumor_code: "",
		tumor_code_id: "",
    tumor_descriptor: "",
    tissue_collection_type: "",
		sample_ordinal: "",
    };

    let filteredCasesData = [casesData];
    expect(component.findCaseByID("cae72878")).toBe(-1);
    component.filteredCasesData = filteredCasesData;
    expect(component.findCaseByID("cae72878")).toBe(0);
  }); */

  it("test ngOnChanges with new filter", () => {
    let simpleChange = {};
    let newFilterValue = "Primary_Sites:kidney";
    component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test ngOnChanges with clear all selections", () => {
    let simpleChange = {};
    let newFilterValue = "Clear all selections: ";
    component.newFilterSelected = ["Primary_Sites", "Projects"];
    component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test load cases", () => {
    let event = {
      sortField: "case_submitter_id",
      sortOrder: 1,
      first: 0,
      rows: 10
    };
    component.loadCases(event);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test download disable", () => {
    expect(component.isDownloadDisabled()).toBeTruthy();
    let selectedCases = [];
    component.selectedCases = selectedCases;
    expect(component.isDownloadDisabled()).toBeTruthy();
    selectedCases.push("");
    expect(component.isDownloadDisabled()).toBeFalsy();
  });
  
  it("Test download complete manifest", () => {
	let simpleChange = {};
	let newFilterValue = "sample_type:Xenograft";
	component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
	component.downloadCompleteManifest(true);
    expect(serviceSpy).toHaveBeenCalled();	
  });
  
});
