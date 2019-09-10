import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { RouterTestingModule } from "@angular/router/testing";
import { PDCUserService } from "./../../pdcuser.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqComponent } from "./faq.component";

class MockOverlayWindowService {
  open(value: String) {}
}

describe("FaqComponent", () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let service: PDCUserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FaqComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        PDCUserService,
        { provide: OverlayWindowService, useClass: MockOverlayWindowService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
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
