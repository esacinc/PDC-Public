import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {NgModule} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {Apollo} from 'apollo-angular';
import {Observable, Subject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import gql from 'graphql-tag';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';

import {DataViewModule} from 'primeng/dataview';
import {MatExpansionModule} from '@angular/material/expansion';

import {QueryHeatmapsData, HeatmapsFiltersData} from '../types';
import {StudySummaryComponent} from '../browse/study-summary/study-summary.component';
import {HeatmapsService} from './heatmaps.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatSidenav} from '@angular/material/sidenav';

import {TableTotalRecordCount, AllStudiesData} from '../types';
import {FilesOverlayComponent} from '../browse/browse-by-file/files-overlay.component';
import _ from 'lodash';

declare var window: any;

@Component({
  selector: 'heatmaps',
  templateUrl: './heatmaps.component.html',
  styleUrls: [ './heatmaps.component.scss'],
  standalone: false
})

//@@@PDC-3629 Develop the heatmap screen UI
//@@@PDC-3724 update Heatmaps page
export class HeatmapsComponent implements OnInit {

  allFiltersData: Observable<HeatmapsFiltersData>;
  filteredHeatmapsData: QueryHeatmapsData[];

  filterValues: any = {disease_type: "", primary_sites: "", analytical_fractions: ""};

  diseaseTypesFilterVals = [];
  primarySitesFilterVals = [];
  analyticalFractionsFilterVals = [];
  totalRecords = 0;
  offset: number = 0;
  limit: number = 50;
  pageSize: number = 50;
  sort: string;
  newFilterSelected: any;
  cols: any[];
  loading = false;
  heatmapsFilterGroup: UntypedFormGroup;
  isAbstractExpanded = false;

  filterSelected: any;

  breadcrumbs = [];
  newFilterValue: string;
  public filtersChangedInBreadcrumbBar: Object;
  handleTableLoading: any;
  frozenColumns: any[];

  @ViewChild('sidenav') myNav: MatSidenav;

  constructor(private apollo: Apollo, private dialog: MatDialog, private heatmapsService: HeatmapsService,
              private route: ActivatedRoute,
              private router: Router,
              private loc: Location) {

    this.heatmapsFilterGroup = new UntypedFormGroup({
      diseaseTypeFormControl: new UntypedFormControl(),
      primarySitesFormControl: new UntypedFormControl(),
      analyticalFractionsFormControl: new UntypedFormControl()
    });
    this.heatmapsFilterGroup.setValue({
      diseaseTypeFormControl: '',
      primarySitesFormControl: '',
      analyticalFractionsFormControl: ''
    });
    this.getFiltersData();
    this.sort = "";
    this.getfilteredHeatmapsData();
  }

  get diseaseTypeFormControl() {
    return this.heatmapsFilterGroup.get("diseaseTypeFormControl");
  }

  get primarySitesFormControl() {
    return this.heatmapsFilterGroup.get("primarySitesFormControl");
  }

  get analyticalFractionsFormControl() {
    return this.heatmapsFilterGroup.get("analyticalFractionsFormControl");
  }

  isAbstractExpandedToggle() {
    this.isAbstractExpanded = !this.isAbstractExpanded;
  }

  private removeOtherAndNotReportedFlters(diseases: string[], primary_sites: string[]) {
    diseases.forEach((disease, index) => {
      if (disease == "Other") diseases.splice(index, 1);
    });
    primary_sites.forEach((disease, index) => {
      if (disease == "Not Reported") primary_sites.splice(index, 1);
    });
  }

  private removeOtherValue(diseases: string) {
    let diseases_array = diseases.split(";")
    diseases_array.forEach((disease, index) => {
      if (disease == "Other") diseases_array.splice(index, 1);
    });
    return diseases_array.join(";");
  }

  private removeNotReportedValues(primary_sites: string) {
    let primary_sites_array = primary_sites.split(";");
    primary_sites_array.forEach((disease, index) => {
      if (disease == "Not Reported") primary_sites_array.splice(index, 1);
    });
    return primary_sites_array.join(";");
  }

  heatmapFileName(filename: string) {
    if (filename.indexOf("unshared") > -1) {
      return "Log2 Ratio (Only Unshared Peptides)";
    } else if ((filename.indexOf("log2_ratio") > -1) || (filename.indexOf("log2ratio") > -1)) {
      return "Log2 Ratio (All Peptides)";
    } else if (filename.indexOf("spectral_counts") > -1) {
      return "Spectral count (All Peptides) ";
    } else if ((filename.indexOf("ion_intensity") > -1) || (filename.indexOf("precursor_area") > -1)) {
      return "Precursor Area (All Peptides)";
    } else {
      return "Log2 Ratio (All Peptides)";
    }
  }

  getFiltersData() {
    this.heatmapsService.getHeatmapsFilters().subscribe((data: any) => {
      this.allFiltersData = data.getUIHeatmapFilters;
      this.diseaseTypesFilterVals = this.allFiltersData['disease_types'];
      this.primarySitesFilterVals = this.allFiltersData['primary_sites'];
      this.analyticalFractionsFilterVals = this.allFiltersData['analytical_fractions'];
      this.removeOtherAndNotReportedFlters(this.diseaseTypesFilterVals, this.primarySitesFilterVals);
      console.log(this.diseaseTypesFilterVals);
      console.log(this.analyticalFractionsFilterVals);
    });
  }

  getfilteredHeatmapsData() {
    this.loading = true;
    this.heatmapsService.getFilteredHeatmaps(this.sort, []).subscribe((data: any) => {
      this.filteredHeatmapsData = _.cloneDeep(data.uiHeatmapStudies);
      for (let heatmapData of this.filteredHeatmapsData) {
        heatmapData.disease_type = this.removeOtherValue(heatmapData.disease_type);
        heatmapData.primary_site = this.removeNotReportedValues(heatmapData.primary_site);
      }
      console.log(this.filteredHeatmapsData);
      /*this.totalRecords = data.uiHeatmapStudies.total;
      this.offset = data.uiHeatmapStudies.pagination.from;
      this.pageSize = data.uiHeatmapStudies.pagination.size;
      this.limit = data.uiHeatmapStudies.pagination.size;*/
      this.makeRowsSameHeight();
      this.loading = false;
    });
  }

  loadHeatmaps(event: any) {
    this.loading = true;
    console.log(this.offset);
    console.log(event);
    /*this.offset = event.first;
    this.limit = event.rows;*/
    this.heatmapsSortTable(event);
    this.heatmapsService.getFilteredHeatmaps(this.sort, []).subscribe((data: any) => {
      this.filteredHeatmapsData = _.cloneDeep(data.uiHeatmapStudies);
      for (let heatmapData of this.filteredHeatmapsData) {
        heatmapData.disease_type = this.removeOtherValue(heatmapData.disease_type);
        heatmapData.primary_site = this.removeNotReportedValues(heatmapData.primary_site);
      }
      console.log(this.filteredHeatmapsData);
      //this.totalRecords = data.uiHeatmapStudies.total;
      /*this.offset = data.uiHeatmapStudies.pagination.from;
      this.pageSize = data.uiHeatmapStudies.pagination.size;
          this.limit = data.uiHeatmapStudies.pagination.size;*/
      this.makeRowsSameHeight();
      this.loading = false;
    });
  }

  heatmapsSortTable(event: any) {
    let field = event.sortField;
    let order = event.sortOrder;
    if (field !== undefined) {
      if (order === 1) {
        this.sort = ' ' + field + ' asc ';
      } else if (order === -1) {
        this.sort = ' ' + field + ' desc ';
      }
    }
  }

  filterHeatmaps(filterVal: any) {
    console.log(filterVal);
    switch (filterVal) {
      case "disease_type" : {
        console.log(this.filterSelected.disease_type);
        this.filterValues["disease_type"] = this.filterSelected.disease_type.join(';');
        break;
      }
      case "primary_site": {
        console.log(this.filterSelected.primary_sites);
        this.filterValues["primary_site"] = this.filterSelected.primary_sites.join(';');
        break;
      }
      case "analytical_fraction": {
        console.log(this.filterSelected.analytical_fractions);
        this.filterValues["analytical_fraction"] = this.filterSelected.analytical_fractions.join(';');
        break;
      }
      case "clear": {
        this.heatmapsFilterGroup.setValue({
          diseaseTypeFormControl: '',
          primarySitesFormControl: '',
          analyticalFractionsFormControl: ''
        });
        this.filterValues["analytical_fraction"] = '';
        this.filterValues["primary_site"] = '';
        this.filterValues["disease_type"] = '';
        break;
      }
    }
    this.offset = 0;
    this.loading = true;
    this.heatmapsService.getFilteredHeatmaps(this.sort, this.filterValues).subscribe((data: any) => {
      this.filteredHeatmapsData = _.cloneDeep(data.uiHeatmapStudies);
      for (let heatmapData of this.filteredHeatmapsData) {
        heatmapData.disease_type = this.removeOtherValue(heatmapData.disease_type);
        heatmapData.primary_site = this.removeNotReportedValues(heatmapData.primary_site);
      }
      console.log(this.filteredHeatmapsData);
      /*this.totalRecords = data.uiHeatmapStudies.total;
      this.offset = data.uiHeatmapStudies.pagination.from;
      this.pageSize = data.uiHeatmapStudies.pagination.size;
          this.limit = data.uiHeatmapStudies.pagination.size;*/
      this.makeRowsSameHeight();
      this.loading = false;
    });
  }

  isFilterChosen() {
    return (this.filterSelected.disease_type == "" && this.filterSelected.primary_sites == "" && this.filterSelected.analytical_fractions == "");
  }

  clearFilters() {
    this.filterHeatmaps("clear");
  }

  openHeatMap(study_id: string, study_name: string, filename: string) {
    console.log(filename);
    this.makeRowsSameHeight();
    //@@@PDC-3804 process heatmap files for "Label Free" experiment type
    //If experiment type is "Label Free" than there will be two heatmap files that belong to "All Peptides" category, so no need to send filenames separately
    this.router.navigate([]).then(result => {
      var url = "/pdc/analysis/" + study_id + "?StudyName=" + study_name + "&filename=" + filename;
      window.open(url, '_blank');
    });
  }

  showStudySummary(pdc_study_id: string, study_uuid: string, study_name: string) {
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
    this.router.navigate([{outlets: {studySummary: ['study-summary', study_name]}}], {skipLocationChange: true});
    const dialogRef = this.dialog.open(StudySummaryComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((val: any) => {
      console.log("Dialog output:", val);
      //@@@PDC-4924: Fix UI issues on Heatmaps page & filter stacking feature
      //When a user clicks on study name/study id in the Study table, the rows get misasligned.
      //Solution: Scroll the study name/id into viewport
      document.getElementById(study_name).scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
    });
  }

  ngOnInit() {

    this.filterSelected = {disease_type: '', primary_sites: '', analytical_fractions: ''}

    this.cols = [
      {field: 'pdc_study_id', header: 'Study ID'},
      {field: 'submitter_id_name', header: 'Study Name'},
      {field: 'disease_type', header: 'Disease Type'},
      {field: 'primary_site', header: 'Primary Sites '},
      {field: 'analytical_fraction', header: 'Analytical Fractions'},
      {field: 'experiment_type', header: 'Experiment Type'},
      {field: 'heatmapFiles', header: 'Available Heatmap'},
    ];

    this.frozenColumns = [
      {field: 'pdc_study_id', header: 'Study ID'}
    ];
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
            unfrozen_header_row[0].style.height = frozen_header_row[0].clientHeight + "px";
          } else if (frozen_header_row[0].clientHeight < unfrozen_header_row[0].clientHeight) {
            frozen_header_row[0].style.height = unfrozen_header_row[0].clientHeight + "px";
          }
          for (let i = 0; i < frozen_rows.length; i++) {
            if (frozen_rows[i].clientHeight > unfrozen_rows[i].clientHeight) {
              unfrozen_rows[i].style.height = frozen_rows[i].clientHeight + "px";
            } else if (frozen_rows[i].clientHeight < unfrozen_rows[i].clientHeight) {
              frozen_rows[i].style.height = unfrozen_rows[i].clientHeight + "px";
            }
          }
          let frozen_header_div: any = w.querySelectorAll('.ui-table-unfrozen-view .ui-table-scrollable-header-box');
          frozen_header_div[0].setAttribute('style', 'margin-right: 0px !important');
        }
      }
    });
  }
}
