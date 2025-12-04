import { RouterTestingModule } from '@angular/router/testing';
import { PDCUserService } from './../../pdcuser.service';

import { Observable, of } from "rxjs";

import { provideHttpClientTesting } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { ChorusauthService } from "../../chorusauth.service";
import { LoginComponent } from "./login.component";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockAuthService {
  signIn(providerId: string): Promise<any> {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }

  signOut(socialPlatform: string) {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }

  checkUser(email: string): Observable<boolean> {
    return of(true);
  }

  authenticateUser(email: string): Observable<boolean> {
    return of(true);
  }
}

class MockMatDialogRef {
  close() {}
}

class MockMatDialog {
  open(): any {
    return {};
  }
}

class MockPDCUserService {

}

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [LoginComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [MatDialogModule, RouterTestingModule],
    providers: [
        ChorusauthService,

        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MatDialog, userClass: MockMatDialog },
        { provide: PDCUserService, userClass: MockPDCUserService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("social sign out", async () => {

    let spy = spyOn(service, "signOut").and.callThrough();
    component.socialSignOut("google");
    expect(spy).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(component.userEmail).toBe("");
      expect(component.username).toBe("");
    });
  });

  it("test social sign in user exist", async () => {

    let chorusSerrvice = TestBed.get(ChorusauthService);
    let dialogRef = TestBed.get(MatDialogRef);
    let spy = spyOn(service, "signIn").and.callThrough();
    //let spy1 = spyOn(chorusSerrvice, "checkUser").and.returnValue(of(true));
    //let spy2 = spyOn(chorusSerrvice, "authenticateUser").and.returnValue(
    //   of(true)
    // );

    expect(spy).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      //expect(spy1).toHaveBeenCalledWith("xxx@esacinc.com");
      //expect(spy2).toHaveBeenCalledWith("xxx@esacinc.com");
     // expect(component.userEmail).toBe("xxx@esacinc.com");
     // expect(component.username).toBe("xxxyyy");
    });
  });

  xit("test social sign in user exist", async () => {

    let chorusSerrvice = TestBed.get(ChorusauthService);
    let spy1 = spyOn(chorusSerrvice, "checkUser").and.returnValue(of(false));
    let dialogRef = TestBed.get(MatDialogRef);
    let dialogRefSpy = spyOn(dialogRef, "close").and.callThrough();
    fixture.whenStable().then(() => {
      expect(spy1).toHaveBeenCalledWith("xxx@esacinc.com");
      expect(dialogRefSpy).toHaveBeenCalled();
      expect(component.userEmail).toBe("xxx@esacinc.com");
      expect(component.username).toBe("xxxyyy");
    });
  });
});
