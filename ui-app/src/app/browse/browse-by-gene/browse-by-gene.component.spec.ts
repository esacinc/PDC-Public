import { MatDialog } from "@angular/material";
import { Apollo } from "apollo-angular";
import { Observable, of } from "rxjs";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { BrowseByGeneComponent } from "./browse-by-gene.component";
import { BrowseByGeneService } from "./browse-by-gene.service";

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}
class MockBrowseByGeneService {
  getGenePTMData(): Observable<any> {
    return of({
      getPaginatedUIPtm: {
        total: 76,
        uiPtm: [
          {
            ptm_type: "phospho",
            site: "NP_689449.1:s19",
            peptide: "GAATMSLGKLsPVGWVSSSQGK;LsPVGWVSSSQGK"
          },
          {
            ptm_type: "phospho",
            site: "NP_689449.1:s25",
            peptide: "LSPVGWVsSSQGK"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 76,
          pages: 8,
          size: 10
        }
      }
    });
  }

  //@@@PDC-7688 add gene_id and ncbi_gene_id
  getFilteredGenesDataPaginated(): Observable<any> {
    return of({
      getPaginatedUIGene: {
        total: 12597,
        uiGenes: [
          {
            gene_name: "ABCA9",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "17",
            locus: "17q24.2",
            num_study: 1,
            proteins:
              "H0Y4U7;NP_525022.2;Q8IUA7;Q8IUA7-3;Q8IUA7-4;XP_016879500.1;XP_016879501.1;XP_016879502.1;XP_016879503.1;XP_016879504.1"
          },
          {
            gene_name: "ANO8",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "19",
            locus: "19p13.11",
            num_study: 7,
            proteins: "M0QYD2;NP_066010.1;Q9HCE9;Q9HCE9-2;XP_016882537.1"
          },
          {
            gene_name: "ARX",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "X",
            locus: "Xp21.3",
            num_study: 4,
            proteins: "NP_620689.1;Q96QS3"
          },
          {
            gene_name: "BEST4",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "1",
            locus: "1p34.1",
            num_study: 1,
            proteins: "NP_695006.1;Q8NFU0;XP_016856511.1;XP_016856512.1"
          },
          {
            gene_name: "BVES",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "6",
            locus: "6q21",
            num_study: 1,
            proteins: "NP_001186492.1;NP_009004.2;NP_671488.1;Q8NE79;XP_011533700.1"
          },
          {
            gene_name: "CACNA1H",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "16",
            locus: "16p13.3",
            num_study: 2,
            proteins:
              "A0A1W2PQW2;A0A1W2PR14;H3BMW6;H3BNT0;H3BUA8;NP_001005407.1;NP_066921.2;O95180;O95180-2;XP_005255709.1;XP_006721026.1;XP_006721027.1;XP_006721028.1;XP_006721030.1;XP_006721031.1;XP_011521026.1;XP_011521029.1;XP_016879308.1;XP_016879309.1;XP_016879310.1"
          },
          {
            gene_name: "CACNB2",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "10",
            locus: "10p12.33-p12.31",
            num_study: 3,
            proteins:
              "A0A087WUH4;A0A087WVX5;A0A087WWJ0;A6PVM6;NP_000715.2;NP_001161417.1;NP_001316989.1;NP_963864.1;NP_963865.2;NP_963866.2;NP_963884.2;NP_963887.2;NP_963890.2;NP_963891.1;Q08289;Q08289-10;Q08289-2;Q08289-3;Q08289-4;Q08289-5;Q08289-6;Q08289-7;Q08289-8;Q08289-9;XP_005252645.1;XP_005252648.1;XP_006717565.1;XP_011517961.1;XP_016872114.1"
          },
          {
            gene_name: "CCDC136",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "7",
            locus: "7q32.1",
            num_study: 2,
            proteins:
              "C9IYI5;C9J884;C9JAD8;C9JE17;C9JU31;NP_001188301.1;NP_073579.4;Q96JN2;Q96JN2-2;Q96JN2-3;Q96JN2-4;XP_005250591.1;XP_005250595.1;XP_011514785.1;XP_011514786.1;XP_011514787.1;XP_011514788.1;XP_011514789.1;XP_011514790.1;XP_011514791.1;XP_011514792.1;XP_016868021.1;XP_016868022.1;XP_016868023.1;XP_016868024.1;XP_016868025.1"
          },
          {
            gene_name: "CCDC69",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "5",
            locus: "5q33.1",
            num_study: 4,
            proteins: "A6NI79;NP_056436.2"
          },
          {
            gene_name: "CCND2",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
			ncbi_gene_id: "1",
            chromosome: "12",
            locus: "12p13.32",
            num_study: 4,
            proteins: "NP_001750.1;P30279"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 12597,
          pages: 1260,
          size: 10
        }
      }
    });
  }
}

describe("BrowseByGeneComponent", () => {
  let component: BrowseByGeneComponent;
  let fixture: ComponentFixture<BrowseByGeneComponent>;
  let serviceSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseByGeneComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(BrowseByGeneComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: BrowseByGeneService,
            useClass: MockBrowseByGeneService
          },
          { provide: MatDialog, useClass: MockDialog }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByGeneService.prototype,
        "getFilteredGenesDataPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(BrowseByGeneComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.filteredGenesData.length).toBe(10);
      expect(component.totalRecords).toBe(12597);
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
    component.selectedGenesData = selectedData;
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
  
  it("Test download complete manifest", () => {
	let simpleChange = {};
	let newFilterValue = "sample_type:Xenograft";
	component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
	component.downloadCompleteManifest(true);
    expect(serviceSpy).toHaveBeenCalled();	
  });
  
  
});
