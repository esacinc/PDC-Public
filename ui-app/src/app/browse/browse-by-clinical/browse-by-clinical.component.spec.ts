import { MatDialog } from "@angular/material";
import { Apollo } from "apollo-angular";
import { Observable, of } from "rxjs";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { BrowseByClinicalComponent } from "./browse-by-clinical.component";
import { BrowseByClinicalService } from "./browse-by-clinical.service";

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

//@@@PDC-1305 add age_at_diagnosis et al 	
class MockBrowseByClinicalService {
  getFilteredClinicalDataPaginated(): Observable<any> {
    return of({
      getPaginatedUIClinical: {
        total: 369,
        uiClinical: [
          {
            case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
            case_submitter_id: "14CO003",
            external_case_id: null,
            ethnicity: "not hispanic or latino",
            gender: "female",
            race: "white",
            morphology: "not reported",
            primary_diagnosis: "Colon Adenocarcinoma",
            site_of_resection_or_biopsy: "not reported",
            tissue_or_organ_of_origin: "Colon",
            tumor_grade: "not reported",
            tumor_stage: "Stage IIIB",
			age_at_diagnosis: "16790",
			classification_of_tumor: "Progressive",
			days_to_recurrence: "343"          
		  }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 369,
          pages: 37,
          size: 10
        }
      }
    });
  }
}

describe("BrowseByClinicalComponent", () => {
  let component: BrowseByClinicalComponent;
  let fixture: ComponentFixture<BrowseByClinicalComponent>;
  let serviceSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseByClinicalComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(BrowseByClinicalComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: BrowseByClinicalService,
            useClass: MockBrowseByClinicalService
          },
          { provide: MatDialog, useClass: MockDialog }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByClinicalService.prototype,
        "getFilteredClinicalDataPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(BrowseByClinicalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.filteredClinicalData.length).toBe(1);
      expect(component.totalRecords).toBe(369);
      expect(component.offset).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.limit).toBe(10);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  it("test ngOnChanges with new filter", () => {
    let simpleChange = {};
    let newFilterValue = "Disease_Types:Renal_Cell_Carcinoma";
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

  it("test download disable", () => {
    expect(component.isDownloadDisabled()).toBeTruthy();
    let selectedData = [];
    component.selectedClinicalData = selectedData;
    expect(component.isDownloadDisabled()).toBeTruthy();
    selectedData.push("");
    expect(component.isDownloadDisabled()).toBeFalsy();
  });

  it("test laod new page", () => {
    let event = {
      sortField: "case_submitter_id",
      sortOrder: 1,
      first: 0,
      rows: 10
    };
    component.loadNewPage(event);
    expect(serviceSpy).toHaveBeenCalled();
  });
});
