import { LoginUserResponse, PDCUserData, PDCUserId } from "./types";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { TestBed, inject } from "@angular/core/testing";

import { PDCUserService } from "./pdcuser.service";

describe("PDCUserService", () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PDCUserService],
      imports: [HttpClientTestingModule]
    });

    controller = TestBed.get(HttpTestingController);
  });

  afterAll(() =>{
    localStorage.clear();
  });

  it("should be created", inject(
    [PDCUserService],
    (service: PDCUserService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("#isLoggedIn should return false after creation", inject(
    [PDCUserService],
    (service: PDCUserService) => {
      expect(service.isUserLoggedIn()).toBeFalsy();
    }
  ));

  it("test setter", inject([PDCUserService], (service: PDCUserService) => {
    let email: string = "xxx@esacinc.com";
    let name: string = "aabb";
    let userid_type: string = "google";
    let organization: string = "esac";
    let uid: string = "uid";
    let isLoggedIn: boolean = true;

    service.setLoginUsername(email);
    service.setEmail(email);
    service.setName(name);
    service.setUserIDType(userid_type);
    service.setOrganization(organization);
    service.setUID(uid);
    service.setIsLoggedIn(isLoggedIn);

    expect(service.isUserLoggedIn()).toBeTruthy();
    expect(service.getEmail()).toBe(email);
    expect(service.getUserName()).toBe(name);
    expect(service.getOrganization()).toBe(organization);
    expect(service.getUserIDType()).toBe(userid_type);
    expect(service.getUID()).toBe(uid);
  }));

  it("test checkPDCUser", inject(
    [PDCUserService],
    (service: PDCUserService) => {
      let userId: PDCUserId = {
        type: "proteomics",
        data: [123]
      };

      let userData: PDCUserData = {
        user_id: userId,
        login_username: "iii@esacinc.com",
        email: "iii@esacinc.com",
        user_id_type: "proteomics",
        name: "iii",
        organization: "esac",
        user_type: "google",
        last_login_date: "12/31/2018",
        create_date: "12/31/2018",
        registered: 0
      };

      let response: LoginUserResponse = {
        error: false,
        data: [userData]
      };

      
      service.checkPDCUser("iii@esacinc.com").subscribe(data => {
        expect(data).toBe(1);
      });
      //const req = controller.expectOne("/pdcapi/user/uid/iii@esacinc.com");
      //req.flush({ data: [response] });
      //controller.verify();
    }
  ));

  it("test checkPDCUserByEmail", inject(
    [PDCUserService],
    (service: PDCUserService) => {
      let userId: PDCUserId = {
        type: "proteomics",
        data: [123]
      };

      let userData: PDCUserData = {
        user_id: userId,
        login_username: "iii@esacinc.com",
        email: "iii@esacinc.com",
        user_id_type: "proteomics",
        name: "iii",
        organization: "esac",
        user_type: "google",
        last_login_date: "12/31/2018",
        create_date: "12/31/2018",
        registered: 0
      };

      let response: LoginUserResponse = {
        error: false,
        data: [userData]
      };

      service.checkPDCUserByEmail("iii@esacinc.com").then(data => {
        expect(data).toBe(0);
      });
      //const req = controller.expectOne("/pdcapi/user/iii@esacinc.com");
      //req.flush({ data: [response] });
      //controller.verify();
    }
  ));
});
