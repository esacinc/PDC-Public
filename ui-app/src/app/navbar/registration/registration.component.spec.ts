import { of } from 'rxjs';
import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { PDCUserService } from "./../../pdcuser.service";
import { RouterTestingModule } from "@angular/router/testing";

import { ChorusauthService } from "./../../chorusauth.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { RegistrationComponent } from "./registration.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

class MockChorusauthService {}

class MockAuthService {}

class MockPDCUserService {

  getUserName():string{
    return 'xxx yyy';
  }

  getUserIDType(): string{
    return 'google';
  }

  getEmail(): string{
    return 'xxxyyyy@esacinc.com'
  }

}

class MockOverlayWindowService {}

describe("RegistrationComponent", () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationComponent],
      imports: [
        MatRadioModule,
        MatFormFieldModule,
        FormsModule,
        MatRadioModule,
        ReactiveFormsModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        RecaptchaV3Module,
        RouterTestingModule
      ],
      providers: [
        { provide: ChorusauthService, useClass: MockChorusauthService },

        { provide: PDCUserService, useClass: MockPDCUserService },
        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MatDialog, useClass: MockDialog },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
