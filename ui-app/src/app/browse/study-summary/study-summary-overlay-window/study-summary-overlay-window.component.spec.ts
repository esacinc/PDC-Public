import { StudySummaryOverlayRemoteRef } from "./study-summary-overlay-remote-ref";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { StudySummaryOverlayWindowComponent } from "./study-summary-overlay-window.component";

class MockStudySummaryOverlayRemoteRef {
  close() {}
}

describe("StudySummaryOverlayWindowComponent", () => {
  let component: StudySummaryOverlayWindowComponent;
  let fixture: ComponentFixture<StudySummaryOverlayWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StudySummaryOverlayWindowComponent],
      providers: [
        {
          provide: StudySummaryOverlayRemoteRef,
          useValue: MockStudySummaryOverlayRemoteRef
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudySummaryOverlayWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
