import { MatDialogRef,MAT_DIALOG_DATA } from "@angular/material/dialog";
import { OverlayWindowService } from "./../../overlay-window/overlay-window.service";
import { PDCUserService } from "./../../pdcuser.service";
import { AuthService } from "angular-6-social-login";
import { ChorusauthService } from "./../../chorusauth.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MatFormFieldModule } from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

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

class MockOverlayWindowService {}

describe("ResetPasswordComponent", () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async(() => {
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
        { provide: AuthService, useClass: MockAuthService },
        { provide: PDCUserService, useClass: MockPDCUserService },
        { provide: OverlayWindowService, useClass: MockOverlayWindowService },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
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
