import { Component, OnInit } from '@angular/core';
//import {Http} from '@angular/http';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import { TissueSite, Disease, AllCasesData, SunburstData } from '../../types';
import { Chart } from 'angular-highcharts';
import { DomSanitizer } from '@angular/platform-browser';

import { FrontPageService } from '../front-page.service'; // Apollo client queries to graphql server
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['../../../assets/css/global.css', './front-page.component.scss'],
  providers: [ FrontPageService]
})

// @@@PDC-168 The landing page for the PDC Node provides a summary view of the data that is in 
// the PDC database. 
//@@@PDC-447 - angular-highcharts module changed their chart structure from "_options" to "options"
//@@@PDC-621 - Populate sunburst chart with data from new uiSunburst API
//@@@PDC-638 - data missing in sunburst graph and change root node name
//@@@PDC-778 - Sunburst center tooltip issue
//@@@PDC-1035 - add PepQuery link to tools section
export class FrontPageComponent implements OnInit {

  tissueSites: Observable<TissueSite[]>;
  diseasesData: Observable<Disease[]>;
  diseasesDataArr: Disease[]=[];
  casesData: Observable<SunburstData[]>;
  diseasesTotalCounts: Disease[] = [];
  newsItems: any[];
  dictionary_url = environment.dictionary_base_url + 'dictionary.html';
  harmonization_url = environment.dictionary_base_url + 'harmonization.html';
  pepquery_url = environment.pepquery_url;
  apidocumentation_url = environment.dictionary_base_url + 'apidocumentation.html';
  submission_portal_docs_url = environment.submission_portal_docs_url;
  tissuesChart: any;
  casesChart: any;
  programsCounter = 0;
  projectsCounter = 0;
  pieChart: Chart;
  sunburstChart: Chart;
  colors: string[] = [];
  
  constructor(private apollo: Apollo, private sanitizer: DomSanitizer,
				private frontPageService: FrontPageService) { //, private http: Http) { 
	this.tissuesChart = this.createPieChart();
	this.casesChart = this.createSunburstChart();
	this.getTissueSitesData();
	this.getDiseasesData();
	this.getSunburstChart();
	this.readNewsItems();
  }
  getSubmissionPortalDocsURL() {
    return this.sanitizer.bypassSecurityTrustUrl(this.submission_portal_docs_url);
  }
  private readNewsItems() {
    this.frontPageService.getNewsItems().subscribe((data: any) => {
	  //PDC-447 - new Angular 6 GET returns data in JSON format automatically, so no need for JSON.parse
      this.newsItems = data['news'];
    });

  }
  createPieChart(): any {
    
	  this.pieChart = new Chart({
      chart: {
        type: 'pie',
        margin: 0,
        height: '30%',
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
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  fontFamily: 'Lato',
                  fontSize: '12px',
                  color: '#585858'
                }
            },
            
            innerSize: '50%',
            colors: ['#FF9F31', '#FFD03C', '#407185', '#588897',
                    '#7BA2AF', '#F9EB36', '#65A5C8', '#67C4E2', '#71E2E8',  '#72E0C0',
                  '#91F7AB', '#A1F5F2', '#C3F968',   ],
        }
      },
      series: [{
		  name: 'Case count',
		  data: []
	  }]
    });
    return this.pieChart;
  }

  createSunburstChart(): any {
	  var sunburstData = [];
	  this.sunburstChart = new Chart(<any>{
      chart: {
        type: 'sunburst',
        margin: 0,
        height: '90%',
      },
      
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
	  colors: ['#FFFFFF', '#FF9F31', '#91F7AB',  '#65A5C8', '#FFD03C', '#5DAEAE', '#F9EB36',  '#71E2E8', '#E07292', '#72E0C0', '#B0ADFF'],
	  //white, orange, bright green,  blue, gold, teal, yellow, aqua, pig-pink,  green-blue, lavender
	  plotOptions: {
		series: {
			//allowDrillToNode: true,
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.percentage:.1f} %',
				align: 'center',
                style: {
                  fontFamily: 'Lato',
                  fontSize: '12px',
                  //color: '#080808',
				  color: '#FFFFFF',
				  textOutline: false,
				  fontWeight: 'normal', 
				  verticalAlign: 'top',
                }
            },
            colors: ['#FF9F31', '#FFD03C', '#407185', '#F9EB36', '#65A5C8', '#71E2E8',  '#72E0C0', '#91F7AB'],
        },
		sunburst: {
			borderWidth: 6,
			borderColor: '#FFFFFF',
			levelSize: {
                unit: 'percentage',
                value: 22
            }
		}
      },
      series: [{
		type: 'sunburst',
        data: sunburstData,
        allowDrillToNode: true,
        cursor: 'pointer',
        dataLabels: {
            format: '{point.name}',
            filter: {
                property: 'innerArcLength',
                operator: '>',
                value: 16
            }
        },
		lang: {
			thousandsSep: '\u002C'
		},  
		tooltip: {
			pointFormatter: function(){
                return '<b>' + this.info + '</b>: ' + this.value.toLocaleString();
			}
		},
        levels: [{
					level: 1,
					levelIsConstant: false,
					//levelIsConstant: true,
					dataLabels: {
						format: '{point.name}',
						filter: {
							property: 'outerArcLength',
							operator: '>',
							value: 64
						},
						y: -10,
						style: {
							color: '#080808',
							fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
							fontSize: '12px'
						}
					},
					
				}, {
					level: 2,
					colorByPoint: true
				}, {
					level: 3,
					colorVariation: {
						key: 'brightness',
						to: -0.5
					}
				}, {
					level: 4,
					colorVariation: {
						key: 'brightness',
						to: 0.5
					}
				}, {
					level: 5,
					colorVariation: {
						key: 'brightness',
						to: -0.5
					}
				}
			] // end levels
	  }] //end series
    });
    return this.sunburstChart;
  }

  //Get data for the pie chart
  //@@@PDC-223
  getTissueSitesData() {
    this.frontPageService.getTissueSites().subscribe((data: any) => {
      this.tissueSites = data.uiTissueSiteCaseCount;
      this.tissuesChart = this.createPieChart();
     // this.makeColorsRadial();

      for (let idx = 0; idx < data.uiTissueSiteCaseCount.length; idx++) {
			  this.tissuesChart.options.series[0].data.push({name: this.tissueSites[idx].tissue_or_organ_of_origin,
            y: parseInt(this.tissueSites[idx].cases_count, 0)});
      }
      console.log(this.tissuesChart.options.plotOptions.pie.colors);
  });
  }
  //Get all diseases and their total counts
  getDiseasesData() {
	  this.frontPageService.getDiseases().subscribe((data: any) =>{
		  this.diseasesData = data;
		  this.diseasesDataArr = data;
		  //Get total counts for each disease and store this data diseasesTotalCounts list
		  for (let idx = 0; idx < data.length; idx++){
			  var counter_idx = this.isDiseaseInArray(this.diseasesTotalCounts, data[idx].disease_type);
			  if (counter_idx === -1) {
				  this.diseasesTotalCounts.push({disease_type: String(data[idx].disease_type), 
												 tissue_or_organ_of_origin: '',
												 project_submitter_id: '',
												 cases_count: parseInt(data[idx].cases_count)});
			  } else {
				  this.diseasesTotalCounts[counter_idx].cases_count += parseInt(data[idx].cases_count);
			  }
		  }
			console.log(this.diseasesData);
			this.diseasesTotalCounts.sort((disease1:Disease,disease2:Disease) => (disease1.disease_type > disease2.disease_type) ? 1 : ((disease1.disease_type < disease2.disease_type) ? -1 : 0)); 
	  });  
  }
  
  
  //PDC-621 - Populate sunburst chart with data from new uiSunburst API
  //PDC-638 - data missing in sunburst graph and change root node name
  getSunburstChart(){
	this.frontPageService.getSunburstChartData().subscribe((data: any) => {
		this.casesData = data.uiSunburstChart;
		
		//Populate first levels of sunburst chart
		this.casesChart = this.createSunburstChart();
		//initialize the 0 level for sunburst chart
		//Needed to add "info" field to display tooltip correctly
		this.casesChart.options.series[0].data.push({
			id: 'All samples',
			parent: '',
			name: 'All<br>Sample<br>Types',
			info: 'All Sample Types'
		});
		//populate level 1 for sunburst chart - disease type
		for (let diseaseData of data.uiSunburstChart){
			let id = diseaseData.disease_type + '-disease_type' //attaching a field name since different fields might have similar names like disease: normal and sample: normal
			let index = this.isElementInArray(this.casesChart.options.series[0].data, id, 'All samples');
			if (index === -1) {
				this.casesChart.options.series[0].data.push({
					id: id,
					parent: 'All samples',
					name: diseaseData.disease_type,
					info: diseaseData.disease_type
				});
			}
		}
		//populate level 2 for sunburst chart - tissue type
		for (let diseaseData of data.uiSunburstChart){
			//added disease_type to id, so that the same organs but different diseases would be treated as different nodes in the data tree
			let id = diseaseData.tissue_or_organ_of_origin + '-tissue_or_organ_of_origin-' + diseaseData.disease_type;
			let parent_node = diseaseData.disease_type + '-disease_type';
			let index = this.isElementInArray(this.casesChart.options.series[0].data, id, parent_node);
			if (index === -1) {
				this.casesChart.options.series[0].data.push({
					id: id,
					parent: parent_node,
					name: diseaseData.tissue_or_organ_of_origin,
					info: diseaseData.tissue_or_organ_of_origin
					//value: diseaseData.cases_count
				});
			}
		}
		//populate level 3 for sunburst chart - sample type
		for (let caseData of data.uiSunburstChart ){
			let id = caseData.sample_type + '-sample_type';
			let parent_node = caseData.tissue_or_organ_of_origin + '-tissue_or_organ_of_origin-' + caseData.disease_type;
			let index = this.isElementInArray(this.casesChart.options.series[0].data, id, parent_node);
			if (index === -1) {
				this.casesChart.options.series[0].data.push({
					id: id,
					parent: parent_node,
					name: caseData.sample_type,
					info: caseData.sample_type,
					value: caseData.cases_count
				});
			}
			else {
				this.casesChart.options.series[0].data[index].value  += parseInt(caseData.cases_count);
			}
		}
		console.log(this.casesData);
		console.log(this.casesChart.options.series[0]);
	});
  }
  
  //Check if element is already found in array
  private isElementInArray(array, element_name:string, parent_element: string): number {
		//console.log("element name: " + element_name + " parent element: " + parent_element);
		//console.log(array);
		for (let i = 0; i < array.length; i ++ ){
			if (array[i].id === element_name) {
				if (parent_element != '') {
					if (parent_element === array[i].parent) {
						return i;
					}
				}
				else {
					return i;
				}
			}
		}
		return -1;
  }
 
  //Check if a disease name already exists in the list
  private isDiseaseInArray(array, disease: string): number{
	  for (var i = 0; i < array.length; i++){
		  if (array[i].disease_type === disease ) {
			  return i;
		  }
	  }
	  return -1;
  }

  ngOnInit() {
  }

}
