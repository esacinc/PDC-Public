import { Apollo } from 'apollo-angular';

import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AllClinicalData } from '../../types';
import { BrowseByClinicalService } from './browse-by-clinical.service';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { ngxCsv } from "ngx-csv/ngx-csv";


@Component({
  selector: 'browse-by-clinical',
  templateUrl: './browse-by-clinical.component.html',
  styleUrls: ['../../../assets/css/global.css', './browse-by-clinical.component.css'],
  providers: [ BrowseByClinicalService]
})

//@@@PDC-232 Clinical tab UI
//@@@PDC-260 Download button improvements
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-262 get dictionary base url from environment object
//@@@PDC-456 Add a link to GDC on the Clinical tab for gdc_case_id field
//@@@PDC-518 Rearrange and update text on the browse page tabs and download
//@@@PDC-497 Make table column headers sortable on the browse page tabs
//@@@PDC-535 Add Clinical filters
//@@@PDC-567 Add sample_type filter
//@@@PDC-616 Add acquisition type to the general filters
//@@@PDC-739 Add hyperlink to case id on clinical tab to case summary page
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-937: Add a button to allow download all manifests with a single click
//@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
//@@@PDC-1063: Implement select all, select page, select none for all tabs
//@@@PDC-1235: Add imaging_reference to the external reference column for clinical data
//@@@PDC-1609: URL structure for permanent links to PDC 
//@@@PDC-2397 Update clinical manifest generation to include additional attributes
export class BrowseByClinicalComponent implements OnInit {

	filteredClinicalData: AllClinicalData[]; //Filtered list of clinical data
	loading: boolean = false; //Flag indicates that the data is still being loaded from server
	filterChangedFlag: boolean = true; //Flag indicates that filter selection was changed
  @Input() newFilterValue: any;
  newFilterSelected: any;
  //Pagination variables
  totalRecords: number;
  offset: number;
  limit: number;
  pageSize: number;
  selectedClinicalData: AllClinicalData[] = [];
  cols: any[];
  static urlBase;
	gdcUrl: string = environment.gdc_case_id_url;
	kidsFirstURL: string = environment.kidsFirst_url;
	@Output() clinicalTotalRecordChanged:EventEmitter<any> = new EventEmitter<any>();
	sort: string;
	fenceRequest:boolean = false;
	//keep a full list of filter category
	// Array which holds filter names. Must be updated when new filters are added to browse page. 
	allFilterCategory: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","study_name","submitter_id_name","sample_type","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable","studyName_genes_tab", "case_status", "biospecimen_status"];

  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	headercheckbox:boolean = false;
  currentPageSelectedClinical = [];
  pageHeaderCheckBoxTrack = [];	
  //@@@PDC-937: Add a button to allow download all manifests with a single click
  @Output() downloadWholeManifestFlag: EventEmitter<any> = new EventEmitter<any>();
  @Output() isTableLoading: EventEmitter<any> = new EventEmitter<any>();
  @Input() downloadAllManifests;
  @Input() handleTableLoading;
  @Input() enableDownloadAllManifests:any;
  // Determines if there are any selected filters in the browse component
  filtersSelected:any;
  iconFolder = 'assets/css/images/externalIcons/';
  externalCaseMap;
  //@@@PDC-1063: Implement select all, select page, select none for all tabs
  checkboxOptions = [];
  selectedHeaderCheckbox = '';
  
	
  constructor(private apollo: Apollo, private router: Router, private dialog: MatDialog,
				private browseByClinicalService : BrowseByClinicalService, private activatedRoute:ActivatedRoute) {
	// Array which holds filter names. Must be updated when new filters are added to browse page.  
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "studyName_genes_tab":"", "case_status": "", "biospecimen_status": ""};	
	this.offset = 0; //Initialize values for pagination
	this.limit = 10;
	this.totalRecords = 0;
	this.pageSize = 10;
	this.getAllClinicalData();
	this.sort = '';
	BrowseByClinicalComponent.urlBase = environment.dictionary_base_url;
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
							}]
	};
  
  get staticUrlBase() {
    return BrowseByClinicalComponent.urlBase;
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
  //@@@PDC-1012: Update UI for GDC Case ID becoming External Case ID
  displayTextforExternalID(externalCaseID: string, locationURL: string) {
	if (locationURL) return ''; else return externalCaseID;
  }

  //@@@PDC-739 Add hyperlink to case id on clinical tab to case summary page
  //Used for displaying Case summary modal
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
        summaryData: this.filteredClinicalData[case_index],
    };
	this.router.navigate([{outlets: {caseSummary: ['case-summary', case_id]}}], { skipLocationChange: true });
	const dialogRef = this.dialog.open(CaseSummaryComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        val => console.log("Dialog output:", val)
    );
  }
  
  //@@@PDC-739 Add hyperlink to case id on clinical tab to case summary page
  //Finds case details for a case id
  findCaseByID(case_id: string) {
	  for (let idx = 0; idx < this.filteredClinicalData.length; idx++ ){
		  if (this.filteredClinicalData[idx].case_submitter_id === case_id) {
			  return idx;
		  }
	  }
	  return -1;
  }
  
  /*API call to get all clinical data */
  getAllClinicalData(){
	  this.loading = true;
	  setTimeout(() => {
		this.browseByClinicalService.getFilteredClinicalDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
				this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
				this.totalRecords = data.getPaginatedUIClinical.total;
				this.clinicalTotalRecordChanged.emit({type: 'clinical', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIClinical.pagination.from;
				this.pageSize = data.getPaginatedUIClinical.pagination.size;
				this.limit = data.getPaginatedUIClinical.pagination.size;
				this.loading = false;
				this.clearSelection();
		  });
	  }, 1000);
  }
 
  ngOnChanges(changes: SimpleChanges){
	if (this.newFilterValue){
		this.filteredClinicalData = [];
		console.log(this.newFilterValue);
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
		this.browseByClinicalService.getFilteredClinicalDataPaginated(this.offset, this.limit,this.sort, this.newFilterSelected).subscribe((data: any) =>{
			this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIClinical.total;
				this.clinicalTotalRecordChanged.emit({type: 'clinical', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIClinical.pagination.from;
				this.pageSize = data.getPaginatedUIClinical.pagination.size;
				this.limit = data.getPaginatedUIClinical.pagination.size;
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
downloadAllManifest() {
	setTimeout(() => {
		this.downloadWholeManifestFlag.emit({downloadAllManifest:this.totalRecords});
	}, 10);
}

//@@@PDC-937: Add a button to allow download all manifests with a single click
downloadCompleteManifest(buttonClick = false) {
	setTimeout(() => {
		if (!buttonClick) {
			this.isTableLoading.emit({isTableLoading:"clinical:true"});
		}
		this.browseByClinicalService.getFilteredClinicalDataPaginated(0, this.totalRecords, this.sort, this.newFilterSelected).subscribe((data: any) =>{
		let filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
		let localSelectedClinical = [];
		for(let item of filteredClinicalData){
			localSelectedClinical.push(item);
		}
		if (buttonClick) {
			this.selectedClinicalData = localSelectedClinical;
			this.headercheckbox = true;
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
			let exportFileObject = JSON.parse(JSON.stringify(localSelectedClinical, colValues));		
			new ngxCsv(exportFileObject, this.getCsvFileName(), csvOptions);
			this.isTableLoading.emit({isTableLoading:"clinical:false"});
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
  /* Small helper function to detrmine whether the download button should be disabled or not */
isDownloadDisabled(){
	if (this.selectedClinicalData) {
		if (this.selectedClinicalData.length > 0) {
			return false;
		} else {
			return true;
		}
	} else {
		return true;
	}
}

  // This function is a callback for pagination controls
	// It is called when a new page needs to be loaded from the DB  
	//@@@PDC-497 (onLazyLoad)="loadNewPage($event)" will be invoked when sort event fires  
	loadNewPage(event: any) {
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
		this.browseByClinicalService.getFilteredClinicalDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) => {
			this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIClinical.total;
				this.clinicalTotalRecordChanged.emit({ type: 'clinical', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUIClinical.pagination.from;
				this.pageSize = data.getPaginatedUIClinical.pagination.size;
				this.limit = data.getPaginatedUIClinical.pagination.size;
			}
			this.loading = false;
			this.trackCurrentPageSelectedCase(data.getPaginatedUIClinical.uiClinical);
		});

		if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
    }
	}

	//@@@PDC-1063: Implement select all, select page, select none for all tabs
	changeHeaderCheckbox($event) {
		let checkboxVal = this.selectedHeaderCheckbox;
		this.selectedClinicalData = this.currentPageSelectedClinical = [];
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
	
  ngOnInit() {
	  //Have to define this structure for Primeng CSV export to work properly
	  //@@@PDC-462 show submitter id
	  //@@@PDC-1305 add age_at_diagnosis et al
	  //@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
	  //@@@PDC-2397 Update clinical manifest generation to include additional attributes	  
	  this.cols = [
		{field: 'case_id', header: 'Case ID'},
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
		{field: 'progression_or_recurrence', header: 'Progession or Recurrence'},
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
		{field: 'year_of_diagnosis', header: 'Year of Diagnosis'}
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

		//@@@PDC-795 Change manifest download file name include timestamp 
		clinicalTableExportCSV(dt){
			dt.exportFilename = this.getCsvFileName();
			dt.exportCSV({ selectionOnly: true });
		}
	
		private getCsvFileName(): string {
			let csvFileName = "PDC_clinical_manifest_";
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
				let localSelectedClinical = emptyArray.concat(this.selectedClinicalData);
				if(this.headercheckbox){
					for(let item of this.filteredClinicalData){
						if(this.currentPageSelectedClinical.indexOf(item.case_submitter_id) === -1){
							localSelectedClinical.push(item);
							this.currentPageSelectedClinical.push(item.case_submitter_id);
						} 
					}
					this.selectedClinicalData = localSelectedClinical;
				}else{
					this.selectedClinicalData = [];
					this.currentPageSelectedClinical = [];
					this.pageHeaderCheckBoxTrack = [];
				}
			}
		
			//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
			onRowSelected(event:any){
				this.currentPageSelectedClinical.push(event.data.case_submitter_id);
				if(this.currentPageSelectedClinical.length === this.pageSize){
					this.headercheckbox = true;
				}
			}
		
			//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
			onRowUnselected(event){
				let index = this.currentPageSelectedClinical.indexOf(event.data.case_submitter_id);
				if(index >-1){
					this.currentPageSelectedClinical.splice(index,1);
				}
				if(this.currentPageSelectedClinical.length === this.pageSize){
					this.headercheckbox = true;
				}else{
					this.headercheckbox = false;
				}
			}
		
			//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
			private clearSelection(){
				this.selectedClinicalData = [];
				this.headercheckbox = false;
				this.currentPageSelectedClinical = [];
				this.pageHeaderCheckBoxTrack = [];
			}
		
			//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
			private trackCurrentPageSelectedCase(filteredFilesData: AllClinicalData[]){
				let fileIdList = [];
				this.currentPageSelectedClinical = [];
				filteredFilesData.forEach((item) => fileIdList.push(item.case_submitter_id));
				this.selectedClinicalData.forEach(item => {if(fileIdList.indexOf(item.case_submitter_id) !== -1){
					this.currentPageSelectedClinical.push(item.case_submitter_id);
				}});
			}		

}
