import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, ActivationEnd, Router, ActivatedRoute, ParamMap, ActivationStart } from "@angular/router";
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
import { MessageDialogComponent } from "./../dialog/message-dialog/message-dialog.component";
import { ConfirmationDialogComponent } from "./../dialog/confirmation-dialog/confirmation-dialog.component";
import { LabSelectionComponent } from './lab-selection/lab-selection.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent} from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserAccountComponent } from '../user-account/user-account.component';
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
//@@@PDC-1153: Direct linking to case summary has broken
//@@@PDC-1469 make user account page to be an overlay window
//@@@PDC-1406: review and update messages that user can get during registration/login/account update 
//@@@PDC-1487: resolve issues found with user registration/login
//@@@PDC-1609: URL structure for permanent links to PDC 
//@@@PDC-1661: Fixing bugs found with user registration/login
//@@@PDC-1795: NIH/eRA sign in option user's name is not shown after logging in
//@@@PDC-1855: Change dialog message for new users trying to register.
//@@@PDC-1876: Allow deep linking to study summary page by PDC ID
export class NavbarComponent implements OnInit {
  background = '';
  searchFormControl = new FormControl();
  options: any[] = []; // will hold the display name and value of the search terms
  filteredOptions: Observable<string[]>;
  geneSearchResults;
  proteinSearchResults;
  studySearchResults = [];
  caseSearchResults = [];
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
  homePageURL = "/";
  userRegisteredToWorkspaceFlag = false;
  //caseUUID = '';

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
  //@@@PDC-1082 Add validation on search text user put in search bar.
  openSearchTermSummary(test:any){
	  //console.log(this.selectedSearchTerm);
	  this.searchButtonFlag = true;
	  if (this.selectedSearchTerm.name) {
		  let term = this.selectedSearchTerm.name.split(': ');
		  if (term[0] === 'GN'){
			  //Display value looks like this: GN: <gene name> (<gene description>)
			  //We need to extract only the gene name, that is why another split is needed
			  let gene_term = term[1].split(' (');
			  this.showGeneProteinSummary(gene_term[0].replace(/[^a-zA-Z0-9-]/g, ''));
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'PT'){
			  this.showGeneProteinSummary(term[1].replace(/[^a-zA-Z0-9-]/g, ''));
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'CA') {
			  this.showCaseSummary(term[1], term[0]);
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'ST'){
			  this.showStudySummary(term[1]);
			  this.searchButtonFlag = false;
		  }
		  if (term[0] === 'AL'){
			this.showCaseSummary(term[1], term[0]);
			this.searchButtonFlag = false;
		  }
		  if (term[0] === 'SA'){
			this.showCaseSummary(term[1], term[0]);
			this.searchButtonFlag = false;
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
        val => {
			console.log('Dialog output:', val);
			//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
			//Reset the search box to empty
			this.selectedSearchTerm = [{name: '', value: ''}];
		}
    );

  }
  
  showCaseSummary(case_id: string, entityType = "", case_uuid = ""){
	var caseSubmitterID = "";
	var caseUUID = "";
	//console.log(case_id);
	  if (entityType == "CA") {
		
		let requiredCaseID = case_id.split("{");
		caseSubmitterID = requiredCaseID[1];
		caseUUID = requiredCaseID[0];
		
	  } else {
		//For Sample/Aliquot
		//var caseUUID = "";
		var requiredCaseID = [];
		if (entityType == "AL") {
			requiredCaseID = case_id.split("}");
		} else {
			requiredCaseID = case_id.split("{");
		}
		caseSubmitterID = requiredCaseID[1];
		//this.openCaseSummaryDialog(caseSubmitterID, caseUUID);
	  }
	  //this function was called with auxiliary URL and NOT with search
	  if (entityType === ""){
		  if (case_id != ""){  caseSubmitterID = case_id; } else { caseSubmitterID = "";}
		  if (case_uuid != "") { caseUUID = case_uuid; } else { caseUUID = "";}
	  }
	  this.openCaseSummaryDialog(caseSubmitterID, caseUUID);
  }

  openCaseSummaryDialog(caseSubmitterID, caseUUID) {
	console.log("Open Case summary for case id: " + caseSubmitterID + ", " + caseUUID + ".");
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
		  case_id: caseUUID,
		  case_submitter_id: caseSubmitterID,
		  project_name: '',
		  program_name: '',
		  sample_type: '',
		  disease_type: '',
		  primary_site: ''
	}
	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	//Fetch all required properties for a Case
	this.searchService.getCaseSummaryData(caseUUID, caseSubmitterID).subscribe((data: any) => {
	  if (data.uiCase) {
		  let caseData = data.uiCase[0];
		  if (caseData) {
			  if (caseUUID == "") {
			  	case_data.case_id = caseData.case_id;
			  }
			  case_data.aliquot_submitter_id = caseData.aliquot_submitter_id;
			  case_data.sample_submitter_id = caseData.sample_submitter_id;
			  case_data.project_name = caseData.project_name;
			  case_data.program_name = caseData.program_name;
			  case_data.sample_type = caseData.sample_type;
			  case_data.disease_type = caseData.disease_type;
			  case_data.primary_site = caseData.primary_site;
		  }
	  }
	  dialogConfig.data = {
		  summaryData: case_data,
	  }
	  var currentUrl = this.loc.path();
	  //this.loc.replaceState("/case/" + case_data.case_id);
	  //PDC-1609 check if case summary window is accessed directly via url or via search
	  if (currentUrl.indexOf("/case/") > -1) {
		  //if case summary is accessed via direct url, we want the background page to be browse.
		  this.router.navigate([{outlets: {primary: ['browse'], caseSummary: ['case-summary', caseSubmitterID]}}], { skipLocationChange: true });
	  }  else {
		  //In any other case we want the background page to remain where the user was before
		  this.router.navigate([{outlets: {caseSummary: ['case-summary', caseSubmitterID]}}], { skipLocationChange: true });
	  }
	  const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
	  dialogRef.afterClosed().subscribe(
		  val => {
			  console.log('Dialog output:', val);
			  //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
			  //Reset the search box to empty
			  this.selectedSearchTerm = [{name: '', value: ''}];
		  }
	  );
	});
  }
  
  private findStudySubmitterIdName(name: string):string{
	  for (let study_search_res of this.studySearchResults){
		  if (study_search_res.name == name) {
			  return study_search_res.submitter_id_name;
		  }
	  }
	  return '';
  }
  
  showStudySummary(study_name: string, studyUUID = "", study_submitter_id_param = "", PDC_study_id = ""){
	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	let study_uuid = "";
	let study_submitter_id = "";
	let study_submitter_id_name = "";
	let pdc_study_id = "";
	//Fetch Study Submitter ID for the study
	console.log("Study_name: " + study_name  + ", studyUUID: " + studyUUID + ", study_submitter_id_param: " + study_submitter_id_param);
	if (study_name.indexOf("{") > -1) {
		let requiredStudyName = study_name.split("{");
		study_uuid = requiredStudyName[0];
		let studyNameSubmitterID = requiredStudyName[1].split("}");
		study_name = studyNameSubmitterID[0];
		study_submitter_id_name = this.findStudySubmitterIdName(study_name);
		let sub_id_pdc_study_id = studyNameSubmitterID[1].split("~");
		study_submitter_id = sub_id_pdc_study_id[0];
		pdc_study_id = sub_id_pdc_study_id[1];
	} else {
		study_submitter_id_name = study_name;
		study_uuid = studyUUID;
		study_submitter_id = study_submitter_id_param;
		pdc_study_id = PDC_study_id;
	}
	const dialogConfig = new MatDialogConfig();
	dialogConfig.disableClose = true;
	dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%';
	
	let study_data: AllStudiesData = {
		study_id: study_uuid,
		pdc_study_id: pdc_study_id,
		study_submitter_id: study_submitter_id,
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
	console.log(study_data);
	dialogConfig.data = {
		summaryData: study_data,
	}
	var currentUrl = this.loc.path();
	//this.loc.replaceState("/study/" + study_data.study_id);
	 //PDC-1609 check if study summary window is accessed directly via url or via search
	if (currentUrl.indexOf("/study/") > -1) {
		//if study summary is accessed via direct url, we want the background page to be browse.
		this.router.navigate([{outlets: {primary: ['browse'], studySummary: ['study-summary', study_submitter_id_name]}}], { skipLocationChange: true });
	} else {
		 //In any other case we want the background page to remain where the user was before
		this.router.navigate([{outlets: {studySummary: ['study-summary', study_submitter_id_name]}}], { skipLocationChange: true });
	}
	const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);
	dialogRef.afterClosed().subscribe(
		val => {
			console.log('Dialog output:', val);
			//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
			//Reset the search box to empty
			this.selectedSearchTerm = [{name: '', value: ''}];
		}
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
	this.caseSearchResults = [];
	this.searchCaseTermsForCaseSubmitterID(search_term);
	//If the search term can't be found, search for Case UUID, Sample ID, Aliquot IDs
	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	//Search for Case UUI
	this.searchService.getCaseUUIDResults(search_term).subscribe((data: any) =>{
		if (data.case && data.case.case_submitter_id) {
			let search_case_submitter_id = data.case.case_submitter_id;
			this.searchCaseTermsForCaseSubmitterID(search_case_submitter_id, search_term);
		} 
		//@@@PDC-1943: Refine search functionality to return more results
		//Search for sample ID/sample submitter ID
		this.searchService.getSampleUUIDResults(search_term).subscribe((sampleData: any) =>{
			this.searchForSampleData(sampleData);
			this.searchService.getSampleSubmitterIDResults(search_term).subscribe((sampleSubmitterData: any) => {
				this.searchForSampleData(sampleSubmitterData);
				//Search for aliquot ID/aliquot submitter ID
				this.searchService.getAliquotUUIDResults(search_term).subscribe((aliquotData: any) =>{
					this.searchForAliquotData(search_term, aliquotData);
					this.searchService.getAliquotSearchResults(search_term).subscribe((aliquotSearchResults: any) =>{
						var aliquotSearchResultSet = aliquotSearchResults.aliquotSearch.searchAliquots;
						for (let returnValue of aliquotSearchResultSet) {
							let aliquotID = returnValue.aliquot_id;
							//@@@PDC-1943: Refine search functionality to return more results
							this.searchService.getAliquotUUIDResults(aliquotID).subscribe((aliquotSubmitterData: any) =>{
								this.searchForAliquotData(aliquotID, aliquotSubmitterData);
							});
						}
					});
				});
			});
		});
	});
  }

  searchForSampleData(sampleData) {
	if (sampleData && sampleData.sample && sampleData.sample.length > 0) {
		let sampleDataTemp= [];
		sampleDataTemp = Object.assign(sampleDataTemp, sampleData.sample);
		for (let returnValue of sampleDataTemp){
			let caseSubmitterIDForSample = "";
			let sampleUUID = "";
			let sampleSubmitterID = "";
			if (returnValue.case_submitter_id) {
				caseSubmitterIDForSample = returnValue.case_submitter_id;
			}
			if (returnValue.sample_id) {
				sampleUUID = returnValue.sample_id;
			}
			if (returnValue.sample_submitter_id) {
				sampleSubmitterID = returnValue.sample_submitter_id;
			}	
			var display_name = 'SA: ';
			if (sampleUUID != "") {
				display_name = display_name + sampleUUID;
			}
			display_name = display_name.concat("{" + caseSubmitterIDForSample);
			this.options.push({name: display_name, value: display_name });
		}
	}
  }

  //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
  searchForAliquotData(search_term, aliquotData) {
	if (aliquotData && aliquotData.aliquot && aliquotData.aliquot.length > 0) {
		let aliquotDataTemp= [];
		aliquotDataTemp = Object.assign(aliquotDataTemp, aliquotData.aliquot);
		for (let returnValue of aliquotDataTemp) {
			let caseSubmitterIDForAliquot = "";
			let aliquotUUID = "";
			let aliquotSubmitterID = "";
			search_term = returnValue.case_submitter_id;
			if (returnValue.case_submitter_id) caseSubmitterIDForAliquot = returnValue.case_submitter_id;
			if (returnValue.aliquot_id) aliquotUUID = returnValue.aliquot_id;
			if (returnValue.aliquot_submitter_id) aliquotSubmitterID = returnValue.aliquot_submitter_id;
			var display_name = 'AL: ';
			if (aliquotUUID != "") {
				display_name = display_name + aliquotUUID;
			}
			display_name = display_name.concat("{" + aliquotSubmitterID);
			display_name = display_name.concat("}" + caseSubmitterIDForAliquot);
			this.options.push({name: display_name, value: display_name });
		}
	}
  }

  //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
  searchCaseTermsForCaseSubmitterID(search_term, checkForCaseID= "") {
	this.searchService.getCaseSearchResults(search_term).subscribe((data: any) =>{
		if (data && data.caseSearch && data.caseSearch.searchCases && data.caseSearch.searchCases.length > 0) {
			this.caseSearchResults = Object.assign(this.caseSearchResults, data.caseSearch.searchCases);
			for (let returnValue of this.caseSearchResults){
				var case_uuid = returnValue.case_id;
				//@@@PDC-1943: Refine search functionality to return more results
				//Populate Options var for valid case submitter IDs and Case UUIDs
				if ((checkForCaseID == "") || (checkForCaseID != "" && checkForCaseID == case_uuid)) {
					var display_name = 'CA: ';
					if (case_uuid != "") {
						display_name = display_name + case_uuid;
					}
					display_name = display_name.concat("{" + returnValue.name);
					this.options.push({name: display_name, value: returnValue.name });
				}
			}
		this.loading = false;  
		}
	}); 
  }

  //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
  splitStudySubmitterIDFromString(searchString) {
	let spaceIndex = searchString.lastIndexOf(" ");
	let study = searchString.substring(spaceIndex);
	let search_study_submitter_id = study.replace(/\s/g, "");
	return search_study_submitter_id;
  }
  
  searchStudyTerms(search_term:string) {
	this.studySearchResults = [];
	this.loading = true;
	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	//Search by Study UUID
	//Search by study_shortname
	this.searchForStudyData(search_term);
	//Search by study_id
	this.searchService.getStudybyUUIDResults(search_term, '').subscribe((data: any) =>{
		if (data.study && data.study[0] && data.study[0].study_shortname) {
			let data_study_shortname = data.study[0].study_shortname;
			this.searchForStudyData(data_study_shortname);
		}
		//Search by study_submitter_id
		this.searchService.getStudybyUUIDResults('', search_term).subscribe((studySubmitterIDData: any) =>{
			if (studySubmitterIDData.study && studySubmitterIDData.study[0] && studySubmitterIDData.study[0].study_shortname) {
				let studySubmitterIDData_shortname = studySubmitterIDData.study[0].study_shortname;
				this.searchForStudyData(studySubmitterIDData_shortname);
			}
		});
		//@@@PDC-1875: Update search to be able to search by new PDC ID
		//Search by pdc_study_id
		//@@@PDC-1937: Implement search by partial PDC ID
		this.searchService.getStudySearchByPDCStudyId(search_term).subscribe((studyIDData: any) =>{
			if (studyIDData.studySearchByPDCStudyId && studyIDData.studySearchByPDCStudyId.studies && studyIDData.studySearchByPDCStudyId.studies.length > 0) {
				this.studySearchResults = Object.assign(this.studySearchResults, studyIDData.studySearchByPDCStudyId.studies);
				this.populateDropDownOptions(this.studySearchResults);
			} else {
				//@@@PDC-1931: Enable search based on the external references
				this.searchStudiesForExternalReferences(search_term);
			}
		});
	});
  }

  //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
  //@@@PDC-1875: Update search to be able to search by new PDC ID
  searchForStudyData(search_term) {
	this.searchService.getStudySearchResults(search_term).subscribe((data: any) =>{
		 if (data && data.studySearch && data.studySearch.studies && data.studySearch.studies.length > 0) {
			this.studySearchResults = Object.assign(this.studySearchResults, data.studySearch.studies);
			//this.studySearchResults = data.studySearch.studies;
			this.populateDropDownOptions(this.studySearchResults);
		}
		this.loading = false;  
	});
  }

  //@@@PDC-1931: Enable search based on the external references
  searchStudiesForExternalReferences(search_term) {
	this.searchService.getStudySearchByExternalRef(search_term).subscribe((data: any) =>{
		 if (data && data.studySearchByExternalId && data.studySearchByExternalId.studies && data.studySearchByExternalId.studies.length > 0) {
			this.studySearchResults = Object.assign(this.studySearchResults, data.studySearchByExternalId.studies);
			this.populateDropDownOptions(this.studySearchResults);
		}
		this.loading = false;  
	});
  }

  //@@@PDC-1937: Implement search by partial PDC ID
  populateDropDownOptions(searchResults:any) {
	for (let returnValue of searchResults){
		var study_uuid = returnValue.study_id;
		var display_name = 'ST: ';
		if (study_uuid != "") {
			display_name = display_name + study_uuid;
		}
		display_name = display_name.concat("{" + returnValue.name);
		display_name = display_name.concat("}" + returnValue.study_submitter_id);
		display_name = display_name.concat("~" + returnValue.pdc_study_id);
		this.options.push({name: display_name, value: returnValue.name });
	}
	this.removeDuplicates();
  }

  removeDuplicates() {
	    this.options= this.options.filter((value, index, array) => 
	     !array.filter((v, i) => JSON.stringify(value) == JSON.stringify(v) && i < index).length);
  }
  
  ngOnInit() {
		if (sessionStorage.getItem("loginToken") == "true") {
			//this.userService.setIsLoggedIn(true);
			this.setInformationfromlocalStorage();
			let loginUserIDType = sessionStorage.getItem('loginUserIDType');
			this.userService.retrieveUserDataForLoggedInUser(this.loggedInEmail, loginUserIDType).then(returnValue => {
				if (returnValue === 0){
					console.log("The user was successfuly logged in. Session continues");
				} else {
					console.log("An error occured while retrieving user data:" + returnValue);
				}
			});
			//@@@PDC-408 - implement session timeout after 30 mins idle
			this.idle.watch();
		}
		//PDC-1795 Detect when a user loged in with NIH/eRA sign in option
	    this.route.queryParams.subscribe(queryParams => {
			console.log(queryParams);
			if (queryParams.uid){
					let user_uid = queryParams.uid;
					this.userService.checkPDCUser(user_uid).subscribe((login: any) => {
						var currentUrl = this.loc.path();
					    //Generate new url that does not contain uid parameters
					    var newUrl = currentUrl.split("?uid=");
					    this.loc.replaceState(newUrl[0]);
						console.log("User tried to login with NIH/eRA option returned:" + login);
						switch (login) {
							//user registered
							case 0:
								if(localStorage.getItem('controlledFileExportFlag') === 'true'){
									localStorage.removeItem('controlledFileExportFlag');
									document.location.href = environment.dcf_fence_login_url.replace("%dcf_client_id%",environment.dcf_client_id);
									this.router.navigate(['browse']);
								}
								break;
							//user not registered
							case 1:
								if (this.userService.getEmail()) {
									this.userService.setUserIDType("NIH");
								} else {
									this.userService.setUserIDType("eRA");
								}
								//Open dialog suggesting new user to register
								const dialogConfig = new MatDialogConfig();
								let confirmationMessage = `User account with such credentials was not found. Would you like to register a new user?`;
								let continueRegisterNewUser = "Yes";
								const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
																	width: "350px",
																	height: "140px",
																	data: { message: confirmationMessage, continueMessage: continueRegisterNewUser }
								});
												
								dialogRef.afterClosed().subscribe(result => {
									if ( result === "Yes") {
										//Open registration dialog
										dialogConfig.width = "55%";
										dialogConfig.minWidth = 980;
										this.dialog.open(RegistrationComponent, dialogConfig);
									}
								});
								break;
							//system error
							case 2:
								this.dialog.open(MessageDialogComponent, {
										width: "430px",
										height: "150px",
										disableClose: true,
										autoFocus: false,
										hasBackdrop: true,
										data: { message: "System Error. Please contact your system administrator "}
									});
								console.log("System error!!!");
								break;				
						}
					});
			}
	   });

	  this.subscription = this.userService.isLoggedIn.subscribe(
							isLoggedIn => {
								this.userLoggedInFlag = isLoggedIn;
								if ( this.userLoggedInFlag ) {
									console.log('User logged in as ' + this.userService.getUserName());
									this.loggedInUser = this.userService.getUserName();
									// @@PDC 552: this is for getting user information from local storage when page reloads.
									this.setInformationfromlocalStorage();
									//@@@PDC-1859: Edit the SUBMIT DATA workspace login link text
									//Check if user is registered to Workspace
									var loggedInEmail = this.userService.getEmail();
									this.chorusService.checkUser(loggedInEmail).subscribe(exists => {
										if (exists) {
											this.userRegisteredToWorkspaceFlag = true;
										} else {
											this.userRegisteredToWorkspaceFlag = false;
										}
									});
									//@@@PDC-408 - implement session timeout after 30 mins idle
									this.idle.watch();
								}
							}
		);
		
		this.router.events.subscribe(event =>{
			if (event instanceof NavigationEnd) {
				if(event.url === '/welcome' || event.url === '/registration' || event.url === '/user-account' || event.url === '/email-confirmed' || event.url === '/submit-data'){
					this.navDisplayFlag = false;
				}else{
					this.navDisplayFlag = true;
				}
			}
			//If the user clicked confirmation link for their email registration catch it here
			if (event instanceof ActivationEnd) {
				if(event.snapshot.params && event.snapshot.url.length > 0){
					if (event.snapshot.params["email"] != "" && !this.userEmailConfirmed){
						var userEmail = event.snapshot.params["email"];
						if (userEmail && userEmail != "") {
							this.userService.confirmUserEmail(userEmail).subscribe( data =>{
								//console.log(data);
								var message = "";
								if (data == 0) {
									message =  "User " + userEmail + " confirmed their email successfully and is logged in";
									this.userEmailConfirmed = true;
								} else {
									message = "Could not confirm user email " +  userEmail + ". User record was not found, or blocked, or already confirmed. For further assistance contact site administrators by email pdc-admin@esacinc.com.";
									
								}
								var currentUrl = this.loc.path();
								//Generate new url that does not contain email-confirmed parameters
								var newUrl = currentUrl.split("email-confirmed");
								this.loc.replaceState(newUrl[0]);
								this.dialog.open(MessageDialogComponent, {
										width: "430px",
										height: "150px",
										disableClose: true,
										autoFocus: false,
										hasBackdrop: true,
										data: { message: message}
								});
								var currentUrl = this.loc.path();
								//console.log(currentUrl);
								//Generate new url that does not contain filter parameters
								var newUrl = currentUrl.split("filters");
								this.loc.replaceState(newUrl[0]);
							});	
						}
					}
					//Reset password option
					if (event.snapshot.params["uuid"] != "" && event.snapshot.url.length > 0 && event.snapshot.url[0].path === "reset-password"){
						console.log("User " + event.snapshot.params["uuid"] + " wants to reset password");
						this.openResetPassword(event.snapshot.params["uuid"]);
					}
					//Open case summary overlay window from url when auxiliary path is provided
					//@@@PDC-995: Case view creates two pop-ups
					//@@@PDC-1153: Direct linking to case summary has broken
					//event.snapshot.fragment is undefined if the case summary page is opened from search bar/by clicking from Case ID
					//Execute the below code only if the case summary page is opened through direct linking.
					/*if (event.snapshot.outlet == "caseSummary" && event.snapshot.params["case_id"] != "" && event.snapshot.fragment !== undefined){
						var case_id = event.snapshot.params["case_id"];
						this.showCaseSummary(case_id);
					}
					if (event.snapshot.outlet == "studySummary" && event.snapshot.params["study_id"] != ""){
						var study_id = event.snapshot.params["study_id"];
						this.showStudySummary(study_id);
					}
					if (event.snapshot.outlet == "geneSummary" && event.snapshot.params["gene_id"] != ""){
						var gene_id = event.snapshot.params["gene_id"];
						this.showGeneProteinSummary(gene_id);
					}*/
				}			
			}
			if (event instanceof ActivationStart) {
				//PDC-1609 detect permanent URL links to study and case 
				if(event.snapshot.params && event.snapshot.url.length > 0){
					//If case_uuid parameter is defined - this is a direct link URL for case summary
					if (event.snapshot.outlet == "primary" && "case_uuid" in event.snapshot.params && event.snapshot.params["case_uuid"] != ""){
						var case_uuid = event.snapshot.params["case_uuid"];
						console.log("case_uuid: " + case_uuid);
						this.searchService.getCaseUUIDResults(case_uuid).subscribe((data: any) =>{
							var case_id = data.case.case_submitter_id;
							this.showCaseSummary(case_id,"", case_uuid);
						});
					}
					//If study_uuid parameter is defined - this is a direct link URL for study summary
					if (event.snapshot.outlet == "primary" && "study_uuid" in event.snapshot.params && event.snapshot.params["study_uuid"] != ""){
						var study_uuid = event.snapshot.params["study_uuid"];
						var pdc_study_id = study_uuid.toUpperCase(); //in case PDC ID is used, it needs to be case insensitive
						//If study_uuid is in the format of "PDCxxxxx" than it is new PDC id
						if (pdc_study_id.indexOf("PDC") == 0) {
								study_uuid = "";
						} else {
							pdc_study_id = "";
						}
						this.searchService.getStudySubmitterID(study_uuid, pdc_study_id).subscribe((data: any) => {
							var study_submitter_id_name = data.study[0].study_name;
							var study_submitter_id = data.study[0].study_submitter_id;
							var PDC_study_id = data.study[0].pdc_study_id;
							console.log("study_submitter_id_name: " + study_submitter_id_name + ", study_uuid: " + study_uuid);
							this.showStudySummary(study_submitter_id_name, study_uuid, study_submitter_id, PDC_study_id);
						});
					}
				}
			}
		});
	  
	  // Monitor changes to search field and populate dropdown autocomplete list 
	  // as soon as the user entered at least 3 characters
	  this.filteredOptions = this.searchFormControl.valueChanges.pipe(
		debounceTime(400))
		.pipe(
			startWith(''),
			map(value => value.length > 1 ? this._filter(value) : [])	
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
		//@@@PDC-1716: Update the site url to just the domain name and drop any path
		if (window.location.hostname == "localhost") {
			this.homePageURL = "/pdc";
		}
		
  }

  displayFunc(search_result:any):string{
	  return search_result ? search_result.name : '';
  }
  
  //This function returns filled out options list which will populate search autcomplete dropdown list
  //@@@PDC-1082 Add validation on search text user put in search bar.
  private _filter(value: string): string[] {
	  //console.log(value);
	  //Remove white spaces from the search string
	  value = value.replace(/\s/g, "");
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
      if (result === "user register with email" || result === "new user register") {
		//Let user know that their email is not registered through PDC
		let confirmationMessage = `Would you like to register as a new user?`; 
		if (result === "user register with email") {
			confirmationMessage = `User with such email was not found. Would you like to register a new user?`;
		}
		let continueRegisterNewUser = "Yes";
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
											width: "350px",
											height: "140px",
											data: { message: confirmationMessage, continueMessage: continueRegisterNewUser }
		});

						
		dialogRef.afterClosed().subscribe(result => {
			if ( result === "Yes") {
				//Open registration dialog
				dialogConfig.width = "55%";
				dialogConfig.minWidth = 980;
				this.dialog.open(RegistrationComponent, dialogConfig);
			}
		});
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
	
	//PDC-1469 make user account page to be an overlay window
	private openUserAccountPage() {
		// Open the dialog with user account management component
		const dialogConfig = new MatDialogConfig();
		dialogConfig.width = "38%";
		//dialogConfig.height = "60%";
		dialogConfig.minWidth = 720;
		dialogConfig.minHeight = 190;
		const dialogRef = this.dialog.open(UserAccountComponent, dialogConfig);
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
					//Let user know that their email is not registered through PDC
					let confirmationMessage = `
							User with such email was not found. Would you like to register a new user?`;
					let continueRegisterNewUser = "Yes";
					const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
						  width: "350px",
						  height: "140px",
						  data: { message: confirmationMessage, continueMessage: continueRegisterNewUser }
						});
						
					dialogRef.afterClosed().subscribe(result => {
						  if ( result === "Yes") {
							//Open registration dialog
							dialogConfig.width = "55%";
							dialogConfig.minWidth = 980;
							this.dialog.open(RegistrationComponent, dialogConfig);
						  }
					});
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
		//this.userService.setEmail(this.loggedInEmail);
		//this.userService.setName(this.loggedInUser);
		this.userService.setUserIDType(sessionStorage.getItem('loginUserIDType'));
	} 
  }

	//@@@PDC-811 track pepquery
	trackPage(pageName: string):void{
		(<any>window).gtag('config', environment.GA_TRACKING_ID, {
			'page_path': pageName
		 });
	}

}
