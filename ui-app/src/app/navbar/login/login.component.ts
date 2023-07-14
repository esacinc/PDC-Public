import { PDCUserService } from './../../pdcuser.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material';
import { AuthService, GoogleLoginProvider } from 'angular-6-social-login';
import { ChorusauthService } from '../../chorusauth.service';
import { LabSelectionComponent } from '../lab-selection/lab-selection.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RegistrationComponent} from '../registration/registration.component';
import { ConfirmationDialogComponent } from "./../../dialog/confirmation-dialog/confirmation-dialog.component";
import { MessageDialogComponent } from "./../../dialog/message-dialog/message-dialog.component";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})

//@@@PDC-824 - Update login window and registration page to allow login with just email address and password
//@@@PDC-919 - Lock user account after 6 unsuccessful login attempts
//@@@PDC-928 - implement remember me and forgot password
//@@@PDC-1406: review and update messages that user can get during registration/login/account update
//@@@PDC-1487: resolve issues found with user registration/login
//@@@PDC-1855: Change dialog message for new users trying to register.

export class LoginComponent implements OnInit {
  username = "";
  userEmail = "";
  systemErrorMessage = "";
  isValidFormSubmitted: boolean = true;
  //rememberMeCheckbox = false;

  loginForm = new FormGroup({
		  email: new FormControl('', [Validators.required, Validators.email]),
		  userPass: new FormControl(''),
		  rememberMeCheckbox: new FormControl('')
		  //searchType: new FormControl('', Validators.required),
   });

  constructor(
    private chorusService: ChorusauthService,
    private socialAuthService: AuthService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    private userService: PDCUserService,
    private router: Router,
	private activeRoute: ActivatedRoute,
  ) {
	  var savedUsername = localStorage.getItem('username');
	  //If username was previously saved initialize email input field with it
	  if (savedUsername && savedUsername != '') {
		  this.loginForm.controls['email'].setValue(savedUsername);
		  this.loginForm.controls['rememberMeCheckbox'].setValue(true);
	  }
  }

  ngOnInit() {
  }

  get email(){
	  return this.loginForm.get('email');
  }

  get userPass(){
	  return this.loginForm.get('userPass');
  }

  get rememberMeCheckbox() {
	  return this.loginForm.get('rememberMeCheckbox');
  }

  //NIH/eRA login
  public eRAnihSignIn(uid: string, token: string){
    this.systemErrorMessage='';
	  this.userService.checkPDCUser(uid, token).subscribe(registered => {
		  console.log("Registered: " + registered);
		switch (registered) {
			//user registered
			case 0:
				//'' route url will be welcome page to login. 'pdc' route url will be home page
				if(localStorage.getItem('controlledFileExportFlag') === 'true'){
					localStorage.removeItem('controlledFileExportFlag');
					document.location.href = environment.dcf_fence_login_url.replace("%dcf_client_id%",environment.dcf_client_id);
					this.router.navigate(['browse']);
				}else{
					this.router.navigate(['pdc']);
				}
				break;
			//user not registered
			case 1:
				//@@@PDC-1182: New user login not going to registration page
				this.router.navigate(['pdc']);
  				if (this.userService.getEmail()) {
					this.userService.setUserIDType("NIH");
				} else {
					this.userService.setUserIDType("eRA");
				}
				const dialogConfig = new MatDialogConfig();
				dialogConfig.width = "55%";
				dialogConfig.minWidth = 980;
				dialogConfig.height = '80%';
				this.dialog.open(RegistrationComponent, dialogConfig);
				break;
			//system error
			case 2:
				this.systemErrorMessage="System Error. Please contact your system admin";
				console.log("System error!!!");
				break;
		}
		});
  }

  // Authenticate the user with Google
  // @@@PDC-881 close login dialog and open registration dialog if user needs to register
  public socialSignIn(socialPlatform: string) {
    const socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;

    this.socialAuthService.signIn(socialPlatformProvider).then(userData => {
      // Now that they are logged in check to see if they are already setup in Chorus
      this.userService.checkPDCUserByEmail(userData.email, "Google").then(exists => {
		  //console.log(userData);
        switch (exists) {
          //user exists
          case 0:
            //'' route url will be welcome page to login. 'pdc' route url will be home page
            //this.router.navigate([this.router.url]);
            this.dialogRef.close("login successfully");
            break;
          //user does not exist
          case 1:
            //console.log(userData);
            this.userService.setUserIDType("Google");
            this.userService.setLoginUsername(userData.email);
            this.userService.setEmail(userData.email);
            this.userService.setName(userData.name);
            //this.router.navigate(["registration"]);
            this.dialogRef.close("new user register");
            break;
          //system error
          case 2:
            this.systemErrorMessage = "System Error. Please contact your system admin";
            console.log("System error!!!");
            break;
		  case 5:
			//this.systemErrorMessage = "User Cancelled their account";
			//@@@PDC-6917 get helpdesk_email from env
			this.systemErrorMessage = "User deactivated their account. To reactivate account please contact site administrators by email "+environment.helpdesk_email+".";
			//this.userService.setLoginUsername(username);
            //this.userService.setEmail(username);
            //this.router.navigate(["registration"]);
			this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "170px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: this.systemErrorMessage}
			});
            this.dialogRef.close("User cancelled their account");
			break;
        }
		console.log("Error message: " + this.systemErrorMessage);
      });
    });

  }

  // @@@PDC-881 close login dialog and open registration dialog if user needs to register
  public emailLogin(){
	let username = this.loginForm.get('email').value;
	let userPass = this.loginForm.get('userPass').value;
	/*if (username == '') {
		this.systemErrorMessage = "Username is empty, please provide one";
		return;
	}*/
	this.systemErrorMessage='';
	  if (this.loginForm.invalid){
		  this.isValidFormSubmitted  = false;
		  this.systemErrorMessage = "Email is missing or incorrect"
		  //console.log(this.registrationForm);
		  return;
	  }
	this.isValidFormSubmitted = true;
	this.userService.checkPDCUserByEmail(username, "PDC", userPass).then(exists => {
		console.log("Exists: " + exists);
        switch (exists) {
          //user exists
          case 0:
            //'' route url will be welcome page to login. 'pdc' route url will be home page
            //this.router.navigate([this.router.url]);
			this.systemErrorMessage = '';
            this.dialogRef.close("login successfully");
            break;
          //user does not exist
          case 1:
            //console.log(userData);
			this.systemErrorMessage = '';
            this.userService.setUserIDType("PDC");
            this.userService.setLoginUsername(username);
            this.userService.setEmail(username);
            //this.router.navigate(["registration"]);
            this.dialogRef.close("user register with email");
            break;
          //system error
          case 2:
            this.systemErrorMessage = "Invalid Username or Password";
            console.log("Invalid Username or Password");
            break;
		  case 3:
			this.systemErrorMessage = "User have not confirmed their email yet";
			//alert("User have not confirmed their email yet");
			console.log("User have not confirmed email yet");
			this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "140px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: "User have not confirmed their email yet" }
			});
			console.log("An email with instructions to reset password was sent");
			this.dialogRef.close('Change password button');
			this.dialogRef.close("User have not confirmed email yet");
			break;
		  case 4:
			this.systemErrorMessage = "Wrong password!";
			var attempts = 6 - this.userService.getLoginAttempts();
			let message = "";
			if (attempts > 0 ){
				//alert("You entered wrong password. Your account will be blocked after " + attempts + " attempts");
				message = "You entered wrong password. Your account will be blocked after " + attempts + " attempts";
			} else {
				//alert("You entered wrong password too many times. Your account will be blocked");
				message = "You entered wrong password too many times. Your account will be blocked";
			}
			this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "140px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: message}
			});
			console.log("Wrong password, " + attempts + " login attempts remaining");
			break;
		  case 5:
			this.systemErrorMessage = "User deactivated their account. To reactivate account please contact site administrators by email "+environment.helpdesk_email+".";
			//this.userService.setLoginUsername(username);
            //this.userService.setEmail(username);
            //this.router.navigate(["registration"]);
			this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "170px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: this.systemErrorMessage}
			});
            this.dialogRef.close("User deactivated their account");
			break;
		  case 7:
			this.systemErrorMessage = "User " + username + " is blocked due to too many unsuccessful logins. Please contact website administrator by email "+environment.helpdesk_email+" to unlock the account.";
			console.log("User was blocked due to too many unsuccessful logins.");
			//alert("User " + username + " is blocked due to too many unsuccessful logins. Please contact website administrator by email '+environment.helpdesk_email+' to unlock the account.");
			this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "170px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: this.systemErrorMessage}
			});
			break;
        }
      });
  }

  public registerWithEmail(){
	  this.userService.setUserIDType("PDC");
	  this.userService.setEmail("");
	  //console.log(this.dialogRef);
	  //this.router.navigate(["registration"]);
	  this.dialogRef.close("new user register");
  }

  // Sign the user out of Google
  public socialSignOut(socialPlatform: string) {
    this.socialAuthService.signOut().then(userData => {
      // Now clear the user data
      this.username = "";
      this.userEmail = "";
    });
  }

  // Sign the user in using their eRA Commons login
  public nihSignIn() {
    document.location.href = window.location.origin + "/pdc/sp/authnih";
  }

  //PDC-928 Remember user's email if checkbox is clicked
  public rememberUserName(){
	  if (!this.rememberMeCheckbox.value){
		localStorage.setItem('username', this.loginForm.get('email').value);
	  } else {
		localStorage.removeItem('username');
	  }
  }
  //PDC-928 implement forgot password
  public forgotPassword(){
	  console.log(this.loginForm.controls['email']);
	  if (this.loginForm.controls['email'].valid){
		  this.userService.userForgotPassword(this.loginForm.controls['email'].value).subscribe(emailSent => {
			if (emailSent){
				this.systemErrorMessage = "An email with instructions to reset password was sent";
				//alert("Check your email for further instrutions");
				console.log("An email with instructions to reset password was sent");
				this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "120px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: this.systemErrorMessage}
			});
				this.dialogRef.close("An email with instructions to reset password was sent");
			} else {
				this.systemErrorMessage = "User with such email does not exist";
				//alert("User with such email does not exist");
				this.dialog.open(MessageDialogComponent, {
				width: "400px",
				height: "120px",
				disableClose: true,
				autoFocus: false,
				hasBackdrop: true,
				data: { message: this.systemErrorMessage}
			});
				console.log("User with such email " + this.loginForm.controls['email'].value + " does not exist");
			}
		  });
	  } else {
		  this.systemErrorMessage = "Enter a valid email and then click 'Forgot Password'";
		  console.log("Entered email is invalid");
	  }
  }

  private openLabSelection() {
    // Open the dialog to let them select labs to register with
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.hasBackdrop = true;
    dialogConfig.width = "500px";
    dialogConfig.height = "700px";
    dialogConfig.data = { username: this.username, userEmail: this.userEmail };

    const dialogRef = this.dialog.open(LabSelectionComponent, dialogConfig);
  }
}
