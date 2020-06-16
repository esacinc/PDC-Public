import { of } from "rxjs";
import { Observable } from "rxjs";
import { FrontPageService } from "./../../front-page.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { HumanBodyChartComponent } from "./human-body-chart.component";

class MockFrontPageService {
  getDataForHumanBody(): Observable<any> {
    return of({
      uiPrimarySiteCaseCount: [
        {
          major_primary_site: "Brain",
          cases_count: 329,
          primarySites: ["Brain"],
        },
        {
          major_primary_site: "Breast",
          cases_count: 233,
          primarySites: ["Breast"],
        },
      ],
    });
  }
}

describe("HumanBodyChartComponent", () => {
  let component: HumanBodyChartComponent;
  let fixture: ComponentFixture<HumanBodyChartComponent>;
  let serviceSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HumanBodyChartComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(HumanBodyChartComponent, {
      set: {
        providers: [
          { provide: FrontPageService, useClass: MockFrontPageService },
        ],
      },
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(HumanBodyChartComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.dataSetsForHumanBody.length).toBeGreaterThan(0);
  });
});
