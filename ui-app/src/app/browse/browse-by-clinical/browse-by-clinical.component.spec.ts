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
//@@@PDC-2397 Update clinical manifest generation to include additional attributes
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
			days_to_recurrence: "343",
            disease_type: "Uterine Corpus Endometrial Carcinoma",
            primary_site: "Colon",
            program_name: null,
            project_name: null,
            status: "Qualified",
		    cause_of_death: "Not Reported",
			  days_to_birth: null,
			  days_to_death: null,
			  vital_status: "Alive",
			  year_of_birth: "1945",
			  year_of_death: "0",
			  days_to_last_follow_up: "253",
			  days_to_last_known_disease_status: "253",
			  last_known_disease_status: "Tumor free",
			  progression_or_recurrence: "no",
			  prior_malignancy: "Not Reported",
			  ajcc_clinical_m: "Not Reported",
			  ajcc_clinical_n: "Not Reported",
			  ajcc_clinical_stage: "Not Reported",
			  ajcc_clinical_t: "Not Reported",
			  ajcc_pathologic_m: "Not Reported",
			  ajcc_pathologic_n: "Not Reported",
			  ajcc_pathologic_stage: "Not Reported",
			  ajcc_pathologic_t: "Not Reported",
			  ajcc_staging_system_edition: null,
			  ann_arbor_b_symptoms: "Not Reported",
			  ann_arbor_clinical_stage: "Not Reported",
			  ann_arbor_extranodal_involvement: "Not Reported",
			  ann_arbor_pathologic_stage: "Not Reported",
			  best_overall_response: null,
			  burkitt_lymphoma_clinical_variant: "Not Reported",
			  circumferential_resection_margin: null,
			  colon_polyps_history: null,
			  days_to_best_overall_response: null,
			  days_to_diagnosis: null,
			  days_to_hiv_diagnosis: null,
			  days_to_new_event: null,
			  figo_stage: "Not Reported",
			  hiv_positive: null,
			  hpv_positive_type: null,
			  hpv_status: null,
			  iss_stage: "Not Reported",
			  laterality: "Not Reported",
			  ldh_level_at_diagnosis: null,
			  ldh_normal_range_upper: null,
			  lymph_nodes_positive: null,
			  lymphatic_invasion_present: "Not Reported",
			  method_of_diagnosis: "Not Reported",
			  new_event_anatomic_site: null,
			  new_event_type: null,
			  overall_survival: null,
			  perineural_invasion_present: "Not Reported",
			  prior_treatment: "Not Reported",
			  progression_free_survival: null,
			  progression_free_survival_event: null,
			  residual_disease: "Not Reported",
			  vascular_invasion_present: "Not Reported",
			  year_of_diagnosis: null,			
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
  
  it("test getIcon", () => {
	  expect(component.getIcon("")).toBe('');
  });
  
  it("test displayTextforExternalID", () => {
	  expect(component.displayTextforExternalID("","")).toBe('');
  });
  
  it("test findCaseByID", () => {
	  expect(component.findCaseByID("")).toBe(-1);
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
