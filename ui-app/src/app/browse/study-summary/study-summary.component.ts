
import {of as observableOf,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog} from '@angular/material';
import { StudySummaryService } from './study-summary.service';
import { AllStudiesData, Filter, WorkflowMetadata, ProtocolData, PublicationData, 
		StudyExperimentalDesign, BiospecimenPerStudy, EntityReferencePerStudy, FileCountsForStudyPage } from '../../types';
import { StudySummaryOverlayService } from './study-summary-overlay-window/study-summary-overlay-window.service';
import { AllClinicalData, AllCasesData } from '../../types';
import { CheckboxModule } from 'primeng/checkbox';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import * as _ from 'lodash';
import { ngxCsv } from "ngx-csv/ngx-csv";


//const fileExists = require('file-exists');

import {environment} from '../../../environments/environment';

//@@@PDC-612 display all data categories
enum FileTypes {
	RAW,
	txt,
	'PSM-TSV',
	'PSM-MZID',
	pdf,
	mzML,
	doc,
	mzIdentML
}

@Component({
  selector: 'app-study-summary',
  templateUrl: './study-summary.component.html',
  styleUrls: ['../../../assets/css/global.css', './study-summary.component.scss'],
  providers: [ StudySummaryService, StudySummaryOverlayService ]
})

//@@@PDC-357 - Search UI
//@@@PDC-374 - adding url to overlay windows
//@@@PDC-758: Study summary overlay window opened through search is missing data
//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1219: Add a new experimental design tab on the study summary page
//@@@PDC-1355: Use uuid as API search parameter
//@@@PDC-1609: URL structure for permanent links to PDC 
//@@@PDC-1876: Allow deep linking to study summary page by PDC ID
//@@@PDC-2378: Add supplementary data to the study summary screen
//@@@PDC-2598 - Apply conditional formatting to embargo date on the study summary pages
//@@@PDC-2436 - Update study summary screen to add contact details
export class StudySummaryComponent implements OnInit {

  study_id: string;
  study_submitter_id_name: string;
  studySummaryData: AllStudiesData; 
  workflowData: WorkflowMetadata;
  protocol: ProtocolData;
  publications: PublicationData[] = [];
  fileCountsRaw: FileCountsForStudyPage[];
  suppFileCountsRaw: FileCountsForStudyPage[]; //supplementary data files data
  fileTypesCounts: any;
  totalFilesCount: number = 0;
  totalSuppFilesCount: number = 0; //supplementary data files counts
  loading: boolean = false;
  heatmapAvailable = false;
  mapData: any[];
  responseStatus: any;
	protocol_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Protocol';
	workflow_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Workflow Metadata';
	description_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Study#study_description';
	dua_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=DUA';
	aliquot_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Aliquot';
	clinical_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Case';
	experimentalDesign_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Study Run Metadata';
	files_download_faq_help_url = "/pdc/faq#Files_Download";
	duaAvailable:boolean = true;
	filteredClinicalData: AllClinicalData[]; //Filtered list of clinical data
	//@@@PDC-1160: Add cases and aliquots to the study summary page
	totalRecordsClinical: number;
	offset: number;
	limit: number;
	pageSize: number;
	newFilterSelected: any;
	sort: string;
	clinicalCols:any[];
	externalCaseMap;
	gdcUrl: string = environment.gdc_case_id_url;
	kidsFirstURL: string = environment.kidsFirst_url;
	iconFolder = 'assets/css/images/externalIcons/';
	filteredCasesData: AllCasesData[]; //Filtered list of cases
	offsetBiospecimen: number;
	totalRecordsBiospecimens: number;
	biospecimenCols:any[];
	//@@@PDC-1219: Add a new experimental design tab on the study summary page
	studyExperimentalDesign:StudyExperimentalDesign[] = [];
	biospecimenPerStudy:BiospecimenPerStudy[] = [];
	studyExperimentDesignTableCols:any[];
	studyExperimentDesignMap;
	studyExperimentDesignTableCommonCols:any[];
	selectedExperimentalStudies: StudyExperimentalDesign[] = [];
	studyExperimentDesignTableExtraCols:any[];
	studyExperimentDesignTableHeaderCol = "";
	static urlBase;
	studySubmitterId = "";
	entityReferenceExternalData:EntityReferencePerStudy[] = [];
	entityReferenceInternalData:EntityReferencePerStudy[] = [];
	pdcStudyID:string;

  constructor(private route: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private studySummaryService: StudySummaryService, private loc:Location,
				private dialogRef: MatDialogRef<StudySummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public studyData: any, private studySummaryOverlayWindow: StudySummaryOverlayService, private dialog: MatDialog,) {
    
	console.log(studyData);
	//@@@PDC-612 display all data categories
	this.fileTypesCounts = {RAW: 0, txt_psm: 0, txt: 0, pdf: 0, mzML: 0, doc: 0, mzIdentML: 0}; 
	this.suppFileCountsRaw = studyData.summaryData.supplementaryFilesCount;
	this.fileCountsRaw = studyData.summaryData.nonSupplementaryFilesCount;
	this.getFilesCountsPerStudy();
	this.study_id = studyData.summaryData.study_id;
	this.study_submitter_id_name = studyData.summaryData.submitter_id_name;
	this.studySummaryData = studyData.summaryData;
	this.studySubmitterId = studyData.summaryData.study_submitter_id;
	//@@@PDC-1888: Standardize the IDs on the study summary and case summary pages
	this.pdcStudyID = studyData.summaryData.pdc_study_id;
	console.log("UUID: "+this.study_id + " PDC ID: " + this.pdcStudyID);
	this.loc.replaceState("/study/" + this.pdcStudyID);
	//If I got here via search then most of the fields are empty and I need to query study summary data
	if (studyData.summaryData.project_name == ""){
		this.getStudySummaryData();
	}
	this.workflowData = {
		workflow_metadata_submitter_id: '',
		study_submitter_id: '',
		protocol_submitter_id: '',
		cptac_study_id: '',
		submitter_id_name: '',
		study_submitter_name: '',
		analytical_fraction: '',
		experiment_type: '',
		instrument: '',
		refseq_database_version: '',
		uniport_database_version: '',
		hgnc_version: '',
		raw_data_processing: '',
		raw_data_conversion: '',
		sequence_database_search: '',
		search_database_parameters: '',
		phosphosite_localization: '',
		ms1_data_analysis: '',
		psm_report_generation: '',
		cptac_dcc_mzidentml: '',
		mzidentml_refseq: '',
		mzidentml_uniprot: '',
		gene_to_prot: '',
		cptac_galaxy_workflows: '',
		cptac_galaxy_tools: '',
		cdap_reports: '',
		cptac_dcc_tools: ''
	};
	this.getWorkflowDataSummary();
	this.getProtocol();
	this.getPublications();
	//this.getFilesCountsPerStudy();
	//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
	this.setDUAWindowForStudySummary();
	//@@@PDC-1160: Add cases and aliquots to the study summary page
	this.offset = this.offsetBiospecimen = 0; //Initialize values for pagination
	this.limit = 10;
	this.totalRecordsClinical = this.totalRecordsBiospecimens = 0;
	this.pageSize = 10;
	// Array which holds filter names. Must be updated when new filters are added to browse page.  
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
		"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "studyName_genes_tab":"", "case_status": "", "biospecimen_status": ""};	
	this.sort = '';
	//@@@PDC-1987: Update clinical tab to use new external reference API
	//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
	//Array of external file Details. This has to be updated each time a new type of external case iD is added.
	this.externalCaseMap = [{
		'id': "GDC",
		'url': this.gdcUrl,
		'imageUrl': this.iconFolder + "GDC.png",
	}, {
		'id': "KidsFirst",
		'url': this.kidsFirstURL,
		'imageUrl': this.iconFolder + "KidsFirst.png",
	}, {
		'id': "TCIA",
		'imageUrl': this.iconFolder + "Tcia.png",
	}, {
		'id': "CBTTC",
		'url': this.kidsFirstURL,
		'imageUrl': this.iconFolder + "KidsFirst.png",
	}];
	this.studyExperimentDesignMap = [{
		'id': "LABEL FREE",
		'cols': "label_free"
	}, {
		'id': "ITRAQ4",
		'cols': "itraq_114,itraq_115,itraq_116,itraq_117"
	},
	{		
		'id': "ITRAQ8",
		'cols': "itraq_113,itraq_114,itraq_115,itraq_116,itraq_117,itraq_118,itraq_119,itraq_121"
	}, {
		'id': "TMT10",
		'cols': "tmt_126,tmt_127n,tmt_127c,tmt_128n,tmt_128c,tmt_129n,tmt_129c,tmt_130c,tmt_130n,tmt_131"
	}, {
		'id': "TMT11",
		'cols': "tmt_126,tmt_127n,tmt_127c,tmt_128n,tmt_128c,tmt_129n,tmt_129c,tmt_130c,tmt_130n,tmt_131,tmt_131c"
	}, {
		'id': "N/A",
		'cols': ""
	}];
	this.getAllClinicalData();
	this.getAllCasesData();
	//@@@PDC-1219: Add a new experimental design tab on the study summary page
	this.getStudyExperimentalDesign();
	//@@@PDC-1883: Add external references to study summary page
	this.getEntityReferenceExternalData();
	StudySummaryComponent.urlBase = environment.dictionary_base_url;
	}

	get staticUrlBase() {
		return StudySummaryComponent.urlBase;
	}
	
	//If the current date is with in the embargo date, display the DUA with a 'accept' button
	setDUAWindowForStudySummary() {
		setTimeout(() => {
			if (this.studySummaryData.program_name != 'Clinical Proteomic Tumor Analysis Consortium' &&
				this.studySummaryData.program_name != 'Pediatric Brain Tumor Atlas - CBTTC') {
				this.duaAvailable = false;
			}
			if (this.studySummaryData.embargo_date) {
				var currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
				//PDC-2744 DUA pops up when embargo date is "N/A"
				//If the current date is with in the embargo date, display the DUA with a 'accept' button
				if (this.studySummaryData.embargo_date != "N/A" && currentDate < this.studySummaryData.embargo_date) {
					if (this.duaAvailable) {
						this.studySummaryOverlayWindow.open();
					} 
					// This code is useful for adding overlay window in the future.
					/* else {
						this.studySummaryOverlayWindow.open("DUAForOtherProgramsOverlayWindow");
					} */
				}
			}
		}, 100);
	}
 
  getWorkflowDataSummary(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getWorkflowMetadata(this.study_id).subscribe((data: any) =>{
			this.workflowData = data.uiWorkflowMetadata[0];
			// console.log(this.workflowData);
			this.loading = false;
		  });
	  }, 1000);
  }

  getManifestFile() {
		//const manifest_file = 'assets/data-folder/' + this.studySummaryData.study_submitter_id + '/manifest.json';
		//@@@PDC-2106 use pdc_study_id in heatmap folder
		const manifest_file = 'assets/data-folder/' + this.pdcStudyID + '/manifest.json';
		console.log('Getting manifest file from: ' + manifest_file);
		return this.http.get(manifest_file);
  }
  
  readManifest() {
	this.mapData = [];
	this.getManifestFile()
    .subscribe((data: any) => {
		this.heatmapAvailable = true;
		console.log(data);
		data.heatmaps.map(aMap => {
			this.mapData.push({
				menu_label: aMap['menu-label'],
				file_name: aMap['filename'],
				col_header: aMap['col-header'],
				row_header: aMap['row-header']
			});
		});
	}, error => { this.heatmapAvailable = false; console.log('Error Status:', error.status); });
  }
  isHeatmapAvailable() {
	const manifest_file = 'assets/data-folder/' + this.pdcStudyID + '/manifest.json';
	this.http.head(manifest_file).pipe(
	catchError((error) => observableOf({foo: 'bar'})))
	.subscribe((status) => console.log('status', status))
	;
	}
	
	//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
	//Decodes HTML entities in a string.
	toHTML(input) : any {
		return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
	}
	
	//@@@PDC-758: Study summary overlay window opened through search is missing data
	//Update API call to fetch study summary details.
	getStudySummaryData(){
	  this.loading = true;
	  this.studySummaryService.getFilteredStudyData(this.study_submitter_id_name).subscribe((data: any) =>{
			this.studySummaryData = data.getPaginatedUIStudy.uiStudies[0];
			console.log(this.studySummaryData);
			this.study_id = this.studySummaryData.study_id;
			this.suppFileCountsRaw = this.studySummaryData.supplementaryFilesCount;
			this.fileCountsRaw = this.studySummaryData.nonSupplementaryFilesCount;
			this.getFilesCountsPerStudy();
			this.loading = false;
	   });
  }
  
  getProtocol(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getProtocolData(this.study_id).subscribe((data: any) =>{
			this.protocol = data.uiProtocol[0];
			//console.log(this.protocol);
			this.loading = false;
		  });
	  }, 1000);
  }
  
  getPublications(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getPublicationsData(this.study_id).subscribe((data: any) =>{
			this.publications = data.uiPublication;
			//console.log(this.publications);
			this.loading = false;
		  });
	  }, 1000);
  }

  //PDC-2378 - This function will calculate total files counts for
  // raw and supplementary data files
  getFilesCountsPerStudy(){
	this.totalFilesCount = 0;
	if (this.fileCountsRaw != undefined) {
		for (let i = 0; i < this.fileCountsRaw.length; i++) {
			this.totalFilesCount += this.fileCountsRaw[i].files_count;
		}
	}
	this.totalSuppFilesCount = 0;
	if (this.suppFileCountsRaw != undefined) {
		for (let i = 0; i < this.suppFileCountsRaw.length; i++) {
			this.totalSuppFilesCount += this.suppFileCountsRaw[i].files_count;
		}
	}
	/*  this.loading = true;
    //@@@PDC-1123 call ui wrapper API
	  setTimeout(() => {
		  this.studySummaryService.getFilesCounts(this.study_id).subscribe((data: any) => {
			this.fileCountsRaw = data.uiFilesCountPerStudy;
			for (let i = 0; i < this.fileCountsRaw.length; i++) {
				this.totalFilesCount += this.fileCountsRaw[i].files_count;
			}
			console.log(this.fileCountsRaw);
			this.loading = false;
		  });
	  }, 1000);*/
  }

//@@@PDC-1160: Add cases and aliquots to the study summary page
/*API call to get all clinical data */
getAllClinicalData(){
	this.loading = true;
	this.newFilterSelected["study_name"] = this.study_submitter_id_name;
	setTimeout(() => {
		this.studySummaryService.getFilteredClinicalDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
		this.totalRecordsClinical = data.getPaginatedUIClinical.total;
		setTimeout(() => {
			this.studySummaryService.getFilteredClinicalDataPaginated(this.offset, this.totalRecordsClinical, this.sort, this.newFilterSelected).subscribe((data: any) =>{
				this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
				this.totalRecordsClinical = data.getPaginatedUIClinical.total;
				this.loading = false;
			});
		}, 1000);
		});
	}, 1000);
}

//@@@PDC-1883: Add external references to study summary page
showStudySummary(entity_location) {
	var entityLocExtracted = entity_location.split("study/");
	var pdcStudyID = entityLocExtracted[1];
	//Remove any special characters from the string
	pdcStudyID = pdcStudyID.replace(/\s+/g, ' ').trim();
	setTimeout(() => {
	this.studySummaryService.getFilteredStudyData('', pdcStudyID).subscribe((data: any) =>{
		var studyData = data.getPaginatedUIStudy.uiStudies[0];
		if (studyData) {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = false;
			dialogConfig.hasBackdrop = true;
			dialogConfig.width = '80%';
			dialogConfig.height = '95%';
			dialogConfig.data = {
				summaryData: studyData,
			};

			this.loc.replaceState("/study/" + pdcStudyID);
			//No need to navigate to the new outlet, since we are already at the right location, only the study id is changing
			//this.router.navigate([{outlets: {studySummary: ['study-summary', studyData.submitter_id_name]}}], { skipLocationChange: true });
			const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);	
			dialogRef.afterClosed().subscribe((val:any) => {
				console.log("Dialog output:", val);
				//Generate alias URL to hide auxiliary URL details when the previous overlay window was closed and the focus returned to this one
				this.loc.replaceState("/study/" + this.pdcStudyID);
			});
		}
	 });
	}, 1000);
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
/*API call to get all cases data */
getAllCasesData() {
	this.loading = true;
	this.newFilterSelected["study_name"] = this.study_submitter_id_name;
	setTimeout(() => {
		this.studySummaryService.getFilteredCasesPaginated(this.offsetBiospecimen, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			this.totalRecordsBiospecimens = data.getPaginatedUICase.total;
			setTimeout(() => {
				this.studySummaryService.getFilteredCasesPaginated(this.offsetBiospecimen, this.totalRecordsBiospecimens, this.sort, this.newFilterSelected).subscribe((data: any) =>{
					this.filteredCasesData = data.getPaginatedUICase.uiCases;
					this.totalRecordsBiospecimens = data.getPaginatedUICase.total;
					this.loading = false;
				});
		}, 1000);
		});		  
	}, 1000);
}

//@@@PDC-1883: Add external references to study summary page
getEntityReferenceExternalData() {
	this.loading = true;
	setTimeout(() => {
		this.studySummaryService.getEntityReferenceData("study", this.study_id, "external").subscribe((data: any) =>{
			this.entityReferenceExternalData = data.pdcEntityReference;
			this.loading = false;
		});		  
	}, 1000);
	setTimeout(() => {
		this.studySummaryService.getEntityReferenceData("study", this.study_id, "internal").subscribe((internalData: any) =>{
			this.entityReferenceInternalData = internalData.pdcEntityReference;
			console.log(this.entityReferenceInternalData);
			this.loading = false;
		});		  
	}, 1000);
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
showCaseSummary(case_id: string, module: string){
	const dialogConfig = new MatDialogConfig();	
	dialogConfig.disableClose = true;
	dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%'
	if (module == "clinical") {
		var case_index = this.findCaseByClinicalID(case_id);
		dialogConfig.data = {
			summaryData: this.filteredClinicalData[case_index],
		};
		//@@@PDC-2610: Case Summary: Not pulling up Program & Project when viewed under Clinical tab
		//create an alias for study summary overlay window URL in the form [base url]/study/study uuid
		this.loc.replaceState("/case/" + this.filteredClinicalData[case_index].case_id);
	} else if (module == "biospecimen") {
		var case_index = this.findCaseByBiospecimenID(case_id);
		dialogConfig.data = {
			summaryData: this.filteredCasesData[case_index],
		};
		//@@@PDC-2610: Case Summary: Not pulling up Program & Project when viewed under Clinical tab
		//create an alias for study summary overlay window URL in the form [base url]/study/study uuid
		this.loc.replaceState("/case/" + this.filteredCasesData[case_index].case_id);
	}
	this.router.navigate([{outlets: {caseSummary: ['case-summary', case_id]}}], { skipLocationChange: true });
	const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
	dialogRef.afterClosed().subscribe((val:any) => {
			console.log("Dialog output:", val);
			//Generate alias URL to hide auxiliary URL details when the previous overlay window was closed and the focus returned to this one
			this.loc.replaceState("/study/" + this.pdcStudyID);
	});
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-739 Add hyperlink to case id on clinical tab to case summary page
//Finds case details for a case id
findCaseByClinicalID(case_id: string) {
for (let idx = 0; idx < this.filteredClinicalData.length; idx++ ){
	if (this.filteredClinicalData[idx].case_submitter_id === case_id) {
		return idx;
	}
}
return -1;
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-739 Add hyperlink to case id on clinical tab to case summary page
//Finds case details for a case id
findCaseByBiospecimenID(case_id: string) {
for (let idx = 0; idx < this.filteredCasesData.length; idx++ ){
	if (this.filteredCasesData[idx].case_submitter_id === case_id) {
		return idx;
	}
}
return -1;
}
 
close(navigateToHeatmap: boolean, study_name: string = '') {
	this.router.navigate([{outlets: {'studySummary': null}}], { replaceUrl: true });
	this.loc.replaceState(this.router.url);
	console.log("CLOSE study_name: " + study_name);
	if ( navigateToHeatmap ) {
	// Route to the first heatmap
		const navigationExtras: NavigationExtras = {
		queryParams: {
						'StudyName': study_name,
				}
			};
		  //this.router.navigate(['/analysis/' + this.studySubmitterId], navigationExtras);
		  //@@@PDC-2106 use pdc_study_id in heatmap folder
		  //this.router.navigate(['/analysis/' + this.pdcStudyID], navigationExtras);
		  this.router.navigate([]).then( result => { var url= "/pdc/analysis/" + this.pdcStudyID + "?StudyName=" + study_name; 
																	   window.open(url, '_blank'); });
	  }
	this.dialogRef.close();
}

//@@@PDC-2234 - open PDC HeatMap in a separate tab to avoid issues with "back" button
//Will not close study summary upon opening a HeatMap in a separate tab
openHeatMap(study_name: string){
	this.router.navigate([]).then( result => { var url= "/pdc/analysis/" + this.pdcStudyID + "?StudyName=" + study_name; 
																	   window.open(url, '_blank'); });
}

	//@@@PDC-2598 conditional styling of Embargo date
	//If the date is in the future the value should be bold and in italics
	getStyleClass(embargo_date: string){
		if (this.isDateLater(embargo_date) )
			return 'future_embargo_date';
		else {
			return '';
		}
	}
	//Show tooltip if the embargo dat is in the future
	getTooltip(embargo_date:string){
		if (this.isDateLater(embargo_date) ){
			return "Data for this study is under an EMBARGO for publication and/or citation";
		} else {
			return "";
		}
	}
	//Help function that returns true if parameter date is in the future, otherwise false
	private isDateLater(embargo_date: string):boolean{
		var now = new Date;
		var target = new Date(embargo_date);
		if (target > now )
			return true;
		else {
			return false;
		}
	}
	
  ngOnInit() {	  
	  this.readManifest();
	  //@@@PDC-1160: Add cases and aliquots to the study summary page
	  this.clinicalCols = [
		{field: 'case_submitter_id', header: 'Cases Submitter ID'},
		{field: 'external_case_id', header: 'External Case ID'},
		{field: 'ethnicity', header: 'Ethnicity'},
		{field: 'gender', header: 'Gender'},
		{field: 'race', header: 'Race'},
		{field: 'morphology', header: 'Morphology'},
		{field: 'primary_diagnosis', header: 'Primary Diagnosis'},
		{field: 'site_of_resection_or_biopsy', header: 'Site of Resection or Biopsy'},
		{field: 'tissue_or_organ_of_origin', header: 'Tissue or Organ of Origin'},
		{field: 'tumor_grade', header: 'Tumor Grade'},
		{field: 'tumor_stage', header: 'Tumor Stage'}
	  ];
	  this.biospecimenCols = [
		{field: 'aliquot_submitter_id', header: 'Aliquot'},
		{field: 'sample_submitter_id', header: 'Sample'},
		{field: 'case_submitter_id', header: 'Case'},
		{field: 'project_name', header: 'Project'},
		{field: 'sample_type', header: 'Sample Type'},
		{field: 'primary_site', header: 'Primary Site' },
		{field: 'disease_type', header: 'Disease Type'}
	  ];
	  this.studyExperimentDesignTableCommonCols = [
		// {field: 'study_run_metadata_id', header: 'Study Run Metadata ID'},
		{field: 'study_run_metadata_submitter_id', header: 'Study Run Metadata Submitter ID'},
/* 		{field: 'experiment_number', header: 'Experiment Number'},
		{field: 'experiment_type', header: 'Experiment Type'}, */
		{field: 'plex_dataset_name', header: 'Plex Dataset Name'},
		// {field: 'acquisition_type', header: 'Acquisition Type'},
		{field: 'number_of_fractions', header: 'Number of Fractions'}
		// {field: 'analyte', header: 'Analyte'}
	  ];
  }


  //@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
  //Return link URL for external case ID
  fetchUrl (externalCaseID: string) {
	if (externalCaseID) {
		let externalCaseIDSplit = externalCaseID.split(':');
		let url = this.externalCaseMap.find(x => (x.id).toUpperCase() == externalCaseIDSplit[0].toUpperCase()).url;
		if (url) return url + externalCaseIDSplit[1].replace(/\s/g, ""); else return '';
	} else {
	  return '';
	}
}

//@@@PDC-1987: Update clinical tab to use new external reference API
//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
//Get Image icon for the external Case ID
getIcon(reference_resource_shortname: string) {
	if (reference_resource_shortname) {
		let imageUrl = this.externalCaseMap.find(x => (x.id).toUpperCase() == reference_resource_shortname.toUpperCase()).imageUrl;
		if (imageUrl) return imageUrl; else return '';
	} else {
		return '';
	}
  }

//@@@PDC-1987: Update clinical tab to use new external reference API
//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
displayTextforExternalID(externalCaseID: string, locationURL: string) {
	if (locationURL) return ''; else return externalCaseID;
}

//@@@PDC-1219: Add a new experimental design tab on the study summary page
replaceAll(str,replaceWhat,replaceTo){
	replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	var re = new RegExp(replaceWhat, 'g');
	return str.replace(re,replaceTo);
}

//@@@PDC-1219: Add a new experimental design tab on the study summary page
/* Small helper function to determine whether the download button should be disabled or not */
isDownloadDisabled(){
	if (this.selectedExperimentalStudies) {
		if (this.selectedExperimentalStudies.length > 0) {
			return false;
		}
		else {
			return true;
		}
	}
	else {
		return true;
	}
}

//@@@PDC-1219: Add a new experimental design tab on the study summary page
studyTableExportCSV(dt) {
	let headerCols = [];
	let colValues = [];
	for (var i=0; i< this.studyExperimentDesignTableCols.length; i++) {
		headerCols.push(this.studyExperimentDesignTableCols[i]['header']);
		colValues.push(this.studyExperimentDesignTableCols[i]['field']);
	}
	let exportValues =  _.cloneDeep(this.studyExperimentalDesign);
	for (let exportVal of exportValues) {
		var changedVal = "";
		for (let colValue of colValues) {
			//changedVal = exportVal[colValue].replace(/<[^>]*>/g, '');
			changedVal = exportVal[colValue].replace('<div>', '\r\n');
			changedVal = changedVal.replace('</div>', '');
			exportVal[colValue] = changedVal;
		}
	}
 	let csvOptions = {
		headers: headerCols
	};
	let exportFileObject = JSON.parse(JSON.stringify(exportValues, colValues));			
	new ngxCsv(exportFileObject, this.getCsvFileName(), csvOptions);	 
}

private getCsvFileName(): string {
	let csvFileName = "PDC_study_experimental_";
	const currentDate: Date = new Date();
	let month: string = "" + (currentDate.getMonth() + 1);
	csvFileName += this.convertDateString(month);
	let date: string = "" + currentDate.getDate();
	csvFileName += this.convertDateString(date);
	csvFileName += "" + currentDate.getFullYear();
	let hour: string = "" + currentDate.getHours();
	csvFileName += "_" + this.convertDateString(hour);
	let minute: string = "" + currentDate.getMinutes();
	csvFileName += this.convertDateString(minute);
	let second: string = "" + currentDate.getSeconds();
	csvFileName += this.convertDateString(second);
	return csvFileName;
}

private convertDateString(value: string): string {
	if (value.length === 1) {
	return "0" + value;
	} else {
	return value;
	}
}

//@@@PDC-1219: Add a new experimental design tab on the study summary page
getStudyExperimentalDesign() {
	this.loading = true;
	var aliquotSubmitterID = '';
	var experimentType = '';
	setTimeout(() => {
		//'aliquot_is_ref = Yes' denotes if a aliquot is the reference. Fetch the aliquot submitter ID from biospecimenPerStudy table 
		//for which 'aliquot_is_ref = Yes'.
		//Use this as a reference and map it with the data in studyExperimentDesignMap API and extract the denominator for the "Ratio" column.
		this.studySummaryService.getBiospecimenPerStudy(this.study_id).subscribe((biospecimenData: any) =>{
			this.biospecimenPerStudy = biospecimenData.biospecimenPerStudy;
			for(let biospecimen of biospecimenData.biospecimenPerStudy){
				if (biospecimen["aliquot_is_ref"] == "yes") {	  
					aliquotSubmitterID = biospecimen["aliquot_submitter_id"];
				}
			}
			setTimeout(() => {
				this.studySummaryService.getStudyExperimentalDesign(this.study_id).subscribe((data: any) =>{
					this.studyExperimentalDesign = data.studyExperimentalDesign;
					let localSelectedExpStudies = [];
					let colValues = [];
					for(let study of this.studyExperimentalDesign) {
						//if the export column column does not value, set it to empty
						for (var i=0;i<colValues.length;i++) {
						  if (!study[colValues[i]]) {
								study[colValues[i]] = '';
							}
						}
						localSelectedExpStudies.push(study);
					}
					this.selectedExperimentalStudies = localSelectedExpStudies;
					//console.log(this.studyExperimentalDesign);
 					for(let studyExpData of data.studyExperimentalDesign){
						experimentType = studyExpData["experiment_type"];
					}
					var colsSpecificToExpType = [];	
					let colsExpType = this.studyExperimentDesignMap.find(x => (x.id).toUpperCase() == experimentType.toUpperCase()).cols; 
					let colsSpecificToExpTypeArr = colsExpType.split(",");	
					if (colsExpType != "") {
						this.studyExperimentDesignTableHeaderCol = "Reagent Label to Biospecimen Mapping";
						if (colsSpecificToExpTypeArr.includes("label_free")) {
							this.studyExperimentDesignTableHeaderCol = "Biospecimen Mapping";
						}				  
						for (let col of colsSpecificToExpTypeArr) {
							let newCols = {};
							let colval = _.assign(newCols, {'field': col}, {'header': col});
							colsSpecificToExpType.push(colval);
						}
					} else {
						this.studyExperimentalDesign = data.studyExperimentalDesign;
						colsSpecificToExpTypeArr = [];
					}				
					for (let studyExpData of data.studyExperimentalDesign) {
						var colValSpecificToExpType = "";
						for (let col of colsSpecificToExpTypeArr) {
							let colsSpecificVal = "";
							colsSpecificVal = studyExpData[col];
							//Access the biospecimen whose aliquot submitter ID is the same and 
							//compose the column value with the case submitter ID and sample Type
							for(let biospecimen of this.biospecimenPerStudy){
								if (colsSpecificVal == biospecimen["aliquot_submitter_id"]) {
									let caseSubmitterID = biospecimen["case_submitter_id"];
									let sampleType = biospecimen["sample_type"];
									colValSpecificToExpType = caseSubmitterID + "<div>" + sampleType + "</div>";
								}
							}
							if (colValSpecificToExpType != '') {
								studyExpData[col] = colValSpecificToExpType;
							}
						}
						if (colValSpecificToExpType != '') {
							this.studyExperimentalDesign = data.studyExperimentalDesign;
						}
					}
					this.studyExperimentDesignTableExtraCols = colsSpecificToExpType;
					if (colsSpecificToExpType.length > 0) {
						this.studyExperimentDesignTableCols = _.concat(this.studyExperimentDesignTableCommonCols, colsSpecificToExpType);
					} else {
						this.studyExperimentDesignTableCols = this.studyExperimentDesignTableCommonCols;
					}
				});
			}, 1000);
		});
		}, 1000);
		this.loading = false;
}

}
