import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import "rxjs/add/operator/map";
import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule, 
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule} from '@angular/material';
import { GeneProteinSummaryService } from "./gene-protein-summary.service";
import { Filter, GeneProteinData, GeneStudySpectralCountData, GeneAliquotSpectralCountData, 
		GeneStudySpectralCountDataPaginated, GeneAliquotSpectralCountDataPaginated, ptmData } from '../types';


@Component({
  selector: 'app-gene-protein-summary',
  templateUrl: './gene-protein-summary.component.html',
  styleUrls: ['../../assets/css/global.css', './gene-protein-summary.component.scss'],
  providers: [ GeneProteinSummaryService ]
})

//@@@PDC-374 - adding url to overlay windows
//@@@PDC-648 - add spinning wheel when wating for data to load
//@@@PDC-670 - loading gene summary aliquot counts takes too long
//@@@PDC-716 - add PTM data
//@@@PDC-772 - remove study and aliquot counts table, add button to gene full page
//@@@PDC-2450 gene/protein summary missing NCBI gene id
export class GeneProteinSummaryComponent implements OnInit {

  gene_id: string;
  loading: boolean = false; //data is loaded from 3 different APIs asynchroniosly, so need 3 different flags for when data is finished loading
  loadingAliquotRecords: boolean = false;
  loadingGeneSummary: boolean = false;
  lodingPTMData: boolean = false;
  geneSummaryData: GeneProteinData;
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
  
  constructor(private activeRoute: ActivatedRoute, private router:Router, private apollo: Apollo,
				private geneProteinSummaryService: GeneProteinSummaryService,
				private dialogRef: MatDialogRef<GeneProteinSummaryComponent>,
				@Inject(MAT_DIALOG_DATA) public geneProteinData: any) {
    
	console.log(geneProteinData);
	this.gene_id = geneProteinData.summaryData;
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
	}
	this.getGeneSummaryData();
	this.getGeneAliquotSpectralCounts();
	this.getGeneStudySpectralCounts();
	this.getPTMData();
  }
  
  getGeneSummaryData(){
	  this.loadingGeneSummary = true;
    //@@@PDC-1123 call ui wrapper API
	  setTimeout(() => {
		  this.geneProteinSummaryService.getGeneDetails(this.gene_id).subscribe((data: any) =>{
			this.geneSummaryData = data.uiGeneSpectralCount;
			this.loadingGeneSummary = false;
		  });
	  }, 1000);
  }
 
  //PDC-772 no need to make API query for aliquot counts table
  getGeneAliquotSpectralCounts(){
	  /* this.loadingAliquotRecords = true;
	  this.aliquotSpectralCountLoadError = '';
		  //removed timout settings since this query sometimes takes a lot of time
		  this.geneProteinSummaryService.getAliquotSpectralCount(this.gene_id, this.aliquotOffset, this.aliquotLimit).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCount.uiGeneAliquotSpectralCounts;
			this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCount.total;
			this.aliquotOffset = data.getPaginatedUIGeneAliquotSpectralCount.pagination.from;
			this.aliquotLimit = data.getPaginatedUIGeneAliquotSpectralCount.pagination.size;
			this.aliquotPageSize = data.getPaginatedUIGeneAliquotSpectralCount.pagination.size;
			this.loadingAliquotRecords = false;
		  },
		  err => {
			  console.log("ERROR!!!!Loading data took too long");
			  this.aliquotSpectralCountLoadError = "Loading data took too long, please, close the overlay gene summary window and open it again.";
			  this.loadingAliquotRecords = false; //If loading data takes too much time and fails, need to stop spinning wheel
		  });
	 */
  }
  
  //PDC-772 no need to make API query for study table
  getGeneStudySpectralCounts(){
	 /* this.loading = true;
	  setTimeout(() => {
		  this.geneProteinSummaryService.getStudySpectralCount(this.gene_id, this.studyOffset, this.studyLimit).subscribe((data: any) =>{
			this.studySpectralCountsList = data.getPaginatedUIGeneStudySpectralCount.uiGeneStudySpectralCounts;
			this.studyTotalRecords = data.getPaginatedUIGeneStudySpectralCount.total;
			this.studyOffset = data.getPaginatedUIGeneStudySpectralCount.pagination.from;
			this.studyPageSize = data.getPaginatedUIGeneStudySpectralCount.pagination.size;
			this.studyLimit = data.getPaginatedUIGeneStudySpectralCount.pagination.size;
			this.loading = false;
		  });
	  }, 1000);*/
  }
  
  getPTMData(){
	  this.lodingPTMData = true;
	  setTimeout(() => {
		  this.geneProteinSummaryService.getGenePTMData(this.gene_id, this.ptmOffset, this.ptmLimit).subscribe((data: any) =>{
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
	  this.geneProteinSummaryService.getAliquotSpectralCount(this.gene_id, this.aliquotOffset, this.aliquotLimit).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCount.uiGeneAliquotSpectralCounts;
			if (this.aliquotOffset == 0) {
				this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCount.total;
				this.aliquotOffset = data.getPaginatedUIGeneAliquotSpectralCount.pagination.from;
				this.aliquotPageSize = data.getPaginatedUIGeneAliquotSpectralCount.pagination.size;
				this.aliquotLimit = data.getPaginatedUIGeneAliquotSpectralCount.pagination.size;
			}
			this.loadingAliquotRecords = false;
		}); 
  }
  
  loadNewPageStudySpectralCounts(event: any){
	  this.studyOffset = event.first;
	  this.studyLimit = event.rows;
	  this.loading = true;
	  this.geneProteinSummaryService.getStudySpectralCount(this.gene_id, this.studyOffset, this.studyLimit).subscribe((data: any) =>{
			this.studySpectralCountsList = data.getPaginatedUIGeneStudySpectralCount.uiGeneStudySpectralCounts;;
			if (this.studyOffset == 0) {
				this.studyTotalRecords = data.getPaginatedUIGeneStudySpectralCount.total;
				this.studyOffset = data.getPaginatedUIGeneStudySpectralCount.pagination.from;
				this.studyPageSize = data.getPaginatedUIGeneStudySpectralCount.pagination.size;
				this.studyLimit = data.getPaginatedUIGeneStudySpectralCount.pagination.size;
			}
			this.loading = false;
		}); 
  }
  
  loadPTMData(event: any){
	  this.ptmOffset = event.first;
	  this.ptmLimit = event.rows;
	  this.lodingPTMData = true;
	  this.geneProteinSummaryService.getGenePTMData(this.gene_id, this.ptmOffset, this.ptmLimit).subscribe((data: any) =>{
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
  
  
  close() {
		this.router.navigate([{outlets: {'geneSummary': null}}]);
        this.dialogRef.close();
  }
  
  navigateFullPage(){
	  var geneFullPageRoute = 'gene/' + this.geneSummaryData.gene_name;
	  this.router.navigate([{outlets: {'primary': geneFullPageRoute, 'geneSummary': null}}]);
	  this.dialogRef.close();
  }
  
  ngOnInit() {
  }

}
