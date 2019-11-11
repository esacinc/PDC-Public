import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { FrontPageService } from "./front-page.service";
import gql from "graphql-tag";

describe("FrontPageService", () => {
  let apolloController: ApolloTestingController;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FrontPageService],
      imports: [ApolloTestingModule, HttpClientTestingModule]
    });

    apolloController = TestBed.get(ApolloTestingController);
    httpController = TestBed.get(HttpTestingController);
  });

  it("should be created", inject([FrontPageService], (service: FrontPageService) => {
    expect(service).toBeTruthy();
  }));

  it("test getNewsItems", inject([FrontPageService], (service: FrontPageService) => {
    service.getNewsItems().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBe(3);
    });

    const op = httpController.expectOne("assets/data-folder/news.json");

    expect(op.request.method).toEqual("GET");

    op.flush([1, 2, 3]);

    httpController.verify();
  }));

  it("test getTissueSites", inject([FrontPageService], (service: FrontPageService) => {
    service.getTissueSites().subscribe(data => {
      expect(data["uiTissueSiteCaseCount"]).toBeDefined();
      expect(data["uiTissueSiteCaseCount"].length).toBe(3);
      expect(data["uiTissueSiteCaseCount"][0].cases_count).toBe(14);
    });

    const op = apolloController.expectOne(gql`
      query allTissueSites {
        uiTissueSiteCaseCount {
          tissue_or_organ_of_origin
          cases_count
        }
      }
    `);

    op.flush({
      data: {
        uiTissueSiteCaseCount: [
          {
            tissue_or_organ_of_origin: "Ascending colon",
            cases_count: 14
          },
          {
            tissue_or_organ_of_origin: "Breast",
            cases_count: 119
          },
          {
            tissue_or_organ_of_origin: "Breast, NOS",
            cases_count: 102
          }
        ]
      }
    });

    apolloController.verify();
  }));

    //@@@PDC-1123 call ui wrapper API
  it("test getPortalStats", inject([FrontPageService], (service: FrontPageService) => {
    service.getPortalStats().subscribe(data => {
      expect(data["uiPdcDataStats"]).toBeDefined();
      expect(data["uiPdcDataStats"].length).toBe(1);
      expect(data["uiPdcDataStats"][0].program).toBe(1);
    });

    const op = apolloController.expectOne(gql`
      query allStats {
        uiPdcDataStats {
          program
          study
          spectra
          data_label
          protein
          project
          peptide
          data_size
          data_label
          data_file
        }
      }
    `);

    op.flush({
      data: {
        uiPdcDataStats: [
          {
            program: 1,
            study: 15,
            spectra: 52479020,
            protein: 12704,
            project: 2,
            peptide: 991578,
            data_size: 6,
            data_label: "test4",
            data_file: 24298
          }
        ]
      }
    });

    apolloController.verify();
  }));

    //@@@PDC-1123 call ui wrapper API
  it("test getDiseases", inject([FrontPageService], (service: FrontPageService) => {
    service.getDiseases().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBe(2);
      expect(data[0].disease_type).toBe("Breast Invasive Carcinoma");
    });

    const op = apolloController.expectOne(gql`
      query allDiseases {
        uiDiseasesAvailable {
          disease_type
          tissue_or_organ_of_origin
          project_submitter_id
          cases_count
        }
      }
    `);

    op.flush({
      data: {
        uiDiseasesAvailable: [
          {
            disease_type: "Breast Invasive Carcinoma",
            tissue_or_organ_of_origin: "Breast",
            project_submitter_id: "CPTAC-2",
            cases_count: 119
          },
          {
            disease_type: "Colon Adenocarcinoma",
            tissue_or_organ_of_origin: "Colon",
            project_submitter_id: "CPTAC-2",
            cases_count: 107
          }
        ]
      }
    });

    apolloController.verify();
  }));

  it("test getAllPrograms", inject([FrontPageService], (service: FrontPageService) => {
    service.getAllPrograms().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBe(2);
      expect(data[0]["program_submitter_id"]).toBe("CPTAC");
    });

    //@@@PDC-1123 call ui wrapper API
    const op = apolloController.expectOne(gql`
      query Programs {
        uiAllPrograms {
          program_submitter_id
          name
          sponsor
          start_date
          end_date
          program_manager
          projects {
            project_submitter_id
          }
        }
      }
    `);

    op.flush({
      data: {
        uiAllPrograms: [
          {
            program_submitter_id: "CPTAC",
            name: "Clinical Proteomic Tumor Analysis Consortium",
            sponsor: "NCI",
            start_date: "01/01/2012",
            end_date: "",
            program_manager: "Christopher Kinsinger",
            projects: null
          },
          {
            program_submitter_id: "PG25730263",
            name:
              "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
            sponsor: "",
            start_date: "11/26/2018",
            end_date: "",
            program_manager: "John Doe",
            projects: null
          }
        ]
      },
      errors: []
    });

    apolloController.verify();
  }));
});
