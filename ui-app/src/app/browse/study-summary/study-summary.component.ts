
import {of as observableOf,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog} from '@angular/material';
import { StudySummaryService } from './study-summary.service';
import { AllStudiesData, Filter, WorkflowMetadata, ProtocolData, PublicationData, FilesCountsPerStudyData } from '../../types';
import { StudySummaryOverlayService } from './study-summary-overlay-window/study-summary-overlay-window.service';
import { AllClinicalData, AllCasesData } from '../../types';
import { CheckboxModule } from 'primeng/checkbox';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';

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
export class StudySummaryComponent implements OnInit {

  study_id: string;
  study_submitter_id_name: string;
  studySummaryData: AllStudiesData; 
  workflowData: WorkflowMetadata;
  protocol: ProtocolData;
  publications: PublicationData[] = [];
  fileCountsRaw: FilesCountsPerStudyData[];
  fileTypesCounts: any; 
  totalFilesCount: number = 0;
  loading: boolean = false;
  heatmapAvailable = false;
  mapData: any[];
  responseStatus: any;
	protocol_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Protocol';
	workflow_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Workflow Metadata';
	description_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Description';
	dua_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=DUA';
	aliquot_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Aliquot';
	clinical_help_url = environment.dictionary_base_url + 'dictionaryitem.html?eName=Case';
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

  constructor(private route: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private studySummaryService: StudySummaryService,
				private dialogRef: MatDialogRef<StudySummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public studyData: any, private studySummaryOverlayWindow: StudySummaryOverlayService, private dialog: MatDialog,) {
    
	//console.log(studyData);
	//@@@PDC-612 display all data categories
	this.fileTypesCounts = {RAW: 0, txt_psm: 0, txt: 0, pdf: 0, mzML: 0, doc: 0, mzIdentML: 0}; 
	this.study_id = studyData.summaryData.study_submitter_id;
	this.study_submitter_id_name = studyData.summaryData.submitter_id_name;
	this.studySummaryData = studyData.summaryData;
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
	this.getFilesCountsPerStudy();
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
	}];
	this.getAllClinicalData();
	this.getAllCasesData();
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
				//If the current date is with in the embargo date, display the DUA with a 'accept' button
				if (currentDate < this.studySummaryData.embargo_date) {
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
		const manifest_file = 'assets/data-folder/' + this.study_id + '/manifest.json';
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
	const manifest_file = 'assets/data-folder/' + this.study_id + '/manifest.json';
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
			//console.log(this.studySummaryData);
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

  getFilesCountsPerStudy(){
	  this.loading = true;
    //@@@PDC-1123 call ui wrapper API
	  setTimeout(() => {
		  this.studySummaryService.getFilesCounts(this.study_id).subscribe((data: any) => {
			this.fileCountsRaw = data.uiFilesCountPerStudy;
			for (let i = 0; i < this.fileCountsRaw.length; i++) {
				this.totalFilesCount += this.fileCountsRaw[i].files_count;
			}
			//console.log(this.fileCountsRaw);
			this.loading = false;
		  });
	  }, 1000);
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
	} else if (module == "biospecimen") {
		var case_index = this.findCaseByBiospecimenID(case_id);
		dialogConfig.data = {
			summaryData: this.filteredCasesData[case_index],
		};
	}
	this.router.navigate([{outlets: {caseSummary: ['case-summary', case_id]}}]);
	const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
	dialogRef.afterClosed().subscribe(
		val => console.log("Dialog output:", val)
	);
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
	this.router.navigate([{outlets: {'studySummary': null}}]);
	if ( navigateToHeatmap ) {
	// Route to the first heatmap
		const navigationExtras: NavigationExtras = {
		queryParams: {
						'StudyName': study_name,
				}
			};
		  this.router.navigate(['/analysis/' + this.study_id], navigationExtras);
	  }

	this.dialogRef.close();
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

//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
//Get Image icon for the external Case ID
getIcon(externalCaseID: string) {
  if (externalCaseID) {
	  let externalCaseIDSplit = externalCaseID.split(':');
	  let imageUrl = this.externalCaseMap.find(x => (x.id).toUpperCase() == externalCaseIDSplit[0].toUpperCase()).imageUrl;
	  if (imageUrl) return imageUrl; else return '';
  } else {
	  return '';
  }
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
displayTextforExternalID(externalCaseID: string) {
  if (externalCaseID) {
	  let externalCaseIDSplit = externalCaseID.split(':');
	  let url = this.externalCaseMap.find(x => (x.id).toUpperCase() == externalCaseIDSplit[0].toUpperCase()).url;
	  if (url) return ''; else return externalCaseID;
  }
}

}
