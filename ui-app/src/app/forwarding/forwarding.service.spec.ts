import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { inject, TestBed } from "@angular/core/testing";
import { ForwardingSearchService } from "./forwarding.service";

//@@@PDC-3901: Develop backend study forwarding
describe("ForwardingSearchService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ForwardingSearchService],
      imports: [ApolloTestingModule],
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([ForwardingSearchService], (service: ForwardingSearchService) => {
    expect(service).toBeTruthy();
  }));

  it("test getStudySearchByExternalRef", inject(
    [ForwardingSearchService],
    (service: ForwardingSearchService) => {
      service.getStudySearchByExternalRef("S045").subscribe((data) => {
        expect(data).toBeDefined();
        expect(data["studySearchByExternalId"].studies.length).toBe(3);
        expect(data["studySearchByExternalId"].studies[0].name).toBe(
          "Prospective COAD Proteome S037-1"
        );
      });

      const op = controller.expectOne(service.studySearchByExternalRefQuery);

      op.flush({
        data: {
          studySearchByExternalId: {
            studies: [
              {
                record_type: "study",
                name: "Prospective COAD Proteome S037-1",
                submitter_id_name: "Prospective Colon VU Proteome",
                study_id: "bb67ec40-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "Prospective COAD Proteome S037-1",
                pdc_study_id: "PDC000109"
              },
              {
                record_type: "study",
                name: "Prospective COAD Proteome S037-2",
                submitter_id_name: "Prospective Colon PNNL Proteome Qeplus",
                study_id: "bbc1441e-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "Prospective COAD Proteome S037-2",
                pdc_study_id: "PDC000116"
              },
              {
                record_type: "study",
                name: "Prospective COAD Phosphoproteome S037-3",
                submitter_id_name: "Prospective Colon PNNL Phosphoproteome Lumos",
                study_id: "bc23a4a1-57b8-11e8-b07a-00a098d917f8",
                study_submitter_id: "Prospective COAD Phosphoproteome S037-3",
                pdc_study_id: "PDC000117"
              }
            ],
          },
        },
      });

      controller.verify();
    }
  ));

});
