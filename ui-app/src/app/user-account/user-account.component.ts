import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService, GoogleLoginProvider} from 'angular-6-social-login';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Inject} from '@angular/core';
import {ConfirmationDialogComponent} from './../dialog/confirmation-dialog/confirmation-dialog.component';
import {MessageDialogComponent} from './../dialog/message-dialog/message-dialog.component';
import {ChorusauthService} from '../chorusauth.service';
import {PDCUserService} from '../pdcuser.service';
import {environment} from '../../environments/environment';
import {OverlayWindowService} from '../overlay-window/overlay-window.service';
import {InputDialogComponent} from '../dialog/input-dialog/input-dialog.component';

@Component({
  selector: 'user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['../../assets/css/global.css', './user-account.component.scss']
})

//@@@PDC-701
//This component is responsible for updating or canceling user account
//@@@PDC-1197: PDC Users need to be able to change their password
//@@@PDC-1402 show change password option only to users of type PDC
//@@@PDC-1403 add tab for user account management to hold "Change password" and "Cancel account" options
//@@@PDC-1404 add confirmation step to account cancellation
//@@@PDC-1469 make user account page to be an overlay window
//@@@PDC-1446 only users of type PDC may change their user name and email
//@@@PDC-1406: review and update messages that user can get during registration/login/account update
//@@@PDC-1487: resolve issues found with user registration/login
//@@@PDC-1661: fixing user login/registration issues
export class UserAccountComponent implements OnInit {

  selectedResearcherType: string = ''; //This variable will hold researcher type selected by user
  otherResearcherType: string = ''; //If the user selects "other" researcher type, this variable will hold additional text for other
  isValidFormSubmitted = null;
  formInvalidMessage: string = '';
  systemErrorMessage = '';

  // This structure is needed for defining field validatoin rules
  registrationForm = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    login_username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    organization: new FormControl('', Validators.required),
    searchType: new FormControl('', Validators.required),
    user_pass: new FormControl('', [Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')]),
  });

  //, Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+')
  constructor(private chorusService: ChorusauthService, private socialAuthService: AuthService, private dialog: MatDialog,
              private router: Router, private userService: PDCUserService,
              private overlayWindow: OverlayWindowService, private dialogRef: MatDialogRef<UserAccountComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    let firstName = '';
    let lastName = '';

    console.log(this.userService.getUserName());
    let id_provider = this.userService.getUserIDType();
    console.log(id_provider);
    //User name might be available from either google or NIH/eRA login
    if (this.userService.getUserName() != '') {
      let username = this.userService.getUserName().split(' ');
      firstName = username[0];
      if (username.length > 1) {
        lastName = username[1];
      }
    }
    console.log(this.userService.getUserType());
    let user_type = '';
    switch (this.userService.getUserType()) {
      case 'bench':
      case 'proteomics':
      case 'bioinformatician':
        user_type = this.userService.getUserType();
        this.selectedResearcherType = this.userService.getUserType();
        break;
      default:
        user_type = 'other';
        this.selectedResearcherType = 'other';
        this.otherResearcherType = this.userService.getUserType();
    }
    this.registrationForm.setValue({
      first_name: firstName,
      last_name: lastName,
      login_username: this.userService.getLoginUsername(),
      email: this.userService.getEmail(),
      organization: this.userService.getOrganization(),
      searchType: user_type,
      user_pass: ''
    });
    //PDC-1446 if user type is not PDC they are not allowed to change their name or email
    // therefore disable these fields in the form
    if (!this.isUserTypePDC()) {
      this.registrationForm.controls['first_name'].disable();
      this.registrationForm.controls['last_name'].disable();
    }
    this.registrationForm.controls['login_username'].disable();
    //Disable email update for all types of users
    this.registrationForm.controls['email'].disable();
  }

  get first_name() {
    return this.registrationForm.get('first_name');
  }

  get last_name() {
    return this.registrationForm.get('last_name');
  }

  get login_username() {
    return this.registrationForm.get('login_username');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get organization() {
    return this.registrationForm.get('organization');
  }

  get searchType() {
    return this.registrationForm.get('searchType');
  }

  get user_pass() {
    return this.registrationForm.get('user_pass');
  }

  //PDC-1402 Show change password option only to users of type PDC
  isUserTypePDC(): boolean {
    return this.userService.getUserIDType() == 'PDC';
  }

  //Callback function for form submission, checks whether the form is valid and creates new user
  //@@@PDC-784 Improve download controlled files feature
  submitUpdate() {
    this.formInvalidMessage = '';
    if (this.registrationForm.invalid) {
      this.isValidFormSubmitted = false;
      this.formInvalidMessage = 'Some required fields are missing.';
      //console.log(this.registrationForm);
      return;
    }
    this.isValidFormSubmitted = true;
    //console.log(this.registrationForm.value);
    let researcherType = this.selectedResearcherType;
    //Save what the user wrote in text field for "other" researcher type option
    if (this.otherResearcherType != '' && this.selectedResearcherType == 'other') {
      researcherType = this.otherResearcherType;
    }
    console.log(researcherType);
    let id_provider = this.userService.getUserIDType();
    console.log(id_provider);
    console.log('Updating user data with email ' + this.registrationForm.get('email').value + ' name: ' + this.registrationForm.get('first_name').value + ' ' + this.registrationForm.get('last_name').value);
    this.userService.updateUserData(this.registrationForm.get('first_name').value, this.registrationForm.get('last_name').value,
      this.registrationForm.get('email').value, researcherType, id_provider,
      this.registrationForm.get('organization').value).subscribe(isUpdated => {
      //User was successfully registered with PDC and now will redirect to main dashboard page
      if (isUpdated) {
        //'' route url will be welcome page to login. 'pdc' route url will be home page
        this.userService.setName(this.registrationForm.get('first_name').value + ' ' + this.registrationForm.get('last_name').value);
        this.userService.setEmail(this.registrationForm.get('email').value);
        this.userService.setOrganization(this.registrationForm.get('organization').value);
        this.userService.setUserType(researcherType);
        this.dialogRef.close('submit button');
      } else {
        //Something went wrong with the registration
        console.log('Registration failed!');
      }
    });
  }

  //PDC-1404 add confirmation step to account cancellation
  cancelUserAccount() {
    let confirmationMessage = `
			You are trying to deactivate your PDC user account.
			Do you want to continue?`;
    let continueCancelAccount = 'Yes';
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      height: '140px',
      data: {message: confirmationMessage, continueMessage: continueCancelAccount}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Yes') {
        this.userService.cancelUser(this.userService.getUserName(), this.userService.getEmail(), this.userService.getUserType(),
          this.userService.getUserIDType(), this.userService.getOrganization()).subscribe(success => {
          if (success) {
            console.log('User successfully deactivated their account');

            this.dialogRef.close('cancel account button');
          } else {
            console.log('Failed to cancel account');
          }
        });
      }
    });
  }

  ngOnInit() {
  }

//@@@PDC-1197: PDC Users need to be able to change their password
//@@@PDC-928 implement forgot password
  public resetPassword() {
    //console.log(this.registrationForm.get('email').value);
    this.userService.userForgotPassword(this.registrationForm.get('email').value).subscribe(emailSent => {
      if (emailSent) {
        this.systemErrorMessage = 'An email with instructions to reset password was sent.';
        //alert("Check your email for further instrutions");
        this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: '120px',
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: {message: 'Check your email for further instrutions'}
        });
        console.log('An email with instructions to reset password was sent');
        this.dialogRef.close('Change password button');
      } else {
        this.systemErrorMessage = 'User does not exist.';
        //alert("User with such email does not exist.");
        this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: '120px',
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: {message: 'PDC user account with such email does not exist.'}
        });
        console.log('User with such email ' + this.registrationForm.get('email').value + ' does not exist');
      }
    });
  }

  public convertToPDC() {
    //console.log(this.registrationForm.get('email').value);
    this.userService.convertToPDC(this.registrationForm.get('email').value).subscribe(emailSent => {
      if (emailSent) {
        this.systemErrorMessage = 'An email with instructions to reset password was sent.';
        //alert("Check your email for further instrutions");
        this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: '120px',
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: {message: 'Check your email for further instructions'}
        });
        console.log('An email with instructions to reset password was sent');
        this.dialogRef.close('Change password button');
      } else {
        this.systemErrorMessage = 'User does not exist.';
        //alert("User with such email does not exist.");
        this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: '120px',
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: {message: 'Google user account with such email does not exist.'}
        });
        console.log('User with such email ' + this.registrationForm.get('email').value + ' does not exist');
      }
    });
  }

  //@@@PDC-4766 Email migration utility for Workspace
  public changeEmail() {
    const confirmationMessage = `
			You are trying to change your contact email,
			your login username is still the same.
			Do you want to continue?`;
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '350px',
      height: '250px',
      data: { message: confirmationMessage, input: this.userService.getEmail() }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.userService.updateUserEmail(result).subscribe(isUpdated => {
        if (isUpdated) {
          this.userService.setEmail(result);
          this.registrationForm.setValue({ email: result });
        } else {
          //Something went wrong with changing email
          console.log('Failed to update email');
        }
      });
    });
  }

  onCancelClick(): void {
    this.dialogRef.close('cancel button');
  }

}
