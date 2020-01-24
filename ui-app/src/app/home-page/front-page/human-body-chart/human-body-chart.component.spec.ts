import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { FrontPageService } from './../../front-page.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HumanBodyChartComponent } from './human-body-chart.component';

class MockFrontPageService {
  getDataForHumanBody(): Observable<any> {
    return of({
      "uiPrimarySiteCaseCount": [
        {
          "primary_site": "Brain",
          "cases_count": 329
        },
        {
          "primary_site": "Breast",
          "cases_count": 233
        },
        {
          "primary_site": "Bronchus and lung",
          "cases_count": 111
        },
        {
          "primary_site": "Colon",
          "cases_count": 164
        },
        {
          "primary_site": "Kidney",
          "cases_count": 119
        },
        {
          "primary_site": "Liver",
          "cases_count": 170
        },
        {
          "primary_site": "Not Reported",
          "cases_count": 52
        },
        {
          "primary_site": "Ovary",
          "cases_count": 283
        },
        {
          "primary_site": "Rectum",
          "cases_count": 30
        },
        {
          "primary_site": "Uterus, NOS",
          "cases_count": 104
        }
      ]
    });
  }
}

describe('HumanBodyChartComponent', () => {
  let component: HumanBodyChartComponent;
  let fixture: ComponentFixture<HumanBodyChartComponent>;
  let serviceSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HumanBodyChartComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(HumanBodyChartComponent, {
      set: {
        providers: [
          { provide: FrontPageService, useClass:  MockFrontPageService}
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(HumanBodyChartComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.dataSetsForHumanBody.length).toBeGreaterThan(0);
  });

});
