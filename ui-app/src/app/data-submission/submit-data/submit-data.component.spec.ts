import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitDataComponent } from './submit-data.component';

describe("SubmitDataComponent", () => {
  let component: SubmitDataComponent;
  let fixture: ComponentFixture<SubmitDataComponent>;

  beforeEach(async(() => {
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
