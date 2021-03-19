import { MessageDialogComponent } from "./../../dialog/message-dialog/message-dialog.component";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Apollo } from "apollo-angular";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { take } from 'rxjs/operators';
import { Table } from "primeng/table";
import { environment } from "../../../environments/environment";
import { WorkflowManagerComponent } from "../../analysis/workflow-manager/workflow-manager.component";
import { PDCUserService } from "../../pdcuser.service";
import { AllFilesData } from "../../types";
import { ConfirmationDialogComponent } from "./../../dialog/confirmation-dialog/confirmation-dialog.component";
import { BrowseByFileService } from "./browse-by-file.service";
import * as jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from "@angular/common/http";
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import { SizeUnitsPipe } from '../../sizeUnitsPipe.pipe';

@Component({
  selector: "browse-by-file",
  templateUrl: "./browse-by-file.component.html",
  styleUrls: ["../../../assets/css/global.css", "./browse-by-file.component.css"],
  providers: [BrowseByFileService, SizeUnitsPipe]
})

//@@@PDC-169 The user should be able to browse data by File
//@@@PDC-237 Pagination
//@@@PDC-244 Table rows selection and download
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-262 get dictionary base url from environment object
//@@@PDC-518 Rearrange and update text on the browse page tabs and download
//@@@PDC-522 Change the file filters to a new filters tab
//@@@PDC-535 Add Clinical filters
//@@@PDC-567 Add sample_type filter
//@@@PDC-616 Add acquisition type to the general filters
//@@@PDC-729 Integrate PDC with Fence and IndexD
//@@@PDC-784 Improve download controlled files feature
//@@@PDC-775: Add new downloadable filter option to file filters
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-820 row selections cross pagination
//@@@PDC 829: Update study count in the redirected fence page which retaining filters
//@@@PDC-937: Add a button to allow download all manifests with a single click
//@@@PDC-918: Add button to allow download of full file manifest
//@@@PDC-1303: Add a download column and button for downloading individual files to the file tab
//@@@PDC-1416 add unit to file size in file manifest
//@@@PDC-2795: add embargo date to file tab on Browse page and file manifest
//@@@PDC-3265: Add TSV format manifest download for Files tab on Browse page
//@@@PDC-3268: Browse File selection check box in does not select all 
export class BrowseByFileComponent implements OnInit {
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
  selectedFileFilters: FormControl = new FormControl();
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

  //@ViewChild('dt') dt: Table;

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

  constructor(
    private apollo: Apollo,
	private http: HttpClient,
    private browseByFileService: BrowseByFileService,
    private dialog: MatDialog,
	private sizeUnitsPipe: SizeUnitsPipe,
    private activeRoute: ActivatedRoute,
    private userService: PDCUserService
  ) {
    // Array which holds filter names. Must be updated when new filters are added to browse page. 
    this.newFilterSelected = {
      program_name: "",
      project_name: "",
      study_name: "",
      submitter_id_name: "",
      disease_type: "",
      primary_site: "",
      analytical_fraction: "",
      experiment_type: "",
      ethnicity: "",
      race: "",
      gender: "",
      tumor_grade: "",
      sample_type: "",
      acquisition_type: "",
      data_category: "",
      file_type: "",
      access: "",
      downloadable: "",
      studyName_genes_tab: "",
      biospecimen_status: "", 
      case_status: ""
    };
    this.offset = 0; //Initialize values for pagination
    this.limit = 10;
    this.totalRecords = 0;
    this.pageSize = 10;
    this.getAllFilesData();
    this.selectedFileFilters = new FormControl();
    this.sort = "";
    BrowseByFileComponent.urlBase = environment.dictionary_base_url;
  }

  onTableHeaderCheckboxToggle() {
    console.log(this.headercheckbox);
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
    }else{
      this.selectedFiles = [];
      this.currentPageSelectedFile = [];
      this.pageHeaderCheckBoxTrack = [];
      this.selectedHeaderCheckbox = '';
    }
  }

  //@@@PDC-820 row selections cross pagination
  onRowSelected(event:any){
    this.currentPageSelectedFile.push(event.data.file_id + "-" + event.data.pdc_study_id);
    if(this.currentPageSelectedFile.length === this.pageSize){
      this.headercheckbox = true;
    }
  }

  //@@@PDC-820 row selections cross pagination
  onRowUnselected(event){
    let index = this.currentPageSelectedFile.indexOf(event.data.file_id + "-" + event.data.pdc_study_id);
    if(index >-1){
      this.currentPageSelectedFile.splice(index,1);
    }
    if(this.currentPageSelectedFile.length === this.pageSize){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
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

  get staticUrlBase() {
    return BrowseByFileComponent.urlBase;
  }

  showStudySummary() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.hasBackdrop = true;
    dialogConfig.minWidth = "80%";
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.data = {
      summaryData: this.selectedFiles
    };
    const dialogRef = this.dialog.open(WorkflowManagerComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(val => console.log("Dialog output:", val));
  }
  /*API call to get all cases data */
  getAllFilesData() {
    this.loading = true;
    setTimeout(() => {
      this.browseByFileService
        .getFilteredFilesPaginated(
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
          this.loading = false;
        });
    }, 1000);
  }

  applySelectFilter(filterValues: string) {
    // console.log(event.value);
    // console.log(this.selectedFileFilters);
    // this.newFilterValue.fileTypes = [];
    this.newFilterSelected["file_type"] = filterValues.split(":")[1];
    this.loading = true;
    console.log(this.newFilterSelected);
    this.browseByFileService
      .getFilteredFilesPaginated(
        this.offset,
        this.limit,
        this.sort,
        this.newFilterSelected
      )
      .subscribe((data: any) => {
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
        this.loading = false;
        this.clearSelection();
      });
    //	 this.getAllFilesData();
  }

  applyFilterOnFilterChanged() {
    this.filteredFilesData = [];
    if (this.newFilterValue) {
      console.log(this.newFilterValue);
      var filter_field = this.newFilterValue.split(":"); //the structure is field_name: "value1;value2"
      //If clear all filter selection button was pressed need to clear all filters
      if (filter_field[0] === "Clear all selections") {
        for (let filter_name in this.newFilterSelected) {
          this.newFilterSelected[filter_name] = "";
        }
      } else if (filter_field[0] === "Clear all clinical filters selections") {
        //console.log(this.newFilterSelected);
        this.newFilterSelected["ethnicity"] = "";
        this.newFilterSelected["race"] = "";
        this.newFilterSelected["gender"] = "";
        this.newFilterSelected["tumor_grade"] = "";
        this.newFilterSelected["case_status"] = "";
      } else if (filter_field[0] === "Clear all general filters selections") {
        //console.log(this.newFilterSelected);
        this.newFilterSelected["program_name"] = "";
        this.newFilterSelected["project_name"] = "";
        //this.newFilterSelected["study_name"] = "";
        this.newFilterSelected["disease_type"] = "";
        this.newFilterSelected["primary_site"] = "";
        this.newFilterSelected["analytical_fraction"] = "";
        this.newFilterSelected["experiment_type"] = "";
        this.newFilterSelected["acquisition_type"] = "";
        this.newFilterSelected["biospecimen_status"] = "";
        this.newFilterSelected["case_status"] = "";
      } else if (filter_field[0] === "Clear all biospecimen filters selections") {
        this.newFilterSelected["sample_type"] = "";
        this.newFilterSelected["study_name"] = "";
        this.newFilterSelected["biospecimen_status"] = "";
      } else if (filter_field[0] === "Clear all file filters selections") {
        this.newFilterSelected["study_name"] = "";
        this.newFilterSelected["data_category"] = "";
        this.newFilterSelected["file_type"] = "";
        this.newFilterSelected["access"] = "";
        this.newFilterSelected["downloadable"] = "";
      } else if (filter_field[0] === "Clear all genes filters selections") {
        this.newFilterSelected["study_name"] = "";
      } else {
        this.newFilterSelected[filter_field[0]] = filter_field[1];
      }
      //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
      //If its a fence request, set filters from local storage
      var selectedFiltersForBrowse = JSON.parse(localStorage.getItem("selectedFiltersForBrowse"));
      if (this.fenceRequest && selectedFiltersForBrowse && !this.isFenceReloaded) {
        for (var i=0;i<this.allFilterCategory.length;i++) {
          if (selectedFiltersForBrowse[this.allFilterCategory[i]]) {
            var filterName = this.allFilterCategory[i];
            var filterVal = selectedFiltersForBrowse[filterName];
            //special case for study name
            if (filterName == "submitter_id_name") {
              selectedFiltersForBrowse["study_name"] = filterVal.join(";");
            }  else if (filterName == "studyName_genes_tab") {
              selectedFiltersForBrowse["study_name"] = filterVal;
            } else {
              selectedFiltersForBrowse[filterName] = filterVal.join(";");
            }
          }
        }
        this.newFilterSelected = selectedFiltersForBrowse;
      }
      this.offset = 0; //Reinitialize offset for each new filter value
      this.loading = true;
	  //@@@PDC-3366 selection of files was cleared since this API call was made more than once
	  // adding pipe(take(1)) prevents from getting back to this API call repeated;y
      this.browseByFileService
        .getFilteredFilesPaginated(
          this.offset,
          this.limit,
          this.sort,
          this.newFilterSelected
        )
		.pipe(take(1))
        .subscribe((data: any) => {
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
          //@@@PDC 829: Update study count in the redirected fence page which retaining filters
          //Special case for retaining browser filters: Do not clear selected data when filters should be retained.
          if (this.fenceRequest && selectedFiltersForBrowse && !this.isFenceReloaded) {
            this.trackCurrentPageSelectedFile(this.selectedFiles);
            //Select header checkbox if all rows in the current page are selected.
            if(this.selectedFiles.length === this.pageSize){
              this.headercheckbox = true;
            }
            this.isFenceReloaded = true;
          } else {
            this.clearSelection();
          }
          this.loading = false;
        });
    }
  }
  //@@@PDC-522 handle two type of events 1 general filters event 2 files filters
  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      let change = changes[propName];
      if (change.currentValue !== undefined) {
        switch (propName) {
          case "newFilesFilterValue":
            this.applySelectFilter(change.currentValue);
            break;
          case "newFilterValue":
            this.applyFilterOnFilterChanged();
            break;
        }
      }
    }

    setTimeout(() => {
	//PDC-3265 Check what is the current manifest format
	  if (this.downloadAllManifests != undefined){
		  this.manifestFormat = this.downloadAllManifests.split('*')[1];
	  }
      //@@@PDC-937: Add a button to allow download all manifests with a single click
      if (changes['otherTabsLoaded'] && changes['otherTabsLoaded'].currentValue) {
        this.fileExportCompleteManifest(true);
      }
      if (changes['handleTableLoading'] && changes['handleTableLoading'].currentValue) {
        var handleTableloading = changes['handleTableLoading'].currentValue;
        let loadingVal = handleTableloading.split(':');
        this.loading = JSON.parse(loadingVal[1]);
      }
    }, 10);

    if (changes['enableDownloadAllManifests'] && changes['enableDownloadAllManifests'].currentValue >= 0) {
      this.filtersSelected = JSON.parse(changes['enableDownloadAllManifests'].currentValue);
    }
  }

  //@@@PDC-497 (onLazyLoad)="loadFiles($event)" will be invoked when sort event fires
  loadFiles(event: any) {
    if(event.rows !== this.pageSize){
      this.clearSelection();
    }
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
    this.browseByFileService
      .getFilteredFilesPaginated(
        this.offset,
        this.limit,
        this.sort,
        this.newFilterSelected
      )
      .subscribe((data: any) => {
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
        this.loading = false;
        this.trackCurrentPageSelectedFile(data.getPaginatedUIFile.uiFiles);
      });
    if(this.pageHeaderCheckBoxTrack.indexOf(this.offset) !== -1){
      this.headercheckbox = true;
    }else{
      this.headercheckbox = false;
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
        this.browseByFileService
        .getFilteredFilesPaginated(
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
            this.headercheckbox = true;
          }
          this.displayLoading(buttonClick, "file", false); 
        });
      }, 1000);
    }
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
          let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(file.file_name);
          if (!urlResponse.error) {
            downloadLink = urlResponse.data;
          } else {
            this.displayMessageForNotDownloadable();
          }
        } else{
          this.displayMessageForNotDownloadable();
        }  
      }
      if (downloadLink) {
        //If the download file link is available, open the download link and start file download.
        window.open(downloadLink, "_self");
      }
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
      let csvOptions = {
        headers: [
          "File ID",
          "File Name",
          "Run Metadata ID",
          "Study Name",
          "PDC Study ID",
          "Study ID",
		  "Embargo Date",
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
        "study_id",
		"embargo_date",
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
          //Send 1000 files names per request
          //@@@PDC-1940: File manifest download is very slow
          this.browseByFileService.getFilesData(fileNameStr).subscribe((fileData: any) => {
            this.setFileExportObject(fileData, exportFileObject);
            count++;
            //In the last iteration, download the file manifest
            if (count == loop) {
              this.displayLoading(iscompleteFileDownload, "file1", false);
			  if (count > 0) {
				  if (exportFormat == "csv"){
					new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
				  } else {
					let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
					var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
					FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
				  }
			  }
            }
          }); 
          loop++;
        }
      } else {
          //@@@PDC-1940: File manifest download is very slow
          let fileNameStr = fileNameList.join(";")
          this.browseByFileService.getFilesData(fileNameStr).subscribe((fileData: any) => {
			  //PDC-3366 files selection was cleared when the execution got here
			  //bandaid solution was to refill selected files values like this:
			  //this.selectedFiles = dataForExport;
			  //Better solution was to prevent the call to clearSelection() function
            this.setFileExportObject(fileData, exportFileObject);
            this.displayLoading(iscompleteFileDownload, "file1", false);
			if (fileNameList.length > 0) {
				if (exportFormat == "csv"){
					new ngxCsv(exportFileObject, this.getCsvFileName("csv"), csvOptions);
				} else {
					let exportTSVData = this.prepareTSVExportManifestData(exportFileObject);
					var blob = new Blob([exportTSVData], { type: 'text/csv;charset=utf-8;' });
					FileSaver.saveAs(blob, this.getCsvFileName("tsv"));
				}
			}
          });
      }
    }
  }

  //@@@PDC-1940: File manifest download is very slow
  setFileExportObject(fileData, exportFileObject) {
    for (var fileItem of fileData.filesPerStudy) {
      //Fetch the file object in 'exportFileObject' that has the same file id.
      let fileObject = exportFileObject.filter(item => item.file_id === fileItem.file_id);
      for (var fileObj of fileObject) {
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
    for (let file of dataForExport) {
        let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(file["file_name"]);
		let confirmationMessage = 'Finished downloading: '+file["file_name"];
        if(!urlResponse.error){
			console.log("S3 url: "+urlResponse.data);
			//@@@PDC-1698 download with file save
			//this.getS3File(urlResponse.data).subscribe((data: any) => {
				//let blob:any = new Blob([data], { type: 'text/json; charset=utf-8' });
				//fileSaver.saveAs(blob, file["file_name"]);
				//console.log("S3 file: "+data);
			//});
			//@@@PDC-1925 use window.open for multiple download
			this.winOpenS3File(urlResponse.data).alert(confirmationMessage);
			this.sleep(2000);
			          
		}else{
			console.log("S3 error: "+urlResponse.error)
        }
	}
  }

  getS3File(url){
	return this.http.get(url, {responseType: 'blob'});
  }

  //@@@PDC-1925 use window.open for multiple download
  winOpenS3File(url){
	return window.open(url, "_self");
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
          let urlResponse = await this.browseByFileService.getOpenFileSignedUrl(exportFile.file_name);
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
	prepareTSVExportManifestData(manifestData){
		let result = "";
		let separator = '\t';
		let EOL = "\r\n";
		for (var i=0; i< this.cols.length; i++) {
			result += this.cols[i]['field'] + separator;
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

  ngOnInit() {
    // Have to define this structure for Primeng CSV export to work properly
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
}
