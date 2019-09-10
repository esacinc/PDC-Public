import { AuthService } from 'angular-6-social-login';
import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatToolbarModule } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ChorusauthService } from '../chorusauth.service';
import { PDCUserService } from '../pdcuser.service';
import { WelcomePageComponent } from './welcome-page.component';

class MockAuthService {
  signIn(providerId: string): Promise<any> {
    return Promise.resolve({ email: "xxx@esacinc.com", name: "xxxyyy" });
  }
}

describe("WelcomePageComponent", () => {
  let component: WelcomePageComponent;
  let fixture: ComponentFixture<WelcomePageComponent>;
  let socialAuthService: AuthService;
  let userService: PDCUserService;
  let activeRoute: ActivatedRoute;
  let route: Router;
  let userSpy: jasmine.Spy;
  let socialSpy: jasmine.Spy;
  let routeSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WelcomePageComponent],
      imports: [
        MatToolbarModule,
        MatCardModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        ChorusauthService,
        PDCUserService,
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test social sign in success, and navigate to pdc", done => {
    socialAuthService = TestBed.get(AuthService);
    userService = TestBed.get(PDCUserService);
    route = TestBed.get(Router);
    userSpy = spyOn(userService, "checkPDCUserByEmail").and.returnValue(of(0));
    socialSpy = spyOn(socialAuthService, "signIn").and.callThrough();
    routeSpy = spyOn(route, "navigate");
    component.socialSignIn("google");
    expect(socialSpy).toHaveBeenCalled();
    socialSpy.calls.mostRecent().returnValue.then(() => {
      expect(userSpy).toHaveBeenCalledWith("xxx@esacinc.com");
      //expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
      done();
    });
  });

  it("test social sign in success with new user, and navigate to registration", done => {
    socialAuthService = TestBed.get(AuthService);
    userService = TestBed.get(PDCUserService);
    route = TestBed.get(Router);
    userSpy = spyOn(userService, "checkPDCUserByEmail").and.returnValue(of(1));
    socialSpy = spyOn(socialAuthService, "signIn").and.callThrough();
    routeSpy = spyOn(route, "navigate");
    component.socialSignIn("google");
    expect(socialSpy).toHaveBeenCalled();
    socialSpy.calls.mostRecent().returnValue.then(() => {
      expect(userSpy).toHaveBeenCalledWith("xxx@esacinc.com");
      //expect(routeSpy).toHaveBeenCalledWith(["registration"]);
      let username = userService.getUserName();
      expect(username).toBe("");
      done();
    });
  });

  it("test social sign in with error", done => {
    socialAuthService = TestBed.get(AuthService);
    userService = TestBed.get(PDCUserService);
    route = TestBed.get(Router);
    userSpy = spyOn(userService, "checkPDCUserByEmail").and.returnValue(of(2));
    socialSpy = spyOn(socialAuthService, "signIn").and.callThrough();
    component.socialSignIn("google");
    expect(socialSpy).toHaveBeenCalled();
    socialSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(userSpy).toHaveBeenCalledWith("xxx@esacinc.com");
      // expect(component.systemErrorMessage).toBe(
      //   "System Error. Please contact your system admin"
      // );
      done();
    });
  });

  it("test nih sign in success, and navigate to pdc", done => {
    userService = TestBed.get(PDCUserService);
    route = TestBed.get(Router);
    userSpy = spyOn(userService, "checkPDCUser").and.callFake(() => of(0));
    routeSpy = spyOn(route, "navigate");
    component.eRAnihSignIn("nihuid");
    expect(userSpy).toHaveBeenCalledWith("nihuid");
    userSpy.calls.mostRecent().returnValue.subscribe(() => {
      expect(routeSpy).toHaveBeenCalledWith(["pdc"]);
      done();
    });
  });

  it("test nih sign in success with new user, and navigate to registration", done => {
    userService = TestBed.get(PDCUserService);
    route = TestBed.get(Router);
    userSpy = spyOn(userService, "checkPDCUser").and.callFake(() => of(1));
    routeSpy = spyOn(route, "navigate");
    component.eRAnihSignIn("nihuid");
    expect(userSpy).toHaveBeenCalledWith("nihuid");
    userSpy.calls.mostRecent().returnValue.subscribe(() => {
      expect(routeSpy).toHaveBeenCalledWith(["registration"]);
      done();
    });
  });

  it("test nih sign in with error", () => {
    userService = TestBed.get(PDCUserService);
    userSpy = spyOn(userService, "checkPDCUser").and.returnValue(of(2));
    component.eRAnihSignIn("nihuid");
    expect(userSpy).toHaveBeenCalledWith("nihuid");
    fixture.detectChanges();
    expect(component.systemErrorMessage).toBe(
      "System Error. Please contact your system admin"
    );
  });

  it("test ngOnInit", () => {
    activeRoute = TestBed.get(ActivatedRoute);
    activeRoute.queryParams = of({ uid: "nih12345" });
    userService = TestBed.get(PDCUserService);
    userSpy = spyOn(userService, "checkPDCUser").and.returnValue(of(2));
    component.ngOnInit();
    expect(userSpy).toHaveBeenCalledWith("nih12345");
    fixture.detectChanges();
    expect(component.systemErrorMessage).toBe(
      "System Error. Please contact your system admin"
    );
  });
});
