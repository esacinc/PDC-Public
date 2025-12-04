import { ApolloTestingController, ApolloTestingModule } from "apollo-angular/testing";

import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";

import { WorkflowManagerFileService } from "./workflow-manager.service";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("WorkflowManagerService", () => {
  let apolloController: ApolloTestingController;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ApolloTestingModule],
    providers: [WorkflowManagerFileService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    apolloController = TestBed.get(ApolloTestingController);
    httpController = TestBed.get(HttpTestingController);
  });

  it("should be created", inject(
    [WorkflowManagerFileService],
    (service: WorkflowManagerFileService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getMetadataForFiles", inject(
    [WorkflowManagerFileService],
    (service: WorkflowManagerFileService) => {
      service.getMetadataForFiles("fn").subscribe(data => {
        expect(data["fileMetadata"]).toBeDefined();
        expect(data["fileMetadata"].length).toBe(1);
      });

      const op = apolloController.expectOne(service.fileMedatdataQuery);

      expect(op.operation.variables.file_names).toEqual("fn");

      op.flush({
        data: {
          fileMetadata: [
            {
              file_name: "06082e49-a0da-4abe-ade4-aceda61c5c91.tar.gz",
              file_location:
                "s3://pdcdatastore/06082e49-a0da-4abe-ade4-aceda61c5c91.tar.gz",
              md5sum: "da0c0d06331f6443863b58814ee8a0c5",
              file_size: "215142555",
              file_submitter_id:
                "01TCGA_AO-A12D-01A_C8-A131-01A_AO-A12B-01A_Proteome_BI_20130208_PSM.tar.gz",
              analyte: "Proteome",
              instrument: "Q Exactive",
              folder_name:
                "01TCGA_AO-A12D-01A_C8-A131-01A_AO-A12B-01A_Proteome_BI_20130208",
              fraction: "1-24, A",
              experiment_type: "iTRAQ4",
              aliquots: [
                {
                  aliquot_id: "00000000-0000-0000-0000-000000000000",
                  aliquot_submitter_id: "Internal Reference",
                  label: "iTRAQ4 117",
                  sample_id: null,
                  sample_submitter_id: null
                },
                {
                  aliquot_id: "0003cc2c-6429-11e8-bcf1-0a2705229b82",
                  aliquot_submitter_id: "TCGA-AO-A12B-01A-41-A21V-30",
                  label: "iTRAQ4 116",
                  sample_id: "398a4199-6420-11e8-bcf1-0a2705229b82",
                  sample_submitter_id: "TCGA-AO-A12B-01A"
                },
                {
                  aliquot_id: "39499ce3-6429-11e8-bcf1-0a2705229b82",
                  aliquot_submitter_id: "TCGA-C8-A131-01A-41-A21V-30",
                  label: "iTRAQ4 115",
                  sample_id: "8a8f1c0b-6420-11e8-bcf1-0a2705229b82",
                  sample_submitter_id: "TCGA-C8-A131-01A"
                },
                {
                  aliquot_id: "0140af49-6429-11e8-bcf1-0a2705229b82",
                  aliquot_submitter_id: "TCGA-AO-A12D-01A-41-A21V-30",
                  label: "iTRAQ4 114",
                  sample_id: "3b201882-6420-11e8-bcf1-0a2705229b82",
                  sample_submitter_id: "TCGA-AO-A12D-01A"
                }
              ]
            }
          ]
        }
      });

      apolloController.verify();
    }
  ));

  it("test getClusterStatus", inject(
    [WorkflowManagerFileService],
    (service: WorkflowManagerFileService) => {
      service.getClusterStatus("1").subscribe(data => {
        expect(data).toBeDefined();
        expect(data[0]).toBe("good");
      });

      const op = httpController.expectOne("http://localhost:3010/api/buckets/status/1");

      expect(op.request.method).toEqual("GET");

      op.flush(["good", "good", "bad"]);

      httpController.verify();
    }
  ));

  it("test submitCDAPWorkflow", inject(
    [WorkflowManagerFileService],
    (service: WorkflowManagerFileService) => {
      service.submitCDAPWorkflow({}, "wname", "cname").subscribe();

      httpController.match("http://localhost:3010/api/workflows/submitCDAPWorkflow");

      httpController.verify();
    }
  ));

  it("test getAvailableWorkflows", inject(
    [WorkflowManagerFileService],
    (service: WorkflowManagerFileService) => {
      service
        .getAvailableWorkflows("type", "instru", "anafrac", "expty")
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data[0]).toBe("1");
        });

      const op = httpController.expectOne(
        "http://localhost:3010/api/workflows/type/expty/instru/anafrac"
      );

      expect(op.request.method).toEqual("GET");

      op.flush(["1", "2"]);

      httpController.verify();
    }
  ));
});
