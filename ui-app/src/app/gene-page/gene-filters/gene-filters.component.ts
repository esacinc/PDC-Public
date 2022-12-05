import { FilterElement } from './../../types';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { Observable, Subject, fromEvent } from "rxjs";
import { map, debounceTime, startWith, take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from "../../../environments/environment";
import { Filter, FilterData, GeneNameList } from "../../types";
import { GenePageService } from "../gene-page.service";
import { GeneFiltersService } from "./gene-filters.service";
@Component({
  selector: "gene-filters",
  templateUrl: "./gene-filters.html",
  styleUrls: ["../../../assets/css/global.css", "./gene-filters.scss"],
  providers: [GeneFiltersService]
})

export class GeneFiltersComponent implements OnInit, OnChanges {
  allCategoryFilterData: FilterData; // Full list of all cases as returned by API
  allFilterCategoryMapData: Map<string, string[]>;
  loading: boolean = false; //Flag indicates that the data is still being loaded from server

  loadingURLParams:boolean = false; //Loading page with filter values from URL parameters takes some time

  selectedGeneNames: string = "";

  @Output() selectedFilters = new EventEmitter<string>(); //this variable will propagate filter selection changes to parent component //@@@PDC-221

  // ***Filter contain a list of filters (filterName and filterValue) for each category
  // selected*** contain a list of selected filterName for each category
  //general filter
  projectsFilter: Filter[] = [];
  selectedProjects: string[] = [];

  primarySitesFilter: Filter[] = [];
  selectedPrimarySites: string[] = [];

  programsFilter: Filter[] = [];
  selectedPrograms: string[] = [];

  diseaseTypesFilter: Filter[] = [];
  selectedDiseases: string[] = [];

  analyticalFractionsFilter: Filter[] = [];
  selectedAnFracs: string[] = [];

  experimentalStrategiesFilter: Filter[] = [];
  selectedExpStarts: string[] = [];

  acquisitionFilter: Filter[] = [];
  selectedAcquisitions: string[] = [];

  //biospecimem filter
  studyFilter: Filter[] = [];
  selectedStudyFilter: string[] = [];
  allStudyFilter: Filter[] = [];

  sampleTypeFilter: Filter[] = [];
  selectedSampleType: string[] = [];

  //clinical filter
  ethnicityFilter: Filter[] = [];
  selectedEthnicity: string[] = [];

  raceFilter: Filter[] = [];
  selectedRace: string[] = [];

  genderFilter: Filter[] = [];
  selectedGender: string[] = [];

  tumorGradeFilter: Filter[] = [];
  selectedTumorGrade: string[] = [];

  //file filter
  dataCategoryFilter: Filter[] = [];
  selectedDataCategory: string[] = [];

  fileTypeFilter: Filter[] = [];
  selectedFileType: string[] = [];

  accessFilter: Filter[] = [];
  selectedAccess: string[] = [];

  @Input()
  selectedTab = 0; //display apropriate filter tab on data table tab selection

  @Input()
  parentCharts: Subject<any>;

  static urlBase;

  //keep a full list of filter category
  allFilterCategory: string[] = [
    "project_name",
    "primary_site",
    "program_name",
    "disease_type",
    "analytical_fraction",
    "experiment_type",
    "acquisition_type",
    "submitter_id_name",
    "sample_type",
    "ethnicity",
    "race",
    "gender",
    "tumor_grade"
  ];

  //array to keep all possible stduies
  allStudyArray: string[] = [];
  allStudyNameArray: string[] = [];

    //@@@PDC-3779: Investigate the ability to only display the top 10 filters in each category
  // hidden by default
  showPSite: boolean = false;
  showProgram: boolean = false;
  showDType: boolean = false;
  showAFraction: boolean = false;
  showExpType: boolean = false;
  showAcqType: boolean = false;
  showSampleType: boolean = false;
  showEthnicity: boolean = false;
  showRace: boolean = false;
  showGender: boolean = false;
  showTmrGrade: boolean = false;

  constructor( private route:ActivatedRoute, private geneFiltersService: GeneFiltersService, private genePageService: GenePageService) {
    GeneFiltersComponent.urlBase = environment.dictionary_base_url;
	this.route.paramMap.subscribe(params => {
		let gene = params.get("gene_id");
		//console.log(params);
		console.log(gene);
		this.selectedGeneNames = gene || "";
		console.log(this.selectedGeneNames);
		if (this.selectedGeneNames.length > 0){
			this.getAllFilterData();
		}
		else {
			console.log("ERROR: no gene name in url");
		}
	  });
  }

  get staticUrlBase() {
    return GeneFiltersComponent.urlBase;
  }

  /*API call to get all filter data */
  private getAllFilterData() {
    this.loading = true;
    this.geneFiltersService.getAllFiltersData().subscribe((data: any) => {
      this.allCategoryFilterData = data.uiFilters;
      this.populateFilters();
      this.loading = false;
    });
  }

  /**
   * Return the appropriate style - if the checkbox is clicked, return a bold style otheriwse
   * return the non-bold style
   */
  getStyleForCheckbox(filterName: string, target_filter_list: any) {
    if (target_filter_list.indexOf(filterName) === -1) {
      return {
        "font-family": "Lato",
        color: "#000000",
        "font-weight": 400,
        "font-size": "12px"
      };
    } else {
      return {
        "font-family": "Lato",
        color: "#000000",
        "font-weight": "bold",
        "font-size": "12px"
      };
    }
  }

  getClassForCheckbox(filterName: string) {
    if (filterName.length < 14) {
      return { "card-list-checkbox-single-ln": true };
    } else {
      return { "card-list-checkbox-multi-ln": true };
    }
  }

  /* Populate filters and their counters from cases data */
  //@@@PDC-379 stop incrementing study count if the study is already accounted for a filter value
  populateFilters() {

	this.loading = true;
	//Have to replace spaces with semicolon since that is the expected list delimiter for the API
	let processedGeneNames = this.selectedGeneNames.toUpperCase().replace(/\s/g, ';');
	console.log(processedGeneNames);
	this.geneFiltersService.getStudyByGeneName(processedGeneNames).subscribe((data: any) => {
    let studyList = [];
    let studyNameList = [];
		//initialize all filter lists
		this.allFilterCategoryMapData = new Map();
		this.projectsFilter = [];
		this.primarySitesFilter = [];
		this.programsFilter = [];
		this.diseaseTypesFilter = [];
		this.analyticalFractionsFilter = [];
		this.experimentalStrategiesFilter = [];
		this.acquisitionFilter = [];
		this.studyFilter = [];
		this.allStudyFilter = [];
		this.sampleTypeFilter = [];
		this.ethnicityFilter = [];
		this.raceFilter = [];
		this.genderFilter = [];
		this.tumorGradeFilter = [];

		console.log(data.uiGeneStudySpectralCount);
		for(const item of data.uiGeneStudySpectralCount){
      studyList.push(item.study_submitter_id); //study id in format SXXXX-X
      studyNameList.push(item.submitter_id_name);
		}
		this.allStudyArray = studyList;
		this.allStudyNameArray =  studyNameList;
		for (let i = 0; i < this.allFilterCategory.length; i++) {
		  let filterCategoryName = this.allFilterCategory[i];
		  let filterList: Filter[] = this.findFilterListByName(filterCategoryName);
		  let filterListData: FilterElement[] = this.allCategoryFilterData[filterCategoryName];
		  for (let item of filterListData) {
		    let filterStudyIDList: string[] = [];
			for (var studyID of item.filterValue){
				if (this.allStudyArray.includes(studyID)){
					filterStudyIDList.push(studyID);
				}
			}
			//console.log(filterStudyIDList);
			let filter: Filter = {
			  filterName: item.filterName,
			  //filterCount: item.filterValue.length
			  filterCount: filterStudyIDList.length
			};
			filterList.push(filter);
			this.allStudyArray = _.union(this.allStudyArray, filterStudyIDList);
			this.allFilterCategoryMapData.set(
			  filterCategoryName + ":" + item.filterName,
			  filterStudyIDList
			);
		  }
		}

		this.studyFilter = this.allStudyFilter;

		//sort filters after filters populate
		this.projectsFilter.sort(this.compare);
		this.primarySitesFilter.sort(this.compare);
		this.programsFilter.sort(this.compare);
		this.diseaseTypesFilter.sort(this.compare);
		this.analyticalFractionsFilter.sort(this.compare);
		this.experimentalStrategiesFilter.sort(this.compare);
		this.ethnicityFilter.sort(this.compare);
		this.raceFilter.sort(this.compare);
		this.genderFilter.sort(this.compare);
		this.tumorGradeFilter.sort(this.compare);
		this.sampleTypeFilter.sort(this.compare);
		this.studyFilter.sort(this.compare);
		this.acquisitionFilter.sort(this.compare);

		this.loading = false;
	});
  }

  //sort filters by alphabet
  private compare(filter1: Filter, filter2: Filter) {
    if (filter1.filterName.toUpperCase() < filter2.filterName.toUpperCase()) {
      return -1;
    } else if (filter1.filterName.toUpperCase() > filter2.filterName.toUpperCase()) {
      return 1;
    } else {
      return 0;
    }
  }

  /* Update filters counters when filter selection is changed */
  /*if only one filter category has been selected, all filter
	counts in that category shouldn't update*/
  updateFiltersCounters(studySelected: boolean = false) {
    let newFilterSelected = {
      "study_name":[],
      "project_name": [],
      "primary_site": [],
      "program_name": [],
      "disease_type": [],
      "analytical_fraction": [],
      "experiment_type": [],
      "acquisition_type": [],
      "submitter_id_name": [],
      "sample_type": [],
      "ethnicity": [],
      "race": [],
      "gender": [],
      "tumor_grade": []
    };
    //track how many filter category selected, handle one category selected special case
    let numOfFilterCategorySelected = 0;
    let intersectedStudyArray: string[] = this.allStudyArray;
    //track filter category name if only one category selected
    let selectedFilterCategoryName = null;
    /**loop all selected filters and do the below operation
     *  (selected filter 1 in filter category 1 Union selected filter 2 in filter category 1) intersect
     *  (selected filter 3 in filter category 2 Union selected filter 4 in filter category 2)*/
    for (let i = 0; i < this.allFilterCategory.length; i++) {
      let filterCategoryName = this.allFilterCategory[i];
      let selectedFilter: string[] = this.findSelectedFilterByName(filterCategoryName);
      if (selectedFilter.length > 0) {
        selectedFilterCategoryName = filterCategoryName;
        numOfFilterCategorySelected++;
        let unionStudyInSameCategory: string[] = [];
        //union all selected filters in same category
        for (let selectedFilterName of selectedFilter) {
          unionStudyInSameCategory = _.union(
            unionStudyInSameCategory,
            this.allFilterCategoryMapData.get(
              filterCategoryName + ":" + selectedFilterName
            )
          );
          newFilterSelected[filterCategoryName].push(selectedFilterName);
        }
        //intersect all unionStudyInSameCategory which is the result of union all selected filters in each category
        intersectedStudyArray = _.intersection(
          intersectedStudyArray,
          unionStudyInSameCategory
        );
      }
    }

    /**find final intersectedStudyArray across all selected fitler from above and each filter intersects
     * with intersectedStudyArray to find the updated count for each filter  */
    for (let filterCategoryName of this.allFilterCategory) {
      for (let individualFilter of this.findFilterListByName(filterCategoryName)) {
        let individualFilterName = individualFilter.filterName;
        let fullSetFilterValue: string[] = this.allFilterCategoryMapData.get(
          filterCategoryName + ":" + individualFilterName
        );
        individualFilter.filterCount = _.intersection(
          fullSetFilterValue,
          intersectedStudyArray
        ).length;
      }
    }

    //handle special case only one category selected
    if (numOfFilterCategorySelected === 1) {
      let filterIndex: number = this.allFilterCategory.indexOf(
        selectedFilterCategoryName
      );
      for (let individualFilter of this.findFilterListByName(
        selectedFilterCategoryName
      )) {
        individualFilter.filterCount = this.allFilterCategoryMapData.get(
          selectedFilterCategoryName + ":" + individualFilter.filterName
        ).length;
      }
      let studyList: Filter[] = [];
      for (let studyFilter of this.allStudyFilter) {
        if (studyFilter.filterCount > 0) {
          studyList.push(studyFilter);
        }
      }
      if (!studySelected) {
        this.studyFilter = studyList;
      }
    } else {
      if(newFilterSelected.submitter_id_name.length >0){
        newFilterSelected.study_name = newFilterSelected.submitter_id_name;
      }else{
        newFilterSelected.study_name =  this.allStudyNameArray;
      }
      let filterSelected = {};
      for(let fieldName in newFilterSelected){
        filterSelected[fieldName] = newFilterSelected[fieldName].join(";");
      }
      this.geneFiltersService
      .getFilteredFiltersDataQuery(filterSelected)
      .subscribe((data: any) => {
        for (let i = 0; i < this.allFilterCategory.length; i++) {
          let filterCategoryName = this.allFilterCategory[i];
          let selectedFilter: Filter[] = this.findFilterListByName(
            filterCategoryName
          );
          let filterListData: FilterElement[] = data.uiFilters[
            filterCategoryName
          ];
          let filterListDataMap = new Map();
          for (let filterData of filterListData) {
            filterListDataMap.set(
              filterData.filterName,
              filterData.filterValue.length
            );
          }
          for (let selectedFilterData of selectedFilter) {
            if (filterListDataMap.has(selectedFilterData.filterName)) {
              selectedFilterData.filterCount = filterListDataMap.get(
                selectedFilterData.filterName
              );
            } else {
              selectedFilterData.filterCount = 0;
            }
          }
          let studyList: Filter[] = [];
          for (let studyFilter of this.allStudyFilter) {
            if (studyFilter.filterCount > 0) {
              studyList.push(studyFilter);
            }
          }
          if (!studySelected) {
            this.studyFilter = studyList;
          }
        }
      });
    }

    //remove study in study filter category if study is not able to be selected
    console.log(this.projectsFilter);
    //console.log(this.allCategoryFilterData);
    //console.log(this.allStudyArray);
  }

  private findSelectedFilterByName(filterName: string): string[] {
    let selectedFilter: string[];
    switch (filterName) {
      case "project_name":
        selectedFilter = this.selectedProjects;
        break;
      case "primary_site":
        selectedFilter = this.selectedPrimarySites;
        break;
      case "program_name":
        selectedFilter = this.selectedPrograms;
        break;
      case "disease_type":
        selectedFilter = this.selectedDiseases;
        break;
      case "analytical_fraction":
        selectedFilter = this.selectedAnFracs;
        break;
      case "experiment_type":
        selectedFilter = this.selectedExpStarts;
        break;
      case "acquisition_type":
        selectedFilter = this.selectedAcquisitions;
        break;
      case "submitter_id_name":
        selectedFilter = this.selectedStudyFilter;
        break;
      case "sample_type":
        selectedFilter = this.selectedSampleType;
        break;
      case "ethnicity":
        selectedFilter = this.selectedEthnicity;
        break;
      case "race":
        selectedFilter = this.selectedRace;
        break;
      case "gender":
        selectedFilter = this.selectedGender;
        break;
      case "tumor_grade":
        selectedFilter = this.selectedTumorGrade;
    }
    return selectedFilter;
  }

  private findFilterListByName(filterName: string): Filter[] {
    let filter: Filter[];
    switch (filterName) {
      case "project_name":
        filter = this.projectsFilter;
        break;
      case "primary_site":
        filter = this.primarySitesFilter;
        break;
      case "program_name":
        filter = this.programsFilter;
        break;
      case "disease_type":
        filter = this.diseaseTypesFilter;
        break;
      case "analytical_fraction":
        filter = this.analyticalFractionsFilter;
        break;
      case "experiment_type":
        filter = this.experimentalStrategiesFilter;
        break;
      case "acquisition_type":
        filter = this.acquisitionFilter;
        break;
      case "submitter_id_name":
        filter = this.allStudyFilter;
        break;
      case "sample_type":
        filter = this.sampleTypeFilter;
        break;
      case "ethnicity":
        filter = this.ethnicityFilter;
        break;
      case "race":
        filter = this.raceFilter;
        break;
      case "gender":
        filter = this.genderFilter;
        break;
      case "tumor_grade":
        filter = this.tumorGradeFilter;
    }
    return filter;
  }

    //@@@PDC-3779: Investigate the ability to only display the top 10 filters in each category
    showMoreOrLess(filterName) {
      switch (filterName) {
        case "primary_site":
          this.showPSite = ! this.showPSite;
          break;
        case "program_name":
          this.showProgram = !this.showProgram;
          break;
        case "disease_type":
          this.showDType = !this.showDType;
          break;
        case "analytical_fraction":
          this.showAFraction = !this.showAFraction;
          break;
        case "experiment_type":
          this.showExpType = !this.showExpType;
          break;
        case "acquisition_type":
          this.showAcqType = !this.showAcqType;
          break;
        case "sample_type":
          this.showSampleType = !this.showSampleType;
          break;
        case "ethnicity":
          this.showEthnicity = !this.showEthnicity;
          break;
        case "race":
          this.showRace = !this.showRace;
          break;
        case "gender":
          this.showGender = !this.showGender;
          break;
        case "tumor_grade":
          this.showTmrGrade = !this.showTmrGrade;
          break;
      }
    }

  /* Project filter callback onChange */
  filterDataByProject(e) {
    let newFilterValue = "project_name:" + this.selectedProjects.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  /* Primary site filter callback onChange */
  filterDataByPrimarySite(e, filterSub='', index = 0) {
    let newFilterValue = "primary_site:" + this.selectedPrimarySites.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.primarySitesFilter, this.selectedPrimarySites, e, filterSub, index);
    this.primarySitesFilter = sortedList;
    this.updateFiltersCounters();
  }
  ngOnChanges(changes: SimpleChanges) {}
  /* Program filter callback onChange */
  filterDataByProgram(e, filterSub='', index = 0) {
    var newFilterValue = "program_name:" + this.selectedPrograms.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.programsFilter, this.selectedPrograms, e, filterSub, index);
    this.programsFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Disease type filter callback onChange */
  filterDataByDiseaseType(e, filterSub='', index = 0) {
    var newFilterValue = "disease_type:" + this.selectedDiseases.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.diseaseTypesFilter, this.selectedDiseases, e, filterSub, index);
    this.diseaseTypesFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Analytical fraction filter callback onChange */
  filterDataByAnalyticalFraction(e, filterSub='', index = 0) {
    var newFilterValue = "analytical_fraction:" + this.selectedAnFracs.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.analyticalFractionsFilter, this.selectedAnFracs, e, filterSub, index);
    this.analyticalFractionsFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Experimental strategy filter callback onChange */
  filterDataByExperimentalStrategy(e, filterSub='', index = 0) {
    var newFilterValue = "experiment_type:" + this.selectedExpStarts.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.experimentalStrategiesFilter, this.selectedExpStarts, e, filterSub, index);
    this.experimentalStrategiesFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByAcquisition(e, filterSub='', index = 0) {
    var newFilterValue = "acquisition_type:" + this.selectedAcquisitions.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.acquisitionFilter, this.selectedAcquisitions, e, filterSub, index);
    this.acquisitionFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByEthnicity(e, filterSub='', index = 0) {
    var newFilterValue = "ethnicity:" + this.selectedEthnicity.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.ethnicityFilter, this.selectedEthnicity);
    this.ethnicityFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByRace(e, filterSub='', index = 0) {
    var newFilterValue = "race:" + this.selectedRace.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.raceFilter, this.selectedRace);
    this.raceFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByGender(e, filterSub='', index = 0) {
    var newFilterValue = "gender:" + this.selectedGender.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.genderFilter, this.selectedGender);
    this.genderFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByTumorGrade(e, filterSub='', index = 0) {
    var newFilterValue = "tumor_grade:" + this.selectedTumorGrade.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.tumorGradeFilter, this.selectedTumorGrade);
    this.tumorGradeFilter = sortedList;
    this.updateFiltersCounters();
  }

  //PDC-567
  filterDataBySampleType(e, filterSub='', index = 0) {
    var newFilterValue = "sample_type:" + this.selectedSampleType.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.sampleTypeFilter, this.selectedSampleType, e, filterSub, index);
    this.sampleTypeFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByStudy(e, filterSub='', index = 0) {
    var newFilterValue = "study_name:" + this.selectedStudyFilter.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, e, filterSub, index);
    this.studyFilter = sortedList;
    this.updateFiltersCounters(true);
  }

  //@@@PDC-4837: Filters in the sidebar do not bubble to the top when Browse URL has preselected filters
  moveFilterToTop (filterData, selectedFilterData, checkboxClicked = '', filterSub = '', index = 0) {
    let filterDataCopy = filterData;
    let sortedList = [];
    for (let filter of selectedFilterData) {
      let filterFound = filterDataCopy.find(item => item.filterName === filter);
      sortedList.push(filterFound);
      filterDataCopy = filterDataCopy.filter(item=>item.filterName != filter );
    }
    filterDataCopy.sort(this.compare);
    sortedList = sortedList.concat(filterDataCopy);
    if (checkboxClicked && index > 10 && filterSub) {
      setTimeout(() => {
        let eleID = sortedList[0].filterName + filterSub;
        document.getElementById(eleID).scrollIntoView({ behavior: 'smooth', block: 'center'});
      });
    }
    return sortedList;
  }

  //Clear projects filter selections callback button
  clearSelectionsProjects() {
    this.selectedProjects = [];
    this.projectsFilter.sort(this.compare);
    this.filterDataByProject(false);
  }
  //Clear programs filter selections callback button
  clearSelectionsPrograms() {
    this.selectedPrograms = [];
    this.programsFilter.sort(this.compare);
    this.filterDataByProgram(false);
  }
  //Clear primary sites filter selections callback button
  clearSelectionsPrimarySite() {
    this.selectedPrimarySites = [];
    this.primarySitesFilter.sort(this.compare);
    this.filterDataByPrimarySite(false);
  }
  //Clear disease types filter selections callback button
  clearSelectionsDiseaseType() {
    this.selectedDiseases = [];
    this.diseaseTypesFilter.sort(this.compare);
    this.filterDataByDiseaseType(false);
  }
  //Clear analytical fractions filter selections callback button
  clearSelectionsAnalyticalFraction() {
    this.selectedAnFracs = [];
    this.analyticalFractionsFilter.sort(this.compare);
    this.filterDataByAnalyticalFraction(false);
  }
  //Clear experimental strategies filter selections callback button
  clearSelectionsExperimentalStrategy() {
    this.selectedExpStarts = [];
    this.experimentalStrategiesFilter.sort(this.compare);
    this.filterDataByExperimentalStrategy(false);
  }
  clearSelectionsAcquisitions() {
    this.selectedAcquisitions = [];
    this.acquisitionFilter.sort(this.compare);
    this.filterDataByAcquisition(false);
  }
  clearSelectionsEthnicity() {
    this.selectedEthnicity = [];
    this.ethnicityFilter.sort(this.compare);
    this.filterDataByEthnicity(false);
  }
  clearSelectionsRace() {
    this.selectedRace = [];
    this.raceFilter.sort(this.compare);
    this.filterDataByRace(false);
  }
  clearSelectionsGender() {
    this.selectedGender = [];
    this.genderFilter.sort(this.compare);
    this.filterDataByGender(false);
  }
  clearSelectionsTumorGrade() {
    this.selectedTumorGrade = [];
    this.tumorGradeFilter.sort(this.compare);
    this.filterDataByTumorGrade(false);
  }

  clearSelectionsSampleType() {
    this.selectedSampleType = [];
    this.sampleTypeFilter.sort(this.compare);
    this.filterDataBySampleType(false);
  }

  clearSelectionsStudyID() {
    this.selectedStudyFilter = [];
    this.studyFilter.sort(this.compare);
    this.filterDataByStudy(false);
  }

   //@@@PDC-4837: Filters in the sidebar do not bubble to the top when Browse URL has preselected filters
  sortAllFilterLists() {
    this.projectsFilter.sort(this.compare);
    this.primarySitesFilter.sort(this.compare);
    this.programsFilter.sort(this.compare);
    this.diseaseTypesFilter.sort(this.compare);
    this.analyticalFractionsFilter.sort(this.compare);
    this.experimentalStrategiesFilter.sort(this.compare);
    this.ethnicityFilter.sort(this.compare);
    this.raceFilter.sort(this.compare);
    this.genderFilter.sort(this.compare);
    this.tumorGradeFilter.sort(this.compare);
    this.sampleTypeFilter.sort(this.compare);
    this.studyFilter.sort(this.compare);
    this.acquisitionFilter.sort(this.compare);
    this.dataCategoryFilter.sort(this.compare);
    this.fileTypeFilter.sort(this.compare);
    this.accessFilter.sort(this.compare);
  }


  // clear all filter selections button callback
  clearAllSelections() {
    var newFilterValue = "Clear all selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    //clear all filters selections
    this.selectedProjects = [];
    this.selectedPrograms = [];
    this.selectedPrimarySites = [];
    this.selectedDiseases = [];
    this.selectedAnFracs = [];
    this.selectedExpStarts = [];
    this.selectedEthnicity = [];
    this.selectedAcquisitions = [];
    this.selectedRace = [];
    this.selectedGender = [];
    this.selectedTumorGrade = [];
    this.selectedSampleType = [];
    this.selectedStudyFilter = [];
    this.sortAllFilterLists();
    this.updateFiltersCounters();
  }

  //Clear all filter selections in Clinical filters tab
  clearAllClinicalSelections() {
    var newFilterValue = "Clear all clinical filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedEthnicity = [];
    this.selectedRace = [];
    this.selectedGender = [];
    this.selectedTumorGrade = [];
    this.ethnicityFilter.sort(this.compare);
    this.raceFilter.sort(this.compare);
    this.genderFilter.sort(this.compare);
    this.tumorGradeFilter.sort(this.compare);
    this.updateFiltersCounters();
  }
  //Clear all filters in General filters tab
  clearAllGeneralSelections() {
    var newFilterValue = "Clear all general filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    //clear all filters selections
    this.selectedProjects = [];
    this.selectedPrograms = [];
    this.selectedPrimarySites = [];
    this.selectedDiseases = [];
    this.selectedAnFracs = [];
    this.selectedExpStarts = [];
    this.selectedAcquisitions = [];
    this.projectsFilter.sort(this.compare);
    this.primarySitesFilter.sort(this.compare);
    this.programsFilter.sort(this.compare);
    this.diseaseTypesFilter.sort(this.compare);
    this.analyticalFractionsFilter.sort(this.compare);
    this.experimentalStrategiesFilter.sort(this.compare);
    this.acquisitionFilter.sort(this.compare);
    this.updateFiltersCounters();
  }

  clearAllBiospecimenSelections() {
    var newFilterValue = "Clear all biospecimen filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedSampleType = [];
    this.selectedStudyFilter = [];
    this.sampleTypeFilter.sort(this.compare);
    this.studyFilter.sort(this.compare);
    this.ethnicityFilter.sort(this.compare);
    this.raceFilter.sort(this.compare);
    this.genderFilter.sort(this.compare);
    this.tumorGradeFilter.sort(this.compare);
    this.updateFiltersCounters();
  }

  ngOnInit() {


    //@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
    // Access values from browse.component.ts by subscribing to the click events in it. Filter by study, file type.
    this.genePageService.notifyObservable$.subscribe(res => {
      if (res.hasOwnProperty("studyNameForCaseCount")) {
        this.selectedStudyFilter = new Array(res.studyNameForCaseCount);
        this.filterDataByStudy(event);
      }
      if (
        res.hasOwnProperty("studyNameForFileType") &&
        res.hasOwnProperty("fileDetailsforFileType")
      ) {
        this.selectedStudyFilter = new Array(res.studyNameForFileType);
        this.filterDataByStudy(event);
      }
    });
  }

  ngOnDestroy() {
  }
}
