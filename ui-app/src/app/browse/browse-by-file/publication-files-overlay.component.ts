import {of as observableOf,  Observable } from 'rxjs';

import { FormControl } from "@angular/forms";
import { catchError,  take } from 'rxjs/operators';
import { Component, OnInit, Inject,  EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { CaseSummaryComponent } from '../case-summary/case-summary.component';
import { PDCUserService } from "../../pdcuser.service";
import { AllFilesData } from "../../types";
import { ConfirmationDialogComponent } from "../../dialog/confirmation-dialog/confirmation-dialog.component";
import { BrowseByFileService } from "./browse-by-file.service";
import * as jwt_decode from "jwt-decode";
import { HttpErrorResponse } from "@angular/common/http";
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import { SizeUnitsPipe } from '../../sizeUnitsPipe.pipe';
import { ngxCsv } from "ngx-csv/ngx-csv";
import { MessageDialogComponent } from "../../dialog/message-dialog/message-dialog.component";
import { Table } from "primeng/table";


import {environment} from '../../../environments/environment';


@Component({
    selector: 'publication-app-files-overlay',
    templateUrl: './publication-files-overlay.component.html',
    styleUrls: ['../../../assets/css/global.css', './publication-files-overlay.component.css'],
    providers: [BrowseByFileService, SizeUnitsPipe],
    standalone: false
})

//@@@PDC-6514: Build Pancancer page
export class PublicationFilesOverlayComponent implements OnInit {

	filteredFilesData: AllFilesData[]; //Filtered list of cases
  loading: boolean = false; //Flag indicates that the data is still being loaded from server
  cols = [];
  frozenCols = [];
  publication_id = "";
  //Pagination variables
  totalRecords: number;
  offset = 0;
  limit = 10;
  pageSize: number;

	constructor(private activeRoute: ActivatedRoute, private router: Router, private apollo: Apollo, private http: HttpClient,
				private browseByFileService: BrowseByFileService, private loc:Location,
				private dialogRef: MatDialogRef<PublicationFilesOverlayComponent>, private sizeUnitsPipe: SizeUnitsPipe,
				@Inject(MAT_DIALOG_DATA) public publicationData: any, private dialog: MatDialog,  private userService: PDCUserService) {
	      //console.log(publicationData);
        if (publicationData.summaryData.publication_id) {
          this.publication_id = publicationData.summaryData.publication_id;
          this.getAllFilesData();
        }
	}

  ngOnInit() {
    this.cols = [
      { field: "file_name", header: "File Name" },
      { field: "downloadable", header: "Downloadable" }
    ];

    this.frozenCols = [
      {field: "file_name", header: "File Name"}
    ];
  }

  close() {
      this.router.navigate([{outlets: {publicationFilesOverlay : null}}], { replaceUrl: true });
      this.loc.replaceState(this.router.url);
          this.dialogRef.close();
  }

  loadFiles(event: any) {
    this.offset = event.first;
    this.limit = event.rows;
    this.loading = true;
    setTimeout(() => {
      this.browseByFileService
      .getPaginatedFilesForPublication(
        this.publication_id,
        this.offset,
        this.limit,
      )
      .subscribe((data: any) => {
        this.filteredFilesData = data.getPaginatedUIPancancerFiles.uiPancancerFiles;
        console.log(this.filteredFilesData);
        this.totalRecords = data.getPaginatedUIPancancerFiles.total;
        this.offset = data.getPaginatedUIPancancerFiles.pagination.from;
        this.pageSize = data.getPaginatedUIPancancerFiles.pagination.size;
        this.limit = data.getPaginatedUIPancancerFiles.pagination.size;
      });
    }, 1000);
			this.loading = false;
  }

  getAllFilesData() {
		this.loading = true;
		setTimeout(() => {
			  this.browseByFileService
				.getPaginatedFilesForPublication(
				  this.publication_id,
				  this.offset,
				  this.limit,
				)
				.subscribe((data: any) => {
				  this.filteredFilesData = data.getPaginatedUIPancancerFiles.uiPancancerFiles;
          //console.log(this.filteredFilesData);
				  this.totalRecords = data.getPaginatedUIPancancerFiles.total;
				  this.offset = data.getPaginatedUIPancancerFiles.pagination.from;
				  this.pageSize = data.getPaginatedUIPancancerFiles.pagination.size;
				  this.limit = data.getPaginatedUIPancancerFiles.pagination.size;
				  this.loading = false;
				});
		}, 1000);
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

}
