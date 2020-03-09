import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService, GoogleLoginProvider } from "angular-6-social-login";
import { Md5 } from "ts-md5/dist/md5";
import { ChorusauthService } from "../../chorusauth.service";
import { PDCUserService } from "../../pdcuser.service";
import { environment } from "../../../environments/environment";
import { ConfirmationDialogComponent } from "./../../dialog/confirmation-dialog/confirmation-dialog.component";
import { MessageDialogComponent } from "./../../dialog/message-dialog/message-dialog.component";
import { OverlayWindowService } from "../../overlay-window/overlay-window.service";

@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"]
})
// @@@PDC-881 registration dialog
//@@@PDC-885: registration form for google users did not validate properly
//@@@PDC-1406: review and update messages that user can get during registration/login/account update 
//@@@PDC-1487: resolve issues found with user registration/login
export class RegistrationComponent implements OnInit {
  selectedResearcherType: string = ""; //This variable will hold researcher type selected by user
  otherResearcherType: string = ""; //If the user selects "other" researcher type, this variable will hold additional text for other
  isValidFormSubmitted = null;
  formInvalidMessage: string = "";
  passwordInvalidMessage = "";
  idProvider = "";

  // This structure is needed for defining field validatoin rules
  registrationForm : FormGroup;

  //, Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+')
  constructor(
    private chorusService: ChorusauthService,
    private socialAuthService: AuthService,
    private router: Router,
    private userService: PDCUserService,
    private overlayWindow: OverlayWindowService,
	private dialogRef: MatDialogRef<RegistrationComponent>,
    private dialog: MatDialog,
  ) {
    let firstName = "";
    let lastName = "";
    console.log(this.userService.getUserName());
    this.idProvider = this.userService.getUserIDType();
    console.log(this.idProvider);
    //User name might be available from either google or NIH/eRA login
    if (this.userService.getUserName() != "") {
      let username = this.userService.getUserName().split(" ");
      firstName = username[0];
      if (username.length > 1) {
        lastName = username[1];
      }
    }
	//PDC-885 - If user registers via PDC they need to have a password field which should be included in form validation
	if (this.idProvider === "PDC") {
		this.registrationForm= new FormGroup({
			first_name: new FormControl('', Validators.required),
			last_name: new FormControl('', Validators.required),
			email: new FormControl('', [Validators.required, Validators.email]),
			organization: new FormControl('', Validators.required),
			searchType: new FormControl('', Validators.required),
			user_pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*\_\-\+\=\?\,\:\;\<\>\/\~\\]).+/)]),
			confirm_password: new FormControl('', Validators.required),
		});
		this.registrationForm.setValue({
			first_name: firstName,
			last_name: lastName,
			email: this.userService.getEmail(),
			organization: '',
			searchType: '',
			user_pass: '',
			confirm_password: '',
		});
	  //In any other case the form should not include password field.
	} else {
		this.registrationForm= new FormGroup({
			first_name: new FormControl('', Validators.required),
			last_name: new FormControl('', Validators.required),
			email: new FormControl({value: '', disabled: true}, [Validators.required, Validators.email]),
			organization: new FormControl('', Validators.required),
			searchType: new FormControl('', Validators.required),
		});
		this.registrationForm.setValue({
			first_name: firstName,
			last_name: lastName,
			email: this.userService.getEmail(),
			organization: '',
			searchType: '',
		});
	}
    //User email might be available from google login
    if (this.userService.getEmail() === "" || this.idProvider === "PDC") {
      this.registrationForm.get("email").enable();
    }
  }

  get first_name() {
    return this.registrationForm.get("first_name");
  }
  get last_name() {
    return this.registrationForm.get("last_name");
  }
  get email() {
    return this.registrationForm.get("email");
  }
  get organization() {
    return this.registrationForm.get("organization");
  }
  get searchType() {
    return this.registrationForm.get("searchType");
  }

  get user_pass() {
    return this.registrationForm.get("user_pass");
  }
  
  get confirm_password() {
    return this.registrationForm.get("confirm_password");
  }

  //Callback function for form submission, checks whether the form is valid and creates new user
  //@@@PDC-784 Improve download controlled files feature
  //this function makes two asynchronous calls that need to happen one after another
  async submitRegistration() {
    this.formInvalidMessage = "";
    if (this.registrationForm.invalid) {
      this.isValidFormSubmitted = false;
      this.formInvalidMessage = "Some required fields are missing.";
      //console.log(this.registrationForm);
      return;
    }
    this.isValidFormSubmitted = true;
    //console.log(this.registrationForm.value);
    let researcherType = this.selectedResearcherType;
    //Save what the user wrote in text field for "other" researcher type option
    if (this.otherResearcherType != "" && this.selectedResearcherType == "other") {
      researcherType = this.otherResearcherType;
    }
    console.log(researcherType);
    let id_provider = this.userService.getUserIDType();
    console.log(id_provider);
    //If id_provider for NIH/eRA login is set in the API, if this field is empty, user signed in with google account
    if (id_provider === "") {
      id_provider = "Google";
    }
    //If the user has UID they signed in via NIH/eRA login
    if (this.userService.getUID()) {
      console.log("Creating user with UID " + this.userService.getUID());
      //PDC-421 - adding username to send to pdcapi
      let username: string =
        this.registrationForm.value.first_name +
        " " +
        this.registrationForm.value.last_name;
      this.userService
        .createPDCUser(
          this.userService.getUID(),
          this.registrationForm.get("email").value,
          researcherType,
          id_provider,
          username,
          this.registrationForm.get("organization").value
        )
        .subscribe(isRegistered => {
          //User was successfully registered with PDC and now will be redirested to main dashboard
          if (isRegistered) {
            this.dialogRef.close('user registered');
            this.userService.setEmail(this.registrationForm.get("email").value); //make sure the current logged in user email is set
            //'' route url will be welcome page to login. 'pdc' route url will be home page
            if (localStorage.getItem("controlledFileExportFlag") === "true") {
              localStorage.removeItem("controlledFileExportFlag");
              document.location.href = environment.dcf_fence_login_url.replace("%dcf_client_id%",environment.dcf_client_id);
              this.router.navigate(["browse"]);
            } 
          } else {
            console.log("Registration failed!");
          }
        });
    }
    //If user does not have UID they signed in via google
    else {
      console.log("Creating user with email " + this.registrationForm.value.email);
      let secure_pass:string = '';
	  let continueRegistration = true;
	  if (this.idProvider === "PDC") {
		secure_pass = Md5.hashAsciiStr(this.registrationForm.get('user_pass').value) as string;
		this.userService.checkPDCUserByEmail(this.registrationForm.get("email").value, "PDC", this.registrationForm.get('user_pass').value).then(exists => {
			var message = "";
			switch (exists) {
				case 0:
					message = "User with this email and password already exists, you are now logged in.";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
				case 1:
					console.log("User with this email does not exist continue to registration.");
					continueRegistration = true;
					//this.dialogRef.close('user registered');
					break;
				case 3:
					message = "User with this email has already registered but have not confirmed their email yet. Please confirm your email by clicking confirmation link in the email you should have received when registered.";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
				case 4:
					message = "User with this email already exists, do you want to reset password?";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
				case 5:
					message = "User with this email disabled their account. If you want to enable your account again, please contact site administrators by email pdc-admin@esacinc.com.";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
				case 7:
					message = "User with this email tried to login more than 6 times with wrong password and was blocked. To unblock your account please contact site administrators by email pdc-admin@esacinc.com.";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
				default:
					message = "An error occured";
					continueRegistration = false;
					//this.dialogRef.close('user registered');
					break;
			}
			console.log(message);
			if (message != "") {
				this.dialog.open(MessageDialogComponent, {
					width: "500px",
					height: "180px",
					disableClose: true,
					autoFocus: false,
					hasBackdrop: true,
					data: { message: message }
				});
			}
			this.dialogRef.close('user registered');
			return;
		});	
	  }
	  //wait for the previous call to check whether the user with such email exists to finish and return response
	  await new Promise(resolve => setTimeout(resolve, 500));
	  if (continueRegistration) {
        this.userService
        .createPDCUserByEmail(
          this.registrationForm.value.first_name,
          this.registrationForm.value.last_name,
          this.registrationForm.get("email").value,
          researcherType,
          id_provider,
          this.registrationForm.get("organization").value,
          secure_pass
        )
        .subscribe(isRegistered => {
          //User was successfully registered with PDC and now will redirect to main dashboard page
          if (isRegistered) {
            this.dialogRef.close('user registered');
            if (
              this.userService.getUserIDType() === "PDC" &&
              this.userService.getIsRegistered() === 0
            ) {
				//alert("Thank you for registering with PDC. You will receive a message to confirm your registration at the email address provided. Once confirmed, you should be able to login with your email id password.");
				console.log(
                "Thank you for registering with PDC. You will receive a message to confirm your registration at the email address provided. Once confirmed, you should be able to login with your email id password."
				);
				let message = "Thank you for registering with PDC. You will receive a message to confirm your registration at the email address provided. Once confirmed, you should be able to login with your email and password.";
				this.dialog.open(MessageDialogComponent, {
					width: "400px",
					height: "200px",
					disableClose: true,
					autoFocus: false,
					hasBackdrop: true,
					data: { message: message }
				});
            } 
          } else {
            //Something went wrong with the registration
            console.log("Registration failed!");
          }
        });
	  }
    }
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
    //console.log(this.registrationForm);
    if (this.idProvider === "PDC") {
		this.user_pass.valueChanges.subscribe(value => {
			if (this.registrationForm.value.user_pass.length < 8 && this.registrationForm.value.user_pass.length > 2){
				this.passwordInvalidMessage = "The password does not meet the password policy requirements. Check the minimum password length and required symbols.";
			}
			// validators = [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')];
			this.registrationForm.updateValueAndValidity();
		});
		this.confirm_password.valueChanges.subscribe(value => {
			if ( (this.confirm_password.value.length > 0) && (this.confirm_password.value != this.registrationForm.get('user_pass').value) ){
				this.passwordInvalidMessage = "Passwords do not match!";
				this.registrationForm.get('confirm_password').setErrors({isError: true});
			} else {
				this.passwordInvalidMessage =  "";
				this.registrationForm.get('confirm_password').setErrors(null);
			}
			// validators = [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')];
			this.registrationForm.updateValueAndValidity();
		});
	}
  }

  onCancelClick(): void {
    this.dialogRef.close('cancel button');
  }
}
