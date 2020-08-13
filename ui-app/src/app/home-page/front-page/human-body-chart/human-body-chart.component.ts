import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import createHumanBody from './createHumanBody';
import { FrontPageService } from '../../front-page.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HumanbodyImageData } from '../../../types';

@Component({
  selector: 'app-human-body-chart',
  templateUrl: './human-body-chart.component.html',
  styleUrls: ['./human-body-chart.component.scss', './human-body-chart.component.css'],
  providers: [ FrontPageService ]
})
//@@@PDC-1214 - Replace the sunburst chart with the human body image with drill down
//@@@PDC-2021 - add major primary site feature
//@@@PDC-2278 - handling "Other", "Not Reported", null records for bar chart next to human body figure
export class HumanBodyChartComponent implements OnInit {
  dataSetsForHumanBody: HumanbodyImageData[];
  humanBodyAPIData:any;
  //@Output() selectedFilters = new EventEmitter<string>(); //this variable will propagate filter selection changes to parent component
  selectedFilters = '';
  tickInterval:number;
  numberofOrgans:number;
  primarySites = [];
  
  constructor(private router: Router, private frontPageService: FrontPageService) {}

  ngOnInit() {
    // Redraw filter charts on datasets and home pages upon filter selection
    this.generateHumanBody();
  }

  generateHumanBody(selectedFilters = '') { 
    const root = document.getElementById('human-body-root');
    // Have human body map stay highlighted after selection
    var selectedHumanBodyOrgans = "";
    if (selectedFilters['primary_site'] != '') {
      selectedHumanBodyOrgans = selectedFilters['primary_site'];
    }
    this.frontPageService.getDataForHumanBody().subscribe((data: any) =>{
		console.log(data);
		this.dataSetsForHumanBody = data.uiPrimarySiteCaseCount;
        //this.numberofOrgans = this.dataSetsForHumanBody.length;
        const humanBodyImgData = this.dataSetsForHumanBody
        .map(({ major_primary_site, cases_count, primarySites}) => ({
			_key: major_primary_site || "Other",
			_count: cases_count,
			_primary_sites_filters: primarySites.join('|')	
        }))
        .sort((a, b) => (a._key > b._key ? 1 : -1));
		//PDC-2278 No "Other", "Not Reported" or null bars should appear on the bar chart next to human body figure
		//Therefore we remove these from the data
	    var otherIndex = humanBodyImgData.findIndex(x => x._key === "Other");
	    if (otherIndex > -1) {
		  humanBodyImgData.splice(otherIndex, 1);
	    }
	    otherIndex = humanBodyImgData.findIndex(x => x._key === "Not Reported");
		if (otherIndex > -1) {
		  humanBodyImgData.splice(otherIndex, 1);
	    }
		//Calculate number of organs/bars in the bar chart based on data post processing -  
		//after removing null, not reported, other records
		this.numberofOrgans = humanBodyImgData.length;
      // Body map on study list doesn't show x-axis when genomic/imaging checkboxes checked
      // Set the default tick interval as 50. Calculate the median only for data with counts < 50.
      this.tickInterval = 100;
      let counts = humanBodyImgData.map(x => x['_count']);
      counts.sort((a, b) => a - b);
      let maxOfCounts = Math.max.apply(Math, counts);
      // Set the median as tick interval only if the max count < 50 ie; for lower count range of data
      if (maxOfCounts < 100) {
        // Calculate median of all counts and set it as tick interval if its less than 50
        let medianOfCounts = Math.round((counts[(counts.length - 1) >> 1] + counts[counts.length >> 1]) / 2);
        if (medianOfCounts < 50) this.tickInterval = medianOfCounts;
      }
      // Generate human body image with mapping.
	  console.log(humanBodyImgData);
	  console.log(selectedHumanBodyOrgans);
      let that = this;
      createHumanBody({
        title: '',
        selector: '#human-body-root',
        width: 320,
        height: 435,
        tickInterval: that.tickInterval,
        offsetLeft: root.offsetLeft,
        offsetTop: root.offsetTop,
        data: humanBodyImgData,
        selectedHumanBodyOrgans: selectedHumanBodyOrgans,
        numberofOrgansFromAPI: that.numberofOrgans,
        clickHandler: function(selectedOrgan: any) {
          //that.selectedFilters.emit(selectedOrgan['_key']);
          let key = selectedOrgan['_key']; 
          if(selectedOrgan['_key'] == 'Other'){
            key = 'Not Reported';
          }
		  var url = "/browse/filters/primary_site:" + key;
		  console.log("URL: " + url);
		  that.router.navigateByUrl(url);
        }
      }); 
    });
  }
}
