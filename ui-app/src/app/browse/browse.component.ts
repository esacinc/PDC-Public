import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap } from 'rxjs/operators';
import gql from 'graphql-tag';
import {AnalyticFractionCount} from '../types';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import {  QueryDiseases, Disease, ExperimentTypeCount, Filter } from '../types';

import { BrowseService } from './browse.service';
import { MatSidenav } from '@angular/material/sidenav';

import {TableTotalRecordCount} from '../types';
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs';
import * as d3 from 'd3';
import { take } from 'rxjs/operators';

declare var window: any;

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
//@@@PDC-1360 Ability to bookmark a query
//@@@PDC-1445: Style query bookmark popup
//@@@PDC-1782: filter url for bookmarking continues to hold gene names even after that filter is cleared
//@@@PDC-3328 hide filters, charts, and all data tabs except for Files when showing files for older study version
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
	bookmarkURL: string = "";
	baseUrl: string = "";
	showBookmarkFlag = false;
	disablePanelsFlag = false;
	captureTabChange = "";

	@ViewChild('sidenav') myNav: MatSidenav;

	analyticalFractionschartDataArr;
	experimentStrategyChartDataArr;
	analyticalFractionTypes;
	experimentTypes;

	constructor(private apollo: Apollo, private browseService: BrowseService, 
		private route: ActivatedRoute,
		private router: Router,
		private loc: Location) {
		this.newFilterSelected = { 'program_name' : '', 'project_name': '', 'study_name': '',
		'disease_type':'', 'primary_site':'', 'analytical_fraction':'', 'experiment_type':'', 
		'acquisition_type':'','ethnicity': '', 'race': '', 'gender': '', 'tumor_grade': '', 
		'data_category':'', 'file_type':'', 'access':'', 'downloadable': '', 'biospecimen_status': '', 'case_status': '',
		'gene_name': '', 'gene_study_name': ''};
		this.analyticalFractionsCounts = [];
		//PDC-1360 Add Bookmark URLs
		const parsedUrl = new URL(window.location.href);
		this.baseUrl = parsedUrl.origin + "/pdc";
		console.log(this.baseUrl);
		this.bookmarkURL = this.baseUrl + this.loc.path() + "/filters/";
		this.route.params.subscribe(params => this.browseStudy(params));
	}

	/* API call to get disease types data for the pie chart */
	// @@@PDC-221 - new API for disease counts
getDiseasesData() {
	this.browseService.getDiseases().pipe(take(1)).subscribe((data: any) => {
		this.diseasesData = data.uiExperimentPie;
		//@@@PDC-7596: Duplicate D3 Charts occur on the UI when Case URL is pasted in a new tab
		d3.select("#diseaseTypes").remove();
		this.createD3PieChart(data.uiExperimentPie);
	});
}

//@@@PDC-7344: Replace highcharts with D3 in PDC chart implementation - Pie chart
createD3PieChart(data) {
	var that = this;
	var chartId;
	var svg;
	var margin = 50;
	var width = 375;
	var height = 225;
	var radius = Math.min(width, height) / 2 - margin;
	const total = data.reduce((prev, next) => prev + next.cases_count, 0);
	for (var i in data) {
		let casesCount = data[i]['cases_count'];
		let pcent = (casesCount/total)*100;
		pcent = Number(pcent.toFixed(1));
		data[i]['cases_count_pcent'] = pcent;
	}
	data = data.sort((a,b) => a.cases_count_pcent - b.cases_count_pcent);
	data.reverse();
	var chartID = '#diseaseTypesChart';
	var tooltip = d3
	.select(chartID)
	.append('div')
	.style('white-space', 'nowrap')
	.style('position', 'absolute')
	.style('class', 'charts-tooltip')
	.style('opacity', 0)
	.style('background-color', 'white')
	.style('font-size', '12px')
	.style('padding', '5px')
	.style('color', 'black')
	.style('box-shadow', '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)')
	.style('border-radius', '5px')
	.style('border', '1px solid rgba(40, 40, 40)')
	.style('pointer-events', 'none');

	var colors = d3
	.scaleOrdinal()
	.domain(data.map(d => d.cases_count_pcent.toString()))
	.range([
		'#FF9F31', '#FFD03C', '#407185', '#588897',
		'#7BA2AF', '#FFD03C', '#407185', '#67C4E2', '#71E2E8',  '#72E0C0',
		'#91F7AB', '#FF9F31', '#088F8F'
	]);
	svg =  d3
	.select(chartID)
	.append("svg")
	.attr("id", 'diseaseTypes')
	.attr('preserveAspectRatio','xMinYMin')
	.attr("viewBox", `0 0 ${width} ${height}`)
	.append("g")
	.attr(
		"transform",
		"translate(" + width / 2 + "," + height / 2 + ")"
	);
	// Compute the position of each group on the pie
	const pieChart = d3.pie<any>().value((d: any) => Number(d.cases_count_pcent));
	const data_ready = pieChart(data);
	//Define radius
	var cRadius = 3;  
	var iRadius = radius * 0.25;
	var oRadius = radius * 0.75;
	//Create an arc function   
	var arc = d3
	.arc()
	.innerRadius(iRadius) // This is the size of the donut hole
	.outerRadius(oRadius); 

	//Turn the pie chart 90 degrees counter clockwise, so it starts at the left	
/* 	var pie = d3.pie()
		.startAngle(-90 * Math.PI/180)
		.endAngle(-90 * Math.PI/180 + 2*Math.PI)
		.value(function(d) { return d.cases_count_pcent; })
		.padAngle(.01)
		.sort(null); */

	//Draw the arcs
	svg.selectAll(".donutArcs")
	.data(data_ready)
	.enter().append("path")
	.attr("class", "donutArcs")
	.attr("id", d => `donutArc-${d.data.disease_type}`)
	.attr("d", arc)
	.attr("fill", (d, i) => (d.data.color ? d.data.color : colors(i)))
	.attr("stroke", "white")
	.style("stroke-width", "2px")
	.style("opacity", 1)
	.style('cursor', 'pointer')
	.attr('onload', function (d,i) {
		tooltip.style('opacity', 0);
	})
	.on('mouseover', function (i, d) { 
		var offsetTop= 300;
		var offsetRight = 0;
		// display tooltip
		tooltip.style('opacity', 0);
		tooltip.style('opacity', 1);
		tooltip.html(`${d.data.disease_type}<br><span style="color:${colors(i)}">●</span>&nbsp;Case count: <span>${d.data.cases_count}</span>`)
		.style('top', `${i['pageY'] - offsetTop}px`)
		.style('right', `${offsetRight}px`)
		.style('transform', 'translateX(-50%)')
		.style('transform', 'translateX(-50%)');
		//Reduce opacity of arcs
		var elements = document.getElementsByClassName('donutArcs');
		for (var j = 0; j < elements.length; j++) {
			if (elements[j].id != `donutArc-${d.data.disease_type}`) {
				elements[j]["style"].opacity = '0.3';
			}
		}
		//Reduce opacity of polylines
		var elements = document.getElementsByClassName('polyLines');
		for (var k = 0; k < elements.length; k++) {
			if (elements[k].id != `polyLine-${d.data.disease_type}`) {
				elements[k]["style"].opacity = '0.3';
			}
		}
	})
	.on('mouseout', function (i, d) {  
		tooltip.style('opacity', 0);
		d3.select(".charts-tooltip").remove();
		//Set opacity back to normal
		var elements = document.getElementsByClassName('donutArcs');
		for (var j = 0; j < elements.length; j++) {
			if (elements[j].id != `donutArc-${d.data.disease_type}`) {
				elements[j]["style"].opacity = '1';
			}
		}
		//Set opacity back to normal
		var elements = document.getElementsByClassName('polyLines');
		for (var k = 0; k < elements.length; k++) {
			if (elements[k].id != `polyLine-${d.data.disease_type}`) {
				elements[k]["style"].opacity = '1';
			}
		}
	})
	.on('click', (i, d) => {  
		tooltip.style('opacity', 0);
		this.parentCharts.next('disease type:'+d.data.disease_type);
   	});

	svg
	.selectAll('allPolylines')
	.data(data_ready)
	.enter()
	.append('polyline')
	.attr("class", "polyLines")
	.attr("id", d => `polyLine-${d.data.disease_type}`)
	//.attr('x', 4)
    //.attr('y', 5)
	//.attr("stroke", "black")
	.attr("stroke", (d, i) => (d.data.color ? d.data.color : colors(i)))
	.style("fill", "none")
	.attr("stroke-width", 1)
	.attr('points', function(d, i) {
		if (d.data.cases_count_pcent > 4) {
			var myArcMaker= d3.arc().outerRadius(oRadius).innerRadius(iRadius).cornerRadius(cRadius);
			var bigArcMaker=  d3.arc().outerRadius(95).innerRadius(oRadius).cornerRadius(cRadius);
			var p = "";
      		p += myArcMaker.centroid(d)[0] + ',' + myArcMaker.centroid(d)[1] + ',' + bigArcMaker.centroid(d)[0] + ',' + bigArcMaker.centroid(d)[1];
      		return p;
		}
	})

	// Add the polylines between chart and labels:
	svg
	.selectAll('allLabels')
	.data(data_ready)
	.enter()
	.append('text')
	.attr('dy', function (d,i) {
		//For future reference
		if ((i % 2) == 0) {
			//return 2;
		} else {
			//return 10;
		}
	})
	.text( function(d) { 
		if (d.data.cases_count_pcent > 4) {
			let displayLabel = that.trimText(d.data.disease_type, 15) + ': ' + d.data.cases_count_pcent + '%'
			//return displayLabel;
			return d.data.disease_type + ': ' + d.data.cases_count_pcent + '%';
		}
	}) 
	.call(that.lineBreak, 30)
	.attr('transform', function(d, i) {
		if (d.data.cases_count_pcent > 4) {
			var bigArcMaker = d3.arc().outerRadius(96).innerRadius(oRadius).cornerRadius(cRadius);
			var pos = "";
			//@@@PDC-7508: Improvements to the D3 charts
			// Add padding to avoid overlapping of text near the mid arc of donut chart
			if (d.startAngle < 3.0  && d.endAngle > 3.0) {
				pos += bigArcMaker.centroid(d)[0] + ',' + (bigArcMaker.centroid(d)[1] + 10);
			} else {
				pos += bigArcMaker.centroid(d)[0] + ',' + (bigArcMaker.centroid(d)[1]);
			}
			return 'translate(' + pos + ')';
		}
	})
	.style("color", "#585858")
	.style("fill", "#585858")
	.style("font-family", '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif')
	.style('text-anchor', function(d) {
		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
		return (midangle < Math.PI ? 'start' : 'end')
	});
	
}

//@@@PDC-7508: Improvements to the D3 charts
lineBreak(text, width) {
	text.each(function () {
		var el = d3.select(this);
		let words = el.text().split(' ');
		let wordsFormatted = [];

		let string = '';
		for (let i = 0; i < words.length; i++) {
			if (words[i].length + string.length <= width) {
			string = string + words[i] + ' ';
			}
			else {
			wordsFormatted.push(string);
			string = words[i] + ' ';
			}
		}
		wordsFormatted.push(string);

		el.text('');
		for (var i = 0; i < wordsFormatted.length; i++) {
			var tspan = el.append('tspan').text(wordsFormatted[i]);
			if (i > 0)
			tspan.attr('x', 0).attr('dy', '8');
		}
	});
}

//@@@PDC-7344: Replace highcharts with D3 in PDC chart implementation - Pie chart
trimText(text, threshold) {
    if (text.length <= threshold) return text;
    return text.substr(0, threshold).concat("...");
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
	this.browseService.getAnalyticFractionTypeCasesCount().pipe(take(1)).subscribe((analyticalFractionsData: any) => {
		this.analyticalFractionschartDataArr = analyticalFractionsData.uiAnalyticalFractionsCount;
		if ( this.analyticalFractionschartDataArr.length > 0) {
			this.analyticalFractionTypes = this.analyticalFractionschartDataArr.map(a => a.analytical_fraction);
		}
		//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
		var dataJSON = {
			chartName: "analytical fractions",
			chartDataArr: this.analyticalFractionschartDataArr,
			chartID : "analyticalFractions",
			chartIDValue : "#analyticalFractionChart",
			caseCountKey : "cases_count",
			filterKey : "analytical_fraction",
			offsetLeft: 200,
			offsetTop: 300,
			offsetRight: 0
		}
		//@@@PDC-7596: Duplicate D3 Charts occur on the UI when Case URL is pasted in a new tab
		d3.select("#analyticalFractions").remove();
		this.createD3BarChart(dataJSON);
	});
}


//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
createD3BarChart(dataJSON) {
	var chartName = dataJSON["chartName"];
	var chartDataArr = dataJSON["chartDataArr"];
	var chartID = dataJSON["chartID"];
	var chartIDValue = dataJSON["chartIDValue"];
	var caseCountKey = dataJSON["caseCountKey"];
	var filterKey = dataJSON["filterKey"];
	var offsetLeft = dataJSON["offsetLeft"];
	var offsetTop = dataJSON["offsetTop"];
	var offsetRight = dataJSON["offsetRight"];	

	let highestCurrentValue = 0;
	var highestValue;
    var svg;
    var margin = 100;
    var width = 750 - margin * 2;
    var height = 600 - margin * 2;
	let tableLength = chartDataArr.length;

	//define tooltip
	var tooltip = d3
	.select(chartIDValue)
	.append('div')
	.style('white-space', 'nowrap')
	.style('position', 'absolute')
	.style('class', 'charts-tooltip')
	//.style('opacity', 0)
	.style('background-color', 'white')
	.style('font-size', '12px')
	.style('padding', '5px')
	.style('color', 'black')
	.style('box-shadow', '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)')
	.style('border-radius', '5px')
	.style('border', '1px solid rgba(40, 40, 40)')
	.style('pointer-events', 'none');

	chartDataArr.forEach((data, i) => {
	  const barValue = Number(data[caseCountKey]);
	  if (barValue > highestCurrentValue) {
		highestCurrentValue = barValue;
	  }
	  if (tableLength == i + 1) {
		highestValue = highestCurrentValue.toString();
	  }
	});

	//Creating SVG for the chart
	svg = d3
	  .select(chartIDValue)
	  .append("svg")
	  .attr(
		"viewBox",
		`-105 30 ${width + margin * 2} ${height + margin * 2}`
	  )
	  .attr("id", chartID)
	  .append("g")
	  .attr("transform", "translate(" + margin + "," + margin + ")");


	let rangeValue = 50;
	if (chartID == 'analyticalFractions') {
		rangeValue =  500;
	}

	// Create X-axis band scale
	var x = d3
	.scaleLinear()
	.range([0, width])
	.domain([0, Number(highestValue)]);
	   
    var data = chartDataArr;
	var xaxisID = chartID + '-xaxis';
	var yaxisID = chartID + '-yaxis';

    //Drawing X-axis on the DOM
     svg
	   .append("g")
	   .attr("transform", "translate(0," + height + ")")
	   .style('class', 'xaxis')
		.attr("id", xaxisID)
	   .classed('tick', true)
	   .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('d')))
	   .selectAll("text")
	   // .attr('transform', 'translate(-10, 0)rotate(-45)')
	   // .style('text-anchor', 'end')
	   .style("font-size", "24px")
	   .style("padding", "0.2"); 
   
	//Creaate Y-axis band scale
	const y = d3
	.scaleBand()
	.range([0, height])
	.domain(data.map(d => d[filterKey]))
	.padding(0.2);
   
   svg
	   .append("g")
	   .attr("id", yaxisID)
	   .call(d3.axisLeft(y))
	   .selectAll("text");

   //@@@PDC-7508: Improvements to the D3 charts
   svg.append("text")
    .attr("class", "casesLabel")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + 75)
    .text("Cases");


  let xaxis_ticks = d3.selectAll(`${chartIDValue} #${xaxisID} .tick>text`)
	.nodes()
	.map(function(t) {
		var response = JSON.stringify(t);
		let res = response.split(":");
		let tickVal  = Number(res[1].replace("}", ""));
		return tickVal;
		//return t.innerHTML;
	})
 
	// Vertical lines
  	for (let i = 0; i <= xaxis_ticks.length; i++) {
		svg
		.append('line')
		.attr('stroke', `#e6e6e6`)
		.attr('stroke-width', `2`)
		.attr('stroke-dasharray', 'none')
		.attr('data-z-index', '1')
		.attr('x1', (x(xaxis_ticks[i])))
		.attr('x2', (x(xaxis_ticks[i])))
		.attr('y1', 0)
		.attr('y2', height);
	} 

	//@@@PDC-7508: Improvements to the D3 charts
	let barWidthDiff = 20;
	if (tableLength <= 5) barWidthDiff = 30;

   //Create horizontal bars
   svg.append("g")
	.attr("fill", "rgb(88, 136, 165)")
	.selectAll()
	.data(data)
	.join("rect")
	.attr("x", x(0))
	.attr("y", (d) => y(d[filterKey]))
	.attr("width", (d) => x(d[caseCountKey]) - x(0))
	.attr("height", y.bandwidth() - barWidthDiff) 
	.attr('cursor', 'pointer')
	.attr('title', (d) =>  d[filterKey])
	.attr("id", (d) =>  d[filterKey])
	.attr('class', d => `bar-${d[filterKey]}`)
	.attr('onload', function (d,i) {
		tooltip.style('opacity', 0);
	})
	.on('mouseover', function (i, d) { 
		tooltip.style('opacity', 0);
		tooltip.style("opacity", 1);
		// create a tooltip
		tooltip.html(`${d[filterKey]}<br><span style="color:rgb(88, 136, 165)">●</span>&nbsp;Case count: <span>${d[caseCountKey]}</span>`)
		.style('top', `${i['pageY'] - offsetTop}px`)
		.style('right', `${offsetRight}px`)
		.style('transform', 'translateX(-50%)')
		.style('transform', 'translateX(-50%)');
		if (chartIDValue == "analyticalFractionChart") {
			tooltip.style('left', `${i['pageX'] - offsetLeft}px`)
		}
		//@@@PDC-7508: Improvements to the D3 charts
		d3.select(`.bar-${d[filterKey]}`)
		.attr('fill', f => {
			return 'rgb(113, 161, 190)';
		});
		//d3.select(".charts-tooltip").remove();
	  })
	.on('mouseout', function (i, d) {  
		tooltip.style('opacity', 0);
		d3.select(".charts-tooltip").remove();
		//@@@PDC-7508: Improvements to the D3 charts
		d3.select(`.bar-${d[filterKey]}`)
  		.attr('fill', 'rgb(88, 136, 165)')
		})
	.on('click', (i, d) => {  
		tooltip.style('opacity', 0);
		this.parentCharts.next(chartName+':'+d[filterKey]);
	}); 
}

/* API call to get all experiment types for the bar chart */
// @@@PDC-221 - new API for experiment types counts
getCasesByExperimentalStrategy(){
	this.browseService.getExperimentTypeCasesCount().pipe(take(1)).subscribe((experimentalStrategyData: any) => {
		this.experimentStrategyChartDataArr = experimentalStrategyData.uiExperimentBar;
		if ( this.experimentStrategyChartDataArr.length > 0) {
			this.experimentTypes = this.experimentStrategyChartDataArr.map(a => a.experiment_type);
		}
		//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
		var dataJSON = {
			chartName: "experiment types",
			chartDataArr: this.experimentStrategyChartDataArr,
			chartID : "experimentalStrategy",
			chartIDValue : "#expCountChart",
			caseCountKey : "cases_count",
			filterKey : "experiment_type",
			offsetLeft: 0,
			offsetTop: 300,
			offsetRight: 50
		}
		//@@@PDC-7596: Duplicate D3 Charts occur on the UI when Case URL is pasted in a new tab
		d3.select("#experimentalStrategy").remove();
		this.createD3BarChart(dataJSON);
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
	    //@@@PDC-5428 fix study name truncation issue
	    var filter_field = [];
	    filter_field.push(filterValue.substring(0, filterValue.indexOf(":")));
	    filter_field.push(filterValue.substring(filterValue.indexOf(":")+1));
		//var filter_field = filterValue.split(':'); // the structure is field_name: "value1;value2"
		if (filter_field[0] == "gene_study_name") {
			//if the filter field is gene_study_name, do not pass it to other tabs.
			this.gene_study_name = filterValue;
		} else {
			this.newFilterValue = filterValue;
			this.gene_study_name = '';
		}
      //console.log("Raw Filter: "+ filterValue);
      //console.log("Filter Name: "+ filter_field[0]);
      //console.log("Filter Value: "+ filter_field[1]);
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
			this.newFilterSelected['sample_type'] = "";
			this.newFilterSelected['study_name'] = "";
			this.newFilterSelected['biospecimen_status'] = "";
		} else if (filter_field[0] === "Clear all file filters selections"){
			let deleteFromBreadCrumbs = ['data_category', 'study_name', 'file_type', 'access', 'downloadable'];
			//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
			this.newFilterSelected['data_category'] = "";
			this.newFilterSelected['study_name'] = "";
			this.newFilterSelected['file_type'] = "";
			this.newFilterSelected['access'] = "";
			this.newFilterSelected['downloadable'] = "";
		}else if (filter_field[0] === "Clear all genes filters selections"){
			let deleteFromBreadCrumbs = ['study_name', 'gene_name', 'gene_study_name'];
			this.deleteBreadcrumb('', deleteFromBreadCrumbs);
			this.newFilterSelected['study_name'] = "";
			this.newFilterSelected['gene_name'] = "";
			this.newFilterSelected['gene_study_name'] = "";
		} else {
			if (filter_field[0] != "selectedTab") {
				this.newFilterSelected[filter_field[0]] = filter_field[1];
			}
		}
		//PDC-1360 Add Bookmark URLs	
		//PDC-2901 replace / in filter with _slash
		if (this.router.url.indexOf("filters") > -1) {
			//@@@PDC-2520: Browse/Primary filters/ URL does not get updated on the copied link.
			this.bookmarkURL = this.baseUrl + "/browse/filters/";
		} else {
			this.bookmarkURL = this.baseUrl + this.loc.path() + "/filters/";
		}
		for (let filter_val in this.newFilterSelected){
			if (this.newFilterSelected[filter_val] != ""){
				this.bookmarkURL +=  filter_val + ":" + this.newFilterSelected[filter_val].replace(/;/g, "|").replace('/','_slash') + "&";
			}
			//console.log(filter_val);
		}
		this.bookmarkURL = this.bookmarkURL.slice(0, -1);
		//@@@PDC-3645: Query URLs include unescaped spaces
		this.bookmarkURL = encodeURI(this.bookmarkURL);
		//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
		if (filter_field[0] != "selectedTab") {
			this.populateBreadcrumbsForFilters();
		}
		this.enableDownloadAllManifests =  this.breadcrumbs.length;
		// Update the analytic fractions bar chart
		      
		//console.log("Filter Value of study name: "+ this.newFilterSelected['study_name']);

		this.browseService.getFilteredAnalyticFractionTypeCasesCount(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
			var chartDataArr = data.uiAnalyticalFractionsCount;
			if (chartDataArr.length > 0) {
				this.displayAllFractionsAndSort(this.analyticalFractionTypes, chartDataArr, 'analytical_fraction', 'cases_count');
			}
			d3.select("#analyticalFractions").remove();
			var dataJSON = {
				chartName: "analytical fractions",
				chartDataArr: chartDataArr,
				chartID : "analyticalFractions",
				chartIDValue : "#analyticalFractionChart",
				caseCountKey : "cases_count",
				filterKey : "analytical_fraction",
				offsetLeft: 200,
				offsetTop: 300,
				offsetRight: 0
			}
			this.createD3BarChart(dataJSON);
		});
		// Update experiment types bar chart
		this.browseService.getFilteredExperimentTypeCasesCount(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
			var chartDataArr = data.uiExperimentBar;
			if (chartDataArr.length > 0) {
				this.displayAllFractionsAndSort(this.experimentTypes, chartDataArr, 'experiment_type', 'cases_count');
			}
			d3.select("#experimentalStrategy").remove();
			var dataJSON = {
				chartName: "experiment types",
				chartDataArr: chartDataArr,
				chartID : "experimentalStrategy",
				chartIDValue : "#expCountChart",
				caseCountKey : "cases_count",
				filterKey : "experiment_type",
				offsetLeft: 0,
				offsetTop: 300,
				offsetRight: 50
			}
			this.createD3BarChart(dataJSON);
		});
		// Update disease types pie chart
		this.browseService.getFilteredDiseases(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			this.diseasesData = data.uiExperimentPie;
			d3.select("#diseaseTypes").remove();
			this.createD3PieChart(data.uiExperimentPie);
		});
	}

	displayAllFractionsAndSort(types, chartDataArr, sortField, countField) {
		for (var i in types) {
			if (!chartDataArr.includes(types[i])) {
				let typeData = {};
				typeData[sortField] = types[i];
				typeData[countField] = 0;
				chartDataArr.push(typeData);
			}
		}
		chartDataArr.sort((a, b) => {
			if (a[sortField] < b[sortField])
				return -1;
			if (a[sortField] > b[sortField])
				return 1;
			return 0;
		});
		return chartDataArr;
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
		var filter_field = [];
		if (this.gene_study_name && this.gene_study_name != "") {
			//console.log("GENE Study Name: "+this.gene_study_name);
			filter_field = this.gene_study_name.split(':');
			this.gene_study_names = filter_field[1];
		} else {
			//@@@PDC-5428 fix study name truncation issue			
			filter_field.push(this.newFilterValue.substring(0, this.newFilterValue.indexOf(":")));
			filter_field.push(this.newFilterValue.substring(this.newFilterValue.indexOf(":")+1));
			//var filter_field = this.newFilterValue.split(':');
		}
			//console.log("New filter value: "+this.newFilterValue);
			//console.log("Filter Name: "+filter_field[0]);
			//console.log("Filter value: "+filter_field[1]);
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

	//@@@PDC-1418: Unable to clear breadcrumbs when the user clicks on breadcrumbs other than "Clear"
	randomNumber(min, max) {
		return Math.random() * (max - min) + min;
	}

	//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
	//@@@PDC-994: Breadcrumbs in Browse page are displayed even after clearing filter selections
	deleteBreadcrumb(event, filterToBeDeleted = []) {
		if (event != '') {
			this.filtersChangedInBreadcrumbBar = event.value + ":";
			//@@@PDC-1418: Unable to clear breadcrumbs when the user clicks on breadcrumbs other than "Clear"
			//ngOnChanges in browse filters component is not detecting a change 
			//if the value sent from this file is the same
			//Adding a random number to the variable changes the value each time its sent to another component.
			let randomNum = this.randomNumber(1, 10);
			this.filtersChangedInBreadcrumbBar = this.filtersChangedInBreadcrumbBar + "~" + randomNum;
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
		//@@@PDC-1418: Unable to clear breadcrumbs when the user clicks on breadcrumbs other than "Clear"
		//ngOnChanges in browse filters component is not detecting a change 
	    //if the value sent from this file is the same
		//Adding a random number to the variable changes the value each time its sent to another component.
		let randomNum = this.randomNumber(1, 10);
		this.filtersChangedInBreadcrumbBar = this.filtersChangedInBreadcrumbBar + "~" + randomNum;
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
	
	//@@@PDC-3328 hide filters, charts, and all data tabs except for Files when showing files for older study version
	setOldStudyVersion(event: any){
		if (event['oldStudyVersion'] != ""){
			this.disablePanelsFlag = true;
			this.opened = false;
		}
	}
	
	//PDC-3074 add TSV format for manifests
	downloadWholeManifest(event:any) {
		this.downloadAllManifests = event['downloadAllManifest'] + "*" + event['format'] + "*" + new Date().toLocaleString();
		console.log(this.downloadAllManifests);
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
				this.captureTabChange = "0";
				break;
			}
			case 1: { //Biospecimen tab
				this.selectedTab = 1;
				this.captureTabChange = "1";
				break;
			}
			case 2: { //Clinical tab
				this.selectedTab = 2;
				this.captureTabChange = "2";
				break;
			}
			case 3: { //Files tab
				this.selectedTab = 3;
				this.captureTabChange = "3";
				break;
			}
			case 4: { //Genes tab
				this.selectedTab = 4;
				this.captureTabChange = "4";
				break;
			}
			default: { //General tab
				this.selectedTab = 0;
				this.captureTabChange = "0";
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
	
	
	//Hide or show Query URL
	showBookmarkToggle(){
		this.showBookmarkFlag = !this.showBookmarkFlag;
	}
	
	//Copy text query url to clipboard
	copyTextToClipboard(val: string){
		let selBox = document.createElement('textarea');
		selBox.style.position = 'fixed';
		selBox.style.left = '0';
		selBox.style.top = '0';
		selBox.style.opacity = '0';
		selBox.value = val;
		document.body.appendChild(selBox);
		selBox.focus();
		selBox.select();
		document.execCommand('copy');
		document.body.removeChild(selBox);
	}

	ngOnInit() {
	this.getDiseasesData();
	this.getCasesByExperimentalStrategy();
	this.getCasesByAnalyticFraction();
	}
}
