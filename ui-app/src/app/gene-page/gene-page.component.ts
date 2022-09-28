import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import "rxjs/add/operator/map";
import { HttpClient } from '@angular/common/http';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule, 
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule} from '@angular/material';
import { GenePageService } from "./gene-page.service";
import { Filter, GeneProteinData, GeneStudySpectralCountData, GeneAliquotSpectralCountData, 
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmData, AllStudiesData } from '../types';
import { ngxCsv } from "ngx-csv/ngx-csv";
import * as _ from 'lodash';

@Component({
  selector: 'app-gene-page',
  templateUrl: './gene-page.component.html',
  styleUrls: ['../../assets/css/global.css', './gene-page.component.scss'],
  providers: [ GenePageService ]
})

//@@@PDC-770 Add a gene page with filters
//@@@PDC-2450 gene/protein summary missing NCBI gene id
//@@@PDC-2665 show N/A if Assay data is not available
export class GenePageComponent implements OnInit, OnChanges {

  gene_id: string;
  loading: boolean = false; //data is loaded from 3 different APIs asynchroniosly, so need 3 different flags for when data is finished loading
  loadingAliquotRecords: boolean = false;
  loadingGeneSummary: boolean = false;
  lodingPTMData: boolean = false;
  geneSummaryData: GeneProteinData = {
		gene_name: "",
		ncbi_gene_id: "",
		authority: "",
		description: "",
		organism: "",
		chromosome: "",
		locus: "",
		proteins: "",
		assays: "",
		spectral_counts: []
	};
  studySpectralCountsList: GeneStudySpectralCountData[];
  aliquotSpectralCountsList: GeneAliquotSpectralCountData[];
  aliquotSpectralCountLoadError: string = '';
  genePTMData: ptmData[];
  //Pagination variables
  studyTotalRecords: number;
  studyOffset: number;
  studyLimit: number;
  studyPageSize: number;
  aliquotTotalRecords: number;
  aliquotOffset: number;
  aliquotLimit: number;
  aliquotPageSize: number;
  ptmTotalRecords: number;
  ptmOffset: number;
  ptmLimit: number;
  ptmPageSize: number;
  opened: boolean = true;
  newFilterSelected: any;
  @Input() newFilterValue: any;
  //@@@PDC-2874: Add download option for study table on gene summary page
  selectedStudies: AllStudiesData[] = [];
  currentPageSelectedStudy = [];
  selectedHeaderCheckbox = '';
  checkboxOptions = [];
  headercheckbox:boolean = false;
  pageHeaderCheckBoxTrack = [];
  cols: any[];
  frozenPTMColumns: any[];
  frozenGeneStudiesColumns: any[];
  frozenGeneBiospecimenColumns: any[];
  
  constructor(private route: ActivatedRoute,
				private router: Router,
				private genePageService: GenePageService) {
    
	//Initialize values for pagination
	this.studyOffset = 0; 
	this.studyLimit = 10;
	this.studyTotalRecords = 0;
	this.studyPageSize = 10;
	this.aliquotTotalRecords = 0;
	this.aliquotOffset = 0;
	this.aliquotLimit = 10;
	this.aliquotPageSize = 10;
	this.ptmTotalRecords = 0;
    this.ptmOffset = 0;
    this.ptmLimit = 10;
    this.ptmPageSize = 10;
	//Initializing gene summary data structure
	this.geneSummaryData = {
		gene_name: "",
		ncbi_gene_id: "",
		authority: "",
		description: "",
		organism: "",
		chromosome: "",
		locus: "",
		proteins: "",
		assays: "",
		spectral_counts: []
	};
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": ""};
	this.route.paramMap.subscribe(params => {
		let gene = params.get("gene_id");
		console.log(params);
		console.log(gene);
		this.gene_id = gene || "";
		console.log(this.gene_id);
		if (this.gene_id.length > 0){
			this.getGeneSummaryData();
			this.getGeneAliquotSpectralCounts();
			this.getGeneStudySpectralCounts();
			this.getPTMData();
		}
		else {
			console.log("ERROR: no gene id in url");
		}
	  });
	//@@@PDC-2874: Add download option for study table on gene summary page
	this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
  }
  
  getGeneSummaryData(){
	  this.loadingGeneSummary = true;
    //@@@PDC-1123 call ui wrapper API
	  setTimeout(() => {
		  this.genePageService.getGeneDetails(this.gene_id.toUpperCase()).subscribe((data: any) =>{
			this.geneSummaryData = data.uiGeneSpectralCount;
			this.loadingGeneSummary = false;
		  });
	  }, 1000);
  }
 
  getGeneAliquotSpectralCounts(){
	  this.loadingAliquotRecords = true;
	  this.aliquotSpectralCountLoadError = '';
		  //removed timout settings since this query sometimes takes a lot of time
		  this.genePageService.getAliquotSpectralCount(this.gene_id, this.aliquotOffset, this.aliquotLimit, "", this.newFilterSelected).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCountFiltered.uiGeneAliquotSpectralCounts;
			this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCountFiltered.total;
			this.aliquotOffset = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.from;
			this.aliquotLimit = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.size;
			this.aliquotPageSize = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.size;
			this.makeRowsSameHeight();
			this.loadingAliquotRecords = false;
		  },
		  err => {
			  console.log("ERROR!!!!Loading data took too long");
			  this.aliquotSpectralCountLoadError = "Loading data took too long, please, close the overlay gene summary window and open it again.";
			  this.loadingAliquotRecords = false; //If loading data takes too much time and fails, need to stop spinning wheel
		  });
	 
  }
  
  getGeneStudySpectralCounts(){
	  this.loading = true;
	  console.log(this.newFilterSelected);
	  setTimeout(() => {
		  this.genePageService.getStudySpectralCount(this.gene_id, this.studyOffset, this.studyLimit, "", this.newFilterSelected).subscribe((data: any) =>{
			this.studySpectralCountsList = data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts;
			this.studyTotalRecords = data.getPaginatedUIGeneStudySpectralCountFiltered.total;
			this.studyOffset = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.from;
			this.studyPageSize = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size;
			this.studyLimit = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size;
			this.makeRowsSameHeight();
			this.loading = false;
			this.clearSelection();
		  });
	  }, 1000);
  }
  
  getPTMData(){
	  this.lodingPTMData = true;
	  setTimeout(() => {
		  this.genePageService.getGenePTMData(this.gene_id, this.ptmOffset, this.ptmLimit).subscribe((data: any) =>{
			this.genePTMData = data.getPaginatedUIPtm.uiPtm;
			this.ptmTotalRecords = data.getPaginatedUIPtm.total;
			this.ptmOffset = data.getPaginatedUIPtm.pagination.from;
			this.ptmPageSize = data.getPaginatedUIPtm.pagination.size;
			this.ptmLimit = data.getPaginatedUIPtm.pagination.size;
			this.makeRowsSameHeight();
			this.lodingPTMData = false;
		  });
	  }, 1000);
  }
  
  loadNewPageAliquotSpectralCounts(event: any){
	  this.aliquotOffset = event.first;
	  this.aliquotLimit = event.rows;
	  this.loadingAliquotRecords = true;
	  this.genePageService.getAliquotSpectralCount(this.gene_id, this.aliquotOffset, this.aliquotLimit, "", this.newFilterSelected).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCountFiltered.uiGeneAliquotSpectralCounts;
			if (this.aliquotOffset == 0) {
				this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCountFiltered.total;
				this.aliquotOffset = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.from;
				this.aliquotPageSize = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.size;
				this.aliquotLimit = data.getPaginatedUIGeneAliquotSpectralCountFiltered.pagination.size;
			}
			this.makeRowsSameHeight();
			this.loadingAliquotRecords = false;
		}); 
  }
  
  loadNewPageStudySpectralCounts(event: any){
	  if (this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.studyOffset) === -1){
		this.pageHeaderCheckBoxTrack.push(this.studyOffset);
	  } else if (!this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.studyOffset) !== -1){
		this.pageHeaderCheckBoxTrack.splice(this.pageHeaderCheckBoxTrack.indexOf(this.studyOffset), 1);
	  }
	  this.studyOffset = event.first;
	  this.studyLimit = event.rows;
	  this.loading = true;
	  this.genePageService.getStudySpectralCount(this.gene_id, this.studyOffset, this.studyLimit, "", this.newFilterSelected).subscribe((data: any) =>{
			this.studySpectralCountsList = data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts;
			if (this.studyOffset == 0) {
				this.studyTotalRecords = data.getPaginatedUIGeneStudySpectralCountFiltered.total;
				this.studyOffset = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.from;
				this.studyLimit = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size; 
			}
			//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
			//Page size should be available for all offsets
			this.studyPageSize = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size;
			this.trackCurrentPageSelectedStudy(data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts);
			//@@@PDC-2874: Add download option for study table on gene summary page
			if (this.pageHeaderCheckBoxTrack.length > 0 && this.pageHeaderCheckBoxTrack.indexOf(this.studyOffset) !== -1){
				this.headercheckbox = true;
			} else{
				this.headercheckbox = false;
			}
			//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
			this.handleCheckboxSelections();
			this.makeRowsSameHeight();
			this.loading = false;
		}); 
  }
  
  loadPTMData(event: any){
	  this.ptmOffset = event.first;
	  this.ptmLimit = event.rows;
	  this.lodingPTMData = true;
	  this.genePageService.getGenePTMData(this.gene_id, this.ptmOffset, this.ptmLimit).subscribe((data: any) =>{
			this.genePTMData = data.getPaginatedUIPtm.uiPtm;
			if (this.ptmOffset == 0) {
				this.ptmTotalRecords = data.getPaginatedUIPtm.total;
				this.ptmOffset = data.getPaginatedUIPtm.pagination.from;
				this.ptmPageSize = data.getPaginatedUIPtm.pagination.size;
				this.ptmLimit = data.getPaginatedUIPtm.pagination.size;
			}
			this.makeRowsSameHeight();
			this.lodingPTMData = false;
		}); 
  }

  onFilterSelected(filterValue: string) {
		this.newFilterValue = filterValue;
		console.log(this.newFilterValue);
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
		}
		else if (filter_field[0] === "Clear all biospecimen filters selections"){
			this.newFilterSelected["sample_type"] = "";
			this.newFilterSelected["study_name"] = "";
		}
		else if(filter_field[0] === "Clear all file filters selections"){
			this.newFilterSelected["data_category"] = "";
			this.newFilterSelected["file_type"] = "";
			this.newFilterSelected["access"] = "";
		}
		else if (filter_field[0] === "Clear all genes filters selections"){
			this.newFilterSelected["study_name"] = "";
		}
		else {
			this.newFilterSelected[filter_field[0]] = filter_field[1];
		}
		this.studyOffset = 0;
		this.aliquotOffset = 0;
		console.log(this.newFilterSelected);
		this.getGeneAliquotSpectralCounts();
		this.getGeneStudySpectralCounts();
		this.clearSelection();
  }		

  //Helper function checking whether Assay data is available
  //checking for length > 1 since occasionally assays field seem to have an invisible character
  isAssaysEmpty():boolean{
	  var result = true;
	  if (this.geneSummaryData.assays && this.geneSummaryData.assays != "" && this.geneSummaryData.assays.length > 1) {
		  result = false;
	  }
	  return result;
  }	

  ngOnChanges(changes: SimpleChanges){
	  console.log(this.newFilterValue);
	  console.log(changes);
  }
  
  ngOnInit() {
	//Have to define this structure for Primeng CSV export to work properly (https://github.com/primefaces/primeng/issues/5114)
	//@@@PDC-2874: Add download option for study table on gene summary page
	this.cols = [
		{field: 'pdc_study_id', header: 'PDC Study ID'},
		{field: 'submitter_id_name', header: 'Study'},
		{field: 'experiment_type', header: 'Experiment Type'},
		{field: 'spectral_count', header:'Spectral Counts' },
		{field: 'distinct_peptide', header: 'Distinct Peptides'},
		{field: 'unshared_peptide', header: 'Unshared Peptides'},
		{field: 'aliquots_count', header: 'No of Aliquots'},
		{field: 'plexes_count', header: 'No of Plexes'},
	];
	this.frozenPTMColumns = [
		{field: "ptm_type", header: "PTM Type"}
	];
	this.frozenGeneStudiesColumns = [
		{field: 'pdc_study_id', header: 'PDC Study ID'}
	];
	this.frozenGeneBiospecimenColumns = [
		{field: 'aliquot_id', header: 'Aliquot'}
	];
	this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
  }

	//@@@PDC-2874: Add download option for study table on gene summary page
	/* Helper function to determine whether the download button should be disabled or not */
	isDownloadDisabled(){
		if (this.selectedStudies) {
			if (this.selectedStudies.length > 0) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

    //@@@PDC-2874: Add download option for study table on gene summary page
	studyTableExportCSV(dt){
		dt.exportFilename = this.getCsvFileName();
		dt.exportCSV({ selectionOnly: true });
	}

	getCsvFileName(): string {
		let csvFileName = "PDC_study_gene_manifest_";
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

	//@@@PDC-2874: Add download option for study table on gene summary page
	convertDateString(value: string): string {
		if (value.length === 1) {
			return "0" + value;
		} else {
			return value;
		}
	}

	//@@@PDC-2874: Add download option for study table on gene summary page
	changeHeaderCheckbox($event) {
		let checkboxVal = this.selectedHeaderCheckbox;
		this.selectedStudies = this.currentPageSelectedStudy = [];
		switch (checkboxVal) {
	 		case 'Select all pages': 
				this.downloadCompleteManifest();
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

	//@@@PDC-2874: Add download option for study table on gene summary page
	onTableHeaderCheckboxToggle() {
		let emptyArray = [];
		let localSelectedStudies = emptyArray.concat(this.selectedStudies);
		if (this.headercheckbox){
			for(let study of this.studySpectralCountsList){
				if(this.currentPageSelectedStudy.indexOf(study.pdc_study_id) === -1){
					localSelectedStudies.push(study);
					this.currentPageSelectedStudy.push(study.pdc_study_id);
				} 
			}
			this.selectedStudies = localSelectedStudies;
		} else {
			//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
			for (let study of this.currentPageSelectedStudy) {
				let index = localSelectedStudies.findIndex(x => x.pdc_study_id === study);
				if (index > -1){
					localSelectedStudies.splice(index,1);
				}
      		}
			this.selectedStudies = localSelectedStudies; 
			this.currentPageSelectedStudy = [];
			this.pageHeaderCheckBoxTrack = [];
		}
	}

	//@@@PDC-2874: Add download option for study table on gene summary page
	onRowSelected(event:any){
		this.currentPageSelectedStudy.push(event.data.pdc_study_id);
		//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
		this.handleCheckboxSelections();
	}

	//@@@PDC-2874: Add download option for study table on gene summary page
	onRowUnselected(event){
		let index = this.currentPageSelectedStudy.indexOf(event.data.pdc_study_id);
		if (index >-1) {
		  this.currentPageSelectedStudy.splice(index,1);
		}
		//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
		this.handleCheckboxSelections();
	}

	//@@@PDC-2874: Add download option for study table on gene summary page
	clearSelection(){
		this.selectedStudies = [];
		this.headercheckbox = false;
		this.currentPageSelectedStudy = [];
		this.pageHeaderCheckBoxTrack = [];
	}

	//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
	handleCheckboxSelections() {
		if (this.currentPageSelectedStudy.length === this.studyPageSize) {
			this.headercheckbox = true;
		} else {
			//For the last page
			if (this.studyTotalRecords - this.studyOffset < this.studyPageSize) {
				if (this.currentPageSelectedStudy.length === this.studyTotalRecords - this.studyOffset) {
					this.headercheckbox = true;
				} else {
					this.headercheckbox = false;
				}
			} else {
				this.headercheckbox = false;
			}
		}
	}

	//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
	updateCurrentPageSelectedStudies(localSelectedStudies) {
		let cloneData = _.cloneDeep(localSelectedStudies);
		cloneData = cloneData.splice(0, this.studyPageSize);
		this.currentPageSelectedStudy = [];
		cloneData.forEach(item => {this.currentPageSelectedStudy.push(item.pdc_study_id)});
	}

	//@@@PDC-2874: Add download option for study table on gene summary page
	downloadCompleteManifest() {
		this.loading = true;
		this.genePageService.getStudySpectralCount(this.gene_id, 0, this.studyTotalRecords, "", this.newFilterSelected).subscribe((data: any) =>{
			let filteredResults = data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts;
			let localSelectedGenes = [];
			for(let item of filteredResults){
				localSelectedGenes.push(item);
			}
			this.selectedStudies = localSelectedGenes;
			this.headercheckbox = true;
			//@@@PDC-3765: A 'S' symbol in Genes/ under checkbox of "Studies in Which the Gene Product Was Detected
			this.updateCurrentPageSelectedStudies(localSelectedGenes);
			this.loading = false;
			this.trackCurrentPageSelectedStudy(data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts);
		}); 
	}

	trackCurrentPageSelectedStudy(filteredStudiesData: GeneStudySpectralCountData[]){
		let studyNameList = [];
		this.currentPageSelectedStudy = [];
		filteredStudiesData.forEach((item) => studyNameList.push(item.pdc_study_id));
		this.selectedStudies.forEach(item => {if(studyNameList.indexOf(item.pdc_study_id) !== -1){
		  this.currentPageSelectedStudy.push(item.pdc_study_id);
		}});
	}

	onResize(event) {
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
