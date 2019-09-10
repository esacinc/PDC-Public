import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByCaseService } from "./browse-by-case.service";
import gql from "graphql-tag";

describe("BrowseByCaseService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseByCaseService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseByCaseService],
    (service: BrowseByCaseService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getAllData", inject([BrowseByCaseService], (service: BrowseByCaseService) => {
    service.getAllData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiCase"].length).toBe(2);
      expect(data["uiCase"][0].case_id).toBe("b7a788a4-f3a7-11e8-a44b-0a9c39d33490");
      expect(data["uiCase"][1].case_id).toBe("b7a788a4-f3a7-11e8-a44b-0a9c39d33490");
    });

    const op = controller.expectOne(gql`
      query CasesData {
        uiCase {
          aliquot_submitter_id
          sample_submitter_id
          case_id
          case_submitter_id
          project_name
          program_name
          sample_type
          disease_type
          primary_site
        }
      }
    `);

    op.flush({
      data: {
        uiCase: [
          {
            aliquot_submitter_id: null,
            sample_submitter_id: null,
            case_id: "b7a788a4-f3a7-11e8-a44b-0a9c39d33490",
            case_submitter_id: null,
            program_name:
              "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
            sample_type: "Normal",
            disease_type: "Renal Cell Carcinoma",
            primary_site: "kidney"
          },
          {
            aliquot_submitter_id: null,
            sample_submitter_id: null,
            case_id: "b7a788a4-f3a7-11e8-a44b-0a9c39d33490",
            case_submitter_id: null,
            program_name:
              "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
            sample_type: "Tumor",
            disease_type: "Renal Cell Carcinoma",
            primary_site: "kidney"
          }
        ]
      }
    });

    controller.verify();
  }));

  it("test getFilteredCases", inject(
    [BrowseByCaseService],
    (service: BrowseByCaseService) => {
      service
        .getFilteredCases({ project_name: "CPTAC-Retrospective" })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiCase"].length).toBe(2);
          expect(data["uiCase"][0].case_id).toBe("ebd22406-63d8-11e8-bcf1-0a2705229b82");
          expect(data["uiCase"][1].case_id).toBe("da282277-63d8-11e8-bcf1-0a2705229b82");
        });

      const op = controller.expectOne(service.filteredCasesQuery);

      expect(op.operation.variables.project_name_filter).toEqual("CPTAC-Retrospective");

      op.flush({
        data: {
          uiCase: [
            {
              aliquot_submitter_id: null,
              sample_submitter_id: null,
              case_id: "ebd22406-63d8-11e8-bcf1-0a2705229b82",
              case_submitter_id: null,
              project_name: "CPTAC-Retrospective",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              sample_type: "Primary Tumor",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast"
            },
            {
              aliquot_submitter_id: null,
              sample_submitter_id: null,
              case_id: "da282277-63d8-11e8-bcf1-0a2705229b82",
              case_submitter_id: null,
              project_name: "CPTAC-Retrospective",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              sample_type: "Primary Tumor",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredCasesPaginated", inject(
    [BrowseByCaseService],
    (service: BrowseByCaseService) => {
      service.getFilteredCasesPaginated(0, 10, "", {}).subscribe(data => {
        expect(data).toBeDefined();
        expect(data["getPaginatedUICase"].uiCases.length).toBe(2);
        expect(data["getPaginatedUICase"].total).toBe(1038);
        expect(data["getPaginatedUICase"].pagination).toEqual({
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 1038,
          pages: 104,
          size: 10
        });
      });

      const op = controller.expectOne(service.filteredCasesPaginatedQuery);
      expect(op.operation.variables.offset_value).toBe(0);

      op.flush({
        data: {
          getPaginatedUICase: {
            total: 1038,
            uiCases: [
              {
                aliquot_id: "fc85ab67-1f2e-11e9-b7f8-0a80fada099c",
                sample_id: "498613c6-1259-11e9-afb9-0a9c39d33490",
                case_id: "73a51a51-118a-11e9-afb9-0a9c39d33490",
                aliquot_submitter_id: "CPT0079570003",
                sample_submitter_id: "C3L-01284-02",
                case_submitter_id: "C3L-01284",
                aliquot_status: "Disqualified",
                case_status: "Qualified",
                sample_status: "Disqualified",
                program_name: "Clinical Proteomic Tumor Analysis Consortium",
                project_name: "CPTAC3 Discovery",
                sample_type: "Primary Tumor",
                disease_type: "Uterine Corpus Endometrial Carcinoma",
                primary_site: "Uterus, NOS"
              },
              {
                aliquot_id: "fabee473-1f2e-11e9-b7f8-0a80fada099c",
                sample_id: "bb3f7d7a-1259-11e9-afb9-0a9c39d33490",
                case_id: "b7d3d05e-118a-11e9-afb9-0a9c39d33490",
                aliquot_submitter_id: "CPT0078880003",
                sample_submitter_id: "C3N-01001-03",
                case_submitter_id: "C3N-01001",
                aliquot_status: "Disqualified",
                case_status: "Qualified",
                sample_status: "Disqualified",
                program_name: "Clinical Proteomic Tumor Analysis Consortium",
                project_name: "CPTAC3 Discovery",
                sample_type: "Primary Tumor",
                disease_type: "Uterine Corpus Endometrial Carcinoma",
                primary_site: "Uterus, NOS"
              }
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 1038,
              pages: 104,
              size: 10
            }
          }
        }
      });

      controller.verify();
    }
  ));
});
