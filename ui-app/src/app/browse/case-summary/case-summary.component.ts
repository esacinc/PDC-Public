import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import "rxjs/add/operator/map";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { CaseSummaryService } from "./case-summary.service";
import { Filter, FilesCountsPerStudyData, CaseData, AllCasesData, ExperimentFileByCaseCount, DataCategoryFileByCaseCount,
			SampleData, AliquotData, DiagnosesData, DemographicsData, AllStudiesData, Exposures, FollowUps} from '../../types';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { FilesOverlayComponent } from '../browse-by-file/files-overlay.component';
import { StudySummaryComponent } from '../study-summary/study-summary.component';

@Component({
  selector: 'app-case-summary',
  templateUrl: './case-summary.component.html',
  styleUrls: ['../../../assets/css/global.css', './case-summary.component.scss'],
  providers: [ CaseSummaryService ]
})
//@@@PDC-327 Data categories for File counts by data category need to have long descriptive names
//@@@PDC-336 Updates to case summary page
//@@@PDC-PDC-357 - Search UI
//@@@PDC-374 - adding url to overlay windows
//@@@PDC-1042: Enable links to studies and files from case summary page
//@@@PDC-1355: Use uuid as API search parameter
//@@@PDC-1609: URL structure for permanent links to PDC
//@@@PDC-2605: Show properties on Demography tab in Case Summary
//@@@PDC-3095 - remove external_case_id field from uiCaseSummary API
//@@@PDC-3478 open files data table in overlay window from study and case summaries
export class CaseSummaryComponent implements OnInit {
  experimentFileCount: ExperimentFileByCaseCount[];
  dataCategoryFileCount: DataCategoryFileByCaseCount[];
  case_submitter_id: string;
  case_id: string;
  caseDetailedSummaryData: CaseData; //Querry for a detailed summary
  caseAdditionalDetailedSummaryData: CaseData;
  caseDiagnosisSummaryData: CaseData;
  caseSummaryData: AllCasesData; //Data passed from browse cases tab
  samples: SampleData[];
  aliquots: AliquotData[];
  diagnoses: DiagnosesData[];
  demographics: DemographicsData[];
  exposures: Exposures[];
  followups: FollowUps[];
  fileTypesCounts: any;
  totalFilesCount: number = 0;
  loading: boolean = false;
	showMore: boolean = false;
	filteredStudiesData: AllStudiesData[]; //Filtered list of Studies
	//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
	showLessExposureEvenProps = [];showLessExposureOddProps = [];showLessExposureEvenPropVals = [];showLessExposureOddPropVals = [];
	showMoreExposureEvenProps = [];showMoreExposureOddProps = [];showMoreExposureEvenPropVals = [];showMoreExposureOddPropVals = [];
	showLessFollowUpEvenProps = [];showLessFollowUpOddProps = [];showLessFollowUpEvenPropVals = [];showLessFollowUpOddPropVals = [];
	showMoreFollowUpOddProps = [];showMoreFollowUpEvenProps = [];showMoreFollowUpOddPropVals = [];showMoreFollowUpEvenPropVals = [];
	showLessDiagnosisEvenProps = [];showLessDiagnosisOddProps = [];showLessDiagnosisEvenPropVals = [];showLessDiagnosisOddPropVals = [];
	showMoreDiagnosisOddProps = [];showMoreDiagnosisEvenProps = [];showMoreDiagnosisOddPropVals = [];showMoreDiagnosisEvenPropVals = [];
	showLessDemographicsEvenProps = [];showLessDemographicsOddProps = [];showLessDemographicsEvenPropVals = [];showLessDemographicsOddPropVals = [];
	showMoreDemographicsOddProps = [];showMoreDemographicsEvenProps = [];showMoreDemographicsOddPropVals = [];showMoreDemographicsEvenPropVals = [];
	showMoreDemographics: boolean = false;
	showMoreExposure: boolean = false;
	showMoreFollowUp: boolean = false;
	source: string = "";
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private apollo: Apollo,
				private loc:Location,
				private caseSummaryService: CaseSummaryService,
				private dialogRef: MatDialogRef<CaseSummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public caseData: any,
				private dialog: MatDialog) {

	console.log(caseData);
	this.case_submitter_id = caseData.summaryData.case_submitter_id;
	this.case_id = caseData.summaryData.case_id;
	this.caseSummaryData = caseData.summaryData;
	//@@@PDC-4725: Set the source parameter in the UI calls to fetch details of a search result
	if (caseData && caseData.source) {
		this.source = caseData.source;
	}
	if (this.caseSummaryData.case_id === ""){
		this.getCaseGeneralSummaryData();
	}
	//console.log(this.caseSummaryData);
	this.loc.replaceState("/case/" + this.caseSummaryData.case_id);
	this.fileTypesCounts = {RAW: 0, 'PSM-TSV': 0, 'PSM-MZID': 0, PROT_ASSEM: 0, MZML: 0, PROTOCOL: 0};
	this.aliquots = [];
	this.diagnoses = [];
	this.samples = [];
	this.caseDetailedSummaryData = {
		case_id: "",
		case_submitter_id: "",
		project_submitter_id: "",
		disease_type: "",
		tissue_source_site_code: "",
		days_to_lost_to_followup: "",
		index_date: "",
		lost_to_followup: "",
		primary_site: "",
		demographics: [],
		diagnoses: [],
		samples: []
	}
	this.getCaseSummaryData();
	this.getExperimentFileCount();
	this.getDataCategoryFilesCounts();
  }

  getCaseGeneralSummaryData(){
	this.loading = true;
	this.caseSummaryService.getCaseSummaryData(this.case_id, this.case_submitter_id, this.source).subscribe((data: any) =>{
		//console.log(data.uiCase);
		this.caseSummaryData = data.uiCase[0];
		this.loading = false;
	});
	}

	//@@@PDC-1042: Enable links to studies and files from case summary page
	//Opens an overlay window for Study Summary page
	showStudySummary(studyName: string){
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		//dialogConfig.minWidth = '1000px';
		dialogConfig.width = '80%';
		dialogConfig.height = '95%';
		setTimeout(() => {
			// Get all studies data for a study name.
			this.caseSummaryService.getFilteredStudyDetailsForSummaryPage(studyName, this.source).subscribe((data: any) =>{
				this.filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
				dialogConfig.data = {
					summaryData: this.filteredStudiesData[0],
				};
				//create an alias for study summary overlay window URL in the form [base url]/study/study uuid
				this.loc.replaceState("/study/" + this.filteredStudiesData[0].study_id);
				this.router.navigate([{outlets: {studySummary: ['study-summary', studyName]}}], { skipLocationChange: true });
				const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);
				dialogRef.afterClosed().subscribe((val:any) => {
					console.log("Dialog output:", val);
					//Generate alias URL to hide auxiliary URL details when the previous overlay window was closed and the focus returned to this one
					this.loc.replaceState("/case/" + this.caseSummaryData.case_id);
				});
			});
		}, 1000);
	}

	showFilesOverlay(submitter_id_name, data_category_val, file_type_val, acquisition_type_val, experiment_type_val) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		//dialogConfig.minWidth = '1000px';
		dialogConfig.width = '80%';
		dialogConfig.height = '95%';
		dialogConfig.data = {
				summaryData: {study_name: submitter_id_name, data_category: data_category_val, file_type: file_type_val, versions: false, acquisition_type: acquisition_type_val, experiment_type: experiment_type_val},
		};
		this.router.navigate([{outlets: {filesOverlay: ['files-overlay', this.case_id]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(FilesOverlayComponent, dialogConfig);
		dialogRef.afterClosed().subscribe((val:any) => {
				console.log("Dialog output:", val);
				//Generate alias URL to hide auxiliary URL details when the previous overlay window was closed and the focus returned to this one
				this.loc.replaceState("/case/" + this.caseSummaryData.case_id);
		});
	}

	//@@@PDC-1042: Enable links to studies and files from case summary page
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

  getExperimentFileCount(){
	this.loading = true;
	this.caseSummaryService.getExprimentFileByCaseCountData(this.case_id, this.source).subscribe((data: any) =>{
		this.experimentFileCount = data.uiExperimentFileCount;
		this.loading = false;
	});
  }


  getDataCategoryFilesCounts(){
	this.loading = true;
	this.caseSummaryService.getDataCategoryFileByCaseCountData(this.case_id, this.source).subscribe((data: any) =>{
		let fileCountsRaw = data.uiDataCategoryFileCount;
		this.dataCategoryFileCount = this.mergeDataCategoryFiles(data.uiDataCategoryFileCount);
		this.loading = false;
	});
  }

  mergeDataCategoryFiles(dataCategoryFileCount: any[]){
	let dataCategoryMap = new Map();
	for(let dataCategory of dataCategoryFileCount){
		if(dataCategoryMap.has(dataCategory.data_category+dataCategory.file_type)){
			let data = dataCategoryMap.get(dataCategory.data_category+dataCategory.file_type);
			data.submitter_id_name = data.submitter_id_name+"|"+ dataCategory.submitter_id_name;
			data.files_count = data.files_count + dataCategory.files_count;
			dataCategoryMap.set(dataCategory.data_category+dataCategory.file_type, data);
		}else{
			let data = {};
			data['data_category'] = dataCategory.data_category;
			data['file_type'] = dataCategory.file_type;
			data['files_count'] = dataCategory.files_count;
			data['submitter_id_name'] = dataCategory.submitter_id_name;
			dataCategoryMap.set(dataCategory.data_category+dataCategory.file_type, data);
		}
	}
	return Array.from(dataCategoryMap.values());
  }

  getCaseSummaryData(){
	this.loading = true;
	//@@@PDC-4283: Data discrepancy for "Year of Death"
	//Add timeout for loading demographics data.
	setTimeout(() => {
		//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
		//@@@PDC-5045: Convert the GET requests to the getPaginatedUIClinical API of "Clinical" tab to POST
		this.caseSummaryService.getDetailedCaseSummaryDataPost(this.case_id, this.source).subscribe((data: any) =>{
			//@@@PDC-1123 add ui wrappers public APIs
			//console.log("Case from Array: "+JSON.stringify(data.uiCaseSummary[0]));
			//@@@PDC-2335 uiCaseSummary returns an array instead of a single obj
			this.caseDetailedSummaryData = data.uiCaseSummary[0];
			//@@@PDC-2956: issue with opening case summary via direct URL
			if (this.case_submitter_id === "" && data.uiCaseSummary[0].case_submitter_id != "") {
				this.case_submitter_id = data.uiCaseSummary[0].case_submitter_id;
			}
			this.samples = data.uiCaseSummary[0].samples;
			for (let sample of this.samples){
				this.aliquots = this.aliquots.concat(sample.aliquots);
			}
			//@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
			this.diagnoses = this.removeNullValues(data.uiCaseSummary[0].diagnoses);
			//@@@PDC-5248: Display all diagnosis case summary
			if (this.diagnoses && this.diagnoses.length > 0) this.generateLoopsforAdditionalData(this.diagnoses, "diagnosis");
			this.demographics = this.removeNullValues(data.uiCaseSummary[0].demographics);
			if (this.demographics && this.demographics.length > 0) this.generateLoopsforAdditionalData(this.demographics[0], "demographics");
			this.exposures = this.removeNullValues(data.uiCaseSummary[0].exposures);
			if (this.exposures && this.exposures.length > 0) this.generateLoopsforAdditionalData(this.exposures[0], "exposure");
			this.followups = this.removeNullValues(data.uiCaseSummary[0].follow_ups);
			if (this.followups && this.followups.length > 0) this.generateLoopsforAdditionalData(this.followups[0], "followup");
			this.loading = false;
	  	});
	}, 1000);
  }

  //@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  generateLoopsforAdditionalData(dataSet, entity){
	if (entity == "exposure") {
		//if (dataSet && dataSet['exposure_id']) delete dataSet['exposure_id'];
		//if (dataSet && dataSet['exposure_submitter_id']) delete dataSet['exposure_submitter_id'];
		this.showLessExposureEvenProps = this.populateAdditionalDatasets(dataSet, 1, true);
		this.showLessExposureOddProps = this.populateAdditionalDatasets(dataSet, 2, true);
		this.showLessExposureEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, true);
		this.showLessExposureOddPropVals = this.populateAdditionalDatasets(dataSet, 4, true);
		this.showMoreExposureEvenProps = this.populateAdditionalDatasets(dataSet, 1, false);
		this.showMoreExposureOddProps = this.populateAdditionalDatasets(dataSet, 2, false);
		this.showMoreExposureEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, false);
		this.showMoreExposureOddPropVals = this.populateAdditionalDatasets(dataSet, 4, false);
	} else if (entity == "followup") {
		//if (dataSet && dataSet['follow_up_id']) delete dataSet['follow_up_id'];
		//if (dataSet && dataSet['follow_up_submitter_id']) delete dataSet['follow_up_submitter_id'];
		this.showLessFollowUpEvenProps = this.populateAdditionalDatasets(dataSet, 1, true);
		this.showLessFollowUpOddProps = this.populateAdditionalDatasets(dataSet, 2, true);
		this.showLessFollowUpEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, true);
		this.showLessFollowUpOddPropVals = this.populateAdditionalDatasets(dataSet, 4, true);
		this.showMoreFollowUpEvenProps = this.populateAdditionalDatasets(dataSet, 1, false);
		this.showMoreFollowUpOddProps = this.populateAdditionalDatasets(dataSet, 2, false);
		this.showMoreFollowUpEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, false);
		this.showMoreFollowUpOddPropVals = this.populateAdditionalDatasets(dataSet, 4, false);
	} else if (entity == "diagnosis") {
		//@@@PDC-5251: Display the associated sample information for Diagnoses on the the Case Summary page
		//Delete the property 'samples' if not present, else display the associated sample submitter ids
		for (let dataeEle of dataSet){
			if (dataeEle['samples'] && dataeEle['samples'].length == 0) {
				delete dataeEle['samples'];
			} else {
				let associatedSamples = dataeEle['samples'];
				let associatedsampleIds = associatedSamples.map(x => x.sample_submitter_id).join(", ");
				dataeEle['samples'] = associatedsampleIds;
			}
		}
		//@@@PDC-5248-display-all-diagnosis case summary
		for (let data of dataSet){
			let index = dataSet.indexOf(data);
			this.showLessDiagnosisEvenProps[index] = this.populateAdditionalDatasets(data, 1, true);
			this.showLessDiagnosisOddProps[index] = this.populateAdditionalDatasets(data, 2, true);
			this.showLessDiagnosisEvenPropVals[index] = this.populateAdditionalDatasets(data, 3, true);
			this.showLessDiagnosisOddPropVals[index] = this.populateAdditionalDatasets(data, 4, true);
			this.showMoreDiagnosisEvenProps[index] = this.populateAdditionalDatasets(data, 1, false);
			this.showMoreDiagnosisOddProps[index] = this.populateAdditionalDatasets(data, 2, false);
			this.showMoreDiagnosisEvenPropVals[index] = this.populateAdditionalDatasets(data, 3, false);
			this.showMoreDiagnosisOddPropVals[index] = this.populateAdditionalDatasets(data, 4, false);
		}
	} else if (entity == "demographics") {
		this.showLessDemographicsEvenProps = this.populateAdditionalDatasets(dataSet, 1, true);
		this.showLessDemographicsOddProps = this.populateAdditionalDatasets(dataSet, 2, true);
		this.showLessDemographicsEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, true);
		this.showLessDemographicsOddPropVals = this.populateAdditionalDatasets(dataSet, 4, true);
		this.showMoreDemographicsEvenProps = this.populateAdditionalDatasets(dataSet, 1, false);
		this.showMoreDemographicsOddProps = this.populateAdditionalDatasets(dataSet, 2, false);
		this.showMoreDemographicsEvenPropVals = this.populateAdditionalDatasets(dataSet, 3, false);
		this.showMoreDemographicsOddPropVals = this.populateAdditionalDatasets(dataSet, 4, false);
	}
  }

  //@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  populateAdditionalDatasets(data, option, showLess) {
	  if (data && data['__typename']) delete data['__typename'];
	  let count = 0;
	  var dataSet = [];
	  var that = this;
	  dataSet = Object.keys(data).map(function(property){
		count = count + 1;
		if ((!showLess) || (showLess && count <= 6)) {
			if (option == 1 && count %2 === 0) {
				let convertedProperty = that.convertUnderscoreCaseToTitleCase(property);
				return convertedProperty;
			}
			if (option == 2 && count % 2 !== 0) {
				let convertedProperty = that.convertUnderscoreCaseToTitleCase(property);
				return convertedProperty;
			}
			if (option == 3 && count % 2 === 0) {
				return data[property];
			}
			if (option == 4 && count % 2 !== 0) {
				return data[property];
			}
		}
	  });
	  dataSet = dataSet.filter(function( element ) {
		return element !== undefined;
	  });
	  return dataSet;
  }

  //@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  convertUnderscoreCaseToTitleCase(field) {
	var result = "";
	if (field && field != '') {
		field = field.replace(/_/g, ' ');
		var arr = field.split(" ");
		//loop through each element of the array and capitalize the first letter.
		for (var i = 0; i < arr.length; i++) {
			arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
		}
		result = arr.join(" ");
	}
	return result;
  }

  //@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  populateAdditionalCaseData(caseDetailedSummaryData) {
	let clinicalDataRow = this.caseAdditionalDetailedSummaryData;
	if (clinicalDataRow) {
		caseDetailedSummaryData['follow_ups'] = clinicalDataRow['follow_ups'];
		caseDetailedSummaryData['exposures'] = clinicalDataRow['exposures'];
	}
	return caseDetailedSummaryData;
}

  //@@@PDC-336
  //Replace null value of a field with default "not reported" value
  removeNullValues(parameter_list:any){
	  let result_list: any = []; //initializing new list of objects
	  let list = parameter_list;
	  for (let object of list){
		  let result_obj = {}; //initializing new object for replacing values
		  for (let key of Object.keys(object) ){
			  if (object[key] === "null" || object[key] === null){
				  result_obj[key] = "Not Available";
			  }
			  else {
				  result_obj[key] = object[key];
			  }
		  }
		  result_list.push(result_obj);
	  }
	  return result_list;
  }

  //@@@PDC-336
  //Setting style for fields with "not reported" value
  styleNotReported(value: string){
	  if (value === "Not Available"){
		return {'color': 'grey', 'font-style': 'italic'};
	  }
	  else {
		  return{};
	  }
  }

	//@@PDC-5248: display all diagnosis case summary - function for toggle
	showMoreOrLess(value){
		const dRef = document.getElementById(value+"_enum");
		const dRef_show = document.getElementById(value+"_enum_show");
		let target = event.currentTarget as HTMLElement;

		if (dRef_show.style.display == 'block') {
					dRef_show.setAttribute("style", "display:none;");
					dRef.setAttribute("style", "display:block;");
					target.innerHTML = 'Show more';
				} else {
					dRef_show.setAttribute("style", "display:block;");
					dRef.setAttribute("style", "display:none;");
					target.innerHTML = 'Show less';
				}
  }

  showMoreClicked(){
	this.showMore = true;
  }

  showLessClicked(){
	this.showMore = false;
  }

  //@@@PDC-4490: Update Clinical manifest and Case summary pages for GDC Sync
  showMoreDemographicsClicked(){
	this.showMoreDemographics = true;
  }

  showLessDemographicsClicked(){
	this.showMoreDemographics = false;
  }

  showMoreExposureClicked(){
	this.showMoreExposure = true;
  }

  showLessExposureClicked(){
	this.showMoreExposure = false;
  }

  showMoreFollowUpClicked(){
	this.showMoreFollowUp = true;
  }

  showLessFollowUpClicked(){
	this.showMoreFollowUp = false;
  }

  close() {
		this.router.navigate([{outlets: {'caseSummary': null, 'filesOverlay': null}}]);
		this.loc.replaceState(this.router.url);
        this.dialogRef.close();
  }

  ngOnInit() {
  }

}
