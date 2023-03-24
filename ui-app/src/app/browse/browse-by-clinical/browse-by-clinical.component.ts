import { Apollo } from 'apollo-angular';

import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AllClinicalData } from '../../types';
import { BrowseByClinicalService } from './browse-by-clinical.service';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { ngxCsv } from "ngx-csv/ngx-csv";
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import { take } from 'rxjs/operators';

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
	filteredAdditionalClinicalData: AllClinicalData[];
	filteredExposureClinicalData: AllClinicalData[];
	filteredFollowUpClinicalData: AllClinicalData[];
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
  exposureCols: any[];
  followUpCols: any[];
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
  manifestFormat = "csv";
  frozenColumns = [];
  @Input() childTabChanged: string;

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
		  if (this.filteredClinicalData[idx].case_id === case_id) {
			  return idx;
		  }
	  }
	  return -1;
  }

  /*API call to get all clinical data */
  getAllClinicalData(){
	this.loading = true;
	setTimeout(() => {
		//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
		this.browseByClinicalService.getFilteredClinicalDataPaginatedPost(this.offset, this.limit, this.sort, this.newFilterSelected).pipe(take(1)).subscribe((data: any) =>{
			this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
			this.populateAssociatedSampleInfo(this.filteredClinicalData);
			this.totalRecords = data.getPaginatedUIClinical.total;
			this.clinicalTotalRecordChanged.emit({type: 'clinical', totalRecords:this.totalRecords});
			this.offset = data.getPaginatedUIClinical.pagination.from;
			this.pageSize = data.getPaginatedUIClinical.pagination.size;
			this.limit = data.getPaginatedUIClinical.pagination.size;
			this.clearSelection();
			this.makeRowsSameHeight();
			this.loading = false;
		});
	}, 1000);
  }

  ngOnChanges(changes: SimpleChanges){
	if (changes && changes['childTabChanged']) {
		this.makeRowsSameHeight();
	}
	if (this.newFilterValue){
		this.filteredClinicalData = [];
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

		this.browseByClinicalService.getFilteredClinicalDataPaginatedPost(this.offset, this.limit,this.sort, this.newFilterSelected).pipe(take(1)).subscribe((data: any) =>{
			this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
      console.log(data.getPaginatedUIClinical.uiClinical);
			this.populateAssociatedSampleInfo(this.filteredClinicalData);
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIClinical.total;
				this.clinicalTotalRecordChanged.emit({type: 'clinical', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIClinical.pagination.from;
				this.pageSize = data.getPaginatedUIClinical.pagination.size;
				this.limit = data.getPaginatedUIClinical.pagination.size;
			}
			this.clearSelection();
			this.makeRowsSameHeight();
			this.loading = false;
		});
	}

	//@@@PDC-937: Add a button to allow download all manifests with a single click
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
			this.isTableLoading.emit({isTableLoading:"clinical:true"});
		} else {
			this.loading = true;
		}
		setTimeout(() => {
			//@@@PDC-5072: Update paginated API calls in the UI to use the 'getAll' parameter
			//@@@PDC-4931: Last row of Biospecimen and Clinical is not getting selected when the user use Select All Pages
			//Set limit as total_records + 1. getFilteredClinicalDataPaginated API returns total records if the limit is increased by 1.
			//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
			this.browseByClinicalService.getFilteredClinicalDataPaginatedPost(0, 0, this.sort, this.newFilterSelected, true).pipe(take(1)).subscribe((data: any) =>{
				let filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
        console.log(data);
        console.log(data.getPaginatedUIClinical.uiClinical);

				this.populateAssociatedSampleInfo(filteredClinicalData);
				let localSelectedClinical = [];
				for(let item of filteredClinicalData){
					localSelectedClinical.push(item);
				}
				if (buttonClick) {
					this.selectedClinicalData = localSelectedClinical;
					this.headercheckbox = true;
					//@@@PDC-3667: "Select all pages" option issue
					this.updateCurrentPageSelectedClinical(localSelectedClinical);
					this.loading = false;
				} else {
					let headerCols = [];
					let colValues = [];
					for (var i=0; i< this.cols.length; i++) {
						headerCols.push(this.cols[i]['header']);
						colValues.push(this.cols[i]['field']);
					}
					let exportData = [];
					//@@@PDC-2950: External case id missing in clinical manifest
					exportData = this.addGenomicImagingDataToExportManifest(localSelectedClinical);
					let csvOptions = {
						headers: headerCols
					};
					//PDC-3206 fix ddownload manifest even if there are zero records
					if (this.totalRecords > 0) {
						let exportFileObject = JSON.parse(JSON.stringify(exportData, colValues));
						//@@@PDC-4260: Update clinical manifest to include new clinical data fields
						this.prepareDownloadData(this.manifestFormat, exportData, exportFileObject);
					}
					this.isTableLoading.emit({isTableLoading:"clinical:false"});
					this.makeRowsSameHeight();
				}
			});
		}, 1000);
	}, 1000);
}

//@@@PDC-4260: Update clinical manifest to include new clinical data fields
prepareDownloadData(format, exportData, exportFileObject) {
	this.loading = true;
	//Prepare exposure Data
	//For TSV format have to preprocess and use different function than CSV
	if (format == "tsv") {
		let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, this.cols);
		var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
	} else if (format == "csv") {
		let exportCSVData = this.prepareCSVExportManifestData(exportFileObject, this.cols);
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

//@@@PDC-3667: "Select all pages" option issue
updateCurrentPageSelectedClinical(localSelectedClinical) {
	let cloneData = _.cloneDeep(localSelectedClinical);
	cloneData = cloneData.splice(0, this.pageSize);
	this.currentPageSelectedClinical = [];
	cloneData.forEach(item => {this.currentPageSelectedClinical.push(item.case_submitter_id)});
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


		this.browseByClinicalService.getFilteredClinicalDataPaginatedPost(this.offset, this.limit, this.sort, this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			this.filteredClinicalData = data.getPaginatedUIClinical.uiClinical;
			this.populateAssociatedSampleInfo(this.filteredClinicalData);
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIClinical.total;
				this.clinicalTotalRecordChanged.emit({ type: 'clinical', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUIClinical.pagination.from;
				this.limit = data.getPaginatedUIClinical.pagination.size;
			}
			//@@@PDC-3700: Existing issues with Checkbox handling on "Browse" page
			//Page size should be available for all offsets
			this.pageSize = data.getPaginatedUIClinical.pagination.size;
			this.trackCurrentPageSelectedCase(data.getPaginatedUIClinical.uiClinical);
			if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
				this.headercheckbox = true;
			}else{
				this.headercheckbox = false;
			}
			//@@@PDC-3667: "Select all pages" option issue
			this.handleCheckboxSelections();
			this.makeRowsSameHeight();
			this.loading = false;
		});
	}

	//@@@PDC-5206: Present Diagnosis to Sample relationship on PDC Browser
	populateAssociatedSampleInfo(filteredClinicalData) {
		if (filteredClinicalData.length > 0) {
			for (var i in filteredClinicalData) {
				if (filteredClinicalData[i].samples && filteredClinicalData[i].samples.length > 0) {
					//@@@PDC-6397 handle multiple samples
					if (filteredClinicalData[i].samples[0].sample_submitter_id == null) {
						console.log("No Sample associated");
						filteredClinicalData[i].samples = null;
					}
					else if (filteredClinicalData[i].samples[0].sample_submitter_id.includes('|')){
						console.log("Multi Samples found: "+filteredClinicalData[i].samples[0].sample_submitter_id);
						let tempSamples = filteredClinicalData[i].samples[0].sample_submitter_id.split("|");
						let newAnnotation = "Samples of "+ tempSamples.join(" and ") + " are associated with this clinical record. "
						console.log("Annotation for multi samples: "+newAnnotation);
						filteredClinicalData[i].samples[0].annotation = newAnnotation;
					}
					else if (!filteredClinicalData[i].samples[0].annotation) {
						console.log("Add annotation for "+filteredClinicalData[i].samples[0].sample_submitter_id);
						filteredClinicalData[i].samples[0].annotation = "The sample "+filteredClinicalData[i].samples[0].sample_submitter_id+" is associated with this clinical record.";
					}
				}
				/*if (filteredClinicalData[i].samples && typeof(filteredClinicalData[i].samples) != 'string' && filteredClinicalData[i].samples.length > 0) {
					let associatedSamples = filteredClinicalData[i]['samples'];
					let arr = [];
					let arr_test = [];
					//@@PDC-5414-add-annotation-information
					for(let key in associatedSamples){
						let associatedsampleIds_test = {};
						associatedsampleIds_test['sample_submitter_id'] = associatedSamples[key]['sample_submitter_id'];
						if(!associatedSamples[key]['annotation']){
							associatedsampleIds_test['annotation'] = "The sample "+associatedSamples[key]['sample_submitter_id']+" is associated with this clinical record.";
						} else {
							associatedsampleIds_test['annotation'] = associatedSamples[key]['annotation'];
						}
						arr_test.push(associatedsampleIds_test);
						console.log("samples to display 523: "+associatedSamples[key]['sample_submitter_id']);
						arr.push(associatedSamples[key]['sample_submitter_id']);
					}
					let associatedsampleIds = arr.join(", ");
					console.log("sample IDs to display: "+associatedsampleIds);
					filteredClinicalData[i]['samples'] = arr_test;
					console.log("sample IDs formatted: "+filteredClinicalData[i]['samples']);
				}*/
			}
		}
	}

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	populateAdditionalClinicalData(filteredClinicalData) {
		//@@@PDC-4899: Records on the Clinical tab are '0' on the Explore page in Data Browser Stage
		//Populate fields from FollowUp data
		for (var i in this.filteredFollowUpClinicalData) {
			let followUpDataRow = this.filteredFollowUpClinicalData[i];
			if (followUpDataRow && followUpDataRow['case_submitter_id']) {
				let case_submitter_id = followUpDataRow['case_submitter_id'];
				let follow_ups = followUpDataRow['follow_ups'];
				if (filteredClinicalData.length > 0) {
					let recFound = filteredClinicalData.find(x => x.case_submitter_id == case_submitter_id);
					if (recFound) {
						recFound['follow_ups'] = follow_ups;
					}
				}
			}
		}
		//Populate fields from Exposure data
		for (var i in this.filteredExposureClinicalData) {
			let exposureDataRow = this.filteredExposureClinicalData[i];
			if (exposureDataRow && exposureDataRow['case_submitter_id']) {
				let case_submitter_id = exposureDataRow['case_submitter_id'];
				let exposures = exposureDataRow['exposures'];
				if (filteredClinicalData.length > 0) {
					let recFound = filteredClinicalData.find(x => x.case_submitter_id == case_submitter_id);
					if (recFound) {
						recFound['exposures'] = exposures;
						Object.keys(exposureDataRow).forEach( function(key) {
							if (!['exposures', 'follow_ups', 'externalReferences', '__typename', 'case_submitter_id'].includes(key)) {
								recFound[key] = exposureDataRow[key];
							}
							if (!recFound) {
								filteredClinicalData[key] = null;
							}
						});
					}
				}
			}
		}
		//@@@PDC-4899: Records on the Clinical tab are '0' on the Explore page in Data Browser Stage
		//Populate fields from filteredAdditionalClinicalData
 		for (var i in this.filteredAdditionalClinicalData) {
			let clinicalDataRow = this.filteredAdditionalClinicalData[i];
			if (clinicalDataRow && clinicalDataRow['case_submitter_id']) {
				let case_submitter_id = clinicalDataRow['case_submitter_id'];
				if (filteredClinicalData.length > 0) {
					let recFound = filteredClinicalData.find(x => x.case_submitter_id == case_submitter_id);
					if (recFound) {
						Object.keys(clinicalDataRow).forEach( function(key) {
							if (!['exposures', 'follow_ups', 'externalReferences', '__typename', 'case_submitter_id'].includes(key)) {
								recFound[key] = clinicalDataRow[key];
							}
							if (!recFound) {
								filteredClinicalData[key] = null;
							}
						});
					}
				}
			}
		}
		return filteredClinicalData;
	}

	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	prepareExposureDataforExport(exportData, format) {
		let exposureDataArr = [];
		exposureDataArr = this.populateExposureData(exportData);
		let exposureColValues = [];
		var exposureBlob = new Blob();
		for (var i=0; i< this.exposureCols.length; i++) {
			exposureColValues.push(this.exposureCols[i]['field']);
		}
		let exportFileExposureObject = JSON.parse(JSON.stringify(exposureDataArr, exposureColValues));
		if (format == "tsv") {
			let exportExposureTSVData = this.prepareTSVExportManifestData(exportFileExposureObject, this.exposureCols);
			exposureBlob = new Blob([exportExposureTSVData], { type: 'text/csv;charset=utf-8;' });
		} else if (format == "csv") {
			let exportExposureCSVData = this.prepareCSVExportManifestData(exportFileExposureObject, this.exposureCols);
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
	    var dataBlob = new Blob();
	    for (var i=0; i< this.followUpCols.length; i++) {
			colVals.push(this.followUpCols[i]['field']);
	    }
	    let exportFileObject = JSON.parse(JSON.stringify(dataArray, colVals));
	    if (format == "tsv") {
	        let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, this.followUpCols);
	        dataBlob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
	    } else if (format == "csv") {
	        let exportCSVData = this.prepareCSVExportManifestData(exportFileObject, this.followUpCols);
			dataBlob = new Blob([exportCSVData], { type: 'text/csv;' });
	    }
	    return dataBlob;
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
	  this.frozenColumns  = [
		{field: 'project_name', header: 'Project Name'},
	  ];
	  this.cols = [
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
			dt.exportFilename = this.getExportFileName("csv");
			//@@@PDC-2950: External case id missing in clinical manifest
			let colValues = [];
			for (var i=0; i< this.cols.length; i++) {
				colValues.push(this.cols[i]['field']);
			}
			let exportData = [];
			exportData = this.addGenomicImagingDataToExportManifest(this.selectedClinicalData);
			let exportFileObject = JSON.parse(JSON.stringify(exportData, colValues));
			//@@@PDC-4260: Update clinical manifest to include new clinical data fields
			this.prepareDownloadData("csv", exportData, exportFileObject);
		}

		//PDC-3073, PDC-3074 Add TSV format for manifests
		clinicalTableExportTSV(dt){
			let exportData = [];
			let colValues = [];
			for (var i=0; i< this.cols.length; i++) {
				colValues.push(this.cols[i]['field']);
			}
			exportData = this.addGenomicImagingDataToExportManifest(this.selectedClinicalData);
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

		//help function preparing a string containing the data for TSV manifest file
		prepareTSVExportManifestData(manifestData, columns){
			let result = "";
			let separator = '\t';
			let EOL = "\r\n";
			for (var i=0; i< columns.length; i++) {
				//@@@PDC-3482 headers in TSV file should match headers in CSV
				result += columns[i]['header'] + separator;
			}
			result = result.slice(0, -1);
			result += EOL;
			for (var i=0; i < manifestData.length; i++){
				for (const index in manifestData[i]) {
					if (manifestData[i][index] == null) {
						result += "null" + separator;
					} else {
						result += manifestData[i][index] + separator;
					}
				}
				result = result.slice(0, -1);
				result += EOL;
			}
			return result;
		}

		//@@@PDC-4260: Update clinical manifest to include new clinical data fields
		//help function preparing a string containing the data for CSV manifest file
		prepareCSVExportManifestData(manifestData, columns){
			let result = "";
			let separator = ',';
			let EOL = "\r\n";
			for (var i=0; i< columns.length; i++) {
				//@@@PDC-3482 headers in TSV file should match headers in CSV
				result += columns[i]['header'] + separator;
			}
			result = result.slice(0, -1);
			result += EOL;
			for (var i=0; i < manifestData.length; i++){
				for (const index in manifestData[i]) {
					if (manifestData[i][index] == null) {
						result += "null" + separator;
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
				if (associatedSamples != null) {
          //@@PDC-5414-add-annotation-information
					exportData[i]["samples"] = "Samples: " + associatedSamples[0]['sample_submitter_id'];
          exportData[i]["sample_annotation"] = associatedSamples[0]['annotation'];
				} else {
          //@@PDC-5519 - if no sample annotation values in manifest shift left
          exportData[i]["sample_annotation"] = " ";

        }
			}
			return exportData;
		}

		private getExportFileName(format = "csv", subType="", folder=""): string {
			let csvFileName = "";
			if (subType == "") {
				csvFileName = "PDC_clinical_manifest_";
			} else {
				csvFileName = "PDC_clinical_" + subType + "_manifest_";
			}
			if (folder == "true") {
				csvFileName = "PDC_clinical_data_manifests_";
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
           //@@PDC-5362-download-clinical-manifest-not-including-multiple-diagnosis-records
           if(this.countInArray(localSelectedClinical,item) == 0){
            localSelectedClinical.push(item);
						this.currentPageSelectedClinical.push(item.case_submitter_id);
          }
				}
				this.selectedClinicalData = localSelectedClinical;
			} else {
				//@@@PDC-3667: "Select all pages" option issue
				for (let biospecimen of this.currentPageSelectedClinical) {
					let index = localSelectedClinical.findIndex(x => x.case_submitter_id === biospecimen);
					if(index >-1){
						localSelectedClinical.splice(index,1);
					}
				}
				this.selectedClinicalData = localSelectedClinical;
				this.currentPageSelectedClinical = [];
				this.pageHeaderCheckBoxTrack = [];
			}
		}

		//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
		onRowSelected(event:any){
      //@@PDC-5362-download-clinical-manifest-not-including-multiple-diagnosis-records
      for (let filtered_data of this.filteredClinicalData) {
         if(filtered_data.case_submitter_id == event.data.case_submitter_id){
            if(this.countInArray(this.selectedClinicalData,filtered_data) == 0){
                this.selectedClinicalData.push(filtered_data);
            }
         }
      }
			this.currentPageSelectedClinical.push(event.data.case_submitter_id);
			//@@@PDC-3667: "Select all pages" option issue
			this.handleCheckboxSelections();
		}

    //@@PDC-5362-download-clinical-manifest-not-including-multiple-diagnosis-records
    countInArray(array, what) {
      var count = 0;
      for (var i = 0; i < array.length; i++) {
         if (array[i] === what) {
            count++;
         }
      }
      return count;
    }

		//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
		onRowUnselected(event){
			let index = this.currentPageSelectedClinical.indexOf(event.data.case_submitter_id);
			if(index >-1){
				this.currentPageSelectedClinical.splice(index,1);
			}
			//@@@PDC-3667: "Select all pages" option issue
			this.handleCheckboxSelections();
		}

		//@@@PDC-3667: "Select all pages" option issue
		handleCheckboxSelections() {
			if (this.currentPageSelectedClinical.length === this.pageSize) {
				this.headercheckbox = true;
			} else {
				//For the last page
				if (this.totalRecords - this.offset < this.pageSize) {
					if (this.currentPageSelectedClinical.length === this.totalRecords - this.offset) {
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

		onResize(event) {
			this.makeRowsSameHeight();
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
