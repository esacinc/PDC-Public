import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";
import { BottomNavbarService } from "./bottom-navbar.service";
import gql from "graphql-tag";

//@@@PDC-3163: Add data release version to the UI
describe("BottomNavbarService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BottomNavbarService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [BottomNavbarService],
    (service: BottomNavbarService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test getReleaseVersionDetails", inject([BottomNavbarService], (service: BottomNavbarService) => {
    service.getReleaseVersionDetails().subscribe((data) => {
      expect(data).toBeDefined();
      expect(data["uiDataVersionSoftwareVersion"].length).toBe(1);
      expect(data["uiDataVersionSoftwareVersion"][0].data_release).toBe(
        "0"
      );
    });

    const op = controller.expectOne(gql`
        query uiDataVersionSoftwareVersion {
            uiDataVersionSoftwareVersion {
                data_release
                build_tag
            }
        }
    `);

    op.flush({
      data: {
        uiDataVersionSoftwareVersion: [
          {
            data_release: "1.8",
            build_tag: "1.0.23"
          },
        ],
      },
    });

    controller.verify();
  }));
});
