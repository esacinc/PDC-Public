import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByClinicalService } from "./browse-by-clinical.service";

describe("BrowseByClinicalService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseByClinicalService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseByClinicalService],
    (service: BrowseByClinicalService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getFilteredClinicalDataPaginated", inject(
    [BrowseByClinicalService],
    (service: BrowseByClinicalService) => {
      service
        .getFilteredClinicalDataPaginated(0, 2, "gender asc", {
          experiment_type: "iTRAQ4;TMT10"
        })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["getPaginatedUIClinical"].uiClinical.length).toBe(2);
          expect(data["getPaginatedUIClinical"].total).toBe(369);
          expect(data["getPaginatedUIClinical"].uiClinical[0].case_submitter_id).toBe(
            "TCGA-AO-A12B"
          );
          expect(data["getPaginatedUIClinical"].pagination).toEqual({
            count: 10,
            sort: "",
            from: 0,
            page: 1,
            total: 369,
            pages: 37,
            size: 10
          });
        });

      const op = controller.expectOne(service.filteredCinicalDataPaginatedQuery);

      expect(op.operation.variables.sort_value).toEqual("gender asc");
      expect(op.operation.variables.exp_type_filter).toEqual("iTRAQ4;TMT10");

	  //@@@PDC-1305 add age_at_diagnosis et al 	
      op.flush({
        data: {
          getPaginatedUIClinical: {
            total: 369,
            uiClinical: [
              {
                case_submitter_id: "TCGA-AO-A12B",
                external_case_id: "GDC: f6ed684f-ee7a-496c-80d5-6eacd494d16a",
                imaging_resource:
                  "https://wiki.cancerimagingarchive.net/display/Public/TCGA-BRCA",
                ethnicity: "Hispanic or Latino",
                gender: "Female",
                race: "White",
                morphology: "8500/3",
                primary_diagnosis: "Infiltrating duct carcinoma, NOS",
                site_of_resection_or_biopsy: "Breast, NOS",
                tissue_or_organ_of_origin: "Breast, NOS",
                tumor_grade: "Not Reported",
                tumor_stage: "stage iia",
                age_at_diagnosis: "23150",
                classification_of_tumor: "Not Reported",
                days_to_recurrence: "0",
                case_id: "c3a38e6a-63d8-11e8-bcf1-0a2705229b82",
                disease_type: "Breast Invasive Carcinoma",
                primary_site: "Breast",
                program_name: "Clinical Proteomic Tumor Analysis Consortium",
                project_name: "CPTAC2 Retrospective",
                status: "Qualified",
                externalReferences: [
                  {
                    reference_resource_shortname: "GDC",
                    reference_entity_location:
                      "https://portal.gdc.cancer.gov/cases/f6ed684f-ee7a-496c-80d5-6eacd494d16a\r",
                  },
                ],
              },
              {
                case_submitter_id: "C3L-01257",
                external_case_id: "GDC: aeacd3ad-eb06-4ecb-b621-2f05236a0e6c",
                imaging_resource:
                  "https://wiki.cancerimagingarchive.net/display/Public/CPTAC-UCEC",
                ethnicity: "Not Reported",
                gender: "Female",
                race: "White",
                morphology: "8380/3",
                primary_diagnosis: "Endometrioid adenocarcinoma, NOS",
                site_of_resection_or_biopsy: "Corpus uteri",
                tissue_or_organ_of_origin: "Corpus uteri",
                tumor_grade: "G1",
                tumor_stage: "Stage I",
                age_at_diagnosis: "26274",
                classification_of_tumor: "Not Reported",
                days_to_recurrence: "0",
                case_id: "6e7501ca-118a-11e9-afb9-0a9c39d33490",
                disease_type: "Uterine Corpus Endometrial Carcinoma",
                primary_site: "Uterus, NOS",
                program_name: "Clinical Proteomic Tumor Analysis Consortium",
                project_name: "CPTAC3-Discovery",
                status: "Qualified",
                externalReferences: [
                  {
                    reference_resource_shortname: "GDC",
                    reference_entity_location:
                      "https://portal.gdc.cancer.gov/cases/aeacd3ad-eb06-4ecb-b621-2f05236a0e6c\r",
                  },
                ],
              },
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 369,
              pages: 37,
              size: 10,
            },
          },
        },
      });

      controller.verify();
    }
  ));
});
