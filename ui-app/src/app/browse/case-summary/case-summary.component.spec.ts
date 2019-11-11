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
      uiCaseSummary: {
        samples: [
          {
            aliquots: [
              {
                aliquot_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05_D2",
                aliquot_quantity: "",
                aliquot_volume: "",
                amount: "",
                analyte_type: "",
                concentration: ""
              }
            ]
          }
        ],
        diagnoses: [{ dia1: null, dia2: "2" }]
      }
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
