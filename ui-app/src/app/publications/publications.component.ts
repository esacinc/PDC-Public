import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap, debounceTime,  startWith} from 'rxjs/operators';
import gql from 'graphql-tag';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import {DataViewModule} from 'primeng/dataview';
import {MatExpansionModule} from '@angular/material/expansion'; 

import { publicationsStudyData, PublicationsData, QueryPublicationsData, publicationsFiltersData } from '../types';
import { StudySummaryComponent } from '../browse/study-summary/study-summary.component';
import { PublicationsService } from './publications.service';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { MatSidenav } from '@angular/material/sidenav';

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
//@@@PDC-3698 update publication page to add a string field in the filters for pubmed ID
//@@@PDC-3646 make publication page filters function like Browse page filters 

export class PublicationsComponent implements OnInit{ 

	allFiltersData: Observable<publicationsFiltersData>;
	filteredPublicationsData: PublicationsData[];
	
	filterValues: any = { disease_type: "", year: "", program: "", pubmed_id: ""} ;
	filteredOptions: Observable<string[]>;
	options: any[] = []; // will hold the display name and value of the search terms
	
	diseaseTypesFilterVals = [];
	yearFilterVals = [];
	programFilterVals = [];
	diseaseTypesFilter = [];
	yearFilter = [];
	programFilter = [];
	totalRecords = 0;
	offset: number = 0;
	limit: number = 50;
	pageSize: number = 50;
	newFilterSelected: any;
	cols: any[];
	loading = false;
	publicationFiltersGroup:UntypedFormGroup;
	isAbstractExpanded = false;
	
	filterSelected: any;
	
	searchErrorMessageFlag = false;

	@ViewChild('sidenav') myNav: MatSidenav;
	
	constructor(private apollo: Apollo, private dialog: MatDialog, private publicationsService: PublicationsService, 
		private route: ActivatedRoute,
		private router: Router,
		private loc: Location) {
		
		this.publicationFiltersGroup = new UntypedFormGroup({
				diseaseTypeFormControl: new UntypedFormControl(),
				yearFormControl: new UntypedFormControl(),
				programFormControl: new UntypedFormControl(),
				searchFormControl: new UntypedFormControl()
		});
		  
		this.publicationFiltersGroup.setValue({diseaseTypeFormControl: '', yearFormControl: '', programFormControl: '', searchFormControl: ''});
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
	
	get searchFormControl() {
		return this.publicationFiltersGroup.get("searchFormControl");
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
		  this.totalRecords = data.getPaginatedUIPublication.total;
		  this.offset = data.getPaginatedUIPublication.pagination.from;
		  this.pageSize = data.getPaginatedUIPublication.pagination.size;
		  this.limit = data.getPaginatedUIPublication.pagination.size;
		  this.yearFilter = [];
		  this.programFilter = [];
		  this.diseaseTypesFilter = [];
		  for (let i=0; i < this.filteredPublicationsData.length; i++ ) {
			this.updateFiltersCounters(this.filteredPublicationsData[i]);
		  }
		  //console.log(this.yearFilter);
		  //console.log(this.diseaseTypesFilter);
		  //console.log(this.programFilter);
		  this.loading = false;
		});
	}
	
	//@@@PDC-3646 - update publications counters per filters' values
	private updateFiltersCounters( publicationData: any){
		let filterValIdx = this.findFilterNameIndex(publicationData.year, this.yearFilter);
		if (filterValIdx == -1) {
			this.yearFilter.push( {filterVal: publicationData.year, pub_ids: [publicationData.publication_id]});	
		} else {
			this.yearFilter[filterValIdx].pub_ids.push(publicationData.publication_id);
		}
		filterValIdx = this.findFilterNameIndex(publicationData.program_name, this.programFilter);
		if (filterValIdx == -1) {
			this.programFilter.push( {filterVal: publicationData.program_name, pub_ids: [publicationData.publication_id]});	
		} else {
			this.programFilter[filterValIdx].pub_ids.push(publicationData.publication_id);
		}
		for (var j = 0; j < publicationData.disease_types.length; j++) {
			filterValIdx = this.findFilterNameIndex(publicationData.disease_types[j], this.diseaseTypesFilter);
			if (filterValIdx == -1) { 
				this.diseaseTypesFilter.push( {filterVal: publicationData.disease_types[j], pub_ids: [publicationData.publication_id]});
			} else {
				this.diseaseTypesFilter[filterValIdx].pub_ids.push(publicationData.publication_id);
			}
		}
	}
	
	private findFilterNameIndex(varValue: string, filterArray: any[]) {
		let returnValue = -1;
		for (var i = 0; i < filterArray.length; i++ ) {
			if (filterArray[i].filterVal == varValue) {
				returnValue = i;
			}
		}
		return returnValue;
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
		console.log(this.filterSelected.pubmed_id);
		console.log(filterVal);
		var searchFlag = true;
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
			case "pubmed_id": {
				//PDC-3807 validate pubmed id search input
				if (this.filterSelected.pubmed_id.value != undefined && this.filterSelected.pubmed_id.value.match("^[0-9]*$")) {
					this.searchErrorMessageFlag = false;
					this.filterValues["pubmed_id"] = this.filterSelected.pubmed_id.value;
				} else {
					searchFlag = false;
					this.searchErrorMessageFlag = true;
				}
				break;
			}
			case "clear": {
				this.searchErrorMessageFlag = false;
				this.publicationFiltersGroup.setValue({diseaseTypeFormControl: '', yearFormControl: '', programFormControl: '', searchFormControl: '' });
				this.filterValues["program"] = '';
				this.filterValues["year"] = '';
				this.filterValues["disease_type"] = '';
				this.filterValues["pubmed_id"] = '';
				break;
			}
		}
		if (searchFlag) {
			this.searchErrorMessageFlag = false;
			this.offset = 0;
			this.loading = true;
			this.publicationsService.getFilteredPaginatedPublications(this.offset, this.limit, this.filterValues).subscribe((data: any) =>{
			  this.filteredPublicationsData = data.getPaginatedUIPublication.uiPublication;
			  console.log(this.filteredPublicationsData);
			  this.totalRecords = data.getPaginatedUIPublication.total;
			  this.offset = data.getPaginatedUIPublication.pagination.from;
			  this.pageSize = data.getPaginatedUIPublication.pagination.size;
			  this.limit = data.getPaginatedUIPublication.pagination.size;
			  this.yearFilter = [];
			  this.programFilter = [];
			  this.diseaseTypesFilter = [];
			  for (let i=0; i < this.filteredPublicationsData.length; i++ ) {
				this.updateFiltersCounters(this.filteredPublicationsData[i]);
			  }
			  this.loading = false;
			});
		}
	}

	isFilterChosen(){
		return (this.filterSelected.disease_type == "" && this.filterSelected.year == "" && this.filterSelected.program == "" && this.filterSelected.pubmed_id == "");
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
	
	searchPubmedID(search_term:string){
		console.log(search_term);
		//PDC-3807 validate pubmed id search input
		if (search_term.match("^[0-9]*$")) {
			this.searchErrorMessageFlag = false;
			this.loading = true;
			this.publicationsService.getPubmedIDSearchResults(search_term).subscribe((data: any) =>{
				let searchResults = data.getPaginatedUIPublication.uiPublication;
				for (let returnValue of searchResults){
					let display_name = returnValue.title + " (PMID:" + returnValue.pubmed_id + ")";
					this.options.push({name: display_name, value: returnValue.pubmed_id });
				}
				this.loading = false;  
			});
		} else {
			this.searchErrorMessageFlag = true;
		}
	}
	
	//helper function for pubmed id autocomplete search field
	displayFunc(search_result:any):string{
		return search_result ? search_result.name : '';
	}
	
	//This function returns filled out options list which will populate search autcomplete dropdown list
	private _filter(value: string): string[] {
		value = value.trim();
		this.options = [];
		//PDC-3807 validate pubmed id search input
		if (value.match("^[0-9]*$")) {
			const filterValue = value.toLowerCase();
			this.searchPubmedID(value);
		}
		return this.options;
	}

	ngOnInit() {
		
		this.filterSelected = { disease_type: '', year: '', program: '', pubmed_id: ''}
		
		this.cols = [
			{field: 'title', header: 'Title'},
			{field: 'journal', header: 'Journal'},
			{field: 'year', header: 'year'},
			{field: 'disease_types', header: 'Disease Types'},
			{field: 'studies', header: 'Studies'},
			{field: 'supplementary_data', header: 'Supplementary Data'},
		];
		
		// Monitor changes to search field and populate dropdown autocomplete list 
	    // as soon as the user entered at least 3 characters
	    this.filteredOptions = this.searchFormControl.valueChanges.pipe(debounceTime(400))
			.pipe(
				startWith(''),
				map(value => value.length > 1 ? this._filter(value) : [])	
			);
	
	}
}
