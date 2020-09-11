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
      service.getFilteredCasesPaginated(0, 2, "", {}).subscribe(data => {
        expect(data).toBeDefined();
        expect(data["getPaginatedUICase"].uiCases.length).toBe(2);
        expect(data["getPaginatedUICase"].total).toBe(3160);
        expect(data["getPaginatedUICase"].pagination).toEqual({
          count: 2,
          sort: "",
          from: 0,
          page: 1,
          total: 3160,
          pages: 316,
          size: 2
        });
      });

      const op = controller.expectOne(service.filteredCasesPaginatedQuery);
      expect(op.operation.variables.offset_value).toBe(0);

      op.flush({
        data: {
          getPaginatedUICase: {
            total: 3160,
            uiCases: [
              {
				  aliquot_id: "0003cc2c-6429-11e8-bcf1-0a2705229b82",
				  sample_id: "398a4199-6420-11e8-bcf1-0a2705229b82",
				  case_id: "c3a38e6a-63d8-11e8-bcf1-0a2705229b82",
				  aliquot_submitter_id: "TCGA-AO-A12B-01A-41-A21V-30",
				  aliquot_is_ref: "no",
				  aliquot_status: "Qualified",
				  aliquot_quantity: null,
				  aliquot_volume: null,
				  amount: null,
				  analyte_type: null,
				  concentration: null,
				  case_status: "Qualified",
				  sample_status: "Qualified",
				  sample_submitter_id: "TCGA-AO-A12B-01A",
				  sample_is_ref: null,
				  biospecimen_anatomic_site: null,
				  composition: null,
				  current_weight: null,
				  days_to_collection: null,
				  days_to_sample_procurement: null,
				  diagnosis_pathologically_confirmed: null,
				  freezing_method: null,
				  initial_weight: null,
				  intermediate_dimension: null,
				  is_ffpe: null,
				  longest_dimension: null,
				  method_of_sample_procurement: null,
				  oct_embedded: null,
				  pathology_report_uuid: null,
				  preservation_method: null,
				  sample_type_id: null,
				  shortest_dimension: null,
				  time_between_clamping_and_freezing: null,
				  time_between_excision_and_freezing: null,
				  tissue_type: null,
				  tumor_code: null,
				  tumor_code_id: null,
				  tumor_descriptor: null,
				  case_submitter_id: "TCGA-AO-A12B",
				  program_name: "Clinical Proteomic Tumor Analysis Consortium",
				  project_name: "CPTAC2 Retrospective",
				  sample_type: "Primary Tumor",
				  disease_type: "Breast Invasive Carcinoma",
				  primary_site: "Breast"
				},
				{
				  aliquot_id: "004c5675-1272-11e9-afb9-0a9c39d33490",
				  sample_id: "3e888cef-1259-11e9-afb9-0a9c39d33490",
				  case_id: "6e7501ca-118a-11e9-afb9-0a9c39d33490",
				  aliquot_submitter_id: "CPT0073530001",
				  aliquot_is_ref: "no",
				  aliquot_status: "Qualified",
				  aliquot_quantity: null,
				  aliquot_volume: null,
				  amount: null,
				  analyte_type: null,
				  concentration: null,
				  case_status: "Qualified",
				  sample_status: "Qualified",
				  sample_submitter_id: "C3L-01257-02",
				  sample_is_ref: null,
				  biospecimen_anatomic_site: null,
				  composition: null,
				  current_weight: null,
				  days_to_collection: null,
				  days_to_sample_procurement: null,
				  diagnosis_pathologically_confirmed: null,
				  freezing_method: null,
				  initial_weight: null,
				  intermediate_dimension: null,
				  is_ffpe: null,
				  longest_dimension: null,
				  method_of_sample_procurement: null,
				  oct_embedded: null,
				  pathology_report_uuid: null,
				  preservation_method: null,
				  sample_type_id: null,
				  shortest_dimension: null,
				  time_between_clamping_and_freezing: null,
				  time_between_excision_and_freezing: null,
				  tissue_type: null,
				  tumor_code: null,
				  tumor_code_id: null,
				  tumor_descriptor: null,
				  case_submitter_id: "C3L-01257",
				  program_name: "Clinical Proteomic Tumor Analysis Consortium",
				  project_name: "CPTAC3-Discovery",
				  sample_type: "Solid Tissue Normal",
				  disease_type: "Uterine Corpus Endometrial Carcinoma",
				  primary_site: "Uterus, NOS"
				}
            ],
            pagination: {
              count: 2,
              sort: "",
              from: 0,
              page: 1,
              total: 3160,
              pages: 316,
              size: 2
            }
          }
        }
      });

      controller.verify();
    }
  ));
});
