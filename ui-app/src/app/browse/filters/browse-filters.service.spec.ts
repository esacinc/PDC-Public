import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";
import gql from "graphql-tag";

import { inject, TestBed } from "@angular/core/testing";

import { BrowseFiltersService } from "./browse-filters.service";

describe("BrowseFiltersService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseFiltersService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      expect(service).toBeTruthy();
    }
  ));

  /*it("test getAllData", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getAllData().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiStudy"].length).toBe(3);
        expect(data["uiStudy"][0].submitter_id_name).toBe("guo_PCT_kidney_SWATH");
        expect(data["uiStudy"][1].submitter_id_name).toBe(
          "Prospective_Breast_BI_Phosphoproteome"
        );
        expect(data["uiStudy"][2].submitter_id_name).toBe(
          "Prospective_Breast_BI_Proteome"
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
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getStudyByGeneName", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getStudyByGeneName("A1A4").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiGeneStudySpectralCount"].length).toBe(1);
        expect(data["uiGeneStudySpectralCount"][0].submitter_id_name).toBe(
          "TCGA_Breast_Cancer_Proteome"
        );
      });

      const op = controller.expectOne(gql`
        query GeneStudyData($gene_name: String!) {
          uiGeneStudySpectralCount(gene_name: $gene_name) {
            study_submitter_id
            submitter_id_name
          }
        }
      `);

      op.flush({
        data: {
          uiGeneStudySpectralCount: [
            {
              study_submitter_id: "TCGA_Breast_Cancer_Proteome",
              submitter_id_name: "TCGA_Breast_Cancer_Proteome"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getAllFiltersData", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getAllFiltersData().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiFilters"]["project_name"].length).toBe(1);
        expect(data["uiFilters"]["project_name"][0].filterName).toBe(
          "CPTAC2 Retrospective"
        );
      });

      const op = controller.expectOne(gql`
        query FiltersData {
          uiFilters {
            project_name {
              filterName
              filterValue
            }
            primary_site {
              filterName
              filterValue
            }
            program_name {
              filterName
              filterValue
            }
            disease_type {
              filterName
              filterValue
            }
            analytical_fraction {
              filterName
              filterValue
            }
            experiment_type {
              filterName
              filterValue
            }
            acquisition_type {
              filterName
              filterValue
            }
            submitter_id_name {
              filterName
              filterValue
            }
            sample_type {
              filterName
              filterValue
            }
            ethnicity {
              filterName
              filterValue
            }
            race {
              filterName
              filterValue
            }
            gender {
              filterName
              filterValue
            }
            tumor_grade {
              filterName
              filterValue
            }
            data_category {
              filterName
              filterValue
            }
            file_type {
              filterName
              filterValue
            }
            access {
              filterName
              filterValue
            }
            downloadable {
              filterName
              filterValue
            }
            biospecimen_status {
              filterName
              filterValue
            }
            case_status {
              filterName
              filterValue
            }
          }
        }
      `);

      op.flush({
        data: {
          uiFilters: {
            project_name: [
              {
                filterName: "CPTAC2 Retrospective",
                filterValue: [
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              }
            ],
            primary_site: [
              {
                filterName: "Kidney",
                filterValue: ["S044-2", "S044-1", "ST25730263"]
              },
              {
                filterName: "Not Reported",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Bronchus and lung",
                filterValue: ["S046-2", "S046-1"]
              },
              {
                filterName: "Uterus, NOS",
                filterValue: ["S043-2", "S043-1"]
              },
              {
                filterName: "Breast",
                filterValue: ["S039-2", "S039-1", "S015-2", "S015-1"]
              },
              {
                filterName: "Colon",
                filterValue: ["S037-3", "S037-2", "S037-1", "S016-1"]
              },
              {
                filterName: "Ovary",
                filterValue: [
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Rectum",
                filterValue: ["S016-1"]
              }
            ],
            program_name: [
              {
                filterName: "Clinical Proteomic Tumor Analysis Consortium",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Aebersold Lab",
                filterValue: ["ST25730263"]
              }
            ],
            disease_type: [
              {
                filterName: "Clear Cell Renal Cell Carcinoma",
                filterValue: ["S044-2", "S044-1", "ST25730263"]
              },
              {
                filterName: "Other",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Lung Adenocarcinoma",
                filterValue: ["S046-2", "S046-1"]
              },
              {
                filterName: "Uterine Corpus Endometrial Carcinoma",
                filterValue: ["S043-2", "S043-1"]
              },
              {
                filterName: "Chromophobe Renal Cell Carcinoma",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Papillary Renal Cell Carcinoma",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Breast Invasive Carcinoma",
                filterValue: ["S039-2", "S039-1", "S015-2", "S015-1"]
              },
              {
                filterName: "Colon Adenocarcinoma",
                filterValue: ["S037-3", "S037-2", "S037-1", "S016-1"]
              },
              {
                filterName: "Ovarian Serous Cystadenocarcinoma",
                filterValue: [
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Rectum Adenocarcinoma",
                filterValue: ["S016-1"]
              }
            ],
            analytical_fraction: [
              {
                filterName: "Phosphoproteome",
                filterValue: [
                  "S044-2",
                  "S046-2",
                  "S043-2",
                  "S039-2",
                  "S037-3",
                  "S038-3",
                  "S015-2",
                  "S020-4"
                ]
              },
              {
                filterName: "Proteome",
                filterValue: [
                  "S044-1",
                  "S046-1",
                  "S043-1",
                  "ST25730263",
                  "S039-1",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-2",
                  "S015-1",
                  "S016-1",
                  "S020-2",
                  "S020-3"
                ]
              },
              {
                filterName: "Glycoproteome",
                filterValue: ["S020-1"]
              }
            ],
            experiment_type: [
              {
                filterName: "TMT10",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S038-1",
                  "S038-3",
                  "S038-2"
                ]
              },
              {
                filterName: "Label Free",
                filterValue: ["ST25730263", "S037-1", "S016-1"]
              },
              {
                filterName: "iTRAQ4",
                filterValue: ["S015-2", "S015-1", "S020-1", "S020-2", "S020-4", "S020-3"]
              }
            ],
            acquisition_type: [
              {
                filterName: "DDA",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "DIA",
                filterValue: ["ST25730263"]
              }
            ],
            submitter_id_name: [
              {
                filterName: "CPTAC CCRCC Discovery Study - Phosphoproteme",
                filterValue: ["S044-2"]
              },
              {
                filterName: "CPTAC CCRCC Discovery Study - Proteome",
                filterValue: ["S044-1"]
              },
              {
                filterName: "CPTAC LUAD Discovery Study - Phosphoproteome",
                filterValue: ["S046-2"]
              },
              {
                filterName: "CPTAC LUAD Discovery Study - Proteome",
                filterValue: ["S046-1"]
              },
              {
                filterName: "CPTAC UCEC Discovery Study - Phosphoproteme",
                filterValue: ["S043-2"]
              },
              {
                filterName: "CPTAC UCEC Discovery Study - Proteome",
                filterValue: ["S043-1"]
              },
              {
                filterName: "PCT_SWATH_Kidney",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Prospective_Breast_BI_Phosphoproteome",
                filterValue: ["S039-2"]
              },
              {
                filterName: "Prospective_Breast_BI_Proteome",
                filterValue: ["S039-1"]
              },
              {
                filterName: "Prospective_Colon_PNNL_Phosphoproteome_Lumos",
                filterValue: ["S037-3"]
              },
              {
                filterName: "Prospective_Colon_PNNL_Proteome_Qeplus",
                filterValue: ["S037-2"]
              },
              {
                filterName: "Prospective_Colon_VU_Proteome",
                filterValue: ["S037-1"]
              },
              {
                filterName: "Prospective_Ovarian_JHU_Proteome",
                filterValue: ["S038-1"]
              },
              {
                filterName: "Prospective_Ovarian_PNNL_Phosphoproteome_Lumos",
                filterValue: ["S038-3"]
              },
              {
                filterName: "Prospective_Ovarian_PNNL_Proteome_Qeplus",
                filterValue: ["S038-2"]
              },
              {
                filterName: "TCGA_Breast_Cancer_Phosphoproteome",
                filterValue: ["S015-2"]
              },
              {
                filterName: "TCGA_Breast_Cancer_Proteome",
                filterValue: ["S015-1"]
              },
              {
                filterName: "TCGA_Colon_Cancer_Proteome",
                filterValue: ["S016-1"]
              },
              {
                filterName: "TCGA_Ovarian_JHU_Glycoproteome",
                filterValue: ["S020-1"]
              },
              {
                filterName: "TCGA_Ovarian_JHU_Proteome",
                filterValue: ["S020-2"]
              },
              {
                filterName: "TCGA_Ovarian_PNNL_Phosphoproteome_Velos_Qexatvive",
                filterValue: ["S020-4"]
              },
              {
                filterName: "TCGA_Ovarian_PNNL_Proteome",
                filterValue: ["S020-3"]
              }
            ],
            sample_type: [
              {
                filterName: "Primary Tumor",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Solid Tissue Normal",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S038-1",
                  "S038-3",
                  "S038-2"
                ]
              },
              {
                filterName: "Cell Lines",
                filterValue: ["S044-2", "S044-1"]
              },
              {
                filterName: "Not Reported",
                filterValue: ["S044-2", "S044-1", "S046-2", "S046-1"]
              },
              {
                filterName: "Xenograft Tissue",
                filterValue: ["S046-2", "S046-1", "S043-2", "S043-1"]
              },
              {
                filterName: "Ref",
                filterValue: ["S043-2", "S043-1"]
              },
              {
                filterName: "Normal",
                filterValue: ["ST25730263", "S015-2", "S015-1"]
              },
              {
                filterName: "Tumor",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Internal Reference - Pooled Sample",
                filterValue: ["S039-2", "S039-1"]
              },
              {
                filterName: "RetroIR",
                filterValue: ["S039-2", "S039-1"]
              },
              {
                filterName: "ColonRef",
                filterValue: ["S037-3", "S037-2"]
              },
              {
                filterName: "Ovarian Tumor Sample 5776",
                filterValue: ["S038-1"]
              },
              {
                filterName: "pooled sample",
                filterValue: ["S038-1"]
              },
              {
                filterName: "JHU QC",
                filterValue: ["S038-3", "S038-2"]
              },
              {
                filterName: "PNNL-JHU Ref",
                filterValue: ["S038-3", "S038-2"]
              },
              {
                filterName: "Internal Reference",
                filterValue: ["S015-2", "S015-1", "S020-1", "S020-2", "S020-4", "S020-3"]
              },
              {
                filterName: "OVARIAN-CONTROL",
                filterValue: ["S020-1", "S020-2"]
              }
            ],
            ethnicity: [
              {
                filterName: "Hispanic or Latino",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2"
                ]
              },
              {
                filterName: "Not Hispanic or Latino",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Not Reported",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "ST25730263",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Unknown",
                filterValue: ["S039-2", "S039-1", "S038-1", "S038-3", "S038-2"]
              }
            ],
            race: [
              {
                filterName: "White",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Asian",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Black or African American",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Not Reported",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "ST25730263",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Unknown",
                filterValue: ["S046-2", "S046-1"]
              },
              {
                filterName: "American Indian or Alaska Native",
                filterValue: [
                  "S046-2",
                  "S046-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              }
            ],
            gender: [
              {
                filterName: "Female",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "ST25730263",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S016-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              },
              {
                filterName: "Male",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "ST25730263",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S015-2",
                  "S015-1",
                  "S016-1"
                ]
              },
              {
                filterName: "Not Reported",
                filterValue: [
                  "S044-2",
                  "S044-1",
                  "S046-2",
                  "S046-1",
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1"
                ]
              },
              {
                filterName: "Not Received",
                filterValue: [
                  "S043-2",
                  "S043-1",
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1",
                  "S020-1",
                  "S020-2",
                  "S020-4",
                  "S020-3"
                ]
              }
            ],
            tumor_grade: [
              {
                filterName: "GX",
                filterValue: ["S046-2", "S046-1"]
              },
              {
                filterName: "Not Received",
                filterValue: ["S020-2", "S020-4", "S020-3"]
              },
              {
                filterName: "Unknown",
                filterValue: ["S043-2", "S043-1"]
              },
              {
                filterName: "G2-3",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "G1-2",
                filterValue: ["ST25730263"]
              }
            ],
            data_category: [
              {
                filterName: "Other Metadata",
                filterValue: ["S044-2"]
              }
            ],
            file_type: [
              {
                filterName: "Document",
                filterValue: ["S044-2", "S020-3"]
              }
            ],
            access: [
              {
                filterName: "Controlled",
                filterValue: [
                  "S039-2",
                  "S039-1",
                  "S037-3",
                  "S037-2",
                  "S037-1",
                  "S038-1",
                  "S038-3",
                  "S038-2",
                  "S015-2",
                  "S015-1"
                ]
              }
            ],
            downloadable: [
              {
                filterName: "Yes",
                filterValue: ["S020-3"]
              },
              {
                filterName: "No",
                filterValue: ["S039-2"]
              }
            ],
            biospecimen_status: [
              {
                filterName: "Qualified",
                filterValue: ["S044-2", "S020-3"]
              }
            ],
            case_status: [
              {
                filterName: "Disqualified",
                filterValue: ["S043-2", "S043-1"]
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getGeneSearchResults", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getGeneSearchResults("ALG3").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["geneSearch"]["genes"].length).toBe(2);
        expect(data["geneSearch"]["genes"][0].name).toBe("ALG3");
      });

      const op = controller.expectOne(gql`
        query GeneSearchQuery($gene_name: String!) {
          geneSearch(name: $gene_name) {
            genes {
              gene_id
              record_type
              name
              description
              ncbi_gene_id
            }
          }
        }
      `);

      op.flush({
        data: {
          geneSearch: {
            genes: [
              {
                gene_id: "ALG3",
                record_type: "gene",
                name: "ALG3",
                description: "ALG3, alpha-1,3- mannosyltransferase",
                ncbi_gene_id: "ALG3"
              },
              {
                gene_id: "ALG10",
                record_type: "gene",
                name: "ALG10",
                description: "ALG10, alpha-1,2-glucosyltransferase",
                ncbi_gene_id: "ALG10"
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getStudyUUID2NameMapping", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getStudyUUID2NameMapping().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiProgramsProjectsStudies"].length).toBe(2);
        expect(data["uiProgramsProjectsStudies"][0].program_id).toBe(
          "10251935-5540-11e8-b664-00a098d917f8"
        );
      });

      const op = controller.expectOne(gql`
        query StudyNameUUIDMapping {
          uiProgramsProjectsStudies {
            program_id
            program_submitter_id
            name
            sponsor
            start_date
            end_date
            program_manager
            projects {
              project_id
              project_submitter_id
              name
              studies {
                study_id
				pdc_study_id
                submitter_id_name
                study_submitter_id
                analytical_fraction
                experiment_type
                acquisition_type
              }
            }
          }
        }
      `);

      op.flush({
        data: {
          uiProgramsProjectsStudies: [
            {
              program_id: "10251935-5540-11e8-b664-00a098d917f8",
              program_submitter_id: "CPTAC",
              name: "Clinical Proteomic Tumor Analysis Consortium",
              sponsor: null,
              start_date: "2018-06-29",
              end_date: null,
              program_manager: "Ratna Thangudu",
              projects: [
                {
                  project_id: "267d6671-0e78-11e9-a064-0a9c39d33490",
                  project_submitter_id: "CPTAC3-Discovery",
                  name: "CPTAC3-Discovery",
                  studies: [
                    {
                      study_id: "c935c587-0cd1-11e9-a064-0a9c39d33490",
					  pdc_study_id: "PDC000125",
                      submitter_id_name: "CPTAC UCEC Discovery Study - Proteome",
                      study_submitter_id: "UCEC Discovery - Proteome S043-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "cb7220f5-0cd1-11e9-a064-0a9c39d33490",
					  pdc_study_id: "PDC000126",
                      submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
                      study_submitter_id: "UCEC Discovery - Phosphoproteome S043-2",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
					  pdc_study_id: "PDC000127",
                      submitter_id_name: "CPTAC CCRCC Discovery Study - Proteome",
                      study_submitter_id: "CPTAC CCRCC Discovery Study - Proteome S044-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "dd0a228f-1fb3-11e9-b7f8-0a80fada099c",
					  pdc_study_id: "PDC000128",
                      submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
                      study_submitter_id: "CPTAC CCRCC Discovery Study - Phosphoproteome S044-2",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "f1c59a53-ab7c-11e9-9a07-0a80fada099c",
					  pdc_study_id: "PDC000153",
                      submitter_id_name: "CPTAC LUAD Discovery Study - Proteome",
                      study_submitter_id: "S046-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "f1c59f58-ab7c-11e9-9a07-0a80fada099c",
					  pdc_study_id: "PDC000149",
                      submitter_id_name: "CPTAC LUAD Discovery Study - Phosphoproteome",
                      study_submitter_id: "S046-2",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    }
                  ]
                },
                {
                  project_id: "48653303-5546-11e8-b664-00a098d917f8",
                  project_submitter_id: "CPTAC-2",
                  name: "CPTAC2 Confirmatory",
                  studies: [
                    {
                      study_id: "bb67ec40-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000109",
                      submitter_id_name: "Prospective_Colon_VU_Proteome",
                      study_submitter_id: "S037-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "Label Free",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bbc1441e-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000116",
                      submitter_id_name: "Prospective_Colon_PNNL_Proteome_Qeplus",
                      study_submitter_id: "S037-2",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bc23a4a1-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000117",
                      submitter_id_name: "Prospective_Colon_PNNL_Phosphoproteome_Lumos",
                      study_submitter_id: "S037-3",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bc81da61-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000110",
                      submitter_id_name: "Prospective_Ovarian_JHU_Proteome",
                      study_submitter_id: "S038-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bcdeeba0-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000118",
                      submitter_id_name: "Prospective_Ovarian_PNNL_Proteome_Qeplus",
                      study_submitter_id: "S038-2",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bd70311c-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000119",
                      submitter_id_name: "Prospective_Ovarian_PNNL_Phosphoproteome_Lumos",
                      study_submitter_id: "S038-3",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bdcd3802-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000120",
                      submitter_id_name: "Prospective_Breast_BI_Proteome",
                      study_submitter_id: "S039-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "be2883cb-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000121",
                      submitter_id_name: "Prospective_Breast_BI_Phosphoproteome",
                      study_submitter_id: "S039-2",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "TMT10",
                      acquisition_type: "DDA"
                    }
                  ]
                },
                {
                  project_id: "48af5040-5546-11e8-b664-00a098d917f8",
                  project_submitter_id: "CPTAC-TCGA",
                  name: "CPTAC2 Retrospective",
                  studies: [
                    {
                      study_id: "b8da9eeb-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000173",
                      submitter_id_name: "TCGA_Breast_Cancer_Proteome",
                      study_submitter_id: "S015-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "b93bb1e9-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000174",
                      submitter_id_name: "TCGA_Breast_Cancer_Phosphoproteome",
                      study_submitter_id: "S015-2",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "b998098f-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000111",
                      submitter_id_name: "TCGA_Colon_Cancer_Proteome",
                      study_submitter_id: "S016-1",
                      analytical_fraction: "Proteome",
                      experiment_type: "Label Free",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "b9f2ccc5-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000112",
                      submitter_id_name: "TCGA_Ovarian_JHU_Glycoproteome",
                      study_submitter_id: "S020-1",
                      analytical_fraction: "Glycoproteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "ba4e17a5-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000113",
                      submitter_id_name: "TCGA_Ovarian_JHU_Proteome",
                      study_submitter_id: "S020-2",
                      analytical_fraction: "Proteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "baa8ae46-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000114",
                      submitter_id_name: "TCGA_Ovarian_PNNL_Proteome",
                      study_submitter_id: "S020-3",
                      analytical_fraction: "Proteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    },
                    {
                      study_id: "bb076b33-57b8-11e8-b07a-00a098d917f8",
					  pdc_study_id: "PDC000115",
                      submitter_id_name:
                        "TCGA_Ovarian_PNNL_Phosphoproteome_Velos_Qexatvive",
                      study_submitter_id: "S020-4",
                      analytical_fraction: "Phosphoproteome",
                      experiment_type: "iTRAQ4",
                      acquisition_type: "DDA"
                    }
                  ]
                }
              ]
            },
            {
              program_id: "1a4a4346-f231-11e8-a44b-0a9c39d33490",
              program_submitter_id: "PG25730263",
              name: "Aebersold Lab",
              sponsor: "",
              start_date: "11/26/2018",
              end_date: "",
              program_manager: "PI  R. Aebersold",
              projects: [
                {
                  project_id: "d282b2d7-f238-11e8-a44b-0a9c39d33490",
                  project_submitter_id: "PJ25730263",
                  name: "Quantitative digital maps of tissue biopsies",
                  studies: [
                    {
                      study_id: "ad18f195-f3c0-11e8-a44b-0a9c39d33490",
					  pdc_study_id: "PDC000152",
                      submitter_id_name: "PCT_SWATH_Kidney",
                      study_submitter_id: "ST25730263",
                      analytical_fraction: "Proteome",
                      experiment_type: "Label Free",
                      acquisition_type: "DIA"
                    }
                  ]
                }
              ]
            }
          ]
        }
      });*/

      //controller.verify();
    }
  ));
});
