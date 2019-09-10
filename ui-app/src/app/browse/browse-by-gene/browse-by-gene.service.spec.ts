import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByGeneService } from "./browse-by-gene.service";

describe("BrowseByGeneService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseByGeneService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseByGeneService],
    (service: BrowseByGeneService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getFilteredGenesDataPaginated", inject(
    [BrowseByGeneService],
    (service: BrowseByGeneService) => {
      service
        .getFilteredGenesDataPaginated(0, 2, "gender asc", {
          experiment_type: "iTRAQ4;TMT10"
        })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["getPaginatedUIGene"].uiClinical.length).toBe(10);
          expect(data["getPaginatedUIGene"].total).toBe(12597);
          expect(data["getPaginatedUIGene"].uiClinical[0].case_submitter_id).toBe(
            "CA25730263-1"
          );
          expect(data["getPaginatedUIGene"].pagination).toEqual({
            count: 10,
            sort: "",
            from: 0,
            page: 1,
            total: 369,
            pages: 37,
            size: 10
          });
        });

      const op = controller.expectOne(service.filteredGenesDataPaginatedQuery);

      expect(op.operation.variables.sort_value).toEqual("gender asc");
      expect(op.operation.variables.exp_type_filter).toEqual("iTRAQ4;TMT10");

      op.flush({
        data: {
          getPaginatedUIGene: {
            total: 12597,
            uiGenes: [
              {
                gene_name: "ABCA9",
                chromosome: "17",
                locus: "17q24.2",
                num_study: 1,
                proteins:
                  "H0Y4U7;NP_525022.2;Q8IUA7;Q8IUA7-3;Q8IUA7-4;XP_016879500.1;XP_016879501.1;XP_016879502.1;XP_016879503.1;XP_016879504.1"
              },
              {
                gene_name: "ANO8",
                chromosome: "19",
                locus: "19p13.11",
                num_study: 7,
                proteins: "M0QYD2;NP_066010.1;Q9HCE9;Q9HCE9-2;XP_016882537.1"
              },
              {
                gene_name: "ARX",
                chromosome: "X",
                locus: "Xp21.3",
                num_study: 4,
                proteins: "NP_620689.1;Q96QS3"
              },
              {
                gene_name: "BEST4",
                chromosome: "1",
                locus: "1p34.1",
                num_study: 1,
                proteins: "NP_695006.1;Q8NFU0;XP_016856511.1;XP_016856512.1"
              },
              {
                gene_name: "BVES",
                chromosome: "6",
                locus: "6q21",
                num_study: 1,
                proteins: "NP_001186492.1;NP_009004.2;NP_671488.1;Q8NE79;XP_011533700.1"
              },
              {
                gene_name: "CACNA1H",
                chromosome: "16",
                locus: "16p13.3",
                num_study: 2,
                proteins:
                  "A0A1W2PQW2;A0A1W2PR14;H3BMW6;H3BNT0;H3BUA8;NP_001005407.1;NP_066921.2;O95180;O95180-2;XP_005255709.1;XP_006721026.1;XP_006721027.1;XP_006721028.1;XP_006721030.1;XP_006721031.1;XP_011521026.1;XP_011521029.1;XP_016879308.1;XP_016879309.1;XP_016879310.1"
              },
              {
                gene_name: "CACNB2",
                chromosome: "10",
                locus: "10p12.33-p12.31",
                num_study: 3,
                proteins:
                  "A0A087WUH4;A0A087WVX5;A0A087WWJ0;A6PVM6;NP_000715.2;NP_001161417.1;NP_001316989.1;NP_963864.1;NP_963865.2;NP_963866.2;NP_963884.2;NP_963887.2;NP_963890.2;NP_963891.1;Q08289;Q08289-10;Q08289-2;Q08289-3;Q08289-4;Q08289-5;Q08289-6;Q08289-7;Q08289-8;Q08289-9;XP_005252645.1;XP_005252648.1;XP_006717565.1;XP_011517961.1;XP_016872114.1"
              },
              {
                gene_name: "CCDC136",
                chromosome: "7",
                locus: "7q32.1",
                num_study: 2,
                proteins:
                  "C9IYI5;C9J884;C9JAD8;C9JE17;C9JU31;NP_001188301.1;NP_073579.4;Q96JN2;Q96JN2-2;Q96JN2-3;Q96JN2-4;XP_005250591.1;XP_005250595.1;XP_011514785.1;XP_011514786.1;XP_011514787.1;XP_011514788.1;XP_011514789.1;XP_011514790.1;XP_011514791.1;XP_011514792.1;XP_016868021.1;XP_016868022.1;XP_016868023.1;XP_016868024.1;XP_016868025.1"
              },
              {
                gene_name: "CCDC69",
                chromosome: "5",
                locus: "5q33.1",
                num_study: 4,
                proteins: "A6NI79;NP_056436.2"
              },
              {
                gene_name: "CCND2",
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
        }
      });

      controller.verify();
    }
  ));
});
