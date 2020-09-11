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
	  //@@@PDC-2397 Update clinical manifest generation to include additional attributes
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
				cause_of_death: "Not Reported",
			    days_to_birth: null,
			    days_to_death: null,
			    vital_status: "alive",
			  year_of_birth: "1941",
			  year_of_death: "0",
			  days_to_last_follow_up: "2989",
			  days_to_last_known_disease_status: "0",
			  last_known_disease_status: "Not Reported",
			  progression_or_recurrence: "Not Reported",
			  prior_malignancy: "Not Reported",
			  ajcc_clinical_m: "Not Reported",
			  ajcc_clinical_n: "Not Reported",
			  ajcc_clinical_stage: "Not Reported",
			  ajcc_clinical_t: "Not Reported",
			  ajcc_pathologic_m: "Not Reported",
			  ajcc_pathologic_n: "Not Reported",
			  ajcc_pathologic_stage: "Not Reported",
			  ajcc_pathologic_t: "Not Reported",
			  ajcc_staging_system_edition: null,
			  ann_arbor_b_symptoms: "Not Reported",
			  ann_arbor_clinical_stage: "Not Reported",
			  ann_arbor_extranodal_involvement: "Not Reported",
			  ann_arbor_pathologic_stage: "Not Reported",
			  best_overall_response: null,
			  burkitt_lymphoma_clinical_variant: "Not Reported",
			  circumferential_resection_margin: "--",
			  colon_polyps_history: "--",
			  days_to_best_overall_response: null,
			  days_to_diagnosis: null,
			  days_to_hiv_diagnosis: "--",
			  days_to_new_event: "--",
			  figo_stage: "Not Reported",
			  hiv_positive: "--",
			  hpv_positive_type: "--",
			  hpv_status: "--",
			  iss_stage: "Not Reported",
			  laterality: "Not Reported",
			  ldh_level_at_diagnosis: "--",
			  ldh_normal_range_upper: "--",
			  lymph_nodes_positive: "--",
			  lymphatic_invasion_present: "Not Reported",
			  method_of_diagnosis: "Not Reported",
			  new_event_anatomic_site: "--",
			  new_event_type: "--",
			  overall_survival: null,
			  perineural_invasion_present: "Not Reported",
			  prior_treatment: "Not Reported",
			  progression_free_survival: null,
			  progression_free_survival_event: null,
			  residual_disease: "Not Reported",
			  vascular_invasion_present: "Not Reported",
			  year_of_diagnosis: "--",
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
				cause_of_death: "Not Reported",
			  days_to_birth: null,
			  days_to_death: null,
			  vital_status: "Alive",
			  year_of_birth: "1945",
			  year_of_death: "0",
			  days_to_last_follow_up: "253",
			  days_to_last_known_disease_status: "253",
			  last_known_disease_status: "Tumor free",
			  progression_or_recurrence: "no",
			  prior_malignancy: "Not Reported",
			  ajcc_clinical_m: "Not Reported",
			  ajcc_clinical_n: "Not Reported",
			  ajcc_clinical_stage: "Not Reported",
			  ajcc_clinical_t: "Not Reported",
			  ajcc_pathologic_m: "Not Reported",
			  ajcc_pathologic_n: "Not Reported",
			  ajcc_pathologic_stage: "Not Reported",
			  ajcc_pathologic_t: "Not Reported",
			  ajcc_staging_system_edition: null,
			  ann_arbor_b_symptoms: "Not Reported",
			  ann_arbor_clinical_stage: "Not Reported",
			  ann_arbor_extranodal_involvement: "Not Reported",
			  ann_arbor_pathologic_stage: "Not Reported",
			  best_overall_response: null,
			  burkitt_lymphoma_clinical_variant: "Not Reported",
			  circumferential_resection_margin: null,
			  colon_polyps_history: null,
			  days_to_best_overall_response: null,
			  days_to_diagnosis: null,
			  days_to_hiv_diagnosis: null,
			  days_to_new_event: null,
			  figo_stage: "Not Reported",
			  hiv_positive: null,
			  hpv_positive_type: null,
			  hpv_status: null,
			  iss_stage: "Not Reported",
			  laterality: "Not Reported",
			  ldh_level_at_diagnosis: null,
			  ldh_normal_range_upper: null,
			  lymph_nodes_positive: null,
			  lymphatic_invasion_present: "Not Reported",
			  method_of_diagnosis: "Not Reported",
			  new_event_anatomic_site: null,
			  new_event_type: null,
			  overall_survival: null,
			  perineural_invasion_present: "Not Reported",
			  prior_treatment: "Not Reported",
			  progression_free_survival: null,
			  progression_free_survival_event: null,
			  residual_disease: "Not Reported",
			  vascular_invasion_present: "Not Reported",
			  year_of_diagnosis: null,
                externalReferences: [
                  {
                    reference_resource_shortname: "GDC",
                    reference_entity_location:
                      "https://portal.gdc.cancer.gov/cases/aeacd3ad-eb06-4ecb-b621-2f05236a0e6c\r",
                  },
				  {
					reference_resource_shortname: "TCIA",
					reference_entity_location: "https://wiki.cancerimagingarchive.net/display/Public/CPTAC-UCEC\r"
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
