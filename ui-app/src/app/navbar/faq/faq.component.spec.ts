import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { RouterTestingModule } from "@angular/router/testing";
import { PDCUserService } from "./../../pdcuser.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { FaqComponent } from "./faq.component";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

class MockOverlayWindowService {
  open(value: String) {}
}

describe("FaqComponent", () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let service: PDCUserService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [FaqComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule],
    providers: [
        PDCUserService,
        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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
