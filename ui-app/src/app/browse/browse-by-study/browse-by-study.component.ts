import { Apollo } from 'apollo-angular';

import {
    Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AllStudiesData, FileCountsForStudyPage } from '../../types';
import { BrowseFiltersService } from '../filters/browse-filters.service';
import { StudySummaryComponent } from '../study-summary/study-summary.component';
import { BrowseByStudyService } from './browse-by-study.service';
import { ngxCsv } from "ngx-csv/ngx-csv";

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
export class BrowseByStudyComponent implements OnInit, OnChanges {

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


        dialogRef.afterClosed().subscribe(
            val => console.log("Dialog output:", val)
        );

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
		  });
	  }, 1000);
	}
	
	//@@@PDC-937: Add a button to allow download all manifests with a single click
	downloadAllManifest() {
		setTimeout(() => {
			this.downloadWholeManifestFlag.emit({downloadAllManifest:this.totalRecords});
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
							
					}
				} 
			}
		}
	}
  }
  
  ngOnChanges(changes: SimpleChanges){
	  // ngOnChanges fires when the page loads, at that moment newFilterValue is not set yet
	  if (this.newFilterValue){
		var filter_field=this.newFilterValue.split(":"); //the structure is field_name: "value1;value2"
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
		this.offset = 0; //Reinitialize offset for each new filter value
		this.loading = true;
		//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
		 //If its a fence request, set filters from local storage
		var selectedFiltersForBrowse = JSON.parse(localStorage.getItem("selectedFiltersForBrowse"));
		if (this.fenceRequest && selectedFiltersForBrowse) {
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
		this.setFileCountsForDisplay();
			//this.filteredStudiesData = data.getPaginatedUIStudy.uiStudies;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIStudy.total;
				this.studyTotalRecordChanged.emit({type: 'study', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIStudy.pagination.from;
				this.pageSize = data.getPaginatedUIStudy.pagination.size;
				this.limit = data.getPaginatedUIStudy.pagination.size;
			}
			this.loading = false;
			this.clearSelection();
		});
		}
		
		//@@@PDC-937: Add a button to allow download all manifests with a single click
		setTimeout(() => {
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
			this.browseByStudyService.getFilteredStudiesPaginated(0, this.totalRecords, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			let filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
			this.setFileCountsForDisplay(filteredStudiesData);
			let headerCols = [];
			let colValues = [];
			for (var i=0; i< this.cols.length; i++) {
				headerCols.push(this.cols[i]['header']);
				colValues.push(this.cols[i]['field']);
			}
			let localSelectedStudies = [];
			for(let study of filteredStudiesData) {
				//if the export column column does not value, set it to empty
				for (var i=0;i<colValues.length;i++) {
				  if (!study[colValues[i]]) {
						study[colValues[i]] = '';
					}
				}
				localSelectedStudies.push(study);
			}
			if (buttonClick) {
				//@@@PDC-1063: Implement select all, select page, select none for all tabs
				this.selectedStudies = localSelectedStudies;
				this.headercheckbox = true;
			} else {
				let csvOptions = {
					headers: headerCols
				};
				let exportFileObject = JSON.parse(JSON.stringify(localSelectedStudies, colValues));
				
				new ngxCsv(exportFileObject, this.getCsvFileName(), csvOptions);	
				this.isTableLoading.emit({isTableLoading:"study:false"});
			}
			});
		}, 10);
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
  
  // This function is a callback for pagination controls
  // It is called when a new page needs to be loaded from the DB  
	//@@@PDC-497 (onLazyLoad)="loadNewPage($event)" will be invoked when sort event fires  
	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  loadNewPage(event: any){
	if(event.rows !== this.pageSize){
		this.clearSelection();
	}
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
		this.setFileCountsForDisplay();
			//this.filteredStudiesData = data.getPaginatedUIStudy.uiStudies;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIStudy.total;
				this.studyTotalRecordChanged.emit({ type: 'study', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUIStudy.pagination.from;
				this.pageSize = data.getPaginatedUIStudy.pagination.size;
				this.limit = data.getPaginatedUIStudy.pagination.size;
			}
			this.loading = false;
			this.trackCurrentPageSelectedStudy(data.getPaginatedUIStudy.uiStudies);
		});
		if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
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
		{field: 'mzml_count', header: 'MZML'},
		{field: 'metadata_count', header: 'METADATA'},
		{field: 'psm_count', header: 'PSM'},
		{field: 'protein_assembly_count', header: 'PROT_ASSEM'},
		//{field: 'protein_databases_count', header: 'Protein Databases'},
		{field: 'quality_metrics_count', header: 'Quality Metrics'},
		{field: 'cases_count', header: 'Cases #'}		
		];
		//@@@PDC-1063: Implement select all, select page, select none for all tabs
		this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
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

	//@@@PDC-795 Change manifest download file name include timestamp 
	studyTableExportCSV(dt){
		dt.exportFilename = this.getCsvFileName();
		dt.exportCSV({ selectionOnly: true });
	}

	private getCsvFileName(): string {
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
    return csvFileName;
	}
	
	private convertDateString(value: string): string {
    if (value.length === 1) {
      return "0" + value;
    } else {
      return value;
    }
	}
	
	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	onTableHeaderCheckboxToggle() {
    console.log(this.headercheckbox);
    let emptyArray = [];
    let localSelectedStudyies = emptyArray.concat(this.selectedStudies);
    if(this.headercheckbox){
      for(let study of this.filteredStudiesData){
        if(this.currentPageSelectedStudy.indexOf(study.study_submitter_id) === -1){
          localSelectedStudyies.push(study);
          this.currentPageSelectedStudy.push(study.study_submitter_id);
        } 
      }
      this.selectedStudies = localSelectedStudyies;
    }else{
      this.selectedStudies = [];
      this.currentPageSelectedStudy = [];
      this.pageHeaderCheckBoxTrack = [];
    }
  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  onRowSelected(event:any){
    this.currentPageSelectedStudy.push(event.data.study_submitter_id);
    if(this.currentPageSelectedStudy.length === this.pageSize){
      this.headercheckbox = true;
    }
  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  onRowUnselected(event){
    let index = this.currentPageSelectedStudy.indexOf(event.data.study_submitter_id);
    if(index >-1){
      this.currentPageSelectedStudy.splice(index,1);
    }
    if(this.currentPageSelectedStudy.length === this.pageSize){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
    }
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
}



