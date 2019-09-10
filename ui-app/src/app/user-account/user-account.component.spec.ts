import { RegistrationPageComponent } from './../welcome-page/registration-page.component';
import { AuthService } from 'angular-6-social-login';
import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ChorusauthService } from '../chorusauth.service';
import { PDCUserService } from '../pdcuser.service';
import { UserAccountComponent } from './user-account.component';

class MockAuthService {
  signIn(providerId: string): Promise<any> {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }
}

describe("UserAccountComponent", () => {
  let component: UserAccountComponent;
  let fixture: ComponentFixture<UserAccountComponent>;
  let userService: PDCUserService;
  let route: Router;
  let userSpy: jasmine.Spy;
  let routeSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccountComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ChorusauthService,
        PDCUserService,
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test submitUpdate with invalid form", () => {
    component.submitUpdate();
    fixture.detectChanges();
    expect(component.formInvalidMessage).toBe(
      "Some required fields are missing."
    );
    expect(component.isValidFormSubmitted).toBeFalsy;
  });

  it("test submitUpdate with valid form and nih registered success", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other",
      user_pass: ""
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID("pdcid");
    // userSpy = spyOn(userService, "createPDCUser").and.returnValue(of(true));

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitUpdate();
    // expect(userSpy).toHaveBeenCalled();
    // expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
  });

  it("test submitUpdate with valid form and nih registered failed", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other",
      user_pass: ""
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID("pdcid");
    // userSpy = spyOn(userService, "createPDCUser").and.returnValue(of(false));

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitUpdate();
    // expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).not.toHaveBeenCalled();
  });

  it("test submitUpdate with valid form and google registered success", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other",
      user_pass: ""
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID(undefined);
    // userSpy = spyOn(userService, "createPDCUserByEmail").and.returnValue(
    //   of(true)
    // );

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitUpdate();
    // expect(userSpy).toHaveBeenCalled();
    // expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
  });

  it("test submitUpdate with valid form and google registered failed", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other",
      user_pass: ""
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID(undefined);
    // userSpy = spyOn(userService, "createPDCUserByEmail").and.returnValue(
    //   of(false)
    // );

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitUpdate();
    // expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).not.toHaveBeenCalled();
  });
});
