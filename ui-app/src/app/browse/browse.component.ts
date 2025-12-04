import { Component, OnInit, ViewChild, Input, EventEmitter, Output, AfterViewInit, HostListener } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap } from 'rxjs/operators';
import gql from 'graphql-tag';
import {AnalyticFractionCount} from '../types';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import {  QueryDiseases, Disease, ExperimentTypeCount, Filter } from '../types';

import { BrowseService } from './browse.service';
import { MatSidenav } from '@angular/material/sidenav';

import {TableTotalRecordCount} from '../types';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as d3 from 'd3';
import { take } from 'rxjs/operators';

declare var window: any;

@Component({
    selector: 'browse',
    templateUrl: './browse-new.component.html',
    styleUrls: ['../../assets/css/global.css', './browse.component.scss', '../../assets/css/morpheus-latest.min.css'],
    standalone: false
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
export class BrowseComponent implements OnInit, AfterViewInit {
	diseasesData: any; // Changed from Observable<Disease[]> to store actual array data
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

	showDownloadDropdown = false;

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
	console.log('Getting diseases data...');
	this.browseService.getDiseases().pipe(take(1)).subscribe((data: any) => {
		console.log('Diseases data received:', data);
		this.diseasesData = data.uiExperimentPie;
		//@@@PDC-7596: Duplicate D3 Charts occur on the UI when Case URL is pasted in a new tab
		d3.select("#diseaseTypes").remove();
		// Small delay to ensure container is rendered
		setTimeout(() => {
			this.createD3PieChart(data.uiExperimentPie);
		}, 100);
	});
}

toggleSidenav() {
  this.opened = !this.opened;
}

//@@@PDC-7344: Replace highcharts with D3 in PDC chart implementation - Pie chart
createD3PieChart(data, selectedDiseaseType = null) {
	console.log('Creating D3 pie chart with data:', data);
	console.log('Selected disease type for highlighting:', selectedDiseaseType);
	if (!data || !Array.isArray(data) || data.length === 0) {
		console.error('No data provided for pie chart:', data);
		return;
	}
	var that = this;
	var chartId;
	var svg;

	// Clear any existing chart first
	d3.select('#diseaseTypesChart').selectAll('*').remove();

	// Get container dimensions dynamically
	const chartContainer = d3.select('#diseaseTypesChart');
	console.log('Chart container found:', !chartContainer.empty());
	if (chartContainer.empty()) {
		console.error('Chart container #diseaseTypesChart not found!');
		return;
	}

	const containerElement = chartContainer.node() as HTMLElement;
	const containerWidth = containerElement.clientWidth;
	const containerHeight = containerElement.clientHeight;

	var margin = 40;
	var padding = 20; // Extra padding to ensure chart stays within container
	var width = Math.max(containerWidth - padding * 2, 300); // Leave padding space
	var height = Math.max(containerHeight - padding * 2, 280); // Leave padding space
	var radius = Math.min(width, height) / 2 - margin;

	// Create a deep copy of the data to avoid "not extensible" errors
	const dataCopy = JSON.parse(JSON.stringify(data));
	const total = dataCopy.reduce((prev, next) => prev + next.cases_count, 0);
	console.log('Total cases count:', total);
	if (!total || isNaN(total)) {
		console.error('Invalid total cases count for pie chart:', total);
		return;
	}
	for (var i in dataCopy) {
		let casesCount = dataCopy[i]['cases_count'];
		let pcent = (casesCount/total)*100;
		pcent = Number(pcent.toFixed(1));
		dataCopy[i]['cases_count_pcent'] = pcent;
	}
	const sortedData = dataCopy.sort((a,b) => a.cases_count_pcent - b.cases_count_pcent).reverse();
	var chartID = '#diseaseTypesChart';
	var tooltip = d3
	.select('body')
	.append('div')
	.style('position', 'absolute')
	.style('z-index', '1000')
	.style('opacity', '0')
	.style('background-color', 'white')
	.style('font-size', '16px')
	.style('padding', '5px')
	.style('color', 'black')
	.style('box-shadow', '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)')
	.style('border-radius', '5px')
	.style('border', '1px solid rgba(40, 40, 40)')
	.style('pointer-events', 'none')
	.attr('class', 'pie-chart-tooltip');

	var colors = d3
	.scaleOrdinal()
	.domain(sortedData.map(d => d.cases_count_pcent.toString()))
	.range([
		'#FF9F31', '#FFD03C', '#407185', '#588897',
		'#7BA2AF', '#FFD03C', '#407185', '#67C4E2', '#71E2E8',  '#72E0C0',
		'#91F7AB', '#FF9F31', '#088F8F'
	]);
	svg =  d3
	.select(chartID)
	.append("svg")
	.attr("id", 'diseaseTypesSVG')
	.attr("width", width + padding * 2)
	.attr("height", height + padding * 2 + 30) // Added 30px extra height for label space
	.append("g")
	.attr(
		"transform",
		"translate(" + (width / 2 + padding) + "," + (height / 2 + padding - 15) + ")" // Kept original center position
	);
	// Compute the position of each group on the pie
	const pieChart = d3.pie<any>().value((d: any) => Number(d.cases_count_pcent));
	const data_ready = pieChart(sortedData);
	//Define radius
	var cRadius = 3;
	var iRadius = radius * 0.25;
	var oRadius = radius * 0.75;
	//Create an arc function
	var arc = d3
	.arc()
	.innerRadius(iRadius) // This is the size of the donut hole
	.outerRadius(oRadius);

	//Draw the arcs
	svg.selectAll(".donutArcs")
	.data(data_ready)
	.enter().append("path")
	.attr("class", "donutArcs")
	.attr("id", d => `donutArc-${d.data.disease_type}`)
	.attr("d", arc)
	.attr("fill", (d, i) => (d.data.color ? d.data.color : colors(i)))
	.attr("stroke", "white")
	.style("stroke-width", "2px") // Consistent thin white stroke for all slices
	.style("opacity", d => {
		// Slightly dim non-selected slices when a disease type is selected
		if (selectedDiseaseType) {
			return d.data.disease_type === selectedDiseaseType ? 1 : 0.7;
		}
		return 1;
	})
	.style('cursor', 'pointer');

	console.log('PIE CHART ARCS CREATED. Count:', svg.selectAll(".donutArcs").size());
	console.log('PIE CHART ARC ELEMENTS:', svg.selectAll(".donutArcs").nodes());

	// Add event handlers separately
	svg.selectAll(".donutArcs")
	// Add event handlers separately
	svg.selectAll(".donutArcs")
	.on('mouseover', function(event, d) {
		console.log('PIE CHART MOUSEOVER TRIGGERED');
		tooltip.style('opacity', '1');
		tooltip.html(`${d.data.disease_type}<br><span style="color:${colors(d.index)}">●</span>&nbsp;Case count: <span>${d.data.cases_count}</span>`)
		.style('left', `${event.pageX + 10}px`)
		.style('top', `${event.pageY - 20}px`);
		console.log('Tooltip node after setting opacity 1:', tooltip.node());
		console.log('Tooltip styles:', tooltip.style('opacity'), tooltip.style('left'), tooltip.style('top'));
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
	.on('mouseout', function (event, d) {
		tooltip.style('opacity', '0');
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
	.on('click', (event, d) => {
		console.log('=== PIE CHART SLICE CLICKED ===');
		console.log('Disease type clicked:', d.data.disease_type);
		tooltip.style('opacity', 0);

		// For pie chart clicks, we want to filter ALL charts, including redrawing the pie chart
		// with highlighting, rather than the current approach that blanks bar charts
		const filterString = `disease_type:${d.data.disease_type}`;
		console.log('Applying disease type filter:', filterString);

		// Set the filter state
		this.newFilterSelected['disease_type'] = d.data.disease_type;

		// Emit to parentCharts for the filter component
		this.parentCharts.next(filterString);

		// Apply the filter and update all charts
		this.onFilterSelected(filterString);
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
			var bigArcMaker=  d3.arc().outerRadius(155).innerRadius(oRadius).cornerRadius(cRadius); // Increased from 140 to 155 to match new label spacing
			var p = "";
      		p += myArcMaker.centroid(d)[0] + ',' + myArcMaker.centroid(d)[1] + ',' + bigArcMaker.centroid(d)[0] + ',' + bigArcMaker.centroid(d)[1];
      		return p;
		}
	})

	// Add the polylines between chart and labels:
	const labelNodes = svg
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
	.style('font-size', '10px') // Match bar chart font size
	.style('font-weight', '400') // Normal font weight to match bar charts
	.style('fill', '#333333') // Dark gray color for better contrast
	.text( function(d) {
		if (d.data.cases_count_pcent > 4) {
			// Display full disease type name without trimming to allow proper wrapping
			return d.data.disease_type + ': ' + d.data.cases_count_pcent + '%';
		}
	})
	.call(function(selection) {
		// Only wrap text if percentage > 6% AND label length >= "Acute Myeloid Leukemia: 8%"
		const thresholdLength = "Acute Myeloid Leukemia: 8%".length;
		selection.each(function(d) {
			const el = d3.select(this);
			const text = el.text();
			if (text && d.data.cases_count_pcent > 6 && text.length >= thresholdLength) {
				that.lineBreak.call(that, d3.select(this), 12);
			}
		});
	});

	// Store label positions to detect and resolve collisions
	const labelPositions = [];
	const minLabelDistance = 35; // Increased minimum distance between labels
	const baseRadius = 165; // Increased from 150 for more spacing

	labelNodes.attr('transform', function(d, i) {
		if (d.data.cases_count_pcent > 4) {
			var bigArcMaker = d3.arc().outerRadius(baseRadius).innerRadius(oRadius).cornerRadius(cRadius);

			// Calculate initial position
			var initialX = bigArcMaker.centroid(d)[0];
			var initialY = bigArcMaker.centroid(d)[1];

			// Check for collisions with existing labels
			let finalX = initialX;
			let finalY = initialY;
			let adjusted = false;
			let iterations = 0;
			const maxIterations = 10; // Prevent infinite loops

			// Multiple pass collision detection for better spacing
			while (iterations < maxIterations) {
				let hasCollision = false;

				// Check collision with all previously placed labels
				for (let j = 0; j < labelPositions.length; j++) {
					const existingPos = labelPositions[j];
					const distance = Math.sqrt(Math.pow(finalX - existingPos.x, 2) + Math.pow(finalY - existingPos.y, 2));

					if (distance < minLabelDistance) {
						// Collision detected, adjust position
						hasCollision = true;
						adjusted = true;

						// Calculate angle to push away from existing label
						const angle = Math.atan2(finalY - existingPos.y, finalX - existingPos.x);
						finalX = existingPos.x + Math.cos(angle) * (minLabelDistance + 5);
						finalY = existingPos.y + Math.sin(angle) * (minLabelDistance + 5);

						// If still too close to center, push further out
						const distanceFromCenter = Math.sqrt(finalX * finalX + finalY * finalY);
						if (distanceFromCenter < baseRadius - 10) {
							const centerAngle = Math.atan2(finalY, finalX);
							finalX = Math.cos(centerAngle) * (baseRadius + 15);
							finalY = Math.sin(centerAngle) * (baseRadius + 15);
						}
						break; // Check again in next iteration
					}
				}

				if (!hasCollision) {
					break; // No more collisions, we're done
				}
				iterations++;
			}

			// Additional vertical spreading for labels on the same side
			const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
			const isRightSide = midangle < Math.PI;

			// Dynamic vertical offset based on number of labels on this side
			const sideLabels = labelPositions.filter(pos => {
				const posAngle = Math.atan2(pos.y, pos.x);
				const normalizedPosAngle = posAngle < 0 ? posAngle + 2 * Math.PI : posAngle;
				const isPosSameSubSide = isRightSide ? normalizedPosAngle < Math.PI : normalizedPosAngle >= Math.PI;
				return isPosSameSubSide;
			});

			const verticalOffset = sideLabels.length * 12; // Dynamic offset based on side density
			if (adjusted) {
				finalY += isRightSide ? verticalOffset : -verticalOffset;
			}

			//@@@PDC-7508: Improvements to the D3 charts
			// Add padding to avoid overlapping of text near the mid arc of donut chart
			if (d.startAngle < 3.0  && d.endAngle > 3.0) {
				finalY += 25; // Increased padding for mid-arc labels
			}

			// Ensure labels don't go too far from visible area
			const maxDistance = baseRadius + 60;
			const distanceFromCenter = Math.sqrt(finalX * finalX + finalY * finalY);
			if (distanceFromCenter > maxDistance) {
				const centerAngle = Math.atan2(finalY, finalX);
				finalX = Math.cos(centerAngle) * maxDistance;
				finalY = Math.sin(centerAngle) * maxDistance;
			}

			// Store this label's position for future collision checks
			labelPositions.push({x: finalX, y: finalY, index: i});

			return 'translate(' + finalX + ',' + finalY + ')';
		}
	})
	.style("color", "#585858")
	.style("fill", "#585858")
	.style("font-family", "Arial, sans-serif") // Match bar chart font family
	.style('text-anchor', function(d) {
		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
		return (midangle < Math.PI ? 'start' : 'end')
	});

}


//@@@PDC-7508: Improvements to the D3 charts
/*
lineBreak(text, width) {
	text.each(function () {
		var el = d3.select(this);
		let words = el.text().split(' ');
		let wordsFormatted = [];

		let string = '';
		for (let i = 0; i < words.length; i++) {
			// Check if adding the next word would exceed the width limit
			let testString = string + words[i] + (i < words.length - 1 ? ' ' : '');
			if (testString.length <= width) {
				string = testString;
			} else {
				// If we have content in string, push it and start new line
				if (string.trim().length > 0) {
					wordsFormatted.push(string.trim());
					string = words[i] + (i < words.length - 1 ? ' ' : '');
				} else {
					// If single word is longer than width, break it
					if (words[i].length > width) {
						let word = words[i];
						while (word.length > width) {
							wordsFormatted.push(word.substring(0, width));
							word = word.substring(width);
						}
						string = word + (i < words.length - 1 ? ' ' : '');
					} else {
						string = words[i] + (i < words.length - 1 ? ' ' : '');
					}
				}
			}
		}
		// Add any remaining content
		if (string.trim().length > 0) {
			wordsFormatted.push(string.trim());
		}

		el.text('');
		for (var i = 0; i < wordsFormatted.length; i++) {
			var tspan = el.append('tspan').text(wordsFormatted[i]);
			if (i > 0)
				tspan.attr('x', 0).attr('dy', '16'); // Line spacing for wrapped text
		}
	});
}
	*/
//@@@PDC-7508: Improvements to the D3 charts
lineBreak(text, width) {
	text.each(function () {
		var el = d3.select(this);
		let words = el.text().split(' ');
		let wordsFormatted = [];

		let string = '';
		for (let i = 0; i < words.length; i++) {
			let word = words[i];
			
			// Check if adding this word would exceed the width
			if ((string + word).length <= width) {
				string = string + word + ' ';
			} else {
				// If we have content in string, push it and start new line
				if (string.trim().length > 0) {
					wordsFormatted.push(string.trim());
					string = word + ' ';
				} else {
					// If single word is longer than width, we have to put it on its own line
					// but we won't break the word - just let it overflow slightly
					wordsFormatted.push(word);
					string = '';
				}
			}
		}
		
		// Add any remaining content
		if (string.trim().length > 0) {
			wordsFormatted.push(string.trim());
		}

		el.text('');
		for (var i = 0; i < wordsFormatted.length; i++) {
			var tspan = el.append('tspan').text(wordsFormatted[i]);
			if (i > 0)
				tspan.attr('x', 0).attr('dy', '12'); // Increased line spacing for better readability
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
		// Clear existing chart and any tooltips more thoroughly
		d3.select("#analyticalFractionChart").selectAll("*").remove();
		d3.selectAll('.analyticalFractions-tooltip').remove();
		
		// Small delay to ensure container is rendered and cleanup is complete
		setTimeout(() => {
			this.createD3BarChart(dataJSON);
		}, 100);
	});
}


//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
/*
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

	// Clear any existing chart first
	d3.select(chartIDValue).selectAll('*').remove();

	// Get container dimensions dynamically
	const chartContainer = d3.select(chartIDValue);
	if (chartContainer.empty()) {
		console.error(`Chart container ${chartIDValue} not found!`);
		return;
	}

	// Clear any existing chart first
	chartContainer.selectAll('*').remove();

	const containerElement = chartContainer.node() as HTMLElement;
	const containerWidth = containerElement.clientWidth;
	const containerHeight = containerElement.clientHeight;

	let highestCurrentValue = 0;
	var highestValue;
    var svg;
    var margin = 50;
    var padding = 10;
    var leftMargin = 140; // Increased from 120 to 140 to provide more space for wrapped labels
    var width = Math.max(containerWidth - margin - leftMargin - padding * 2, 250);
    var height = Math.max(containerHeight - margin * 2 - padding * 2, 230);
	let tableLength = chartDataArr.length;

	// Safety check for dimensions
	if (width <= 0 || height <= 0) {
		console.error('Invalid chart dimensions:', {width, height, containerWidth, containerHeight});
		return;
	}

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
	console.log('Chart dimensions:', {containerWidth, containerHeight, width, height, leftMargin, margin});

	svg = d3
	  .select(chartIDValue)
	  .append("svg")
	  .attr("width", containerWidth)
	  .attr("height", containerHeight)
	  .attr("id", chartID)
	  .append("g")
	  .attr("transform", "translate(" + leftMargin + "," + margin + ")");


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
	console.log('Chart data:', data);
	console.log('X scale domain:', [0, Number(highestValue)]);
	console.log('X scale range:', [0, width]);
	console.log('Y scale domain:', data.map(d => d[filterKey]));
	console.log('Y scale range:', [0, height]);
	var xaxisID = chartID + '-xaxis';
	var yaxisID = chartID + '-yaxis';

    //Drawing X-axis manually with small fonts
    // Draw the axis line
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", height)
        .attr("y2", height)
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1);

    // Create manual X-axis ticks and labels
    const xTicks = x.ticks(4);
    xTicks.forEach(tickValue => {
        const xPos = x(tickValue);

        // Draw tick line
        svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", height)
            .attr("y2", height + 6)
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1);

        // Draw tick label
        svg.append("text")
            .attr("x", xPos)
            .attr("y", height + 18)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-family", "Arial, sans-serif")
            .style("fill", "currentColor")
            .text(tickValue);
    });

	//Creaate Y-axis band scale with more spacing
	const y = d3
	.scaleBand()
	.range([0, height])
	.domain(data.map(d => d[filterKey]))
	.padding(0.4); // Increased from 0.2 to 0.4 for more space between labels

   // Create Y-axis manually with small fonts
   // Draw the axis line
   svg.append("line")
       .attr("x1", 0)
       .attr("x2", 0)
       .attr("y1", 0)
       .attr("y2", height)
       .attr("stroke", "currentColor")
       .attr("stroke-width", 1);

   // Create manual Y-axis ticks and labels
   const yDomain = y.domain();
   yDomain.forEach(tickValue => {
       const yPos = y(tickValue) + y.bandwidth() / 2; // Center the label

       // Draw tick line
       svg.append("line")
           .attr("x1", -6)
           .attr("x2", 0)
           .attr("y1", yPos)
           .attr("y2", yPos)
           .attr("stroke", "currentColor")
           .attr("stroke-width", 1);

       // Word wrap long labels to display all text without truncation - break on whitespace and hyphens
       const labelText = tickValue;
       const maxCharsPerLine = 18; // Increased to allow for more characters per line
       // Split on whitespace first, then further split hyphenated words
       const words = labelText.split(/\s+/).flatMap(word => {
           // If word contains hyphens and is longer than maxCharsPerLine, split on hyphens
           if (word.includes('-') && word.length > maxCharsPerLine) {
               return word.split('-').map((part, index, array) =>
                   index < array.length - 1 ? part + '-' : part
               );
           }
           return [word];
       });
       const lines = [];
       let currentLine = "";

       // Build lines by adding words until max length is reached
       words.forEach(word => {
           const separator = currentLine ? " " : "";
           const potentialLine = currentLine + separator + word;

           if (potentialLine.length <= maxCharsPerLine) {
               currentLine = potentialLine;
           } else {
               if (currentLine) lines.push(currentLine);
               currentLine = word;
               // If single word is still too long, truncate it with ellipsis
               if (currentLine.length > maxCharsPerLine) {
                   currentLine = currentLine.substring(0, maxCharsPerLine - 3) + "...";
               }
           }
       });
       if (currentLine) lines.push(currentLine);

       // If a single word is still too long for one line, keep it as is (don't split words)
       const finalLines = [];
       lines.forEach(line => {
           finalLines.push(line);
       });

       // Create text element for each line with more spacing
       finalLines.forEach((line, index) => {
           svg.append("text")
               .attr("x", -20) // Adjusted from -15 to -20 to account for increased left margin
               .attr("y", yPos + (index - (finalLines.length - 1) / 2) * 16) // Back to 16px line spacing
               .attr("dy", "0.32em")
               .attr("text-anchor", "end")
               .style("font-size", "14px")
               .style("font-family", "Arial, sans-serif")
               .style("fill", "currentColor")
               .text(line);
       });
   });

   //@@@PDC-7508: Improvements to the D3 charts - position X-axis title below chart
   // Use exact same styling approach as X-axis tick labels but position below them
   svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + 35) // Below the X-axis tick labels (which are at height + 18)
    .style("font-size", "12px") // Slightly smaller than tick labels (14px)
    .style("font-family", "Arial, sans-serif")
    .style("fill", "currentColor")
    .text("Cases");

   // Create vertical grid lines using our manual X-axis ticks
   const xaxis_ticks = x.ticks(4);

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
	let barWidthDiff = 5; // Reduced from 20 to 5 for thicker bars
	if (tableLength <= 5) barWidthDiff = 10; // Reduced from 30 to 10 for thicker bars

   //Create horizontal bars
   const bars = svg.append("g")
	.attr("fill", "rgb(88, 136, 165)")
	.selectAll()
	.data(data)
	.join("rect")
	.attr("x", x(0))
	.attr("y", (d) => y(d[filterKey]))
	.attr("width", (d) => x(d[caseCountKey]) - x(0))
	.attr("height", y.bandwidth() - barWidthDiff)
	.attr("fill", "rgb(88, 136, 165)") // Explicitly set fill for each bar
	.attr('cursor', 'pointer')
	.attr('title', (d) =>  d[filterKey])
	.attr("id", (d) =>  d[filterKey])
	.attr('class', d => `bar-${d[filterKey]}`);

   console.log('Bars created:', bars.size());
   console.log('Sample bar attributes:', {
       x: x(0),
       sampleY: data[0] ? y(data[0][filterKey]) : 'no data',
       sampleWidth: data[0] ? x(data[0][caseCountKey]) - x(0) : 'no data',
       bandwidth: y.bandwidth(),
       barHeight: y.bandwidth() - barWidthDiff
   });

   bars
	.attr('onload', function (d,i) {
		tooltip.style('opacity', 0);
	})
	.on('mouseover', function(event, d) {
		tooltip.style('opacity', 1);
		tooltip.html(`${d[filterKey]}<br><span style="color:rgb(88, 136, 165)">●</span>&nbsp;Case count: <span>${d[caseCountKey]}</span>`)
			.style('left', `${event.pageX + 10}px`)
			.style('top', `${event.pageY - 20}px`)
			.style('position', 'absolute')
			.style('transform', 'none');
		d3.select(`.bar-${d[filterKey]}`)
			.attr('fill', f => 'rgb(113, 161, 190)');
	})
	.on('mouseout', function(event, d) {
		tooltip.style('opacity', 0);
		d3.select(`.bar-${d[filterKey]}`)
			.attr('fill', 'rgb(88, 136, 165)');
	})
	.on('click', (event, d) => {
		console.log('Bar clicked!', chartName, d[filterKey]);
		tooltip.style('opacity', 0);
		// Use arrow function to preserve 'this' context
		this.onChartBarClick(chartName, d[filterKey]);
	});
}
	*/

//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
createD3BarChart(dataJSON) {
	console.log('*** createD3BarChart called with:', dataJSON);
	console.log('*** Chart ID:', dataJSON.chartID);
	console.log('*** Chart Name:', dataJSON.chartName);
	console.log('*** Chart Data Array Length:', dataJSON.chartDataArr.length);
	console.log('*** Chart Data Array:', dataJSON.chartDataArr);

	var chartName = dataJSON["chartName"];
	var chartDataArr = dataJSON["chartDataArr"];
	var chartID = dataJSON["chartID"];
	var chartIDValue = dataJSON["chartIDValue"];
	var caseCountKey = dataJSON["caseCountKey"];
	var filterKey = dataJSON["filterKey"];
	var offsetLeft = dataJSON["offsetLeft"];
	var offsetTop = dataJSON["offsetTop"];
	var offsetRight = dataJSON["offsetRight"];

	// Get container element first
	const chartContainer = d3.select(chartIDValue);
	
	// Clear any existing chart and tooltips completely before creating new one
	if (!chartContainer.empty()) {
		chartContainer.selectAll("*").remove();
	}
	// Remove any lingering tooltips from this specific chart instance only
	d3.selectAll(`.${chartID}-tooltip`).remove();

	// Handle empty data case - still create an SVG with a "No data" message
	if (!chartDataArr || chartDataArr.length === 0) {
		console.log('No data provided for chart:', chartName);

		if (chartContainer.empty()) {
			console.error('Chart container not found:', chartIDValue);
			return;
		}

		// Create an SVG with "No data available" message
		const containerElement = chartContainer.node() as HTMLElement;
		const containerWidth = containerElement.clientWidth || 400;
		const containerHeight = containerElement.clientHeight || 350;

		const svg = chartContainer
			.append("svg")
			.attr("width", containerWidth)
			.attr("height", containerHeight);

		svg.append("text")
			.attr("x", containerWidth / 2)
			.attr("y", containerHeight / 2)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")
			.style("font-size", "16px")
			.style("fill", "#666")
			.text("No data available");

		console.log('Created "No data" message for chart:', chartName);
		return;
	}

	let highestCurrentValue = 0;
	var highestValue;
    var svg;

    // Use the chartContainer already declared above
    console.log('Bar chart container found:', !chartContainer.empty());
    if (chartContainer.empty()) {
        console.error('Bar chart container not found:', chartIDValue);
        return;
    }

    const containerElement = chartContainer.node() as HTMLElement;
    if (!containerElement) {
        console.error('Container element is null:', chartIDValue);
        return;
    }

    const containerWidth = containerElement.clientWidth;
    const containerHeight = containerElement.clientHeight;

    console.log('Container dimensions:', { containerWidth, containerHeight });

    if (containerWidth === 0 || containerHeight === 0) {
        console.error('Container has zero dimensions, using fallback:', { containerWidth, containerHeight });
        console.log('Container element:', containerElement);
        console.log('Container styles:', window.getComputedStyle(containerElement));
        // Use fallback dimensions
        const fallbackWidth = 400;
        const fallbackHeight = 350;
        console.log('Using fallback dimensions:', { fallbackWidth, fallbackHeight });
    }

    var margin = 30;
    var leftMargin = 120; // More space for labels
    var padding = 20; // Extra padding to ensure chart stays within container

    // Dynamic dimensions based on container, with fallbacks
    var actualWidth = containerWidth || 400;
    var actualHeight = containerHeight || 350;
    var width = Math.max(actualWidth - leftMargin - padding * 2, 200);

    // Calculate height to maintain consistent spacing regardless of filter results
    var minBarHeight = 35; // Height per bar for good spacing
    var minChartHeight = 280; // Minimum chart height to prevent squishing
    var maxChartHeight = actualHeight - margin * 2 - padding * 2;

    // Calculate ideal height based on data, but enforce minimum
    var calculatedHeight = chartDataArr.length * minBarHeight;
    var height = Math.max(Math.min(calculatedHeight, maxChartHeight), minChartHeight);

    console.log('Chart height calculation:', {
        dataItems: chartDataArr.length,
        calculatedHeight,
        minChartHeight,
        maxChartHeight,
        finalHeight: height
    });

    console.log('Bar chart dimensions:', {
        containerWidth: actualWidth,
        containerHeight: actualHeight,
        width,
        height,
        leftMargin,
        margin
    });

	let tableLength = chartDataArr.length;

	//define tooltip
	var tooltip = d3
	.select('body')
	.append('div')
	.style('position', 'absolute')
	.style('z-index', '1000')
	.style('opacity', '0')
	.style('background-color', 'white')
	.style('font-size', '12px')
	.style('padding', '5px')
	.style('color', 'black')
	.style('box-shadow', '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)')
	.style('border-radius', '5px')
	.style('border', '1px solid rgba(40, 40, 40)')
	.style('pointer-events', 'none')
	.attr('class', `${chartID}-tooltip`);

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
	console.log('Creating SVG with dimensions:', { chartID, leftMargin, width, height, margin });

	// Use proper viewBox dimensions to fit the container like pie chart
	var viewBoxWidth = width + leftMargin + padding * 2;
	var viewBoxHeight = height + margin * 2 + padding * 2;
	var viewBoxLeft = 1; // Start from left margin

	// Add specific horizontal adjustment for experiment types chart
	var chartHorizontalOffset = 0;
	if (chartID === 'experimentalStrategy') {
		chartHorizontalOffset = -50; // Move experiment types chart 50px to the left
	}

	svg = d3
	  .select(chartIDValue)
	  .append("svg")
	  .attr("width", actualWidth)
	  .attr("height", Math.max(viewBoxHeight, actualHeight)) // Ensure SVG is tall enough
	  .attr(
		"viewBox",
		`${viewBoxLeft + chartHorizontalOffset} 0 ${viewBoxWidth} ${viewBoxHeight}`
	  )
	  .attr("preserveAspectRatio", "xMidYTop meet") // Top-align for consistent positioning
	  .attr("id", chartID)
	  .append("g")
	  .attr("transform", "translate(" + (leftMargin + chartHorizontalOffset) + "," + (margin + padding) + ")");


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
	   .call(d3.axisBottom(x).ticks(3).tickFormat(d3.format('d'))) // Fewer ticks
	   .selectAll("text")
	   .style("font-size", "8px") // Smaller font
	   .style("padding", "0.2");

	//Create Y-axis band scale with consistent spacing regardless of data count
	const y = d3
	.scaleBand()
	.range([0, height])
	.domain(data.map(d => d[filterKey]))
	.padding(0.5); // Higher padding to ensure good separation even with fewer items

   svg
	   .append("g")
	   .attr("id", yaxisID)
	   .call(d3.axisLeft(y))
	   .selectAll("text")
	   .style("font-size", "10px") // Readable font size
	   .style("text-anchor", "end")
	   .attr("dx", "-5px")
	   .attr("dy", "0.32em")
	   .style("max-width", "100px")
	   .style("overflow", "visible")
	   .each(function(d) {
		   // Word wrap long labels with better spacing
		   const text = d3.select(this);
		   const words = d.split(/[\s-]+/); // Split on spaces and hyphens
		   const maxWidth = 110; // Slightly more width for labels
		   const lineHeight = 1.0; // Reduced line height for tighter spacing

		   if (words.length > 1) {
			   text.text(null); // Clear existing text

			   let line = [];
			   let lineNumber = 0;
			   let tspan = text.append("tspan")
				   .attr("x", -5)
				   .attr("dy", "0.32em");

			   words.forEach((word, i) => {
				   line.push(word);
				   tspan.text(line.join(" "));

				   // Check if the line is too long
				   if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
					   line.pop(); // Remove the last word
					   tspan.text(line.join(" "));

					   // Start a new line
					   line = [word];
					   lineNumber++;
					   tspan = text.append("tspan")
						   .attr("x", -5)
						   .attr("dy", lineHeight + "em")
						   .text(word);
				   }
			   });

			   // Adjust vertical position to center multi-line text within the bar band
			   if (lineNumber > 0) {
				   text.selectAll("tspan")
					   .attr("dy", function(d, i) {
						   return i === 0 ? (-lineNumber * lineHeight / 2) + "em" : lineHeight + "em";
					   });
			   }
		   }
	   });

   //@@@PDC-7508: Improvements to the D3 charts - position X-axis title below chart
   // Use exact same styling approach as X-axis tick labels but position below them
   svg.append("text")
    .attr("class", "casesLabel")
    .attr("text-anchor", "middle") // Center the label
    .attr("x", width/2)
    .attr("y", height + 35) // Reduced from 50 to 35 for closer positioning
    .style("font-size", "12px") // Readable font size
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

	//@@@PDC-7508: Improvements to the D3 charts - prevent squishing after filtering
	// Calculate bar height to maintain visual consistency
	var availableBarHeight = y.bandwidth();
	var optimalBarThickness = 20; // Target bar thickness
	var minBarThickness = 12; // Minimum bar thickness
	var maxBarThickness = 30; // Maximum bar thickness to prevent overly thick bars

	// When filtered to few items, prevent bars from becoming too thick
	var barThickness;
	if (chartDataArr.length <= 3) {
		barThickness = Math.min(optimalBarThickness, availableBarHeight * 0.6);
	} else {
		barThickness = Math.max(Math.min(availableBarHeight * 0.6, maxBarThickness), minBarThickness);
	}

	var barWidthDiff = availableBarHeight - barThickness;

	console.log('Bar sizing:', {
		dataCount: chartDataArr.length,
		availableBarHeight,
		barThickness,
		barWidthDiff
	});

	// Store component reference for use in event handlers
	const componentRef = this;
	console.log('*** Storing component reference:', componentRef);

   //Create horizontal bars
   const bars = svg.append("g")
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
	.attr('class', d => `bar-${d[filterKey]}`);

	console.log('*** Bars created, count:', bars.size());
	console.log('*** Bar elements:', bars.nodes());
	console.log('*** Adding event handlers...');

	bars.attr('onload', function (d,i) {
		tooltip.style('opacity', 0);
	});

	// Add event handlers separately
	bars
	// Add event handlers separately
	bars
	.on('mouseover', function (event, d) {
		console.log('BAR CHART MOUSEOVER TRIGGERED');
		tooltip.style('opacity', '1');
		// create a tooltip
		tooltip.html(`${d[filterKey]}<br><span style="color:rgb(88, 136, 165)">●</span>&nbsp;Case count: <span>${d[caseCountKey]}</span>`)
		.style('left', `${event.pageX + 10}px`)
		.style('top', `${event.pageY - 20}px`);
		console.log('Tooltip after styling:', tooltip.style('opacity'), tooltip.style('left'), tooltip.style('top'));
		//@@@PDC-7508: Improvements to the D3 charts
		d3.select(`.bar-${d[filterKey]}`)
		.attr('fill', f => {
			return 'rgb(113, 161, 190)';
		});
	  })
	.on('mouseout', function (event, d) {
		tooltip.style('opacity', '0');
		d3.select(`.bar-${d[filterKey]}`)
  		.attr('fill', 'rgb(88, 136, 165)')
		})
	.on('click', function(event, d) {
		console.log('=== BAR CLICK DETECTED ===');
		console.log('Event:', event);
		console.log('Data (d):', d);
		console.log('Chart name:', chartName);
		console.log('Filter key:', filterKey);
		console.log('Filter value:', d[filterKey]);

		tooltip.style('opacity', 0);

		// Simple direct approach - bypass onChartBarClick for now
		const chartToFilterMap = {
			'analytical fractions': 'analytical_fraction',
			'experiment types': 'experiment_type',
			'disease type': 'disease_type'
		};

		const filterField = chartToFilterMap[chartName];
		const filterString = `${filterField}:${d[filterKey]}`;
		console.log('Direct filter application:', filterString);

		// Use the stored component reference
		console.log('Using component reference:', componentRef);

		try {
			// Apply filter directly
			console.log('Calling parentCharts.next with:', filterString);
			componentRef.parentCharts.next(filterString);

			console.log('Calling onFilterSelected with:', filterString);
			componentRef.onFilterSelected(filterString);
			console.log('Filter applied successfully');

			// Let's also check if the filter was actually set
			setTimeout(() => {
				console.log('Filter check - newFilterSelected after 1 second:', componentRef.newFilterSelected);
			}, 1000);
		} catch (error) {
			console.error('Error applying filter:', error);
		}
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
		// Clear existing chart and any tooltips more thoroughly
		d3.select("#expCountChart").selectAll("*").remove();
		d3.selectAll('.experimentalStrategy-tooltip').remove();
		
		// Small delay to ensure container is rendered and cleanup is complete
		setTimeout(() => {
			this.createD3BarChart(dataJSON);
		}, 100);
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

	downloadData(fileType: string) {
      this.showDownloadDropdown = false; // Close dropdown after selection

    // Your download logic here
       console.log(`Downloading as ${fileType.toUpperCase()}`);

    // Example implementation:
    // if (fileType === 'csv') {
    //   // CSV download logic
    // } else if (fileType === 'tsv') {
    //   // TSV download logic
    // }
    }

	// @@@PDC-221 - Added filtering for the charts on the browse page
	// @@@PDC-616 Add acquisition type to the general filters
	onFilterSelected(filterValue: string) {
		console.log('=== onFilterSelected called ===');
		console.log('Filter value received:', filterValue);

		filterValue = filterValue.replace('_slash','/');
	    //@@@PDC-5428 fix study name truncation issue
	    var filter_field = [];
	    filter_field.push(filterValue.substring(0, filterValue.indexOf(":")));
	    filter_field.push(filterValue.substring(filterValue.indexOf(":")+1));

		console.log('Parsed filter field:', filter_field);
		console.log('Filter name:', filter_field[0]);
		console.log('Filter value:', filter_field[1]);
		//var filter_field = filterValue.split(':'); // the structure is field_name: "value1;value2"
		if (filter_field[0] == "gene_study_name") {
			//ifthe filter field is gene_study_name, do not pass it to other tabs.
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
				console.log('Setting filter:', filter_field[0], '=', filter_field[1]);
				this.newFilterSelected[filter_field[0]] = filter_field[1];
				console.log('Updated newFilterSelected:', this.newFilterSelected);
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
		console.log('=== STARTING CHART UPDATES ===');
		console.log('Updating charts with new filter data:', this.newFilterSelected);

		this.browseService.getFilteredAnalyticFractionTypeCasesCount(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
			var chartDataArr = data.uiAnalyticalFractionsCount;
			console.log('=== ANALYTICAL FRACTIONS UPDATE ===');
			console.log('Received analytical fractions data:', chartDataArr);

			// Always process the data, even if empty - displayAllFractionsAndSort will handle empty arrays
			chartDataArr = this.displayAllFractionsAndSort(this.analyticalFractionTypes, chartDataArr, 'analytical_fraction', 'cases_count');

			console.log('Processed analytical fractions data:', chartDataArr);
			console.log('Removing old analytical fractions chart...');
			// More thorough chart cleanup
			d3.select("#analyticalFractions").remove();
			d3.select("#analyticalFractionChart").selectAll("*").remove();

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
			console.log('Creating new analytical fractions chart with dataJSON:', dataJSON);

			// Add a small delay to ensure DOM cleanup is complete
			setTimeout(() => {
				this.createD3BarChart(dataJSON);
				console.log('Analytical fractions chart created');
			}, 50);
		});
		// Update experiment types bar chart
		this.browseService.getFilteredExperimentTypeCasesCount(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			//@@@PDC-7278: Replace highcharts with D3 in PDC chart implementation
			var chartDataArr = data.uiExperimentBar;
			console.log('=== EXPERIMENT TYPES UPDATE ===');
			console.log('Received experiment types data:', chartDataArr);

			// Always process the data, even if empty - displayAllFractionsAndSort will handle empty arrays
			chartDataArr = this.displayAllFractionsAndSort(this.experimentTypes, chartDataArr, 'experiment_type', 'cases_count');

			console.log('Processed experiment types data:', chartDataArr);
			console.log('Removing old experiment types chart...');
			d3.select("#experimentalStrategy").remove();
			d3.select("#expCountChart").selectAll("*").remove();
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
			console.log('Creating new experiment types chart with dataJSON:', dataJSON);

			// Add a small delay to ensure DOM cleanup is complete
			setTimeout(() => {
				this.createD3BarChart(dataJSON);
				console.log('Experiment types chart created');
			}, 50);
		});
		// Update disease types pie chart
		this.browseService.getFilteredDiseases(this.newFilterSelected).pipe(take(1)).subscribe((data: any) => {
			console.log('=== DISEASE TYPES UPDATE ===');
			console.log('Received disease types data:', data.uiExperimentPie);
			console.log('Current disease type filter:', this.newFilterSelected['disease_type']);

			// Store the data for potential reuse
			this.diseasesData = data.uiExperimentPie;

			console.log('Removing old disease types chart...');
			d3.select("#diseaseTypes").remove();
			d3.select("#diseaseTypesChart").selectAll("*").remove();

			// Add a small delay to ensure DOM cleanup is complete
			setTimeout(() => {
				// If we have a disease type filter, pass it for highlighting
				const selectedDiseaseType = this.newFilterSelected['disease_type'] || null;
				this.createD3PieChart(data.uiExperimentPie, selectedDiseaseType);
				console.log('Disease types chart created with highlighting:', selectedDiseaseType);
			}, 50);
		});
	}

	displayAllFractionsAndSort(types, chartDataArr, sortField, countField) {
		console.log('displayAllFractionsAndSort called with:', { types, chartDataArr, sortField, countField });

		// Create a new array to avoid modifying the original (which might be frozen)
		let mutableChartDataArr = [...chartDataArr];
		console.log('Created mutable array:', mutableChartDataArr);

		for (var i in types) {
			// Check if this type exists in the chart data
			const typeExists = mutableChartDataArr.some(item => item[sortField] === types[i]);
			if (!typeExists) {
				let typeData = {};
				typeData[sortField] = types[i];
				typeData[countField] = 0;
				console.log('Adding missing type:', typeData);
				mutableChartDataArr.push(typeData);
			}
		}

		mutableChartDataArr.sort((a, b) => {
			if (a[sortField] < b[sortField])
				return -1;
			if (a[sortField] > b[sortField])
				return 1;
			return 0;
		});

		console.log('Final sorted array:', mutableChartDataArr);
		return mutableChartDataArr;
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
		console.log("deleting breadcrumb");
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
		console.log(totalRecord);
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
	selectedTabChange(event: any) {
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
	// Keep other initialization here but move charts to ngAfterViewInit
	}

	ngAfterViewInit() {
		// Initialize charts after view is ready
		setTimeout(() => {
			this.getDiseasesData();
			this.getCasesByExperimentalStrategy();
			this.getCasesByAnalyticFraction();
		}, 100);
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		// Debounce resize events to avoid excessive redrawing
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => {
			this.redrawCharts();
		}, 250);
	}

	private resizeTimeout: any;

	private redrawCharts() {
		console.log('Redrawing charts due to window resize');
		
		// Clear existing charts completely
		d3.select("#analyticalFractionChart").selectAll("*").remove();
		d3.select("#expCountChart").selectAll("*").remove();
		d3.select("#diseaseTypesChart").selectAll("*").remove();
		
		// Remove any lingering tooltips
		d3.selectAll('.bar-chart-tooltip').remove();
		d3.selectAll('.charts-tooltip').remove();
		
		// Redraw charts with current data
		setTimeout(() => {
			if (this.analyticalFractionschartDataArr && this.analyticalFractionschartDataArr.length > 0) {
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
				this.createD3BarChart(dataJSON);
			}
			
			if (this.experimentStrategyChartDataArr && this.experimentStrategyChartDataArr.length > 0) {
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
				this.createD3BarChart(dataJSON);
			}
			
			// Redraw pie chart if data exists
			if (this.diseasesData && this.diseasesData.length > 0) {
				this.diseaseTypesChart = this.createD3PieChart(this.diseasesData);
			}
		}, 100);
	}

	//@@@PDC-Chart-Click: Handle chart bar clicks to properly apply filters and update all charts
	onChartBarClick(chartName: string, filterValue: string) {
		console.log('=== PIE/BAR CHART CLICK DETECTED ===');
		console.log('Chart clicked:', chartName);
		console.log('Filter value:', filterValue);
		console.log('Current context (this):', this);

		// Map chart names to filter field names
		const chartToFilterMap = {
			'analytical fractions': 'analytical_fraction',
			'experiment types': 'experiment_type',
			'disease type': 'disease_type'
		};

		const filterField = chartToFilterMap[chartName];
		if (!filterField) {
			console.error('Unknown chart name:', chartName);
			return;
		}

		// Create the filter string in the expected format
		const filterString = `${filterField}:${filterValue}`;
		console.log('Filter string created:', filterString);
		console.log('Current filters before update:', this.newFilterSelected);

		// Update the filter state immediately
		this.newFilterSelected[filterField] = filterValue;
		console.log('Updated filter state:', this.newFilterSelected);

		// Emit to parentCharts for the filter component
		this.parentCharts.next(filterString);
		console.log('Emitted to parentCharts');

		// Apply the filter and update all charts
		setTimeout(() => {
			console.log('Calling onFilterSelected to update all charts...');
			this.onFilterSelected(filterString);
		}, 50); // Reduced delay for quicker response

		console.log('onChartBarClick completed');
	}

}
