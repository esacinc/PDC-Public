import { of ,  Observable } from 'rxjs';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import { GeneProteinSummaryService } from "./gene-protein-summary.service";
import { Apollo } from "apollo-angular";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";
import { GeneProteinSummaryComponent } from "./gene-protein-summary.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";

class MockGeneProteinSummaryService {

  //@@@PDC-1123 call ui wrapper API
  getGeneDetails(gene_id: string): Observable<any> {
    return of({
      uiGeneSpectralCount:{}
    });
  }

  getAliquotSpectralCount(){
    return of({
    });
  }

}

class MockApollo {

  //@@@PDC-1123 call ui wrapper API
  watchQuery(): Observable<any> {
    return of({
    });
  }

}

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
 