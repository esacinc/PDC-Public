import { Component, OnInit, ViewChild  } from '@angular/core';
//import {Http} from '@angular/http';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import { TissueSite, Disease, AllCasesData, SunburstData } from '../../types';
import { DomSanitizer } from '@angular/platform-browser';

import { FrontPageService } from '../front-page.service'; // Apollo client queries to graphql server
import { HumanBodyChartComponent } from './human-body-chart/human-body-chart.component';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-front-page',
    templateUrl: './front-page.component.html',
    styleUrls: ['../../../assets/css/global.css', './front-page.component.scss', './human-body-chart/human-body-chart.component.css'],
    providers: [FrontPageService],
    standalone: false
})

// @@@PDC-168 The landing page for the PDC Node provides a summary view of the data that is in
// the PDC database.
//@@@PDC-447 - angular-highcharts module changed their chart structure from "_options" to "options"
//@@@PDC-621 - Populate sunburst chart with data from new uiSunburst API
//@@@PDC-638 - data missing in sunburst graph and change root node name
//@@@PDC-778 - Sunburst center tooltip issue
//@@@PDC-1035 - add PepQuery link to tools section
//@@@PDC-1119: Make the disease types table on the home page clickable
//@@@PDC-1184 - PDC review and testing processes presentation
//@@@PDC-1214 - add human body image instead of sunburst chart
//@@@PDC-1301 Move 'Other' disease type to bottom on home page
export class FrontPageComponent implements OnInit {

  tissueSites: Observable<TissueSite[]>;
  diseasesData: Observable<Disease[]>;
  diseasesDataArr: Disease[]=[];
  casesData: Observable<SunburstData[]>;
  diseasesTotalCounts: Disease[] = [];
  newsItems: any[];
  //@@PDC-5628 - release json
  releaseItems: any[];
  dictionary_url = '/pdc/data-dictionary';
  //harmonization_url = environment.dictionary_base_url + 'harmonization.html';
  pepquery_url = environment.pepquery_url;
  apidocumentation_url = '/pdc/api-documentation';
  submission_portal_docs_url = environment.submission_portal_docs_url;
  tissuesChart: any;
  casesChart: any;
  programsCounter = 0;
  projectsCounter = 0;
  colors: string[] = [];
  //@ViewChild(HumanBodyChartComponent) humanBodyComp:HumanBodyChartComponent;

  constructor(private apollo: Apollo, private sanitizer: DomSanitizer,
				private frontPageService: FrontPageService) { //, private http: Http) {
	this.getTissueSitesData();
	this.getDiseasesData();
	//this.getSunburstChart();
	this.readNewsItems();
  this.readReleaseItems();
	//this.humanBodyComp.createHumanBody();
  }
  getSubmissionPortalDocsURL() {
    return this.sanitizer.bypassSecurityTrustUrl(this.submission_portal_docs_url);
  }
  private readNewsItems() {
    this.frontPageService.getNewsItems().subscribe((data: any) => {
	    //PDC-447 - new Angular 6 GET returns data in JSON format automatically, so no need for JSON.parse
      //PDC-5628 - news json apply display value in order to limit what is displayed as more values added over time
      var newsItemsArray = [];
      for (let i = 0; i < data['news'].length; i++){
        if(data['news'][i]['visible']){
          newsItemsArray.push(data['news'][i]);
        }
      }
      this.newsItems = newsItemsArray;
    });

  }
  private readReleaseItems() {
    this.frontPageService.getReleaseItems().subscribe((data: any) => {
	    //PDC-5628 - add values from new release json file
      var releaseItemsArray = [];
      for (let i = 0; i < data['releases'].length; i++){
        if(data['releases'][i]['visible']){
           releaseItemsArray.push(data['releases'][i]);
        }
      }
      this.releaseItems = releaseItemsArray;
    });

  }

  //Get data for the pie chart
  //@@@PDC-223
  getTissueSitesData() {
    this.frontPageService.getTissueSites().subscribe((data: any) => {
      this.tissueSites = data.uiTissueSiteCaseCount;
     // this.makeColorsRadial();
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
			this.diseasesTotalCounts.sort(this.compareDiseases);
	  });
  }

  //PDC-1301 Move 'Other' disease type to bottom on home page
  //Helper function compares diseases for alphabethical sort
  // and moves 'Other' disease to the bottom of the list
  compareDiseases(disease1, disease2){
	var return_val = 0;
	if (disease1.disease_type > disease2.disease_type) return_val = 1;
	if (disease1.disease_type < disease2.disease_type) return_val = -1;
	if (disease1.disease_type == 'Other') return_val = 1;
	if (disease2.disease_type == 'Other') return_val = -1;
	return return_val;
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

  public encodePDCURI(url:string): string{
	return url.replace('/','_slash');
  }

  ngOnInit() {
  }

}
