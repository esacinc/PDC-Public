import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap } from 'rxjs/operators';
import gql from 'graphql-tag';

import { Chart } from 'angular-highcharts';
import {AnalyticFractionCount} from '../types';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import {  QueryDiseases, Disease, ExperimentTypeCount, Filter } from '../types';

import { BrowseService } from './browse.service';
import { MatSidenav } from '@angular/material';

import {TableTotalRecordCount} from '../types';

@Component({
selector: 'browse',
templateUrl: './browse.component.html',
styleUrls: ['../../assets/css/global.css', './browse.component.scss'],
})
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-447 - angular-highcharts module changed their chart structure from "_options" to "options"
//@@@PDC-493 Make charts on the portal interactive
//@@@PDC-518 Rearrange and update text on the browse page tabs and download
//@@@PDC-522 Change the file filters to a new filters tab
//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
export class BrowseComponent implements OnInit{ 
	diseasesData: Observable<Disease[]>;
	diseaseTypesChart: any;
	expCountChart: any;
	analyticalFractionsChart: any;
	expTypesCounts: ExperimentTypeCount[] = [];
	analyticalFractionsCounts: AnalyticFractionCount[];
	shouldRun = true;
	newFilterSelected: any;
	// this variable will pass the new selected filter value to its children studies/cases/files table components
	newFilterValue: string;
	opened: boolean = true;
	selectedTab = 0;
	parentCharts:Subject<any> = new Subject();
	studyTotalRecords:number = 0;
	biospecimenTotalRecords:number = 0;
	clinicalTotalRecords:number = 0;
	fileTotalRecords:number=0;
	genesTotalRecords:number=0;
	newFilesFilterValue: string;
	filesFilterEnabled:boolean = false;
	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	gene_study_name:string;
	// values of gene_study_name filter
	gene_study_names: string;
	breadcrumbs = [];
	public filtersChangedInBreadcrumbBar: Object;
	downloadAllManifests:any; 
	handleTableLoading:any
	otherTabsLoaded:any;
	parentLoader = false;
	controlFileDownloadSpinner = false;
	enableDownloadAllManifests:any;

	@ViewChild('sidenav') myNav: MatSidenav;
	constructor(private apollo: Apollo, private browseService: BrowseService, 
		private route: ActivatedRoute,
		private router: Router) {
		this.newFilterSelected = { 'program_name' : '', 'project_name': '', 'study_name': '',
		'disease_type':'', 'primary_site':'', 'analytical_fraction':'', 'experiment_type':'', 
		'acquisition_type':'','ethnicity': '', 'race': '', 'gender': '', 'tumor_grade': '', 
		'data_category':'', 'file_type':'', 'access':'', 'downloadable': '', 'biospecimen_status': '', 'case_status': ''};
		this.analyticalFractionsCounts = [];
		this.route.params.subscribe(params => this.browseStudy(params));
	}
	
	/* This function creates empty pie chart */
	createPieChart(): any {
		return new Chart({
		chart: {
			type: 'pie',
			height: '68%'
		},
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		plotOptions: {
			pie: {
			allowPointSelect: true,
			cursor: 'pointer',
			point: {
				events: {
					click: event => {
						this.parentCharts.next('disease type:'+event['point']['name']);
						return true;
					}
				}
			},
			dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>:<br> {point.percentage:.1f} %',
					style: {
						fontFamily:'Lato',
						fontSize: '10px',
						color: '#585858'
					}
			},
			innerSize: '50%',
			colors: ['#FF9F31', '#FFD03C', '#407185', '#588897',
					'#7BA2AF', '#F9EB36', '#65A5C8', '#67C4E2', '#71E2E8',  '#72E0C0',
					'#91F7AB', '#A1F5F2', '#C3F968'  ]
				},
		},
		series: [{
			name: 'Case count',
			data: []
			}]
		});
	}
	/* This function creates empty bar chart */
	createBarChart(yAxisLable: string, chartName: string): any {
		return new Chart({
		chart: {
			type: 'bar',
			height: '68%'
		},
		colors: [  '#5888A5'],
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false,
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			title: {
				text: yAxisLable,
			}
		},
		plotOptions: {
			series: {
				cursor: 'pointer',
				point: {
					events: {
						click: event => {
							this.parentCharts.next(chartName+':'+event['point']['name']);
							return true;
						}
					}
				}
			}
		},
		series: [{
			name: 'Case count',
			data: []
			}]
		});
		
	}
	/* API call to get disease types data for the pie chart */
	// @@@PDC-221 - new API for disease counts
getDiseasesData() {
	this.browseService.getDiseases().subscribe((data: any) => {
		this.diseasesData = data.uiExperimentPie;
		this.diseaseTypesChart = this.createPieChart();
		// Put disease types data into pie chart
		for (let idx = 0; idx < data.uiExperimentPie.length; idx ++){
			this.diseaseTypesChart.options.series[0].data.push({
				name: this.diseasesData[idx].disease_type,
				y: this.diseasesData[idx].cases_count});
		}
	});
}

/* Check if a specific diseases type is already an element in disease types array 
		Parameters: array, disease
		Return value: if the disease type element is found in the array 
						than return it's index in the array, otherwise return -1
	 */
private isDiseaseInArray(array, disease: string): number{
	for (let i = 0; i < array.length; i++){
		if (array[i].disease_type === disease ) {
			return i;
		}
	}
	return -1;
}

getCasesByAnalyticFraction() {
	this.browseService.getAnalyticFractionTypeCasesCount().subscribe((data: any) => {
		this.analyticalFractionsChart = this.createBarChart('Cases','analytical fractions');
		// initialize data in the chart
		this.analyticalFractionsChart.options.series[0].data.splice(0, this.analyticalFractionsChart.options.series[0].data.length);
		this.analyticalFractionsChart.options.xAxis.categories.splice(0, this.analyticalFractionsChart.options.xAxis.categories.length);
		for ( let idx = 0; idx < data.uiAnalyticalFractionsCount.length; idx++) {
			const j = this.isExperimentTypeInArray(this.analyticalFractionsCounts, data.uiAnalyticalFractionsCount[idx].analytical_fraction);
			if (j > -1) {
				this.analyticalFractionsCounts[j].count = data.uiAnalyticalFractionsCount[idx].cases_count;
			} else {
				this.analyticalFractionsCounts.push({
					analytical_fraction: data.uiAnalyticalFractionsCount[idx].analytical_fraction,
					count: data.uiAnalyticalFractionsCount[idx].cases_count});
			}
		}
		for (let idx = 0; idx < this.analyticalFractionsCounts.length; idx++) {
			// push data to bar chart
			this.analyticalFractionsChart.options.series[0].data.push({
				name: this.analyticalFractionsCounts[idx].analytical_fraction,
				y: this.analyticalFractionsCounts[idx].count});
			// push categories to bar chart
			this.analyticalFractionsChart.options.xAxis.categories.push(
				this.analyticalFractionsCounts[idx].analytical_fraction);
		}
	
	});
}
/* API call to get all experiment types for the bar chart */
// @@@PDC-221 - new API for experiment types counts
getCasesByExperimentalStrategy(){
	this.browseService.getExperimentTypeCasesCount().subscribe((data: any) => {
		this.expCountChart = this.createBarChart('Cases','experiment types');
		// this.analyticalFractionsChart = this.createBarChart('Ca');
			
			//initialize data in the chart
			this.expCountChart.options.series[0].data.splice(0, this.expCountChart.options.series[0].data.length);
			this.expCountChart.options.xAxis.categories.splice(0, this.expCountChart.options.xAxis.categories.length);
	// map data.uiExperimentBar to this.expTypesCounts variable of type ExperimentTypeCount
			for (let idx = 0; idx < data.uiExperimentBar.length; idx++) {
				let j = this.isExperimentTypeInArray(this.expTypesCounts, data.uiExperimentBar[idx].experiment_type);
				if (j > -1){
					this.expTypesCounts[j].count = data.uiExperimentBar[idx].cases_count;
				} else {
					this.expTypesCounts.push({experiment_type: data.uiExperimentBar[idx].experiment_type, count: data.uiExperimentBar[idx].cases_count});
				}
			}
			for(let idx = 0; idx < this.expTypesCounts.length; idx++) {
					//push data to bar chart
					this.expCountChart.options.series[0].data.push({name:this.expTypesCounts[idx].experiment_type,
															y:this.expTypesCounts[idx].count})
					//push categories to bar chart
					this.expCountChart.options.xAxis.categories.push(this.expTypesCounts[idx].experiment_type);
				}
		});
	}
	  /* Check if a specific experiment type is already an element in experiment types array 
		Parameters: array, experiment_type
		Return value: if the experiment type element is found in the array 
						than return it's index in the array, otherwise return -1
	 */
	private isExperimentTypeInArray(array, exp_type: string): number {
		for (let i = 0; i < array.length; i++) {
			if (array[i].experiment_type === exp_type ) {
				return i;
			}
		}
		return -1;
	}
	private isInArray(array, analytic_fraction: string): number {
		const labels = array.map(aFraction => aFraction.analytical_fraction);
		console.log(labels);
		return labels.indexOf(analytic_fraction);

	}

	//@@@PDC-522 handle files filters
	onFilesFiltersSelected(filterValue: string){
		this.newFilesFilterValue=filterValue;
	}

	// @@@PDC-221 - Added filtering for the charts on the browse page
	// @@@PDC-616 Add acquisition type to the general filters
	onFilterSelected(filterValue: string) {
		filterValue = filterValue.replace('_slash','/');
		var filter_field = filterValue.split(':'); // the structure is field_name: "value1;value2"
		if (filter_field[0] == "gene_study_name") {
			//if the filter field is gene_study_name, do not pass it to other tabs.
			this.gene_study_name = filterValue;
		} else {
			this.newFilterValue = filterValue;
			this.gene_study_name = '';
		}
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
			let deleteFromBreadCrumbs = ['ethnicity', 'race', 'gender', 'tumor_grade', 'case_status'];
			//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
			// Delete the clinical filters from breadcrumbs 
			// when user clicks on "Clears all clinical filters" button
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
		}
		else if (filter_field[0] === "Clear all general filters selections"){
			//console.log(this.newFilterSelected);
			this.newFilterSelected["program_name"] = "";
			this.newFilterSelected["project_name"] = "";
			this.newFilterSelected["study_name"] = "";
			this.newFilterSelected["disease_type"] = "";
			this.newFilterSelected["primary_site"] = "";
			this.newFilterSelected["analytical_fraction"] = "";
			this.newFilterSelected["experiment_type"] = "";
			this.newFilterSelected["acquisition_type"] = "";
			let deleteFromBreadCrumbs = ['program_name', 'project_name', 'study_name', 'disease_type', 'primary_site', 'analytical_fraction', 'experiment_type', 'acquisition_type'];
			//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
			// Delete the general filters from breadcrumbs 
			// when user clicks on "Clears all general filters" button
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
		} else if (filter_field[0] === "Clear all biospecimen filters selections"){
			let deleteFromBreadCrumbs = ['sample_type', 'study_name', 'biospecimen_status'];
			//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
		} else if (filter_field[0] === "Clear all file filters selections"){
			let deleteFromBreadCrumbs = ['data_category', 'study_name', 'file_type', 'access', 'downloadable'];
			//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
		} else {
			if (filter_field[0] != "selectedTab") {
				this.newFilterSelected[filter_field[0]] = filter_field[1];
			}
		}
		//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
		if (filter_field[0] != "selectedTab") {
			this.populateBreadcrumbsForFilters();
		}
		this.enableDownloadAllManifests =  this.breadcrumbs.length;
		// Update the analytic fractions bar chart
		this.browseService.getFilteredAnalyticFractionTypeCasesCount(this.newFilterSelected).subscribe((data: any) => {
			this.analyticalFractionsChart = this.createBarChart('Cases','analytical fractions');
			// initialize data in the chart
			this.analyticalFractionsChart.options.series[0].data.splice(0, this.analyticalFractionsChart.options.series[0].data.length);
			this.analyticalFractionsChart.options.xAxis.categories.splice(0, this.analyticalFractionsChart.options.xAxis.categories.length);
			console.log(this.analyticalFractionsCounts);
			console.log(data);
			// map data.uiExperimentBar to this.expTypesCounts variable of type ExperimentTypeCount
			for ( let idx = 0; idx < this.analyticalFractionsCounts.length; idx++) {
				let j = this.isInArray(data.uiAnalyticalFractionsCount, this.analyticalFractionsCounts[idx].analytical_fraction);
				if (j !== -1) {
					this.analyticalFractionsCounts[idx].count = data.uiAnalyticalFractionsCount[j].cases_count;
				} else {
					this.analyticalFractionsCounts[idx].count = 0;
				}
			}
			for (let idx = 0; idx < this.analyticalFractionsCounts.length; idx++) {
				// push data to bar chart
				this.analyticalFractionsChart.options.series[0].data.push({
					name: this.analyticalFractionsCounts[idx].analytical_fraction,
					y: this.analyticalFractionsCounts[idx].count});
				// push categories to bar chart
				this.analyticalFractionsChart.options.xAxis.categories.push(
					this.analyticalFractionsCounts[idx].analytical_fraction);
			}
			});
		// Update experiment types bar chart
		this.browseService.getFilteredExperimentTypeCasesCount(this.newFilterSelected).subscribe((data: any) => {
			this.expCountChart = this.createBarChart('Cases','experiment types');
			// initialize data in the chart
			this.expCountChart.options.series[0].data.splice(0, this.expCountChart.options.series[0].data.length);
			this.expCountChart.options.xAxis.categories.splice(0, this.expCountChart.options.xAxis.categories.length);
			// map data.uiExperimentBar to this.expTypesCounts variable of type ExperimentTypeCount
			for (let idx = 0; idx < this.expTypesCounts.length; idx++) {
				let j = this.isExperimentTypeInArray(data.uiExperimentBar, this.expTypesCounts[idx].experiment_type);
				if (j > -1) {
					this.expTypesCounts[idx].count = data.uiExperimentBar[j].cases_count;
				} else {
					this.expTypesCounts[idx].count = 0;
				}
			}
			for (let idx = 0; idx < this.expTypesCounts.length; idx++) {
				// push data to bar chart
				this.expCountChart.options.series[0].data.push({name: this.expTypesCounts[idx].experiment_type,
																	y: this.expTypesCounts[idx].count})
				// push categories to bar chart
				this.expCountChart.options.xAxis.categories.push(this.expTypesCounts[idx].experiment_type);
			}
		});
		// Update disease types pie chart
		this.browseService.getFilteredDiseases(this.newFilterSelected).subscribe((data: any) => {
			this.diseasesData = data.uiExperimentPie;
			this.diseaseTypesChart = this.createPieChart();
			// Put disease types data into pie chart
			for (let idx = 0; idx < data.uiExperimentPie.length; idx ++) {
				this.diseaseTypesChart.options.series[0].data.push({ name: this.diseasesData[idx].disease_type,
																		y: this.diseasesData[idx].cases_count});
			}
		});
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	//Check if an element in present in this.breadCrumbs and return its index
	containsBreadCrumbs(facetName) {
		var isPresent = -1;
		for (var i=0; i <this.breadcrumbs.length; i++) {
			if (this.breadcrumbs[i].type === 'facetName' && this.breadcrumbs[i].value === facetName) {
				isPresent = i;
				break;
			}
		}
		return isPresent;
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	//Populate the breadcrumb bar
	populateBreadcrumbsForFilters() {
		if (this.gene_study_name && this.gene_study_name != "") {
			var filter_field = this.gene_study_name.split(':');
			this.gene_study_names = filter_field[1];
		} else {
			var filter_field = this.newFilterValue.split(':');
		}
		var displayStudynameForGeneName = false;
		if (filter_field[0] == "Clear all selections") {
			this.breadcrumbs = [];
		} else if (filter_field[0] == "Clear all genes filters selections") {
			const isPresent = this.containsBreadCrumbs("gene_name");
			if( isPresent != -1) {
				this.breadcrumbs.splice(isPresent, 1);
			}
		} else {
			const isPresent = this.containsBreadCrumbs(filter_field[0]);
			if( isPresent != -1) {
				if (filter_field[0] == "study_name" && this.gene_study_names && this.gene_study_names != "" && this.gene_study_names == filter_field[1]) {
					// do nothing
				} else {
					this.breadcrumbs.splice(isPresent, 1);
				}
			}
			// special case for gene_name filter
			if (filter_field[0] == "study_name") {
				if (this.gene_study_names && this.gene_study_names != "" && this.gene_study_names == filter_field[1]) {
				// do not display study_name filter along with gene name.
					displayStudynameForGeneName = true;
					this.gene_study_names = "";
				}
			}
			if (filter_field[0] != "gene_study_name" && !displayStudynameForGeneName && filter_field.length > 1 && filter_field[1] != "") {
				const facetValues = filter_field[1].split(';');
				const facetValuesArray = [];
				if (facetValues.length > 0){
					facetValues.forEach(facetValue => {
						facetValuesArray.push({
							'type': 'facetValue',
							'value': facetValue,
							'filter': filter_field[0] + ':' + facetValue,
							'totalValues': filter_field[1]
						});	
					});
				}
				this.breadcrumbs.push({
					'type': 'facetName',
					'value': filter_field[0],
					'filter': this.newFilterValue,
					'separator': facetValuesArray.length > 1 ? 'IN' : 'IS',
					'facetValues': facetValuesArray,
				});
			}
			//console.log(this.breadcrumbs);
		}
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
	deleteBreadcrumb(event, filterToBeDeleted = []) {
		if (event != '') {
			this.filtersChangedInBreadcrumbBar = event.value + ":";
		} else if (filterToBeDeleted.length > 0) {
			for (var i=0; i < filterToBeDeleted.length; i++) {
				// Delete the required filter from breadcrumbs
				const isPresent = this.containsBreadCrumbs(filterToBeDeleted[i]);
				if( isPresent != -1) {
					this.breadcrumbs.splice(isPresent, 1);
				}
			}
		}
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	deleteBreadcrumbVal(event) {
		var labelItem = event.filter;
		var allFiltervalues = event.totalValues.split(";");
		var filterval = event.value;
		var index = allFiltervalues.indexOf(filterval);
		if (index !== -1) {
			allFiltervalues.splice(index, 1);
		}
		var remainingFilter = allFiltervalues.join(";");
		var labelVal = labelItem.split(':');
		var modifiedfilterval = labelVal[0] + ":" + remainingFilter;
		modifiedfilterval = this.replaceAll(modifiedfilterval, ";", "|");
		this.filtersChangedInBreadcrumbBar = modifiedfilterval;
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	clearAllSelections() {
		this.filtersChangedInBreadcrumbBar = new String("Clear all selections");
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	replaceAll(str,replaceWhat,replaceTo){
		replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		var re = new RegExp(replaceWhat, 'g');
		return str.replace(re,replaceTo);
	}

	// This function is used to navigate to a specific study 
	// when the user gets to this page from a different route
	browseStudy(params: any) {
		console.log('Switching tabs');
		console.log(params);
		if ( params.tab === 'genes') {
			this.selectedTab = 4;
		}else if ( params.tab === 'clinical') {
			this.selectedTab = 3;
		} else if ( params.tab === 'files') {
			this.selectedTab = 2;
		} else if ( params.tab === 'cases') {
			this.selectedTab = 1;
		} else {
			this.selectedTab = 0;
		}
	}
	//handle browse page 4 tables total count change action triggered by filters applied
	totalRecordChanged(totalRecord:TableTotalRecordCount){
		let type = totalRecord.type;
		let totalRecords = totalRecord.totalRecords
		switch (type){
			case 'study':
				this.studyTotalRecords = totalRecords;
				break;
			case 'biospecimen':
				this.biospecimenTotalRecords = totalRecords;
				break;
			case 'clinical':
				this.clinicalTotalRecords = totalRecords;
				break;
			case 'file':
				this.fileTotalRecords = totalRecords;
				break;
			case 'genes':
				this.genesTotalRecords = totalRecords;
				break;
		}
	}

	downloadWholeManifest(event:any) {
		this.downloadAllManifests = event['downloadAllManifest'] + new Date().toLocaleString();
	}

	handleTabLoading(event:any) {
		var loadingFlag;
		if (event['isTableLoading']) {
			 loadingFlag = event['isTableLoading'];
		} else if (event['isFileTableLoading']) {
			loadingFlag = event['isFileTableLoading'];
		}
		//Handling event: isTableLoading
		if (loadingFlag) {
			let loadingVal = loadingFlag.split(':');
			if (loadingVal[0] == "fenceRequestcontrolFiles") {
				if (loadingVal[1] == "true") {
					this.controlFileDownloadSpinner = true;
				} else if (loadingVal[1] == "false") {
					this.controlFileDownloadSpinner = false;
				}
			} else {
				this.controlFileDownloadSpinner = false;
				if (loadingVal[1] == "true") {
					let tableLoadingSession = Number(sessionStorage.getItem('tableLoading'));
					if (!tableLoadingSession) {
						sessionStorage.setItem('tableLoading', (1).toString());
						// Send unloading event to all tabs if the download of files for
						// study, case, clinical, gene tabs has begun.
						if (event['isTableLoading']) {
							this.handleTableLoading = event['isTableLoading'];
						}
						if (event['isFileTableLoading']) {
							this.handleTableLoading = event['isFileTableLoading'];
						}
					} else if (tableLoadingSession >= 1) {
						let loadingCount = tableLoadingSession + 1;
						sessionStorage.setItem('tableLoading', loadingCount.toString());
					}
				}
				if (loadingVal[1] == "false") {
					let tabUnloadingSession = Number(sessionStorage.getItem('tableUnloading'));
					if (!tabUnloadingSession) {
						sessionStorage.setItem('tableUnloading', (1).toString());
					} else if (tabUnloadingSession >= 1) {
						let unloadingCount = tabUnloadingSession + 1;
						sessionStorage.setItem('tableUnloading', unloadingCount.toString());
					}
					// Send unloading event to all tabs if study, case, clinical, 
					// gene tabs files are downloaded.
					if ((event['isTableLoading'] && Number(sessionStorage.getItem('tableUnloading')) == 4) ||
						(event['isFileTableLoading'] && loadingVal[0] == "controlFiles" && Number(sessionStorage.getItem('tableUnloading')) == 1) ||
						(event['isFileTableLoading'] && Number(sessionStorage.getItem('tableUnloading')) == 2)) {
						if (event['isTableLoading']) {
							this.handleTableLoading = event['isTableLoading'];
						}
						if (event['isFileTableLoading']) {
							this.handleTableLoading = event['isFileTableLoading'];
						}
						sessionStorage.removeItem('tableLoading');
						sessionStorage.removeItem('tableUnloading');
						if (event['isTableLoading']) {
							this.otherTabsLoaded =  new Date().toLocaleString();
						}
					}
				} 
			}
		}
	}

	//PDC-522 show/hide files filter based on tab selection
	//PDC-569 show apropriate filter tab on table tab selection
	selectedTabChange(event:any){
		/*if(event['index'] === 3){
			this.filesFilterEnabled = true;
		}else{
			this.filesFilterEnabled = false;
		}*/
		switch(event['index']) {
			case 0: { //General tab
				this.selectedTab = 0;
				break;
			}
			case 1: { //Biospecimen tab
				this.selectedTab = 1;
				break;
			}
			case 2: { //Clinical tab
				this.selectedTab = 2;
				break;
			}
			case 3: { //Files tab
				this.selectedTab = 3;
				break;
			}
			case 4: { //Genes tab
				this.selectedTab = 4;
				break;
			}
			default: { //General tab
				this.selectedTab = 0;
				break;
			}
		}
	}

	changeTabForCaseCount(valuesForCaseCount) {	
		this.selectedTab = valuesForCaseCount.tabVal;
		this.browseService.notifyChangeTabEvents({studyNameForCaseCount: valuesForCaseCount.studyName});
	}

	changeTabForFileType(valuesForFileType) {	
		this.selectedTab = valuesForFileType.tabVal;
		this.browseService.notifyChangeTabEvents({studyNameForFileType: valuesForFileType.studyName, fileDetailsforFileType: valuesForFileType.fileType, fileDetailsforDataCategory: valuesForFileType.dataCategory});
	}

	ngOnInit() {
	// this.diseaseTypesChart = this.createPieChart();
	// this.onFilterSelected('');
	this.getDiseasesData();
	this.expCountChart = this.createBarChart('Cases','experiment types');
	this.analyticalFractionsChart = this.createBarChart('Cases', 'analytical fractions');
	this.getCasesByExperimentalStrategy();
	this.getCasesByAnalyticFraction();
	}
}
