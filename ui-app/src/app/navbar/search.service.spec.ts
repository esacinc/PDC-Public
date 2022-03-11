import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";

import { inject, TestBed } from "@angular/core/testing";

import { SearchService } from "./search.service";

describe("SearchService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService],
      imports: [ApolloTestingModule],
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));

  it("test getCaseSearchResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getCaseSearchResults("case").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["caseSearch"].searchCases.length).toBe(3);
        expect(data["caseSearch"].searchCases[0].name).toBe("TCGA-61-1911");
        expect(data["caseSearch"].searchCases[1].name).toBe("TCGA-61-1914");
        expect(data["caseSearch"].searchCases[2].name).toBe("TCGA-61-1915");
      });

      const op = controller.expectOne(service.searchCaseQuery);

      op.flush({
        data: {
          caseSearch: {
            searchCases: [
              {
                record_type: "case",
                name: "TCGA-61-1911",
                case_id: "",
              },
              {
                record_type: "case",
                name: "TCGA-61-1914",
                case_id: "",
              },
              {
                record_type: "case",
                name: "TCGA-61-1915",
                case_id: "",
              },
            ],
          },
        },
      });

      controller.verify();
    }
  ));

  it("test getGeneSearchResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getGeneSearchResults("gene").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["geneSearch"].genes.length).toBe(2);
        expect(data["geneSearch"].genes[0].name).toBe("CDC42EP1");
        expect(data["geneSearch"].genes[1].name).toBe("CDC42EP2");
      });

      const op = controller.expectOne(service.searchGeneQuery);

      op.flush({
        data: {
          geneSearch: {
            genes: [
              {
                record_type: "gene",
                name: "CDC42EP1",
                description: "CDC42 effector protein 1",
              },
              {
                record_type: "gene",
                name: "CDC42EP2",
                description: "CDC42 effector protein 2",
              },
            ],
          },
        },
      });

      controller.verify();
    }
  ));

  it("test getProteinSearchResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getProteinSearchResults("protein").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["proteinSearch"].genesWithProtein.length).toBe(1);
        expect(data["proteinSearch"].genesWithProtein[0].name).toBe("A1BG");
      });

      const op = controller.expectOne(service.searchProteinQuery);

      op.flush({
        data: {
          proteinSearch: {
            genesWithProtein: [
              {
                record_type: "protein",
                name: "A1BG",
                description: "alpha-1-B glycoprotein",
                proteins: "M0R009;NP_570602.2;P04217;P04217-2",
              },
            ],
          },
        },
      });

      controller.verify();
    }
  ));

  it("test getStudySearchResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getStudySearchResults("study").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["studySearch"].studies.length).toBe(3);
        expect(data["studySearch"].studies[0].name).toBe(
          "TCGA BRCA Proteome S015-1"
        );
        expect(data["studySearch"].studies[1].name).toBe(
          "TCGA BRCA Phosphoproteome S015-2"
        );
        expect(data["studySearch"].studies[2].name).toBe(
          "TCGA COAD Proteome S016-1"
        );
      });

      const op = controller.expectOne(service.searchStudyQuery);

      op.flush({
        data: {
          studySearch: {
            studies: [
              {
                record_type: "study",
                name: "TCGA BRCA Proteome S015-1",
                submitter_id_name: "TCGA_Breast_Cancer_Proteome",
                study_id: "b8da9eeb-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "S015-1",
                pdc_study_id: "PDC000173",
              },
              {
                record_type: "study",
                name: "TCGA BRCA Phosphoproteome S015-2",
                submitter_id_name: "TCGA_Breast_Cancer_Phosphoproteome",
                study_id: "b93bb1e9-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "S015-2",
                pdc_study_id: "PDC000174",
              },
              {
                record_type: "study",
                name: "TCGA COAD Proteome S016-1",
                submitter_id_name: "TCGA_Colon_Cancer_Proteome",
                study_id: "b998098f-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "S016-1",
                pdc_study_id: "PDC000111",
              },
            ],
          },
        },
      });

      controller.verify();
    }
  ));

  it("test getAliquotSearchResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getAliquotSearchResults("CPT0065750003").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["aliquotSearch"].searchAliquots.length).toBe(1);
        expect(data["aliquotSearch"].searchAliquots[0].aliquot_id).toBe(
          "c675a936-2053-11e9-b7f8-0a80fada099c"
        );
      });

      const op = controller.expectOne(service.searchAliquotsQuery);

      op.flush({
        data: {
          aliquotSearch: {
            searchAliquots: [
              {
                aliquot_id: "c675a936-2053-11e9-b7f8-0a80fada099c",
                aliquot_submitter_id: "CPT0065750003"
              }
            ],
          },
        },
      });

      controller.verify();
    }
  ));

  it("test getSampleSubmitterIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getSampleSubmitterIDResults("C3L-00796-01").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiSampleSummary"].length).toBe(1);
        expect(data["uiSampleSummary"][0].sample_submitter_id).toBe("C3L-00796-01");
        expect(data["uiSampleSummary"][0].case_submitter_id).toBe("C3L-00796-01");
      });

      const op = controller.expectOne(service.searchSampleSubmitterIDQuery);

      op.flush({
        data: {
          uiSampleSummary: [
            {
              case_submitter_id: "C3L-00796-01",
              sample_submitter_id: "C3L-00796-01",
              sample_id: "bcd1ba03-204c-11e9-b7f8-0a80fada099c"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getSampleUUIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getSampleUUIDResults("bcd1ba03-204c-11e9-b7f8-0a80fada099c").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiSampleSummary"].length).toBe(1);
        expect(data["uiSampleSummary"][0].sample_submitter_id).toBe("C3L-00796-01");
        expect(data["uiSampleSummary"][0].case_submitter_id).toBe("C3L-00796");
      });

      const op = controller.expectOne(service.searchSampleUUIDQuery);

      op.flush({
        data: {
          uiSampleSummary: [
            {
              case_submitter_id: "C3L-00796",
              sample_submitter_id: "C3L-00796-01",
              sample_id: "bcd1ba03-204c-11e9-b7f8-0a80fada099c"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getCaseUUIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getCaseUUIDResults("00dc49de-1fba-11e9-b7f8-0a80fada099c").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"].length).toBe(1);
        expect(data["uiCaseSummary"][0].case_submitter_id).toBe("NCI7-2");
      });

      const op = controller.expectOne(service.searchCaseUUIDQuery);

      op.flush({
        data: {
          uiCaseSummary: [
            {
              case_submitter_id: "NCI7-2",
              case_id: "00dc49de-1fba-11e9-b7f8-0a80fada099c"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getStudySubmitterID", inject(
    [SearchService],
    (service: SearchService) => {
      service.getStudySubmitterID("dbe94609-1fb3-11e9-b7f8-0a80fada099c","").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiStudySummary"].length).toBe(1);
        expect(data["uiStudySummary"][0].study_id).toBe("dbe94609-1fb3-11e9-b7f8-0a80fada099c");
      });

      const op = controller.expectOne(service.fetchStudySubmitterIDQuery);

      op.flush({
        data: {
          uiStudySummary: [
            {
              study_submitter_id: "CPTAC CCRCC Discovery Study - Proteome S044-1",
              study_name: "CPTAC CCRCC Discovery Study - Proteome",
              pdc_study_id: "PDC000127",
              study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getStudybyUUIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getStudybyUUIDResults("dbe94609-1fb3-11e9-b7f8-0a80fada099c","").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiStudySummary"].length).toBe(1);
        expect(data["uiStudySummary"][0].study_submitter_id).toBe("CPTAC CCRCC Discovery Study - Proteome S044-1");
      });

      const op = controller.expectOne(service.searchStudyUUIDQuery);

      op.flush({
        data: {
          uiStudySummary: [
            {
              study_submitter_id: "CPTAC CCRCC Discovery Study - Proteome S044-1",
              study_shortname: "CPTAC CCRCC Discovery Study - Proteome S044-1"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getAliquotUUIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getAliquotUUIDResults("0f335144-23d2-4496-8e46-7e30d0f07aad").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiAliquotSummary"].length).toBe(1);
        expect(data["uiAliquotSummary"][0].case_submitter_id).toBe("PDAC005");
      });

      const op = controller.expectOne(service.searchAliquotUUIDQuery);

      op.flush({
        data: {
          uiAliquotSummary: [
            {
              case_submitter_id: "PDAC005",
              aliquot_submitter_id: "PDAC005",
              aliquot_id: "0f335144-23d2-4496-8e46-7e30d0f07aad"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getAliquotSubmitterIDResults", inject(
    [SearchService],
    (service: SearchService) => {
      service.getAliquotSubmitterIDResults("PDAC005").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiAliquotSummary"].length).toBe(1);
        expect(data["uiAliquotSummary"][0].case_submitter_id).toBe("PDAC005");
      });

      const op = controller.expectOne(service.searchAliquotSubmitterIDQuery);

      op.flush({
        data: {
          uiAliquotSummary: [
            {
              case_submitter_id: "PDAC005",
              aliquot_submitter_id: "PDAC005",
              aliquot_id: "0f335144-23d2-4496-8e46-7e30d0f07aad"
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getCaseSummaryData", inject(
    [SearchService],
    (service: SearchService) => {
      service.getCaseSummaryData("02dcc58d-656d-49af-a5bc-154bf2e86dee", "").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCase"].length).toBe(1);
        expect(data["uiCase"][0].aliquot_id).toBe("b894e659-0831-4fa8-8eae-a2b23cc75ed2");
      });

      const op = controller.expectOne(service.caseSummaryData);

      op.flush({
        data: {
          uiCase: [
            {
              case_id: "02dcc58d-656d-49af-a5bc-154bf2e86dee",
              case_submitter_id: null,
              aliquot_id: "b894e659-0831-4fa8-8eae-a2b23cc75ed2",
              sample_id: "13359afb-c4c9-496a-af48-d0a88e452ae4",
              project_name: "Proteogenomics Analysis and Mechanism Study to Develop Precision Medicine for Treatment-Resistant Pa",
              program_name: "Korea University",
              sample_type: "Primary Tumor",
              disease_type: "Pancreatic Adenocarcinoma",
              primary_site: "Pancreas",
              aliquot_submitter_id: null,
              sample_submitter_id: null
            }
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getStudySearchByExternalRef", inject(
    [SearchService],
    (service: SearchService) => {
      service.getStudySearchByExternalRef("1287").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["studySearchByExternalId"]["studies"][0].record_type).toBe("study");
        expect(data["studySearchByExternalId"]["studies"][0].pdc_study_id).toBe("PDC000123");
        expect(data["studySearchByExternalId"]["studies"][0].study_submitter_id).toBe("UCEC Discovery - CompRef Phosphoproteome S043-2");
      });

      const op = controller.expectOne(service.studySearchByExternalRefQuery);

      op.flush({
        data: {
          studySearchByExternalId: {
            studies: [
              {
                record_type: "study",
                name: "UCEC Discovery - CompRef Phosphoproteome S043-2",
                submitter_id_name: "CPTAC UCEC Discovery Study - CompRef Phosphoproteome",
                study_id: "de58a7ea-06ad-11ea-8c2e-0a7b46c3918d",
                study_submitter_id: "UCEC Discovery - CompRef Phosphoproteome S043-2",
                pdc_study_id: "PDC000123"
              }
            ],
        },
        },
      });

      controller.verify();
    }
  ));
});
