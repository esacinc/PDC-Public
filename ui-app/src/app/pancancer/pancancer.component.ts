import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { CommonModule, Location } from '@angular/common';
import { Apollo, SelectPipe } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map ,  switchMap, debounceTime,  startWith} from 'rxjs/operators';
import gql from 'graphql-tag';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, UntypedFormGroup } from '@angular/forms';

import {DataViewModule} from 'primeng/dataview';
import {MatExpansionModule} from '@angular/material/expansion';

import { publicationsStudyData, PublicationsData, QueryPublicationsData, publicationsFiltersData, UIPublicationsData } from '../types';
import { StudySummaryComponent } from '../browse/study-summary/study-summary.component';

import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { MatSidenav } from '@angular/material/sidenav';

import {TableTotalRecordCount, AllStudiesData} from '../types';
import { PublicationFilesOverlayComponent } from '../browse/browse-by-file/publication-files-overlay.component';

declare var window: any;
import { PancancerService } from './pancancer.service';
import { stratify } from 'd3';
import { take } from 'rxjs/operators';
import { MessageDialogComponent } from "../dialog/message-dialog/message-dialog.component";
import * as _ from 'lodash';

//@@@PDC-8012 - update pancancer page
import { BrowseByFileService } from "../browse/browse-by-file/browse-by-file.service";
import { AllFilesData } from "../types";


//import supplementary_data from '../assets/data-folder/pancancer-supplementary.json';

@Component({
  selector: 'app-pancancer',
  templateUrl: './pancancer.component.html',
  styleUrls: ['./pancancer.component.css'],
  providers: [ BrowseByFileService]
})
//@@@PDC-6514: Build Pancancer page
export class PancancerComponent {

  allFiltersData: Observable<publicationsFiltersData>;
	filteredPublicationsData: PublicationsData[];
	allPublicationsData: UIPublicationsData[];
	publSupplementaryData = [];

	filterValues: any = { disease_type: "", year: "", program: "", pubmed_id: ""} ;
	filteredOptions: Observable<string[]>;
	options: any[] = []; // will hold the display name and value of the search terms

	diseaseTypesFilterVals = [];
	yearFilterVals = [];
	programFilterVals = [];
	diseaseTypesFilter = [];
	yearFilter = [];
	programFilter = [];
	totalRecords = 0;
	offset: number = 0;
	limit: number = 50;
	pageSize: number = 50;
	newFilterSelected: any;
	cols: any[];
	loading = false;
	publicationFiltersGroup:UntypedFormGroup;
	isAbstractExpanded = false;
	filterSelected: any;
	searchErrorMessageFlag = false;
  	supplementaryData: any;
  	additionalResources = [];
	publicationFileIDS = [];
	allCharacterizations = [];
	cssClassIndices = [];
	characterizationOrder = [];

  //@@@PDC-8012
  filteredFilesData: AllFilesData[]; //Filtered list of cases
  loading_sup: boolean = false; //Flag indicates that the data is still being loaded from server
  cols_sup = [];
  frozenCols = [];
  publication_id = "";
  filteredFilesData_obj = {};
  //Pagination variables
  totalRecords_sup: number;
  offset_sup = 0;
  limit_sup = 10;
  pageSize_sup: number;



	@ViewChild('sidenav') myNav: MatSidenav;

  constructor(private apollo: Apollo, private dialog: MatDialog, private publicationsService: PancancerService,
		private route: ActivatedRoute,
		private router: Router,
		private loc: Location,
    private browseByFileService: BrowseByFileService //@@@PDC-8012 - updates pancancer page
    ) {
	  	this.getPublicationsData();
		//@@@PDC-6667: Updates to the Pancancer page
		this.getAdditionalResources();
  }

  showStudySummary(pdc_study_id: string, study_uuid: string, study_name: string){
		let study_data: AllStudiesData = {
			study_id: study_uuid,
			pdc_study_id: pdc_study_id,
			study_submitter_id: '',
			submitter_id_name: study_name,
			program_name: '',
			project_name: '',
			disease_type: '',
			primary_site: '',
			analytical_fraction: '',
			experiment_type: '',
			cases_count: undefined,
			aliquots_count: undefined,
			study_description: '',
			embargo_date: '',
			filesCount: [],
			supplementaryFilesCount: [],
			nonSupplementaryFilesCount: [],
			contacts: [],
			versions: []
		};
		//study_data.pdc_study_id = study_id;
		//study_data.study_submitter_id = study_name;
		console.log(study_data);
		const dialogConfig = new MatDialogConfig();

		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		//dialogConfig.minWidth = '1000px';
		dialogConfig.width = '80%';
		dialogConfig.height = '95%'

		dialogConfig.data = {
			summaryData: study_data,
		};
		this.router.navigate([{outlets: {studySummary: ['study-summary', study_name]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);


			dialogRef.afterClosed().subscribe(
				val => console.log("Dialog output:", val)
			);

  }

	private getPublicationDataByID(pub_id: string) {
		//console.log(pub_id);
		//console.log(this.filteredPublicationsData);
		for(let i=0; i < this.allPublicationsData.length; i++ ) {
			if (this.allPublicationsData[i].publication_id == pub_id) {
				return this.allPublicationsData[i];
			}
		}
		//If list of studies for a publication was not found, then return empty list
		return {studies: []};
	}

	showFilesOverlay(publication_id) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		dialogConfig.width = '70%';
		dialogConfig.height = '85%';
		dialogConfig.data = {
				summaryData: {publication_id: publication_id}
		};
		this.router.navigate([{outlets: {publicationFilesOverlay: ['publication-files-overlay', publication_id]}}], { skipLocationChange: true });
		const dialogRef = this.dialog.open(PublicationFilesOverlayComponent, dialogConfig);
		dialogRef.afterClosed().subscribe((val:any) => {
				console.log("Dialog output:", val);
				//Generate alias URL to hide auxiliary URL details when the overlay window was closed and the focus returnes back
				this.loc.replaceState("/publications");
		});
	}
  ///@@@PDC-8012
  showFilesTable(publication_id) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.hasBackdrop = true;
		dialogConfig.width = '70%';
		dialogConfig.height = '85%';
		dialogConfig.data = {
				summaryData: {publication_id: publication_id}
		};
    console.log(publication_id);
    this.publication_id = publication_id;
    this.browseByFileService
    .getPaginatedFilesForPublication(
      this.publication_id,
      this.offset_sup,
      this.limit_sup,
    )
    .subscribe((data: any) => {
      this.filteredFilesData = data.getPaginatedUIPancancerFiles.uiPancancerFiles;
      //console.log(this.filteredFilesData);
      this.totalRecords_sup = data.getPaginatedUIPancancerFiles.total;
      this.offset_sup = data.getPaginatedUIPancancerFiles.pagination.from;
      this.pageSize_sup = data.getPaginatedUIPancancerFiles.pagination.size;
      this.limit_sup = data.getPaginatedUIPancancerFiles.pagination.size;
      this.loading_sup = false;
    });


	}

  test(event: any,publication_id){
    console.log(event);
    console.log(publication_id);
  }

  ///@@@PDC-8012
  loadFiles(event: any, publication_id) {
    this.offset = event.first;
    this.limit = event.rows;
    this.loading = true;
    setTimeout(() => {
      this.browseByFileService
      .getPaginatedFilesForPublication(
        publication_id,
        this.offset,
        this.limit,
      )
      .subscribe((data: any) => {
        this.filteredFilesData = data.getPaginatedUIPancancerFiles.uiPancancerFiles;
        this.filteredFilesData_obj[publication_id] = this.filteredFilesData;
        this.totalRecords = data.getPaginatedUIPancancerFiles.total;
      });
    }, 1000);
			this.loading = false;
  }



	isString (obj) {
		return (Object.prototype.toString.call(obj) === '[object String]');
	}

	//@@@PDC-6667: Updates to the Pancancer page
	getAdditionalResources() {
		this.additionalResources = [
			{type: "Cancer Data Service", description: "A reharmonized genomic data freeze corresponding to a Pan-Cancer analysis of 10 tumor types is available via the NCI Cancer Data Service (CDS). More information about the NCI CDS is available here: <a href='https://datacommons.cancer.gov/repository/cancer-data-service' target='_blank' class='publLink'>https://datacommons.cancer.gov/repository/cancer-data-service</a>. The primary study is registered at dbGaP Study Accession: <a href='https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001287.v16.p6' target='_blank' class='publLink'>phs001287.v16.p6</a> and the genomic raw sequencing files for this study are available at the <a href='https://portal.gdc.cancer.gov/' target='_blank' class='publLink'>Genomic Data Commons (GDC)</a>."},
		 ];
	}

	getPublicationsData() {
    console.log("inside getPublications");
		this.loading = true;
		this.publicationsService.getPublicationsResults().pipe(take(1)).subscribe((data: any) => {
			if (data && data.getUIPancancerPublications) {
				this.allPublicationsData = data.getUIPancancerPublications;
        //@@@PDC-7267 - update order of publications so that publication_id "eae0a229-3ade-11ee-b8fc-0aaebe6fe27b" is always first
        for (let data of this.allPublicationsData){
          if(data.publication_id == "eae0a229-3ade-11ee-b8fc-0aaebe6fe27b"){
            this.allPublicationsData.splice(this.allPublicationsData.indexOf(data));
            this.allPublicationsData.unshift(data);
          }
        }
        console.log(this.allPublicationsData);

				this.totalRecords =  data.getUIPancancerPublications.length;
				//Add spaces to comma separated data (cohorts)
				//Calculate publication supplementary files for a publication
				for (let publication of data.getUIPancancerPublications) {
					let files = publication['files'];
					let pubSupplementaryFileCount = 0;
 					 for (let k in files) {
						if (files[k]['data_category'] && !this.isEmpty(files[k]['data_category'])) {
						   let dataCategory = files[k]['data_category'];
						   if (dataCategory.toUpperCase() == ('Publication Supplementary Material').toUpperCase()) {
							   pubSupplementaryFileCount++;
							}
						}
					 }
					 publication['publicationSupplementaryFiles'] = pubSupplementaryFileCount;
				}
				//@@@PDC-6681: Update the Supplementary Information section to populate Pancancer files
				this.publicationsService.getPancancerFilesResults().pipe(take(1)).subscribe((data: any) => {
					if (data && data.getAllUIPancancerFiles) {
						let allFilesArr = [];
						allFilesArr = data.getAllUIPancancerFiles;
						this.groupSupplementaryData(allFilesArr);
						this.loading = false;
					}
				});
			}
		});
	}

	//@@@PDC-6681: Update the Supplementary Information section to populate Pancancer files
	groupSupplementaryData(allFilesArr) {
		//Remove duplicates
		allFilesArr = allFilesArr.filter((v,i,a)=>a.findIndex(v2=>(v2.file_id===v.file_id))===i);
		for (let k in allFilesArr) {
		  console.log("pancan file: "+allFilesArr[k]['characterization']);
		  if (allFilesArr[k]['cohorts'] && !this.isEmpty(allFilesArr[k]['cohorts'])) {
			allFilesArr[k]['cohorts'] = this.addSpacesToField(allFilesArr[k]['cohorts']);
		  }
		  //Add links to related publications
		  if (allFilesArr[k]['related_publications'] && !this.isEmpty(allFilesArr[k]['related_publications'])) {
			  let relatedpublications = allFilesArr[k]['related_publications'];
			  let relatedPublArr = relatedpublications.split(",");
			  for (let r in relatedPublArr) {
				  relatedPublArr[r] = "<a href='https://www.ncbi.nlm.nih.gov/pubmed/"+ relatedPublArr[r] +"' target='_blank' class='publLink'>" + relatedPublArr[r] + "</a>";
			  }
			  let relatedPublStr = relatedPublArr.join(", ");
			  allFilesArr[k]['related_publications_str'] = relatedPublStr;
		  }
	   }
		this.publicationFileIDS = allFilesArr.map(({ file_id }) => file_id);
		//@@@PDC-6667: Updates to the Pancancer page
		let arr2 = this.groupBy(allFilesArr, (c) => c.characterization);
		let predefinedOrder = ["Proteome", "Phosphoproteome", "Glycoproteome", "Acetylome", "Ubiquitylome", "WGS", "WXS", "RNA-Seq", "miRNA-Seq", "Methylation Array", "Clinical and Other Metadata"];
		let characterizationArr = allFilesArr.map(({ characterization }) => characterization);
		//Remove duplicates
		let characterizationFinalArr = characterizationArr.filter(function(item, pos) {
			return characterizationArr.indexOf(item) == pos;
		})
		this.allCharacterizations = characterizationFinalArr;
		let characterizationDiff = this.arrDiff(characterizationFinalArr, predefinedOrder);
		this.characterizationOrder = [];
		//Push elements in predefined order
		for (let key in predefinedOrder) {
			let orderKey = predefinedOrder[key];
			this.publSupplementaryData.push(orderKey);
			this.publSupplementaryData.push(arr2[orderKey]);
			this.characterizationOrder.push(orderKey);
		}
		//Append the rest to the list
		for (var i in characterizationDiff) {
			let ele = characterizationDiff[i];
			this.publSupplementaryData.push(ele);
			this.publSupplementaryData.push(arr2[ele]);
			this.characterizationOrder.push(ele);
		}
		//CSS styling for rows
		let totalCount = this.publSupplementaryData.length;
		this.cssClassIndices = [];
		if (totalCount > 0) {
			for (let c = 2; c <= totalCount; c++) {
				if (c % 2 == 0) {
					this.cssClassIndices.push(c);
					this.cssClassIndices.push(c+1);
				}
				c = c+3;
			}
		}
		//console.log(this.publSupplementaryData);
	}

	getBackgroundColor(rowIndex) {
		if (this.cssClassIndices.includes(rowIndex))  return {colorTheme: true};
    }

	arrDiff(arr1, arr2) {
		let difference = arr1.filter(x => !arr2.includes(x));
		return difference;
	}

	isEmpty(value){
		return (value == null || value === '');
	}

	addSpacesToField(str) {
		return str.replaceAll(",", ", ");
	}

	groupBy(xs, f) {
		return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
	}

	async downloadFile(fileData) {
        var downloadLink = "";
        let individualFileData = [];
        individualFileData.push(fileData);
          //let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(file.file_name);
          //@@@PDC-5770 get file using uuid
          for (let file of individualFileData) {
              if (file.downloadable.toLowerCase() === 'yes') {
                  //console.log("Export file id 0930: "+file.file_id);
                  let urlResponse = await this.publicationsService.getOpenFileUuidSignedUrl(file.file_id);console.log(urlResponse);
                  if (!urlResponse.error) {
                    downloadLink = urlResponse.data;
                  } else {
                    this.displayMessageForNotDownloadable();
                  }
                  console.log(downloadLink);
                  if (downloadLink) {
                    //If the download file link is available, open the download link and start file download.
                    if (this.checkFilenameExtentions(file.file_name)) {
                      //open files in new tab only if the are automatically opened withing the browser
                      window.open(downloadLink, "_blank");
                    } else {
                      window.open(downloadLink, "_self");
                    }
                  }
            }
        }
      }

      private checkFilenameExtentions (filename: string): boolean {
        if (filename.indexOf(".pdf") != -1 || filename.indexOf(".txt") != -1  || filename.indexOf(".html") != -1 || filename.indexOf(".png") != -1 || filename.indexOf(".jpeg") != -1 ){
          return true;
        } else {
          return false;
        }
      }

      //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
      //Opens a dialog window with the message that the file is not downloadable.
      async displayMessageForNotDownloadable() {
        this.dialog.open(MessageDialogComponent, {
          width: "300px",
          disableClose: true,
          autoFocus: false,
          hasBackdrop: true,
          data: { message: "This file is not available for download." }
        });
      }

	//Scroll to a particular section of the page.
	scrollToElement(eleID = ''): void {
		document.getElementById(eleID).scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest"});
	}

}
