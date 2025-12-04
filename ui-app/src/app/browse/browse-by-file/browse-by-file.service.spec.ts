import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";

import { BrowseByFileService } from "./browse-by-file.service";
import gql from "graphql-tag";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("BrowseByFileService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ApolloTestingModule],
    providers: [BrowseByFileService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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
  
  //@@@PDC-3307 add study version to file manifest
/*   it("test getStudiesVersions", inject([BrowseByFileService], (service: BrowseByFileService) => {
    service.getStudiesVersions().subscribe(data => {
      expect(data).toBeDefined();
	  expect(data.getPaginatedUIStudy).toBeDefined();
	  expect(data.getPaginatedUIStudy.uiStudies).toBeDefined();
    });
  })); */

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
      service.getFilteredFilesPaginated("", 0, 10, "", {}).subscribe(data => {
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
  
    it("test getFilteredLegacyDataFilesPaginated", inject(
    [BrowseByFileService],
    (service: BrowseByFileService) => {
      service.getFilteredLegacyDataFilesPaginated(0, 10, "", {}).subscribe(data => {
        expect(data).toBeDefined();
        expect(data["getPaginatedUILegacyFile"].uiLegacyFiles.length).toBe(2);
        expect(data["getPaginatedUILegacyFile"].total).toBe(14363);
        expect(data["getPaginatedUILegacyFile"].pagination).toEqual({
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 14363,
          pages: 1437,
          size: 10
        });
      });

      const op = controller.expectOne(service.filteredLegacyDataFilesPaginatedQuery);

      expect(op.operation.variables.offset_value).toBe(0);

      op.flush({
        data: {
          getPaginatedUILegacyFile: {
            total: 14363,
            uiLegacyFiles: [
              {
                file_id: "01c05f82-2bfa-420b-9de6-286f02b883f3",
				pdc_study_id: "PDC000010",
			    submitter_id_name: "Study PTM CPTC",
			    embargo_date: null,
			    file_name: "CompRef_2B_P5-29_P5-61_P6-34_P6-38_W_BI_20130503_H-JQ_f10.raw",
			    study_run_metadata_submitter_id: "CompRef_Proteome_BI_4",
			    project_name: "CPTAC Phase II",
			    data_category: "Raw Mass Spectra",
			    file_type: "Proprietary",
			    file_size: "1316547294",
			    md5sum: "0955cb370c141576f8ae027d4d0da3a5",
			    downloadable: "Yes",
			    access: "Open",
			    study_id: "0fd23ab6-d076-4555-8b5e-9260db315773",
              },
              {
                file_id: "02ecb8ce-2269-48bf-9a0a-118a9d36c4a4",
				pdc_study_id: "PDC000010",
				submitter_id_name: "Study PTM CPTC",
				embargo_date: null,
				file_name: "H20120605_JQ_CPTAC2_Compref4_protfxn22.raw.cap.psm",
				study_run_metadata_submitter_id: "CompRef_Proteome_BI",
				project_name: "CPTAC Phase II",
				data_category: "Peptide Spectral Matches",
				file_type: "Text",
				file_size: "6497088",
				md5sum: "4fec895acdc520cf735282057433a3bf",
				downloadable: "Yes",
				access: "Open",
				study_id: "0fd23ab6-d076-4555-8b5e-9260db315773",
              }
            ],
            pagination: {
              count: 10,
              sort: "",
              from: 0,
              page: 1,
              total: 14363,
              pages: 1437,
              size: 10
            }
          }
        }
      });

      controller.verify();
    }
  ));

  it("test getFilesData", inject([BrowseByFileService], (service: BrowseByFileService) => {
    service.getFilesData("20151104-P50-20ug-s35.mzML.gz;20151109-P58-20ug-s25.raw", "00565863-81cd-49ff-8e60-5fd67e56c2ce").subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiFilesPerStudy"].length).toBe(2);
      expect(data["uiFilesPerStudy"][0].file_name).toBe("20151104-P50-20ug-s35.mzML.gz");
      expect(data["uiFilesPerStudy"][1].file_name).toBe("20151109-P58-20ug-s25.raw");
    });

    const op = controller.expectOne(service.filesDataQuery);

    op.flush({
      data: {
        uiFilesPerStudy: [
          {
            file_id: "00040a6f-b7e5-4e5c-ab57-ee92a0ba8201",
            file_name: "20151104-P50-20ug-s35.mzML.gz",
            signedUrl: {
              url: null
            }
          },
          {
            file_id: "000ec5fd-4315-48ec-9f50-340e10bd5195",
            file_name: "20151109-P58-20ug-s25.raw",
            signedUrl: {
              url: null
            }
          }          
        ]
      }
    });

    controller.verify();
  }));

  it("test getLegacyFilesData", inject([BrowseByFileService], (service: BrowseByFileService) => {
    service.getLegacyFilesData("1B133_W2_QTRAP_061116_013CPTAC17.wiff;1A135_W2_QTRAP_061116_011CPTAC15.wiff").subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiLegacyFilesPerStudy"].length).toBe(2);
      expect(data["uiLegacyFilesPerStudy"][0].file_name).toBe("1B133_W2_QTRAP_061116_013CPTAC17.wiff");
      expect(data["uiLegacyFilesPerStudy"][1].file_name).toBe("1A135_W2_QTRAP_061116_011CPTAC15.wiff");
    });

    const op = controller.expectOne(service.legacyFilesDataQuery);

    op.flush({
      data: {
        uiLegacyFilesPerStudy: [
          {
            file_id: "00521226-fcec-4a21-a105-dff1a2ff2ac8",
            file_name: "1B133_W2_QTRAP_061116_013CPTAC17.wiff",
            signedUrl: {
              url: null
            }
          },
          {
            file_id: "018d60a8-45b9-44e1-b242-979dca7f61e4",
            file_name: "1A135_W2_QTRAP_061116_011CPTAC15.wiff",
            signedUrl: {
              url: null
            }
          }          
        ]
      }
    });

    controller.verify();
  }));

  it("test getPaginatedFilesForPublication", inject([BrowseByFileService], (service: BrowseByFileService) => {
    service.getPaginatedFilesForPublication("bef019a4-50b1-11ed-a6f8-0a79dd92157b", 0, 10).subscribe(data => {
      expect(data).toBeDefined();
      expect(data["getPaginatedUIPancancerFiles"].total).toBe(0);
      expect(data["getPaginatedUIPancancerFiles"]["uiPancancerFiles"].length).toBe(0);
    });

    const op = controller.expectOne(service.paginatedFilesForPublicationQuery);

    op.flush({
      data: {
        getPaginatedUIPancancerFiles: {
          total: 0,
          uiPancancerFiles: [],
          pagination: {
            count: 0,
            sort: "",
            from: 0,
            page: 1,
            total: 0,
            pages: 0,
            size: 10
          }
        }
      }
    });

    controller.verify();
  }));

});
