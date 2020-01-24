import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import "rxjs/add/operator/map";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { CaseSummaryService } from "./case-summary.service";
import { Filter, FilesCountsPerStudyData, CaseData, AllCasesData, ExperimentFileByCaseCount, DataCategoryFileByCaseCount,
			SampleData, AliquotData, DiagnosesData, AllStudiesData} from '../../types';
import { MatDialog, MatDialogConfig } from '@angular/material';
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
export class CaseSummaryComponent implements OnInit {
  experimentFileCount: ExperimentFileByCaseCount[];
  dataCategoryFileCount: DataCategoryFileByCaseCount[];
  case_submitter_id: string;
  case_id: string;
  caseDetailedSummaryData: CaseData; //Querry for a detailed summary
  caseSummaryData: AllCasesData; //Data passed from browse cases tab
  samples: SampleData[];
  aliquots: AliquotData[];
  diagnoses: DiagnosesData[];
  fileTypesCounts: any; 
  totalFilesCount: number = 0;
  loading: boolean = false;
	showMore: boolean = false;
	filteredStudiesData: AllStudiesData[]; //Filtered list of Studies
  
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private apollo: Apollo,
				private caseSummaryService: CaseSummaryService,
				private dialogRef: MatDialogRef<CaseSummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public caseData: any,
				private dialog: MatDialog) {
    
	console.log(caseData);
	this.case_submitter_id = caseData.summaryData.case_submitter_id;
	this.case_id = caseData.summaryData.case_id;
	this.caseSummaryData = caseData.summaryData;
	if (this.caseSummaryData.case_id === ""){
		this.getCaseGeneralSummaryData();
	}
	//console.log(this.caseSummaryData);
	this.fileTypesCounts = {RAW: 0, 'PSM-TSV': 0, 'PSM-MZID': 0, PROT_ASSEM: 0, MZML: 0, PROTOCOL: 0}; 
	this.aliquots = [];
	this.diagnoses = [];
	this.samples = [];
	this.caseDetailedSummaryData = {
		case_id: "",
		case_submitter_id: "",
		project_submitter_id: "",
		disease_type: "",
		external_case_id: "",
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
	this.caseSummaryService.getCaseSummaryData(this.case_id).subscribe((data: any) =>{
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
			this.caseSummaryService.getFilteredStudyDetailsForSummaryPage(studyName).subscribe((data: any) =>{
				this.filteredStudiesData = this.mergeStudies(data.getPaginatedUIStudy.uiStudies);
				dialogConfig.data = {
					summaryData: this.filteredStudiesData[0],
				};
				this.router.navigate([{outlets: {studySummary: ['study-summary', studyName]}}]);
				const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);	
				dialogRef.afterClosed().subscribe(
						val => console.log("Dialog output:", val)
				);
			});	
		}, 1000);
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
	this.caseSummaryService.getExprimentFileByCaseCountData(this.case_id).subscribe((data: any) =>{
		this.experimentFileCount = data.uiExperimentFileCount;
		this.loading = false;
	});
  }
  
  
  getDataCategoryFilesCounts(){
	this.loading = true;
	this.caseSummaryService.getDataCategoryFileByCaseCountData(this.case_id).subscribe((data: any) =>{
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
	this.caseSummaryService.getDetailedCaseSummaryData(this.case_id).subscribe((data: any) =>{
		//@@@PDC-1123 add ui wrappers public APIs
		this.caseDetailedSummaryData = data.uiCaseSummary;
		this.samples = data.uiCaseSummary.samples;
		for (let sample of this.samples){
			this.aliquots = this.aliquots.concat(sample.aliquots);
		}
		this.diagnoses = this.removeNullValues(data.uiCaseSummary.diagnoses);
		this.loading = false;
	});
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
  
  showMoreClicked(){
	this.showMore = true;  
  }
  
  showLessClicked(){ 
	this.showMore = false;    
  }
 
  close() {
		this.router.navigate([{outlets: {'caseSummary': null}}]);
        this.dialogRef.close();
  }
	
  ngOnInit() {
  }

}