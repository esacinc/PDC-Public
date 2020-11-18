import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByFileService } from "./browse-by-file.service";
import gql from "graphql-tag";

describe("BrowseByFileService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseByFileService],
      imports: [ApolloTestingModule, HttpClientTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BrowseByFileService],
    (service: BrowseByFileService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getAllData", inject([BrowseByFileService], (service: BrowseByFileService) => {
    service.getAllData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiFile"].length).toBe(2);
      expect(data["uiFile"][0].submitter_id_name).toBe("guo_PCT_kidney_SWATH");
      expect(data["uiFile"][1].submitter_id_name).toBe("guo_PCT_kidney_SWATH");
    });

    const op = controller.expectOne(gql`
      query FilesData {
        uiFile {
          submitter_id_name
          file_name
          study_run_metadata_submitter_id
          project_name
          file_type
          file_size
        }
      }
    `);

    op.flush({
      data: {
        uiFile: [
          {
            submitter_id_name: "guo_PCT_kidney_SWATH",
            file_name: "GUOT_L130410_001C_SW",
            study_run_metadata_submitter_id: "SRM25730263-1",
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
            file_type: "RAW",
            file_size: "1648474250"
          },
          {
            submitter_id_name: "guo_PCT_kidney_SWATH",
            file_name: "GUOT_L130410_002_SW",
            study_run_metadata_submitter_id: "SRM25730263-2",
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
            file_type: "RAW",
            file_size: "1714976163"
          }
        ]
      }
    });

    controller.verify();
  }));

  it("test getFilteredFiles", inject(
    [BrowseByFileService],
    (service: BrowseByFileService) => {
      service
        .getFilteredFiles({ project_name: "CPTAC-Retrospective" })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiFile"].length).toBe(2);
          expect(data["uiFile"][0].file_name).toBe(
            "01bfe080-83ff-4eca-929e-d7959ab3db79.tsv"
          );
          expect(data["uiFile"][1].file_name).toBe(
            "06082e49-a0da-4abe-ade4-aceda61c5c91.tar.gz"
          );
        });

      const op = controller.expectOne(service.filteredFilesQuery);

      expect(op.operation.variables.project_name_filter).toBe("CPTAC-Retrospective");

      op.flush({
        data: {
          uiFile: [
            {
              submitter_id_name: "TCGA_Breast_Cancer_Proteome",
              file_name: "01bfe080-83ff-4eca-929e-d7959ab3db79.tsv",
              study_run_metadata_submitter_id: "NA",
              project_name: "CPTAC-Retrospective",
              file_type: "PROT_ASSEM",
              file_size: "356120751"
            },
            {
              submitter_id_name: "TCGA_Breast_Cancer_Proteome",
              file_name: "06082e49-a0da-4abe-ade4-aceda61c5c91.tar.gz",
              study_run_metadata_submitter_id: "S015-1-1",
              project_name: "CPTAC-Retrospective",
              file_type: "PSM",
              file_size: "215142555"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test filteredFilesPaginatedQuery", inject(
    [BrowseByFileService],
    (service: BrowseByFileService) => {
      service.getFilteredFilesPaginated(0, 10, "", {}).subscribe(data => {
        expect(data).toBeDefined();
        expect(data["getPaginatedUIFile"].uiFiles.length).toBe(2);
        expect(data["getPaginatedUIFile"].total).toBe(24392);
        expect(data["getPaginatedUIFile"].pagination).toEqual({
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 24392,
          pages: 2440,
          size: 10
        });
      });

      const op = controller.expectOne(service.filteredFilesPaginatedQuery);

      expect(op.operation.variables.offset_value).toBe(0);

      op.flush({
        data: {
          getPaginatedUIFile: {
            total: 24392,
            uiFiles: [
              {
                submitter_id_name: "PCT_SWATH_Kidney",
                study_id: "ad18f195-f3c0-11e8-a44b-0a9c39d33490",
                file_name: "GUOT_L130410_001C_SW",
                study_run_metadata_submitter_id: "SRM25730263-1",
                project_name: "Quantitative digital maps of tissue biopsies",
                data_category: "Raw Mass Spectra",
                file_type: "Proprietary",
                access: "Open",
                file_size: "1648474250",
                file_id: "00897698-f7eb-11e8-aaae-520068b8b101",
                md5sum: "8b0d7785cc4cd2a6c01c41bdc5ccff4f",
                downloadable: "Yes",
                pdc_study_id: "PDC000222",
				embargo_date: "2021-08-03"
              },
              {
                submitter_id_name: "PCT_SWATH_Kidney",
                study_id: "ad18f195-f3c0-11e8-a44b-0a9c39d33490",
                file_name: "GUOT_L130410_002_SW",
                study_run_metadata_submitter_id: "SRM25730263-2",
                project_name: "Quantitative digital maps of tissue biopsies",
                data_category: "Raw Mass Spectra",
                file_type: "Proprietary",
                access: "Open",
                file_size: "1714976163",
                file_id: "009267ec-f7eb-11e8-882b-520068b8b101",
                md5sum: "67862d94ae0325a526adcce93cc5ea96",
                downloadable: "Yes",
                pdc_study_id: "PDC000221",
				embargo_date: "2021-08-03"
              }
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 24392,
              pages: 2440,
              size: 10
            }
          }
        }
      });

      controller.verify();
    }
  ));
});
