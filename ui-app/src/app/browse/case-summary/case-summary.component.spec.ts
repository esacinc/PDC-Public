import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { CaseSummaryComponent } from './case-summary.component';
import { CaseSummaryService } from './case-summary.service';

class MockCaseSummaryService {
  getCaseSummaryData(): Observable<any> {
    return of({
      uiCase: [
        {
          aliquot_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05_D2",
          sample_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05",
          case_id: "14CO003",
          case_submitter_id: "14CO003",
          project_name: "CPTAC-Confirmatory",
          program_name: "",
          sample_type: "Primary Tumor",
          disease_type: "Colon Adenocarcinoma",
          primary_site: "Colon"
        }
      ]
    });
  }

  //@@@PDC-1123 add ui wrappers public APIs
  getDetailedCaseSummaryData(): Observable<any> {
    return of({
      uiCaseSummary: [{
		case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
		case_submitter_id: "14CO003",
		days_to_lost_to_followup: 0,
		disease_type: "Colon Adenocarcinoma",
		external_case_id: "e965a8fa-a257-4fd7-8bbb-a0f134c0c7d3",
		index_date: null,
		lost_to_followup: "",
		primary_site: "Colon",
		project_submitter_id: "CPTAC-2",
		tissue_source_site_code: "",
		demographics: [
			{
				cause_of_death: "Not Reported",
				days_to_birth: null,
				days_to_death: null,
				demographic_submitter_id: "14CO003-DM",
				ethnicity: "Not Hispanic or Latino",
				gender: "Female",
				race: "White",
				vital_status: "Not Reported",
				year_of_birth: null,
				year_of_death: null
			}
		],
		diagnoses: [
			{
				age_at_diagnosis: "0",
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
				classification_of_tumor: "Not Reported",
				colon_polyps_history: null,
				days_to_best_overall_response: null,
				days_to_diagnosis: null,
				days_to_hiv_diagnosis: null,
				days_to_last_follow_up: "0",
				days_to_last_known_disease_status: "0",
				days_to_new_event: null,
				days_to_recurrence: "0",
				diagnosis_submitter_id: "14CO003-DX",
				figo_stage: "Not Reported",
				hiv_positive: null,
				hpv_positive_type: null,
				hpv_status: null,
				iss_stage: "Not Reported",
				last_known_disease_status: "Not Reported",
				laterality: "Not Reported",
				ldh_level_at_diagnosis: null,
				ldh_normal_range_upper: null,
				lymph_nodes_positive: null,
				lymphatic_invasion_present: "Not Reported",
				method_of_diagnosis: "Not Reported",
				morphology: "Not Reported",
				new_event_anatomic_site: null,
				new_event_type: null,
				overall_survival: null,
				perineural_invasion_present: "Not Reported",
				primary_diagnosis: "Colon Adenocarcinoma",
				prior_malignancy: "no",
				prior_treatment: "Not Reported",
				progression_free_survival: null,
				progression_free_survival_event: null,
				progression_or_recurrence: "Not Reported",
				residual_disease: "Not Reported",
				site_of_resection_or_biopsy: "Not Reported",
				tissue_or_organ_of_origin: "Colon",
				tumor_grade: "Not Reported",
				tumor_stage: "Stage IIIB",
				vascular_invasion_present: "Not Reported",
        year_of_diagnosis: null,
        icd_10_code: null,
        synchronous_malignancy: null
			}
		],
        samples: [
          {
            aliquots: [
              {
				aliquot_id: "e2811543-6425-11e8-bcf1-0a2705229b82",
                aliquot_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05_D2",
                aliquot_quantity: null,
                aliquot_volume: null,
                amount: null,
                analyte_type: "Protein",
                concentration: null
              }
            ]
          }
        ]
      }]
    });
  }

  getExprimentFileByCaseCountData(): Observable<any> {
    return of({
      uiExperimentFileCount: [
        {
          acquisition_type: "",
          submitter_id_name: "",
          experiment_type: "",
          files_count: 5
        }
      ]
    });
  }

  getDataCategoryFileByCaseCountData(): Observable<any> {
    return of({
      uiDataCategoryFileCount: [{ file_type: "", files_count: 10 }]
    });
  }
}

describe("CaseSummaryComponent", () => {
  let component: CaseSummaryComponent;
  let fixture: ComponentFixture<CaseSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaseSummaryComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    TestBed.overrideComponent(CaseSummaryComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: CaseSummaryService,
            useClass: MockCaseSummaryService
          },
          { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              summaryData: {
                case_submitter_id: "14CO003",
                case_id: ""
              }
            }
          },
          { provide: MatDialog, useValue: {} },
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(CaseSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", () => {
    expect(component).toBeTruthy();
    expect(component.caseSummaryData.aliquot_submitter_id).toBe(
      "fd4edc52-09ef-4b01-be7c-f23f05_D2"
    );
    expect(component.aliquots[0].aliquot_submitter_id).toBe(
      "fd4edc52-09ef-4b01-be7c-f23f05_D2"
    );
    expect(component.experimentFileCount[0].files_count).toBe(5);
    expect(component.dataCategoryFileCount[0].files_count).toBe(10);
  });

  it("test style not reported", () => {
    expect(component.styleNotReported("Not Available").color).toBe("grey");
    expect(component.styleNotReported("").color).toBeUndefined();
  });

  it("test showMoreClicked", () => {
    component.showMoreClicked();
    expect(component.showMore).toBeTruthy();
  });

  it("test showLessClicked", () => {
    component.showLessClicked();
    expect(component.showMore).toBeFalsy();
  });
});
