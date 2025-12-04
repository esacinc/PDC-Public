import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ChorusauthService } from '../../chorusauth.service';
import { ChorusLab } from '../../types';
import { LabSelectionComponent } from './lab-selection.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockDialogRef {
  close() {}
}

describe("LabSelectionComponent", () => {
  let component: LabSelectionComponent;
  let fixture: ComponentFixture<LabSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [LabSelectionComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule],
    providers: [
        ChorusauthService,
        { provide: MatDialogRef, useClass: MockDialogRef },
        {
            provide: MAT_DIALOG_DATA,
            useValue: { username: "", userEmial: "xxxyyy@esacinc.com" }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test addLab", () => {
    let lab: ChorusLab = {
      id: 1,
      contactEmail: "xx@esacinc.com",
      institutionUrl: "www",
      name: "nih",
      uploadLimitInGb: 1
    };
    component.addLab(lab);
    expect(component.selectedLabs.length).toBe(1);
  });

  it("test registerUser", () => {
    let lab: ChorusLab = {
      id: 1,
      contactEmail: "xx@esacinc.com",
      institutionUrl: "www",
      name: "nih",
      uploadLimitInGb: 1
    };
    component.selectedLabs.push(lab);
    let service = TestBed.get(ChorusauthService);
    let spy = spyOn(service, "createUser");
    component.registerUser();
    expect(spy).toHaveBeenCalled();
  });

  it("test close", () => {
    let ref = TestBed.get(MatDialogRef);
    spyOn(ref, "close");
    component.close("");
    expect(ref.close).toHaveBeenCalled();
  });
});
