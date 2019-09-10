import { Inject, Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatList } from '@angular/material';

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
              private route: ActivatedRoute, private router: Router) {
	//@@@PDC-374 - assign auxiliary urls to overlay windows 	
	// There is an unresolved issue: Parentheses remains in URL when child auxiliary route outlet path is set to null
	// https://github.com/angular/angular/issues/24656, therefore need this line of code to avoid still having auxiliary url
	this.router.navigate([{outlets: {'studySummary': null}}], { queryParamsHandling: "merge" });
    this.vis_element_refs = [];
    this.route.queryParams.subscribe(params => {
      this.study_name = params['StudyName'];
  });
  }

  onSelect(file_location: string, row_name: string, col_name: string, title: string) {
    this.selectedMapFile = file_location;
    this.selectedRowName = row_name;
    this.selectedMapTitle = title;
    this.selectedColName = col_name;
    
    window.scrollTo(0, 0);
  }
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
        if ( 'children' in aMap ) {
          const newMenu = [];
          console.log(aMap);
          console.log('Parent Label:' + aMap['menu-label']);
          const parent_label = aMap['menu-label'];
          this.map_files.push({
              label: parent_label,
              filename: '',
              location: '',
              isParent: true,
              colName: '',
              rowName: '',
              tooltip: ''
          });
          for (let i = 0; i < aMap['children'].length; i++) {
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
          this.menuList.set(aMap['menu-label'], newMenu);
        } else {
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
      });
        // Display the first heatmap
        
      this.onSelect(this.map_files[1].location, this.map_files[1].rowName, this.map_files[1].colName,
        this.map_files[1].label);
        window.scrollTo(0, 0);
    });
  }
  
}
