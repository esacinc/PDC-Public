
import {of as observableOf,  Observable } from 'rxjs';

import {catchError,  take } from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog} from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { StudySummaryService } from './study-summary.service';
import { AllStudiesData, Filter, WorkflowMetadata, ProtocolData, PublicationData,
		StudyExperimentalDesign, BiospecimenPerStudy, EntityReferencePerStudy, FileCountsForStudyPage } from '../../types';
import { StudySummaryOverlayService } from './study-summary-overlay-window/study-summary-overlay-window.service';
import { AllClinicalData, AllCasesData } from '../../types';
import { CheckboxModule } from 'primeng/checkbox';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { FilesOverlayComponent } from '../browse-by-file/files-overlay.component';
import * as _ from 'lodash';
import { ngxCsv } from "ngx-csv/ngx-csv";
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';


//const fileExists = require('file-exists');

import {environment} from '../../../environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
//@@@PDC-2939 update study summary page to display other versions
//@@@PDC-2998 - update UI to include API changes for study versions new feature
//@@@PDC-3174: Study Summary overlay window opens twice for studies whose embargo date is N/A
//@@@PDC-3474: Disable all related studies and cases links for older versions of a study in study summary overlay window
//@@@PDC-3478 open files data table in overlay window from study and case summaries
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
	dua_help_url = "/pdc/data-use-guidelines";
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
	studyVersion: string;
	oldVersionFlag = false;
	source: string = "";
	frozenClinicalColumns = [];
	studyExperimentDesignTableFrozenCols = [];
	biospecimenFrozenCols = [];
	biospecimenExportCols = [];
	clinicalExportCols = [];
	exposureCols = [];
	followUpCols = [];
	isMetabolomics = false;

    constructor(private route: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private studySummaryService: StudySummaryService, private loc:Location,
				private dialogRef: MatDialogRef<StudySummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public studyData: any, private studySummaryOverlayWindow: StudySummaryOverlayService, private dialog: MatDialog,) {

	console.log(studyData);
	//@@@PDC-3474 check if the cirrent version is an old version of the study
	if (studyData.oldVersion) {
		this.oldVersionFlag = studyData.oldVersion;
	}
	//@@@PDC-4725: Set the source parameter in the UI calls to fetch details of a search result
	if (studyData && studyData.source) {
		this.source = studyData.source;
	}
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
	} else {
		//@@@PDC-2955 Embargo Date of Study does not show as N/A when clicked from Related PDC Studies
		if (this.studySummaryData.embargo_date === null || this.studySummaryData.embargo_date === ""){
			this.studySummaryData.embargo_date = "N/A";
		}
	}


	console.log(this.studySummaryData);
	if (this.studySummaryData.versions.length === 0 || this.oldVersionFlag) {
		this.studyVersion = "1";
	} else {
		this.studyVersion = this.studySummaryData.versions[0].number;
		console.log("Setting versions to " + this.studyVersion);
	}
	//@@@PDC-6794 get unfiltered cases count
	this.getUnfilteredCaseCount(this.pdcStudyID, this.studyVersion);
	console.log("Total cases: " + this.studySummaryData.cases_count);
	console.log("Total aliquots: " + this.studySummaryData.aliquots_count);
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
	//@@@PDC-3758: Handle channels layout for TMT6 in Study Summary Experimental Design tab
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
		'id': "TMT6",
		'cols': "tmt_126,tmt_127n,tmt_128c,tmt_129n,tmt_130c,tmt_131"
	}, {
		'id': "TMT10",
		'cols': "tmt_126,tmt_127n,tmt_127c,tmt_128n,tmt_128c,tmt_129n,tmt_129c,tmt_130n,tmt_130c,tmt_131"
	}, {
		'id': "TMT11",
		'cols': "tmt_126,tmt_127n,tmt_127c,tmt_128n,tmt_128c,tmt_129n,tmt_129c,tmt_130n,tmt_130c,tmt_131,tmt_131c"
	}, {
		'id': "TMT16",
		'cols': "tmt_126,tmt_127n,tmt_127c,tmt_128n,tmt_128c,tmt_129n,tmt_129c,tmt_130n,tmt_130c,tmt_131,tmt_131c,tmt_132n,tmt_132c,tmt_133n,tmt_133c,tmt_134n"
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
				//@@@PDC-2970  all studies with embargo date expired or N/A should have text with Note under DUA tab
				if (this.studySummaryData.embargo_date != "N/A" && currentDate > this.studySummaryData.embargo_date) {
					this.duaAvailable = false;
				}
			}
			//@@@PDC-2970 Studies with Embargo data as N/A are missing Embargo Note in Study Summary DUA tab.
			if (!this.studySummaryData.embargo_date || this.studySummaryData.embargo_date == "N/A" || this.studySummaryData.embargo_date == "")
			{
				this.duaAvailable = false;
			}
		}, 100);
	}

  //Helper function that is called when a different version is chosen on study summary window
  showVersionStudySummary(version: string){
	  console.log("Setting version to " + version + " most recent study version: " + this.studySummaryData.versions[0].number);
	  var oldVersion = false;
	  //@@@PDC-3474: Disable all related studies and cases links for older versions of a study in study summary overlay window
	  if (this.studySummaryData.versions[0].number > version ) {
		  oldVersion = true;
	  }
	  this.showStudySummary('study/' + this.pdcStudyID, version, oldVersion);
  }

  getWorkflowDataSummary(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getWorkflowMetadata(this.study_id, this.source).subscribe((data: any) =>{
			this.workflowData = data.uiWorkflowMetadata[0];
			// console.log(this.workflowData);
			this.loading = false;
		  });
	  }, 1000);
  }

  getManifestFile() {
		//const manifest_file = 'assets/data-folder/' + this.studySummaryData.study_submitter_id + '/manifest.json';
		//@@@PDC-2106 use pdc_study_id in heatmap folder
		//const manifest_file = 'assets/data-folder/' + this.pdcStudyID + '/manifest.json';
		//@@@PDC-3172 use study_id in heatmap folder name
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
	//@@@PDC-3172 use study_id in heatmap folder name
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
	  this.studySummaryService.getFilteredStudyData(this.study_submitter_id_name, '', '', this.source).subscribe((data: any) =>{
			this.studySummaryData = data.getPaginatedUIStudy.uiStudies[0];
			this.studySummaryData.study_description = this.studySummaryData.study_description.replace(/<a/g,'<a target="_blank" ');
			console.log(this.studySummaryData);
			this.study_id = this.studySummaryData.study_id;
			this.suppFileCountsRaw = this.studySummaryData.supplementaryFilesCount;
			this.fileCountsRaw = this.studySummaryData.nonSupplementaryFilesCount;
			this.getFilesCountsPerStudy();
			this.loading = false;
			//@@@PDC-2912 - show "N/A" instead of empty embargo date when opening study summary via search box or direct url
			if (this.studySummaryData.embargo_date === null || this.studySummaryData.embargo_date === ""){
				this.studySummaryData.embargo_date = "N/A";
			}
			//@@@PDC-3404 Search box and Browse page pulled different versions of a versioned study summary
			//Making sure here that the correct study version is set when the study summary opens from a search box
			if ((this.studySummaryData.versions.length > 1) ||
			(this.studySummaryData.versions.length == 1 && Number(this.studySummaryData.versions[0].number) > 1)) {
				this.studyVersion = this.studySummaryData.versions[0].number;
				console.log("Setting versions to " + this.studyVersion);
			}
	   });
  }

  getProtocol(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getProtocolData(this.study_id, this.source).subscribe((data: any) =>{
			this.protocol = data.uiProtocol[0];
			//console.log(this.protocol);
			this.loading = false;
		  });
	  }, 1000);
  }

  getPublications(){
	  this.loading = true;
	  setTimeout(() => {
		  this.studySummaryService.getPublicationsData(this.study_id, this.source).subscribe((data: any) =>{
			this.publications = data.uiPublication;
			console.log(this.publications);
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
	if (this.fileCountsRaw != undefined) {
		this.sortDataCategoriesInOrder();
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

//@@@PDC-2552: Study Summary: Place Data Category terms in a defined order instead of alphabetical or numerical
sortDataCategoriesInOrder() {
	var order = ["Raw Mass Spectra","Processed Mass Spectra", "Peptide Spectral Matches", "Peptide Spectral Matches", "Protein Assembly", "Quality Metrics", "Quality Metrics"];
	for (var obj in this.fileCountsRaw) {
		let entityObj = "";
		entityObj = this.fileCountsRaw[obj]["data_category"].toLowerCase();
		//Order elements based on the suggested order
		if (order.some(ele => entityObj.includes(ele))) {
			this.fileCountsRaw[obj]["data_category"] = order.find(ele => entityObj.includes(ele));
		}
	}
	this.fileCountsRaw = this.fileCountsRaw.sort((a, b) => {
		return (
			order.indexOf(a.data_category) - order.indexOf(b.data_category)
		);
	});
}

versionCheck() {
	return (this.studySummaryData.versions.length > 1) || (this.studySummaryData.versions.length == 1 && Number(this.studySummaryData.versions[0].number) > 1)
}

//@@@PDC-5206: Present Diagnosis to Sample relationship on PDC Browser
populateAssociatedSampleInfo(filteredClinicalData) {
	if (filteredClinicalData.length > 0) {
		for (var i in filteredClinicalData) {
			if (filteredClinicalData[i].samples && typeof(filteredClinicalData[i].samples) != 'string' && filteredClinicalData[i].samples.length > 0) {
				let associatedSamples = filteredClinicalData[i]['samples'];
				let arr = [];
				for(let key in associatedSamples){
					arr.push(associatedSamples[key]['sample_submitter_id']);
				}
				let associatedsampleIds = arr.join(", ");
				filteredClinicalData[i]['samples'] = associatedsampleIds;
			} else if (filteredClinicalData[i].samples) {
				filteredClinicalData[i]['samples'] = null;
			}
		}

		for (var i in filteredClinicalData) {
			if (filteredClinicalData[i].samples && filteredClinicalData[i].samples.length > 0
				&& typeof(filteredClinicalData[i].samples) == 'string') {
				//@@@PDC-6397 handle multiple samples
				if (filteredClinicalData[i].samples.includes(',')){
					console.log("Multi Samples found: "+filteredClinicalData[i].samples);
					let tempSamples = filteredClinicalData[i].samples;
					let newAnnotation = "Samples of "+ tempSamples + " are associated with this clinical record. "
					console.log("Annotation for multi samples: "+newAnnotation);
					filteredClinicalData[i]['annotation'] = newAnnotation;
				}
				else if (!filteredClinicalData[i].samples.includes(',')) {
					console.log("Add annotation for "+filteredClinicalData[i].samples);
					filteredClinicalData[i]['annotation'] = "The sample "+filteredClinicalData[i].samples+" is associated with this clinical record.";
				}
			}
		}
	}
}

//@@@PDC-1160: Add cases and aliquots to the study summary page
/*API call to get all clinical data */
getAllClinicalData(){
	this.loading = true;
	this.newFilterSelected["study_name"] = this.study_submitter_id_name;
	setTimeout(() => {
		this.studySummaryService.getFilteredClinicalDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected, this.source).subscribe((data: any) =>{
		this.totalRecordsClinical = data.getPaginatedUIClinical.total;
		setTimeout(() => {
			this.studySummaryService.getFilteredClinicalDataPaginatedPost(this.offset, this.totalRecordsClinical, this.sort, this.newFilterSelected, this.source).pipe(take(1)).subscribe((data: any) =>{
				this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
				this.populateAssociatedSampleInfo(this.filteredClinicalData);
				this.totalRecordsClinical = data.getPaginatedUIClinical.total;
				this.loading = false;
				//this.makeRowsSameHeight();
			});
		}, 1000);
		});
	}, 1000);
}

//@@@PDC-6794 get unfiltered cases count
getUnfilteredCaseCount(pdcStudyID, version) {
	setTimeout(() => {
	this.studySummaryService.getFilteredStudyData('', pdcStudyID, version, this.source).pipe(take(1)).subscribe((data: any) =>{
		this.studySummaryData.cases_count = data.getPaginatedUIStudy.uiStudies[0].cases_count;
		this.studySummaryData.aliquots_count = data.getPaginatedUIStudy.uiStudies[0].aliquots_count;
		});
	}, 1000);
}

//@@@PDC-1883: Add external references to study summary page
//PDC-2998 - update UI to include API changes for study versions new feature
showStudySummary(entity_location, version = '', oldVersionFlag = false) {
	console.log("Openining study summary " + entity_location + " version: " + version);
	var entityLocExtracted = entity_location.split("study/");
	var pdcStudyID;
	if (entityLocExtracted[1]){
		pdcStudyID = entityLocExtracted[1];
	}
	else {
		pdcStudyID = entityLocExtracted[0];
	}
	//Remove any special characters from the string
	pdcStudyID = pdcStudyID.replace(/\s+/g, ' ').trim();
	//If version parameter is not set up than a referenced study ID was clicked on the study summary overlay window
	if (!version) {
		//currentVersion session storage variable keeps the version of current study,
		//if referenced study is clicked than currentVersion should be cleared
		//sessionStorage.removeItem('currentVersion');
	}
	setTimeout(() => {
	this.studySummaryService.getFilteredStudyData('', pdcStudyID, version, this.source).pipe(take(1)).subscribe((data: any) =>{
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
				oldVersion: oldVersionFlag
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
		this.studySummaryService.getFilteredCasesPaginated(this.offsetBiospecimen, this.limit, this.sort, this.newFilterSelected, this.source).subscribe((data: any) =>{
			this.totalRecordsBiospecimens = data.getPaginatedUICase.total;
			setTimeout(() => {
				this.studySummaryService.getFilteredCasesPaginated(this.offsetBiospecimen, this.totalRecordsBiospecimens, this.sort, this.newFilterSelected, this.source).subscribe((data: any) =>{
					this.filteredCasesData = data.getPaginatedUICase.uiCases;
					this.totalRecordsBiospecimens = data.getPaginatedUICase.total;
					//this.makeRowsSameHeight();
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
		this.studySummaryService.getEntityReferenceData("study", this.study_id, "external", this.source).subscribe((data: any) =>{
			this.entityReferenceExternalData = data.uiPdcEntityReference;
			this.loading = false;
		});
	}, 1000);
	setTimeout(() => {
		this.studySummaryService.getEntityReferenceData("study", this.study_id, "internal", this.source).subscribe((internalData: any) =>{
			this.entityReferenceInternalData = internalData.uiPdcEntityReference;
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

//@@@PDC-3392 open files for a specific study in an overlay window
//@@@PDC-3928 when downloading files for specific study version have to provide study UUID
showFilesOverlay(submitter_id_name, data_category_val, file_type_val) {
	const dialogConfig = new MatDialogConfig();
	dialogConfig.disableClose = true;
	dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%';
	var versioned_study = (this.studySummaryData.versions.length > 1) || (this.studySummaryData.versions.length == 1 && Number(this.studySummaryData.versions[0].number) > 1);
	dialogConfig.data = {
			summaryData: {study_name: submitter_id_name, study_id: this.study_id, data_category: data_category_val, file_type: file_type_val, versions: versioned_study, acquisition_type: "", experiment_type:"", currentVersion: this.studyVersion},
	};
	this.router.navigate([{outlets: {filesOverlay: ['files-overlay', this.study_id]}}], { skipLocationChange: true });
	const dialogRef = this.dialog.open(FilesOverlayComponent, dialogConfig);
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
	this.router.navigate([{outlets: {'studySummary': null, 'filesOverlay': null}}], { replaceUrl: true });
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
		  //@@@PDC-3172 use study_id in heatmap folder name
		  this.router.navigate([]).then( result => { var url= "/pdc/analysis/" + this.study_id +"?StudyName=" + study_name;
		  window.open(url, '_blank'); });
	  }
	this.dialogRef.close();
}

//@@@PDC-2234 - open PDC HeatMap in a separate tab to avoid issues with "back" button
//Will not close study summary upon opening a HeatMap in a separate tab
openHeatMap(study_name: string){
	//@@@PDC-3172 use study_id in heatmap folder name
	this.router.navigate([]).then( result => { var url= "/pdc/analysis/" + this.study_id + "?StudyName=" + study_name;
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
	  this.frozenClinicalColumns = [
		{field: 'case_submitter_id', header: 'Cases Submitter ID'}
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
	  this.biospecimenFrozenCols = [
		{field: 'aliquot_submitter_id', header: 'Aliquot'},
	  ];
	  this.studyExperimentDesignTableFrozenCols = this.studyExperimentDesignTableCommonCols = [
		// {field: 'study_run_metadata_id', header: 'Study Run Metadata ID'},
		{field: 'study_run_metadata_submitter_id', header: 'Run Metadata ID'},
/* 		{field: 'experiment_number', header: 'Experiment Number'},
		{field: 'experiment_type', header: 'Experiment Type'}, */
		// {field: 'acquisition_type', header: 'Acquisition Type'},
		{field: 'number_of_fractions', header: 'Number of Fractions'}
		// {field: 'analyte', header: 'Analyte'}
	  ];
	  this.biospecimenExportCols = [
		{field: 'aliquot_id', header: 'Aliquot ID'},
		{field: 'aliquot_submitter_id', header: 'Aliquot Submitter ID'},
		{field: 'sample_id', header: 'Sample ID'},
		{field: 'sample_submitter_id', header: 'Sample Submitter ID'},
		{field: 'case_id', header: 'Case ID'},
		{field: 'case_submitter_id', header: 'Case Submitter ID'},
		{field: 'project_name', header: 'Project Name'},
		{field: 'sample_type', header: 'Sample Type'},
		{field: 'primary_site', header: 'Primary Site' },
		{field: 'disease_type', header: 'Disease Type'},
		{field: 'aliquot_is_ref', header: 'Aliquot Is Ref'},
		{field: 'aliquot_status', header: 'Aliquot Status'},
		{field: 'aliquot_quantity', header: 'Aliquot Quantity'},
		{field: 'aliquot_volume', header: 'Aliquot Volume'},
		{field: 'amount', header: 'Amount'},
		{field: 'analyte_type', header: 'Analyte Type'},
		{field: 'concentration', header: 'Concentration'},
		{field: 'case_status', header: 'Case Status'},
		{field: 'sample_status', header: 'Sample Status'},
		{field: 'sample_is_ref', header: 'Sample Is Ref'},
		{field: 'biospecimen_anatomic_site', header: 'Biospecimen Anatomic Site'},
		{field: 'biospecimen_laterality', header: 'Biospecimen Laterality'},
		{field: 'composition', header: 'Composition'},
		{field: 'current_weight', header: 'Current Weight'},
		{field: 'days_to_collection', header: 'Days To Collection'},
		{field: 'days_to_sample_procurement', header: 'Days To Sample Procurement'},
		{field: 'diagnosis_pathologically_confirmed', header: 'Diagnosis Pathologically Confirmed'},
		{field: 'freezing_method', header: 'Freezing Method'},
		{field: 'initial_weight', header: 'Initial Weight'},
		{field: 'intermediate_dimension', header: 'Intermediate Dimension'},
		{field: 'longest_dimension', header: 'Longest Dimension'},
		{field: 'method_of_sample_procurement', header: 'Method Of Sample Procurement'},
    //@@@PDC-5174: misspelled property pathology_report_uuid
		{field: 'pathology_report_uuid', header: 'Pathology Report UUID'},
		{field: 'preservation_method', header: 'Preservation Method'},
		{field: 'sample_type_id', header: 'Sample Type id'},
    	//@@@PDC-4601: Two New Sample properties cannot be viewed on the Case summary modal window
    	{field: 'sample_ordinal', header: 'Sample Ordinal'},
		{field: 'shortest_dimension', header: 'Shortest Dimension'},
		{field: 'time_between_clamping_and_freezing', header: 'Time Between Clamping And Freezing'},
		{field: 'time_between_excision_and_freezing', header: 'Time Between Excision and Freezing'},
    	//@@@PDC-4601: Two New Sample properties cannot be viewed on the Case summary modal window
    	{field: 'tissue_collection_type', header: 'Tissue Collection Type'},
		{field: 'tissue_type', header: 'Tissue Type'},
		{field: 'tumor_code', header: 'Tumor Code'},
		{field: 'tumor_code_id', header: 'Tumor Code ID'},
		{field: 'tumor_descriptor', header: 'Tumor Descriptor'},
		{field: 'program_name', header: 'Program Name'},
	  ];
	  this.clinicalExportCols = [
		{field: 'case_id', header: 'Case ID'},
		{field: 'case_submitter_id', header: 'Cases Submitter ID'},
		{field: 'samples', header: 'Related Entities'},
    {field: 'sample_annotation', header: 'Annotation'},
		{field: 'genomicImagingData', header: 'Genomic and Imaging Data Resource'},
		{field: 'ethnicity', header: 'Ethnicity'},
		{field: 'gender', header: 'Gender'},
		{field: 'race', header: 'Race'},
		{field: 'morphology', header: 'Morphology'},
		{field: 'primary_diagnosis', header: 'Primary Diagnosis'},
		{field: 'site_of_resection_or_biopsy', header: 'Site of Resection or Biopsy'},
		{field: 'tissue_or_organ_of_origin', header: 'Tissue or Organ of Origin'},
		{field: 'tumor_grade', header: 'Tumor Grade'},
		{field: 'tumor_stage', header: 'Tumor Stage'},
		{field: 'age_at_diagnosis', header: 'Age at Diagnosis'},
		{field: 'classification_of_tumor', header: 'Classification of Tumor'},
		{field: 'days_to_recurrence', header: 'Days to Recurrence'},
		{field: 'disease_type', header: 'Disease Type'},
		{field: 'primary_site', header: 'Primary Site'},
		{field: 'program_name', header: 'Program Name'},
		{field: 'project_name', header: 'Project Name'},
		{field: 'status', header: 'Status'},
		{field: 'cause_of_death', header: 'Cause of Death'},
		{field: 'days_to_birth', header: 'Days to Birth'},
		{field: 'days_to_death', header: 'Days to Death'},
		{field: 'vital_status', header: 'Vital Status'},
		{field: 'year_of_birth', header: 'Year of Birth'},
		{field: 'year_of_death', header: 'Year of Death'},
		{field: 'days_to_last_follow_up', header: 'Days to Last Follow Up'},
		{field: 'days_to_last_known_disease_status', header: 'Days to Last Known Disease Status'},
		{field: 'last_known_disease_status', header: 'Last Known Disease Status'},
		{field: 'progression_or_recurrence', header: 'Progression or Recurrence'},
		{field: 'prior_malignancy', header: 'Prior Malignancy'},
		{field: 'ajcc_clinical_m', header: 'AJCC Clinical M'},
		{field: 'ajcc_clinical_n', header: 'AJCC Clinical N'},
		{field: 'ajcc_clinical_stage', header: 'AJCC Clinical Stage'},
		{field: 'ajcc_clinical_t', header: 'AJCC Clinical T'},
		{field: 'ajcc_pathologic_m', header: 'AJCC Pathologic M'},
		{field: 'ajcc_pathologic_n', header: 'AJCC Pathologic N'},
		{field: 'ajcc_pathologic_stage', header: 'AJCC Pathologic Stage'},
		{field: 'ajcc_pathologic_t', header: 'AJCC Pathologic T'},
		{field: 'ajcc_staging_system_edition', header: 'AJCC Staging System Edition'},
		{field: 'ann_arbor_b_symptoms', header: 'Ann Arbor B Symptoms'},
		{field: 'ann_arbor_clinical_stage', header: 'Ann Arbor Clinical Stage'},
		{field: 'ann_arbor_extranodal_involvement', header: 'Ann Arbor Extranodal Involvement'},
		{field: 'ann_arbor_pathologic_stage', header: 'Ann Arbor Pathologic Stage'},
		{field: 'best_overall_response', header: 'Best Overall Response'},
		{field: 'burkitt_lymphoma_clinical_variant', header: 'Burkitt Lymphoma Clinical Variant'},
		{field: 'circumferential_resection_margin', header: 'Circumferential Resection Margin'},
		{field: 'colon_polyps_history', header: 'Colon Polups History'},
		{field: 'days_to_best_overall_response', header: 'Days to Best Overall'},
		{field: 'days_to_diagnosis', header: 'Days to Diagnosis'},
		{field: 'days_to_hiv_diagnosis', header: 'Days to HIV Diagnosis'},
		{field: 'days_to_new_event', header: 'Days to New Event'},
		{field: 'figo_stage', header: 'Figo Stage'},
		{field: 'hiv_positive', header: 'HIV Positive'},
		{field: 'hpv_positive_type', header: 'HPV Positive Type'},
		{field: 'hpv_status', header: 'HPV Status'},
		{field: 'iss_stage', header: 'ISS Stage'},
		{field: 'laterality', header: 'Laterality'},
		{field: 'ldh_level_at_diagnosis', header: 'LDH Level at Diagnosis'},
		{field: 'ldh_normal_range_upper', header: 'LDH Normal Range Upper'},
		{field: 'lymph_nodes_positive', header: 'Lymph Nodes Positive'},
		{field: 'lymphatic_invasion_present', header: 'Lymphatic Invasion Present'},
		{field: 'method_of_diagnosis', header: 'Method of Diagnosis'},
		{field: 'new_event_anatomic_site', header: 'New Event Anatomic Site'},
		{field: 'new_event_type', header: 'New Event Type'},
		{field: 'overall_survival', header: 'Overall Survival'},
		{field: 'perineural_invasion_present', header: 'Perineural Invasion Present'},
		{field: 'prior_treatment', header: 'Prior Treatment'},
		{field: 'progression_free_survival', header: 'Progression Free Survival'},
		{field: 'progression_free_survival_event', header: 'Progression Free Survival Event'},
		{field: 'residual_disease', header: 'Residual Disease'},
		{field: 'vascular_invasion_present', header: 'Vascular Invasion Present'},
		{field: 'year_of_diagnosis', header: 'Year of Diagnosis'},
		{field: "age_at_index",header: "Age At Index"},
		{field: "premature_at_birth",header: "Premature At Birth"},
		{field: "weeks_gestation_at_birth",header: "Weeks Gestation At Birth"},
		{field: "age_is_obfuscated",header: "Age Is Obfuscated"},
		{field: "cause_of_death_source",header: "Cause Of Death Source"},
		{field: "occupation_duration_years",header: "Occupation Duration Years"},
		{field: "country_of_residence_at_enrollment",header: "Country Of Residence At Enrollment"},
		{field: "icd_10_code",header: "Icd 10 Code"},
		{field: "synchronous_malignancy",header: "Synchronous Malignancy"},
		{field: "anaplasia_present",header: "Anaplasia Present"},
		{field: "anaplasia_present_type",header: "Anaplasia Present Type"},
		{field: "child_pugh_classification",header: "Child Pugh Classification"},
		{field: "cog_liver_stage",header: "Cog Liver Stage"},
		{field: "cog_neuroblastoma_risk_group",header: "Cog Neuroblastoma Risk Group"},
		{field: "cog_renal_stage",header: "Cog Renal Stage"},
		{field: "cog_rhabdomyosarcoma_risk_group",header: "Cog Rhabdomyosarcoma Risk Group"},
		{field: "enneking_msts_grade",header: "Enneking Msts Grade"},
		{field: "enneking_msts_metastasis",header: "Enneking Msts Metastasis"},
		{field: "enneking_msts_stage",header: "Enneking Msts Stage"},
		{field: "enneking_msts_tumor_site",header: "Enneking Msts Tumor Site"},
		{field: "esophageal_columnar_dysplasia_degree",header: "Esophageal Columnar Dysplasia Degree"},
		{field: "esophageal_columnar_metaplasia_present",header: "Esophageal Columnar Metaplasia Present"},
		{field: "first_symptom_prior_to_diagnosis",header: "First Symptom Prior To Diagnosis"},
		{field: "gastric_esophageal_junction_involvement",header: "Gastric Esophageal Junction Involvement"},
		{field: "goblet_cells_columnar_mucosa_present",header: "Goblet Cells Columnar Mucosa Present"},
		{field: "gross_tumor_weight",header: "Gross Tumor Weight"},
		{field: "inpc_grade",header: "Inpc Grade"},
		{field: "inpc_histologic_group",header: "Inpc Histologic Group"},
		{field: "inrg_stage",header: "Inrg Stage"},
		{field: "inss_stage",header: "Inss Stage"},
		{field: "irs_group",header: "Irs Group"},
		{field: "irs_stage",header: "Irs Stage"},
		{field: "ishak_fibrosis_score",header: "Ishak Fibrosis Score"},
		{field: "lymph_nodes_tested",header: "Lymph Nodes Tested"},
		{field: "medulloblastoma_molecular_classification",header: "Medulloblastoma Molecular Classification"},
		{field: "metastasis_at_diagnosis",header: "Metastasis At Diagnosis"},
		{field: "metastasis_at_diagnosis_site",header: "Metastasis At Diagnosis Site"},
		{field: "mitosis_karyorrhexis_index",header: "Mitosis Karyorrhexis Index"},
		{field: "peripancreatic_lymph_nodes_positive",header: "Peripancreatic Lymph Nodes Positive"},
		{field: "peripancreatic_lymph_nodes_tested",header: "Peripancreatic Lymph Nodes Tested"},
		{field: "supratentorial_localization",header: "Supratentorial Localization"},
		{field: "tumor_confined_to_organ_of_origin",header: "Tumor Confined To Organ Of Origin"},
		{field: "tumor_focality",header: "Tumor Focality"},
		{field: "tumor_regression_grade",header: "Tumor Regression Grade"},
		{field: "vascular_invasion_type",header: "Vascular Invasion Type"},
		{field: "wilms_tumor_histologic_subtype",header: "Wilms Tumor Histologic Subtype"},
		{field: "breslow_thickness",header: "Breslow Thickness"},
		{field: "gleason_grade_group",header: "Gleason Grade Group"},
		{field: "igcccg_stage",header: "Igcccg Stage"},
		{field: "international_prognostic_index",header: "International Prognostic Index"},
		{field: "largest_extrapelvic_peritoneal_focus",header: "Largest Extrapelvic Peritoneal Focus"},
		{field: "masaoka_stage",header: "Masaoka Stage"},
		{field: "non_nodal_regional_disease",header: "Non Nodal Regional Disease"},
		{field: "non_nodal_tumor_deposits",header: "Non Nodal Tumor Deposits"},
		{field: "ovarian_specimen_status",header: "Ovarian Specimen Status"},
		{field: "ovarian_surface_involvement",header: "Ovarian Surface Involvement"},
		{field: "percent_tumor_invasion",header: "Percent Tumor Invasion"},
		{field: "peritoneal_fluid_cytological_status",header: "Peritoneal Fluid Cytological Status"},
		{field: "primary_gleason_grade",header: "Primary Gleason Grade"},
		{field: "secondary_gleason_grade",header: "Secondary Gleason Grade"},
		{field: "weiss_assessment_score",header: "Weiss Assessment Score"},
		{field: "adrenal_hormone",header: "Adrenal Hormone"},
		{field: "ann_arbor_b_symptoms_described",header: "Ann Arbor B Symptoms Described"},
		{field: "diagnosis_is_primary_disease",header: "Diagnosis Is Primary Disease"},
		{field: "eln_risk_classification",header: "Eln Risk Classification"},
		{field: "figo_staging_edition_year",header: "Figo Staging Edition Year"},
		{field: "gleason_grade_tertiary",header: "Gleason Grade Tertiary"},
		{field: "gleason_patterns_percent",header: "Gleason Patterns Percent"},
		{field: "margin_distance",header: "Margin Distance"},
		{field: "margins_involved_site",header: "Margins Involved Site"},
		{field: "pregnant_at_diagnosis",header: "Pregnant At Diagnosis"},
		{field: "satellite_nodule_present",header: "Satellite Nodule Present"},
		{field: "sites_of_involvement",header: "Sites Of Involvement"},
		{field: "tumor_depth",header: "Tumor Depth"},
		{field: "who_cns_grade",header: "Who Cns Grade"},
		{field: "who_nte_grade",header: "Who Nte Grade"},
		{field: "diagnosis_uuid",header: "Diagnosis Uuid"}
	  ];
	  this.exposureCols = [
		{field: 'case_id', header: 'Case ID'},
		{field: 'case_submitter_id', header: 'Case Submitter ID'},
		{field: 'exposure_id', header: 'Exposure ID'},
		{field: 'exposure_submitter_id', header: 'Exposure Submitter ID'},
		{field: 'alcohol_days_per_week', header: 'Alcohol Days Per Week'},
		{field: 'alcohol_drinks_per_day', header: 'Alcohol Drinks Per Day'},
		{field: 'alcohol_history', header: 'Alcohol History'},
		{field: 'alcohol_intensity', header: 'Alcohol Intensity'},
		{field: 'asbestos_exposure', header: 'Asbestos Exposure'},
		{field: 'cigarettes_per_day', header: 'Cigarettes Per Day'},
		{field: 'coal_dust_exposure', header: 'Coal Dust Exposure'},
		{field: 'environmental_tobacco_smoke_exposure', header: 'Environmental Tobacco Smoke Exposure'},
		{field: 'pack_years_smoked', header: 'Pack Years Smoked'},
		{field: 'radon_exposure', header: 'Radon Exposure'},
		{field: 'respirable_crystalline_silica_exposure', header: 'Respirable Crystalline Silica Exposure'},
		{field: 'smoking_frequency', header: 'Smoking Frequency'},
		{field: 'time_between_waking_and_first_smoke', header: 'Time Between Waking And First Smoke'},
		{field: 'tobacco_smoking_onset_year', header: 'Tobacco Smoking Onset Year'},
		{field: 'tobacco_smoking_quit_year', header: 'Tobacco Smoking Quit Year'},
		{field: 'tobacco_smoking_status', header: 'Tobacco Smoking Status'},
		{field: 'type_of_smoke_exposure', header: 'Type Of Smoke Exposure'},
		{field: 'type_of_tobacco_used', header: 'Type Of Tobacco Used'},
		{field: 'years_smoked', header: 'Years Smoked'},
		{field: "age_at_onset", header: "Age At Onset"},
		{field: "alcohol_type", header: "Alcohol Type"},
		{field: "exposure_duration", header: "Exposure Duration"},
		{field: "exposure_duration_years", header: "Exposure Duration Years"},
		{field: "exposure_type", header: "Exposure Type"},
		{field: "marijuana_use_per_week", header: "Marijuana Use Per Week"},
		{field: "parent_with_radiation_exposure", header: "Parent With Radiation Exposure"},
		{field: "secondhand_smoke_as_child", header: "Secondhand Smoke As Child"},
		{field: "smokeless_tobacco_quit_age", header: "Smokeless Tobacco Quit Age"},
		{field: "tobacco_use_per_day", header: "Tobacco Use Per Day" }
	  ];
	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  //@@@PDC-4568: Deprecated Properties of Sample and Exposure should not show up in the export manifests
	this.followUpCols = [
		{field: 'case_id', header: 'Case Id'},
		{field: 'case_submitter_id', header: 'Case Submitter Id'},
		{field: 'follow_up_id', header: 'Follow Up Id'},
		{field: 'follow_up_submitter_id', header: 'Follow Up Submitter Id'},
		{field: 'adverse_event', header: 'Adverse Event'},
		{field: 'adverse_event_grade', header: 'Adverse Event Grade'},
		{field: 'aids_risk_factors', header: 'Aids Risk Factors'},
		{field: 'barretts_esophagus_goblet_cells_present', header: 'Barretts Esophagus Goblet Cells Present'},
		{field: 'bmi', header: 'Bmi'},
		{field: 'body_surface_area', header: 'Body Surface Area'},
		{field: 'cause_of_response', header: 'Cause Of Response'},
		{field: 'cd4_count', header: 'Cd4 Count'},
		{field: 'cdc_hiv_risk_factors', header: 'Cdc Hiv Risk Factors'},
		{field: 'comorbidity', header: 'Comorbidity'},
		{field: 'comorbidity_method_of_diagnosis', header: 'Comorbidity Method Of Diagnosis'},
		{field: 'days_to_adverse_event', header: 'Days To Adverse Event'},
		{field: 'days_to_comorbidity', header: 'Days To Comorbidity'},
		{field: 'days_to_follow_up', header: 'Days To Follow Up'},
		{field: 'days_to_imaging', header: 'Days To Imaging'},
		{field: 'days_to_progression', header: 'Days To Progression'},
		{field: 'days_to_progression_free', header: 'Days To Progression Free'},
		{field: 'days_to_recurrence', header: 'Days To Recurrence'},
		{field: 'diabetes_treatment_type', header: 'Diabetes Treatment Type'},
		{field: 'disease_response', header: 'Disease Response'},
		{field: 'dlco_ref_predictive_percent', header: 'Dlco Ref Predictive Percent'},
		{field: 'ecog_performance_status', header: 'Ecog Performance Status'},
		{field: 'evidence_of_recurrence_type', header: 'Evidence Of Recurrence Type'},
		{field: 'eye_color', header: 'Eye Color'},
		{field: 'fev1_ref_post_bronch_percent', header: 'Fev1 Ref Post Bronch Percent'},
		{field: 'fev1_ref_pre_bronch_percent', header: 'Fev1 Ref Pre Bronch Percent'},
		{field: 'fev1_fvc_pre_bronch_percent', header: 'Fev1 Fvc Pre Bronch Percent'},
		{field: 'fev1_fvc_post_bronch_percent', header: 'Fev1 Fvc Post Bronch Percent'},
		{field: 'haart_treatment_indicator', header: 'Haart Treatment Indicator'},
		{field: 'height', header: 'Height'},
		{field: 'hepatitis_sustained_virological_response', header: 'Hepatitis Sustained Virological Response'},
		{field: 'history_of_tumor', header: 'History Of Tumor'},
		{field: 'history_of_tumor_type', header: 'History Of Tumor Type'},
		{field: 'hiv_viral_load', header: 'Hiv Viral Load'},
		{field: 'hormonal_contraceptive_type', header: 'Hormonal Contraceptive Type'},
		{field: 'hormonal_contraceptive_use', header: 'Hormonal Contraceptive Use'},
		{field: 'hormone_replacement_therapy_type', header: 'Hormone Replacement Therapy Type'},
		{field: 'hpv_positive_type', header: 'Hpv Positive Type'},
		{field: 'hysterectomy_margins_involved', header: 'Hysterectomy Margins Involved'},
		{field: 'hysterectomy_type', header: 'Hysterectomy Type'},
		{field: 'imaging_result', header: 'Imaging Result'},
		{field: 'imaging_type', header: 'Imaging Type'},
		{field: 'immunosuppressive_treatment_type', header: 'Immunosuppressive Treatment Type'},
		{field: 'karnofsky_performance_status', header: 'Karnofsky Performance Status'},
		{field: 'menopause_status', header: 'Menopause Status'},
		{field: 'nadir_cd4_count', header: 'Nadir Cd4 Count'},
		{field: 'pancreatitis_onset_year', header: 'Pancreatitis Onset Year'},
		{field: 'pregnancy_outcome', header: 'Pregnancy Outcome'},
		{field: 'procedures_performed', header: 'Procedures Performed'},
		{field: 'progression_or_recurrence', header: 'Progression Or Recurrence'},
		{field: 'progression_or_recurrence_anatomic_site', header: 'Progression Or Recurrence Anatomic Site'},
		{field: 'progression_or_recurrence_type', header: 'Progression Or Recurrence Type'},
		{field: 'recist_targeted_regions_number', header: 'Recist Targeted Regions Number'},
		{field: 'recist_targeted_regions_sum', header: 'Recist Targeted Regions Sum'},
		{field: 'reflux_treatment_type', header: 'Reflux Treatment Type'},
		{field: 'risk_factor', header: 'Risk Factor'},
		{field: 'risk_factor_treatment', header: 'Risk Factor Treatment'},
		{field: 'scan_tracer_used', header: 'Scan Tracer Used'},
		{field: 'undescended_testis_corrected', header: 'Undescended Testis Corrected'},
		{field: 'undescended_testis_corrected_age', header: 'Undescended Testis Corrected Age'},
		{field: 'undescended_testis_corrected_laterality', header: 'Undescended Testis Corrected Laterality'},
		{field: 'undescended_testis_corrected_method', header: 'Undescended Testis Corrected Method'},
		{field: 'undescended_testis_history', header: 'Undescended Testis History'},
		{field: 'undescended_testis_history_laterality', header: 'Undescended Testis History Laterality'},
		{field: 'viral_hepatitis_serologies', header: 'Viral Hepatitis Serologies'},
		{field: 'weight', header: 'Weight'}
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
studyTableExportCSV(format) {
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
			//@@@PDC-4060: Experimental Design - not all studies files get exported
			if (exportVal[colValue] && !Array.isArray(exportVal[colValue])) {
				changedVal = exportVal[colValue].replace('<div>', '\r\n');
				//@@@PDC-4286: The word "Disqualified" in the Export file has an HTML code
				changedVal = this.replaceAll(changedVal,'</div>','')
				changedVal = changedVal.replace("<div class='colValueDisqualified'>", '\r\n');
				exportVal[colValue] = changedVal;
			}
		}
	}
 	let csvOptions = {
		headers: headerCols
	};
	let exportFileObject = JSON.parse(JSON.stringify(exportValues, colValues));
	if (format == "csv") {
		new ngxCsv(exportFileObject, this.getCsvFileName('experimental-design'), csvOptions);
	} else if (format == "tsv") {
		let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, headerCols);
		var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
		FileSaver.saveAs(blob, this.getCsvFileName("experimental-design", "tsv"));
	}
}

//helper function preparing a string containing the data for TSV manifest file
prepareTSVExportManifestData(manifestData, cols){
	let result = "";
	let separator = '\t';
	let EOL = "\r\n";
	for (var i=0; i< cols.length; i++) {
		//@@@PDC-3482 headers in TSV file should match headers in CSV
		result += cols[i] + separator;
	}
	result = result.slice(0, -1);
	result += EOL;
	for (var i=0; i < manifestData.length; i++){
		for (const index in manifestData[i]) {
			if (manifestData[i][index] == null) {
				result += separator;
			} else {
				let value = manifestData[i][index];
				value = this.replaceAll(value, "\t", "");
				value = this.replaceAll(value, "\r\n", ", ");
				result +=  value + separator;
			}
		}
		result = result.slice(0, -1).trim();
		result += EOL;
	}
	return result;
}

biospecimenTableExportCSV(format) {
	let headerCols = [];
	let colValues = [];
	let allBiospecimenCols = this.biospecimenExportCols;
	for (var i=0; i< allBiospecimenCols.length; i++) {
		headerCols.push(allBiospecimenCols[i]['header']);
		colValues.push(allBiospecimenCols[i]['field']);
	}
	let exportValues =  _.cloneDeep(this.filteredCasesData);
 	let csvOptions = {
		headers: headerCols
	};
	let exportFileObject = JSON.parse(JSON.stringify(exportValues, colValues));
	if (format == "csv") {
		//@@@PDC-6971: Biospecimen CSV files from Study Summary have 'null' values in empty columns, unlike other manifests from Explore or Study Summary
		let exportCSVData = this.prepareCSVExportManifestData(exportFileObject, headerCols);
		var csvblob = new Blob([exportCSVData], { type: 'text/csv' });
		FileSaver.saveAs(csvblob, this.getCsvFileName("biospecimen", "csv"));
	} else if (format == "tsv") {
		let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, headerCols);
		var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
		FileSaver.saveAs(blob, this.getCsvFileName("biospecimen", "tsv"));
	}
}

prepareExposureDataforExport(exportData, format) {
	let exposureDataArr = [];
	exposureDataArr = this.populateExposureData(exportData);
	let exposureColValues = [];
	let headerCols = [];
	var exposureBlob = new Blob();
	for (var i=0; i< this.exposureCols.length; i++) {
		exposureColValues.push(this.exposureCols[i]['field']);
		headerCols.push(this.exposureCols[i]['header']);
	}
	let exportFileExposureObject = JSON.parse(JSON.stringify(exposureDataArr, exposureColValues));
	if (format == "tsv") {
		let exportExposureTSVData = this.prepareTSVExportManifestData(exportFileExposureObject, headerCols);
		exposureBlob = new Blob([exportExposureTSVData], { type: 'text/csv;charset=utf-8;' });
	} else if (format == "csv") {
		let exportExposureCSVData = this.prepareCSVExportManifestData(exportFileExposureObject, headerCols);
        exposureBlob = new Blob([exportExposureCSVData], { type: 'text/csv;' });
	}
	return exposureBlob;
}

//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
populateFollowUpDataForExport(exportData) {
	let followUpDataArr = [];
	for (var obj in exportData) {
		let case_id_val = exportData[obj]['case_id'];
		let case_submitter_id_val = exportData[obj]['case_submitter_id'];
		let followUps = exportData[obj]['follow_ups'];
		if (followUps && followUps.length > 0) {
			for (var exp in followUps) {
				exportData[obj]['follow_ups'][exp]['case_id'] = case_id_val;
				exportData[obj]['follow_ups'][exp]['case_submitter_id']	= case_submitter_id_val;
				followUpDataArr.push(exportData[obj]['follow_ups'][exp]);
			}
		}
	}
	return followUpDataArr;
}

//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
prepareFollowUpDataforExport(exportData, format) {
    let dataArray = [];
    dataArray = this.populateFollowUpDataForExport(exportData);
    let colVals = [];
	let headerCols = [];
    var dataBlob = new Blob();
    for (var i=0; i< this.followUpCols.length; i++) {
		colVals.push(this.followUpCols[i]['field']);
		headerCols.push(this.followUpCols[i]['header']);
    }
    let exportFileObject = JSON.parse(JSON.stringify(dataArray, colVals));
    if (format == "tsv") {
        let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, headerCols);
        dataBlob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
    } else if (format == "csv") {
        let exportCSVData = this.prepareCSVExportManifestData(exportFileObject, headerCols);
		dataBlob = new Blob([exportCSVData], { type: 'text/csv;' });
    }
    return dataBlob;
}

prepareDownloadData(format, exportData, exportFileObject) {
	this.loading = true;
	//Prepare exposure Data
	//For TSV format have to preprocess and use different function than CSV
	let colVals = [];
	for (var i=0; i< this.clinicalExportCols.length; i++) {
		colVals.push(this.clinicalExportCols[i]['header']);
    }
	if (format == "tsv") {
		let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, colVals);
		var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
	} else if (format == "csv") {
		let exportCSVData = this.prepareCSVExportManifestData(exportFileObject, colVals);
		var blob = new Blob([exportCSVData], { type: 'text/csv' });
	}
	var exposureBlob = this.prepareExposureDataforExport(exportData, format);
	var followUpBlob = this.prepareFollowUpDataforExport(exportData, format);
	//Zip the files to tar.gz
	const jszip = new JSZip();
	jszip.file(this.getExportFileName(format), blob);
	jszip.file(this.getExportFileName(format, "exposure"), exposureBlob);
	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	jszip.file(this.getExportFileName(format, "followup"), followUpBlob);
	//eg: PDC_clinical_data_manifests_<timestamp>
	let folderName = this.getExportFileName(format, "", "true").replace("." + format, "") + ".tar.gz";
	//Download files
	jszip.generateAsync({ type: 'blob' }).then(function(content) {
		FileSaver.saveAs(content, folderName);
	});
	this.loading = false;
}

clinicalTableExportCSV(dt){
	dt.exportFilename = this.getExportFileName("csv");
	//@@@PDC-2950: External case id missing in clinical manifest
	let colValues = [];
	for (var i=0; i< this.clinicalExportCols.length; i++) {
		colValues.push(this.clinicalExportCols[i]['field']);
	}
	let exportData = [];
	exportData = this.addGenomicImagingDataToExportManifest(this.filteredClinicalData);
	let exportFileObject = JSON.parse(JSON.stringify(exportData, colValues));
	//@@@PDC-4260: Update clinical manifest to include new clinical data fields
	this.prepareDownloadData("csv", exportData, exportFileObject);
}

//PDC-3073, PDC-3074 Add TSV format for manifests
clinicalTableExportTSV(dt){
	let exportData = [];
	let colValues = [];
	for (var i=0; i< this.clinicalExportCols.length; i++) {
		colValues.push(this.clinicalExportCols[i]['field']);
	}
	exportData = this.addGenomicImagingDataToExportManifest(this.filteredClinicalData);
	let exportFileObject = JSON.parse(JSON.stringify(exportData, colValues));
	//@@@PDC-4260: Update clinical manifest to include new clinical data fields
	this.prepareDownloadData("tsv", exportData, exportFileObject);
}

//@@@PDC-4260: Update clinical manifest to include new clinical data fields
//Populate exposure data
populateExposureData(exportData) {
	let exposureDataArr = [];
	for (var obj in exportData) {
		let case_id_val = exportData[obj]['case_id'];
		let case_submitter_id_val = exportData[obj]['case_submitter_id'];
		let exposures = exportData[obj]['exposures'];
		if (exposures && exposures.length > 0) {
			for (var exp in exposures) {
				exportData[obj]['exposures'][exp]['case_id'] = case_id_val;
				exportData[obj]['exposures'][exp]['case_submitter_id']	= case_submitter_id_val;
				exposureDataArr.push(exportData[obj]['exposures'][exp]);
			}
		}
	}
	return exposureDataArr;
}

//@@@PDC-4260: Update clinical manifest to include new clinical data fields
//help function preparing a string containing the data for CSV manifest file
prepareCSVExportManifestData(manifestData, columns){
	let result = "";
	let separator = ',';
	let EOL = "\r\n";
	for (var i=0; i< columns.length; i++) {
		//@@@PDC-3482 headers in TSV file should match headers in CSV
		result += columns[i] + separator;
	}
	result = result.slice(0, -1);
	result += EOL;
	for (var i=0; i < manifestData.length; i++){
		for (const index in manifestData[i]) {
			if (manifestData[i][index] == null) {
				result += separator;
			} else {
				result += '"'+ manifestData[i][index] + '"'+ separator;
			}
		}
		result = result.slice(0, -1);
		result += EOL;
	}
	return result;
}

//@@@PDC-2950: External case id missing in clinical manifest
addGenomicImagingDataToExportManifest(manifestData) {
	let exportData = [];
	exportData = _.cloneDeep(manifestData);
	for (var i = 0; i < exportData.length; i++) {
		let externalResources = exportData[i]["externalReferences"];
		let genomicImagingData = "";
		if (externalResources.length > 0) {
			//Sort the external references as per reference_resource_shortname
			externalResources = externalResources.sort((a, b) => a.reference_resource_shortname < b.reference_resource_shortname ? -1 : a.reference_resource_shortname > b.reference_resource_shortname ? 1 : 0);
			for (var j = 0; j < externalResources.length; j++) {
				genomicImagingData += externalResources[j]["reference_resource_shortname"] + ": " + externalResources[j]["reference_entity_location"].trim() + ";";
			}
			genomicImagingData = genomicImagingData.slice(0, -1);
		}
		exportData[i]["genomicImagingData"] = genomicImagingData;
		let associatedSamples = exportData[i]["samples"];
		//@@PDC-6542 - clinical manifest download broken
		if (associatedSamples != null && associatedSamples.length > 0 && typeof(associatedSamples) != 'string' ) {
  		//@@PDC-5414-add-annotation-information
			exportData[i]["samples"] = "Samples: " + associatedSamples[0]['sample_submitter_id'];
 			exportData[i]["sample_annotation"] = associatedSamples[0]['annotation'];
		} else if (associatedSamples != null && associatedSamples.length > 0 && typeof(associatedSamples) == 'string') {
			//@@@PDC-6973: Undefined value for Related entities- Sample if manifest pulled from Study Summary
			exportData[i]["samples"] = "Samples: " + associatedSamples;
			exportData[i]["sample_annotation"] = exportData[i]['annotation'];
		} else {
			exportData[i]["samples"] = "null";
  			//@@PDC-5519 - if no sample annotation values in manifest shift left
  			exportData[i]["sample_annotation"] = null;

		}
	}
	return exportData;
}

private getExportFileName(format = "csv", subType="", folder=""): string {
	let csvFileName = "";
	if (subType == "") {
		csvFileName = "PDC_study_clinical_";
	} else {
		csvFileName = "PDC_study_clinical_" + subType + "_";
	}
	if (folder == "true") {
		csvFileName = "PDC_study_clinical_data_";
	}
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
	if (format === "tsv") {
		csvFileName += ".tsv";
	} else if (format === "csv") {
		csvFileName += ".csv";
	}
	return csvFileName;
}

private getCsvFileName(tab = '', format = "csv"): string {
	let csvFileName = "PDC_study_experimental_";
	if (tab == 'experimental-design') {
		csvFileName = "PDC_study_experimental_";
	} else if (tab == 'clinical') {
		csvFileName = "PDC_study-clinical_";
	} else if (tab == 'biospecimen') {
		csvFileName = "PDC_study_biospecimen_";
	}
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
	if (format === "tsv"){
		csvFileName += ".tsv";
	}
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
		this.studySummaryService.getBiospecimenPerStudy(this.study_id, this.source).pipe(take(1)).subscribe((biospecimenData: any) =>{
			this.biospecimenPerStudy = biospecimenData.uiBiospecimenPerStudy;
			for(let biospecimen of biospecimenData.uiBiospecimenPerStudy){
				if (biospecimen["aliquot_is_ref"] == "yes") {
					aliquotSubmitterID = biospecimen["aliquot_submitter_id"];
				}
			}
			setTimeout(() => {
				this.studySummaryService.getStudyExperimentalDesign(this.study_id, this.source).pipe(take(1)).subscribe((data: any) =>{
					this.studyExperimentalDesign = data.uiStudyExperimentalDesign;
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
 					for(let studyExpData of data.uiStudyExperimentalDesign){
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
						this.studyExperimentalDesign = data.uiStudyExperimentalDesign;
						colsSpecificToExpTypeArr = [];
					}
					for (let studyExpData of data.uiStudyExperimentalDesign) {
						var colValSpecificToExpType = "";
						for (let col of colsSpecificToExpTypeArr) {
							let colsSpecificVal = "";
							//@@@PDC-3900 new studyExperimentalDesign API
							if (studyExpData[col] != null && studyExpData[col].length > 0 && studyExpData[col][0].aliquot_submitter_id != null && studyExpData[col][0].aliquot_submitter_id.length > 0){
								colsSpecificVal = studyExpData[col][0].aliquot_submitter_id;
								//console.log("Good aliquot for "+col+": "+colsSpecificVal);
							}
							//@@@PDC-3094 Fix Study summary Experimental Design tab channel having an empty value
							colValSpecificToExpType = ""; //Need to reintialize this value since the value of a channel can be null and than a previous channel value will be duplicated
							//Access the biospecimen whose aliquot submitter ID is the same and
							//compose the column value with the case submitter ID and sample Type
							for(let biospecimen of this.biospecimenPerStudy){
								if (colsSpecificVal == biospecimen["aliquot_submitter_id"]) {
									let caseSubmitterID = biospecimen["case_submitter_id"];
									let sampleType = biospecimen["sample_type"];
									colValSpecificToExpType = caseSubmitterID + "<div>" + sampleType + "</div>";
									//@@@PDC-3719 include disqualified in study summary Experimental Design table
									if (biospecimen["aliquot_status"] === "Disqualified"){
										colValSpecificToExpType = colValSpecificToExpType + "<div class='colValueDisqualified'>Disqualified</div>";
									}
								}
							}
							if (colValSpecificToExpType != '') {
								studyExpData[col] = colValSpecificToExpType;
							}
						}
						if (colValSpecificToExpType != '') {
							this.studyExperimentalDesign = data.uiStudyExperimentalDesign;
						}
					}
					this.studyExperimentDesignTableExtraCols = colsSpecificToExpType;
					//@@@PDC-6692: UI Changes for the Experimental Design tab of Study Summary Page
					//@@@PDC-7399 change acquisition_mode to polarity
					if (this.studySummaryData && (this.studySummaryData['analytical_fraction'] == 'Metabolome' || this.studySummaryData['analytical_fraction'] == 'Lipidome')) {
						if (!("polarity" in this.studyExperimentDesignTableCommonCols)) {
							this.studyExperimentDesignTableCommonCols.push({field: "polarity", header: "Polarity"});
						}
					}
					if (colsSpecificToExpType.length > 0) {
						this.studyExperimentDesignTableCols = _.concat(this.studyExperimentDesignTableCommonCols, colsSpecificToExpType);
					} else {
						this.studyExperimentDesignTableCols = this.studyExperimentDesignTableCommonCols;
					}
					this.makeRowsSameHeight();
				});
			}, 1000);
		});
		}, 1000);
		this.loading = false;
}

tabClick () {
	this.makeRowsSameHeight();
}

makeRowsSameHeight() {
	setTimeout(() => {
		if (document.getElementsByClassName('ui-table-scrollable-wrapper').length) {
			let wrapper = document.getElementsByClassName('ui-table-scrollable-wrapper');
			for (var i = 0; i < wrapper.length; i++) {
				let w = wrapper.item(i) as HTMLElement;
				let frozen_rows: any = w.querySelectorAll('.ui-table-frozen-view .ui-table-tbody tr');
				let unfrozen_rows: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-tbody tr');
				let frozen_header_row: any = w.querySelectorAll('.ui-table-frozen-view .ui-table-thead tr');
				let unfrozen_header_row: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-thead');
				   if (frozen_header_row[0].clientHeight > unfrozen_header_row[0].clientHeight) {
					unfrozen_header_row[0].style.height = frozen_header_row[0].clientHeight+"px";
				  }
				else if (frozen_header_row[0].clientHeight < unfrozen_header_row[0].clientHeight) {
					frozen_header_row[0].style.height = unfrozen_header_row[0].clientHeight+"px";
				}
				for (let i = 0; i < frozen_rows.length; i++) {
					if (frozen_rows[i].clientHeight > unfrozen_rows[i].clientHeight) {
						unfrozen_rows[i].style.height = frozen_rows[i].clientHeight+"px";
					}
					else if (frozen_rows[i].clientHeight < unfrozen_rows[i].clientHeight)
					{
						frozen_rows[i].style.height = unfrozen_rows[i].clientHeight+"px";
					}
				}
				let frozen_header_div: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-scrollable-header-box');
				frozen_header_div[0].setAttribute('style', 'margin-right: 0px !important');
			}
		}
	});
}

}
