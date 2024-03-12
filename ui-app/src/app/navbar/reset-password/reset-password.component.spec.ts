import { of } from 'rxjs';
import { MatLegacyDialogRef as MatDialogRef,MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { PDCUserService } from "./../../pdcuser.service";
import { SocialAuthService } from "angularx-social-login";
import { ChorusauthService } from "./../../chorusauth.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ResetPasswordComponent } from "./reset-password.component";

class MockChorusauthService {}

class MockAuthService {}

class MockPDCUserService {
  getUserName(): string {
    return "xxx yyy";
  }

  getUserIDType(): string {
    return "google";
  }

  getEmail(): string {
    return "xxxyyyy@esacinc.com";
  }
}
class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}


class MockOverlayWindowService {}

describe("ResetPasswordComponent", () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ChorusauthService, useClass: MockChorusauthService },
        { provide: SocialAuthService, useClass: MockAuthService },
        { provide: PDCUserService, useClass: MockPDCUserService },
        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        { provide: MatDialog, useClass: MockDialog },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
