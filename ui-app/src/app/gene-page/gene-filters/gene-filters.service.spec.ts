import { GeneFiltersService } from "./gene-filters.service";
import { BrowseFiltersService } from "./../../browse/filters/browse-filters.service";
import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";
import gql from "graphql-tag";

import { inject, TestBed } from "@angular/core/testing";

describe("GeneFiltersService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneFiltersService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([GeneFiltersService], (service: GeneFiltersService) => {
    expect(service).toBeTruthy();
  }));

  it("test getAllData", inject([GeneFiltersService], (service: GeneFiltersService) => {
    service.getAllData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiStudy"].length).toBe(3);
      expect(data["uiStudy"][0].submitter_id_name).toBe("guo_PCT_kidney_SWATH");
      expect(data["uiStudy"][1].submitter_id_name).toBe(
        "Prospective_Breast_BI_Phosphoproteome"
      );
      expect(data["uiStudy"][2].submitter_id_name).toBe("Prospective_Breast_BI_Proteome");
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
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
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
  }));

  it("test getStudyByGeneName", inject(
    [GeneFiltersService],
    (service: GeneFiltersService) => {
      service.getStudyByGeneName("A1BG").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiGeneStudySpectralCount"].length).toBe(2);
        expect(data["uiGeneStudySpectralCount"][0].submitter_id_name).toBe(
          "TCGA_Breast_Cancer_Proteome"
        );
        expect(data["uiGeneStudySpectralCount"][1].submitter_id_name).toBe(
          "TCGA_Breast_Cancer_Phosphoproteome"
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
              submitter_id_name: "TCGA_Breast_Cancer_Proteome",
              study_submitter_id: "iTRAQ4"
            },
            {
              submitter_id_name: "TCGA_Breast_Cancer_Phosphoproteome",
              study_submitter_id: "iTRAQ4"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getAllFiltersData", inject(
    [GeneFiltersService],
    (service: GeneFiltersService) => {
      service.getAllFiltersData().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiFilters"]["project_name"].length).toBe(1);
        expect(data["uiFilters"]["project_name"][0].filterName).toBe("Quantitative digital maps of tissue biopsies");
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
          }
        }
      `);

      op.flush({
        data: {
          uiFilters: {
            project_name: [
              {
                filterName: "Quantitative digital maps of tissue biopsies",
                filterValue: ["ST25730263"]
              }
            ],
            primary_site: [
              {
                filterName: "Kidney",
                filterValue: ["ST25730263"]
              }
            ],
            program_name: [
              {
                filterName: "Aebersold Lab",
                filterValue: ["ST25730263"]
              }
            ],
            disease_type: [
              {
                filterName: "Chromophobe Renal Cell Carcinoma",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Clear Cell Renal Cell Carcinoma",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Papillary Renal Cell Carcinoma",
                filterValue: ["ST25730263"]
              }
            ],
            analytical_fraction: [
              {
                filterName: "Proteome",
                filterValue: ["ST25730263"]
              }
            ],
            experiment_type: [
              {
                filterName: "Label Free",
                filterValue: ["ST25730263"]
              }
            ],
            acquisition_type: [
              {
                filterName: "DIA",
                filterValue: ["ST25730263"]
              }
            ],
            submitter_id_name: [
              {
                filterName: "PCT_SWATH_Kidney",
                filterValue: ["ST25730263"]
              }
            ],
            sample_type: [
              {
                filterName: "Normal",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Tumor",
                filterValue: ["ST25730263"]
              }
            ],
            ethnicity: [
              {
                filterName: "Not Reported",
                filterValue: ["ST25730263"]
              }
            ],
            race: [
              {
                filterName: "Not Reported",
                filterValue: ["ST25730263"]
              }
            ],
            gender: [
              {
                filterName: "Female",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "Male",
                filterValue: ["ST25730263"]
              }
            ],
            tumor_grade: [
              {
                filterName: "G2",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "G2-3",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "G3",
                filterValue: ["ST25730263"]
              },
              {
                filterName: "G1-2",
                filterValue: ["ST25730263"]
              }
            ],
            data_category: [
              {
                filterName: "Raw Mass Spectra",
                filterValue: ["ST25730263"]
              }
            ],
            file_type: [
              {
                filterName: "Proprietary",
                filterValue: ["ST25730263"]
              }
            ],
            access: [
              {
                filterName: "Open",
                filterValue: ["ST25730263"]
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getGeneSearchResults", inject(
    [GeneFiltersService],
    (service: GeneFiltersService) => {
      service.getGeneSearchResults("A1BG").subscribe(data => {
        expect(data).toBeDefined();
        expect(data["geneSearch"]["genes"].length).toBe(5);
        expect(data["geneSearch"]["genes"][0].name).toBe("CDC42EP1");
        expect(data["geneSearch"]["genes"][1].name).toBe("CDC42EP2");
      });

      const op = controller.expectOne(gql`
        query GeneSearchQuery($gene_name: String!) {
          geneSearch(name: $gene_name) {
            genes {
              record_type
              name
              description
            }
          }
        }
      `);

      op.flush({
        data: {
          geneSearch: {
            genes: [
              {
                record_type: "gene",
                name: "CDC42EP1",
                description: ""
              },
              {
                record_type: "gene",
                name: "CDC42EP2",
                description: ""
              },
              {
                record_type: "gene",
                name: "CDC42EP3",
                description: ""
              },
              {
                record_type: "gene",
                name: "CDC42EP4",
                description: ""
              },
              {
                record_type: "gene",
                name: "CDC42EP5",
                description: ""
              }
            ]
          }
        }
      });

      controller.verify();
    }
  ));
});
