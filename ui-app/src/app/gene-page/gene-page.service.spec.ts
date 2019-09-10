import { GenePageService } from './gene-page.service';
import { GeneProteinSummaryService } from './../gene-protein-summary/gene-protein-summary.service';
import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";


describe("GenePageService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenePageService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [GenePageService],
    (service: GenePageService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getProteinDetails", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getProteinDetails("M0R009").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["protein"].spectral_counts.length).toBe(2);
        expect(data["protein"].gene_name).toBe("A1BG");
      });

      const op = controller.expectOne(service.proteinDetailsQuery);

      op.flush({
        data: {
          protein: {
            gene_name: "A1BG",
            NCBI_gene_id: 1,
            authority: "HGNC:5",
            description: "alpha-1-B glycoprotein",
            organism: "Homo sapiens",
            chromosome: "19",
            locus: "19q13.43",
            proteins: "M0R009;NP_570602.2;P04217;P04217-2",
            assays: "non-CPTAC-1064\r",
            spectral_counts: [
              {
                project_submitter_id: "CPTAC-2",
                plex: "01_CPTAC_COprospective_Proteome_VU_20150901",
                spectral_count: 7,
                distinct_peptide: 4,
                unshared_peptide: 4
              },
              {
                project_submitter_id: "CPTAC-2",
                plex: "01CPTAC_COprospective_Proteome_PNNL_20170123",
                spectral_count: 37,
                distinct_peptide: 18,
                unshared_peptide: 18
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getGeneDetails", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getGeneDetails("A1BG").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["geneSpectralCount"].spectral_counts.length).toBe(3);
        expect(data["geneSpectralCount"].authority).toBe("HGNC:5");
      });

      const op = controller.expectOne(service.geneDetailsQuery);

      op.flush({
        data: {
          geneSpectralCount: {
            gene_name: "A1BG",
            NCBI_gene_id: 1,
            authority: "HGNC:5",
            description: "alpha-1-B glycoprotein",
            organism: "Homo sapiens",
            chromosome: "19",
            locus: "19q13.43",
            proteins: "M0R009;NP_570602.2;P04217;P04217-2",
            assays: "non-CPTAC-1064\r",
            spectral_counts: [
              {
                project_submitter_id: "CPTAC-2",
                study_submitter_id: "S037-1",
                plex: "",
                spectral_count: 648,
                distinct_peptide: 17,
                unshared_peptide: 17
              },
              {
                project_submitter_id: "CPTAC-2",
                study_submitter_id: "S037-2",
                plex: "",
                spectral_count: 865,
                distinct_peptide: 39,
                unshared_peptide: 39
              },
              {
                project_submitter_id: "CPTAC-2",
                study_submitter_id: "S038-3",
                plex: "",
                spectral_count: 23,
                distinct_peptide: 13,
                unshared_peptide: 13
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getAliquotSpectralCount", inject(
    [GenePageService],
    (service: GenePageService) => {
      // service.getAliquotSpectralCount("CDC42EP1", 0, 10).subscribe(data => {
      //   expect(data).toBeDefined();
      //   expect(
      //     data["getPaginatedUIGeneAliquotSpectralCount"].uiGeneAliquotSpectralCounts
      //       .length
      //   ).toBe(1);
      //   expect(data["getPaginatedUIGeneAliquotSpectralCount"].total).toBe(960);
      //   expect(data["getPaginatedUIGeneAliquotSpectralCount"].pagination).toEqual({
      //     count: 10,
      //     sort: "",
      //     from: 0,
      //     page: 1,
      //     total: 960,
      //     pages: 96,
      //     size: 10
      //   });
      // });

      // const op = controller.expectOne(service.geneAliquotSpectralCountQuery);

      // op.flush({
      //   data: {
      //     getPaginatedUIGeneAliquotSpectralCount: {
      //       total: 960,
      //       uiGeneAliquotSpectralCounts: [
      //         {
      //           aliquot_id: "2e700669-85b0-43fa-a9c7-3eaf5a_D2",
      //           plex: "01CPTAC_BCProspective_Phosphoproteome_BI_20160927",
      //           label: "TMT10 127C",
      //           submitter_id_name: "Prospective_Breast_BI_Phosphoproteome",
      //           experiment_type: "TMT10",
      //           spectral_count: 26,
      //           distinct_peptide: 13,
      //           unshared_peptide: 13,
      //           precursor_area: "\r",
      //           ratio: "0.4338",
      //           unshared_area: null,
      //           unshared_ratio: "0.5377"
      //         }
      //       ],
      //       pagination: {
      //         count: 10,
      //         sort: "",
      //         from: 0,
      //         page: 1,
      //         total: 960,
      //         pages: 96,
      //         size: 10
      //       }
      //     }
      //   }
      // });

      // controller.verify();
    }
  ));

  it("test getStudySpectralCount", inject(
    [GenePageService],
    (service: GenePageService) => {
      // service.getStudySpectralCount("BRAF", 0, 10).subscribe(data => {
      //   expect(data).toBeDefined();
      //   expect(
      //     data["getPaginatedUIGeneStudySpectralCount"].uiGeneStudySpectralCounts.length
      //   ).toBe(1);
      //   expect(data["getPaginatedUIGeneStudySpectralCount"].total).toBe(10);
      //   expect(data["getPaginatedUIGeneAliquotSpectralCount"].pagination).toEqual({
      //     count: 10,
      //     sort: "",
      //     from: 0,
      //     page: 1,
      //     total: 10,
      //     pages: 1,
      //     size: 10
      //   });
      // });

      // const op = controller.expectOne(service.geneStudySpectralCountQuery);

      // op.flush({
      //   data: {
      //     getPaginatedUIGeneStudySpectralCount: {
      //       total: 10,
      //       uiGeneStudySpectralCounts: [
      //         {
      //           submitter_id_name: "Prospective_Colon_VU_Proteome",
      //           experiment_type: "Label Free",
      //           spectral_count: 110,
      //           distinct_peptide: 7,
      //           unshared_peptide: 4,
      //           aliquots_count: 100,
      //           plexes_count: 101
      //         }
      //       ],
      //       pagination: {
      //         count: 10,
      //         sort: "",
      //         from: 0,
      //         page: 1,
      //         total: 10,
      //         pages: 1,
      //         size: 10
      //       }
      //     }
      //   }
      // });

      // controller.verify();
    }
  ));
});
