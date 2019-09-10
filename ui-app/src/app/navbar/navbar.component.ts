import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, ActivationEnd, Router, ActivatedRoute, ParamMap } from "@angular/router";
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Apollo } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CaseSummaryComponent } from '../browse/case-summary/case-summary.component';
import { StudySummaryComponent } from '../browse/study-summary/study-summary.component';
import { ChorusauthService } from '../chorusauth.service';
import { GeneProteinSummaryComponent } from '../gene-protein-summary/gene-protein-summary.component';
import { PDCUserService } from '../pdcuser.service';
import { AllCasesData, AllStudiesData } from '../types';
import { LabSelectionComponent } from './lab-selection/lab-selection.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent} from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SearchService } from './search.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss', '../../assets/css/global.css']//,
  //encapsulation: ViewEncapsulation.Native
})

//@@@PDC-357 - Search UI
//@@@PDC-385 - improve search bar
//@@@PDC-395 - log out button
//@@@PDC-417 - fix popup dialog size
//@@@PDC-438 - add protein entity to search
//@@@PDC-440 - add description for gene entity
//@@@PDC-408 - implement session timeout after 30 mins idle
//@@@PDC-465 - style search dropdown results
//@@@PDC-374 - adding url to overlay windows
//@@@PDC-860 - Create FAQs page 
//@@@PDC-873 - redirect user to PDC Portal main page after email confirmation
//@@@PDC-880 - allow open case details overlay window using URL (with auxiliary path)
//@@@PDC-966 - finish forgot password feature
//@@@PDC-995: Case view creates two pop-ups
export class NavbarComponent implements OnInit {
  background = '';
  searchFormControl = new FormControl();
  options: any[] = []; // will hold the display name and value of the search terms
  filteredOptions: Observable<string[]>;
  geneSearchResults;
  proteinSearchResults;
  studySearchResults;
  caseSearchResults;
  selectedSearchTerm:any;
  loading = false;
  userLoggedInFlag = false;
  loggedInUser = '';
  searchButtonFlag = true;
  loggedInEmail = '';
  navDisplayFlag = true;
  dictionary_url = environment.dictionary_base_url + 'dictionary.html';
  apidocumentation_url = environment.dictionary_base_url + 'apidocumentation.html';
  submission_portal_docs_url = environment.submission_portal_docs_url;
  userEmailConfirmed = false;

  private subscription: Subscription;

  constructor(iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, 
    private http: HttpClient,
    private chorusService: ChorusauthService, private dialog: MatDialog,
	private apollo: Apollo,
	private searchService : SearchService,
	private userService: PDCUserService,
	private router: Router,
	private idle: Idle,
	private route: ActivatedRoute,
	private loc: Location) {
		//this.userLoggedInFlag = this.userService.isPDCUserLoggedIn(); 
		this.options = [{name: '', value: ''}];
		iconRegistry.addSvgIcon(
			'search',
			this.sanitizer.bypassSecurityTrustResourceUrl('assets/css/images/baseline-search-24px.svg'));
		this.selectedSearchTerm = [{name: '', value: ''}];
  }

  getSubmissionPortalDocsURL() {
    return this.sanitizer.bypassSecurityTrustUrl(this.submission_portal_docs_url);
  }
   //Callback function that is called when the user clicks "search" icon to open the window with the search term summary
  openSearchTermSummary(test:any){
	  console.log(this.selectedSearchTerm);
	  this.searchButtonFlag = true;
	  if (this.selectedSearchTerm.name) {
		  let term = this.selectedSearchTerm.name.split(': ');
		  if (term[0] === 'GN'){
			  //Display value looks like this: GN: <gene name> (<gene description>)
			  //We need to extract only the gene name, that is why another split is needed
			  let gene_term = term[1].split(' (');
			  this.showGeneProteinSummary(gene_term[0]);
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'PT'){
			  this.showGeneProteinSummary(term[1]);
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'CA') {
			  this.showCaseSummary(term[1]);
			  this.searchButtonFlag = true;
		  }
		  if (term[0] === 'ST'){
			  this.showStudySummary(term[1]);
			  this.searchButtonFlag = true;
		  }
	  }
  }

  showGeneProteinSummary(gene_name: string){
	  
	//console.log("Gene name: " + gene_name);
	const dialogConfig = new MatDialogConfig();
	
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '70%';
	
    dialogConfig.data = {
        summaryData: gene_name
    };
	this.router.navigate([{outlets: {geneSummary: ['gene-summary', gene_name]}}]);
	const dialogRef = this.dialog.open(GeneProteinSummaryComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        val => console.log('Dialog output:', val)
    );

  }
  
  showCaseSummary(case_id: string){
	  console.log("Open Case summary for case id: " + case_id);
	  const dialogConfig = new MatDialogConfig();
	
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
	  dialogConfig.hasBackdrop = true;
	  //dialogConfig.minWidth = '1000px';
	  dialogConfig.width = '80%';
	  dialogConfig.height = '95%'
	  
	  //@@@PDC-462 show submitter ids
	  let case_data: AllCasesData = {
		aliquot_submitter_id: '',
		sample_submitter_id: '',
		case_id: '',
		case_submitter_id: case_id,
		project_name: '',
		program_name: '',
		sample_type: '',
		disease_type: '',
		primary_site: ''
	  }
	  dialogConfig.data = {
          summaryData: case_data,
	  }
	  this.router.navigate([{outlets: {caseSummary: ['case-summary', case_id]}}]);
	  const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        val => console.log('Dialog output:', val)
      );
  }
  
  private findStudySubmitterIdName(name: string):string{
	  //console.log("Name: " + name);
	  for (let study_search_res of this.studySearchResults){
		  if (study_search_res.name === name) {
			  return study_search_res.submitter_id_name;
		  }
	  }
	  return '';
  }
  
  showStudySummary(study_name: string){
	//console.log("Study name: " + study_name);
	let study_submitter_id_name = this.findStudySubmitterIdName(study_name);
	let study = study_name.split(' ');
	let study_id = study[study.length - 1];
	const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%';
	
	let study_data: AllStudiesData = {
		study_submitter_id: study_id,
		submitter_id_name: study_submitter_id_name,
		study_description: '',
		embargo_date: '',
		program_name: '',
		project_name: '',
		disease_type: '',
		primary_site: '',
		analytical_fraction: '',
		experiment_type: '',
		cases_count: 0,
		aliquots_count: 0,
		filesCount: []
    };
	dialogConfig.data = {
          summaryData: study_data,
	  }
	this.router.navigate([{outlets: {studySummary: ['study-summary', study_submitter_id_name]}}]);
	const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        val => console.log('Dialog output:', val)
    );
  }
  
  searchGeneTerms(search_term:string){
	this.loading = true;
	this.searchService.getGeneSearchResults(search_term).subscribe((data: any) =>{
		this.geneSearchResults = data.geneSearch.genes;
		for (let returnValue of this.geneSearchResults){
			let display_name = 'GN: ' + returnValue.name;
			//PDC-440 adding description to gene display value in dropdown list
			if (returnValue.description != ""){
				display_name = display_name.concat(" (" + returnValue.description + ")");
			}	
			this.options.push({name: display_name, value: returnValue.name });
		}
		this.loading = false;  
	});
  }
  
  //@@@PDC-438
  //@@@PDC-465
  searchProteinTerms(search_term:string){
	this.loading = true;
	this.searchService.getProteinSearchResults(search_term).subscribe((data: any) =>{
		this.proteinSearchResults = data.proteinSearch.genesWithProtein;
		for (let returnValue of this.proteinSearchResults){
			let display_name = 'GN: ' + returnValue.name;
			if (returnValue.proteins != ""){
				//If there are multiple proteins in the same gene matching the search term
				//we want to show each protein on a separate line like this:
				//  GN: XXXX (protein1)
				//  GN: XXXX (protein2)
				let proteins = returnValue.proteins.split(";");
				for (let protein of proteins){
					if (protein.includes(search_term)) {
						display_name = display_name.concat(" (" + protein + ")");
						this.options.push({name: display_name, value: returnValue.name });
						//need reinitialize display value with GN: XXXX format if there are additional matching proteins
						display_name = 'GN: ' + returnValue.name; 
					}
				}
				
			}
			else {
				this.options.push({name: display_name, value: returnValue.name });
			}
		}
		this.loading = false;  
	});
  }
  
  searchCaseTerms(search_term:string){
	this.loading = true;
	this.searchService.getCaseSearchResults(search_term).subscribe((data: any) =>{
		this.caseSearchResults = data.caseSearch.searchCases;
		for (let returnValue of this.caseSearchResults){
			let display_name = 'CA: ' + returnValue.name;
			this.options.push({name: display_name, value: returnValue.name });
		}
		this.loading = false;  
	});  
  }
  
  searchStudyTerms(search_term:string){
	this.loading = true;
	this.searchService.getStudySearchResults(search_term).subscribe((data: any) =>{
		this.studySearchResults = data.studySearch.studies;
		for (let returnValue of this.studySearchResults){
			let display_name = 'ST: ' + returnValue.name;
			this.options.push({name: display_name, value: returnValue.name });
		}
		this.loading = false;  
	});  
  }
  
  ngOnInit() {
		if (sessionStorage.getItem("loginToken") == "true") {
			this.userService.setIsLoggedIn(true);
			this.setInformationfromlocalStorage();
			//@@@PDC-408 - implement session timeout after 30 mins idle
			this.idle.watch();
		}

	  this.subscription = this.userService.isLoggedIn.subscribe(
							isLoggedIn => {
								this.userLoggedInFlag = isLoggedIn;
								if ( this.userLoggedInFlag ) {
									console.log('User logged in as ' + this.userService.getUserName());
									this.loggedInUser = this.userService.getUserName();
									// @@PDC 552: this is for getting user information from local storage when page reloads.
									this.setInformationfromlocalStorage();
									//@@@PDC-408 - implement session timeout after 30 mins idle
									this.idle.watch();
								}
							}
		);
		
		this.router.events.subscribe(event =>{
			if (event instanceof NavigationEnd) {
				if(event.url === '/welcome' || event.url === '/registration' || event.url === '/user-account' || event.url === '/email-confirmed'){
					this.navDisplayFlag = false;
				}else{
					this.navDisplayFlag = true;
				}
			}
			//If the user clicked confirmation link for their email registration catch it here
			if (event instanceof ActivationEnd) {
				if(event.snapshot.params){
					console.log(event.snapshot.params);
					if (event.snapshot.params["email"] != "" && !this.userEmailConfirmed){
						var userEmail = event.snapshot.params["email"];
						if (userEmail && userEmail != "") {
							this.userService.confirmUserEmail(userEmail).subscribe( data =>{
								console.log(data);
								alert("User confirmed their email successfully and is logged in");
								this.userEmailConfirmed = true;
								var currentUrl = this.loc.path();
								//Generate new url that does not contain filter parameters
								var newUrl = currentUrl.split("filters");
								this.loc.replaceState(newUrl[0]);
							});	
						}
					}
					//Open case summary overlay window from url when auxiliary path is provided
					//@@@PDC-995: Case view creates two pop-ups
					//Case summary popup is already opened from Browse & Navbar components and 
					//this code is not required as its opening a dupliate window. 
					//Commenting this code for future reference.
					/* if (event.snapshot.outlet == "caseSummary" && event.snapshot.params["case_id"] != "" ){
						var case_id = event.snapshot.params["case_id"];
						this.showCaseSummary(case_id);
					}*/
					//Reset password option
					if (event.snapshot.params["uuid"] != "" && event.snapshot.url.length > 0 && event.snapshot.url[0].path === "reset-password"){
						console.log("User " + event.snapshot.params["uuid"] + " wants to reset password");
						this.openResetPassword(event.snapshot.params["uuid"]);
					}
				}			
			}
		});
	  
	  // Monitor changes to search field and populate dropdown autocomplete list 
	  // as soon as the user entered at least 3 characters
	  this.filteredOptions = this.searchFormControl.valueChanges.pipe(
		debounceTime(200))
		.pipe(
			startWith(''),
			map(value => value.length > 2 ? this._filter(value) : [])	
		);
	  
		//@@@PDC-408 - implement session timeout after 30 mins idle
		const idleSessionTimeout = 30*60;
		// sets an idle timeout of 30 mins.
		this.idle.setIdle(idleSessionTimeout);
		// sets a timeout period of 5 seconds. after 30 mins of inactivity, the user will be considered timed out.
		this.idle.setTimeout(5);
		// sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
		this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
		//logout the user and redirect to welcome page
		this.idle.onTimeout.subscribe(() => {
		  this.userService.logout();
		  //this.router.navigate(['welcome']);
		});
		
  }

  displayFunc(search_result:any):string{
	  return search_result ? search_result.name : '';
  }
  
  //This function returns filled out options list which will populate search autcomplete dropdown list
  private _filter(value: string): string[] {
	  //console.log(value);
	  const filterValue = value.toLowerCase();
	  this.options = [];
	  this.searchGeneTerms(value);
	  this.searchProteinTerms(value);
	  this.searchCaseTerms(value);
	  this.searchStudyTerms(value);
	  return this.options;
  }
  
  /**
   * Open a dialog to allow them to login
   */
  // @@@PDC-881 open registration dialog if user needs to register
  public login() {
    // Open the dialog to let them login
    const dialogConfig = new MatDialogConfig();

    //   dialogConfig.disableClose = true;
    //   dialogConfig.autoFocus = false;
    // dialogConfig.hasBackdrop = true;
    //dialogConfig.minWidth = '1000px';

    dialogConfig.width = "38%";
	dialogConfig.height = "60%";
	dialogConfig.minWidth = 720;
	dialogConfig.minHeight = 630;
    const dialogRef = this.dialog.open(LoginComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      //console.log(result);
      if (result === "user register with email") {
		dialogConfig.width = "55%";
		dialogConfig.minWidth = 980;
		this.dialog.open(RegistrationComponent, dialogConfig);
      }
    });
    //dialogRef.updatePosition({ top: '50px', left: '70%' });
  }
  
	private openResetPassword(userId:string){
		// Open the dialog to let them login
		const dialogConfig = new MatDialogConfig();

		dialogConfig.width = "35%";
		dialogConfig.height = "55%";
		dialogConfig.data = {uuid: userId};
		const dialogRef = this.dialog.open(ResetPasswordComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(result => {
		  console.log(result);
		  if (result === 'Password updated') {
			//this.dialog.open(RegistrationComponent, dialogConfig);
		  }
		});
	}

	public submitData() {
		(<any>window).gtag('config', environment.GA_TRACKING_ID, {
			'page_path': 'pdcWorkspaces'
		 });

		if (!this.userLoggedInFlag) {
			// Open the dialog to let them login
			const dialogConfig = new MatDialogConfig();

			//   dialogConfig.disableClose = true;
			//   dialogConfig.autoFocus = false;
			// dialogConfig.hasBackdrop = true;
			//dialogConfig.minWidth = '1000px';
			dialogConfig.width = "38%";
			dialogConfig.height = "60%";
			dialogConfig.minWidth = 720;
			dialogConfig.minHeight = 630;

			const dialogRef = this.dialog.open(LoginComponent, dialogConfig);
			//dialogRef.updatePosition({ top: '50px', left: '70%' });
			dialogRef.afterClosed().subscribe(result => {
				if (result === "login successfully") {
					this.openChorus();
				}else if(result === "user register with email") {
					dialogConfig.width = "55%";
					dialogConfig.minWidth = 980;
					this.dialog.open(RegistrationComponent, dialogConfig);
				}
			});
		}
		else {
			this.openChorus();
		}
	}

  /**
   * Open a dialog to allow them to login and if not already in Chorus create an account
   */
  public openChorus() {
	this.loggedInEmail = this.userService.getEmail();
	this.loggedInUser = this.userService.getUserName();
	// @@PDC 552: this is for getting user information from local storage when page reloads.
	this.setInformationfromlocalStorage();
	// Since user is logged in, check to see if they are already setup in Chorus
    this.chorusService.checkUser(this.loggedInEmail).subscribe(exists => {
          if (exists) {
            this.chorusService.authenticateUser(this.loggedInEmail).subscribe(success => {
              //this.userEmail = userData.email;
              //this.username = userData.name;
			  console.log("Logged in to Chorus");
            });
          } else {
            // Open the dialog to let them login and handle registering if they are not already in Chorus
			const dialogConfig = new MatDialogConfig();

			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = false;
			dialogConfig.hasBackdrop = true;
			dialogConfig.width = '500px';
			dialogConfig.height = '600px';
			dialogConfig.data = {username: this.loggedInUser, userEmail: this.loggedInEmail};
			
			const dialogRef = this.dialog.open(LabSelectionComponent, dialogConfig);
          }
        });
    
  }
  
  //Callback function for logging user out
  public logoff(){
	  this.userService.logout();
  }

  //@@@PDC-709: User remains logged in forever if their session does not time out before they close the browser
  //@@@PDC-552: Check if session storage has the user information i.e; if user is logged in
  private setInformationfromlocalStorage() {
	if (sessionStorage.getItem('loginToken') === 'true') {
		this.loggedInEmail = sessionStorage.getItem('loginEmail');
		this.loggedInUser = sessionStorage.getItem('loginUser');
	} 
  }

	//@@@PDC-811 track pepquery
	trackPage(pageName: string):void{
		(<any>window).gtag('config', environment.GA_TRACKING_ID, {
			'page_path': pageName
		 });
	}

}
