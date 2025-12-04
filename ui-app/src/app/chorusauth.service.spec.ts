import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ChorusauthService } from './chorusauth.service';
import { ChorusLab, ChorusLabResponse, ChorusUser, UserLabMembership } from './types';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe("ChorusauthService", () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ChorusauthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    controller = TestBed.get(HttpTestingController);
  });

  afterAll(() =>{
    localStorage.clear();
  });

  it("should be created", inject(
    [ChorusauthService],
    (service: ChorusauthService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("test checkUser", inject(
    [ChorusauthService],
    (service: ChorusauthService) => {
      service.checkUser("xxx@esacinc.com").subscribe(data => {
        expect(data).toBeFalsy();
      });
      //const req1 = controller.expectOne("/chorusapi/user/xxx@esacinc.com");
     // req1.flush({ data: [] });
      service.checkUser("yyy@esacinc.com").subscribe(data => {
        expect(data).toBeTruthy();
      });

      //const req2 = controller.expectOne("/chorusapi/user/yyy@esacinc.com");
      let membership: UserLabMembership = {
        id: 1,
        lab_id: 1,
        user_id: 1
      };
      let user: ChorusUser = {
        id: 100,
        email: "yyy@esacinc.com",
        firstName: "q",
        lastName: "t",
        userLabMemberships: [membership]
      };
      //req2.flush({ data: [user] });

      //controller.verify();
    }
  ));

  it("test createUser", inject(
    [ChorusauthService],
    (service: ChorusauthService) => {
      service.createUser("xxx", "xxx@esacinc.com", [1, 2, 3]);
      const req1 = controller.expectOne("/workspace/security");
      expect(req1.request.method).toEqual("POST");
      req1.flush({});

      //const req2 = controller.expectOne("/chorusapi/user/xxx@esacinc.com");
      //expect(req2.request.method).toEqual("PUT");
     // req2.flush({});

      //controller.verify();
    }
  ));

  it("test authenticateUser", inject(
    [ChorusauthService],
    (service: ChorusauthService) => {
      service.authenticateUser("xxx@esacinc.com").subscribe(data => {
        expect(data).toBeTruthy();
      });
      //const req = controller.expectOne("/workspace/j_spring_security_check");
      //expect(req.request.method).toEqual("POST");
      //req.flush({ data: [] });
      //controller.verify();
    }
  ));

  it("test searchLabs", inject(
    [ChorusauthService],
    (service: ChorusauthService) => {
      let chorusLab: ChorusLab = {
        id: 1,
        contactEmail: "bbb@esacinc.com",
        institutionUrl: "",
        name: "bbb",
        uploadLimitInGb: 123
      };

      let chorusLab1: ChorusLab = {
        id: 21,
        contactEmail: "kkk@esacinc.com",
        institutionUrl: "",
        name: "kkk",
        uploadLimitInGb: 321
      };

      let response: ChorusLabResponse = {
        error: false,
        data: [chorusLab]
      };

      service.searchLabs("colon", [chorusLab1]).subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].name).toBe("bbb");
        expect(data[0].contactEmail).toBe("bbb@esacinc.com");
        expect(data[0].institutionUrl).toBe("");
        expect(data[0].uploadLimitInGb).toBe(123);
      });

      //const req = controller.expectOne("/chorusapi/lab?name=colon");
      //expect(req.request.method).toEqual("GET");
      //req.flush(response);
      //controller.verify();
    }
  ));
});
