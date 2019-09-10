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
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmData } from '../types';


@Component({
  selector: 'app-gene-page',
  templateUrl: './gene-page.component.html',
  styleUrls: ['../../assets/css/global.css', './gene-page.component.scss'],
  providers: [ GenePageService ]
})

//@@@PDC-770 Add a gene page with filters
export class GenePageComponent implements OnInit, OnChanges {

  gene_id: string;
  loading: boolean = false; //data is loaded from 3 different APIs asynchroniosly, so need 3 different flags for when data is finished loading
  loadingAliquotRecords: boolean = false;
  loadingGeneSummary: boolean = false;
  lodingPTMData: boolean = false;
  geneSummaryData: GeneProteinData = {
		gene_name: "",
		NCBI_gene_id: "",
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
		NCBI_gene_id: "",
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
  }
  
  getGeneSummaryData(){
	  this.loadingGeneSummary = true;
	  setTimeout(() => {
		  this.genePageService.getGeneDetails(this.gene_id.toUpperCase()).subscribe((data: any) =>{
			this.geneSummaryData = data.geneSpectralCount;
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
			this.loading = false;
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
			this.loadingAliquotRecords = false;
		}); 
  }
  
  loadNewPageStudySpectralCounts(event: any){
	  this.studyOffset = event.first;
	  this.studyLimit = event.rows;
	  this.loading = true;
	  this.genePageService.getStudySpectralCount(this.gene_id, this.studyOffset, this.studyLimit, "", this.newFilterSelected).subscribe((data: any) =>{
			this.studySpectralCountsList = data.getPaginatedUIGeneStudySpectralCountFiltered.uiGeneStudySpectralCounts;;
			if (this.studyOffset == 0) {
				this.studyTotalRecords = data.getPaginatedUIGeneStudySpectralCountFiltered.total;
				this.studyOffset = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.from;
				this.studyPageSize = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size;
				this.studyLimit = data.getPaginatedUIGeneStudySpectralCountFiltered.pagination.size; 
			}
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
			this.lodingPTMData = false;
		}); 
  }
  
  onFilterSelected(filterValue: string) {
		this.newFilterValue = filterValue;
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
  }		

  ngOnChanges(changes: SimpleChanges){
	  console.log(this.newFilterValue);
	  console.log(changes);
  }
  
  ngOnInit() {
  }

}
