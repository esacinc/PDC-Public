import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HumanBodyChartComponent } from './human-body-chart.component';

describe('HumanBodyChartComponent', () => {
  let component: HumanBodyChartComponent;
  let fixture: ComponentFixture<HumanBodyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HumanBodyChartComponent ],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumanBodyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
