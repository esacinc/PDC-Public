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
  //@@@PDC-3095 - remove external_case_id field from uiCaseSummary API
  it("test getDetailedCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getDetailedCaseSummaryData("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"][0].case_id).toBe(
          "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c"
        );
      });

      const op = controller.expectOne(service.caseDataDetailedQuery);

      expect(op.operation.variables.case_id).toEqual("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c");

      op.flush({
        data: {
          uiCaseSummary: [
            {
              case_id: "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c",
              case_submitter_id: "C3L-00094",
              project_submitter_id: "CPTAC3-Discovery",
              disease_type: "Lung Adenocarcinoma",
              tissue_source_site_code: "SCHC",
              days_to_lost_to_followup: null,
              index_date: "",
              lost_to_followup: "No",
              primary_site: "Bronchus and lung",
              demographics: [
                {
                  ethnicity: "Not Hispanic or Latino",
                  gender: "Male",
                  demographic_submitter_id: "C3L-00094-DM",
                  race: "White",
                  cause_of_death: "Cancer Related",
                  days_to_birth: "-25560",
                  days_to_death: "889",
                  vital_status: "Dead",
                  year_of_birth: "1946",
                  year_of_death: "2018",
                  age_at_index: null,
                  premature_at_birth: null,
                  weeks_gestation_at_birth: null,
                  age_is_obfuscated: null,
                  cause_of_death_source: null,
                  occupation_duration_years: null,
                  country_of_residence_at_enrollment: null
                }
              ],
              samples: [
                {
                  sample_id: "9a27554b-d0a6-11e9-9a07-0a80fada099c",
                  gdc_sample_id: "9c157c47-9df2-49c6-a2fc-89982717307b",
                  gdc_project_id: null,
                  sample_submitter_id: "C3L-00094-06",
                  sample_type: "Solid Tissue Normal",
                  status: "Qualified",
                  pool: "No",
                  sample_is_ref: "no",
                  biospecimen_anatomic_site: "Not Reported",
                  composition: "Solid Tissue",
                  current_weight: null,
                  days_to_collection: null,
                  days_to_sample_procurement: null,
                  diagnosis_pathologically_confirmed: "Not Reported",
                  freezing_method: "LN2",
                  initial_weight: 256,
                  intermediate_dimension: "",
                  is_ffpe: "0",
                  longest_dimension: "",
                  method_of_sample_procurement: "Not Reported",
                  oct_embedded: "No",
                  pathology_report_uuid: "",
                  preservation_method: "Snap Frozen",
                  sample_type_id: null,
                  shortest_dimension: "",
                  time_between_clamping_and_freezing: "",
                  time_between_excision_and_freezing: "",
                  tissue_type: "normal",
                  tumor_code: "",
                  tumor_code_id: "",
                  tumor_descriptor: "Not Reported",
                  aliquots: [
                    {
                      aliquot_id: "5246c8b5-d0b0-11e9-9a07-0a80fada099c",
                      aliquot_submitter_id: "CPT0000930003",
                      aliquot_quantity: null,
                      aliquot_volume: null,
                      status: "Qualified",
                      pool: "No",
                      aliquot_is_ref: "no",
                      amount: null,
                      analyte_type: "protein",
                      concentration: null
                    }
                  ]
                },
                {
                  sample_id: "9a3ef50b-d0a6-11e9-9a07-0a80fada099c",
                  gdc_sample_id: "1f9c6b1c-7edd-4297-82ea-9f7bac608119",
                  gdc_project_id: null,
                  sample_submitter_id: "C3L-00094-03",
                  sample_type: "Primary Tumor",
                  status: "Qualified",
                  pool: "No",
                  sample_is_ref: "no",
                  biospecimen_anatomic_site: "Not Reported",
                  composition: "Solid Tissue",
                  current_weight: null,
                  days_to_collection: null,
                  days_to_sample_procurement: null,
                  diagnosis_pathologically_confirmed: "Not Reported",
                  freezing_method: "LN2",
                  initial_weight: 419,
                  intermediate_dimension: "",
                  is_ffpe: "0",
                  longest_dimension: "",
                  method_of_sample_procurement: "Not Reported",
                  oct_embedded: "No",
                  pathology_report_uuid: "",
                  preservation_method: "Snap Frozen",
                  sample_type_id: null,
                  shortest_dimension: "",
                  time_between_clamping_and_freezing: "",
                  time_between_excision_and_freezing: "",
                  tissue_type: "tumor",
                  tumor_code: "",
                  tumor_code_id: "",
                  tumor_descriptor: "Primary",
                  aliquots: [
                    {
                      aliquot_id: "5225d754-d0b0-11e9-9a07-0a80fada099c",
                      aliquot_submitter_id: "CPT0000920017",
                      aliquot_quantity: null,
                      aliquot_volume: null,
                      status: "Qualified",
                      pool: "No",
                      aliquot_is_ref: "no",
                      amount: null,
                      analyte_type: "protein",
                      concentration: null
                    }
                  ]
                }
              ]
            }
          ]
        }
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

  it("test getDiagnosisCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getDiagnosisCaseSummaryData("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"][0].case_id).toBe(
          "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c"
        );
      });

      const op = controller.expectOne(service.diagnosisDataDetailedQuery);

      expect(op.operation.variables.case_id).toEqual("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c");

      op.flush({
        data: {
          uiCaseSummary: [
            {
              case_id: "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c",
              case_submitter_id: "C3L-00094",
              project_submitter_id: "CPTAC3-Discovery",
              disease_type: "Lung Adenocarcinoma",
              tissue_source_site_code: "SCHC",
              days_to_lost_to_followup: null,
              index_date: "",
              lost_to_followup: "No",
              primary_site: "Bronchus and lung",
              diagnoses: [
                {
                  age_at_diagnosis: "25560",
                  morphology: "8140/3",
                  primary_diagnosis: "Adenocarcinoma, NOS",
                  tumor_grade: "G3",
                  tumor_stage: "Stage IA",
                  tissue_or_organ_of_origin: "Middle lobe, lung",
                  diagnosis_submitter_id: "C3L-00094-DX",
                  classification_of_tumor: null,
                  days_to_last_follow_up: "889.00",
                  days_to_last_known_disease_status: "889.00",
                  days_to_recurrence: "638.00",
                  last_known_disease_status: "With Tumor",
                  progression_or_recurrence: "Yes",
                  site_of_resection_or_biopsy: "Middle lobe, lung",
                  prior_malignancy: null,
                  ajcc_clinical_m: "M0",
                  ajcc_clinical_n: null,
                  ajcc_clinical_stage: null,
                  ajcc_clinical_t: null,
                  ajcc_pathologic_m: "Unknown",
                  ajcc_pathologic_n: "N0",
                  ajcc_pathologic_stage: "Stage IA",
                  ajcc_pathologic_t: "T1b",
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
                  lymph_nodes_positive: 0,
                  lymphatic_invasion_present: null,
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
                  year_of_diagnosis: "2016",
                  icd_10_code: null,
                  synchronous_malignancy: null,
                  anaplasia_present: null,
                  anaplasia_present_type: null,
                  child_pugh_classification: null,
                  cog_liver_stage: null,
                  cog_neuroblastoma_risk_group: null,
                  cog_renal_stage: null,
                  cog_rhabdomyosarcoma_risk_group: null,
                  enneking_msts_grade: null,
                  enneking_msts_metastasis: null,
                  enneking_msts_stage: null,
                  enneking_msts_tumor_site: null,
                  esophageal_columnar_dysplasia_degree: null,
                  esophageal_columnar_metaplasia_present: null,
                  first_symptom_prior_to_diagnosis: null,
                  gastric_esophageal_junction_involvement: null,
                  goblet_cells_columnar_mucosa_present: null,
                  gross_tumor_weight: null,
                  inpc_grade: null,
                  inpc_histologic_group: null,
                  inrg_stage: null,
                  inss_stage: null,
                  irs_group: null,
                  irs_stage: null,
                  ishak_fibrosis_score: null,
                  lymph_nodes_tested: null,
                  medulloblastoma_molecular_classification: null,
                  metastasis_at_diagnosis: null,
                  metastasis_at_diagnosis_site: null,
                  mitosis_karyorrhexis_index: null,
                  peripancreatic_lymph_nodes_positive: null,
                  peripancreatic_lymph_nodes_tested: null,
                  supratentorial_localization: null,
                  tumor_confined_to_organ_of_origin: null,
                  tumor_focality: null,
                  tumor_regression_grade: null,
                  vascular_invasion_type: null,
                  wilms_tumor_histologic_subtype: null,
                  breslow_thickness: null,
                  gleason_grade_group: null,
                  igcccg_stage: null,
                  international_prognostic_index: null,
                  largest_extrapelvic_peritoneal_focus: null,
                  masaoka_stage: null,
                  non_nodal_regional_disease: null,
                  non_nodal_tumor_deposits: null,
                  ovarian_specimen_status: null,
                  ovarian_surface_involvement: null,
                  percent_tumor_invasion: null,
                  peritoneal_fluid_cytological_status: null,
                  primary_gleason_grade: null,
                  secondary_gleason_grade: null,
                  weiss_assessment_score: null,
                  adrenal_hormone: null,
                  ann_arbor_b_symptoms_described: null,
                  diagnosis_is_primary_disease: null,
                  eln_risk_classification: null,
                  figo_staging_edition_year: null,
                  gleason_grade_tertiary: null,
                  gleason_patterns_percent: null,
                  margin_distance: null,
                  margins_involved_site: null,
                  pregnant_at_diagnosis: null,
                  satellite_nodule_present: null,
                  sites_of_involvement: null,
                  tumor_depth: null,
                  who_cns_grade: null,
                  who_nte_grade: null,
                  diagnosis_uuid: null
                }
              ]
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getAdditionalDetailedCaseSummaryData", inject(
    [CaseSummaryService],
    (service: CaseSummaryService) => {
      service.getAdditionalDetailedCaseSummaryData("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["uiCaseSummary"][0].case_id).toBe(
          "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c"
        );
      });

      const op = controller.expectOne(service.caseAdditionalDataDetailedQuery);

      expect(op.operation.variables.case_id).toEqual("f1ed9eb2-cf1e-11e9-9a07-0a80fada099c");

      op.flush({
        data: {
          uiCaseSummary: [
            {
              case_id: "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c",
              case_submitter_id: "C3L-00094",
              project_submitter_id: "CPTAC3-Discovery",
              disease_type: "Lung Adenocarcinoma",
              tissue_source_site_code: "SCHC",
              days_to_lost_to_followup: null,
              index_date: "",
              lost_to_followup: "No",
              primary_site: "Bronchus and lung",
              exposures: [
                {
                  age_at_onset: null,
                  alcohol_days_per_week: null,
                  alcohol_drinks_per_day: null,
                  alcohol_history: "Yes",
                  alcohol_intensity: "Occasional Drinker",
                  alcohol_type: null,
                  asbestos_exposure: null,
                  cigarettes_per_day: "20.0",
                  coal_dust_exposure: null,
                  environmental_tobacco_smoke_exposure: null,
                  exposure_id: "75f2f5b6-27a4-11ec-b712-0a4e2186f121",
                  exposure_submitter_id: "C3L-00094-EX",
                  exposure_duration: null,
                  exposure_duration_years: null,
                  exposure_type: null,
                  marijuana_use_per_week: null,
                  pack_years_smoked: "48.0",
                  parent_with_radiation_exposure: null,
                  radon_exposure: null,
                  respirable_crystalline_silica_exposure: null,
                  secondhand_smoke_as_child: null,
                  smokeless_tobacco_quit_age: null,
                  smoking_frequency: null,
                  time_between_waking_and_first_smoke: null,
                  tobacco_smoking_onset_year: "1965",
                  tobacco_smoking_quit_year: "2013",
                  tobacco_smoking_status: "4",
                  tobacco_use_per_day: null,
                  type_of_smoke_exposure: null,
                  type_of_tobacco_used: null,
                  years_smoked: "48.0"
                }
              ],
              follow_ups: [
                {
                  adverse_event: "'--",
                  adverse_event_grade: null,
                  aids_risk_factors: null,
                  barretts_esophagus_goblet_cells_present: "'--",
                  bmi: "0.00",
                  body_surface_area: null,
                  cause_of_response: "'--",
                  cd4_count: null,
                  cdc_hiv_risk_factors: null,
                  comorbidity: "'--",
                  comorbidity_method_of_diagnosis: "'--",
                  days_to_adverse_event: "0",
                  days_to_comorbidity: "0",
                  days_to_follow_up: null,
                  days_to_imaging: null,
                  days_to_progression: "0",
                  days_to_progression_free: "0",
                  days_to_recurrence: "638",
                  diabetes_treatment_type: "'--",
                  disease_response: "'--",
                  dlco_ref_predictive_percent: "0.00",
                  ecog_performance_status: "'--",
                  evidence_of_recurrence_type: null,
                  eye_color: null,
                  fev1_ref_post_bronch_percent: "0.00",
                  fev1_ref_pre_bronch_percent: "0.00",
                  fev1_fvc_pre_bronch_percent: "0.00",
                  fev1_fvc_post_bronch_percent: "0.00",
                  follow_up_id: "d13cd19f-1075-11ec-b712-0a4e2186f121",
                  follow_up_submitter_id: "C3L-00094-FL",
                  haart_treatment_indicator: null,
                  height: "0.000",
                  hepatitis_sustained_virological_response: "'--",
                  history_of_tumor: null,
                  history_of_tumor_type: null,
                  hiv_viral_load: null,
                  hormonal_contraceptive_type: null,
                  hormonal_contraceptive_use: null,
                  hormone_replacement_therapy_type: null,
                  hpv_positive_type: "'--",
                  hysterectomy_margins_involved: null,
                  hysterectomy_type: null,
                  imaging_result: null,
                  imaging_type: null,
                  immunosuppressive_treatment_type: null,
                  karnofsky_performance_status: "'--",
                  menopause_status: "'--",
                  nadir_cd4_count: null,
                  pancreatitis_onset_year: "0",
                  pregnancy_outcome: null,
                  procedures_performed: null,
                  progression_or_recurrence: "yes",
                  progression_or_recurrence_anatomic_site: "'--",
                  progression_or_recurrence_type: "'--",
                  recist_targeted_regions_number: null,
                  recist_targeted_regions_sum: null,
                  reflux_treatment_type: "'--",
                  risk_factor: "'--",
                  risk_factor_treatment: "'--",
                  scan_tracer_used: null,
                  undescended_testis_corrected: null,
                  undescended_testis_corrected_age: null,
                  undescended_testis_corrected_laterality: null,
                  undescended_testis_corrected_method: null,
                  undescended_testis_history: null,
                  undescended_testis_history_laterality: null,
                  viral_hepatitis_serologies: "'--",
                  weight: "0.00"
                }
              ]
            }
          ]
        }
    });

      controller.verify();
    }
  ));
});
