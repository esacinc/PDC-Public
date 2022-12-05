import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap ,  take } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { DataViewModule } from 'primeng/dataview';
import { MatExpansionModule } from '@angular/material/expansion';
import { ButtonModule } from 'primeng/button'; 

import { QueryLegacyStudies, legacyStudyPublications } from '../types';
import { StudySummaryComponent } from '../browse/study-summary/study-summary.component';
import { LegacyStudySummaryComponent } from './legacy-study-summary/legacy-study-summary.component';
import { LegacyDataService } from './legacy-data.service';
import { MatDialog, MatDialogConfig, MatSidenav } from '@angular/material';

import {TableTotalRecordCount, AllStudiesData} from '../types';
import { FilesOverlayComponent } from '../browse/browse-by-file/files-overlay.component';

declare var window: any;

@Component({
selector: 'legacy-data',
templateUrl: './legacy-data.component.html',
styleUrls: ['../../assets/css/global.css', './legacy-data.component.scss'],
})

//@@@PDC-3363 Develop UI legacy data 
//@@@PDC-3729 Change layout of the page, group studies with the same name, add analytical fraction and experiemnt type data
//@@@PDC-3982 Create new layout for Legacy Data page - for now all this code is commented out
export class LegacyDataComponent implements OnInit{ 

	allStudies: QueryLegacyStudies[];
	projects: any[] = [];
	//studiesList: any[] = [];
	
	totalRecords = 0;
	offset: number = 0;
	limit: number = 50;
	pageSize: number = 50;
	cols: any[];
	colsStudy: any[];
	loading = false;
	publicationFiltersGroup:FormGroup;
	isAbstractExpanded = false;
	isProjectExpanded = false;
	
	breadcrumbs = [];
	newFilterValue: string;
	public filtersChangedInBreadcrumbBar: Object;
	handleTableLoading:any

	@ViewChild('sidenav') myNav: MatSidenav;
	isFullDescription = false;
	//projectsListView = true;

	
	constructor(private apollo: Apollo, private dialog: MatDialog, private legacyDataService: LegacyDataService, 
		private route: ActivatedRoute,
		private router: Router,
		private loc: Location) {
		
		this.publicationFiltersGroup = new FormGroup({
				diseaseTypeFormControl: new FormControl(),
				yearFormControl: new FormControl(),
				programFormControl: new FormControl()
		});
		  
		this.publicationFiltersGroup.setValue({diseaseTypeFormControl: '', yearFormControl: '', programFormControl: ''});
		this.getStudiesData();
		//this.getFilteredPublicationsData();
	}
	
	/* //PDC-3982 Create new layout for Legacy Data page
	changeView(){
		this.projectsListView = ! this.projectsListView;
	}*/
	
	showFullDescription(){
		this.isFullDescription = !this.isFullDescription;
	}
	
	isAbstractExpandedToggle() {
		this.isAbstractExpanded = !this.isAbstractExpanded;
	}
	
	isExpandedToggle(){
		this.isProjectExpanded = !this.isProjectExpanded;
	}
	
	/*private removeOtherFromDiseaseTypes(diseases:string[]){
		diseases.forEach(( disease, index) => {
			  if (disease == "other") diseases.splice(index, 1);
		});
	}*/
	
	getStudiesData(){
		this.legacyDataService.getAllLegacyStudies().pipe(take(1)).subscribe((data: any) =>{
		  this.allStudies = data.uiLegacyStudies ;
		  //sort all studies by their sort_order column
		  this.allStudies.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : -1);
		  console.log(this.allStudies);
		  for (let study of this.allStudies) {
			  //PDC-3982 Create new layout for Legacy Data page
			 /*var studyIdx = this.findStudyInList(study.submitter_id_name);
			 if (studyIdx > -1) {
				 this.studiesList[studyIdx].substudiesList.push({subStudyName: study.study_submitter_id,
																					analytical_fraction: study.analytical_fraction,
																					experiment_type: study.experiment_type});
			 }
			 else {
				 this.studiesList.push ({study_name: study.submitter_id_name,
										 substudiesList: [{subStudyName:study.study_submitter_id,
														   analytical_fraction: study.analytical_fraction,
														   experiment_type: study.experiment_type}],
										 analytical_fraction: "",
										 experiment_type: ""
										});
			 }*/
			  //console.log(study);
			  var index = this.findProjectInList(study.project_submitter_id);
			  //console.log(index);
			  if (index > -1) {
				  //this.projects[index].studies.push(study);
				  //look if this study name already is in the list
				  let studyIndex = -1;
				  for (var i = 0; i < this.projects[index].studies.length; i++) {
					if ( this.projects[index].studies[i].study_name == study.submitter_id_name) {
						studyIndex = i;
					}
				  }
				  //console.log("Project index: " + index + ", Study index: " + studyIndex);
				  //Grouping studies with the same name
				  if (studyIndex > -1) {
					  //console.log("Study found");
					 // console.log(this.projects[index].studies[studyIndex]);
					//If study already exists in the list add just the substudy name
					this.projects[index].studies[studyIndex].studyNamesList.push( {subStudyName: study.study_submitter_id,
																					analytical_fraction: study.analytical_fraction,
																					experiment_type: study.experiment_type});
				  } else {
					  //console.log("Study NOT found");
					this.projects[index].studies.push( {study_name:  study.submitter_id_name, 
														studyNamesList: [{subStudyName: study.study_submitter_id,
																		  analytical_fraction: study.analytical_fraction,
																		  experiment_type: study.experiment_type}],
														study_description: study.study_description });
					//console.log(this.projects[index].studies);
				  }
			  } else {
				  //this.projects.push({project_name: study.project_submitter_id, studies: [study]});
				  this.projects.push({project_name: study.project_submitter_id, studies: [ 
																					{study_name:  study.submitter_id_name, 
																					 studyNamesList: [{subStudyName: study.study_submitter_id,
																									   analytical_fraction: study.analytical_fraction,
																									   experiment_type: study.experiment_type}],
																					 study_description: study.study_description
																					}],							
									});
				  //console.log(this.projects);
			  }
			  
		  }
		  //PDC-3982 Create new layout for Legacy Data page
		  /*console.log(this.studiesList);
		  for (var i = 0; i < this.studiesList.length; i++) {
			  let an_frac = [];
			  let exp_type = [];
			  for (var j = 0; j < this.studiesList[i].substudiesList.length; j++){
				  if ( an_frac.indexOf(this.studiesList[i].substudiesList[j].analytical_fraction) === -1 ) {
					  an_frac.push(this.studiesList[i].substudiesList[j].analytical_fraction);
				  }
				  if ( exp_type.indexOf(this.studiesList[i].substudiesList[j].experiment_type) === -1 ) {
					  exp_type.push(this.studiesList[i].substudiesList[j].experiment_type);
				  }
			  }
			  this.studiesList[i].analytical_fraction = an_frac.join(", ");
			  this.studiesList[i].experiment_type = exp_type.join(", ");
		  }
		   console.log(this.studiesList);*/
		  console.log(this.projects);
		  
		});
	}
	
	private findProjectInList(project_name: string){
		for (var i = 0; i < this.projects.length; i++) {
				if (this.projects[i].project_name == project_name) {
					return i;
				}
		}
		return -1;
	}
	
	//PDC-3982 Create new layout for Legacy Data page
	/*private findStudyInList(study_name_param: string) {
		for (var i = 0; i < this.studiesList.length; i++) {
			if (this.studiesList[i].study_name == study_name_param) {
				return i;
			}
		}
		return -1;
	}*/
	
	private findStudyByStudyName(study_name: string) {
		for (var i = 0; i < this.allStudies.length; i++) {
			if (this.allStudies[i].study_submitter_id == study_name) {
				return i;
			}
		}
		return -1;
	}
					

	showStudySummary(study_name: string){
		var index = this.findStudyByStudyName(study_name);
		if ( index > -1) {
			/*let study_data: QueryLegacyStudies = {
				study_id: '',
				submitter_id_name: study_name,
				pdc_study_id: '',
				study_description: '',
				project_submitter_id: '',
				analytical_fraction: '',
				experiment_type: '',
				embargo_date: '',
				sort_order: '',
				supplementaryFilesCount: [],
				nonSupplementaryFilesCount: [],
				publications: []
			};*/
			//study_data.pdc_study_id = study_id;
			//study_data.study_submitter_id = study_name;
			let study_data: QueryLegacyStudies = this.allStudies[index];
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
			this.router.navigate([{outlets: {studySummary: ['legacy-study-summary', study_name]}}], { skipLocationChange: true });
			const dialogRef = this.dialog.open(LegacyStudySummaryComponent, dialogConfig);


				dialogRef.afterClosed().subscribe(
					val => console.log("Dialog output:", val)
				);
		}
		else {
			alert("Study " + study_name + " is not found!");
		}

	}
  
	showFilesOverlay(publication_id, data_category_val) {
		let studies_names = "";
		/*if (this.getPublicationDataByID(publication_id).studies && this.getPublicationDataByID(publication_id).studies.length > 0){
			let studies_list = this.getPublicationDataByID(publication_id).studies;
			for(let i = 0; i < studies_list.length; i++) {
				studies_names += studies_list[i].submitter_id_name + "|";
			}
			if (studies_names.length > 0) {
				studies_names = studies_names.slice(0, -1);
			}
		}*/
		console.log(studies_names);
		const dialogConfig = new MatDialogConfig();	
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false; 
		dialogConfig.hasBackdrop = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '95%';
		dialogConfig.data = {
				summaryData: {study_name: studies_names, data_category: data_category_val, file_type: '', versions: false , acquisition_type: '', experiment_type:''},
		};
		this.router.navigate([{outlets: {filesOverlay: ['files-overlay', studies_names]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(FilesOverlayComponent, dialogConfig);
		dialogRef.afterClosed().subscribe((val:any) => {
				console.log("Dialog output:", val);
				//Generate alias URL to hide auxiliary URL details when the overlay window was closed and the focus returnes back
				this.loc.replaceState("/TechnologyAdvancementStudies");
		});	
	}


	ngOnInit() {
		this.cols = [
			{field: 'study_name', header: 'Study ID'},
			//{field: 'study_description', header: 'Description'},
			{field: 'analytical_fraction', header: 'Analytical Fraction'},
			{field: 'experiment_type', header: 'Experiment Type'}];
		this.colsStudy = [
			{field: 'project_name', header: 'Project Name'}
		];
	}
}
