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
            "CA25730263-1"
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
                case_submitter_id: "CA25730263-1",
                external_case_id: null,
                imaging_resource: null,
                ethnicity: "Not Received",
                gender: "Female",
                race: "not reported",
                morphology: "",
                primary_diagnosis: "Clear cell RCC",
                site_of_resection_or_biopsy: "kidney",
                tissue_or_organ_of_origin: "kidney",
                tumor_grade: "G2",
                tumor_stage: "pT3a",
                age_at_diagnosis: "16790",
                classification_of_tumor: "Progressive",
                days_to_recurrence: "343",          
                case_id: "b7a788a4-f3a7-11e8-a44b-0a9c39d33490",
                disease_type: "Clear Cell Renal Cell Carcinoma",
                primary_site: "Kidney",
                program_name: "Aebersold Lab",
                project_name: "Quantitative digital maps of tissue biopsies",
                status: "Qualified"
              },
              {
                case_submitter_id: "CA25730263-2",
                external_case_id: null,
                imaging_resource: null,
                ethnicity: "Not Received",
                gender: "Female",
                race: "not reported",
                morphology: "",
                primary_diagnosis: "Clear cell RCC",
                site_of_resection_or_biopsy: "kidney",
                tissue_or_organ_of_origin: "kidney",
                tumor_grade: "G3",
                tumor_stage: "pT4",
                age_at_diagnosis: "16790",
                classification_of_tumor: "Progressive",
                days_to_recurrence: "343",                          
                case_id: "b9458a58-f3a7-11e8-a44b-0a9c39d33490",
                disease_type: "Clear Cell Renal Cell Carcinoma",
                primary_site: "Kidney",
                program_name: "Aebersold Lab",
                project_name: "Quantitative digital maps of tissue biopsies",
                status: "Qualified"
              }
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 369,
              pages: 37,
              size: 10
            }
          }
        }
      });

      controller.verify();
    }
  ));
});
