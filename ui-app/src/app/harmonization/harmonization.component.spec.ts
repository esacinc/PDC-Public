import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HarmonizationComponent } from './harmonization.component';

describe('HarmonizationComponent', () => {
  let component: HarmonizationComponent;
  let fixture: ComponentFixture<HarmonizationComponent>;
  let originalTimeout;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HarmonizationComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HarmonizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
});
