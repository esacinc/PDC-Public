import { Inject, Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap} from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatList } from '@angular/material';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';
import * as d3 from 'd3';


import {environment} from '../../../environments/environment';

import { AnalysisService } from '../analysis.service';

const SERVER_URL = environment.server_url_local;
@Component({
  selector: 'app-heatmap-viewer',
  templateUrl: './heatmap-viewer.component.html',
  styleUrls: ['./heatmap-viewer.component.scss']
})
export class HeatmapViewerComponent implements OnInit {

  obs_analysis_id: Observable<string>;
  study_name: string;
  analysis_id: string;
  map_files: any[];
  heatmapData: any;
  landingPages: any[];
  default_analysis_label: string;
  menuList: any;
  filename:string = "";

  d3: any;
  vis_element_refs: ElementRef[];

  client: XMLHttpRequest;
  responseText: string;
  heatmapContent: any;
  selectedMapFile = '';
  selectedMapTitle = '';
  selectedColName = '';
  selectedRowName = '';
  constructor( @Inject(DOCUMENT) private document: any, private analysisService: AnalysisService,
              private loc:Location, private route: ActivatedRoute, private router: Router) {
	//@@@PDC-374 - assign auxiliary urls to overlay windows 	
	// There is an unresolved issue: Parentheses remains in URL when child auxiliary route outlet path is set to null
	// https://github.com/angular/angular/issues/24656, therefore need this line of code to avoid still having auxiliary url
	this.router.navigate([{outlets: {'studySummary': null}}], { queryParamsHandling: "merge", skipLocationChange: true });
    this.vis_element_refs = [];
    this.route.queryParams.subscribe(params => {
      this.study_name = params['StudyName'];
	  this.filename = params['filename'] || "";
	});
	console.log(this.filename);
	this.analysis_id = this.route.snapshot.paramMap.get('id');
	//@@@PDC-2126 - fix having to click on Back button twice to navigate back to Browse page
    this.loc.replaceState("/analysis/" + this.analysis_id + "?StudyName=" + this.study_name);
  }

  onSelect(file_location: string, row_name: string, col_name: string, title: string) {
    this.selectedMapFile = file_location;
    this.selectedRowName = row_name;
    this.selectedMapTitle = title;
    this.selectedColName = col_name;
    
    window.scrollTo(0, 0);
  }
  
  //@@@PDC-3724 add handling for heatmap request from "Explore Quantitation Data" page (single map file passed as parameter)
  //@@@PDC-3804 process heatmap files for "Label Free" experiment type
  ngOnInit() {
    this.landingPages = [];
    this.map_files = [];
    this.menuList = new Map();
    this.analysis_id = this.route.snapshot.paramMap.get('id');
    const server_url = 'assets/data-folder/' + this.analysis_id;
    const manifest_file = server_url + '/manifest.json';
    this.default_analysis_label = '';
    d3.json(manifest_file).then((data: any) => {
      data.heatmaps.map(aMap => {
		 console.log(aMap);
        if ( 'children' in aMap ) {
		  let parentPushFlag = false;
		  if (this.filename == ""){
			  parentPushFlag = true;
		  //If a filename was passed from heatmaps page, make sure to add a parent only for the specific file
		  } else {
			  for (var i = 0; i < aMap['children'].length; i++) {
				  if (this.filename == aMap['children'][i].filename) {
					  parentPushFlag = true;
				  }
			  }
		  }
          const newMenu = [];
          console.log('Parent Label:' + aMap['menu-label']);
          const parent_label = aMap['menu-label'];
		  if (parentPushFlag) {
			  this.map_files.push({
				  label: parent_label,
				  filename: '',
				  location: '',
				  isParent: true,
				  colName: '',
				  rowName: '',
				  tooltip: ''
			  });
		  }
          for (let i = 0; i < aMap['children'].length; i++) {
			if ((this.filename != "" && this.filename == aMap['children'][i].filename) || ( this.filename == "")){
				newMenu.push(aMap['children'][i]);
				this.map_files.push({
				  label: aMap['children'][i]['menu-label'],
				  filename: aMap['children'][i].filename,
				  location: 'assets/data-folder/' + this.analysis_id + '/' + aMap['children'][i].filename,
				  colName: aMap['children'][i]['col-header'],
				  rowName: aMap['children'][i]['row-header'],
				  tooltip: aMap['children'][i]['tooltip'],
				  isParent: false
				});
			}
          }
          this.menuList.set(aMap['menu-label'], newMenu);
        } else {
			if ((this.filename != "" && this.filename == aMap.filename) || ( this.filename == "")){
			  // This is an error - all menu items must have "children" attributes
			  this.menuList.set(aMap['menu-label'], aMap);
			  this.map_files.push({label: aMap['menu-label'],
				  filename: aMap.filename,
				  location: 'assets/data-folder/' + this.analysis_id + '/' + aMap.filename,
				  colName: aMap['col-header'],
				  rowName: aMap['row-header'],
				  tooltip: aMap['tooltip'],
				  parentLabel: ''
				});
			}
        }
      });
	  console.log(this.map_files);
        // Display the first heatmap
        
      this.onSelect(this.map_files[1].location, this.map_files[1].rowName, this.map_files[1].colName,
        this.map_files[1].label);
        window.scrollTo(0, 0);
    });
  }
  
}
