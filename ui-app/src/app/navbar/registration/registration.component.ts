import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService, GoogleLoginProvider } from "angular-6-social-login";
import { Md5 } from "ts-md5/dist/md5";
import { ChorusauthService } from "../../chorusauth.service";
import { PDCUserService } from "../../pdcuser.service";
import { environment } from "../../../environments/environment";
import { OverlayWindowService } from "../../overlay-window/overlay-window.service";

@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"]
})
// @@@PDC-881 registration dialog
//@@@PDC-885: registration form for google users did not validate properly
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
    private dialogRef: MatDialogRef<RegistrationComponent>
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
			user_pass: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')]),
		});
		this.registrationForm.setValue({
			first_name: firstName,
			last_name: lastName,
			email: this.userService.getEmail(),
			organization: '',
			searchType: '',
			user_pass: ''
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

  //Callback function for form submission, checks whether the form is valid and creates new user
  //@@@PDC-784 Improve download controlled files feature
  submitRegistration() {
    this.formInvalidMessage = "";
    if (this.registrationForm.invalid) {
      this.isValidFormSubmitted = false;
      this.formInvalidMessage = "Some required fields are missing.";
      console.log(this.registrationForm);
      return;
    }
    this.isValidFormSubmitted = true;
    console.log(this.registrationForm.value);
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
              document.location.href = environment.dcf_fence_login_url;
              this.router.navigate(["browse"]);
            } else {
              this.router.navigate(["pdc"]);
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
	  if (this.idProvider === "PDC") {
		secure_pass = Md5.hashAsciiStr(this.registrationForm.get('user_pass').value) as string;
	  }
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
              alert("Thank you for registering with PDC. You will receive a message to confirm your registration at the email address provided. Once confirmed, you should be able to login with your email id password.");
              console.log(
                "Thank you for registering with PDC. You will receive a message to confirm your registration at the email address provided. Once confirmed, you should be able to login with your email id password."
              );
              this.router.navigate(["pdc"]);
            } else {
              //'' route url will be welcome page to login. 'pdc' route url will be home page
              this.router.navigate(["pdc"]);
            }
          } else {
            //Something went wrong with the registration
            console.log("Registration failed!");
          }
        });
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
    console.log(this.registrationForm);
    if (this.idProvider === "PDC") {
		this.user_pass.valueChanges.subscribe(value => {
			if (this.registrationForm.value.user_pass.length < 8 && this.registrationForm.value.user_pass.length > 2){
				this.passwordInvalidMessage = "You chose invalid password, please try again";
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
