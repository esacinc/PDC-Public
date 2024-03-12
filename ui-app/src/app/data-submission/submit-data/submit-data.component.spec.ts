import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubmitDataComponent } from './submit-data.component';

describe("SubmitDataComponent", () => {
  let component: SubmitDataComponent;
  let fixture: ComponentFixture<SubmitDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitDataComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
