import { GeneProteinSummaryService } from './../gene-protein-summary/gene-protein-summary.service';
import { GeneProteinSummaryComponent } from './../gene-protein-summary/gene-protein-summary.component';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import { Apollo } from "apollo-angular";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NO_ERRORS_SCHEMA } from "@angular/core";

class MockGeneProteinSummaryService {}

class MockMatDialogRef {
  close() {}
}

describe("GeneProteinSummaryComponent", () => {
  let component: GeneProteinSummaryComponent;
  let fixture: ComponentFixture<GeneProteinSummaryComponent>;
  let service: GeneProteinSummaryService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GeneProteinSummaryComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Apollo, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { summaryData: "id"}
        },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        {
          provide: GeneProteinSummaryService,
          useClass: MockGeneProteinSummaryService
        }
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneProteinSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.get(GeneProteinSummaryService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

});
 