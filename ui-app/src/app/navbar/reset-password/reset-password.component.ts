import {MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {Inject} from '@angular/core';
import {Component, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {SocialAuthService, GoogleLoginProvider} from 'angularx-social-login';
import {Md5} from 'ts-md5/dist/md5';
import {PDCUserService} from '../../pdcuser.service';
import {environment} from '../../../environments/environment';
import {MessageDialogComponent} from './../../dialog/message-dialog/message-dialog.component';
import {OverlayWindowService} from '../../overlay-window/overlay-window.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

//@@@PDC-966: implement reset password part of forgot password feature
//@@@PDC-1406: review and update messages that user can get during registration/login/account update
//@@@PDC-1487: resolve issues found with user registration/login
export class ResetPasswordComponent implements OnInit {
  isValidFormSubmitted = null;
  formInvalidMessage: string = '';
  passwordInvalidMessage = '';
  idProvider = '';
  uid = '';

  // This structure is needed for defining field validatoin rules
  resetPasswordForm: UntypedFormGroup;

  //, Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+')
  constructor(private socialAuthService: SocialAuthService,
              private router: Router,
              private userService: PDCUserService,
              private overlayWindow: OverlayWindowService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<ResetPasswordComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    this.uid = data.uuid;
    //console.log(this.uid);
    this.resetPasswordForm = new UntypedFormGroup({
      user_pass: new UntypedFormControl('', [Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*\_\+\=\?\,\:\;\<\>\/\~\\\-]).+/)]),
      confirm_password: new UntypedFormControl('', [Validators.required])
    });
    this.resetPasswordForm.setValue({
      user_pass: '',
      confirm_password: '',
    });
  }

  get user_pass() {
    return this.resetPasswordForm.get('user_pass');
  }

  get confirm_password() {
    return this.resetPasswordForm.get('confirm_password');
  }

  //Callback function for form submission, checks whether the form is valid and resets password
  submitNewPassword() {
    this.formInvalidMessage = '';
    if (this.resetPasswordForm.invalid) {
      this.isValidFormSubmitted = false;
      this.formInvalidMessage = 'Some required fields are missing.';
      return;
    }
    this.isValidFormSubmitted = true;
    let secure_pass = Md5.hashAsciiStr(this.resetPasswordForm.get('user_pass').value) as string;
    this.userService.updatePassword(this.uid, secure_pass).subscribe(isSuccess => {
      //User successfully changed password
      console.log(isSuccess);
      var message = '';
      if (isSuccess) {
        this.dialogRef.close('Password updated');
        message = 'User updated password successfully and may now login with their new password.';

        console.log('User updated password successfully.');
        //this.router.navigate(["pdc"]);
      } else {
        //Something went wrong
        console.log('Password reset failed!');
        message = 'Password reset was not successful. Your password reset link has expired!';
        this.dialogRef.close('Password reset failed');
      }
      if (message != '') {
        this.dialog.open(MessageDialogComponent, {
          width: '430px',
          height: '150px',
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: {message: message}
        });
      }
    });
  }

  private _validate(value: string): string {
    let options = value;
    this.passwordInvalidMessage = 'Invalid';
    return options;
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

  ngOnInit() {
    this.user_pass.valueChanges.subscribe(value => {
      if (this.resetPasswordForm.value.user_pass.length < 8 && this.resetPasswordForm.value.user_pass.length > 2) {
        this.passwordInvalidMessage = 'The password does not meet the password policy requirements. Check the minimum password length and required symbols.';
      }
      this.resetPasswordForm.updateValueAndValidity();
    });
    this.confirm_password.valueChanges.subscribe(value => {
      if ((this.confirm_password.value.length > 0) && (this.confirm_password.value != this.resetPasswordForm.get('user_pass').value)) {
        this.passwordInvalidMessage = 'Passwords do not match!';
        this.resetPasswordForm.get('confirm_password').setErrors({isError: true});
      } else {
        this.passwordInvalidMessage = '';
        this.resetPasswordForm.get('confirm_password').setErrors(null);
      }
      this.resetPasswordForm.updateValueAndValidity();
    });
  }

  onCancelClick(): void {
    this.dialogRef.close('cancel button');
  }
}
