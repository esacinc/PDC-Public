import { Apollo } from 'apollo-angular';

import {
    Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AllStudiesData, FileCountsForStudyPage } from '../../types';
import { BrowseFiltersService } from '../filters/browse-filters.service';
import { StudySummaryComponent } from '../study-summary/study-summary.component';
import { BrowseByStudyService } from './browse-by-study.service';
import { ngxCsv } from "ngx-csv/ngx-csv";
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'browse-by-study',
  templateUrl: './browse-by-study.component.html',
  styleUrls: ['../../../assets/css/global.css', './browse-by-study.component.css'],
	providers: [ BrowseByStudyService]
})

//@@@PDC-169 The user should be able to browse data by Case
//@@@PDC-244 Select rows in tabs and download data
//@@@PDC-264 Add number of cases column to summary tab
//@@@PDC-230 View study summary page for each study (overlay window)
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-314 Study Summary improvements
//@@@PDC-283 Add pagination to study browse tab
//@@@PDC-262 get dictionary base url from environment object
//@@@PDC-417 - fix popup dialog size
//@@@PDC-518 Rearrange and update text on the browse page tabs and download
//@@@PDC-374 - adding url to overlay windows
//@@@PDC-497 Make table column headers sortable on the browse page tabs
//@@@PDC-535 - add Clinical filters
//@@@PDC-567 - add Biospecimen filters
//@@@PDC-616 Add acquisition type to the general filters
//@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
//@@@PDC-764: Update UI as per the changes in PDC-763
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-937: Add a button to allow download all manifests with a single click
//@@@PDC-1063: Implement select all, select page, select none for all tabs
//@@@PDC-1252: Add data category as a filter for the "file counts" section of the Study table
//@@@PDC-1609: URL structure for permanent links to PDC
//@@@PDC-1851: Quality Metrics with TSV file format are not considered in files count
//@@@PDC-1902: Peptide Spectral Matches with Text file format are not considered in files count
//@@@PDC-2460: Add new data category/file type: Alternate Processing Pipeline/Archive
//@@@PDC-2584: Add Embargo date to the study table on Browse page
export class BrowseByStudyComponent implements OnInit, OnChanges {

  selectedDate: Date;
  keepSelectedStudies: AllStudiesData[] = [];
  filteredStudiesData: AllStudiesData[]; //Filtered list of Studies
  loading: boolean = false; //Flag indicates that the data is still being loaded from server
  filterChangedFlag: boolean = true; //Flag indicates that filter selection was changed
  @Input() newFilterValue: any;
  newFilterSelected: any;
  selectedStudies: AllStudiesData[] = [];
  cols: any[];
  //Pagination variables
  totalRecords: number;
  offset: number;
  limit: number;
  pageSize: number;
  static urlBase;
  @Output() studyTotalRecordChanged: EventEmitter<any> = new EventEmitter<any>();
  sort: string;
  //@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
  @Output() selectedTabChangeForCaseCount: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedTabChangeForFileType: EventEmitter<any> = new EventEmitter<any>();
  fileTypes: FileCountsForStudyPage[];
  fenceRequest:boolean = false;
  //keep a full list of filter category
  // Array which holds filter names. Must be updated when new filters are added to browse page.
  allFilterCategory: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","study_name","submitter_id_name","sample_type","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable","studyName_genes_tab", "biospecimen_status", "case_status"];

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	headercheckbox:boolean = false;
  currentPageSelectedStudy = [];
	pageHeaderCheckBoxTrack = [];
	@Output() downloadWholeManifestFlag: EventEmitter<any> = new EventEmitter<any>();
	@Output() isTableLoading: EventEmitter<any> = new EventEmitter<any>();
	@Input() downloadAllManifests;
	@Input() handleTableLoading;
	@Input() enableDownloadAllManifests:any;
	// Determines if there are any selected filters in the browse component
	filtersSelected:any;
	//@@@PDC-1063: Implement select all, select page, select none for all tabs
	checkboxOptions = [];
	selectedHeaderCheckbox = '';
	manifestFormat = "csv";
	frozenColumns = [];

  selectAll: boolean = false;

	@Input() childTabChanged: string;
  @ViewChild('dataForManifestExport') dataForManifestExport;
  //@@@PDC-7110 fix checkbox update
  @ViewChildren('browsePageCheckboxes') browsePageCheckboxes;

  constructor(private apollo: Apollo,
				private router: Router,
				private browseByStudyService : BrowseByStudyService,
				private filterService: BrowseFiltersService,
				private dialog: MatDialog,
				private activatedRoute:ActivatedRoute) {
	// Array which holds filter names. Must be updated when new filters are added to browse page.
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "studyName_genes_tab": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "biospecimen_status": "", "case_status": ""};
	this.offset = 0; //Initialize values for pagination
	this.limit = 10;
	this.totalRecords = 0;
	this.pageSize = 10;
	this.getAllStudiesData();
	this.sort = "";

	BrowseByStudyComponent.urlBase = environment.dictionary_base_url;
  }



  get staticUrlBase() {
    return BrowseByStudyComponent.urlBase;
  }

  //@PDC-8153 fix study delection
  onSelectionChange(event){
	let currentDate = new Date();
    console.log("selection change");
	console.log(Math.floor(currentDate.getTime()/1000));
    console.log(event);
	
	if(this.selectedDate && Math.floor(this.selectedDate.getTime()/1000) === Math.floor(currentDate.getTime()/1000)){
		setTimeout(() => {this.selectedStudies = [...this.keepSelectedStudies]},500);
	}else{
		this.keepSelectedStudies = [...event];
	}
	this.selectedDate = currentDate; 

    if(this.selectedStudies.length === this.totalRecords){
      console.log("equal");
      this.headercheckbox = true;
    } else {
      this.headercheckbox = false;
    }
  }

  showStudySummary(study_id: string){
	const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%'

	var study_index = this.findStudyByID(study_id);
    dialogConfig.data = {
		summaryData: this.filteredStudiesData[study_index],
    };
	this.router.navigate([{outlets: {studySummary: ['study-summary', this.filteredStudiesData[study_index].submitter_id_name]}}], { skipLocationChange: true });
	const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);
	dialogRef.afterClosed().subscribe((val:any) => {
		console.log("Dialog output:", val);
		//@@@PDC-4806: Alignment issue in some resolutions
		//When a user clicks on study name/study id in the Study table, the rows get misasligned.
		//Solution: Scroll the study name/id into viewport
		document.getElementById(study_id).scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
	});
  }

  findStudyByID(study_id: string) {
	  for (let idx = 0; idx < this.filteredStudiesData.length; idx++ ){
		  if (this.filteredStudiesData[idx].study_submitter_id === study_id) {
			  return idx;
		  }
	  }
	  return -1;
  }

  /*API call to get all cases data */
  getAllStudiesData(){
	  this.loading = true;
	  setTimeout(() => {
		  this.browseByStudyService.getFilteredStudiesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			//@@@PDC-379 collapse study records with different disease_type and primary_site
			this.filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
			for (let idx = 0; idx < this.filteredStudiesData.length; idx++ ){
				this.concatinateDataEnd(idx);
				this.setEmptyEmbargoDate(idx);
			}
			this.setFileCountsForDisplay();
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIStudy.total;
				this.studyTotalRecordChanged.emit({type: 'study', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIStudy.pagination.from;
				this.pageSize = data.getPaginatedUIStudy.pagination.size;
				this.limit = data.getPaginatedUIStudy.pagination.size;
			}
			this.loading = false;
			this.clearSelection();
			//this.makeRowsSameHeight();
		  });
	  }, 1000);
	}

	//@@@PDC-937: Add a button to allow download all manifests with a single click
	//PDC-3073: Add TSV format to manifests
	downloadAllManifest(exportFormat = "csv") {
		setTimeout(() => {
			this.downloadWholeManifestFlag.emit({downloadAllManifest:this.totalRecords, format: exportFormat});
		}, 10);
	}

  //@@@PDC-764: Update UI as per the changes in PDC-763
  //@@@PDC-1851: Quality Metrics with TSV file format are not considered in files count
  //@@@PDC-1902: Peptide Spectral Matches with Text file format are not considered in files count
  //This function is used to set file counts.
  setFileCountsForDisplay(studyData=[]) {
	if (studyData && studyData.length == 0) {
		studyData = this.filteredStudiesData;
	}
	if (typeof(studyData) !== 'undefined') {
		for (let i = 0; i < studyData.length; i++) {
			var typesOfProtocol = 0;
			this.fileTypes = studyData[i].filesCount;
			if (this.fileTypes) {
				var typesOfQualityMetrics = 0;
				var typesOfPSM = 0;
				for (let j = 0; j < this.fileTypes.length; j++) {
					var currentFileType = this.fileTypes[j].file_type;
					var currentDataCategory = this.fileTypes[j].data_category;
					var currentFileCount = this.fileTypes[j].files_count;
					switch(currentDataCategory) {
						case 'Raw Mass Spectra' :
							studyData[i]['raw_count'] = currentFileCount;
							break;
						case 'Processed Mass Spectra' :
							studyData[i]['mzml_count'] = currentFileCount;
							break;
						case 'Other Metadata' :
							// set file count for other metadata
							typesOfProtocol++;
							if (typesOfProtocol > 1) {
								studyData[i]['metadata_count'] += currentFileCount;
							} else {
								studyData[i]['metadata_count'] = currentFileCount;
							}
							break;
						case 'Peptide Spectral Matches' :
							if (currentFileType == 'Open Standard' || currentFileType == 'Text') {
								if (typesOfPSM == 0 ) {
									studyData[i]['psm_count'] = currentFileCount;
								} else {
									studyData[i]['psm_count'] += currentFileCount;
								}
								typesOfPSM++;
							}
							break;
						case 'Protein Assembly' :
							studyData[i]['protein_assembly_count'] = currentFileCount;
							break;
						case 'Protein Databases' :
							studyData[i]['protein_databases_count'] = currentFileCount;
							break;
						case 'Quality Metrics' :
							//There can be more than one file type for quality metrics: txt, csv, html
							if (typesOfQualityMetrics > 0){
								studyData[i]['quality_metrics_count'] += currentFileCount;
							} else {
								studyData[i]['quality_metrics_count'] = currentFileCount;
							}
							typesOfQualityMetrics++;
							break;
						case 'Alternate Processing Pipeline':
							typesOfProtocol++;
							if (typesOfProtocol > 1) {
								studyData[i]['metadata_count'] += currentFileCount;
							} else {
								studyData[i]['metadata_count'] = currentFileCount;
							}
							break;
						//@@@PDC-3659 Include Publication Supplementary Material and Spectral Library file counts in column Metadata
						case 'Publication Supplementary Material':
							typesOfProtocol++;
							if (typesOfProtocol > 1) {
								studyData[i]['metadata_count'] += currentFileCount;
							} else {
								studyData[i]['metadata_count'] = currentFileCount;
							}
							break;
						case 'Spectral Library':
							typesOfProtocol++;
							if (typesOfProtocol > 1) {
								studyData[i]['metadata_count'] += currentFileCount;
							} else {
								studyData[i]['metadata_count'] = currentFileCount;
							}
							break;

					}
				}
			}
		}
	}
  }

  ngOnChanges(changes: SimpleChanges){
	  if (changes && changes['childTabChanged']) {
		//this.makeRowsSameHeight();
	  }
	  // ngOnChanges fires when the page loads, at that moment newFilterValue is not set yet
	  if (this.newFilterValue){
		//var filter_field=this.newFilterValue.split(":"); //the structure is field_name: "value1;value2"
	  //@@@PDC-5428 fix study name truncation issue
	  var filter_field = [];
	  filter_field.push(this.newFilterValue.substring(0, this.newFilterValue.indexOf(":")));
	  filter_field.push(this.newFilterValue.substring(this.newFilterValue.indexOf(":")+1));
		//If clear all filter selection button was pressed need to clear all filters
		if (filter_field[0] === "Clear all selections"){
			for (let filter_name in this.newFilterSelected){
				this.newFilterSelected[filter_name] = "";
			}
		}
		else if (filter_field[0] === "Clear all clinical filters selections"){
			//console.log(this.newFilterSelected);
			this.newFilterSelected["ethnicity"] = ""
			this.newFilterSelected["race"] = "";
			this.newFilterSelected["gender"] = "";
			this.newFilterSelected["tumor_grade"] = "";
			this.newFilterSelected["case_status"] = "";
		}
		else if (filter_field[0] === "Clear all general filters selections"){
			//console.log(this.newFilterSelected);
			this.newFilterSelected["program_name"] = "";
			this.newFilterSelected["project_name"] = "";
			//this.newFilterSelected["study_name"] = "";
			this.newFilterSelected["disease_type"] = "";
			this.newFilterSelected["primary_site"] = "";
			this.newFilterSelected["analytical_fraction"] = "";
			this.newFilterSelected["experiment_type"] = "";
			this.newFilterSelected["acquisition_type"] = "";
			this.newFilterSelected["case_status"] = "";
			this.newFilterSelected["biospecimen_status"] = "";
		}
		else if (filter_field[0] === "Clear all biospecimen filters selections"){
			this.newFilterSelected["sample_type"] = "";
			this.newFilterSelected["study_name"] = "";
			this.newFilterSelected["biospecimen_status"] = "";
		}
		else if(filter_field[0] === "Clear all file filters selections"){
			this.newFilterSelected["study_name"] = "";
			this.newFilterSelected["data_category"] = "";
			this.newFilterSelected["file_type"] = "";
			this.newFilterSelected["access"] = "";
			this.newFilterSelected["downloadable"] = "";
		}
		else if (filter_field[0] === "Clear all genes filters selections"){
			this.newFilterSelected["study_name"] = "";
		}
		else {
			this.newFilterSelected[filter_field[0]] = filter_field[1];
		}
		console.log("Study Filter Value: "+ this.newFilterSelected[filter_field[0]]);
		this.offset = 0; //Reinitialize offset for each new filter value
		this.loading = true;
		//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
		 //If its a fence request, set filters from local storage
		var selectedFiltersForBrowse = JSON.parse(localStorage.getItem("selectedFiltersForBrowse"));
		if (this.fenceRequest && selectedFiltersForBrowse) {
		console.log("IN fence request ");
			for (var i=0;i<this.allFilterCategory.length;i++) {
				if (selectedFiltersForBrowse[this.allFilterCategory[i]]) {
				  var filterName = this.allFilterCategory[i];
				  var filterVal = selectedFiltersForBrowse[filterName];
				  //special case for study name
				  if (filterName == "submitter_id_name") {
					selectedFiltersForBrowse["study_name"] = filterVal.join(";");
				  } else if (filterName == "studyName_genes_tab") {
					selectedFiltersForBrowse["study_name"] = filterVal;
				  } else {
					selectedFiltersForBrowse[filterName] = filterVal.join(";");
				  }
				}
			}
			this.newFilterSelected = selectedFiltersForBrowse;
		}
		this.browseByStudyService.getFilteredStudiesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
	    //@@@PDC-379 collapse study records with different disease_type and primary_site
		this.filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
		for (let idx = 0; idx < this.filteredStudiesData.length; idx++ ){
			this.concatinateDataEnd(idx);
			this.setEmptyEmbargoDate(idx);
		}
		this.setFileCountsForDisplay();
			//this.filteredStudiesData = data.getPaginatedUIStudy.uiStudies;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIStudy.total;
				this.studyTotalRecordChanged.emit({type: 'study', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIStudy.pagination.from;
				this.pageSize = data.getPaginatedUIStudy.pagination.size;
				this.limit = data.getPaginatedUIStudy.pagination.size;
				//this.makeRowsSameHeight();
			}
			this.loading = false;
			this.clearSelection();
		});
		}

		//@@@PDC-937: Add a button to allow download all manifests with a single click
		//PDC-3073: Add TSV format to manifests
		setTimeout(() => {
			if (this.downloadAllManifests != undefined){
				this.manifestFormat = this.downloadAllManifests.split('*')[1];
			}
			console.log(this.manifestFormat);
			if (changes['downloadAllManifests'] && changes['downloadAllManifests'].currentValue) {
				this.downloadCompleteManifest();
			}
			if (changes['handleTableLoading'] && changes['handleTableLoading'].currentValue) {
					var handleTableloading = changes['handleTableLoading'].currentValue;
					let loadingVal = handleTableloading.split(':');
						this.loading = JSON.parse(loadingVal[1]);
			}
		}, 10);

		if (changes['enableDownloadAllManifests'] && changes['enableDownloadAllManifests'].currentValue >= 0) {
				this.filtersSelected = JSON.parse(changes['enableDownloadAllManifests'].currentValue);
		}

	}

	//@@@PDC-937: Add a button to allow download all manifests with a single click
	//@@@PDC-1063: Implement select all, select page, select none for all tabs
	downloadCompleteManifest(buttonClick = false) {
		setTimeout(() => {
			if (!buttonClick) {
				this.isTableLoading.emit({isTableLoading:"study:true"});
			}
			this.browseByStudyService.getFilteredStudiesPaginated(0, 0, this.sort, this.newFilterSelected, true).subscribe((data: any) =>{
			let filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
			for (let idx = 0; idx < this.filteredStudiesData.length; idx++ ){
				this.concatinateDataEnd(idx);
				this.setEmptyEmbargoDate(idx);
			}
			this.setFileCountsForDisplay(filteredStudiesData);
			let headerCols = [];
			let colValues = [];
			for (var i=0; i< this.cols.length; i++) {
				headerCols.push(this.cols[i]['header']);
				colValues.push(this.cols[i]['field']);
			}
			let localSelectedStudyies = [];
			let localSelectedStudies = [];
			for(let study of filteredStudiesData) {
				//if the export column column does not value, set it to empty
				for (var i=0;i<colValues.length;i++) {
				  if (!study[colValues[i]]) {
						study[colValues[i]] = '';
				  }
				  //PDC-2617 - Set "N/A" value if embargo date column value is empty
				  if (headerCols[i] == "Embargo date" && study[colValues[i]] == '') {
					  study[colValues[i]] = "N/A";
				  }
				   //PDC-5245 init file count to 0
				  if (headerCols[i] == "RAW" && study[colValues[i]] == '') {
					  study[colValues[i]] = "0";
				  }
				  if (headerCols[i] == "Processed Mass Spectra" && study[colValues[i]] == '') {
					  study[colValues[i]] = "0";
				  }
				  if (headerCols[i] == "METADATA" && study[colValues[i]] == '') {
					  study[colValues[i]] = "0";
				  }
				  if (headerCols[i] == "PSM" && study[colValues[i]] == '' && study.analytical_fraction != 'Metabolome' && study.analytical_fraction != 'Lipidome') {
					  study[colValues[i]] = "0";
				  } else if (headerCols[i] == "PSM" && study[colValues[i]] == '' && (study.analytical_fraction == 'Metabolome' || study.analytical_fraction == 'Lipidome')) {
					study[colValues[i]] = "N/A";
				  }
				  if (headerCols[i] == "Protein Assembly" && study[colValues[i]] == '' && study.analytical_fraction != 'Metabolome' && study.analytical_fraction != 'Lipidome') {
					  study[colValues[i]] = "0";
				  } else if (headerCols[i] == "Protein Assembly" && study[colValues[i]] == '' && (study.analytical_fraction == 'Metabolome' || study.analytical_fraction == 'Lipidome')) {
					study[colValues[i]] = "N/A";
				  }
				  if (headerCols[i] == "Quality Metrics" && study[colValues[i]] == '' && study.analytical_fraction != 'Metabolome' && study.analytical_fraction != 'Lipidome') {
					  study[colValues[i]] = "0";
				  } else if (headerCols[i] == "Quality Metrics" && study[colValues[i]] == '' && (study.analytical_fraction == 'Metabolome'  || study.analytical_fraction == 'Lipidome')) {
					study[colValues[i]] = "N/A";
				  }


				}
				localSelectedStudies.push(study);
			}
			if (buttonClick) {
				//@@@PDC-1063: Implement select all, select page, select none for all tabs
				this.headercheckbox = true;
				let emptyArray = [];
				this.selectedStudies = [];
				let localSelectedStudyies = emptyArray.concat(this.selectedStudies);
				for(let study of data.getPaginatedUIStudy.uiStudies){
					localSelectedStudyies.push(study);
				}
      	this.selectedStudies = localSelectedStudyies;

				//@@@PDC-3667: "Select all pages" option issue
				this.updateCurrentPageSelectedStudy(localSelectedStudyies);
				//@@@PDC-3667: "Select all pages" option issue
				//this.updateCurrentPageSelectedStudy(localSelectedStudyies);
			} else {
				let exportFileObject = JSON.parse(JSON.stringify(localSelectedStudies, colValues));
				if (this.manifestFormat == "csv") {
					let csvOptions = {
						headers: headerCols
					};
					new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
				}else {
					//For TSV format have to preprocess and use different function than CSV
					let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
					var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
					FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
				}
				this.isTableLoading.emit({isTableLoading:"study:false"});
			}
			console.log("======IN STUDY==");
			console.log(localSelectedStudies);
			console.log(this.selectedStudies);
			});
		}, 10);
	}
	//PDC-2617 - Set "N/A" value if embargo date column value is empty
	setEmptyEmbargoDate(idx: number){
		if (this.filteredStudiesData[idx].embargo_date === null || this.filteredStudiesData[idx].embargo_date === ""){
			this.filteredStudiesData[idx].embargo_date = "N/A";
		}
	}

	//@@@PDC-3667: "Select all pages" option issue
	updateCurrentPageSelectedStudy(localSelectedStudies) {
		let cloneData = _.cloneDeep(localSelectedStudies);
		cloneData = cloneData.splice(0, this.pageSize);
		this.currentPageSelectedStudy = [];
		cloneData.forEach(item => {this.currentPageSelectedStudy.push(item.study_submitter_id)});
	}

	/* Helper function to determine whether the download all button should be disabled or not */
	iscompleteManifestDisabled() {
		if (this.filtersSelected) {
		  if (this.filtersSelected > 0) {
			  return false;
		  } else {
			  return true;
		  }
	  } else {
		  return true;
	  }
	}

  //@@@PDC-260
  /* Small helper function to determine whether the download button should be disabled or not */
  isDownloadDisabled(){
	  if (this.selectedStudies) {
		  if (this.selectedStudies.length > 0) {
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

	//@@@PDC-1063: Implement select all, select page, select none for all tabs
	changeHeaderCheckbox($event) {
		let checkboxVal = this.selectedHeaderCheckbox;
		this.selectedStudies = this.currentPageSelectedStudy = [];
		switch (checkboxVal) {
      //@@@PDC-7110 - fix checkbox update - check the selection and then set checkbox accordingly
      //@@@PDC-7127 - fix study select checkbox to respond in same amount of time as other entities
			case 'Select all pages':
				this.downloadCompleteManifest(true);
				break;
			case 'Select this page':
				this.headercheckbox = true;
				this.onTableHeaderCheckboxToggle();
				break;
			case 'Select None':
				this.clearSelection();
				break;
		}
	}
  //@@@PDC-7012 improve browse checkbox intuitiveness -
  triggerchangeHeaderCheckbox($event) {
      //@@@PDC-7110 - fix checkbox update - check the selection and then set checkbox accordingly
      //@@@PDC-7127 - fix study select checkbox to respond in same amount of time as other entities
      let checkboxVal = this.selectedHeaderCheckbox;
      this.selectedStudies = this.currentPageSelectedStudy = [];
      switch (this.selectedHeaderCheckbox) {
        case 'Select all pages':
              this.downloadCompleteManifest(true);
              break;
        case 'Select this page':
              this.headercheckbox = true;
              this.onTableHeaderCheckboxToggle();
              break;
        case 'Select None':
              this.clearSelection();
              break;
      }
      //@@@PDC-7110 - check if there are unchecked checkboxes in table - if so then deselect checkbox
      let found = this.browsePageCheckboxes._results.some(el => el.checked === false);
      if (found == false){
        this.headercheckbox = true;
      } else {
        this.headercheckbox = false;
      }
      this.dataForManifestExport.open();
  }

  //@@@PDC-7109 improve browse checkbox intuitiveness - bug where 'Select None' remained checked when selected
  chkBoxSelectionCheck(selectedOption) {
      console.log("inside checkbox selection");
      if (selectedOption == 'Select None'){
        this.headercheckbox = false;
        this.dataForManifestExport.close();
      } else {
        this.headercheckbox = true;
      }
  }

  // This function is a callback for pagination controls
  // It is called when a new page needs to be loaded from the DB
	//@@@PDC-497 (onLazyLoad)="loadNewPage($event)" will be invoked when sort event fires
	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  loadNewPage(event: any){
	if(this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.offset) === -1){
		this.pageHeaderCheckBoxTrack.push(this.offset);
	}else if(!this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
		this.pageHeaderCheckBoxTrack.splice(this.pageHeaderCheckBoxTrack.indexOf(this.offset),1);
	}
	let field = event.sortField;
	let order = event.sortOrder;
	if (field !== undefined) {
		if (order === 1) {
			this.sort = ' ' + field + ' asc ';
		} else if (order === -1) {
			this.sort = ' ' + field + ' desc ';
		}
	}
	this.offset = event.first;
	  this.limit = event.rows;
	  this.loading = true;
	  this.browseByStudyService.getFilteredStudiesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
	    //@@@PDC-379 collapse study records with different disease_type and primary_site
		this.filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
		for (let idx = 0; idx < this.filteredStudiesData.length; idx++ ){
			this.concatinateDataEnd(idx);
			this.setEmptyEmbargoDate(idx);
		}
		this.setFileCountsForDisplay();
			//this.filteredStudiesData = data.getPaginatedUIStudy.uiStudies;
			//@@@PDC-3700: Existing issues with Checkbox handling on "Browse" page
			//Page size should be available for all offsets
			this.pageSize = data.getPaginatedUIStudy.pagination.size;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIStudy.total;
				this.studyTotalRecordChanged.emit({ type: 'study', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUIStudy.pagination.from;
				this.limit = data.getPaginatedUIStudy.pagination.size;
			}
			this.loading = false;
			this.trackCurrentPageSelectedStudy(data.getPaginatedUIStudy.uiStudies);
			if (this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1) {
				this.headercheckbox = true;
			} else {
				this.headercheckbox = false;
			}
			//@@@PDC-3667: "Select all pages" option issue
			this.handleCheckboxSelections();
			//this.makeRowsSameHeight();
		});
	}

	//@@@PDC-3667: "Select all pages" option issue
	handleCheckboxSelections() {
    console.log(this.currentPageSelectedStudy);
		if (this.currentPageSelectedStudy.length === this.pageSize) {
      console.log("line 688");
			this.headercheckbox = true;
		} else {
      console.log("line 691");
			if (this.totalRecords - this.offset < this.pageSize) {
				//For the last page
				if (this.currentPageSelectedStudy.length === this.totalRecords - this.offset) {
					this.headercheckbox = true;
				} else {
					this.headercheckbox = false;
				}
			} else {
				this.headercheckbox = false;
			}
		}
	}

	//@@@PDC-2534 - Concatinate 'Not Reported' primary site at the end of the primary sites list
	concatinateDataEnd(index: number){

		//Primary Site column on Browse page
		if (this.filteredStudiesData[index].primary_site && this.filteredStudiesData[index].primary_site.indexOf("Not Reported") == 0){
			var temp = this.filteredStudiesData[index].primary_site.split(";");
			//if there is more than one element in primary sites list
			if (temp.length > 1){
				this.filteredStudiesData[index].primary_site = temp.slice(1).join("; ") + "; " + temp[0];
			}
		}else if (this.filteredStudiesData[index].primary_site && this.filteredStudiesData[index].primary_site.indexOf("Other") == 0){
			var temp = this.filteredStudiesData[index].primary_site.split(";");
			//if there is more than one element in primary sites list
			if (temp.length > 1){
				this.filteredStudiesData[index].primary_site = temp.slice(1).join("; ") + "; " + temp[0];
			}
		} else if (this.filteredStudiesData[index].primary_site && this.filteredStudiesData[index].primary_site != "") {
			var temp = this.filteredStudiesData[index].primary_site.split(";");
			if (temp.length > 1){
				this.filteredStudiesData[index].primary_site = temp.join("; ");
			}
		}

		//Disease Type column
		if (this.filteredStudiesData[index].disease_type && this.filteredStudiesData[index].disease_type.indexOf("Not Reported") == 0){
			var temp = this.filteredStudiesData[index].disease_type.split(";");
			//if there is more than one element in primary sites list
			if (temp.length > 1){
				this.filteredStudiesData[index].disease_type = temp.slice(1).join("; ") + "; " + temp[0];
			}
		}else if (this.filteredStudiesData[index].disease_type && this.filteredStudiesData[index].disease_type.indexOf("Other") == 0){
			var temp = this.filteredStudiesData[index].disease_type.split(";");
			//if there is more than one element in primary sites list
			if (temp.length > 1){
				this.filteredStudiesData[index].disease_type = temp.slice(1).join("; ") + "; " + temp[0];
			}
		} else if (this.filteredStudiesData[index].disease_type && this.filteredStudiesData[index].disease_type != "") {
			var temp = this.filteredStudiesData[index].disease_type.split(";");
			if (temp.length > 1){
				this.filteredStudiesData[index].disease_type = temp.join("; ");
			}
		}
	}

	//@@@PDC-2598 - Apply conditional formatting to embargo date on the study summary pages
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
	  //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
	  this.activatedRoute.queryParams.subscribe(queryParams => {
		if (queryParams.code) {
		   this.fenceRequest = true;
		}
	  });
	  //Have to define this structure for Primeng CSV export to work properly (https://github.com/primefaces/primeng/issues/5114)
		//@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
		this.cols = [
		//@@@PDC-1930: Add the new PDC id on the study tab table and in all the manifests
    //@@@PDC-6300: remove embargo date from manifests {field: 'embargo_date', header: 'Embargo date'},
		{field: 'pdc_study_id', header: 'PDC Study ID'},
		{field: 'study_id', header: 'Study ID'},
		{field: 'study_submitter_id', header: 'Study Submitter ID'},
		{field: 'submitter_id_name', header:'Study Name' },
		{field: 'project_name', header: 'Project Name'},
		{field: 'program_name', header: 'Program Name'},
		{field: 'disease_type', header: 'Disease Type'},
		{field: 'primary_site', header: 'Primary Site'},
		{field: 'analytical_fraction', header: 'Analytical Fraction'},
		{field: 'experiment_type', header: 'Experiment Type'},
		{field: 'raw_count', header: 'RAW'},
		{field: 'mzml_count', header: 'Processed Mass Spectra'},
		{field: 'metadata_count', header: 'METADATA'},
		{field: 'psm_count', header: 'PSM'},
		{field: 'protein_assembly_count', header: 'Protein Assembly'},
		//{field: 'protein_databases_count', header: 'Protein Databases'},
		{field: 'quality_metrics_count', header: 'Quality Metrics'},
		{field: 'cases_count', header: 'Cases #'}
		];
		//@@@PDC-1063: Implement select all, select page, select none for all tabs
		this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
		this.frozenColumns = [
			{field: 'pdc_study_id', header: 'PDC Study ID'},
		];

  }
  //@@@PDC-379 collapse study records with different disease_type and primary_site
  mergeStudies(studies: AllStudiesData[]){
	 var mergedStudies = [];
	 var studyName = '';
	 if (typeof(studies[0]) !== 'undefined') {
	  studyName = studies[0].submitter_id_name;
	 }
	  var tempStudy = Object.assign({}, studies[0]);

	  for (let idx = 1; idx < studies.length; idx++ ){
		if (studies[idx].submitter_id_name === studyName) {
			tempStudy.disease_type = tempStudy.disease_type + ', '+ studies[idx].disease_type;
			tempStudy.primary_site = tempStudy.primary_site + ', '+ studies[idx].primary_site;
			tempStudy.cases_count = tempStudy.cases_count + studies[idx].cases_count;
		}
		else {
			mergedStudies.push(tempStudy);
			studyName = studies[idx].submitter_id_name;
			tempStudy = Object.assign({}, studies[idx]);;
		}
	  }
	  mergedStudies.push(tempStudy);
	  return mergedStudies;

  }

  //@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
  // Send relevant data such as study name, file type to parent.
  changeTabForCaseCount(study_name: any) {
  	this.selectedTabChangeForCaseCount.emit({tabVal:2,studyName:study_name});
  }

	//@@@PDC-1252: Add data category as a filter for the "file counts" section of the Study table
  changeTabForFileType(study_name: any, fileType: string, dataCategory: string) {
		this.selectedTabChangeForFileType.emit({tabVal:3,studyName:study_name,fileType:fileType,dataCategory:dataCategory});
  }

  onResize(event) {
	//this.makeRowsSameHeight();
  }

	//@@@PDC-795 Change manifest download file name include timestamp
	studyTableExportCSV(dt){
		this.validateStudyField();
		dt.exportFilename = this.getCsvFileName("csv");
		dt.exportCSV({ selectionOnly: true });
	}

	//PDC-3073, PDC-3074 Add TSV format for manifests
	studyTableExportTSV(dt){
		this.validateStudyField();
		let colValues = [];
		for (var i=0; i< this.cols.length; i++) {
			colValues.push(this.cols[i]['field']);
		}
		let exportFileObject = JSON.parse(JSON.stringify(this.selectedStudies, colValues));
		let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
		var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
		FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
	}

	//PDC-4129 export 0 by default
	validateStudyField(){
		for(let study of this.selectedStudies){
			if(!study['raw_count']){
				study['raw_count'] = 0
			}
			if(!study['mzml_count']){
				study['mzml_count']=0
			}
			//PDC-4689 set metadata count to 0 if none returned
			if(!study['metadata_count']){
				study['metadata_count']=0
			}
			if(!study['psm_count'] && study['analytical_fraction'] != "Metabolome" && study['analytical_fraction'] != "Lipidome"){
				study['psm_count']=0
			} else if(!study['psm_count'] && (study['analytical_fraction'] == "Metabolome" || study['analytical_fraction'] == "Lipidome")){
				study['psm_count'] = "N/A";
			}
			if(!study['protein_assembly_count'] && study['analytical_fraction'] != "Metabolome" && study['analytical_fraction'] != "Lipidome"){
				study['protein_assembly_count']=0
			} else if(!study['protein_assembly_count'] && (study['analytical_fraction'] == "Metabolome" || study['analytical_fraction'] == "Lipidome")){
				study['protein_assembly_count'] = "N/A";
			}
			if(!study['quality_metrics_count'] && study['analytical_fraction'] != "Metabolome" && study['analytical_fraction'] != "Lipidome"){
				study['quality_metrics_count']=0
			} else if(!study['quality_metrics_count'] && (study['analytical_fraction'] == "Metabolome" || study['analytical_fraction'] == "Lipidome")){
				study['quality_metrics_count'] = "N/A";
			}
		}
	}

	//help function preparing a string containing the data for TSV manifest file
	prepareTSVExportManifestData(manifestData){
		let result = "";
		let separator = '\t';
		let EOL = "\r\n";
		for (var i=0; i< this.cols.length; i++) {
			//@@@PDC-3482 headers in TSV file should match headers in CSV
			result += this.cols[i]['header'] + separator;
		}
		result = result.slice(0, -1);
		result += EOL;
		for (var i=0; i < manifestData.length; i++){
			//@@@PDC-3482 fix issue when some of the study values are zero
			for (var j=0; j < this.cols.length; j++) {
				var index = this.cols[j]['field'];
				if (manifestData[i][index] == null) {
					result += "" + separator;
				} else {
					result += manifestData[i][index] + separator;
				}
			}
			result = result.slice(0, -1).trim();
			result += EOL;
		}
		return result;
	}

	private getCsvFileName(format = "csv"): string {
		let csvFileName = "PDC_study_manifest_";
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

	versionCheck(studyVersions) {
		return (studyVersions.length > 1) || (studyVersions.length == 1 && Number(studyVersions[0].number) > 1);
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	onTableHeaderCheckboxToggle() {
    let emptyArray = [];
    let localSelectedStudyies = emptyArray.concat(this.selectedStudies);
    if (this.headercheckbox){
      for(let study of this.filteredStudiesData){
        if(this.currentPageSelectedStudy.indexOf(study.study_submitter_id) === -1){
          localSelectedStudyies.push(study);
          this.currentPageSelectedStudy.push(study.study_submitter_id);
        }
      }
      this.selectedStudies = localSelectedStudyies;
    } else {
			//@@@PDC-3667: "Select all pages" option issue
			for (let study of this.currentPageSelectedStudy) {
				let index = localSelectedStudyies.findIndex(x => x.study_submitter_id === study);
				if(index >-1){
					localSelectedStudyies.splice(index,1);
				}
      }
			this.selectedStudies = localSelectedStudyies;
			this.currentPageSelectedStudy = [];
			this.pageHeaderCheckBoxTrack = [];
    }
	console.log("=====THIS PAGE ====");
	console.log(this.selectedStudies);
  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  onRowSelected(event){
    if(event.originalEvent.pointerId === -1 ){
		this.currentPageSelectedStudy.push(event.data.study_submitter_id);
    this.selectedStudies.push(event.data);
		//@@@PDC-3667: "Select all pages" option issue
		this.handleCheckboxSelections();
    }
  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  onRowUnselected(event){
    let index = this.currentPageSelectedStudy.indexOf(event.data.study_submitter_id);

    if(index >-1){
      this.currentPageSelectedStudy.splice(index,1);
		}

		//@@@PDC-3667: "Select all pages" option issue
		this.handleCheckboxSelections();

  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	private clearSelection(){
    this.selectedStudies = [];
    this.headercheckbox = false;
    this.currentPageSelectedStudy = [];
    this.pageHeaderCheckBoxTrack = [];
  }

  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  private trackCurrentPageSelectedStudy(filteredFilesData: AllStudiesData[]){
    let fileIdList = [];
    this.currentPageSelectedStudy = [];
    filteredFilesData.forEach((item) => fileIdList.push(item.study_submitter_id));
    this.selectedStudies.forEach(item => {if(fileIdList.indexOf(item.study_submitter_id) !== -1){
      this.currentPageSelectedStudy.push(item.study_submitter_id);
    }});
  }

  //@@@PDC-4792: Increase font size in all tables to pass 508 compliance
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
					else if (frozen_rows[i].clientHeight < unfrozen_rows[i].clientHeight) {
						frozen_rows[i].style.height = unfrozen_rows[i].clientHeight+"px";
					}
				}
				//PDC-4806: Alignment issue in some resolutions
				//Scroll the unfrozen div to the left through a few columns, switch to another tab.
				//Navigate back to the parent tab -> columns should not be misaligned
 				let frozen_header_div: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-scrollable-header-box');
				frozen_header_div[0].setAttribute('style', 'margin-right: 0px !important');
			  }
			}
		 });
	   }
}
