import { Apollo } from 'apollo-angular';

import {
    Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AllCasesData, AllUICasesData } from '../../types';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { BrowseByCaseService } from './browse-by-case.service';
import { ngxCsv } from "ngx-csv/ngx-csv";
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';

@Component({
  selector: 'browse-by-case',
  templateUrl: './browse-by-case.component.html',
  styleUrls: ['../../../assets/css/global.css', './browse-by-case.component.scss'],
	providers: [ BrowseByCaseService]
})

//@@@PDC-169 The user should be able to browse data by Case
//@@@PDC-237 Pagination
//@@@PDC-244 Table rows selection and download
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-288 Added Case Summary overlay window for each case id
//@@@PDC-328 Make all summary pages model dialogs and add an X rather than close button to close
//@@@PDC-262 get dictionary base url from environment object
//@@@PDC-417 - fix popup dialog size
//@@@PDC-518 Rearrange and update text on the browse page tabs and download
//@@@PDC-374 - adding url to overlay windows
//@@@PDC-497 Make table column headers sortable on the browse page tabs
//@@@PDC-535 Add Clinical filters
//@@@PDC-567 - add Biospecimen filters
//@@@PDC-616 Add acquisition type to the general filters
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-937: Add a button to allow download all manifests with a single click
//@@@PDC-1063: Implement select all, select page, select none for all tabs
//@@@PDC-1609: URL structure for permanent links to PDC 
//@@@PDC-2399: Update biospecimen manifest generation to include new attributes
export class BrowseByCaseComponent implements OnInit, OnChanges {

  filteredCasesData: AllUICasesData[]; //Filtered list of cases
  loading: boolean = false; //Flag indicates that the data is still being loaded from server
  filterChangedFlag: boolean = true; //Flag indicates that filter selection was changed
  @Input() newFilterValue: any;
  newFilterSelected: any;
  //Pagination variables
  totalRecords: number;
  offset: number;
  limit: number;
  pageSize: number;
  selectedCases: AllUICasesData[] = [];
  cols: any[];
  static urlBase;
  sort: string;
  @Output() biospecimenTotalRecordChanged:EventEmitter<any> = new EventEmitter<any>();
  fenceRequest:boolean = false;
  //keep a full list of filter category
  // Array which holds filter names. Must be updated when new filters are added to browse page. 
  allFilterCategory: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","study_name","submitter_id_name","sample_type","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable","studyName_genes_tab", "biospecimen_status", "case_status"];
  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	headercheckbox:boolean = false;
  currentPageSelectedCase = [];
	pageHeaderCheckBoxTrack = [];	
	//@@@PDC-937: Add a button to allow download all manifests with a single click
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
	
  constructor(private apollo: Apollo,
				private router: Router,
				private browseByCaseService : BrowseByCaseService,
				private dialog: MatDialog,
				private activatedRoute:ActivatedRoute) { 
	// Array which holds filter names. Must be updated when new filters are added to browse page. 
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "studyName_genes_tab":"", "biospecimen_status": "", "case_status": ""};
	this.offset = 0; //Initialize values for pagination
	this.limit = 10;
	this.totalRecords = 0;
	this.pageSize = 10;
	this.getAllCasesData();
	this.sort = "";
	BrowseByCaseComponent.urlBase = environment.dictionary_base_url;
  }
  
  get staticUrlBase() {
    return BrowseByCaseComponent.urlBase;
  }
  
  showCaseSummary(case_id: string){
	
	const dialogConfig = new MatDialogConfig();
	
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
	dialogConfig.hasBackdrop = true;
	//dialogConfig.minWidth = '1000px';
	dialogConfig.width = '80%';
	dialogConfig.height = '95%'

	var case_index = this.findCaseByID(case_id);
    dialogConfig.data = {
        summaryData: this.filteredCasesData[case_index],
    };
	this.router.navigate([{outlets: {caseSummary: ['case-summary', case_id]}}], { skipLocationChange: true });
	const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        val => console.log("Dialog output:", val)
    );

  }
  
  findCaseByID(case_id: string) {
	  for (let idx = 0; idx < this.filteredCasesData.length; idx++ ){
		  if (this.filteredCasesData[idx].case_submitter_id === case_id) {
			  return idx;
		  }
	  }
	  return -1;
  }
  /*API call to get all cases data */
  getAllCasesData(){
	  this.loading = true;
	  setTimeout(() => {
		  this.browseByCaseService.getFilteredCasesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			this.filteredCasesData = data.getPaginatedUICase.uiCases;
			this.totalRecords = data.getPaginatedUICase.total;
			this.biospecimenTotalRecordChanged.emit({type: 'biospecimen', totalRecords:this.totalRecords});
			this.offset = data.getPaginatedUICase.pagination.from;
			this.pageSize = data.getPaginatedUICase.pagination.size;
			this.limit = data.getPaginatedUICase.pagination.size;
			this.loading = false;
			this.clearSelection();
			});
			
	  }, 1000);
  }
  
  ngOnChanges(changes: SimpleChanges){
	  // ngOnChanges fires when the page loads, at that moment newFilterValue is not set yet
	  if (this.newFilterValue){
		this.filteredCasesData = []; //initialize cases list
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
			this.newFilterSelected["acquisition_type"] = ""
			this.newFilterSelected["biospecimen_status"] = "";
			this.newFilterSelected["case_status"] = "";
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
				  }  else if (filterName == "studyName_genes_tab") {
					selectedFiltersForBrowse["study_name"] = filterVal;
				  } else {
					selectedFiltersForBrowse[filterName] = filterVal.join(";");
				  }
				}
			}
			this.newFilterSelected = selectedFiltersForBrowse;
		}
		this.offset = 0; //Reinitialize offset for each new filter value
		this.loading = true;
		this.browseByCaseService.getFilteredCasesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			this.filteredCasesData = data.getPaginatedUICase.uiCases;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUICase.total;
				this.biospecimenTotalRecordChanged.emit({type: 'biospecimen', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUICase.pagination.from;
				this.pageSize = data.getPaginatedUICase.pagination.size;
				this.limit = data.getPaginatedUICase.pagination.size;
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
    //PDC-3073: Add TSV format to manifests
	downloadAllManifest(exportFormat = "csv") {
		setTimeout(() => {
			this.downloadWholeManifestFlag.emit({downloadAllManifest:this.totalRecords, format: exportFormat});
		}, 10);
	}
	
	//@@@PDC-937: Add a button to allow download all manifests with a single click
	downloadCompleteManifest(buttonClick = false) {
		setTimeout(() => {
			if (!buttonClick) {
				this.isTableLoading.emit({isTableLoading:"case:true"});
			} else {
				this.loading = true;
			}
			this.browseByCaseService.getFilteredCasesPaginated(0, this.totalRecords, this.sort, this.newFilterSelected).subscribe((data: any) =>{
					let filteredCasesData = data.getPaginatedUICase.uiCases;
					let localSelectedCases = [];
					for(let item of filteredCasesData){
							localSelectedCases.push(item);
					}
					if (buttonClick) {
						this.selectedCases = localSelectedCases;
						this.headercheckbox = true;
						//@@@PDC-3667: "Select all pages" option issue
						this.updateCurrentPageSelectedCases(localSelectedCases);
						this.loading = false;
					} else {
						let headerCols = [];
						let colValues = [];
						for (var i=0; i< this.cols.length; i++) {
							headerCols.push(this.cols[i]['header']);
							colValues.push(this.cols[i]['field']);
						}
						let csvOptions = {
							headers: headerCols
						};
						//PDC-3206 fix ddownload manifest even if there are zero records 
						if (this.totalRecords > 0) {
							let exportFileObject = JSON.parse(JSON.stringify(localSelectedCases, colValues));	
							if (this.manifestFormat == "csv") {
								new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
							}else {
								//For TSV format have to preprocess and use different function than CSV
								let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
								var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
								FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
							}
						}
						this.isTableLoading.emit({isTableLoading:"case:false"});
				  }
			});				
		}, 10);
	}

	//@@@PDC-3667: "Select all pages" option issue
	updateCurrentPageSelectedCases(localSelectedCases) {
		let cloneData = _.cloneDeep(localSelectedCases);
		cloneData = cloneData.splice(0, this.pageSize);
		this.currentPageSelectedCase = [];
		cloneData.forEach(item => {this.currentPageSelectedCase.push(item. aliquot_id + "-" + item.aliquot_submitter_id)});
	}

	//@@@PDC-497 (onLazyLoad)="loadCases($event)" will be invoked when sort event fires  
	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	loadCases(event: any) {
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
		this.browseByCaseService.getFilteredCasesPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) => {
			this.filteredCasesData = data.getPaginatedUICase.uiCases;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUICase.total;
				this.biospecimenTotalRecordChanged.emit({ type: 'biospecimen', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUICase.pagination.from;
				this.limit = data.getPaginatedUICase.pagination.size;
			}
			//@@@PDC-3700: Existing issues with Checkbox handling on "Browse" page
			//Page size should be available for all offsets
			this.pageSize = data.getPaginatedUICase.pagination.size;
			this.loading = false;
			this.trackCurrentPageSelectedCase(data.getPaginatedUICase.uiCases);
			if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
				this.headercheckbox = true;
			}else{
				this.headercheckbox = false;
			}
			//@@@PDC-3667: "Select all pages" option issue
			this.handleCheckboxSelections();
		});
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
  /* Small helper function to detrmine whether the download button should be disabled or not */
  isDownloadDisabled(){
	  if (this.selectedCases) {
		  if (this.selectedCases.length > 0) {
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
  ngOnInit() {
	  this.totalRecords = 500; //inital value
	  //Have to define the following structure for Primeng CSV export to work properly
		//@@@PDC-462 show submitter ids
		//@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
	  this.cols = [
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
		{field: 'composition', header: 'Composition'},
		{field: 'current_weight', header: 'Current Weight'},
		{field: 'days_to_collection', header: 'Days To Collection'},
		{field: 'days_to_sample_procurement', header: 'Days To Sample Procurement'},
		{field: 'diagnosis_pathologically_confirmed', header: 'Diagnosis Pathologically Confirmed'},
		{field: 'freezing_method', header: 'Freezing Method'},
		{field: 'initial_weight', header: 'Initial Weight'},
		{field: 'intermediate_dimension', header: 'Intermediate Dimension'},
		{field: 'is_ffpe', header: 'Is FFPE'},
		{field: 'longest_dimension', header: 'Longest Dimension'},
		{field: 'method_of_sample_procurement', header: 'Method Of Sample Procurement'},
		{field: 'oct_embedded', header: 'Oct Embedded'},
		{field: 'pathology_report_uuid', header: 'Pathilogy Report UUID'},
		{field: 'preservation_method', header: 'Preservation Method'},
		{field: 'sample_type_id', header: 'Sample Type id'},
		{field: 'shortest_dimension', header: 'Shortest Dimension'},
		{field: 'time_between_clamping_and_freezing', header: 'Time Between Clamping And Freezing'},
		{field: 'time_between_excision_and_freezing', header: 'Time Between Excision and Freezing'},
		{field: 'tissue_type', header: 'Tissue Type'},
		{field: 'tumor_code', header: 'Tumor Code'},
		{field: 'tumor_code_id', header: 'Tumor Code ID'},
		{field: 'tumor_descriptor', header: 'Tumor Descriptor'},
		{field: 'program_name', header: 'Program Name'}
	  ];
	  //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
	  this.activatedRoute.queryParams.subscribe(queryParams => {
		if (queryParams.code) {
		   this.fenceRequest = true;
		}
		});	
		//@@@PDC-1063: Implement select all, select page, select none for all tabs
		this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
	}
	
	//@@@PDC-1063: Implement select all, select page, select none for all tabs
	changeHeaderCheckbox($event) {
		let checkboxVal = this.selectedHeaderCheckbox;
		this.selectedCases =  this.currentPageSelectedCase =  [];
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

		//@@@PDC-795 Change manifest download file name include timestamp 
		biospecimenTableExportCSV(dt){
			dt.exportFilename = this.getCsvFileName("csv");
			dt.exportCSV({ selectionOnly: true });
		}
		
		//PDC-3073, PDC-3074 Add TSV format for manifests
		biospecimenTableExportTSV(dt){
			let colValues = [];
			for (var i=0; i< this.cols.length; i++) {
				colValues.push(this.cols[i]['field']);
			}
			let exportFileObject = JSON.parse(JSON.stringify(this.selectedCases, colValues));
			let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
			var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
			FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
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
				for (const index in manifestData[i]) {
					if (manifestData[i][index] == null) {
						result += separator;
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
			let csvFileName = "PDC_biospecimen_manifest_";
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

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	//@@@PDC-1431 fix biospecimens table row selection issue
	onTableHeaderCheckboxToggle() {
    console.log(this.headercheckbox);
    let emptyArray = [];
    let localSelectedCases = emptyArray.concat(this.selectedCases);
    if(this.headercheckbox){
      for(let item of this.filteredCasesData){
        if(this.currentPageSelectedCase.indexOf(item. aliquot_id + "-" + item.aliquot_submitter_id) === -1){
          localSelectedCases.push(item);
          this.currentPageSelectedCase.push(item. aliquot_id + "-" + item.aliquot_submitter_id);
        } 
      }
      this.selectedCases = localSelectedCases;
    } else {
			//@@@PDC-3667: "Select all pages" option issue
			for (let caseValue of this.currentPageSelectedCase) {
				let index = localSelectedCases.findIndex(x => (x.aliquot_id + "-" + x.aliquot_submitter_id) === caseValue);
				if (index >-1) {
					localSelectedCases.splice(index,1);
				}
			}
			this.selectedCases = localSelectedCases; 
			this.currentPageSelectedCase = [];
			this.pageHeaderCheckBoxTrack = [];
    }
  }
  
  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  //@@@PDC-1431 fix biospecimens table row selection issue	
  onRowSelected(event:any){
		this.currentPageSelectedCase.push(event.data.aliquot_id + "-" + event.data.aliquot_submitter_id);
		//@@@PDC-3667: "Select all pages" option issue
		this.handleCheckboxSelections();
  }

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  //@@@PDC-1431 fix biospecimens table row selection issue	
  onRowUnselected(event){
    let index = this.currentPageSelectedCase.indexOf(event.data.aliquot_id + "-" + event.data.aliquot_submitter_id);
    if(index >-1){
      this.currentPageSelectedCase.splice(index,1);
		}
		//@@@PDC-3667: "Select all pages" option issue
		this.handleCheckboxSelections();
	}
	
	//@@@PDC-3667: "Select all pages" option issue
	handleCheckboxSelections() {
		if (this.currentPageSelectedCase.length === this.pageSize) {
			this.headercheckbox = true;
		} else {
			//For the last page
			if (this.totalRecords - this.offset < this.pageSize) {
				if (this.currentPageSelectedCase.length === this.totalRecords - this.offset) {
					this.headercheckbox = true;
				} else {
					this.headercheckbox = false;
				}
			} else {
				this.headercheckbox = false;
			}
		}
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	private clearSelection(){
    this.selectedCases = [];
    this.headercheckbox = false;
    this.currentPageSelectedCase = [];
    this.pageHeaderCheckBoxTrack = [];
  }

  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
  //@@@PDC-1431 fix biospecimens table row selection issue
  private trackCurrentPageSelectedCase(filteredFilesData: AllCasesData[]){
    let fileIdList = [];
    this.currentPageSelectedCase = [];
    filteredFilesData.forEach((item) => fileIdList.push(item['aliquot_id'] + "-" + item.aliquot_submitter_id));
    this.selectedCases.forEach(item => {if(fileIdList.indexOf(item.aliquot_id + "-" + item.aliquot_submitter_id) !== -1){
      this.currentPageSelectedCase.push(item.aliquot_id + "-" + item.aliquot_submitter_id);
    }});
  }
}
