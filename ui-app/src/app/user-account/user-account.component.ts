import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService, GoogleLoginProvider } from 'angular-6-social-login';
import { ChorusauthService } from '../chorusauth.service';
import { PDCUserService } from '../pdcuser.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['../../assets/css/global.css', './user-account.component.scss']
})

//@@@PDC-701 
//This component is responsible for updating or canceling user account
export class UserAccountComponent implements OnInit {

  selectedResearcherType:string = ""; //This variable will hold researcher type selected by user
  otherResearcherType:string = ""; //If the user selects "other" researcher type, this variable will hold additional text for other
  isValidFormSubmitted = null;
  formInvalidMessage:string = '';
  
  // This structure is needed for defining field validatoin rules
  registrationForm = new FormGroup({
		  first_name: new FormControl('', Validators.required),
		  last_name: new FormControl('', Validators.required),
		  email: new FormControl('', [Validators.required, Validators.email]),
		  organization: new FormControl('', Validators.required),
		  searchType: new FormControl('', Validators.required),
		  user_pass: new FormControl('', [Validators.minLength(8), Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).+')]),
	  });
  //, Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+')
  constructor(private chorusService: ChorusauthService, private socialAuthService: AuthService, 
				private router: Router, private userService: PDCUserService) {
	  let firstName = "";
	  let lastName = "";
	  console.log(this.userService.getUserName());
	  let id_provider = this.userService.getUserIDType();
	  console.log(id_provider);
	  //User name might be available from either google or NIH/eRA login
	  if (this.userService.getUserName() !=  ""){
		  let username = this.userService.getUserName().split(" ");
		  firstName = username[0];
		  if (username.length > 1) {
			lastName = username[1];
		  }
	  }			
	  console.log(this.userService.getUserType());
	  let user_type = "";
	  switch (this.userService.getUserType()){
		case "bench":
		case "proteomics":
		case "bioinformatician":
			user_type = this.userService.getUserType();
			this.selectedResearcherType = this.userService.getUserType();
			break;
		default: 
			user_type = "other";
			this.selectedResearcherType = "other";
			this.otherResearcherType = this.userService.getUserType();
	  }
	  this.registrationForm.setValue({
		  first_name: firstName,
		  last_name: lastName,
		  email: this.userService.getEmail(),
		  organization: this.userService.getOrganization(),
		  searchType: user_type,
		  user_pass: ''
	  });
  }
  
  get first_name(){
	  return this.registrationForm.get('first_name');
  }
  get last_name(){
	  return this.registrationForm.get('last_name');
  }
  get email(){
	  return this.registrationForm.get('email');
  }
  get organization(){
	  return this.registrationForm.get('organization');
  }
  get searchType(){
	  return this.registrationForm.get('searchType');
  }
  
  get user_pass() {
	  return this.registrationForm.get('user_pass');
  }
  
	//Callback function for form submission, checks whether the form is valid and creates new user
  //@@@PDC-784 Improve download controlled files feature
  submitUpdate(){
	  this.formInvalidMessage='';
	  if (this.registrationForm.invalid){
		  this.isValidFormSubmitted  = false;
		  this.formInvalidMessage = "Some required fields are missing."
		  console.log(this.registrationForm);
		  return;
	  }
	  this.isValidFormSubmitted  = true;
	  console.log(this.registrationForm.value);
	  let researcherType = this.selectedResearcherType
	  //Save what the user wrote in text field for "other" researcher type option
	  if (this.otherResearcherType != "" && this.selectedResearcherType == "other"){
		  researcherType = this.otherResearcherType;
	  }
	  console.log(researcherType);
	  let id_provider = this.userService.getUserIDType();
	  console.log(id_provider);
	  console.log("Updating user data with email " + this.registrationForm.value.email);
	  this.userService.updateUserData(this.registrationForm.value.first_name, this.registrationForm.value.last_name, 
												this.registrationForm.get('email').value, researcherType, id_provider, 
												this.registrationForm.get('organization').value).subscribe(isUpdated => {
		//User was successfully registered with PDC and now will redirect to main dashboard page											
		if (isUpdated){
			//'' route url will be welcome page to login. 'pdc' route url will be home page
			this.userService.setName(this.registrationForm.value.first_name + " " + this.registrationForm.value.last_name);
			this.userService.setEmail(this.registrationForm.get('email').value);
			this.userService.setOrganization(this.registrationForm.get('organization').value);
			this.userService.setUserType(researcherType);
			this.router.navigate(['pdc']);
		} else {
			//Something went wrong with the registration
			console.log("Registration failed!");
		}  
	  });
  }
  
  cancelUserAccount(){
	  this.userService.cancelUser(this.userService.getUserName(), this.userService.getEmail(), "Tester", 
						this.userService.getUserIDType(),  this.userService.getOrganization()).subscribe( success => {
		  if (success){
			  console.log("User successfully canceled their account");

			  this.router.navigate(['pdc']);	
		  }
		  else {
			  console.log("Failed to cancel account");
		  }
	  });
  }
  
  ngOnInit() {
  }

}
