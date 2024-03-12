import {of as observableOf,  Observable } from 'rxjs';

import { FormControl } from "@angular/forms";
import { catchError,  take } from 'rxjs/operators';
import { Component, OnInit, Inject,  EventEmitter, Input, Output, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef, MatLegacyDialogConfig as MatDialogConfig, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { PDCUserService } from "../../pdcuser.service";
import { AllFilesData } from "../../types";
import { ConfirmationDialogComponent } from "./../../dialog/confirmation-dialog/confirmation-dialog.component";
import { BrowseByFileService } from "./browse-by-file.service";
import * as jwt_decode from "jwt-decode";
import { HttpErrorResponse } from "@angular/common/http";
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import { SizeUnitsPipe } from '../../sizeUnitsPipe.pipe';
import { ngxCsv } from "ngx-csv/ngx-csv";
import { MessageDialogComponent } from "./../../dialog/message-dialog/message-dialog.component";
import { Table } from "primeng/table";


import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-files-overlay',
  templateUrl: './files-overlay.component.html',
  styleUrls: ['../../../assets/css/global.css', './browse-by-file.component.css'],
  providers: [ BrowseByFileService, SizeUnitsPipe]
})

//@@@PDC-3392 open files for a specific study in an overlay window
//@@@PDC-3478 open files data table in overlay window from study and case summaries
//@@@PDC-3573 show only unique files for publications supplementary data
//@@@PDC-3651 fix "select all pages" option issue with supplementary data files
//@@@PDC-3622 add legacy studies data
//@@@PDC-3788 fix issues found with Files overlay in legacy data page
//@@@PDC-3928 No links to download files in Export File Manifest for Version 1 Studies
export class FilesOverlayComponent implements OnInit {

	filteredFilesData: AllFilesData[]; //Filtered list of cases
  loading: boolean = false; //Flag indicates that the data is still being loaded from server
  filterChangedFlag: boolean = true; //Flag indicates that filter selection was changed
  @Input() newFilterValue: any;
  @Input() newFilesFilterValue: any;
  newFilterSelected: any;
  //Pagination variables
  totalRecords: number;
  offset: number;
  limit: number;
  msgs: string = '';
  pageSize: number;
  cols: any[];
  fileTypes = ["MZML", "PSM-MZID", "PSM-TSV", "PROT_ASSEM", "PROTOCOL", "RAW"];
  sort: string;
  @Output() fileTotalRecordChanged: EventEmitter<any> = new EventEmitter<any>();
  fenceRequest:boolean = false;
  //keep a full list of filter category
  // Array which holds filter names. Must be updated when new filters are added to browse page.
  allFilterCategory: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","study_name","submitter_id_name","sample_type","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable","studyName_genes_tab", "biospecimen_status", "case_status"];

  notDownloadable: string = 'not available for download';

  selectedFiles: AllFilesData[] = [];
  //status of headercheckbox
  headercheckbox:boolean = false;
  //track current page selected file
  currentPageSelectedFile = [];
  //track if the header check box needs to be enabled
  pageHeaderCheckBoxTrack = [];
  selectedHeaderCheckbox = '';
  //@@@PDC-918: Add button to allow download of full file manifest
  checkboxOptions = [];

  static urlBase;
  // is fence url revisited
  isFenceReloaded:any = false;
  //@@@PDC-937: Add a button to allow download all manifests with a single click
  completeFileManifest: AllFilesData[]; //Filtered list of cases
  @Output() downloadWholeManifestFlag: EventEmitter<any> = new EventEmitter<any>();
  @Output() isFileTableLoading: EventEmitter<any> = new EventEmitter<any>();
  @Input() downloadAllManifests;
  @Input() handleTableLoading;
  @Input() otherTabsLoaded;
  @Input() enableDownloadAllManifests:any;
  // Determines if there are any selected filters in the browse component
  filtersSelected:any;
  //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
  individualFileData: AllFilesData[] = [];
  manifestFormat = "csv";

  studyVersion: string = "";
  allStudiesVersions: any[] = [];
  study_names_param = [];
  origin_study_id: string = "";

  publicationsFiles = [];
  isLegacyData = false;
  frozenCols = [];
  @ViewChild('dataForManifestExport') dataForManifestExport;
  //@@@PDC-7110 fix checkbox update
  @ViewChildren('browsePageCheckboxes') browsePageCheckboxes;

	constructor(private activeRoute: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private browseByFileService: BrowseByFileService, private loc:Location,
				private dialogRef: MatDialogRef<FilesOverlayComponent>, private sizeUnitsPipe: SizeUnitsPipe,
				@Inject(MAT_DIALOG_DATA) public studyData: any, private dialog: MatDialog,  private userService: PDCUserService) {
	     console.log(studyData);
		 let study_names = studyData.summaryData.study_name.split('|').join(';')
		 this.study_names_param = studyData.summaryData.study_name.split('|');
		// Array which holds filter names. Must be updated when new filters are added to browse page.
		this.newFilterSelected = {
		  program_name: "",
		  project_name: "",
		  study_name: study_names,
		  submitter_id_name: "",
		  disease_type: "",
		  primary_site: "",
		  analytical_fraction: "",
		  experiment_type: studyData.summaryData.experiment_type,
		  ethnicity: "",
		  race: "",
		  gender: "",
		  tumor_grade: "",
		  sample_type: "",
		  acquisition_type: studyData.summaryData.acquisition_type,
		  data_category: studyData.summaryData.data_category,
		  file_type: studyData.summaryData.file_type,
		  access: "",
		  downloadable: "",
		  studyName_genes_tab: "",
		  biospecimen_status: "",
		  case_status: "",
		};
		this.offset = 0; //Initialize values for pagination
		this.limit = 10;
		this.totalRecords = 0;
		this.pageSize = 10;
		if (studyData.summaryData.versions) {
      this.studyVersion = studyData.summaryData.currentVersion || "";
		}
		//We need to have study UUID in order to retrieve files for correct versions of a study
		if (studyData.summaryData.study_id) {
			this.origin_study_id = studyData.summaryData.study_id;
		}
		if (studyData.publicationsFiles) {
			this.publicationsFiles = studyData.publicationsFiles;
		}
		if (studyData.legacyData) {
			this.isLegacyData = true;
			this.newFilterSelected = {
			  study_id: studyData.summaryData.study_id,
			  data_category: studyData.summaryData.data_category,
			  file_type: studyData.summaryData.file_type,
			  data_source: studyData.summaryData.data_source
			};
		} else { //There could be study versions only if it is not legacy data
			//assign study version value to each file
			this.browseByFileService
				.getStudiesVersions()
				.subscribe((data: any) => {
					for (let study of data.getPaginatedUIStudy.uiStudies){
						if (study.versions && study.versions.length > 0) {
							this.allStudiesVersions[study.submitter_id_name] = study.versions[0].number;
						} else {
							this.allStudiesVersions[study.submitter_id_name] = "N/A";
						}
					}
				});
		}
		this.getAllFilesData();
		this.sort = "";
		FilesOverlayComponent.urlBase = environment.dictionary_base_url;
	}

	onTableHeaderCheckboxToggle() {
		let emptyArray = [];
		let localSelectedFiles = emptyArray.concat(this.selectedFiles);
		if(this.headercheckbox){
		  for(let file of this.filteredFilesData){
			//Have to check if the file was already selected by file id and by study name
			//otherwise there could be a situation (e.g. metadata files) where there is the same file for multiple studies
			if(this.currentPageSelectedFile.indexOf(file.file_id + "-" + file.pdc_study_id) === -1){
				localSelectedFiles.push(file);
				this.currentPageSelectedFile.push(file.file_id + "-" + file.pdc_study_id);
			}
		  }
		  this.selectedFiles = localSelectedFiles;
		} else {
		  //@@@PDC-3748: "Select all pages" issue on the Study Summary page
		  for (let fileData of this.currentPageSelectedFile) {
			let index = localSelectedFiles.findIndex(x => (x.file_id + "-" + x.pdc_study_id) === fileData);
			if (index > -1) {
			  localSelectedFiles.splice(index,1);
			}
		  }
		  this.selectedFiles = localSelectedFiles;
		  this.currentPageSelectedFile = [];
		  this.pageHeaderCheckBoxTrack = [];
		  this.selectedHeaderCheckbox = '';
		}
  }

  //@@@PDC-820 row selections cross pagination
  onRowSelected(event:any){
    this.currentPageSelectedFile.push(event.data.file_id + "-" + event.data.pdc_study_id);
    //@@@PDC-3748: "Select all pages" issue on the Study Summary page
    this.handleCheckboxSelections();
  }

  //@@@PDC-820 row selections cross pagination
  onRowUnselected(event){
    let index = this.currentPageSelectedFile.indexOf(event.data.file_id + "-" + event.data.pdc_study_id);
    if(index >-1){
      this.currentPageSelectedFile.splice(index,1);
    }
    //@@@PDC-3748: "Select all pages" issue on the Study Summary page
    this.handleCheckboxSelections();
  }

  get staticUrlBase() {
    return FilesOverlayComponent.urlBase;
  }
  //This method returns unique file objects with file names matching list of publications files names
  //This method can be called only after checking that this.publicationsFiles is not empty!
  getUniqueFiles(){
	  //if (this.publicationsFiles.length > 0){
		  let uniqueFiles: AllFilesData[] = [];
		  for (let file of this.filteredFilesData) {
			//@@@PDC-3785 include only files for one publication that are stored in this.publicationsFiles
			//If file name is found in publications files names list
			if (this.publicationsFiles.find(publication_file => { return publication_file == file.file_name})) {
				//If unique files list is not empty and the same file object is NOT found in the list yet
				if (uniqueFiles.length > 0 && ! uniqueFiles.find(fileObj => { return fileObj.file_id == file.file_id})){
					uniqueFiles.push(file);
				} else if (uniqueFiles.length == 0) {
					uniqueFiles.push(file);
				}
			}
		  }
		  console.log(uniqueFiles);
		  this.filteredFilesData = uniqueFiles;
	 // }
  }

	getAllFilesData() {
		this.loading = true;
		if (this.publicationsFiles.length > 0) {
				  this.limit = 100;
				  this.pageSize = 100;
				  this.offset = 0;
		}
		setTimeout(() => {
			if (!this.isLegacyData) {
			  this.browseByFileService
				.getFilteredFilesPaginated(
				  this.studyVersion,
				  this.offset,
				  this.limit,
				  this.sort,
				  this.newFilterSelected
				)
				.subscribe((data: any) => {
				  this.filteredFilesData = data.getPaginatedUIFile.uiFiles;
				  this.totalRecords = data.getPaginatedUIFile.total;
				  this.fileTotalRecordChanged.emit({
					type: "file",
					totalRecords: this.totalRecords
				  });
				  this.offset = data.getPaginatedUIFile.pagination.from;
				  this.pageSize = data.getPaginatedUIFile.pagination.size;
				  this.limit = data.getPaginatedUIFile.pagination.size;
				  if (this.publicationsFiles.length > 0) {
					  this.getUniqueFiles();
					  this.limit = 100;
					  this.pageSize = 100;
					  this.totalRecords = this.filteredFilesData.length;
				  }
          this.makeRowsSameHeight();
				  this.loading = false;
				});
			} else {
				this.browseByFileService
					.getFilteredLegacyDataFilesPaginated(
					  this.offset,
					  this.limit,
					  this.sort,
					  this.newFilterSelected
				)
				.subscribe((data: any) => {
				  this.filteredFilesData = data.getPaginatedUILegacyFile.uiLegacyFiles;
				  this.totalRecords = data.getPaginatedUILegacyFile.total;
				  this.fileTotalRecordChanged.emit({
					type: "file",
					totalRecords: this.totalRecords
				  });
				  this.offset = data.getPaginatedUILegacyFile.pagination.from;
				  this.pageSize = data.getPaginatedUILegacyFile.pagination.size;
				  this.limit = data.getPaginatedUILegacyFile.pagination.size;
				  if (this.publicationsFiles.length > 0) {
					  this.getUniqueFiles();
					  this.limit = 100;
					  this.pageSize = 100;
					  this.totalRecords = this.filteredFilesData.length;
				  }
          this.makeRowsSameHeight();
				  this.loading = false;
				});
			}
		}, 1000);
  }


  //@@@PDC-497 (onLazyLoad)="loadFiles($event)" will be invoked when sort event fires
  loadFiles(event: any) {
    if(this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.offset) === -1){
      this.pageHeaderCheckBoxTrack.push(this.offset);
    }else if(!this.headercheckbox && this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
      this.pageHeaderCheckBoxTrack.splice(this.pageHeaderCheckBoxTrack.indexOf(this.offset),1);
    }
    let field = event.sortField;
    let order = event.sortOrder;
    if (field !== undefined) {
      if (order === 1) {
        this.sort = " " + field + " asc ";
      } else if (order === -1) {
        this.sort = " " + field + " desc ";
      }
    }
    this.offset = event.first;
    this.limit = event.rows;
    this.loading = true;
	//@@@PDC-4017
	this.selectedHeaderCheckbox = ''; //reinitialize selected checkbox, so that a new page could be selected as well
	if (this.publicationsFiles.length > 0) {
				  this.limit = 100;
				  this.pageSize = 100;
				  this.offset = 0;
	}
	if (!this.isLegacyData) {
		this.browseByFileService
		  .getFilteredFilesPaginated(
			this.studyVersion,
			this.offset,
			this.limit,
			this.sort,
			this.newFilterSelected
		  )
		  .pipe(take(1)).subscribe((data: any) => {
			this.filteredFilesData = data.getPaginatedUIFile.uiFiles;
			if (this.offset === 0) {
			  this.totalRecords = data.getPaginatedUIFile.total;
			  this.fileTotalRecordChanged.emit({
				type: "file",
				totalRecords: this.totalRecords
			  });
			  this.offset = data.getPaginatedUIFile.pagination.from;
			  this.pageSize = data.getPaginatedUIFile.pagination.size;
			  this.limit = data.getPaginatedUIFile.pagination.size;
			}
			//Fixing selecting all files in the files overlay after changing the number of records per page
			this.pageSize = data.getPaginatedUIFile.pagination.size;
			if (this.publicationsFiles.length > 0) {
					  this.getUniqueFiles();
					  this.totalRecords = this.filteredFilesData.length;
					  this.limit = 100;
					  this.pageSize = 100;
					  this.offset = 0;
			}
			this.trackCurrentPageSelectedFile(this.filteredFilesData);
			if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
			  this.headercheckbox = true;
			}else{
			  this.headercheckbox = false;
			}
			//@@@PDC-3748: "Select all pages" issue on the Study Summary page
			this.handleCheckboxSelections();
      this.makeRowsSameHeight();
			this.loading = false;
		  });
	} else {
		this.browseByFileService
		  .getFilteredLegacyDataFilesPaginated(
			this.offset,
			this.limit,
			this.sort,
			this.newFilterSelected
		  )
		  .subscribe((data: any) => {
			this.filteredFilesData = data.getPaginatedUILegacyFile.uiLegacyFiles;
			if (this.offset === 0) {
			  this.totalRecords = data.getPaginatedUILegacyFile.total;
			  this.fileTotalRecordChanged.emit({
				type: "file",
				totalRecords: this.totalRecords
			  });
			  this.offset = data.getPaginatedUILegacyFile.pagination.from;
			  this.pageSize = data.getPaginatedUILegacyFile.pagination.size;
			  this.limit = data.getPaginatedUILegacyFile.pagination.size;
			}
			//Fixing selecting all files in the files overlay after changing the number of records per page
			this.pageSize = data.getPaginatedUILegacyFile.pagination.size;
			this.trackCurrentPageSelectedFile(this.filteredFilesData);
			if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
			  this.headercheckbox = true;
			}else{
			  this.headercheckbox = false;
			}
			//@@@PDC-3748: "Select all pages" issue on the Study Summary page
			this.handleCheckboxSelections();
      this.makeRowsSameHeight();
      this.loading = false;
		  });
	}
  }

  //@@@PDC-3667: "Select all pages" option issue
  handleCheckboxSelections() {
		if (this.currentPageSelectedFile.length === this.pageSize) {
			this.headercheckbox = true;
		} else {
			//For the last page
			if (this.totalRecords - this.offset < this.pageSize) {
				if (this.currentPageSelectedFile.length === this.totalRecords - this.offset) {
					this.headercheckbox = true;
				} else {
					this.headercheckbox = false;
				}
			} else {
				this.headercheckbox = false;
			}
		}
	}

  //@@@PDC-918: Add button to allow download of full file manifest
  changeHeaderCheckbox($event) {
    let checkboxVal = this.selectedHeaderCheckbox;
    this.selectedFiles = this.currentPageSelectedFile = [];
    switch (checkboxVal) {
      case 'Select all pages':
            this.fileExportCompleteManifest();
            break;
      case 'Select this page':
            this.headercheckbox = true;
            this.onTableHeaderCheckboxToggle();
            break;
      case 'Select None':
            this.clearSelection();
            break;
    }
  }
  //@@@PDC-7012 improve browse checkbox intuitiveness
  triggerchangeHeaderCheckbox() {
      //@@@PDC-7110 - fix checkbox update
      //@@@PDC-7110 - fix checkbox update - check the selection and then set checkbox accordingly
      let checkboxVal = this.selectedHeaderCheckbox;
      this.selectedFiles = this.currentPageSelectedFile = [];
      switch (this.selectedHeaderCheckbox) {
        case 'Select all pages':
              this.fileExportCompleteManifest();
              break;
        case 'Select this page':
              this.headercheckbox = true;
              this.onTableHeaderCheckboxToggle();
              break;
        case 'Select None':
              this.clearSelection();
              break;
      }
      //@@@PDC-7110 - check if there are unchecked checkboxes in table - if so then deselect checkbox
      var found = this.browsePageCheckboxes._results.some(el => el.checked === false);
      if(found == false){
        this.headercheckbox = true;
      } else {
        this.headercheckbox = false;
      }
      this.dataForManifestExport.open();
  }

  //@@@PDC-7109 improve browse checkbox intuitiveness - bug where 'Select None' remained checked when selected
  chkBoxSelectionCheck(selectedOption) {
      if(selectedOption == 'Select None'){
        this.headercheckbox = false;
        this.dataForManifestExport.close();
      } else {
        this.headercheckbox = true;
      }
  }

  	/* Helper function to determine whether the download all button should be disabled or not */
	iscompleteManifestDisabled() {
		if (this.filtersSelected) {
		  if (this.filtersSelected > 0) {
			  return false;
		  } else {
			  return true;
		  }
	  } else {
		  return true;
	  }
	}

  // @@@PDC-260
  /* Small helper function to detrmine whether the download button should be disabled or not */
  isDownloadDisabled() {
    if (this.selectedFiles) {
      if (this.selectedFiles.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  //@@@PDC-937: Add a button to allow download all manifests with a single click
  downloadAllManifest(exportFormat = "csv") {
    setTimeout(() => {
      this.downloadWholeManifestFlag.emit({downloadAllManifest:this.totalRecords, format: exportFormat});
    }, 10);
  }

  displayLoading(decisionFlag, loadFlagName, loadFlag){
    if (!decisionFlag) {
      this.loading = loadFlag;
    } else {
        this.isFileTableLoading.emit({isFileTableLoading:''+loadFlagName+':'+loadFlag+''});
    }
  }

  //@@@PDC-937: Add a button to allow download all manifests with a single click
  //@@@PDC-3206: fix Export All Manifests button causing files manifest to download twice
  async fileExportCompleteManifest(buttonClick=false) {
    if (this.totalRecords > 10000) {
        this.dialogueForHugeDataVolume();
    } else {
      this.displayLoading(buttonClick, "file", true);
      setTimeout(() => {
		 if (!this.isLegacyData) {
			this.browseByFileService
			.getFilteredFilesPaginated(
			  this.studyVersion,
			  0,
			  this.totalRecords,
			  this.sort,
			  this.newFilterSelected
			)
			.pipe(take(1))
			.subscribe((data: any) => {
			  if (buttonClick) {
				this.completeFileManifest = data.getPaginatedUIFile.uiFiles;
				this.fileTableExportCSV(true, false, this.manifestFormat);
			  } else {
				this.selectedFiles = data.getPaginatedUIFile.uiFiles;
				if (this.publicationsFiles.length > 0) {
				  this.getUniqueFiles();
				  this.limit = 100;
				  this.pageSize = 100;
				  this.totalRecords = this.filteredFilesData.length;
				  this.selectedFiles = this.filteredFilesData;
				}
				this.headercheckbox = true;
				 //@@@PDC-3748: "Select all pages" issue on the Study Summary page
				this.updateCurrentPageSelectedFiles(this.selectedFiles);
			  }
        this.makeRowsSameHeight();
			  this.displayLoading(buttonClick, "file", false);
			});
		 } else {
			this.browseByFileService
			.getFilteredLegacyDataFilesPaginated(
			  0,
			  this.totalRecords,
			  this.sort,
			  this.newFilterSelected
			)
			.pipe(take(1))
			.subscribe((data: any) => {
			  if (buttonClick) {
				this.completeFileManifest = data.getPaginatedUILegacyFile.uiLegacyFiles;
				this.fileTableExportCSV(true, false, this.manifestFormat);
			  } else {
				this.selectedFiles = data.getPaginatedUILegacyFile.uiLegacyFiles;
				this.headercheckbox = true;
				 //@@@PDC-3748: "Select all pages" issue on the Study Summary page
				//this.updateCurrentPageSelectedFiles(this.selectedFiles);
			  }
        this.makeRowsSameHeight();
			  this.displayLoading(buttonClick, "file", false);
			});
		 }
      }, 1000);
    }
  }

  //@@@PDC-3748: "Select all pages" issue on the Study Summary page
  updateCurrentPageSelectedFiles(localSelectedFiles) {
    let cloneData = _.cloneDeep(localSelectedFiles);
    cloneData = cloneData.splice(0, this.pageSize);
    this.currentPageSelectedFile = [];
    cloneData.forEach(item => {this.currentPageSelectedFile.push(item.file_id + "-" + item.pdc_study_id)});
  }

  dialogueForHugeDataVolume() {
    setTimeout(() => {
      this.dialog.open(MessageDialogComponent, {
        width: "300px",
        disableClose: true,
        autoFocus: false,
        hasBackdrop: true,
        data: { message: "Data volume for Files data is high. Please select files < 10000 to download." }
      });
    }, 10);
  }

  //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
  async downloadFile(fileData) {
    this.individualFileData = [];
    this.individualFileData.push(fileData);
    //this.fileTableExportCSV(false, true);
    let controlledFileFlag: boolean = false;
    for (let file of this.individualFileData) {
      if (file["access"].toLowerCase() === "controlled" && file.downloadable.toLowerCase() === "yes") {
        controlledFileFlag = true;
      }
    }
    //If the file is controlled, execute the file export in the normal format
    if (controlledFileFlag) {
      this.fileTableExportCSV(false, true);
    } else {
      var downloadLink = "";
      for (let file of this.individualFileData) {
        if (file.downloadable.toLowerCase() === 'yes') {
			if (!this.isLegacyData){
				//let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(file.file_name);
			  //@@@PDC-5770 get file using uuid
			  console.log("Export file id 0930: "+file.file_id);
			  let urlResponse = await this.browseByFileService.getOpenFileUuidSignedUrl(file.file_id);console.log(urlResponse);
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
			} else {
				//@@@PDC-3937 Use new APIs for downloading legacy studies' files
				this.browseByFileService.getLegacyFilesData(file.file_name).subscribe((fileData: any) => {
					console.log(fileData);
					if (fileData.uiLegacyFilesPerStudy[0].signedUrl.url != "") {
						downloadLink = fileData.uiLegacyFilesPerStudy[0].signedUrl.url;
					} else {
						this.displayMessageForNotDownloadable();
					}

					if (downloadLink) {
						//If the download file link is available, open the download link and start file download.
						if (this.checkFilenameExtentions(file.file_name)) {
							//open files in new tab only if the are automatically opened withing the browser
							window.open(downloadLink, "_blank");
						} else {
							window.open(downloadLink, "_self");
						}
					}
				});
			}
        } else{
          this.displayMessageForNotDownloadable();
        }
      }
    }
  }

  //@@@PDC-3871 Some files open on the same browser page
  //This helper function will check file extention and return true if extension is a document that usually opens in the browser
  // the function will return false if the file type is usually automatically downloaded by the browsers
  private checkFilenameExtentions (filename: string): boolean{
	  if (filename.indexOf(".pdf") != -1 || filename.indexOf(".txt") != -1  || filename.indexOf(".html") != -1 || filename.indexOf(".png") != -1 || filename.indexOf(".jpeg") != -1 ){
		  return true;
	  }else {
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


  //@@@PDC-729 Integrate PDC with Fence and IndexD
  //@@@PDC-784 Improve download controlled files feature
  //@@@PDC-801 For files that are marked downloadable call API to get signed URL and include in manifest
  //@@@PDC-869 if controlled file is not downloadable, it will not ask user to login eRA and authorize
  //@@@PDC-3206 fix ddownload manifest even if there are zero records
  async fileTableExportCSV(iscompleteFileDownload:boolean = false, individualFileDownload:boolean = false, exportFormat = "csv") {
    let dataForExport;
    if (iscompleteFileDownload) {
        dataForExport = this.completeFileManifest;
    } else {
        if (individualFileDownload) {
          //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
          dataForExport = this.individualFileData;
          //Set a flag in local storage
          localStorage.setItem("controlFilesIndividualFileDownload","true");
        } else {
          dataForExport =  this.selectedFiles;
        }
    }
    let confirmationMessage: string = "";
    let eRALogIn: string = "loginNotRequired";

    //login as eRA/NIH
    if (this.userService.isUserLoggedIn() && this.userService.getUID().length > 0) {
      confirmationMessage = `
			You are trying to generate a file manifest that includes controlled data files.
			This will require you to authorize DCF to access your NIH profile.
      Do you want to continue?`;
      eRALogIn = "loginNotRequired";
    } else {
      confirmationMessage = `
			You are trying to generate a file manifest that includes controlled data files.
			This will require you to log in through eRA and authorize DCF to access your NIH profile.
			Do you want to continue?`;
      eRALogIn = "loginRequired";
    }
    let controlledFileFlag: boolean = false;
    for (let file of dataForExport) {
      if (file["access"].toLowerCase() === "controlled" && file.downloadable.toLowerCase() === "yes") {
        controlledFileFlag = true;
      }
	  //If embargo date is empty substitute with N/A
	  if (!file["embargo_date"]) {
		  file["embargo_date"] = "N/A";
	  }
	  console.log(file["submitter_id_name"]);
	  console.log(this.studyVersion);
	  //PDC-3985 - fix study version value for non legacy studies
	  //If studyVersion value is set assign it to each of the files
	  //since the user opened Browse page to view files for a specific version of study
	  if (this.studyVersion != "") {
		  file["pdc_study_version"] = this.studyVersion;
	  } else {
		  //In all other cases assign default latest version of the study to which the file belongs
		  file["pdc_study_version"] = this.allStudiesVersions[file["submitter_id_name"]];
	  }
    }

    if (controlledFileFlag) {
      localStorage.setItem(
        "controlledFileTableExportCsv",
        JSON.stringify(dataForExport, [
          "file_id",
          "file_name",
          "study_run_metadata_submitter_id",
          "submitter_id_name",
          "pdc_study_id",
		  "pdc_study_version",
          "study_id",
		  "embargo_date",
          "project_name",
          "data_category",
          "file_type",
          "access",
          "file_size",
          "md5sum",
          "downloadable"
        ])
      );

      let access_token = localStorage.getItem("fence_access_token");
      let exp = 0;
      if (access_token !== null) {
        let decodedAccessToken = this.getDecodedAccessToken(access_token);
        exp = decodedAccessToken["exp"];
      }

      if (exp > Date.now() / 1000) {
        if (individualFileDownload) {
          //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
          //Set a flag if this is for individual file download.
          this.exportControlledCSV(null, access_token, false, true);
        } else {
          this.exportControlledCSV(null, access_token);
        }
      } else {
        localStorage.removeItem("fence_access_token");
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: { message: confirmationMessage, continueMessage: eRALogIn }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
            //If user clicks on "Cancel", stop loading the page
            this.displayLoading(iscompleteFileDownload, "file1", false);
          } else {
            if (controlledFileFlag) {
              if (result === "loginRequired") {
                  localStorage.setItem("controlledFileExportFlag", "true");
                  this.userService.logout();
                  document.location.href = window.location.origin + "/pdc/sp/authnih";
              } else if(result === "loginNotRequired"){
                  document.location.href = environment.dcf_fence_login_url.replace("%dcf_client_id%",environment.dcf_client_id);
              }
            }
          }
        });
      }
    } else {
      this.displayLoading(iscompleteFileDownload, "file1", true);
      //retrieve open file link
      //@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
      //@@PDC-6308 - remove embargo date tech advancement studies manifest
      let csvOptions = {
        headers: [
          "File ID",
          "File Name",
          "Run Metadata ID",
          "Study Name",
          "PDC Study ID",
		  "PDC Study Version",
          "Study ID",
          "Project Name",
          "Data Category",
          "File Type",
          "Access",
          "File Size (in bytes)",
          "Md5sum",
          "Downloadable",
          "File Download Link"
        ]
      };

      let exportFileObject: AllFilesData[] = JSON.parse(JSON.stringify(dataForExport, [
        "file_id",
        "file_name",
        "study_run_metadata_submitter_id",
        "submitter_id_name",
        "pdc_study_id",
		"pdc_study_version",
        "study_id",
        "project_name",
        "data_category",
        "file_type",
        "access",
        "file_size",
        "md5sum",
        "downloadable"
      ]));

      let openFileSignUrlMap = {};
      exportFileObject.forEach(item => openFileSignUrlMap[item.file_id] = '');
      const fileNameList = [];
      exportFileObject.map(x => fileNameList.push(x.file_name));
      //@@@PDC-1940: File manifest download is very slow
      //getFilesData API accepts upto 1000 file names per request. Else it takes more time to execute and impacts the performance.
      if (fileNameList.length > 1000) {
        var chunkSize = 1000;
        var count = 0;
        var loop = 0;
        for (var i = 0, len = fileNameList.length; i< len; i += chunkSize) {
          let tempArray = fileNameList.slice(i, i+chunkSize);
          let fileNameStr =  tempArray.join(";");
		  if (! this.isLegacyData){
			  //Send 1000 files names per request
			  //@@@PDC-1940: File manifest download is very slow
			  this.browseByFileService.getFilesData(fileNameStr, this.origin_study_id).subscribe((fileData: any) => {
				this.setFileExportObject(fileData, exportFileObject);
				count++;
				//In the last iteration, download the file manifest
				if (count == loop) {
				  this.displayLoading(iscompleteFileDownload, "file1", false);
				  if (count > 0) {
					  if (exportFormat == "csv"){
						new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
					  } else if (exportFormat == "pfb") {
              //@@@PDC-7018: Add PFB export option to Files Overlay Window
              this.loading = true;
              this.exportPFBFileManifest(exportFileObject);
              this.loading = false;
            } else {
						let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, csvOptions.headers);
						var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
						FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
					  }
				  }
				}
			  });
		  } else {
			  //@@@PDC-3937 Use new APIs for downloading legacy studies' files
			  this.browseByFileService.getLegacyFilesData(fileNameStr).subscribe((fileData: any) => {
				this.setLegacyFileExportObject(fileData, exportFileObject);
				count++;
				//In the last iteration, download the file manifest
				if (count == loop) {
				  this.displayLoading(iscompleteFileDownload, "file1", false);
				  //PDC-3985
				  //remove study version from legacy data manifest
				  csvOptions.headers.splice(5,1)
				  if (count > 0) {
					  if (exportFormat == "csv"){
						new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
					  } else if (exportFormat == "pfb") {
              //@@@PDC-7018: Add PFB export option to Files Overlay Window
              this.loading = true;
              this.exportPFBFileManifest(exportFileObject);
              this.loading = false;
            } else {
						let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, csvOptions.headers);
						var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
						FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
					  }
				  }
				}
			  });
		  }
          loop++;
        }
      } else {
          //@@@PDC-1940: File manifest download is very slow
          let fileNameStr = fileNameList.join(";")
		  if (! this.isLegacyData){
			  this.browseByFileService.getFilesData(fileNameStr, this.origin_study_id).subscribe((fileData: any) => {
				console.log(fileData);
				this.setFileExportObject(fileData, exportFileObject);
				this.displayLoading(iscompleteFileDownload, "file1", false);
				if (fileNameList.length > 0) {
					if (exportFormat == "csv"){
						new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
					} else if (exportFormat == "pfb") {
            //@@@PDC-7018: Add PFB export option to Files Overlay Window
            this.loading = true;
            this.exportPFBFileManifest(exportFileObject);
            this.loading = false;
          } else {
						let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, csvOptions.headers);
						var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
						FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
					}
				}
			  });
		  } else {
			  this.browseByFileService.getLegacyFilesData(fileNameStr).subscribe((fileData: any) => {
				console.log(fileData);
				this.setLegacyFileExportObject(fileData, exportFileObject);
				this.displayLoading(iscompleteFileDownload, "file1", false);
				//PDC-3985
				//remove study version from legacy data manifest
				csvOptions.headers.splice(5,1)
				if (fileNameList.length > 0) {
					if (exportFormat == "csv"){
						new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
					} else if (exportFormat == "pfb") {
            //@@@PDC-7018: Add PFB export option to Files Overlay Window
            this.loading = true;
            this.exportPFBFileManifest(exportFileObject);
            this.loading = false;
          } else {
						let exportTSVData = this.prepareTSVExportManifestData(exportFileObject, csvOptions.headers);
						var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
						FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
					}
				}
			  });
		  }
      }
    }
  }

  //@@@PDC-3419: Add PFB option to File Manifest download
  //@@@PDC-7018: Add PFB export option to Files Overlay Window
  //Prepare TSV data and send it to the Flask API for generating PFB files.
  async exportPFBFileManifest(exportFileObject) {
    let fileManifestName = this.getCsvFileName("csv")
    let exportfileobjectTSV = _.clone(exportFileObject);
    //Add 'submitter_id' to the TSV file. This field is required for generating a PFB file from TSV.
    for (var obj in exportfileobjectTSV) {
      let file_id = exportfileobjectTSV[obj]["file_id"];
      //Generate a random number and append it to the "submitter_id" field
      let randomNumber = Math.random();
      let randomNumberArr = randomNumber.toString().split(".");
      //The submitter_id should be unique. Else, the PFB object cannot be loaded in Terra server.
      exportfileobjectTSV[obj]["submitter_id"] = file_id + "_" + randomNumberArr[1];
      //@@@PDC-3509: Add DRS URL to files in the PFB manifest
      exportfileobjectTSV[obj]["object_id"] = "dg.4DFC:" + file_id;
      //The following are only test fields and are required for the PFB file generation
      exportfileobjectTSV[obj]["gh4gh_drs_uri"] = "drs://dg.4DFC:" + file_id;
      exportfileobjectTSV[obj]["a"] = "file";
      exportfileobjectTSV[obj]["ab"] = file_id;
    }
    //Rename "file_download_link", "md5sum" and "submitter_id_name" to match the PDC schema built for PFB
    Object.keys(exportfileobjectTSV).forEach(function (key) {
      exportfileobjectTSV[key].file_location = exportfileobjectTSV[key].file_download_link;
      delete exportfileobjectTSV[key].file_download_link;
      exportfileobjectTSV[key].study_name = exportfileobjectTSV[key].submitter_id_name;
      delete exportfileobjectTSV[key].submitter_id_name;
      exportfileobjectTSV[key].file_md5sum = exportfileobjectTSV[key].md5sum;
      delete exportfileobjectTSV[key].md5sum;
    });
    //console.log(exportfileobjectTSV);
    let data = {'fileManifestName': fileManifestName}
    exportfileobjectTSV.push(data);
    //console.log(exportfileobjectTSV);
    let exportTSVData = JSON.stringify(exportfileobjectTSV);
    //let request = this.http.post("http://127.0.0.1:5000", exportTSVData);
    let request = this.http.post(environment.flask_api_url, exportTSVData);
    request.subscribe((response) => {
      if (response) {
        window.open(response.toString(), "_blank");
      } else {
        console.log("Something went wrong!");
      }
    },
    (error) =>  {
      console.log("Something went wrong!", error);
    })
  }

  //@@@PDC-1940: File manifest download is very slow
  setFileExportObject(fileData, exportFileObject) {
    if (fileData && fileData.uiFilesPerStudy) {
      for (var fileItem of fileData.uiFilesPerStudy) {
        //Fetch the file object in 'exportFileObject' that has the same file id.
        let fileObject = exportFileObject.filter(item => item.file_id === fileItem.file_id);
        for (var fileObj of fileObject) {
        console.log(fileObj);
          if (fileObj) {
            if (fileObj.downloadable.toLowerCase() === 'yes') {
              if (fileItem.signedUrl) {
                fileObj['file_download_link'] = fileItem.signedUrl.url;
              } else {
                fileObj['file_download_link'] = this.notDownloadable;
              }
            } else {
              fileObj['file_download_link'] = this.notDownloadable;
            }
          }
        }
      }
    if (fileData && fileData.uiFilesPerStudy.length == 0) {
      exportFileObject.forEach(item => item['file_download_link'] = "not found");
    }
  }
	console.log(exportFileObject);
  }

  //@@@PDC-3937 Use new APIs for downloading legacy studies' files
  setLegacyFileExportObject(fileData, exportFileObject) {
    for (var fileItem of fileData.uiLegacyFilesPerStudy) {
      //Fetch the file object in 'exportFileObject' that has the same file id.
      let fileObject = exportFileObject.filter(item => item.file_id === fileItem.file_id);
      for (var fileObj of fileObject) {
		  console.log(fileObj);
        if (fileObj) {
          if (fileObj.downloadable.toLowerCase() === 'yes') {
            if (fileItem.signedUrl) {
              fileObj['file_download_link'] = fileItem.signedUrl.url;
            } else {
              fileObj['file_download_link'] = this.notDownloadable;
            }
          } else {
            fileObj['file_download_link'] = this.notDownloadable;
          }
        }
      }
    }
	if (fileData.uiLegacyFilesPerStudy.length == 0) {
		exportFileObject.forEach(item => item['file_download_link'] = "not found");
	}
	console.log(exportFileObject);
  }

  //@@@PDC-1765 add download prompt
  setDownloadBatch() {
	let dataForExport =  this.selectedFiles;
	let totalSize = 0;
    for (let file of dataForExport) {
		totalSize += parseInt(file.file_size);
	}
	console.log("Total file size to download: "+totalSize);
	let confirmationMessage = 'You are about to download ' + this.sizeUnitsPipe.transform(totalSize) + ' of data. Do you wish to proceed?';
	let denyMessage = 'Your download request ('+this.sizeUnitsPipe.transform(totalSize)+') exceeds the limit of 20 GB. Please reduce the volumn and try again.';
	let nextMsg = 'Continue';
	if (totalSize <= 21474836480) {
	    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: { message: confirmationMessage, continueMessage: nextMsg }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
          }
		  else {
			console.log("Let's download.");
			this.downloadBatch();
		  }
		  });
	}
	else {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: { message: denyMessage, continueMessage: nextMsg }
        });

        dialogRef.afterClosed().subscribe(result => {
		  });
	}
  }

  async downloadBatch() {
    let dataForExport =  this.selectedFiles;
    let urls: string = "";
    let nextMsg = 'Continue';
    const fileNameList = [];
    var that = this;
    if (dataForExport) {
      dataForExport.map(x => fileNameList.push(x.file_name));
      if (!this.isLegacyData){
        //@@@PDC-1940: File manifest download is very slow
        //getFilesData API accepts upto 1000 file names per request. Else it takes more time to execute and impacts the performance.
        if (fileNameList.length > 1000) {
          var chunkSize = 1000;
          for (var i = 0, len = fileNameList.length; i< len; i += chunkSize) {
            let tempArray = fileNameList.slice(i, i+chunkSize);
            let fileNameStr =  tempArray.join(";");
            //Send 1000 files names per request
            //@@@PDC-1940: File manifest download is very slow
            this.getFilesDataObj(fileNameStr);
          }
        }  else {
          //@@@PDC-1940: File manifest download is very slow
          let fileNameStr = fileNameList.join(";")
          this.getFilesDataObj(fileNameStr);
        }
      } else {
        if (fileNameList.length > 1000) {
          var chunkSize = 1000;
          for (var i = 0, len = fileNameList.length; i< len; i += chunkSize) {
            let tempArray = fileNameList.slice(i, i+chunkSize);
            let fileNameStr =  tempArray.join(";");
            //@@@PDC-3937 Use new APIs for downloading legacy studies' files
            this.getLegacyFilesDataObj(fileNameStr);
        }
      } else {
        let fileNameStr = fileNameList.join(";")
        this.getLegacyFilesDataObj(fileNameStr);
      }
      }
    }
  }

  //@@@PDC-4781: Use filesPerStudy API to return signed urls for multiple files
  getLegacyFilesDataObj(fileNameStr) {
    this.browseByFileService.getLegacyFilesData(fileNameStr).pipe(take(1)).subscribe((fileData: any) => {
      for (var fileItem of fileData.uiLegacyFilesPerStudy) {
        if (fileItem.signedUrl) {
          let confirmationMessage = 'Finished downloading: '+ fileItem.file_name;
          //@@@PDC-1925 use window.open for multiple download
          this.winOpenS3File(fileItem.signedUrl.url, fileItem.file_name).alert(confirmationMessage);
          this.sleep(2000);
        } else {
          console.log("Error in downloading: " + fileItem.file_name);
        }
      }
    });
  }

  //@@@PDC-4781: Use filesPerStudy API to return signed urls for multiple files
  getFilesDataObj(fileNameStr) {
    this.browseByFileService.getFilesData(fileNameStr, "").pipe(take(1)).subscribe((fileData: any) => {
      for (var fileItem of fileData.uiFilesPerStudy) {
        if (fileItem.signedUrl) {
          let confirmationMessage = 'Finished downloading: '+ fileItem.file_name;
          //@@@PDC-1925 use window.open for multiple download
          this.winOpenS3File(fileItem.signedUrl.url, fileItem.file_name).alert(confirmationMessage);
          this.sleep(2000);
        } else {
          console.log("Error in downloading: " + fileItem.file_name);
        }
      }
    });
  }

  getS3File(url){
	return this.http.get(url, {responseType: 'blob'});
  }

  //@@@PDC-1925 use window.open for multiple download
  winOpenS3File(url, filename){
	  if (this.checkFilenameExtentions(filename)) {
		return window.open(url, "_blank");
	  } else {
		return window.open(url, "_self");
	  }
  }

  sleep(milliseconds) {
	  const date = Date.now();
	  let currentDate = null;
	  do {
		currentDate = Date.now();
	  } while (currentDate - date < milliseconds);
  }

  private getOpenFileSignedUrl(openFileSignUrlMap){
    let fileIdList : string[] = Object.keys(openFileSignUrlMap);
  }

  //Help function that returns true if parameter date is in the future, otherwise false
	private isDateLater(embargo_date: string):boolean{
		var now = new Date;
		var target = new Date(embargo_date);
		if (target > now )
			return true;
		else {
			return false;
		}
	}

	//If the date is in the future the value should be bold and in italics
	getStyleClass(embargo_date: string){
		if (this.isDateLater(embargo_date) )
			return 'future_embargo_date';
		else {
			return '';
		}
	}

  //@@@PDC-729 Integrate PDC with Fence and IndexD
  //@@@PDC-784 Improve download controlled files feature
  //@@@PDC-801 For files that are marked downloadable call API to get signed URL and include in manifest
  private async exportControlledCSV(authorizationCode: string, existAccessToken: string, fenceRequest:boolean = false, individualFileDownload:boolean = false) {
    if (fenceRequest) {
        this.displayLoading(true, "fenceRequestcontrolFiles", true);
    } else {
        this.displayLoading(true, "controlFiles", true);
    }
    let controlledFileObject = localStorage.getItem("controlledFileTableExportCsv");
    let exportFileObject: AllFilesData[] = JSON.parse(controlledFileObject);

    const uuidList = [];
    exportFileObject.map(x => uuidList.push(x.file_id));

    var metaDataRecords;
    //searchForFileIndex API accepts upto 85 file IDs per request. Else it throws URI Too Long error
    if (uuidList.length > 85) {
        var chunkSize = 85;
        for (var i=0,len=uuidList.length; i<len; i+=chunkSize) {
            let tempArray = uuidList.slice(i,i+chunkSize);
            //Send 85 files Ids per request
            let tempMetaData = await this.browseByFileService.searchForFileIndex(tempArray);
            let tempMetaDataRecs = _.values(tempMetaData.records);
            metaDataRecords = _.concat(tempMetaDataRecs, metaDataRecords);
        }
    } else {
        let fileIndexMetaData = await this.browseByFileService.searchForFileIndex(uuidList);
        metaDataRecords = fileIndexMetaData.records;
    }

    let guidMap = {};
    for (let metaData of metaDataRecords) {
      if (metaData) {
        guidMap[metaData["baseid"]] = metaData["did"].slice(8);
      }
    }

    let accessToken = "";
    if (existAccessToken != null) {
      accessToken = existAccessToken;
    } else {
      let tokenPayload = await this.browseByFileService.exchangeForAccessToken(
        authorizationCode
      );
      accessToken = tokenPayload["access_token"];
      localStorage.setItem("fence_access_token", accessToken);
    }

    let signedUrlMap = {};

    let message = "User controlled files download finished.";

    for (const i of Object.keys(guidMap)) {
      let guid = i + "";
      let signedUrl = "not authorized";
      try {
        let urlResponse = await this.browseByFileService.getSignedUrlFromFence(
          accessToken,
          guid
        );
        signedUrl = urlResponse.url;
      } catch (error) {
          console.log(error);
      }
      signedUrlMap[guidMap[guid]] = signedUrl;
    }

    let controlledFilesIds = [];

    exportFileObject.forEach(item => {
      if (item.access.toLowerCase() === "controlled") {
        controlledFilesIds.push(item.file_id);
      }
    });

    var casePerFileInfo;
    //getControlledFilesDetails API accepts upto 135 control file IDs per request. Else it throws URI Too Long error
	//@@@PDC-1123 call ui wrapper API
    if (controlledFilesIds.length > 130) {
        var chunkSize = 130;
        for (var i=0,len=controlledFilesIds.length; i<len; i+=chunkSize) {
            let tempArray = controlledFilesIds.slice(i,i+chunkSize);
            // send 130 file Ids per request.
            let tempDetails = await this.browseByFileService.getControlledFilesDetails(
                tempArray.join(";")
            );
            let tempCaseRecs = _.values(tempDetails["data"]["uiCasePerFile"]);
            casePerFileInfo = _.concat(tempCaseRecs, casePerFileInfo);
        }
    } else {
        let filesDetails = await this.browseByFileService.getControlledFilesDetails(
            controlledFilesIds.join(";")
        );
        casePerFileInfo = filesDetails["data"]["uiCasePerFile"];
    }

    const filesMap = new Map();

    casePerFileInfo.forEach(item => {
        if (item) {
            filesMap.set(item["file_id"], item);
        }
    });

    let unauthorizedStudy = new Set<string>();
    var downloadLink = "";
    for (let exportFile of exportFileObject) {
      if (exportFile.study_run_metadata_submitter_id === null) {
        exportFile.study_run_metadata_submitter_id = "";
      }
	  //If studyVersion value is set assign it to each of the files
	  //since the user opened Browse page to view files for a specific version of study
	  if (this.studyVersion) {
		  exportFile["pdc_study_version"] = this.studyVersion;
	  } else {
		  //In all other cases assign default latest version of the study to which the file belongs
		  exportFile["pdc_study_version"] = this.allStudiesVersions[exportFile["submitter_id_name"]];
	  }
      let file_id = exportFile.file_id;
      delete exportFile.file_id;
      exportFile["file_id"] = file_id;
      if (exportFile.access.toLowerCase() === "controlled") {
        if(signedUrlMap[file_id] === "not authorized"){
          unauthorizedStudy.add(exportFile['study_id']);
        }
        let caseInfo = filesMap.get(file_id);
        exportFile["case_id"] = caseInfo["case_id"];
        exportFile["case_submitter_id"] = caseInfo["case_submitter_id"];
        exportFile["file_download_link"] = signedUrlMap[file_id];
      } else {
        exportFile["case_id"] = "";
        exportFile["case_submitter_id"] = "";
        if(exportFile.downloadable.toLowerCase() === 'yes'){
          //@@@PDC-1940: File manifest download is very slow
          //This code should be changed to use 'getFilesData' API which accepts upto 1000 file names per request.
          //Not changing now as we don't have sufficient data to test.
          //let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(exportFile.file_name);
		  //@@@PDC-5770 get file using uuid
		  console.log("Export file id 0929: "+exportFile.file_id);
          let urlResponse = await this.browseByFileService.getOpenFileUuidSignedUrl(exportFile.file_id);
          if(!urlResponse.error){
            if (individualFileDownload) {
              //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
              //If its an individual file download, assign the download link to a variable.
              downloadLink = urlResponse.data;
            } else {
              exportFile['file_download_link'] = urlResponse.data;
            }
          }else{
            if (individualFileDownload) {
              //If its an individual file download, display the confirmantion message that the download link is not available.
              this.displayMessageForNotDownloadable();
            } else {
              exportFile['file_download_link'] = this.notDownloadable;
            }
          }
        }else{
          if (individualFileDownload) {
            this.displayMessageForNotDownloadable();
          } else {
            exportFile['file_download_link'] = this.notDownloadable;
          }
        }
      }
      delete exportFile.downloadable;
      //@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
      //Commenting this code as it might be required in the future
      //delete exportFile['study_id'];
      let loggedInEmail = sessionStorage.getItem('loginEmail');
      let loggedInUser = sessionStorage.getItem('loginUser');
      let controlledFileDownloadInfo = {
        "fileName":exportFile["file_id"],
        "userName":loggedInUser,
        "emailAddress":loggedInEmail
      };
      await this.browseByFileService.recordControlledFileDownload(controlledFileDownloadInfo);
    }

    if(unauthorizedStudy.size >0){
      let studyList = Array.from(unauthorizedStudy).join(', ');
      if(unauthorizedStudy.size >1){
        message = `You do not have access to the controlled access data you requested. Request access via Authorized Access at dbGaP for the studies ${studyList}`;
      }else{
        message = `You do not have access to the controlled access data you requested. Request access via Authorized Access at dbGaP for the study ${studyList}`;
      }
    }
    if (individualFileDownload) {
      //If its an individual file download, open the download link and start file download.
      // do not download the file manifest
      if (downloadLink) {
        window.open(downloadLink, "_self");
      }
    } else {
    //@@@PDC-1789: Add study_submitter_id and study_id to exported study manifests
    let csvOptions = {
      headers: [
        "File ID",
        "File Name",
        "Run Metadata ID",
        "Study Name",
        "PDC Study ID",
		"PDC Study Version",
        "Study ID",
        "Project Name",
        "Data Category",
        "File Type",
        "Access",
        "File Size (in bytes)",
        "Md5sum",
        "Case ID",
        "Case Submitter ID",
        "File Download Link"
      ]
    };
    const csvFileName = this.getCsvFileName("csv");
    new ngxCsv(exportFileObject, csvFileName, csvOptions);
  }
  if (fenceRequest) {
    this.displayLoading(true, "fenceRequestcontrolFiles", false);
  } else {
      this.displayLoading(true, "controlFiles", false);
  }
    localStorage.removeItem("controlledFileTableExportCsv");
    this.dialog.open(MessageDialogComponent, {
      width: "300px",
      disableClose: true,
      autoFocus: false,
      hasBackdrop: true,
      data: { message: message }
    });
    //delete csvOptions.headers;
  }

  //help function preparing a string containing the data for TSV manifest file (PDC-3265)
	prepareTSVExportManifestData(manifestData, headers){
		let result = "";
		let separator = '\t';
		let EOL = "\r\n";
		for (var i=0; i< headers.length; i++) {
			result += headers[i] + separator;
		}
		result = result.slice(0, -1);
		result += EOL;
		for (var i=0; i < manifestData.length; i++){
			for (const index in manifestData[i]) {
				if (manifestData[i][index] == null) {
					result += "null" + separator;
				} else {
					result += manifestData[i][index] + separator;
				}
			}
			result = result.slice(0, -1);
			result += EOL;
		}
		return result;
	}

  private getCsvFileName(format = "csv"): string {
    let csvFileName = "PDC_file_manifest_";
    const currentDate: Date = new Date();
    let month: string = "" + (currentDate.getMonth() + 1);
    csvFileName += this.convertDateString(month);
    let date: string = "" + currentDate.getDate();
    csvFileName += this.convertDateString(date);
    csvFileName += "" + currentDate.getFullYear();
    let hour: string = "" + currentDate.getHours();
    csvFileName += "_" + this.convertDateString(hour);
    let minute: string = "" + currentDate.getMinutes();
    csvFileName += this.convertDateString(minute);
    let second: string = "" + currentDate.getSeconds();
    csvFileName += this.convertDateString(second);
	if (format === "tsv") {
		csvFileName += ".tsv";
	}
    return csvFileName;
  }

  private convertDateString(value: string): string {
    if (value.length === 1) {
      return "0" + value;
    } else {
      return value;
    }
  }

  private getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

	ngOnInit() {// Have to define this structure for Primeng CSV export to work properly
    this.cols = [
	  {field: "pdc_study_id", header: "PDC Study ID"},
      { field: "submitter_id_name", header: "Study" },
	  {field: "embargo_date", header: "Embargo Date"},
      { field: "file_name", header: "File Name" },
      { field: "study_run_metadata_submitter_id", header: "Run Metadata ID" },
      { field: "project_name", header: "Project" },
      { field: "data_category", header: "Data Category" },
      { field: "file_type", header: "File Type" },
      { field: "access", header: "Access" },
      { field: "file_size", header: "File Size (in bytes)" },
      { field: "file_id", header: "File ID" },
      { field: "downloadable", header: "Downloadable" }
    ];

    this.frozenCols = [
      {field: "pdc_study_id", header: "PDC Study ID"}
    ];

    //@@@PDC-729 Integrate PDC with Fence and IndexD
    this.activeRoute.queryParams.subscribe(queryParams => {
      console.log(queryParams);
      if (queryParams.code) {
        this.fenceRequest =  true;
        var controlFilesIndividualFileDownload = false;
        //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
        if (localStorage.getItem("controlFilesIndividualFileDownload")) {
          controlFilesIndividualFileDownload = true;
        }
        setTimeout(() => {
          if (localStorage.getItem("controlledFileTableExportCsv") && !controlFilesIndividualFileDownload) {
            // Do not select the files if its an individual file download.
            this.selectedFiles = JSON.parse(localStorage.getItem("controlledFileTableExportCsv"));
          }
        }, 1000);
        if (controlFilesIndividualFileDownload) {
          //@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
          localStorage.removeItem("controlFilesIndividualFileDownload");
          this.exportControlledCSV(queryParams.code, null, true, true);
        } else {
          this.exportControlledCSV(queryParams.code, null, true);
        }
      }
    });
    //@@@PDC-918: Add button to allow download of full file manifest
    this.checkboxOptions = ["Select all pages", "Select this page", "Select None"];
  }

  private clearSelection(){
    this.selectedFiles = [];
    this.headercheckbox = false;
    this.currentPageSelectedFile = [];
    this.pageHeaderCheckBoxTrack = [];
    this.selectedHeaderCheckbox = '';
  }

  private trackCurrentPageSelectedFile(filteredFilesData: AllFilesData[]){
    let fileIdList = [];
    this.currentPageSelectedFile = [];
    filteredFilesData.forEach((item) => fileIdList.push(item.file_id));
	//Keeping consistency - identify a selected file by file id and study name
    this.selectedFiles.forEach(item => {if(fileIdList.indexOf(item.file_id) !== -1){
      this.currentPageSelectedFile.push(item.file_id + "-" + item.pdc_study_id);
    }});
  }

	close() {
	//this.router.navigate([{outlets: {'studySummary': null}}], { replaceUrl: true });
	//this.loc.replaceState(this.router.url);
	//sessionStorage.removeItem('currentVersion');
	//console.log("CLOSE study_name: " + study_name);
	//if ( navigateToHeatmap ) {
	// Route to the first heatmap
	//	const navigationExtras: NavigationExtras = {
	//	queryParams: {
	//					'StudyName': study_name,
	//			}
	//		};
	//	  this.router.navigate([]).then( result => { var url= "/pdc/analysis/" + this.pdcStudyID + "?StudyName=" + study_name;
	//																   window.open(url, '_blank'); });
	//  }
		this.router.navigate([{outlets: {filesOverlay : null}}], { replaceUrl: true });
		this.loc.replaceState(this.router.url);
        this.dialogRef.close();
}

onResize(event) {
  this.makeRowsSameHeight();
}

makeRowsSameHeight() {
  setTimeout(() => {
    if (document.getElementsByClassName('ui-table-scrollable-wrapper').length) {
      let wrapper = document.getElementsByClassName('ui-table-scrollable-wrapper');
      for (var i = 0; i < wrapper.length; i++) {
          let w = wrapper.item(i) as HTMLElement;
          let frozen_rows: any = w.querySelectorAll('.ui-table-frozen-view .ui-table-tbody tr');
          let unfrozen_rows: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-tbody tr');
          let frozen_header_row: any = w.querySelectorAll('.ui-table-frozen-view .ui-table-thead tr');
          let unfrozen_header_row: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-thead');
          if (frozen_header_row[0].clientHeight > unfrozen_header_row[0].clientHeight) {
            unfrozen_header_row[0].style.height = frozen_header_row[0].clientHeight+"px";
          }
          else if (frozen_header_row[0].clientHeight < unfrozen_header_row[0].clientHeight) {
            frozen_header_row[0].style.height = unfrozen_header_row[0].clientHeight+"px";
          }
          for (let i = 0; i < frozen_rows.length; i++) {
            if (frozen_rows[i].clientHeight > unfrozen_rows[i].clientHeight) {
              unfrozen_rows[i].style.height = frozen_rows[i].clientHeight+"px";
            }
            else if (frozen_rows[i].clientHeight < unfrozen_rows[i].clientHeight) {
              frozen_rows[i].style.height = unfrozen_rows[i].clientHeight+"px";
            }
          }
          let frozen_header_div: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-scrollable-header-box');
          frozen_header_div[0].setAttribute('style', 'margin-right: 0px !important');
        }
      }
     });
  }


}
