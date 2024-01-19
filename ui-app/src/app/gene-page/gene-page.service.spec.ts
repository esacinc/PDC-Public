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

    //@@@PDC-1123 call ui wrapper API
  it("test getProteinDetails", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getProteinDetails("M0R009").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiProtein"].spectral_counts.length).toBe(2);
        expect(data["uiProtein"].gene_name).toBe("A1BG");
      });

      const op = controller.expectOne(service.proteinDetailsQuery);

      op.flush({
        data: {
          uiProtein: {
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

    //@@@PDC-1123 call ui wrapper API
	//@@@PDC-7690 use gene_id to get gene info
  it("test getGeneDetails", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getGeneDetails("A1BG", "f6ba4bc5-b814-11e8-907f-0a2705229b82").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiGeneSpectralCount"].spectral_counts.length).toBe(3);
        expect(data["uiGeneSpectralCount"].authority).toBe("HGNC:5");
      });

      const op = controller.expectOne(service.geneDetailsQuery);

      op.flush({
        data: {
          uiGeneSpectralCount: {
            gene_name: "A1BG",
			gene_id: "f6ba4bc5-b814-11e8-907f-0a2705229b82",
            ncbi_gene_id: "1",
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

  it("test getGenePTMData", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getGenePTMData("A1BG", "f6ba4bc5-b814-11e8-907f-0a2705229b82", 0, 2).subscribe(data => {
        expect(data).toBeDefined();
        expect(
          data["getPaginatedUIPtm"].uiGeneStudySpectralCounts.length
        ).toBe(1);
        expect(data["getPaginatedUIPtm"].total).toBe(8);
        expect(data["getPaginatedUIPtm"].pagination).toEqual({
          count: 2,
          sort: "",
          from: 0,
          page: 1,
          total: 8,
          pages: 4,
          size: 2
        });
      });

      const op = controller.expectOne(service.genePTMDataQuery);

      op.flush({
        data: {
          getPaginatedUIPtm: {
            total: 8,
            uiPtm:  [
              {
                ptm_type: "acetyl",
                site: "NP_570602.2:k134",
                peptide: "SLPAPWLSMAPVSWITPGLk"
              },
              {
                ptm_type: "acetyl",
                site: "NP_570602.2:k248",
                peptide: "RGEkELLVPR"
              }
            ],
            pagination: {
              count: 2,
              sort: "",
              from: 0,
              page: 1,
              total: 8,
              pages: 4,
              size: 2
            }
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getStudySpectralCount", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getStudySpectralCount("A1BG", "f6ba4bc5-b814-11e8-907f-0a2705229b82", 0, 1, "", []).subscribe(data => {
        expect(data).toBeDefined();
        expect(
          data["getPaginatedUIGeneStudySpectralCountFiltered"].uiGeneStudySpectralCounts.length
        ).toBe(1);
        expect(data["getPaginatedUIGeneStudySpectralCountFiltered"].total).toBe(36);
        expect(data["getPaginatedUIGeneStudySpectralCountFiltered"].pagination).toEqual({
          count: 1,
          sort: "",
          from: 0,
          page: 1,
          total: 36,
          pages: 36,
          size: 1
        });
      });

      const op = controller.expectOne(service.geneStudySpectralCountQuery);

      op.flush({
        data: {
          getPaginatedUIGeneStudySpectralCountFiltered: {
            total: 36,
            uiGeneStudySpectralCounts: [
              {
                pdc_study_id: "PDC000109",
                submitter_id_name: "Prospective Colon VU Proteome",
                experiment_type: "Label Free",
                spectral_count: 648,
                distinct_peptide: 17,
                unshared_peptide: 17,
                aliquots_count: 100,
                plexes_count: 101
              }
            ],
            pagination: {
              count: 1,
              sort: "",
              from: 0,
              page: 1,
              total: 36,
              pages: 36,
              size: 1
            }
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getAliquotSpectralCount", inject(
    [GenePageService],
    (service: GenePageService) => {
      service.getAliquotSpectralCount("A1BG", "f6ba4bc5-b814-11e8-907f-0a2705229b82", 0, 1, "", []).subscribe(data => {
        expect(data).toBeDefined();
        expect(
          data["getPaginatedUIGeneAliquotSpectralCountFiltered"].uiGeneAliquotSpectralCounts.length
        ).toBe(1);
        expect(data["getPaginatedUIGeneAliquotSpectralCountFiltered"].total).toBe(4950);
        expect(data["getPaginatedUIGeneAliquotSpectralCountFiltered"].pagination).toEqual({
          count: 1,
          sort: "",
          from: 0,
          page: 1,
          total: 4950,
          pages: 4950,
          size: 1
        });
      });

      const op = controller.expectOne(service.geneAliquotSpectralCountQuery);

      op.flush({
        data: {
          getPaginatedUIGeneAliquotSpectralCountFiltered: {
            total: 4950,
            uiGeneAliquotSpectralCounts: [
              {
                aliquot_id: "CPT0209040003",
                plex: "04CPTAC_LSCC_Proteome_BI_20190629",
                label: "TMT_129n",
                submitter_id_name: "CPTAC LSCC Discovery Study - Proteome",
                pdc_study_id: "PDC000234",
                experiment_type: "TMT11",
                spectral_count: 96,
                distinct_peptide: 43,
                unshared_peptide: 43,
                precursor_area: "",
                log2_ratio: "0.6688",
                unshared_precursor_area: "",
                unshared_log2_ratio: "0.6628"
              }
            ],
            pagination: {
              count: 1,
              sort: "",
              from: 0,
              page: 1,
              total: 4950,
              pages: 4950,
              size: 1
            }
          }
        }
      });

      controller.verify();
    }
  ));

});
