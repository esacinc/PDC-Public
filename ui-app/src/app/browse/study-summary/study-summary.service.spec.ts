import {
  ApolloTestingController,
  ApolloTestingModule
} from "apollo-angular/testing";
import gql from "graphql-tag";

import { inject, TestBed } from "@angular/core/testing";

import { StudySummaryService } from "./study-summary.service";

describe("StudySummaryService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StudySummaryService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getAllData", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getAllData().subscribe(data => {
        expect(data["uiStudy"]).toBeDefined();
        expect(data["uiStudy"].length).toBe(2);
        expect(data["uiStudy"][0].submitter_id_name).toBe(
          "guo_PCT_kidney_SWATH"
        );
        expect(data["uiStudy"][1].submitter_id_name).toBe(
          "Prospective_Breast_BI_Phosphoproteome"
        );
      });

      const op = controller.expectOne(gql`
        query CasesData {
          uiStudy {
            submitter_id_name
            program_name
            project_name
            disease_type
            primary_site
            analytical_fraction
            experiment_type
            num_raw
            num_mzml
            num_prot
            num_prot_assem
            num_psm
          }
        }
      `);

      op.flush({
        data: {
          uiStudy: [
            {
              submitter_id_name: "guo_PCT_kidney_SWATH",
              program_name:
                "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
              project_name:
                "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
              disease_type: "Renal Cell Carcinoma",
              primary_site: "kidney",
              analytical_fraction: "Proteome",
              experiment_type: "Label Free",
              cases_count: 9,
              num_raw: 36,
              num_mzml: 0,
              num_prot: 0,
              num_prot_assem: 0,
              num_psm: 0
            },
            {
              submitter_id_name: "Prospective_Breast_BI_Phosphoproteome",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast",
              analytical_fraction: "Phosphoproteome",
              experiment_type: "TMT10",
              cases_count: 125,
              num_raw: 221,
              num_mzml: 221,
              num_prot: 8,
              num_prot_assem: 6,
              num_psm: 442
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredStudies", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service
        .getFilteredStudies({
          program_name: "Clinical Proteomic Tumor Analysis Consortium"
        })
        .subscribe(data => {
          expect(data["uiStudy"]).toBeDefined();
          expect(data["uiStudy"].length).toBe(3);
          expect(data["uiStudy"][0].submitter_id_name).toBe(
            "Prospective_Breast_BI_Phosphoproteome"
          );
          expect(data["uiStudy"][1].submitter_id_name).toBe(
            "Prospective_Breast_BI_Proteome"
          );
          expect(data["uiStudy"][2].submitter_id_name).toBe(
            "Prospective_Colon_PNNL_Phosphoproteome_Lumos"
          );
        });

      const op = controller.expectOne(service.filteredStudiesQuery);

      op.flush({
        data: {
          uiStudy: [
            {
              submitter_id_name: "Prospective_Breast_BI_Phosphoproteome",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast",
              analytical_fraction: "Phosphoproteome",
              experiment_type: "TMT10",
              cases_count: 125,
              num_raw: 221,
              num_mzml: 221,
              num_prot: 8,
              num_prot_assem: 6,
              num_psm: 442
            },
            {
              submitter_id_name: "Prospective_Breast_BI_Proteome",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast",
              analytical_fraction: "Proteome",
              experiment_type: "TMT10",
              cases_count: 125,
              num_raw: 425,
              num_mzml: 425,
              num_prot: 8,
              num_prot_assem: 5,
              num_psm: 850
            },
            {
              submitter_id_name: "Prospective_Colon_PNNL_Phosphoproteome_Lumos",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Colon Adenocarcinoma",
              primary_site: "Colon",
              analytical_fraction: "Phosphoproteome",
              experiment_type: "TMT10",
              cases_count: 101,
              num_raw: 132,
              num_mzml: 132,
              num_prot: 2,
              num_prot_assem: 8,
              num_psm: 0
            }
          ]
        }
      });

      controller.verify();
    }
  ));

	//@@@PDC-1123 call ui wrapper API
	it("test getWorkflowMetadata", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service
        .getWorkflowMetadata({
          workflow_metadata_submitter_id:
            "Prospective_Breast_BI_Phosphoproteome"
        })
        .subscribe(data => {
          expect(data["uiWorkflowMetadata"]).toBeDefined();
          expect(data["uiWorkflowMetadata"].length).toBe(1);
          expect(
            data["uiWorkflowMetadata"][0].workflow_metadata_submitter_id
          ).toBe("Prospective_Breast_BI_Phosphoproteome");
          expect(data["uiWorkflowMetadata"][0].study_submitter_id).toBe("S039-2");
          expect(data["uiWorkflowMetadata"][0]).toEqual({
            workflow_metadata_submitter_id:
              "Prospective_Breast_BI_Phosphoproteome",
            study_submitter_id: "S039-2",
            protocol_submitter_id: "P-S039-2",
            cptac_study_id: "S039",
            submitter_id_name:
              "MSGF+ Phospho TMT 10-plex (Thermo Q-Exactive HCD) for Human-Mouse Xenograft",
            study_submitter_name: "Prospective_Breast_BI_Phosphoproteome",
            analytical_fraction: "Phosphoproteome",
            experiment_type: "TMT10",
            instrument: "Thermo Orbitrap Fusion Lumos",
            refseq_database_version:
              "RefSeq.20160914_Human_ucsc_hg19_customProDBnr_mito_150contams.fasta",
            uniport_database_version: "N/A",
            hgnc_version: "",
            raw_data_processing:
              "ReAdw4Mascot2.exe version 1.2 ConvVer 20160205a",
            raw_data_conversion: "msconvert 3.0.9490",
            sequence_database_search: "MSGF+ v2017.01.27",
            search_database_parameters:
              "java –Xmx3500M –jar MSGFPlus.jar -d <file>.fasta -t 20ppm -e 1 -m (3 for QExactive, 1 for Orbitrap) -inst (1 for QExactive, 1 for Orbitrap) -ntt 1 -thread 2 -tda 1 -ti 0,1 -n 1 -maxLength 50 -mod <file>.txt",
            phosphosite_localization: "Phospho RS",
            ms1_data_analysis: "ProMS",
            psm_report_generation: "single_file_report.exe",
            cptac_dcc_mzidentml: "1.2.2",
            mzidentml_refseq: "r82",
            mzidentml_uniprot: "2017_06",
            gene_to_prot: "2017-12-07",
            cptac_galaxy_workflows: "1.2.1",
            cptac_galaxy_tools: "1.3.14",
            cdap_reports: "CPTAC3-1.1.4",
            cptac_dcc_tools: "1.6.20"
          });
        });

      const op = controller.expectOne(service.workflowMetadataQuery);

      op.flush({
        data: {
          uiWorkflowMetadata: [
            {
              workflow_metadata_submitter_id:
                "Prospective_Breast_BI_Phosphoproteome",
              study_submitter_id: "S039-2",
              protocol_submitter_id: "P-S039-2",
              cptac_study_id: "S039",
              submitter_id_name:
                "MSGF+ Phospho TMT 10-plex (Thermo Q-Exactive HCD) for Human-Mouse Xenograft",
              study_submitter_name: "Prospective_Breast_BI_Phosphoproteome",
              analytical_fraction: "Phosphoproteome",
              experiment_type: "TMT10",
              instrument: "Thermo Orbitrap Fusion Lumos",
              refseq_database_version:
                "RefSeq.20160914_Human_ucsc_hg19_customProDBnr_mito_150contams.fasta",
              uniport_database_version: "N/A",
              hgnc_version: "",
              raw_data_processing:
                "ReAdw4Mascot2.exe version 1.2 ConvVer 20160205a",
              raw_data_conversion: "msconvert 3.0.9490",
              sequence_database_search: "MSGF+ v2017.01.27",
              search_database_parameters:
                "java –Xmx3500M –jar MSGFPlus.jar -d <file>.fasta -t 20ppm -e 1 -m (3 for QExactive, 1 for Orbitrap) -inst (1 for QExactive, 1 for Orbitrap) -ntt 1 -thread 2 -tda 1 -ti 0,1 -n 1 -maxLength 50 -mod <file>.txt",
              phosphosite_localization: "Phospho RS",
              ms1_data_analysis: "ProMS",
              psm_report_generation: "single_file_report.exe",
              cptac_dcc_mzidentml: "1.2.2",
              mzidentml_refseq: "r82",
              mzidentml_uniprot: "2017_06",
              gene_to_prot: "2017-12-07",
              cptac_galaxy_workflows: "1.2.1",
              cptac_galaxy_tools: "1.3.14",
              cdap_reports: "CPTAC3-1.1.4",
              cptac_dcc_tools: "1.6.20"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getProtocolData", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getProtocolData("S015-2").subscribe(data => {
        expect(data["uiProtocol"]).toBeDefined();
        expect(data["uiProtocol"].length).toBe(1);
        expect(data["uiProtocol"][0].protocol_id).toBe(
          "0245e153-571e-11e8-b664-00a098d917f8"
        );
        expect(data["uiProtocol"][0].protocol_submitter_id).toBe("P-S015-2");
        expect(data["uiProtocol"][0].analytical_fraction).toBe(
          "Phosphoproteome"
        );
      });

      const op = controller.expectOne(service.protocolQuery);

      op.flush({
        data: {
          uiProtocol: [
            {
              protocol_id: "0245e153-571e-11e8-b664-00a098d917f8",
              protocol_submitter_id: "P-S015-2",
              analytical_fraction: "Phosphoproteome",
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
              cp_particle_type:
                "Dr Maisch GmbH; ReproSil-Pur 120 C18-AQ; 1.9 um",
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
        }
      });

      controller.verify();
    }
  ));

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  it("test getBiospecimenPerStudy", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getBiospecimenPerStudy("S046-1").subscribe(data => {
        expect(data["uiBiospecimenPerStudy"]).toBeDefined();
        expect(data["uiBiospecimenPerStudy"].length).toBe(1);
        expect(data["uiBiospecimenPerStudy"][0].aliquot_id).toBe(
          "5225d754-d0b0-11e9-9a07-0a80fada099c"
        );
        expect(data["uiBiospecimenPerStudy"][0].aliquot_status).toBe("Qualified");
        expect(data["uiBiospecimenPerStudy"][0].aliquot_is_ref).toBe(
          "no"
        );
      });

      const op = controller.expectOne(service.biospecimenPerStudyQuery);

      op.flush({
        data: {
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
        }
      });

      controller.verify();
    }
  ));

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  it("test getStudyExperimentalDesign", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getStudyExperimentalDesign("S044-1").subscribe(data => {
        expect(data["uiStudyExperimentalDesign"]).toBeDefined();
        expect(data["uiStudyExperimentalDesign"].length).toBe(1);
        expect(data["uiStudyExperimentalDesign"][0].study_submitter_id).toBe(
          "S044-1"
        );
        expect(data["uiStudyExperimentalDesign"][0].experiment_type).toBe("TMT10");
      });

      const op = controller.expectOne(service.studyExperimentalDesignQuery);

      op.flush({
        data: {
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
        }
      });

      controller.verify();
    }
  ));

  it("test getPublicationsData", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getPublicationsData("S015-2").subscribe(data => {
        expect(data["uiPublication"]).toBeDefined();
        expect(data["uiPublication"].length).toBe(1);
        expect(data["uiPublication"][0].publication_id).toBe(
          "44e2e766-89c7-11e8-bcf1-0a2705229b82"
        );
      });

      const op = controller.expectOne(service.publicationsQuery);

      op.flush({
        data: {
          uiPublication: [
            {
              publication_id: "44e2e766-89c7-11e8-bcf1-0a2705229b82",
              pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/27251275",
              title:
                "Mertins P, Mani DR, Ruggles KV, Gillette MA, Clauser KR, Wang P et al., Nature (2016) Proteogenomics Connects Somatic Mutations to Signalling in Breast Cancere (2016) Proteogenomics Connects Somatic Mutations to Signalling in Breast Cancer"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

    //@@@PDC-1123 call ui wrapper API
  it("test getFilesCounts", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getFilesCounts("S015-2").subscribe(data => {
        expect(data["uiFilesCountPerStudy"]).toBeDefined();
        expect(data["uiFilesCountPerStudy"].length).toBe(2);
        expect(data["uiFilesCountPerStudy"][0].file_type).toBe("MZML");
        expect(data["uiFilesCountPerStudy"][1].file_type).toBe("PROTOCOL");
      });

      const op = controller.expectOne(service.filesCountPerStudyQuery);

      op.flush({
        data: {
          uiFilesCountPerStudy: [
            {
              study_submitter_id: "S038-3",
              file_type: "MZML",
              files_count: 144
            },
            {
              study_submitter_id: "S038-3",
              file_type: "PROTOCOL",
              files_count: 13
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getEntityReferenceData", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getEntityReferenceData("study", "dbe94609-1fb3-11e9-b7f8-0a80fada099c", "external", "").subscribe(data => {
        expect(data["uiPdcEntityReference"]).toBeDefined();
        expect(data["uiPdcEntityReference"].length).toBe(1);
        expect(data["uiPdcEntityReference"][0].entity_type).toBe("study");
        expect(data["uiPdcEntityReference"][0].reference_resource_shortname).toBe("CPTAC");
      });

      const op = controller.expectOne(service.entityReferenceQuery);

      op.flush({
        data: {
          uiPdcEntityReference: [
            {
              reference_id: "25b2ff66-88bc-11ea-bc9a-0a16d369a41f",
              entity_type: "study",
              entity_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
              reference_type: "external",
              reference_entity_type: "study",
              reference_entity_alias: "S044",
              reference_resource_name: "Clinical Proteomic Tumor Analysis Consortium",
              reference_resource_shortname: "CPTAC",
              reference_entity_location: "https://cptac-data-portal.georgetown.edu/cptac/s/S044\r",
              submitter_id_name: "CPTAC CCRCC Discovery Study - Proteome",
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredCasesPaginated", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getFilteredCasesPaginated(0, 10, "", [], "").subscribe(data => {
        expect(data["getPaginatedUICase"]).toBeDefined();
        expect(data["getPaginatedUICase"].total).toBe(4000);
        expect(data["getPaginatedUICase"]["uiCases"][0].aliquot_submitter_id).toBe("PDAC233");
      });

      const op = controller.expectOne(service.filteredCasesPaginatedQuery);

      op.flush({
        data: {
          getPaginatedUICase: {
            total: 4000,
            uiCases: [
            {
              aliquot_submitter_id: "PDAC233",
              sample_submitter_id: "PDAC233",
              case_id: "02dcc58d-656d-49af-a5bc-154bf2e86dee",
              case_submitter_id: "PDAC233",
              project_name: "Proteogenomics Analysis and Mechanism Study to Develop Precision Medicine for Treatment-Resistant Pa",
              program_name: "Korea University",
              sample_type: "Primary Tumor",
              disease_type: "Pancreatic Adenocarcinoma",
              primary_site: "Pancreas",
              aliquot_status: "Qualified",
              case_status: "Qualified",
              sample_status: "Qualified",
            }
          ],
          pagination: {
            count: 10,
            sort: "",
            from: 0,
            page: 1,
            total: 4000,
            pages: 400,
            size: 10
          }
        }
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredClinicalDataPaginated", inject(
    [StudySummaryService],
    (service: StudySummaryService) => {
      service.getFilteredClinicalDataPaginated(0, 10, "", [], "").subscribe(data => {
        expect(data["getFilteredClinicalDataPaginated"]).toBeDefined();
        expect(data["getFilteredClinicalDataPaginated"].total).toBe(2508);
        expect(data["getFilteredClinicalDataPaginated"]["uiClinical"][0].case_submitter_id).toBe("PDAC241");
        expect(data["getFilteredClinicalDataPaginated"]["uiClinical"][0].externalReferences).toBe(null);
      });

      const op = controller.expectOne(service.filteredCinicalDataPaginatedQuery);

      op.flush({
        data: {
          getPaginatedUICase: {
            total: 2508,
            uiClinical: [
            {
              case_submitter_id: "PDAC241",
              external_case_id: null,
              ethnicity: "Not Reported",
              gender: "Male",
              race: "Asian",
              morphology: "8500/3",
              primary_diagnosis: "Pancreatic endocrine tumor, malignant",
              site_of_resection_or_biopsy: "Not Reported",
              tissue_or_organ_of_origin: "Pancreas, NOS",
              tumor_grade: "Not Reported",
              tumor_stage: "Stage II",
              age_at_diagnosis: 27740,
              classification_of_tumor: null,
              days_to_recurrence: "260.00",		
              case_id: "a5418e71-773e-4d52-9191-acebd509970f",
              disease_type: "Pancreatic Adenocarcinoma",
              primary_site: "Pancreas",
              program_name: "Korea University",
              project_name: "Proteogenomics Analysis and Mechanism Study to Develop Precision Medicine for Treatment-Resistant Pa",
              status: "Qualified",
              externalReferences: []
            }
          ],
          pagination: {
            count: 10,
            sort: "",
            from: 0,
            page: 1,
            total: 2508,
            pages: 251,
            size: 10
          }
        }
        }
      });

      controller.verify();
    }
  ));
});
