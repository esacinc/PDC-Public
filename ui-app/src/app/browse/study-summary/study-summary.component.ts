
import {of as observableOf,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { StudySummaryService } from './study-summary.service';
import { AllStudiesData, Filter, WorkflowMetadata, ProtocolData, PublicationData, FilesCountsPerStudyData } from '../../types';
import { StudySummaryOverlayService } from './study-summary-overlay-window/study-summary-overlay-window.service';

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
	duaAvailable:boolean = true;

  constructor(private route: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private studySummaryService: StudySummaryService,
				private dialogRef: MatDialogRef<StudySummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public studyData: any, private studySummaryOverlayWindow: StudySummaryOverlayService) {
    
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
	}
	
	//If the current date is with in the embargo date, display the DUA with a 'accept' button
	setDUAWindowForStudySummary() {
		setTimeout(() => {
			if (this.studySummaryData.program_name != 'Clinical Proteomic Tumor Analysis Consortium') {
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
			this.workflowData = data.workflowMetadata[0];
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
	  setTimeout(() => {
		  this.studySummaryService.getFilesCounts(this.study_id).subscribe((data: any) => {
			this.fileCountsRaw = data.filesCountPerStudy;
			for (let i = 0; i < this.fileCountsRaw.length; i++) {
				this.totalFilesCount += this.fileCountsRaw[i].files_count;
			}
			//console.log(this.fileCountsRaw);
			this.loading = false;
		  });
	  }, 1000);
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
  }

}
