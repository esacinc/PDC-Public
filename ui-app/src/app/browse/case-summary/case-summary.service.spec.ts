import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { CaseSummaryService } from "./case-summary.service";

describe("CaseSummaryService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseSummaryService],
      imports: [ApolloTestingModule],
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
      service
        .getCaseSummaryData("TCGA-E2-A10A", "TCGA-E2-A10A")
        .subscribe((data) => {
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
              primary_site: "kidney",
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
              primary_site: "kidney",
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
              primary_site: "kidney",
            },
          ],
        },
      });

      controller.verify();
    }
  ));

  //@@@PDC-1123 add ui wrappers public APIs
  it("test getDetailedCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getDetailedCaseSummaryData("TCGA-61-1911").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"].case_id).toBe(
          "0067a0e0-63d8-11e8-bcf1-0a2705229b82"
        );
      });

      const op = controller.expectOne(service.caseDataDetailedQuery);

      expect(op.operation.variables.case_id).toEqual("TCGA-61-1911");

      op.flush({
        data: {
          uiCaseSummary: {
            case_id: "df4e907e-8f98-11ea-b1fd-0aad30af8a83",
            case_submitter_id: "C3L-00977",
            project_submitter_id: "CPTAC3-Discovery",
            disease_type: "Head and Neck Squamous Cell Carcinoma",
            external_case_id: "GDC: b18f1b80-72f1-465c-816b-65e06d2b1fa6",
            tissue_source_site_code: "Cureline-7",
            days_to_lost_to_followup: null,
            index_date: "Diagnosis",
            lost_to_followup: "No",
            primary_site: "Head and Neck",
            demographics: [
              {
                ethnicity: "Not Reported",
                gender: "Male",
                demographic_submitter_id: "C3L-00977-DM",
                race: "Not Reported",
                cause_of_death: null,
                days_to_birth: -20653,
                days_to_death: null,
                vital_status: "Alive",
                year_of_birth: 1960,
                year_of_death: null,
              },
            ],
            diagnoses: [
              {
                tissue_or_organ_of_origin:
                  "Overlapping lesion of lip, oral cavity and pharynx",
                age_at_diagnosis: "20653",
                primary_diagnosis: "Squamous cell carcinoma, NOS",
                tumor_grade: "G1",
                tumor_stage: "Stage III",
                diagnosis_submitter_id: "C3L-00977-DX",
                classification_of_tumor: "Not Reported",
                days_to_last_follow_up: "772",
                days_to_last_known_disease_status: "772",
                days_to_recurrence: null,
                last_known_disease_status: "Tumor Free",
                morphology: "8070/3",
                progression_or_recurrence: "No",
                site_of_resection_or_biopsy: "Floor of mouth, NOS",
                prior_malignancy: "No",
                ajcc_clinical_m: "M0",
                ajcc_clinical_n: null,
                ajcc_clinical_stage: null,
                ajcc_clinical_t: null,
                ajcc_pathologic_m: "M0",
                ajcc_pathologic_n: "N1",
                ajcc_pathologic_stage: null,
                ajcc_pathologic_t: "T1",
                ajcc_staging_system_edition: "7th",
                ann_arbor_b_symptoms: null,
                ann_arbor_clinical_stage: null,
                ann_arbor_extranodal_involvement: null,
                ann_arbor_pathologic_stage: null,
                best_overall_response: null,
                burkitt_lymphoma_clinical_variant: null,
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
                lymphatic_invasion_present: "Unknown",
                method_of_diagnosis: null,
                new_event_anatomic_site: null,
                new_event_type: null,
                overall_survival: null,
                perineural_invasion_present: null,
                prior_treatment: null,
                progression_free_survival: null,
                progression_free_survival_event: null,
                residual_disease: "R0",
                vascular_invasion_present: null,
                year_of_diagnosis: null,
              },
            ],
            samples: [
              {
                sample_id: "df4f3418-8f98-11ea-b1fd-0aad30af8a83",
                gdc_sample_id: null,
                gdc_project_id: null,
                sample_submitter_id: "C3L-00977-02",
                sample_type: "Primary Tumor",
                biospecimen_anatomic_site: null,
                composition: "Solid Tissue",
                current_weight: null,
                days_to_collection: null,
                days_to_sample_procurement: null,
                diagnosis_pathologically_confirmed: null,
                freezing_method: "LN2",
                initial_weight: 200,
                intermediate_dimension: null,
                is_ffpe: "0",
                longest_dimension: null,
                method_of_sample_procurement: null,
                oct_embedded: null,
                pathology_report_uuid: null,
                preservation_method: "Snap Frozen",
                sample_type_id: null,
                shortest_dimension: null,
                time_between_clamping_and_freezing: null,
                time_between_excision_and_freezing: "9",
                tissue_type: "Tumor",
                tumor_code: null,
                tumor_code_id: null,
                tumor_descriptor: null,
                aliquots: [
                  {
                    aliquot_id: "df505d94-8f98-11ea-b1fd-0aad30af8a83",
                    aliquot_submitter_id: "CPT0169640003",
                    aliquot_quantity: null,
                    aliquot_volume: null,
                    amount: null,
                    analyte_type: "protein",
                    concentration: null,
                  },
                ],
              },
            ],
          },
        },
        errors: [
          {
            message: "Unknown column 'label' in 'field list'",
            locations: [
              {
                line: 115,
                column: 7,
              },
            ],
            path: ["uiCaseSummary", "samples", 0, "aliquots"],
          },
        ],
      });

      controller.verify();
    }
  ));

  it("test getExprimentFileByCaseCountData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service
        .getExprimentFileByCaseCountData("TCGA-61-1911")
        .subscribe((data) => {
          expect(data).toBeDefined();
          expect(data["uiExperimentFileCount"].length).toBe(1);
          expect(data["uiExperimentFileCount"][0].files_count).toBe(7650);
        });

      const op = controller.expectOne(service.exprimentFileByCaseCountQuery);

      expect(op.operation.variables.case_id_filter).toEqual("TCGA-61-1911");

      op.flush({
        data: {
          uiExperimentFileCount: [
            {
              acquisition_type: "DDA",
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
              experiment_type: "iTRAQ4",
              files_count: 7650,
            },
          ],
        },
      });

      controller.verify();
    }
  ));

  it("test getDataCategoryFileByCaseCountData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service
        .getDataCategoryFileByCaseCountData("TCGA-61-1911")
        .subscribe((data) => {
          expect(data).toBeDefined();
          expect(data["uiDataCategoryFileCount"].length).toBe(6);
          expect(data["uiDataCategoryFileCount"][0].files_count).toBe(1904);
        });

      const op = controller.expectOne(service.dataCategoryFileByCaseCountQuery);

      expect(op.operation.variables.case_id_filter).toEqual("TCGA-61-1911");

      op.flush({
        data: {
          uiDataCategoryFileCount: [
            {
              file_type: "MZML",
              data_category: "Raw Mass Spectra",
              files_count: 1904,
              submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
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
            },
          ],
        },
      });

      controller.verify();
    }
  ));
});
