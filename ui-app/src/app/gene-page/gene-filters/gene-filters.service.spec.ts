import { BrowseFiltersService } from './../../browse/filters/browse-filters.service';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import gql from 'graphql-tag';

import { inject, TestBed } from '@angular/core/testing';


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

  it("test getAllData", inject(
    [BrowseFiltersService],
    (service: BrowseFiltersService) => {
      service.getAllData().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiStudy"].length).toBe(3);
        expect(data["uiStudy"][0].submitter_id_name).toBe(
          "guo_PCT_kidney_SWATH"
        );
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
});
