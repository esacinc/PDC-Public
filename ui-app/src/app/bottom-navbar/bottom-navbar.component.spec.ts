import { OverlayWindowService } from "./../overlay-window/overlay-window.service";
import { RouterTestingModule } from "@angular/router/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { PDCUserService } from "../pdcuser.service";
import { BottomNavbarComponent } from "./bottom-navbar.component";
import { BottomNavbarService } from "./bottom-navbar.service";
import { Observable, of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

class MockPDCUserService {}

class MockOverlayWindowService {}

class MockBottomNavbarService {
  //@@@PDC-3163: Add data release version to the UI
  //This data keeps changing and need to be updated.
  getReleaseVersionDetails(): Observable<any> {
    return of({
      uiDataVersionSoftwareVersion: [
        {
          data_release: "1.8",
          build_tag: "1.0.23"
        }
      ]
    });
  }
}

describe("BottomNavbarComponent", () => {
  let component: BottomNavbarComponent;
  let fixture: ComponentFixture<BottomNavbarComponent>;
  let service: PDCUserService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [BottomNavbarComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule],
    providers: [PDCUserService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    TestBed.overrideComponent(BottomNavbarComponent, {
      set: {
        providers: [
          { provide: PDCUserService, useClass: MockPDCUserService },
          { provide: OverlayWindowService, useValue: MockOverlayWindowService },
          { provide: BottomNavbarService, useClass: MockBottomNavbarService
          },
        ]
      }
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.get(PDCUserService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test ngOnInit", () => {
    component.ngOnInit();
    service.isLoggedIn.next(true);
    expect(component.isUserLoggedIn).toBeFalsy();
  });
});
