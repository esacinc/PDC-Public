import { Inject, Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit, 
  OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.js';


@Component({
selector: 'app-heat-map',
templateUrl: './heat-map.component.html',
styleUrls: ['./heat-map.component.scss']
})
export class HeatMapComponent implements OnInit, AfterViewInit, OnChanges {
@Input() map_file: Observable<string>;
@Input() title: string;
@Input() colName: string;
@Input() rowName: string;
Morpheus: any;
landingPage: any;
loading = true;
d3: any;
min_heatmap_value: number;
max_heatmap_value: number;
client: XMLHttpRequest;
responseText: string;
pageTitle: string;
heatmapContent: any;
// This is the location of the HTML file which displays the heatmap
url: string // This is the location of the HTML file which displays the heatmap
@ViewChild('vis') vis: ElementRef;

constructor(@Inject(DOCUMENT) private document: any, private route: ActivatedRoute, private http: HttpClient) {
   // this.landingPage = new Morpheus.LandingPage(this.document);
   // this.heatmapContent = '';
   console.log('Map file is:' + this.map_file);
   this.loading = true;
   console.log('URL: ', this.url);
  }

  public loadFiles(fileData) {
    console.log(fileData);
  }
  
  getFileContent(fname: any, rowLabel: string, colLabel: string) {
    console.log('File content changed:', fname);
    if ( fname && fname.length > 1 ) {
      this.url = environment.heatmap_url + this.map_file;
      console.log('URL: ', this.url);
     //  this.openFile(fname, rowLabel, colLabel);
     //  return this.http.get(fname, { responseType: 'text'});
    }
  }

  openFile(fname: string, rowLabel: string, colLabel: string) {
    this.loading = true;
    this.url = environment.heatmap_url + this.map_file;

  }
  ngOnChanges(changes: SimpleChanges) {
    const mapFile: SimpleChange = changes.map_file;
    this.getFileContent(mapFile.currentValue, this.rowName, this.colName);
  }

  ngOnInit() {
  
    this.getFileContent(this.map_file, this.rowName, this.colName);

    window.scroll(0, 0);

  }
  ngAfterViewInit() {
  // console.log('Map file:' + this.map_file);
  document.body.scrollTop = 0;
  this.getFileContent(this.map_file, this.rowName, this.colName);
  this.loading = false;
  this.route.paramMap.pipe(
    switchMap((params: ParamMap) => {
     // this.openFile(params.get('map_file'), params.get('rowname'), params.get('colname'));
      return new Observable();
    })
  );
}

}
