import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService, GoogleLoginProvider } from "angular-6-social-login";
import { Md5 } from "ts-md5/dist/md5";
import { PDCUserService } from "../../pdcuser.service";
import { environment } from "../../../environments/environment";
import { OverlayWindowService } from "../../overlay-window/overlay-window.service";

@Component({
  selector: "app-password-reset",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"]
})

//@@@PDC-966: implement reset password part of forgot password feature
export class ResetPasswordComponent implements OnInit {
  isValidFormSubmitted = null;
  formInvalidMessage: string = "";
  passwordInvalidMessage = "";
  idProvider = "";
  uid = "";

  // This structure is needed for defining field validatoin rules
  resetPasswordForm : FormGroup;

  //, Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+')
  constructor( private socialAuthService: AuthService,
				private router: Router,
				private userService: PDCUserService,
				private overlayWindow: OverlayWindowService,
				private dialogRef: MatDialogRef<ResetPasswordComponent>,
				@Inject(MAT_DIALOG_DATA) data) {
	this.uid = data.uuid;
    console.log(this.uid);
    this.resetPasswordForm= new FormGroup({
			user_pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')]),
	});
	this.resetPasswordForm.setValue({
		user_pass: ''
	});
  }

  get user_pass() {
    return this.resetPasswordForm.get("user_pass");
  }

  //Callback function for form submission, checks whether the form is valid and resets password
  submitNewPassword() {
    this.formInvalidMessage = "";
    if (this.resetPasswordForm.invalid) {
      this.isValidFormSubmitted = false;
      this.formInvalidMessage = "Some required fields are missing.";
      console.log(this.resetPasswordForm);
      return;
    }
    this.isValidFormSubmitted = true;
    let secure_pass = Md5.hashAsciiStr(this.resetPasswordForm.get('user_pass').value) as string;
	this.userService.updatePassword(this.uid, secure_pass ).subscribe(isSuccess => {
          //User successfully changed password
		  console.log(isSuccess);
          if (isSuccess) {
            this.dialogRef.close('Password updated');
            alert("User updated password successfully and may now login with their new password.");
            console.log("User updated password successfully.");
            this.router.navigate(["pdc"]);
          } else {
            //Something went wrong 
            console.log("Password reset failed!");
          }
        });
  }

  private _validate(value: string): string {
    let options = value;
    this.passwordInvalidMessage = "Invalid";
    return options;
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open("PrivacyPolicyOverlayWindowComponent");
  }

  ngOnInit() {
    console.log(this.resetPasswordForm);
	this.user_pass.valueChanges.subscribe(value => {
			if (this.resetPasswordForm.value.user_pass.length < 8 && this.resetPasswordForm.value.user_pass.length > 2){
				this.passwordInvalidMessage = "The password does not meet the password policy requirements. Check the minimum password length and required symbols.";
			}
			this.resetPasswordForm.updateValueAndValidity();
		});
  }

  onCancelClick(): void {
    this.dialogRef.close('cancel button');
  }
}
