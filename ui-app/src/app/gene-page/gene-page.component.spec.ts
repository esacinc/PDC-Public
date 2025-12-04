import { GeneProteinSummaryService } from './../gene-protein-summary/gene-protein-summary.service';
import { GeneProteinSummaryComponent } from './../gene-protein-summary/gene-protein-summary.component';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Apollo } from "apollo-angular";
import { RouterTestingModule } from "@angular/router/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockGeneProteinSummaryService {}

class MockMatDialogRef {
  close() {}
}

describe("GeneProteinSummaryComponent", () => {
  let controller: ApolloTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ApolloTestingModule],
    providers: [GeneProteinSummaryComponent, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    controller = TestBed.get(ApolloTestingController);
  });

  //it("should create", () => {
    //expect(component).toBeTruthy();
  //});

});
