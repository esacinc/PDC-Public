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
        expect(data["sample"].length).toBe(1);
        expect(data["sample"][0].sample_submitter_id).toBe("C3L-00796-01");
        expect(data["sample"][0].case_submitter_id).toBe("C3L-00796-01");
      });

      const op = controller.expectOne(service.searchSampleSubmitterIDQuery);

      op.flush({
        data: {
          sample: [
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
        expect(data["sample"].length).toBe(1);
        expect(data["sample"][0].sample_submitter_id).toBe("C3L-00796-01");
        expect(data["sample"][0].case_submitter_id).toBe("C3L-00796");
      });

      const op = controller.expectOne(service.searchSampleUUIDQuery);

      op.flush({
        data: {
          sample: [
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
        expect(data["case"].length).toBe(1);
        expect(data["case"][0].case_submitter_id).toBe("NCI7-2");
      });

      const op = controller.expectOne(service.searchCaseUUIDQuery);

      op.flush({
        data: {
          case: [
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
});
