import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import { GenePageService } from '../gene-page.service';
import { Observable } from 'rxjs';
//import OncoprintJS, { TrackId, CustomTrackOption } from 'oncoprintjs';
import { GeneAliquotSpectralCountDataPaginated, GeneAliquotSpectralCountData } from '../../types';

@Component({
    selector: 'app-oncoprint',
    templateUrl: './oncoprint.component.html',
    styleUrls: ['./oncoprint.component.scss'],
    standalone: false
})

//@@@PDC-1110

export class OncoprintComponent implements OnInit, OnChanges {

	aliquotSpectralCountsList: GeneAliquotSpectralCountData[];
	loadingAliquotRecords = false;
	aliquotSpectralCountLoadError = '';
	aliquotTotalRecords = 0;
	//newFilterSelected = '';
	dataSetForOncoprint: Observable<GeneAliquotSpectralCountDataPaginated[]>;
	//humanBodyAPIData:any;
	//@Output() selectedFilters = new EventEmitter<string>(); //this variable will propagate filter selection changes to parent component
	positiveMut = '';
	emptyMut = '';
	trackWidth = 2;
	dataForViz:any = [];
	dataByStudy: any = [];
	fullTrackCount = 0;
	@Input() gene_id:string;
	@Input() uuid:string;
	loading = false;
	vizHeight:number = 180;
	vizWidth = 2000;
	newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
								"ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": ""};

	@Input() newFilterValue: any;
	frozenStudyColumn = [{ field: 'study', header: 'Study' }];
	cols = [
		{ field: 'study', header: 'Study' },
		{field:'aliquotData', header: 'Aliquots' }
		];
	isScrollable:boolean = true;

  constructor(private genePageService: GenePageService ) {

	  this.positiveMut = '<rect x="0" y="0" width="' + this.trackWidth +
							'" height="20" fill="rgb(190,190,190)" fill-opacity="1"></rect><rect width="' + this.trackWidth +
							'" height="6.6659999999999995" x="0" y="6.6659999999999995" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-width="0" fill="rgb(153,52,4)" fill-opacity="1"></rect>';
	  this.emptyMut = '<rect width="' + this.trackWidth +
						'" height="20" x="0" y="0" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-width="0" fill="rgb(190,190,190)" fill-opacity="1"></rect>';
  }

  ngOnInit() {
  }

  ngOnChanges(){
	  console.log(this.newFilterValue);
	  if (this.gene_id){

		  this.onFilterSelected();
		  console.log(this.dataByStudy);
	  }
  }

  calculateXPos(idx:number): number {
	 // console.log("x = " + idx + " X = " + (idx % 350) * 6);
	  return idx * 6;
  }

  getGeneAliquotSpectralCounts(){
	  this.loadingAliquotRecords = true;
	  this.aliquotSpectralCountLoadError = '';
	  //removed timout settings since this query sometimes takes a lot of time
	  this.loading = true;
	  //reinitialize array that holds the data
	  this.dataForViz = [];
	  this.dataByStudy = [];
	  this.fullTrackCount = 0;

	  //@@@PDC-7690 use gene_id to get gene info
	  //@@@PDC-10981 increased limit from 10000 to 1000000 to ensure all studies (including PTM studies) are included in visualizer
	  this.genePageService.getAliquotSpectralCount(this.gene_id, this.uuid, 0, 1000000, "", this.newFilterSelected).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCountFiltered.uiGeneAliquotSpectralCounts;
			console.log(this.aliquotSpectralCountsList);
			this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCountFiltered.total;
			this.loadingAliquotRecords = false;
			
			// Calculate viz height once
			this.vizHeight = this.aliquotTotalRecords < 135 ? 30 : Math.round(this.aliquotTotalRecords / 135) * 30;

			// Create a map for faster study lookup and to track study names
			const studyMap = new Map<string, any[]>();
			const studyNames: string[] = [];
			
			// Single pass through data - build everything at once
			for (let idx = 0; idx < this.aliquotSpectralCountsList.length; idx++) {
				const record = this.aliquotSpectralCountsList[idx];
				
				// Pre-parse numeric values once
				const log2_ratio = parseFloat(record.log2_ratio) || 0;
				const precursor_area = parseFloat(record.precursor_area) || 0;
				const unshared_precursor_area = parseFloat(record.unshared_precursor_area) || 0;
				const unshared_log2_ratio = parseFloat(record.unshared_log2_ratio) || 0;
				
				// Check existence flags
				const exists1 = log2_ratio !== 0;
				const exists2 = record.distinct_peptide != "0" && record.distinct_peptide != null;
				const exists3 = record.unshared_peptide != "0" && record.unshared_peptide != null;
				const exists4 = precursor_area !== 0;
				const exists5 = unshared_precursor_area !== 0;
				const exists6 = unshared_log2_ratio !== 0;
				const exists7 = record.spectral_count != "" && record.spectral_count != null && record.spectral_count != "0";

				if (exists1) this.fullTrackCount++;

				const mutData = {
					mut: record.aliquot_id,
					exists0: true,
					exists1: exists1,
					exists2: exists2,
					exists3: exists3,
					exists4: exists4,
					exists5: exists5,
					exists6: exists6,
					exists7: exists7,
					idx: idx,
					log2_ratio: log2_ratio,
					precursor_area: precursor_area,
					unshared_log2_ratio: unshared_log2_ratio,
					unshared_precursor_area: unshared_precursor_area
				};

				this.dataForViz.push(mutData);

				// Group by study
				const studyName = record.submitter_id_name;
				if (!studyMap.has(studyName)) {
					studyMap.set(studyName, []);
					studyNames.push(studyName);
				}
				studyMap.get(studyName).push(mutData);
			}

			console.log('Studies found:', studyNames.length);

			// Convert map to array structure and sort
			let maxWidth = 0;
			for (const studyName of studyNames) {
				const studyData = studyMap.get(studyName);
				studyData.sort(this.compareAliquotData);
				this.dataByStudy.push(studyName);
				this.dataByStudy[studyName] = studyData;
				
				const width = (studyData.length - 1) * 6;
				if (width > maxWidth) maxWidth = width;
			}
			this.vizWidth = maxWidth;

			console.log(this.dataByStudy);

			//@@@PDC-1350 calculate opacity value once instead of calculating values at rendering time.
			// Process opacity values and tooltips in batches for better performance
			for (const studyName of studyNames) {
				const mutList = this.dataByStudy[studyName];
				
				// Pre-calculate min/max values for the entire study to avoid repeated calculations
				const studyMetrics = this.calculateStudyMetrics(mutList);
				
				// Process all mutations for this study
				for (let j = 0; j < mutList.length; j++) {
					const mut = mutList[j];
					
					if (mut.exists1) {
						mut["exists1Value"] = this.calculateNormalizedValue(mut.log2_ratio, studyMetrics.log2_ratio);
					}
					if (mut.exists4) {
						mut["exists4Value"] = this.calculateNormalizedValue(mut.precursor_area, studyMetrics.precursor_area);
					}
					if (mut.exists5) {
						mut["exists5Value"] = this.calculateNormalizedValue(mut.unshared_precursor_area, studyMetrics.unshared_precursor_area);
					}
					if (mut.exists6) {
						mut["exists6Value"] = this.calculateNormalizedValue(mut.unshared_log2_ratio, studyMetrics.unshared_log2_ratio);
					}
					
					// Build tooltip text
					mut["tooltipText"] = this.buildTooltipText(mut);
				}
			}

			this.isScrollable = this.dataByStudy.length > 10;
			this.loading = false;
		  },
		  err => {
			  this.aliquotSpectralCountLoadError = "Loading data took too long, please, close the overlay gene summary window and open it again.";
			  this.loadingAliquotRecords = false;
			  this.loading = false;
		  });

  }
  
  // Helper method to calculate study-wide min/max metrics
  calculateStudyMetrics(mutList: any[]) {
	  const metrics = {
		  log2_ratio: { min: Infinity, max: -Infinity },
		  precursor_area: { min: Infinity, max: -Infinity },
		  unshared_precursor_area: { min: Infinity, max: -Infinity },
		  unshared_log2_ratio: { min: Infinity, max: -Infinity }
	  };
	  
	  for (const mut of mutList) {
		  if (mut.log2_ratio !== 0) {
			  metrics.log2_ratio.min = Math.min(metrics.log2_ratio.min, mut.log2_ratio);
			  metrics.log2_ratio.max = Math.max(metrics.log2_ratio.max, mut.log2_ratio);
		  }
		  if (mut.precursor_area !== 0) {
			  metrics.precursor_area.min = Math.min(metrics.precursor_area.min, mut.precursor_area);
			  metrics.precursor_area.max = Math.max(metrics.precursor_area.max, mut.precursor_area);
		  }
		  if (mut.unshared_precursor_area !== 0) {
			  metrics.unshared_precursor_area.min = Math.min(metrics.unshared_precursor_area.min, mut.unshared_precursor_area);
			  metrics.unshared_precursor_area.max = Math.max(metrics.unshared_precursor_area.max, mut.unshared_precursor_area);
		  }
		  if (mut.unshared_log2_ratio !== 0) {
			  metrics.unshared_log2_ratio.min = Math.min(metrics.unshared_log2_ratio.min, mut.unshared_log2_ratio);
			  metrics.unshared_log2_ratio.max = Math.max(metrics.unshared_log2_ratio.max, mut.unshared_log2_ratio);
		  }
	  }
	  
	  return metrics;
  }
  
  // Helper method to calculate normalized value
  calculateNormalizedValue(value: number, metric: {min: number, max: number}): string {
	  if (metric.min === Infinity || metric.max === -Infinity || metric.max === metric.min) {
		  return "1.00";
	  }
	  const normalizedVal = (value - metric.min) / (metric.max - metric.min);
	  return normalizedVal.toFixed(2);
  }
  
  // Optimized tooltip builder
  buildTooltipText(mut: any): string {
	  const orig_idx = mut.idx;
	  const record = this.aliquotSpectralCountsList[orig_idx];
	  const parts = [mut.mut];
	  
	  if (record.log2_ratio && record.log2_ratio != "") {
		  parts.push(`\n log2_ratio: ${record.log2_ratio}`);
	  }
	  if (record.precursor_area && record.precursor_area != "") {
		  parts.push(`\n precursor_area: ${record.precursor_area}`);
	  }
	  if (record.unshared_precursor_area && record.unshared_precursor_area != "") {
		  parts.push(`\n unshared_precursor_area: ${record.unshared_precursor_area}`);
	  }
	  if (record.unshared_log2_ratio && record.unshared_log2_ratio != "") {
		  parts.push(`\n unshared_log2_ratio: ${record.unshared_log2_ratio}`);
	  }
	  
	  return parts.join('');
  }
  
  compareAliquotData(a, b) {
	  // Use pre-parsed numeric values for faster comparison
	  const aLog2 = a.log2_ratio;
	  const bLog2 = b.log2_ratio;
	  const aPrecursor = a.precursor_area;
	  const bPrecursor = b.precursor_area;
	  
	  // Compare log2_ratio (descending)
	  if (aLog2 !== 0 && bLog2 !== 0) {
		  return bLog2 - aLog2; // Descending order
	  }
	  if (aLog2 !== 0) return -1;
	  if (bLog2 !== 0) return 1;
	  
	  // Compare precursor_area (descending)
	  if (aPrecursor !== 0 && bPrecursor !== 0) {
		  return bPrecursor - aPrecursor; // Descending order
	  }
	  if (aPrecursor !== 0) return -1;
	  if (bPrecursor !== 0) return 1;
	  
	  return 0;
  }

  tooltipText(idx:number):  string{
	var result = "";
	if (this.dataForViz[idx]) {
		result = this.dataForViz[idx].mut;
		if (this.aliquotSpectralCountsList[idx].log2_ratio && this.aliquotSpectralCountsList[idx].log2_ratio != "") {
			result += "\n log2_ratio: " + this.aliquotSpectralCountsList[idx].log2_ratio;
		}
		/* Commenting out 3 columns upon request in tooltip text as well
		if (this.dataForViz[idx].exists2) {
			result += "\n distinct_peptide: " + this.aliquotSpectralCountsList[idx].distinct_peptide;
		}
		if (this.dataForViz[idx].exists3) {
			result += "\n unshared_peptide: " + this.aliquotSpectralCountsList[idx].unshared_peptide;
		}*/
		if (this.aliquotSpectralCountsList[idx].precursor_area && this.aliquotSpectralCountsList[idx].precursor_area != "") {
			result += "\n precursor_area: " + this.aliquotSpectralCountsList[idx].precursor_area;
		}
		if (this.aliquotSpectralCountsList[idx].unshared_precursor_area && this.aliquotSpectralCountsList[idx].unshared_precursor_area != "") {
			result += "\n unshared_precursor_area: " + this.aliquotSpectralCountsList[idx].unshared_precursor_area;
		}
		if (this.aliquotSpectralCountsList[idx].unshared_log2_ratio && this.aliquotSpectralCountsList[idx].unshared_log2_ratio != "") {
			result += "\n unshared_log2_ratio: " + this.aliquotSpectralCountsList[idx].unshared_log2_ratio;
		}
		/*if (this.dataForViz[idx].exists7) {
			result += "\n spectral_count: " + this.aliquotSpectralCountsList[idx].spectral_count;
		}*/
	}
	return result;
  }

  tooltipText2(study: string, idx:any): string{
	  var result = "";
	  if (this.dataByStudy[study][idx]){
		  result = this.dataByStudy[study][idx].mut;
		  var orig_idx = this.dataByStudy[study][idx].idx;
		  if (this.aliquotSpectralCountsList[orig_idx].log2_ratio && this.aliquotSpectralCountsList[orig_idx].log2_ratio != "") {
			result += "\n log2_ratio: " + this.aliquotSpectralCountsList[orig_idx].log2_ratio;
		  }

		  if (this.aliquotSpectralCountsList[orig_idx].precursor_area && this.aliquotSpectralCountsList[orig_idx].precursor_area != "") {
			result += "\n precursor_area: " + this.aliquotSpectralCountsList[orig_idx].precursor_area;
		  }
		  if (this.aliquotSpectralCountsList[orig_idx].unshared_precursor_area && this.aliquotSpectralCountsList[orig_idx].unshared_precursor_area != "") {
			result += "\n unshared_precursor_area: " + this.aliquotSpectralCountsList[orig_idx].unshared_precursor_area;
		  }
		  if (this.aliquotSpectralCountsList[orig_idx].unshared_log2_ratio && this.aliquotSpectralCountsList[orig_idx].unshared_log2_ratio != "") {
			result += "\n unshared_log2_ratio: " + this.aliquotSpectralCountsList[orig_idx].unshared_log2_ratio;
		  }
	  }
	  return result;
  }

  opacityValueByLog2Ratio(study: string, idx:any){

	  var lastIdx = this.dataByStudy[study].length - 1;

	  var minValue = parseFloat(this.dataByStudy[study][lastIdx].log2_ratio);
	  if (minValue == 0 || isNaN(minValue)){
		  for (var i = lastIdx; i > 0; i--){
			  if (parseFloat(this.dataByStudy[study][i].log2_ratio) != 0 && !isNaN(parseFloat(this.dataByStudy[study][i].log2_ratio)) ) {
				  minValue = parseFloat(this.dataByStudy[study][i].log2_ratio);
				  break;
			  }
		  }
	  }
	  var normalizedVal = (parseFloat(this.dataByStudy[study][idx].log2_ratio) - minValue ) / (parseFloat(this.dataByStudy[study][0].log2_ratio) - minValue);
	  return String(normalizedVal.toFixed(2));
  }

  opacityValueByUnsharedLog2Ratio(study: string, idx:any){
	  var lastIdx = this.dataByStudy[study].length - 1;

	  var minValue = parseFloat(this.dataByStudy[study][lastIdx].unshared_log2_ratio);
	  if (minValue == 0 || isNaN(minValue)){
		  for (var i = lastIdx; i > 0; i--){
			  if (parseFloat(this.dataByStudy[study][i].unshared_log2_ratio) != 0 && !isNaN(parseFloat(this.dataByStudy[study][i].unshared_log2_ratio)) ) {
				  minValue = parseFloat(this.dataByStudy[study][i].unshared_log2_ratio);
				  break;
			  }
		  }
	  }
	  var normalizedVal = (parseFloat(this.dataByStudy[study][idx].unshared_log2_ratio) - minValue ) / (parseFloat(this.dataByStudy[study][0].unshared_log2_ratio) - minValue);
	  return String(normalizedVal.toFixed(2));
  }
  opacityValueByPrecursorArea(study: string, idx:any){
	  var lastIdx = this.dataByStudy[study].length - 1;
	  var minValue = parseFloat(this.dataByStudy[study][lastIdx].precursor_area);
	  if (minValue == 0 || isNaN(minValue)){
		  for (var i = lastIdx; i > 0; i--){
			  if (parseFloat(this.dataByStudy[study][i].precursor_area) != 0 && !isNaN(parseFloat(this.dataByStudy[study][i].precursor_area))) {
				  minValue = parseFloat(this.dataByStudy[study][i].precursor_area);
				  break;
			  }
		  }
	  }
	  var normalizedVal = (parseFloat(this.dataByStudy[study][idx].precursor_area) - minValue) / (parseFloat(this.dataByStudy[study][0].precursor_area) - minValue);
	  return String(normalizedVal.toFixed(2));
  }
  opacityValueByUnsharedPrecursorArea(study: string, idx:any){
	  var lastIdx = this.dataByStudy[study].length - 1;
	  var normalizedVal = (this.dataByStudy[study][idx].unshared_precursor_area - this.dataByStudy[study][lastIdx].unshared_precursor_area) / (this.dataByStudy[study][0].unshared_precursor_area - this.dataByStudy[study][lastIdx].unshared_precursor_area);
	  return normalizedVal;
  }

  onFilterSelected() {
	console.log(this.newFilterValue);
	if (this.newFilterValue){
		//var filter_field=this.newFilterValue.split(":"); //the structure is field_name: "value1;value2"
	  //@@@PDC-5428 fix study name truncation issue
	  var filter_field = [];
	  filter_field.push(this.newFilterValue.substring(0, this.newFilterValue.indexOf(":")));
	  filter_field.push(this.newFilterValue.substring(this.newFilterValue.indexOf(":")+1));
		//If clear all filter selection button was pressed need to clear all filters
		if (filter_field[0] === "Clear all selections"){
			for (let filter_name in this.newFilterSelected){
				this.newFilterSelected[filter_name] = "";
			}
		}
		else if (filter_field[0] === "Clear all clinical filters selections"){
			this.newFilterSelected["ethnicity"] = ""
			this.newFilterSelected["race"] = "";
			this.newFilterSelected["gender"] = "";
			this.newFilterSelected["tumor_grade"] = "";
		}
		else if (filter_field[0] === "Clear all general filters selections"){
			this.newFilterSelected["program_name"] = "";
			this.newFilterSelected["project_name"] = "";
			//this.newFilterSelected["study_name"] = "";
			this.newFilterSelected["disease_type"] = "";
			this.newFilterSelected["primary_site"] = "";
			this.newFilterSelected["analytical_fraction"] = "";
			this.newFilterSelected["experiment_type"] = "";
			this.newFilterSelected["acquisition_type"] = "";
		}
		else if (filter_field[0] === "Clear all biospecimen filters selections"){
			this.newFilterSelected["sample_type"] = "";
			this.newFilterSelected["study_name"] = "";
		}
		else if(filter_field[0] === "Clear all file filters selections"){
			this.newFilterSelected["data_category"] = "";
			this.newFilterSelected["file_type"] = "";
			this.newFilterSelected["access"] = "";
		}
		else if (filter_field[0] === "Clear all genes filters selections"){
			this.newFilterSelected["study_name"] = "";
		}
		else {
			this.newFilterSelected[filter_field[0]] = filter_field[1];
		}
	}
	console.log(this.newFilterSelected);
	this.getGeneAliquotSpectralCounts();
  }
}
