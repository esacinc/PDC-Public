import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByStudyService } from "./browse-by-study.service";
import gql from "graphql-tag";

describe("BrowseByStudyService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseByStudyService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseByStudyService],
    (service: BrowseByStudyService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getAllData", inject(
    [BrowseByStudyService],
    (service: BrowseByStudyService) => {
      service.getAllData().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiStudy"].length).toBe(3);
        expect(data["uiStudy"][0].study_submitter_id).toBe("ST25730263");
        expect(data["uiStudy"][1].study_submitter_id).toBe("S015-1");
        expect(data["uiStudy"][2].study_submitter_id).toBe("S015-2");
      });

      const op = controller.expectOne(gql`
        query CasesData {
          uiStudy {
            study_submitter_id
            submitter_id_name
            program_name
            project_name
            disease_type
            primary_site
            analytical_fraction
            experiment_type
            cases_count
            aliquots_count
          }
        }
      `);

      op.flush({
        data: {
          uiStudy: [
            {
              study_submitter_id: "ST25730263",
              submitter_id_name: "PCT_SWATH_Kidney",
              program_name: null,
              project_name: null,
              disease_type: null,
              primary_site: null,
              analytical_fraction: null,
              experiment_type: null,
              cases_count: null,
              aliquots_count: null
            },
            {
              study_submitter_id: "S015-1",
              submitter_id_name: "TCGA_Breast_Cancer_Proteome",
              program_name: null,
              project_name: null,
              disease_type: null,
              primary_site: null,
              analytical_fraction: null,
              experiment_type: null,
              cases_count: null,
              aliquots_count: null
            },
            {
              study_submitter_id: "S015-2",
              submitter_id_name: "TCGA_Breast_Cancer_Phosphoproteome",
              program_name: null,
              project_name: null,
              disease_type: null,
              primary_site: null,
              analytical_fraction: null,
              experiment_type: null,
              cases_count: null,
              aliquots_count: null
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredStudies", inject(
    [BrowseByStudyService],
    (service: BrowseByStudyService) => {
      service
        .getFilteredStudies({
          program_name: "Clinical Proteomic Tumor Analysis Consortium"
        })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiStudy"].length).toBe(2);
          expect(data["uiStudy"][0].study_submitter_id).toBe("S039-2");
          expect(data["uiStudy"][1].study_submitter_id).toBe("S039-1");
        });

      const op = controller.expectOne(service.filteredStudiesQuery);

      expect(op.operation.variables.program_name_filter).toBe(
        "Clinical Proteomic Tumor Analysis Consortium"
      );

      op.flush({
        data: {
          uiStudy: [
            {
              study_submitter_id: "S039-2",
              submitter_id_name: "Prospective_Breast_BI_Phosphoproteome",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast",
              analytical_fraction: "Phosphoproteome",
              experiment_type: "TMT10",
              cases_count: 125,
              aliquots_count: 143,
              num_raw: 221,
              num_mzml: 221,
              num_prot: 8,
              num_prot_assem: 6,
              num_psm: 442
            },
            {
              study_submitter_id: "S039-1",
              submitter_id_name: "Prospective_Breast_BI_Proteome",
              program_name: "Clinical Proteomic Tumor Analysis Consortium",
              project_name: "CPTAC-Confirmatory",
              disease_type: "Breast Invasive Carcinoma",
              primary_site: "Breast",
              analytical_fraction: "Proteome",
              experiment_type: "TMT10",
              cases_count: 125,
              aliquots_count: 143,
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

  it("test getFilteredStudiesPaginated", inject(
    [BrowseByStudyService],
    (service: BrowseByStudyService) => {
      service.getFilteredStudiesPaginated(0, 10, "", {}).subscribe(data => {
        expect(data).toBeDefined();
        expect(data["getPaginatedUIStudy"].uiStudies.length).toBe(1);
        expect(data["getPaginatedUIStudy"].total).toBe(16);
        expect(data["getPaginatedUIStudy"].pagination).toEqual({
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 16,
          pages: 2,
          size: 10
        });
      });

      const op = controller.expectOne(service.filteredStudiesDataPaginatedQuery);

      expect(op.operation.variables.offset_value).toBe(0);

      op.flush({
        data: {
          getPaginatedUIStudy: {
            total: 16,
            uiStudies: [
              {
                study_id:'CPTAC CCRCC Discovery Study - Phosphoproteme',
                submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
                study_description:
                  "<p>Endometrial cancer is the most common cancer of the female reproductive organs. It is estimated that over 63,000 new cases of uterine body or corpus cancer will be diagnosed in 2018, and more than 11,000 women will die from this disease (<a href='https://seer.cancer.gov/statfacts/html/corp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Tumors from 100 patients with uterine corpus endometrial carcinoma (UCEC) were subjected to global proteome and phosphoproteome analysis following the CPTAC-optimized workflow for mass spectrometry analysis of tissues using the 10-plexed isobaric tandem mass tags (TMT-10) (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CPTAC cohort are available along with peptide spectrum matches (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided below. Additional clinical attributes and genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
                study_submitter_id: "S043-2",
                program_name: "Clinical Proteomic Tumor Analysis Consortium",
                project_name: "CPTAC3 Discovery",
                disease_type: "Other;Uterine Corpus Endometrial Carcinoma",
                primary_site: "N/A;Uterus, NOS",
                analytical_fraction: "Phosphoproteome",
                experiment_type: "TMT10",
                embargo_date: "2019-06-01",
                cases_count: 4,
                aliquots_count: 4,
                filesCount: [
                  {
                    data_category: "Other Metadata",
                    file_type: "Document",
                    files_count: 10
                  },
                  {
                    data_category: "Peptide Spectral Matches",
                    file_type: "Open Standard",
                    files_count: 240
                  },
                  {
                    data_category: "Peptide Spectral Matches",
                    file_type: "Text",
                    files_count: 240
                  },
                  {
                    data_category: "Processed Mass Spectra",
                    file_type: "Open Standard",
                    files_count: 240
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
                    files_count: 240
                  }
                ]
              }
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 16,
              pages: 2,
              size: 10
            }
          }
        }
      });

      controller.verify();
    }
  ));
});
