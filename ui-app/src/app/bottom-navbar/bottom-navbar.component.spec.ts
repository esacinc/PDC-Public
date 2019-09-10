import { OverlayWindowService } from "./../overlay-window/overlay-window.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PDCUserService } from "../pdcuser.service";
import { BottomNavbarComponent } from "./bottom-navbar.component";

class MockPDCUserService {}

class MockOverlayWindowService {}

describe("BottomNavbarComponent", () => {
  let component: BottomNavbarComponent;
  let fixture: ComponentFixture<BottomNavbarComponent>;
  let service: PDCUserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BottomNavbarComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [PDCUserService]
    });

    TestBed.overrideComponent(BottomNavbarComponent, {
      set: {
        providers: [
          { provide: PDCUserService, useClass: MockPDCUserService },
          { provide: OverlayWindowService, useValue: MockOverlayWindowService }
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
