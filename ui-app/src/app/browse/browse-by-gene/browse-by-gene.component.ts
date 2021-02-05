import { Apollo } from 'apollo-angular';

import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AllGeneData, ptmData } from '../../types';
import { BrowseByGeneService } from './browse-by-gene.service';
import { GeneProteinSummaryComponent } from '../../gene-protein-summary/gene-protein-summary.component';
import { ngxCsv } from "ngx-csv/ngx-csv";

@Component({
  selector: 'browse-by-gene',
  templateUrl: './browse-by-gene.component.html',
  styleUrls: ['../../../assets/css/global.css', './browse-by-gene.component.css'],
  providers: [ BrowseByGeneService]
})

//@@@PDC-716 Add PTM data
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-937: Add a button to allow download all manifests with a single click
//@@@PDC-1063: Implement select all, select page, select none for all tabs
export class BrowseByGeneComponent implements OnInit {

	filteredGenesData: AllGeneData[]; //Filtered list of gene data
	loading: boolean = false; //Flag indicates that the data is still being loaded from server
	filterChangedFlag: boolean = true; //Flag indicates that filter selection was changed
	@Input() newFilterValue: any;
	newFilterSelected: any;
	//Pagination variables
	totalRecords: number;
	offset: number;
	limit: number;
	pageSize: number;
	selectedGenesData: AllGeneData[] = [];
	cols: any[];
	static urlBase;
	gdcUrl: string = environment.gdc_case_id_url;
	@Output() genesTotalRecordChanged:EventEmitter<any> = new EventEmitter<any>();
	sort: string;
	ptmLimit: number = 5;
	ptmData: ptmData[];
	ptmSitesData: string[];
	currentGeneName: string = "";
	display: boolean = false;
	ptmStatsData: any = [{'ptm_type_counter': [], 'sites_list': []}];
	fenceRequest:boolean = false;
	//keep a full list of filter category
	// Array whichs hold filter names. Must be updated when new filters are added to browse page.
	allFilterCategory: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","study_name","submitter_id_name","sample_type","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable","studyName_genes_tab","gene_name","biospecimen_status", "case_status"];
	
  //@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	headercheckbox:boolean = false;
  currentPageSelectedGene = [];
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

  constructor(private apollo: Apollo, private router: Router,  private dialog: MatDialog,
				private browseByGeneService : BrowseByGeneService, private activatedRoute:ActivatedRoute) {
	// Array which holds filter names. Must be updated when new filters are added to browse page. 
	this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "gene_name": "", "downloadable": "", "biospecimen_status": "", "case_status": ""};	
	this.offset = 0; //Initialize values for pagination
	this.limit = 10;
	this.totalRecords = 0;
	this.pageSize = 10;
	this.getAllGenesData();
	this.sort = '';
	BrowseByGeneComponent.urlBase = environment.dictionary_base_url;
  }
  
  get staticUrlBase() {
    return BrowseByGeneComponent.urlBase;
  }

  
  /*API call to get all gene data */
  getAllGenesData(){
	  this.loading = true;
	  setTimeout(() => {
		this.browseByGeneService.getFilteredGenesDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			console.log(data);
				this.filteredGenesData = data.getPaginatedUIGene.uiGenes as Array<AllGeneData>;
				this.totalRecords = data.getPaginatedUIGene.total;
				this.genesTotalRecordChanged.emit({type: 'genes', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIGene.pagination.from;
				this.pageSize = data.getPaginatedUIGene.pagination.size;
				this.limit = data.getPaginatedUIGene.pagination.size;
				for (let gene of this.filteredGenesData) {
					this.getPTMData(gene.gene_name);
				}
				console.log(this.ptmStatsData);
				this.loading = false;
				this.clearSelection();
			});
	  }, 1000);
  }
 
  ngOnChanges(changes: SimpleChanges){
	if (this.newFilterValue){
		this.filteredGenesData = [];
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
			this.newFilterSelected["gene_name"] = "";
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
			  } else if (filterName == "gene_name") { 
					selectedFiltersForBrowse[filterName] = filterVal.replace(/ /g, ";");
			  }	else {
					selectedFiltersForBrowse[filterName] = filterVal.join(";");
			  }
			}
		  }
		  this.newFilterSelected = selectedFiltersForBrowse;
		}
		this.offset = 0; //Reinitialize offset for each new filter value
		this.loading = true;
		this.browseByGeneService.getFilteredGenesDataPaginated(this.offset, this.limit,this.sort, this.newFilterSelected).subscribe((data: any) =>{
			this.filteredGenesData = data.getPaginatedUIGene.uiGenes ;
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIGene.total;
				this.genesTotalRecordChanged.emit({type: 'genes', totalRecords:this.totalRecords});
				this.offset = data.getPaginatedUIGene.pagination.from;
				this.pageSize = data.getPaginatedUIGene.pagination.size;
				this.limit = data.getPaginatedUIGene.pagination.size;
			}
			for (let gene of this.filteredGenesData) {
					this.getPTMData(gene.gene_name);
			}
			this.loading = false;
			this.clearSelection();
		});
		//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
		// Important: This code has to be present in the last tab of the browse page. 
		//'Genes' is the last tab in Browse page at the time of coding and hence deleting the local storage element after the last data table is loaded.
		if (this.fenceRequest && selectedFiltersForBrowse) {
			localStorage.removeItem("selectedFiltersForBrowse");
		}
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
			this.isTableLoading.emit({isTableLoading:"gene:true"});
		} else {
			this.loading = true;
		}
		this.browseByGeneService.getFilteredGenesDataPaginated(0, this.totalRecords, this.sort, this.newFilterSelected).subscribe((data: any) =>{
			//console.log(data);
			let filteredGenesData = data.getPaginatedUIGene.uiGenes as Array<AllGeneData>;
			let localSelectedGenes = [];
			for(let item of filteredGenesData){
				localSelectedGenes.push(item);
			}
			if (buttonClick) {
				this.selectedGenesData = localSelectedGenes;
				this.headercheckbox = true;
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
					let exportFileObject = JSON.parse(JSON.stringify(localSelectedGenes, colValues));
					
					new ngxCsv(exportFileObject, this.getCsvFileName(), csvOptions);
				}
				this.isTableLoading.emit({isTableLoading:"gene:false"});
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

  /* Small helper function to detrmine whether the download button should be disabled or not */
isDownloadDisabled(){
	if (this.selectedGenesData) {
		if (this.selectedGenesData.length > 0) {
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
		this.browseByGeneService.getFilteredGenesDataPaginated(this.offset, this.limit, this.sort, this.newFilterSelected).subscribe((data: any) => {
			this.filteredGenesData = data.getPaginatedUIGene.uiGenes ;
			this.ptmStatsData = [];
			for (let gene of this.filteredGenesData) {
					this.getPTMData(gene.gene_name);
			}
			if (this.offset == 0) {
				this.totalRecords = data.getPaginatedUIGene.total;
				this.genesTotalRecordChanged.emit({ type: 'genes', totalRecords: this.totalRecords });
				this.offset = data.getPaginatedUIGene.pagination.from;
				this.pageSize = data.getPaginatedUIGene.pagination.size;
				this.limit = data.getPaginatedUIGene.pagination.size;
			}
			this.loading = false;
			this.trackCurrentPageSelectedCase(data.getPaginatedUIGene.uiGenes);
		});
		
		if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
    }
	}
	
	showGeneSummary(gene_name: string){
		const dialogConfig = new MatDialogConfig();
		
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '70%';
		
		dialogConfig.data = {
			summaryData: gene_name
		};
		this.router.navigate([{outlets: {geneSummary: ['gene-summary', gene_name]}}]);
		const dialogRef = this.dialog.open(GeneProteinSummaryComponent, dialogConfig);
		dialogRef.afterClosed().subscribe(
			val => console.log('Dialog output:', val)
		);
	}
	
	getPTMSitesData(gene_id:any){
		this.browseByGeneService.getGenePTMData(gene_id, 0, this.ptmLimit).subscribe((data: any) =>{
			this.ptmData = data.getPaginatedUIPtm.uiPtm;
			for (let data of this.ptmData){
				this.ptmSitesData.push(data.site);
				//console.log(data);
			}
			console.log(this.ptmSitesData);
		});
	}
	
	getPTMData(gene_id:any){
		this.browseByGeneService.getGenePTMData(gene_id, 0, 200).subscribe((data: any) =>{
			this.ptmData = data.getPaginatedUIPtm.uiPtm;
			let sites_list: string[] = [];
			let ptm_type_counters = [];
			for (let data of this.ptmData){
				//this.ptmSitesData.push(data.site);
				//console.log(data);
				if (sites_list.length < 5) {
					sites_list.push(data.site);
				}
				let ptmType = data.ptm_type.trim();
				let index = ptm_type_counters.findIndex(x => {if (x.ptm_type === ptmType) {return x;} else { return -1}});
				if (index > -1 ){
					ptm_type_counters[index].counter++;
				}
				else {
					ptm_type_counters.push( {ptm_type: ptmType, counter: 1} );
				}
			}
			console.log(sites_list);
			//this.ptmStatsData[gene_id] = {"ptm_type_counter": ptm_type_counters, "sites_list": sites_list.join("\r\n")};
			this.ptmStatsData[gene_id] = {"ptm_type_counter": ptm_type_counters, "sites_list": sites_list};
		});
	}
	
  ngOnInit() {
	  //Have to define this structure for Primeng CSV export to work properly
	  this.cols = [
		{field: 'gene_name', header: 'Gene'},
		{field: 'chromosome', header: 'Chromosome'},
		{field: 'locus', header: 'Locus'},
		{field: 'num_study', header: 'No of Studies'},
		{field: 'proteins', header: 'Proteins'}
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
		this.selectedGenesData =  this.currentPageSelectedGene = [];
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
	geneTableExportCSV(dt){
		dt.exportFilename = this.getCsvFileName();
		dt.exportCSV({ selectionOnly: true });
	}

	private getCsvFileName(): string {
    let csvFileName = "PDC_gene_manifest_";
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
		let localSelectedCases = emptyArray.concat(this.selectedGenesData);
		if(this.headercheckbox){
			for(let item of this.filteredGenesData){
				if(this.currentPageSelectedGene.indexOf(item.gene_name) === -1){
					localSelectedCases.push(item);
					this.currentPageSelectedGene.push(item.gene_name);
				} 
			}
			this.selectedGenesData = localSelectedCases;
		}else{
			this.selectedGenesData = [];
			this.currentPageSelectedGene = [];
			this.pageHeaderCheckBoxTrack = [];
		}
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	onRowSelected(event:any){
		this.currentPageSelectedGene.push(event.data.gene_name);
		if(this.currentPageSelectedGene.length === this.pageSize){
			this.headercheckbox = true;
		}
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	onRowUnselected(event){
		let index = this.currentPageSelectedGene.indexOf(event.data.gene_name);
		if(index >-1){
			this.currentPageSelectedGene.splice(index,1);
		}
		if(this.currentPageSelectedGene.length === this.pageSize){
			this.headercheckbox = true;
		}else{
			this.headercheckbox = false;
		}
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	private clearSelection(){
		this.selectedGenesData = [];
		this.headercheckbox = false;
		this.currentPageSelectedGene = [];
		this.pageHeaderCheckBoxTrack = [];
	}

	//@@@PDC-848 Fix headercheckbox issue for data tables on browse page
	private trackCurrentPageSelectedCase(filteredFilesData: AllGeneData[]){
		let fileIdList = [];
		this.currentPageSelectedGene = [];
		filteredFilesData.forEach((item) => fileIdList.push(item.gene_name));
		this.selectedGenesData.forEach(item => {if(fileIdList.indexOf(item.gene_name) !== -1){
			this.currentPageSelectedGene.push(item.gene_name);
		}});
	}
}
