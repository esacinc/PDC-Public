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
	  console.log("Gene name: " + this.gene_id);
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
		  console.log("Gene name: " + this.gene_id);
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
	  console.log("Gene name/id used to get aliquot: "+this.gene_id+"-"+this.uuid);
	  //@@@PDC-7690 use gene_id to get gene info
	  this.genePageService.getAliquotSpectralCount(this.gene_id, this.uuid, 0, 10000, "", this.newFilterSelected).subscribe((data: any) =>{
			this.aliquotSpectralCountsList = data.getPaginatedUIGeneAliquotSpectralCountFiltered.uiGeneAliquotSpectralCounts;
			console.log(this.aliquotSpectralCountsList);
			this.aliquotTotalRecords = data.getPaginatedUIGeneAliquotSpectralCountFiltered.total;
			this.loadingAliquotRecords = false;
			var idx = 0;
			if (this.aliquotTotalRecords < 135) {
				this.vizHeight = 30;
			} else {
				this.vizHeight = Math.round(this.aliquotTotalRecords / 135) * 30;
			}
			console.log("Height: " + this.vizHeight);
			for (var record of this.aliquotSpectralCountsList){
				var exists0 = true;
				var exists1 = false;
				var exists2 = false;
				var exists3 = false;
				var exists4 = false;
				var exists5 = false;
				var exists6 = false;
				var exists7 = false;
				if (record.log2_ratio != "" && record.log2_ratio != null && record.log2_ratio != "0") {
					exists1 = true;
					this.fullTrackCount++;
				}
				if (record.distinct_peptide != "0" && record.distinct_peptide != null) {
					exists2 = true;
				}
				if (record.unshared_peptide != "0" && record.unshared_peptide != null) {
					exists3 = true;
				}
				if (record.precursor_area != "" && record.precursor_area != null && record.precursor_area != "0") {
					exists4 = true;
				}
				if (record.unshared_precursor_area != "" && record.unshared_precursor_area != null && record.unshared_precursor_area != "0") {
					exists5 = true;
				}
				if (record.unshared_log2_ratio != "" && record.unshared_log2_ratio != null && record.unshared_log2_ratio != "0") {
					exists6 = true;
				}
				if (record.spectral_count != "" && record.spectral_count != null && record.spectral_count != "0") {
					exists7 = true;
				}
				
				this.dataForViz.push({'mut': record.aliquot_id, 'exists0': exists0, 'exists1': exists1,'exists2': exists2,'exists3': exists3,
											'exists4': exists4,'exists5': exists5,'exists6': exists6, 'exists7': exists7,'idx': idx});
											
				if (!this.dataByStudy[record.submitter_id_name]) {
					this.dataByStudy.push(record.submitter_id_name);
					this.dataByStudy[record.submitter_id_name] = [];
				}
				this.dataByStudy[record.submitter_id_name].push({'mut': record.aliquot_id, 'exists0': exists0, 'exists1': exists1,'exists2': exists2,'exists3': exists3,
											'exists4': exists4,'exists5': exists5,'exists6': exists6, 'exists7': exists7,'idx': idx, 'log2_ratio': record.log2_ratio, 
											'precursor_area': record.precursor_area, 'unshared_log2_ratio': record.unshared_log2_ratio, 'unshared_precursor_area': record.unshared_precursor_area});	
				idx++;
			}
			console.log(this.dataByStudy);
			for (var study of this.dataByStudy){
				this.dataByStudy[study].sort(this.compareAliquotData);
				if ( (this.dataByStudy[study].length - 1) * 6  > this.vizWidth) this.vizWidth = (this.dataByStudy[study].length - 1) * 6;
			}

			//@@@PDC-1350 calculate opacity value once instead caculating values at rendering time. 
			//So property binding in aliquotData ngtemplate to these fields instead of binding to these functions to avoid function call during Tooltip triggering.
			for (let i = 0; i < this.dataByStudy.length; i++) {
				let studyName = this.dataByStudy[i];
				let mutList = this.dataByStudy[studyName];
				for(let j = 0; j<mutList.length; j++){
					let mut = mutList[j];
					if(mut.exists1){
						mut["exists1Value"] = this.opacityValueByLog2Ratio(studyName, j);
					}
					if(mut.exists4){
						mut["exists4Value"] = this.opacityValueByPrecursorArea(studyName, j);
					}
					if(mut.exists5){
						mut["exists5Value"] = this.opacityValueByUnsharedPrecursorArea(studyName, j);
					}
					if(mut.exists6){
						mut["exists6Value"] = this.opacityValueByUnsharedLog2Ratio(studyName, j);
					}
					mut["tooltipText"] = this.tooltipText2(studyName, j);
				}
			}

			if (this.dataByStudy.length <=10 )this.isScrollable = false;
			this.loading = false;
		  },
		  err => {
			  console.log("ERROR!!!!Loading data took too long");
			  this.aliquotSpectralCountLoadError = "Loading data took too long, please, close the overlay gene summary window and open it again.";
			  this.loadingAliquotRecords = false; //If loading data takes too much time and fails, need to stop spinning wheel
			  this.loading = false;
		  });
	 
  }
  compareAliquotData(a,b){
	  if (a.log2_ratio && a.log2_ratio != "" && b.log2_ratio && b.log2_ratio != ""){
				if (parseFloat(a.log2_ratio) > parseFloat(b.log2_ratio)) return -1;
				if (parseFloat(a.log2_ratio) < parseFloat(b.log2_ratio)) return 1;
	  }
	  if (a.log2_ratio && a.log2_ratio != "" && ( !b.log2_ratio || b.log2_ratio == "")) return -1;
	  if (b.log2_ratio && b.log2_ratio != "" && ( !a.log2_ratio || a.log2_ratio == "")) return 1;
	  if (a.precursor_area && a.precursor_area != "" &&	b.precursor_area && b.precursor_area != ""){
				if (parseFloat(a.precursor_area) > parseFloat(b.precursor_area)) return -1;
				if (parseFloat(a.precursor_area) < parseFloat(b.precursor_area)) return 1;
	  }
	  if (a.precursor_area && a.precursor_area != "" &&	( !b.precursor_area || b.precursor_area == "")) return -1;
	  if (b.precursor_area && b.precursor_area != "" &&	( !a.precursor_area || a.precursor_area == "")) return 1;
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
