import {
  ApolloTestingModule,
  ApolloTestingController
} from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { CaseSummaryService } from "./case-summary.service";

describe("CaseSummaryService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseSummaryService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getCaseSummaryData("TCGA-E2-A10A").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiCase"].searchCases.length).toBe(3);
        expect(data["uiCase"].searchCases[0].aliquot_id).toBe(
          "45964de9-f3b7-11e8-a44b-0a9c39d33490"
        );
        expect(data["uiCase"].searchCases[1].aliquot_id).toBe(
          "471bb3b2-f3b7-11e8-a44b-0a9c39d33490"
        );
        expect(data["uiCase"].searchCases[2].aliquot_id).toBe(
          "48cac280-f3b7-11e8-a44b-0a9c39d33490"
        );
      });

      const op = controller.expectOne(service.caseSummaryData);

      expect(op.operation.variables.case_submitter_id).toEqual("TCGA-E2-A10A");

      op.flush({
        data: {
          uiCase: [
            {
              aliquot_id: "45964de9-f3b7-11e8-a44b-0a9c39d33490",
              sample_id: "af11921c-f3b3-11e8-a44b-0a9c39d33490",
              case_id: "b7a788a4-f3a7-11e8-a44b-0a9c39d33490",
              project_name:
                "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
              program_name:
                "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
              sample_type: "Normal",
              disease_type: "Renal Cell Carcinoma",
              primary_site: "kidney"
            },
            {
              aliquot_id: "471bb3b2-f3b7-11e8-a44b-0a9c39d33490",
              sample_id: "b17afbf5-f3b3-11e8-a44b-0a9c39d33490",
              case_id: "b7a788a4-f3a7-11e8-a44b-0a9c39d33490",
              project_name:
                "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
              program_name:
                "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
              sample_type: "Tumor",
              disease_type: "Renal Cell Carcinoma",
              primary_site: "kidney"
            },
            {
              aliquot_id: "48cac280-f3b7-11e8-a44b-0a9c39d33490",
              sample_id: "b40e32c3-f3b3-11e8-a44b-0a9c39d33490",
              case_id: "b9458a58-f3a7-11e8-a44b-0a9c39d33490",
              project_name:
                "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
              program_name:
                "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
              sample_type: "Normal",
              disease_type: "Renal Cell Carcinoma",
              primary_site: "kidney"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  //@@@PDC-1123 add ui wrappers public APIs
  it("test getDetailedCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getDetailedCaseSummaryData("TCGA-61-1911").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"].case_id).toBe(
          "0067a0e0-63d8-11e8-bcf1-0a2705229b82"
        );
      });

      const op = controller.expectOne(service.caseDataDetailedQuery);

      expect(op.operation.variables.case_submitter_id).toEqual("TCGA-61-1911");

      op.flush({
        data: {
          uiCaseSummary: {
            case_id: "0067a0e0-63d8-11e8-bcf1-0a2705229b82",
            case_submitter_id: "TCGA-61-1911",
            project_submitter_id: "CPTAC-TCGA",
            disease_type: "Ovarian Serous Cystadenocarcinoma",
            external_case_id: null,
            tissue_source_site_code: "",
            days_to_lost_to_followup: 0,
            index_date: "",
            lost_to_followup: "",
            primary_site: "Ovary",
            demographics: [
              {
                ethnicity: "not hispanic or latino",
                gender: "female",
                demographic_submitter_id: "TCGA-61-1911-DM",
                race: "white",
                cause_of_death: null,
                days_to_birth: null,
                days_to_death: null,
                vital_status: null,
                year_of_birth: null,
                year_of_death: null
              }
            ],
            diagnoses: [
              {
                tissue_or_organ_of_origin: "Ovary",
                age_at_diagnosis: "20144",
                primary_diagnosis: "C56.9",
                tumor_grade: "not reported",
                tumor_stage: "not reported",
                diagnosis_submitter_id: "TCGA-61-1911-DX",
                classification_of_tumor: "not reported",
                days_to_last_follow_up: "1293",
                days_to_last_known_disease_status: "--",
                days_to_recurrence: "--",
                last_known_disease_status: "not reported",
                morphology: "8441/3",
                progression_or_recurrence: "not reported",
                site_of_resection_or_biopsy: "C56.9",
                vital_status: "",
                days_to_birth: "-20144",
                days_to_death: "--",
                prior_malignancy: "not reported",
                ajcc_clinical_m: null,
                ajcc_clinical_n: null,
                ajcc_clinical_stage: null,
                ajcc_clinical_t: null,
                ajcc_pathologic_m: null,
                ajcc_pathologic_n: null,
                ajcc_pathologic_stage: null,
                ajcc_pathologic_t: null,
                ann_arbor_b_symptoms: null,
                ann_arbor_clinical_stage: null,
                ann_arbor_extranodal_involvement: null,
                ann_arbor_pathologic_stage: null,
                best_overall_response: null,
                burkitt_lymphoma_clinical_variant: null,
                cause_of_death: null,
                circumferential_resection_margin: null,
                colon_polyps_history: null,
                days_to_best_overall_response: null,
                days_to_diagnosis: null,
                days_to_hiv_diagnosis: null,
                days_to_new_event: null,
                figo_stage: null,
                hiv_positive: null,
                hpv_positive_type: null,
                hpv_status: null,
                iss_stage: null,
                laterality: null,
                ldh_level_at_diagnosis: null,
                ldh_normal_range_upper: null,
                lymph_nodes_positive: null,
                lymphatic_invasion_present: null,
                method_of_diagnosis: null,
                new_event_anatomic_site: null,
                new_event_type: null,
                overall_survival: null,
                perineural_invasion_present: null,
                prior_treatment: null,
                progression_free_survival: null,
                progression_free_survival_event: null,
                residual_disease: null,
                vascular_invasion_present: null,
                year_of_diagnosis: null
              }
            ],
            samples: [
              {
                gdc_sample_id: "7f7b442a-3985-4f4a-98b1-da82670c957c",
                gdc_project_id: "TCGA-OV",
                sample_submitter_id: "TCGA-61-1911-01A",
                sample_type: "Primary Tumor",
                biospecimen_anatomic_site: null,
                composition: null,
                current_weight: null,
                days_to_collection: null,
                days_to_sample_procurement: null,
                diagnosis_pathologically_confirmed: null,
                freezing_method: null,
                initial_weight: null,
                Intermediate_dimension: null,
                is_ffpe: null,
                longest_dimension: null,
                method_of_sample_procurement: null,
                oct_embedded: null,
                pathology_report_uuid: null,
                preservation_method: null,
                sample_type_id: "1",
                shortest_dimension: null,
                time_between_clamping_and_freezing: null,
                time_between_excision_and_freezing: null,
                tissue_type: null,
                tumor_code: null,
                tumor_code_id: null,
                tumor_descriptor: null,
                aliquots: null
              }
            ]
          }
        },
        errors: [
          {
            message: "Unknown column 'label' in 'field list'",
            locations: [
              {
                line: 115,
                column: 7
              }
            ],
            path: ["uiCaseSummary", "samples", 0, "aliquots"]
          }
        ]
      });

      controller.verify();
    }
  ));

  it("test getExprimentFileByCaseCountData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service
        .getExprimentFileByCaseCountData("TCGA-61-1911")
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiExperimentFileCount"].length).toBe(1);
          expect(data["uiExperimentFileCount"][0].files_count).toBe(7650);
        });

      const op = controller.expectOne(service.exprimentFileByCaseCountQuery);

      expect(op.operation.variables.case_submitter_id_filter).toEqual(
        "TCGA-61-1911"
      );

      op.flush({
        data: {
          uiExperimentFileCount: [
            {
              acquisition_type: "DDA",
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
              experiment_type: "iTRAQ4",
              files_count: 7650
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getDataCategoryFileByCaseCountData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service
        .getDataCategoryFileByCaseCountData("TCGA-61-1911")
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiDataCategoryFileCount"].length).toBe(6);
          expect(data["uiDataCategoryFileCount"][0].files_count).toBe(1904);
        });

      const op = controller.expectOne(service.dataCategoryFileByCaseCountQuery);

      expect(op.operation.variables.case_submitter_id_filter).toEqual(
        "TCGA-61-1911"
      );

      op.flush({
        data: {
          uiDataCategoryFileCount: [
            {
              file_type: "MZML",
              data_category: 'Raw Mass Spectra',
              files_count: 1904,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome"
            },
            {
              file_type: "PROTOCOL",
              data_category: "Processed Mass Spectra",
              files_count: 24,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
            },
            {
              file_type: "PROT_ASSEM",
              data_category: "Protein Assembly",
              files_count: 10,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
            },
            {
              file_type: "PSM-MZID",
              data_category: "Processed Mass Spectra",
              files_count: 1904,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
            },
            {
              file_type: "PSM-TSV",
              data_category: "Protein Assembly",
              files_count: 1904,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
            },
            {
              file_type: "RAW",
              data_category: "Raw Mass Spectra",
              files_count: 1904,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
            }
          ]
        }
      });

      controller.verify();
    }
  ));
});
