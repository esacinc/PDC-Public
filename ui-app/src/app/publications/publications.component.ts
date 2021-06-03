import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import {DataViewModule} from 'primeng/dataview';
import {MatExpansionModule} from '@angular/material/expansion'; 

import { publicationsStudyData, PublicationsData, QueryPublicationsData, publicationsFiltersData } from '../types';
import { StudySummaryComponent } from '../browse/study-summary/study-summary.component';
import { PublicationsService } from './publications.service';
import { MatDialog, MatDialogConfig, MatSidenav } from '@angular/material';

import {TableTotalRecordCount, AllStudiesData} from '../types';
import { FilesOverlayComponent } from '../browse/browse-by-file/files-overlay.component';

declare var window: any;

@Component({
selector: 'publications',
templateUrl: './publications.component.html',
styleUrls: ['../../assets/css/global.css', './publications.component.scss'],
})


//@@@PDC-3573 add some improvements to publications page
//@@@PDC-3648 add improvements to publications page - change title and add clear all filters button

export class PublicationsComponent implements OnInit{ 

	allFiltersData: Observable<publicationsFiltersData>;
	filteredPublicationsData: PublicationsData[];
	
	filterValues: any = { disease_type: "", year: "", program: ""} ;
	
	diseaseTypesFilterVals = [];
	yearFilterVals = [];
	programFilterVals = [];
	totalRecords = 0;
	offset: number = 0;
	limit: number = 50;
	pageSize: number = 50;
	newFilterSelected: any;
	cols: any[];
	loading = false;
	publicationFiltersGroup:FormGroup;
	isAbstractExpanded = false;
	
	filterSelected: any;
	
	breadcrumbs = [];
	newFilterValue: string;
	public filtersChangedInBreadcrumbBar: Object;
	handleTableLoading:any

	@ViewChild('sidenav') myNav: MatSidenav;
	
	constructor(private apollo: Apollo, private dialog: MatDialog, private publicationsService: PublicationsService, 
		private route: ActivatedRoute,
		private router: Router,
		private loc: Location) {
		
		this.publicationFiltersGroup = new FormGroup({
				diseaseTypeFormControl: new FormControl(),
				yearFormControl: new FormControl(),
				programFormControl: new FormControl()
		});
		  
		this.publicationFiltersGroup.setValue({diseaseTypeFormControl: '', yearFormControl: '', programFormControl: ''});
		this.getFiltersData();
		this.getFilteredPublicationsData();
	}
	
	get diseaseTypeFormControl(){
		return this.publicationFiltersGroup.get("diseaseTypeFormControl");
	}
	
	get yearFormControl(){
		return this.publicationFiltersGroup.get("yearFormControl");
	}
	
	get programFormControl(){
		return this.publicationFiltersGroup.get("programFormControl");
	}
	
	isAbstractExpandedToggle() {
		this.isAbstractExpanded = !this.isAbstractExpanded;
	}
	
	private removeOtherFromDiseaseTypes(diseases:string[]){
		diseases.forEach(( disease, index) => {
			  if (disease == "other") diseases.splice(index, 1);
		});
	}
	
	getFiltersData(){
		this.publicationsService.getPublicationsFilters().subscribe((data: any) =>{
		  this.allFiltersData = data.getUIPublicationFilters;
		  this.diseaseTypesFilterVals = this.allFiltersData['disease_types'];
		  this.yearFilterVals = this.allFiltersData['years'];
		  this.programFilterVals = this.allFiltersData['programs'];
		  this.removeOtherFromDiseaseTypes(this.diseaseTypesFilterVals);
		  console.log(this.diseaseTypesFilterVals);
		});
	}
	
	getFilteredPublicationsData() {
		this.loading = true;
		this.publicationsService.getFilteredPaginatedPublications(this.offset, this.limit, []).subscribe((data: any) =>{
		  this.filteredPublicationsData = data.getPaginatedUIPublication.uiPublication;
		  console.log(this.filteredPublicationsData);
		  this.totalRecords = data.getPaginatedUIPublication.total;
		  this.offset = data.getPaginatedUIPublication.pagination.from;
		  this.pageSize = data.getPaginatedUIPublication.pagination.size;
		  this.limit = data.getPaginatedUIPublication.pagination.size;
		  this.loading = false;
		});
	}
	
	loadPublications(event: any){
		this.loading = true;
		console.log(this.offset);
		console.log(event);
		this.offset = event.first;
		this.limit = event.rows;
		this.publicationsService.getFilteredPaginatedPublications(this.offset, this.limit, []).subscribe((data: any) =>{
		  this.filteredPublicationsData = data.getPaginatedUIPublication.uiPublication;
		  console.log(this.filteredPublicationsData);
		  //this.totalRecords = data.getPaginatedUIPublication.total;
		  this.offset = data.getPaginatedUIPublication.pagination.from;
		  this.pageSize = data.getPaginatedUIPublication.pagination.size;
          this.limit = data.getPaginatedUIPublication.pagination.size;
		  this.loading = false;
		});
	}

	
	filterPublications(filterVal: any){
		console.log(filterVal);
		switch(filterVal){
			case "disease_type" :{
				this.filterValues["disease_type"] = this.filterSelected.disease_type.join(';');
				break;
			}
			case "year": {
				console.log(this.filterSelected.year);
				this.filterValues["year"] = this.filterSelected.year.join(';');
				break;
			}
			case "program": {
				this.filterValues["program"] = this.filterSelected.program.join(';');
				break;
			}
			case "clear": {
				this.publicationFiltersGroup.setValue({diseaseTypeFormControl: '', yearFormControl: '', programFormControl: ''});
				this.filterValues["program"] = '';
				this.filterValues["year"] = '';
				this.filterValues["disease_type"] = '';
				break;
			}
		}
		this.offset = 0;
		this.loading = true;
		this.publicationsService.getFilteredPaginatedPublications(this.offset, this.limit, this.filterValues).subscribe((data: any) =>{
		  this.filteredPublicationsData = data.getPaginatedUIPublication.uiPublication;
		  console.log(this.filteredPublicationsData);
		  this.totalRecords = data.getPaginatedUIPublication.total;
		  this.offset = data.getPaginatedUIPublication.pagination.from;
		  this.pageSize = data.getPaginatedUIPublication.pagination.size;
          this.limit = data.getPaginatedUIPublication.pagination.size;
		  this.loading = false;
		});
	}

	isFilterChosen(){
		return (this.filterSelected.disease_type == "" && this.filterSelected.year == "" && this.filterSelected.program == "");
	}
	
	clearFilters(){
		this.filterPublications("clear");
	}

	showStudySummary(pdc_study_id: string, study_uuid: string, study_name: string){
		let study_data: AllStudiesData = {
			study_id: study_uuid,
			pdc_study_id: pdc_study_id,
			study_submitter_id: '',
			submitter_id_name: study_name,
			program_name: '',
			project_name: '',
			disease_type: '',
			primary_site: '',
			analytical_fraction: '',
			experiment_type: '',
			cases_count: undefined,
			aliquots_count: undefined,
			study_description: '',
			embargo_date: '',
			filesCount: [],
			supplementaryFilesCount: [],
			nonSupplementaryFilesCount: [],
			contacts: [],
			versions: []
		};
		//study_data.pdc_study_id = study_id;
		//study_data.study_submitter_id = study_name;
		console.log(study_data);
		const dialogConfig = new MatDialogConfig();

		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		//dialogConfig.minWidth = '1000px';
		dialogConfig.width = '80%';
		dialogConfig.height = '95%'

		dialogConfig.data = {
			summaryData: study_data,
		};
		this.router.navigate([{outlets: {studySummary: ['study-summary', study_name]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);


			dialogRef.afterClosed().subscribe(
				val => console.log("Dialog output:", val)
			);

  }
  
	private getPublicationDataByID(pub_id: string) {
		//console.log(pub_id);
		//console.log(this.filteredPublicationsData);
		for(let i=0; i < this.filteredPublicationsData.length; i++ ) {
			if (this.filteredPublicationsData[i].publication_id == pub_id) {
				return this.filteredPublicationsData[i];
			}
		}
		//If list of studies for a publication was not found, then return empty list
		return {studies: []};
	}
  
	showFilesOverlay(publication_id, data_category_val) {
		let studies_names = "";
		let current_study = this.getPublicationDataByID(publication_id) as PublicationsData;
		if (current_study.studies && current_study.studies.length > 0){
			let studies_list = current_study.studies;
			for(let i = 0; i < studies_list.length; i++) {
				studies_names += studies_list[i].submitter_id_name + "|";
			}
			if (studies_names.length > 0) {
				studies_names = studies_names.slice(0, -1);
			}
		}
		console.log(studies_names);
		const dialogConfig = new MatDialogConfig();	
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false; 
		dialogConfig.hasBackdrop = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '95%';
		dialogConfig.data = {
				summaryData: {study_name: studies_names, data_category: data_category_val, file_type: '', versions: false , acquisition_type: '', experiment_type:''},
				publicationsFiles: current_study.supplementary_data,
		};
		this.router.navigate([{outlets: {filesOverlay: ['files-overlay', studies_names]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(FilesOverlayComponent, dialogConfig);
		dialogRef.afterClosed().subscribe((val:any) => {
				console.log("Dialog output:", val);
				//Generate alias URL to hide auxiliary URL details when the overlay window was closed and the focus returnes back
				this.loc.replaceState("/publications");
		});	
	}


	ngOnInit() {
		
		this.filterSelected = { disease_type: '', year: '', program: ''}
		
		this.cols = [
			{field: 'title', header: 'Title'},
			{field: 'journal', header: 'Journal'},
			{field: 'year', header: 'year'},
			{field: 'disease_types', header: 'Disease Types'},
			{field: 'studies', header: 'Studies'},
			{field: 'supplementary_data', header: 'Supplementary Data'},
		];
	
	}
}