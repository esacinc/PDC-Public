import { of } from 'rxjs';
import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { PDCUserService } from "./../../pdcuser.service";
import { RouterTestingModule } from "@angular/router/testing";
import { SocialAuthService } from "angularx-social-login";
import { ChorusauthService } from "./../../chorusauth.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { RegistrationComponent } from "./registration.component";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";

import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module, ReCaptchaV3Service
} from 'ng-recaptcha';

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

class MockReCaptchaV3Service {}

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
        { provide: SocialAuthService, useClass: MockAuthService },
        { provide: PDCUserService, useClass: MockPDCUserService },
        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MatDialog, useClass: MockDialog },
        { provide: ReCaptchaV3Service, useClass: MockReCaptchaV3Service },
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
