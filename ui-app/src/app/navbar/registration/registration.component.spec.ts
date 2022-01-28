import { of } from 'rxjs';
import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { PDCUserService } from "./../../pdcuser.service";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "angular-6-social-login";
import { ChorusauthService } from "./../../chorusauth.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material';

import { RegistrationComponent } from "./registration.component";
import { MatRadioModule, MatFormFieldModule } from "@angular/material";

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

  beforeEach(async(() => {
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
        { provide: AuthService, useClass: MockAuthService },
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
