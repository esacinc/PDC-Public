import { OverlayWindowService } from './../overlay-window/overlay-window.service';
import { RegistrationPageComponent } from "./../welcome-page/registration-page.component";

import { of } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

import { provideHttpClientTesting } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { ChorusauthService } from "../chorusauth.service";
import { PDCUserService } from "../pdcuser.service";
import { UserAccountComponent } from "./user-account.component";
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


class MockAuthService {
  signIn(providerId: string): Promise<any> {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }
}
class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}
class MockMatDialogRef {
  close() {}
}

class MockService {


}

describe("UserAccountComponent", () => {
  let component: UserAccountComponent;
  let fixture: ComponentFixture<UserAccountComponent>;
  let userService: PDCUserService;
  let route: Router;
  let userSpy: jasmine.Spy;
  let routeSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UserAccountComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule.withRoutes([])],
    providers: [
        ChorusauthService,
        PDCUserService,

        {
            provide: MAT_DIALOG_DATA,
            useValue: { data: "id" },
        },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MatDialog, useClass: MockDialog },
        { provide: OverlayWindowService, useClass: MockService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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
      login_username: email,
      organization: "other",
      searchType: "other",
      user_pass: "",
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
      login_username: email,
      organization: "other",
      searchType: "other",
      user_pass: "",
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
      login_username: email,
      organization: "other",
      searchType: "other",
      user_pass: "",
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
      login_username: email,
      organization: "other",
      searchType: "other",
      user_pass: "",
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
