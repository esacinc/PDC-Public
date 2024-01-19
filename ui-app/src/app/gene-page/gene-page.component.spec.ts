import { GeneProteinSummaryService } from './../gene-protein-summary/gene-protein-summary.service';
import { GeneProteinSummaryComponent } from './../gene-protein-summary/gene-protein-summary.component';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import { Apollo } from "apollo-angular";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";

import { NO_ERRORS_SCHEMA } from "@angular/core";

class MockGeneProteinSummaryService {}

class MockMatDialogRef {
  close() {}
}

describe("GeneProteinSummaryComponent", () => {
  let controller: ApolloTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneProteinSummaryComponent],
      imports: [ApolloTestingModule, HttpClientTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  //it("should create", () => {
    //expect(component).toBeTruthy();
  //});

});
   