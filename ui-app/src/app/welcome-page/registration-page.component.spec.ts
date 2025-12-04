import { OverlayWindowService } from './../overlay-window/overlay-window.service';

import { of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ChorusauthService } from '../chorusauth.service';
import { PDCUserService } from '../pdcuser.service';
import { RegistrationPageComponent } from './registration-page.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockAuthService {
  signIn(providerId: string): Promise<any> {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }
}

class MockOverlayWindowService{
  open(value: string){

  }
}

describe("RegistrationPageComponent", () => {
  let component: RegistrationPageComponent;
  let fixture: ComponentFixture<RegistrationPageComponent>;
  let userService: PDCUserService;
  let route: Router;
  let userSpy: jasmine.Spy;
  let routeSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RegistrationPageComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule.withRoutes([])],
    providers: [
        ChorusauthService,
        PDCUserService,

        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test submitRegistration with invalid form", () => {
    component.submitRegistration();
    fixture.detectChanges();
    expect(component.formInvalidMessage).toBe(
      "Some required fields are missing."
    );
    expect(component.isValidFormSubmitted).toBeFalsy;
  });

  it("test submitRegistration with valid form and nih registered success", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other"
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID("pdcid");
    userSpy = spyOn(userService, "createPDCUser").and.returnValue(of(true));

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitRegistration();
    expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
  });

  it("test submitRegistration with valid form and nih registered failed", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other"
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID("pdcid");
    userSpy = spyOn(userService, "createPDCUser").and.returnValue(of(false));

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitRegistration();
    expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).not.toHaveBeenCalled();
  });

  it("test submitRegistration with valid form and google registered success", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other"
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID(undefined);
    userSpy = spyOn(userService, "createPDCUserByEmail").and.returnValue(
      of(true)
    );

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitRegistration();
    expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
  });

  it("test submitRegistration with valid form and google registered failed", () => {
    const firstName = "firstname";
    const lastName = "lastname";
    const email = "first.last@esacinc.com";

    component.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      email: email,
      organization: "other",
      searchType: "other"
    });
    component.otherResearcherType = "other";
    component.selectedResearcherType = "other";
    component.registrationForm;
    userService = TestBed.get(PDCUserService);
    userService.setUserIDType("");
    userService.setUID(undefined);
    userSpy = spyOn(userService, "createPDCUserByEmail").and.returnValue(
      of(false)
    );

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate");
    component.submitRegistration();
    expect(userSpy).toHaveBeenCalled();
    expect(routeSpy).not.toHaveBeenCalled();
  });
});
