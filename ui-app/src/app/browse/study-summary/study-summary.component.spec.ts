import { StudySummaryOverlayService } from "./study-summary-overlay-window/study-summary-overlay-window.service";
import { Observable, of } from "rxjs";
import { StudySummaryService } from "./study-summary.service";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogRef } from "@angular/material/dialog";
import { Apollo } from "apollo-angular";
import { Router } from '@angular/router';
import { RouterTestingModule } from "@angular/router/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from "@angular/core/testing";

import { StudySummaryComponent } from "./study-summary.component";
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

class MockStudySummaryOverlayService {
  open() {}
}

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

class MockStudySummaryService {
  getEntityReferenceData(entity_type, entity_id, reference_type): any{
    return of({pdcEntityReference:{}});
  }

  getFilteredStudyData(): Observable<any> {
    return of({
      getPaginatedUIStudy: {
        total: 22,
        uiStudies: [
          {
            submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
            study_description:
              "<p>Kidney cancer is among the 10 most common cancers in both men and women and each year there are approximately 60,000 new cases with over 14,000 deaths (<a href='https://seer.cancer.gov/statfacts/html/kidrp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Several histological and molecular subtypes have been identified and clear cell renal cell carcinoma (CCRCC) is the most prevalent (<a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5936048/' target='_blank'>Hsieh el al., 2017 Nat Rev Dis Primers</a>). To advance the proteogenomic understanding of CCRCC, the CPTAC program has investigated 110 tumors (CPTAC discovery cohort) and subjected these samples to global proteome and phosphoproteome analysis. An optimized workflow for mass spectrometry of tissues using isobaric tags (TMT (tandem mass tags)-10) was used (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CCRCC tumors is available below along with peptide spectrum analyses (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided. Additional attributes along with genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
            study_submitter_id: "S044-2",
			pdc_study_id: "PDC000128",
			study_id: "dd0a228f-1fb3-11e9-b7f8-0a80fada099c",
            program_name: "Clinical Proteomic Tumor Analysis Consortium",
            project_name: "CPTAC3 Discovery",
            disease_type: "Clear Cell Renal Cell Carcinoma;Other",
            primary_site: "Kidney;N/A",
            analytical_fraction: "Phosphoproteome",
            experiment_type: "TMT10",
            embargo_date: "2019-06-01",
            cases_count: 126,
            aliquots_count: 218,
            filesCount: [
              {
                data_category: "Other Metadata",
                file_type: "Document",
                files_count: 7
              },
              {
                data_category: "Peptide Spectral Matches",
                file_type: "Open Standard",
                files_count: 338
              },
              {
                data_category: "Peptide Spectral Matches",
                file_type: "Text",
                files_count: 338
              },
              {
                data_category: "Processed Mass Spectra",
                file_type: "Open Standard",
                files_count: 338
              },
              {
                data_category: "Protein Assembly",
                file_type: "Text",
                files_count: 13
              },
              {
                data_category: "Quality Metrics",
                file_type: "Web",
                files_count: 2
              },
              {
                data_category: "Raw Mass Spectra",
                file_type: "Proprietary",
                files_count: 338
              }
            ],
            supplementaryFilesCount: [
            {
              data_category: "Other Metadata",
              file_type: "Document",
              files_count: 6
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Open Standard",
              files_count: 299
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Text",
              files_count: 299
            },
            {
              data_category: "Protein Assembly",
              file_type: "Text",
              files_count: 6
            }
          ],
          nonSupplementaryFilesCount: [
            {
              data_category: "Processed Mass Spectra",
              file_type: "Open Standard",
              files_count: 299
            },
            {
              data_category: "Quality Metrics",
              file_type: "Web",
              files_count: 1
            },
            {
              data_category: "Raw Mass Spectra",
              file_type: "Proprietary",
              files_count: 299
            }
          ],
		  versions:[]
          }
        ]
      }
    });
  }

  getStudyData(): Observable<any> {
    return of({
      uiStudy: [
        {
          study_submitter_id: "",
          project_name: "CPTAC-Retrospective",
          primary_site: "Colon",
          submitter_id_name: "cae75943",
          program_name: "Clinical Proteomic",
          disease_type: "Colon Adenocarcinoma",
          analytical_fraction: "Glycoproteome",
          experiment_type: "iTRAQ4",
          cases_count: 1,
          aliquots_count: 1,
          num_raw: 1,
          num_mzml: 1,
          num_prot: 1,
          num_prot_assem: 1,
          num_psm: 1
        }
      ]
    });
  }

  getWorkflowMetadata(): Observable<any> {
	//@@@PDC-1123 call ui wrapper API    
	return of({
      uiWorkflowMetadata: [
        {
          workflow_metadata_submitter_id: "TCGA_Breast_Cancer_Proteome",
          study_submitter_id: "S015-1",
          protocol_submitter_id: "P-S015-1",
          cptac_study_id: "S015",
          submitter_id_name: "MSGF+ iTRAQ 4-plex (Thermo Q-Exactive HCD)",
          study_submitter_name: "TCGA_Breast_Cancer_Proteome",
          analytical_fraction: "Proteome",
          experiment_type: "iTRAQ4",
          instrument: "Thermo Q Exactive",
          refseq_database_version: "RefSeq human build 37",
          uniport_database_version: "N/A",
          hgnc_version: "",
          raw_data_processing: "ReAdw4Mascot2.exe version 1.2 ConvVer 20130604a",
          raw_data_conversion: "msconvert 3.0.3827",
          sequence_database_search: "MSGF+ v9733",
          search_database_parameters:
            "java –Xmx3500M –jar MSGFPlus.jar -d <file>.fasta -t 20ppm -e 1 -m (3 for QExactive, 1 for Orbitrap) -inst (1 for QExactive, 1 for Orbitrap) -ntt 1 -thread 2 -tda 1 -ti 0,1 -n 1 -maxLength 50 -mod <file>.txt",
          phosphosite_localization: "",
          ms1_data_analysis: "ProMS",
          psm_report_generation: "single_file_report.exe",
          cptac_dcc_mzidentml: "1.2.2",
          mzidentml_refseq: "r82",
          mzidentml_uniprot: "2017_06",
          gene_to_prot: "2017-07-20",
          cptac_galaxy_workflows: "N/A",
          cptac_galaxy_tools: "N/A",
          cdap_reports: "N/A",
          cptac_dcc_tools: "N/A"
        }
      ]
    });
  }

  getProtocolData(): Observable<any> {
    return of({
      uiProtocol: [
        {
          protocol_id: "00cc7966-571e-11e8-b664-00a098d917f8",
          protocol_submitter_id: "P-S015-1",
          analytical_fraction: "Proteome",
          experiment_type: "iTRAQ4",
          asp_name: "CPTAC-SOP-Broad_Proteome/Phosphoproteome_3.0",
          asp_type: "4-plex iTRAQ Analytical Protocol",
          asp_starting_amount: "4 mg",
          asp_proteolysis: "LysC/Trypsin",
          asp_alkylation: "Iodoacetamide",
          asp_enrichment:
            "Phosphopeptide enrichment with immobilized metal affinity chromatography (NiNTA beads stripped with EDTA and loaded with FeCl3; Qiagen)",
          asp_labelling: "4-plex iTRAQ",
          asp_fractionation: "Peptide basic pH Reversed Phase LC (pH 10)",
          asp_fractions: "25 (Proteome) / 13 (Phosphoproteome)",
          cp_name: "CPTAC-SOP-Broad_Q-Exactive_3.0",
          cp_column_type: "New Objective; PicoFrit SELF/P",
          cp_injected: "1 ug Proteome / 4 of 9 ul IMAC sample Phosphoprote",
          cp_column_length: "20 cm",
          cp_inside_diameter: "75 um",
          cp_particle_size: "1.9 um",
          cp_particle_type: "Dr Maisch GmbH; ReproSil-Pur 120 C18-AQ; 1.9 um",
          cp_gradient_length: "110 min",
          msp_name: "CPTAC-SOP-Broad_Q-Exactive_3.0",
          msp_type: "Orbitrap Mass Spectrometry Protocol",
          msp_instrument: "Q Exactive",
          msp_dissociation: "Higher-energy collisional dissociation (HCD)",
          msp_ms1_resolution: "70000",
          msp_ms2_resolution: "17500",
          msp_precursors: "Top12",
          msp_collision_energy: "0.28"
        }
      ]
    });
  }

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  getStudyExperimentalDesign(): Observable<any> {
    return of({
      uiStudyExperimentalDesign: [
        {
          study_run_metadata_id: "0127c578-2075-11e9-b7f8-0a80fada099c",
          study_run_metadata_submitter_id: "S044-1-13",
          study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
          study_submitter_id: "S044-1",
          analyte: "null",
          acquisition_type: "DDA",
          experiment_type: "TMT10",
          plex_dataset_name: "10CPTAC_CCRCC_Proteome_JHU_20180119",
          experiment_number: "null",
          number_of_fractions: "25",
          label_free: "null",
          itraq_113: "null",
          itraq_114: "null",
          itraq_115: "null",
          itraq_116: "null",
          itraq_117: "null",
          itraq_118: "null",
          itraq_119: "null",
          itraq_121: "null",
          tmt_126: "CPT0001180009",
          tmt_127n: "CPT0082010001",
          tmt_127c: "CPT0015910003",
          tmt_128n: "CPT0086870003",
          tmt_128c: "CPT0063330001",
          tmt_129n: "CPT0001190001",
          tmt_129c: "CPT0063320003",
          tmt_130n: "CPT0081990003",
          tmt_130c: "CPT0086890003",
          tmt_131: "Pooled Sample",
          tmt_131c: "null"
        }
      ]
    });
  }

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  getBiospecimenPerStudy(): Observable<any> {
    return of({
      uiBiospecimenPerStudy: [
        {
          aliquot_id: "5225d754-d0b0-11e9-9a07-0a80fada099c",
          sample_id: "9a3ef50b-d0a6-11e9-9a07-0a80fada099c",
          case_id: "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c",
          aliquot_submitter_id: "CPT0000920017",
          sample_submitter_id: "C3L-00094-03",
          case_submitter_id: "C3L-00094",
          aliquot_is_ref: "no",
          aliquot_status: "Qualified",
          case_status: "Qualified",
          sample_status: "Qualified",
          project_name: "CPTAC3 Discovery",
          sample_type: "Primary Tumor",
          disease_type: "Lung Adenocarcinoma",
          primary_site: "Bronchus and lung",
          pool: "No",
          taxon: "Homo sapiens"
        }
      ]
    });
  }

  getPublicationsData(): Observable<any> {
    return of({
      uiPublication: [
        {
          publication_id: "44e2e0ce-89c7-11e8-bcf1-0a2705229b82",
          pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/25043054",
          title:
            "Zhang, B., et al., 2014 Proteogenomic characterization of human colon and rectal cancer. Nature. 2014 Sep 18;513(7518):382-7. doi: 10.1038/nature13438. Epub 2014 Jul 20."
        },
        {
          publication_id: "44e2e50c-89c7-11e8-bcf1-0a2705229b82",
          pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/26110064",
          title:
            "Slebos R.J.C., et al., (2015) Proteomic analysis of colon and rectal carcinoma using standard and customized databases. Scientific Data 2, Article number: 150022"
        }
      ]
    });
  }

  getFilesCounts(): Observable<any> {
	//@@@PDC-1123 call ui wrapper API
	return of({
      uiFilesCountPerStudy: [
        {
          study_submitter_id: "ST25730263",
          file_type: "RAW",
          files_count: 36
        },
        {
          study_submitter_id: "S015-1",
          file_type: "MZML",
          files_count: 38
        }
      ]
    });
  }

  getFilteredClinicalDataPaginated(): Observable<any> {
    return of({
      getPaginatedUIClinical: {
        total: 369,
        uiClinical: [
          {
            case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
            case_submitter_id: "14CO003",
            external_case_id: null,
            ethnicity: "not hispanic or latino",
            gender: "female",
            race: "white",
            morphology: "not reported",
            primary_diagnosis: "Colon Adenocarcinoma",
            site_of_resection_or_biopsy: "not reported",
            tissue_or_organ_of_origin: "Colon",
            tumor_grade: "not reported",
            tumor_stage: "Stage IIIB"
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
    });
  }
  
  getFilteredCasesPaginated(): Observable<any> {
    return of({
      getPaginatedUICase: {
        total: 1038,
        uiCases: [
          {
            aliquot_id: "9c36e4e9-a971-4ee3-9e2b-4e25a0bb6191",
            sample_id: "ba497617-aba1-4037-90f7-fc2c66ad10dd",
            case_id: "ea7c9fbd-8353-4f3c-9fea-2fba79140536",
            aliquot_submitter_id: "SAMN05341218_N",
            aliquot_is_ref: "no",
            aliquot_status: "Qualified",
            aliquot_quantity: null,
            aliquot_volume: null,
            amount: null,
            analyte_type: "protein",
            concentration: null,
            case_status: "Qualified",
            sample_status: "Qualified",
            sample_submitter_id: "OSCC_56_N",
            sample_is_ref: "no",
            biospecimen_anatomic_site: null,
            biospecimen_laterality: null,
            composition: "Not Reported",
            current_weight: null,
            days_to_collection: null,
            days_to_sample_procurement: null,
            diagnosis_pathologically_confirmed: null,
            freezing_method: null,
            initial_weight: null,
            intermediate_dimension: null,
            longest_dimension: null,
            method_of_sample_procurement: null,
            pathology_report_uuid: null,
            preservation_method: null,
            sample_type_id: null,
            shortest_dimension: null,
            time_between_clamping_and_freezing: null,
            time_between_excision_and_freezing: null,
            tissue_type: "Normal",
            tumor_code: null,
            tumor_code_id: null,
            tumor_descriptor: null,
            case_submitter_id: "OSCC_56",
            program_name: "International Cancer Proteogenome Consortium",
            project_name: "Oral Squamous Cell Carcinoma - Chang Gung University",
            sample_type: "Solid Tissue Normal",
            disease_type: "Oral Squamous Cell Carcinoma",
            primary_site: "Head and Neck",
            tissue_collection_type: null,
            sample_ordinal: null
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
    });
  }

  getFilteredClinicalDataPaginatedPost(): Observable<any> {
    return of({
      getPaginatedUIClinical: {
        total: 1414,
        uiClinical: [
          {
            case_submitter_id: "PDAC018",
            external_case_id: null,
            ethnicity: "Not Reported",
            gender: "Female",
            race: "Asian",
            morphology: "8500/3",
            primary_diagnosis: "Pancreatic endocrine tumor, malignant",
            site_of_resection_or_biopsy: "Not Reported",
            tissue_or_organ_of_origin: "Pancreas, NOS",
            tumor_grade: "Not Reported",
            tumor_stage: "Stage I",
            age_at_diagnosis: "13505",
            classification_of_tumor: null,
            days_to_recurrence: "1041.00",
            case_id: "5dbe6168-33b6-48f8-a6bb-364e5b0f52d1",
            disease_type: "Pancreatic Adenocarcinoma",
            primary_site: "Pancreas",
            program_name: "Korea University",
            project_name: "Proteogenomics Analysis and Mechanism Study to Develop Precision Medicine for Treatment-Resistant Pa",
            status: "Qualified",
            cause_of_death: null,
            days_to_birth: null,
            days_to_death: null,
            vital_status: "Dead",
            year_of_birth: null,
            year_of_death: null,
            age_at_index: null,
            premature_at_birth: null,
            weeks_gestation_at_birth: null,
            age_is_obfuscated: null,
            cause_of_death_source: null,
            occupation_duration_years: null,
            country_of_residence_at_enrollment: null,
            days_to_last_follow_up: "1118.00",
            days_to_last_known_disease_status: "1118.00",
            last_known_disease_status: "Distant met recurrence/progression",
            progression_or_recurrence: "Yes",
            prior_malignancy: null,
            ajcc_clinical_m: null,
            ajcc_clinical_n: null,
            ajcc_clinical_stage: null,
            ajcc_clinical_t: null,
            ajcc_pathologic_m: null,
            ajcc_pathologic_n: null,
            ajcc_pathologic_stage: null,
            ajcc_pathologic_t: null,
            ajcc_staging_system_edition: null,
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
            lymphatic_invasion_present: null,
            method_of_diagnosis: null,
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
            new_event_anatomic_site: null,
            new_event_type: null,
            overall_survival: null,
            perineural_invasion_present: null,
            prior_treatment: null,
            progression_free_survival: null,
            progression_free_survival_event: null,
            residual_disease: null,
            vascular_invasion_present: null,
            year_of_diagnosis: null,
            icd_10_code: null,
            synchronous_malignancy: null,
            metastasis_at_diagnosis: null,
            metastasis_at_diagnosis_site: null,
            mitosis_karyorrhexis_index: null,
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
            diagnosis_uuid: null,
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
            externalReferences: [],
            exposures: [],
            follow_ups: []
          },
          {
            case_submitter_id: "PDAC063",
            external_case_id: null,
            ethnicity: "Not Reported",
            gender: "Female",
            race: "Asian",
            morphology: "8500/3",
            primary_diagnosis: "Pancreatic endocrine tumor, malignant",
            site_of_resection_or_biopsy: "Not Reported",
            tissue_or_organ_of_origin: "Pancreas, NOS",
            tumor_grade: "Not Reported",
            tumor_stage: "Stage III",
            age_at_diagnosis: "27375",
            classification_of_tumor: null,
            days_to_recurrence: "125.00",
            case_id: "f998e351-96b1-4f92-9b0d-ccc02fdaa29d",
            disease_type: "Pancreatic Adenocarcinoma",
            primary_site: "Pancreas",
            program_name: "Korea University",
            project_name: "Proteogenomics Analysis and Mechanism Study to Develop Precision Medicine for Treatment-Resistant Pa",
            status: "Qualified",
            cause_of_death: null,
            days_to_birth: null,
            days_to_death: null,
            vital_status: "Dead",
            year_of_birth: null,
            year_of_death: null,
            age_at_index: null,
            premature_at_birth: null,
            weeks_gestation_at_birth: null,
            age_is_obfuscated: null,
            cause_of_death_source: null,
            occupation_duration_years: null,
            country_of_residence_at_enrollment: null,
            days_to_last_follow_up: "226.00",
            days_to_last_known_disease_status: "226.00",
            last_known_disease_status: "Distant met recurrence/progression",
            progression_or_recurrence: "Yes",
            prior_malignancy: null,
            ajcc_clinical_m: null,
            ajcc_clinical_n: null,
            ajcc_clinical_stage: null,
            ajcc_clinical_t: null,
            ajcc_pathologic_m: null,
            ajcc_pathologic_n: null,
            ajcc_pathologic_stage: null,
            ajcc_pathologic_t: null,
            ajcc_staging_system_edition: null,
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
            lymphatic_invasion_present: null,
            method_of_diagnosis: null,
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
            new_event_anatomic_site: null,
            new_event_type: null,
            overall_survival: null,
            perineural_invasion_present: null,
            prior_treatment: null,
            progression_free_survival: null,
            progression_free_survival_event: null,
            residual_disease: null,
            vascular_invasion_present: null,
            year_of_diagnosis: null,
            icd_10_code: null,
            synchronous_malignancy: null,
            metastasis_at_diagnosis: null,
            metastasis_at_diagnosis_site: null,
            mitosis_karyorrhexis_index: null,
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
            diagnosis_uuid: null,
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
            externalReferences: [],
            exposures: [],
            follow_ups: []
          }
        ],
        pagination: {
          count: 2,
          sort: "gender asc",
          from: 0,
          page: 1,
          total: 1414,
          pages: 707,
          size: 2
        }
      }
    });
  }
}

describe("StudySummaryComponent", () => {
  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;
  let httpMock: HttpTestingController;
  let router: Router;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [StudySummaryComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule.withRoutes([])],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    TestBed.overrideComponent(StudySummaryComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: StudySummaryService,
            useClass: MockStudySummaryService
          },
          {
            provide: StudySummaryOverlayService,
            useClass: MockStudySummaryOverlayService
          },
          { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              summaryData: {
                case_submitter_id: "14CO003",
                submitter_id_name: "",
                project_name: "",
                pdc_study_id: "PDC000128"
              }
            }
          },
          { provide: MatDialog, useClass: MockDialog },
		  { provide: Router }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(StudySummaryComponent);
      component = fixture.componentInstance;
      httpMock = TestBed.get(HttpTestingController);
      fixture.detectChanges();
	  router = TestBed.get(Router);
    });
  }));

  it("should create and initalize data correctly", () => {
    expect(component).toBeTruthy();
    expect(component.studySummaryData.project_name).toBe("CPTAC3 Discovery");
    expect(component.workflowData.workflow_metadata_submitter_id).toBe(
      "TCGA_Breast_Cancer_Proteome"
    );
    expect(component.protocol.protocol_id).toBe("00cc7966-571e-11e8-b664-00a098d917f8");
    expect(component.publications.length).toBe(2);
    expect(component.publications[0].publication_id).toBe(
      "44e2e0ce-89c7-11e8-bcf1-0a2705229b82"
    );
    expect(component.publications[1].publication_id).toBe(
      "44e2e50c-89c7-11e8-bcf1-0a2705229b82"
    );
    //expect(component.fileCountsRaw.length).toBe(2);
    expect(component.totalFilesCount).toBe(599);
  });

  it("test readManifest", () => {
    let manifestRequest = httpMock.expectOne(
      "assets/data-folder/dd0a228f-1fb3-11e9-b7f8-0a80fada099c/manifest.json"
    );
    manifestRequest.flush({
      heatmaps: [
        {
          "menu-label": "label",
          filename: "breast",
          "col-header": "col-header",
          "row-header": "row-header"
        }
      ]
    });
    component.readManifest();
  });
  //@@@PDC-2234 - open PDC HeatMap in a separate tab
  it("test navigate to HeatMap", fakeAsync(() => {
	  let windowOpenSpy = spyOn(window, 'open');
	  component.pdcStudyID = "PDC000128";
	  component.study_id = "dd0a228f-1fb3-11e9-b7f8-0a80fada099c";
//	  component.openHeatMap("Prospective Ovarian PNNL Proteome Qeplus");
//	  expect(windowOpenSpy).toHaveBeenCalledWith(['/pdc/analysis/PDC000118?StudyName=Prospective Ovarian PNNL Proteome Qeplus']);
  }));
  
  it("test isDownloadDisabled", () => {
	  component.isDownloadDisabled();
	  expect(component).toBeTruthy();
  });
  
  it("test displayTextforExternalID", () => {
	  var result = component.displayTextforExternalID("","https://cptac-data-portal.georgetown.edu/study-summary/S038");
	  expect(result).toBe('');
  });
  
  it("test getIcon", () => {
	  var result = component.getIcon(null);
	  expect(result).toBe('');
  });
});
