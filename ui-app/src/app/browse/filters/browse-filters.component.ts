import { FilterElement } from './../../types';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { Observable, Subject, fromEvent } from "rxjs";
//import "rxjs/add/operator/map";
import { map, debounceTime, startWith, take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from "../../../environments/environment";
import { Filter, FilterData, GeneNameList, dataCategory2FileTypeMapping } from "../../types";
import { BrowseService } from "../browse.service";
import { BrowseFiltersService } from "./browse-filters.service";
@Component({
  selector: "browse-filters",
  templateUrl: "./browse-filters.html",
  styleUrls: ["../../../assets/css/global.css", "./browse-filters.scss"],
  providers: [BrowseFiltersService]
})

//@@@PDC-169 The user should be able to browse data by Case
//@@@PDC-256 Graying out filters whose counts are equal zero
//@@@PDC-276 Add clear all filter selections button and funcitonality
//@@@PDC-275 fix filter counters calculations
//@@@PDC-262 get dictionary base url from environment object
//@@@PDC-455 Add Studies or Study text to the filters on the browse page
//@@@PDC-493 Make charts on the portal interactive
//@@@PDC-522 Change the file filters to a new filters tab
//@@@PDC-535 Add Clinical filters tab
//@@@PDC-616 Add acquisition type to the general filters
//@@@PDC-570 Add study filter for files filter tab
//@@@PDC-683 Add Gene name filter to gene filter tab with prepopulated genes list
//@@@PDC-685 Add Gene name filter to gene filter tab
//@@@PDC-728 Allow getting filter values from url
//@@@PDC-775: Add new downloadable filter option to file filters
//@@@PDC-789 Reset the URL when filters are applied to remove filter parameters
//@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
//@@@PDC-786  Allow study_id URL filter to work as study_name filter
//@@@PDC-835 Allow study uuid as URL filter
//@@@PDC-829: Update study count in the redirected fence page which retaining filters
//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
//@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
//@@@PDC-862: Display biospecimen qualification status on the UI
//@@@PDC-1001: Gene search is very slow and occasionally fails
//@@@PDC-1095: Improving file filter select combinations
//@@@PDC-1668: multiple and trailing spaces in gene names filter bug
//@@@PDC-2460: Add new data category/file type: Alternate Processing Pipeline/Archive
//@@@PDC-2508: Checkbox appears faded when clicking Metadata or Quality Metrics Count
//@@@PDC-3010: Update UI to use APIs for fily type to data category mapping
export class BrowseFiltersComponent implements OnInit, OnChanges {
  allCategoryFilterData: FilterData; // Full list of all cases as returned by API
  allFilterCategoryMapData: Map<string, string[]> = new Map();
  loading: boolean = false; //Flag indicates that the data is still being loaded from server
  
  loadingURLParams:boolean = false; //Loading page with filter values from URL parameters
  urlFilterParams: boolean = false; //There were filter parameters set through url
  
  //PDC-683 and PDC-685 definitions for gene name filter
  options: string = ""; 
  valudatedGeneNamesList: string[] = [];
  allGeneNamesValid: boolean = false;
  geneNameValid :boolean = false;
  prebuildGeneList:GeneNameList[] = [{listName: 'Glioblastoma:TP53 Pathway (4 genes)', geneNamesList: 'CDKN2A MDM2 MDM4 TP53'},
									{listName: 'Glioblastoma:RTK/RAS/PI3K/AKT Signaling (16 genes)', geneNamesList: 'EGFR KRAS ERBB2 PDGFRA NRAS HRAS SPRY2 NF1 FOXO1 AKT1 FOXO3 AKT2 AKT3 PIK3R1 PIK3CA PTEN'},
									{listName: 'Glioblastoma:RB Pathway (7 genes)', geneNamesList: 'CDKN2A CDKN2B CDKN2C CDK4 CDK6 CCND2 RB1'},
									{listName: 'Prostate Cancer: AR Signaling(8 genes)', geneNamesList: 'SOX9 TNK2 EP300 PXN NCOA2 NRIP1 NCOR1 NCOR2'},
									{listName: 'Prostate Cancer: AR and Steroid synthesis enzymes(19 genes)', geneNamesList: 'AKR1C3 CYB5A CYP11A1 CYP17A1 HSD17B1 HSD17B10 HSD17B11 HSD17B12 HSD17B13 HSD17B14 HSD17B2 HSD17B4 HSD17B7 HSD17B8 HSD3B7 RDH5 SHBG SRD5A1 SRD5A3'},
									{listName: 'Prostate Cancer: Steroid inactivating genes(7 genes)', geneNamesList: 'AKR1C2 AKR1C1 AKR1C4 CYP3A5 UGT2B15 UGT2B17 UGT2B7'},
									{listName: 'Prostate Cancer: Down-regulated by androgen(17 genes)', geneNamesList: 'BCHE CTBP1 CDK8 DDC ACKR3 DPH1 FN1 MYC PEG3 SCNN1A PIK3R3 PRKD1 SDC4 SERPINI1 SLC29A1 ST7 TULP4'},
									{listName: 'Ovarian Cancer: Oncogenes associated with epithelial ovarian cancer (17 genes)', geneNamesList: 'RAB25 MECOM EIF5A2 PRKCI PIK3CA KIT FGF1 MYC EGFR NOTCH3 KRAS AKT1 ERBB2 PIK3R1 CCNE1 AKT2 AURKA'},
									{listName: 'Ovarian Cancer: Putative tumor-suppressor genes in epithelial ovarian cancer (13 genes)', geneNamesList: 'RASSF1 SPARC DAB2 PTEN BRCA2 PLAGL1 RPS6KA2 WWOX ARL11 DPH1 TP53 BRCA1 PEG3'},
									{listName: 'General: Cell Cycle Control (32 genes)', geneNamesList: 'RB1 CCNE1 CDK4 CDK6 CCND2 CDKN2A CDKN2B MYC RBL1 RBL2 CCNB1 CDK1 CDK2 CCND1 CDC25A CDKN1B CDKN1A E2F1 E2F3 E2F5 E2F4 E2F6 E2F7 E2F8 SRC JAK1 STAT1 STAT2 STAT3 JAK2 STAT5A STAT5B'},
									{listName: 'General: p53 signaling (6 genes)', geneNamesList: 'TP53 MDM2 MDM4 CDKN2A CDKN2B TP53BP1'},
									{listName: 'General: Notch signaling (40 genes)', geneNamesList: 'NOTCH3 ADAM10 ADAM17 APH1A ARRDC1 CIR1 CTBP1 CUL1 CTBP2 DTX1 DTX2 DTX3 DTX3L EP300 FBXW7 HDAC1 HDAC2 HES1 HEYL ITCH JAG1 KDM5A LFNG MAML1 MAML2 MAML3 NCSTN NCOR2 NOTCH1 NOTCH2 NOTCH4 NUMBL NUMB PSEN1 PSEN2 RBPJ RBPJL SNW1 SPEN HEY1'},
									{listName: 'General: DNA Damage Response(7 genes)', geneNamesList: 'RAD51 MLH1 MSH2 ATM ATR PARP1 MDC1'},
									{listName: 'General: Other growth/proliferation signaling (9 genes)', geneNamesList: 'FGF1 AURKA PLAGL1 DPH1 CSF1 CSF1R IGF1 IGF1R FGFR1'},
									{listName: 'General: Survival/cell death regulation signaling (22 genes)', geneNamesList: 'ARL11 WWOX PEG3 NFKB1 CHUK HLA-G NFKB2 FAS BAD BCL2 BCL2L1 APAF1 CASP9 CASP8 CASP3 CASP6 CASP7 CASP10 GSK3B TGFBR1 TGFB1 TGFBR2'},
									{listName: 'General: RTK signaling family(15 genes)', geneNamesList: 'EGFR ERBB2 KIT FGF1 FGFR1 IGF1 IGF1R ERBB3 ERBB4 PDGFA PDGFRA VEGFB VEGFA PDGFRB KDR'},
									{listName: 'General: PI3K-AKT-mTOR signaling (17 genes)', geneNamesList: 'PIK3CA PIK3R1 PIK3R2 PTEN PDPK1 AKT1 AKT2 FOXO1 FOXO3 MTOR RICTOR TSC1 TSC2 RHEB AKT1S1 RPTOR MLST8'},
									{listName: 'General: Ras-Raf-MEK-Erk/JNK signaling (26 genes)', geneNamesList: 'KRAS HRAS BRAF RAF1 MAP3K1 MAP3K2 MAP3K3 MAP3K4 MAP3K5 MAP2K1 MAP2K2 MAP2K3 MAP2K4 MAP2K5 MAPK1 MAPK3 MAPK4 MAPK6 MAPK7 MAPK8 MAPK9 MAPK12 MAPK14 DAB2 RASSF1 RAB25'},
									{listName: 'General: Regulation of ribosomal protein synthesis and cell growth (9 genes)', geneNamesList: 'RPS6KA1 RPS6KA2 RPS6KB1 RPS6KB2 EIF5A2 EIF4E EIF4EBP1 RPS6 HIF1A'},
									{listName: 'General: Angiogenesis (4 genes)', geneNamesList: 'VEGFA VEGFB KDR CXCL8'},
									{listName: 'General: Folate transport(4 genes)', geneNamesList: 'SLC19A1 FOLR2 FOLR3 FOLR1'},
									{listName: 'General: Invasion and metastasis (20 genes)', geneNamesList: 'SPARC MMP1 MMP2 MMP9 MMP3 MMP7 MMP10 MMP11 MMP12 MMP14 MMP13 MMP15 MMP19 MMP23B MMP28 ITGB3 ITGAV CDH1 PTK2 WFDC2'},
									{listName: 'General: TGF-beta Pathway (25 genes)', geneNamesList: 'TGFB1 TGFBR1 TGFBR2 TGFB2 TGFBR3 TGFB3 BMP3 BMP7 BMPR1B BMPR2 ACVR1 ACVR1B GDF11 INHBA INHBB INHBC INHBE SMAD2 SMAD3 SMAD5 SMAD4 SMAD1 SPTBN1 TGFBRAP1 ZFYVE9'}];
  geneSearchResults;
  selectedGeneNames: string = "";
  selectedGeneStudyList: string[] = [];
  selectedGeneStudyNamesList: string[] = [];
  genesNamesInputField: Subject<string> = new Subject();
  loadingGeneSymbolValidation: boolean = false; //loading flag for validating gene names
  validatingGeneNamesCounter: number = 0;

  @Output() selectedFilters = new EventEmitter<string>(); //this variable will propagate filter selection changes to parent component //@@@PDC-221
  //@@@PDC 890: Jumping from study summary page to files
  @Output() selectedTabForStudySummary: EventEmitter<any> = new EventEmitter<any>();

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

  downloadableFilter: Filter[] = [];
  selectedDownloadable: string[] = [];
  selectedDownloadableRadiobuttonVal: string = '';

  biospecimenStatusFilter: Filter[] = [];
  selectedBiospecimenStatus: string[] = [];

  caseStatusFilter: Filter[] = [];
  selectedCaseStatus: string[] = [];
  
  studyNameStudyIdMap: any = [];
  studyNameUUIDMap: any = [];

  selectedGeneSelectField:string[] = [];

  allFiltersSelected: any[] = [];
  studyNameForGenesTab: any[] =[];
  allStudyIDsForGenes:any[] = [];

  @Input()
  selectedTab = 0; //display apropriate filter tab on data table tab selection

  @Input()
  parentCharts: Subject<any>;

  static urlBase;
  //@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
  @Input() breadCrumbFilters;

  //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
  // Arrays which hold filter names. Must be updated when new filters are added to browse page.
  newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
  "ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "gene_name": "", "studyName_genes_tab": "", "geneNameStudyArray": "", "biospecimen_status": "", "case_status": ""};
  allFilterCategoriesForCntrlFiles: string[] = ["project_name","primary_site","program_name","disease_type","analytical_fraction","experiment_type","acquisition_type","submitter_id_name","sample_type","study_name","ethnicity","race","gender","tumor_grade","data_category","file_type","access","downloadable", "gene_name", "studyName_genes_tab", "geneNameStudyArray", "biospecimen_status", "case_status"];
  
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
    "tumor_grade",
    "data_category",
    "file_type",
    "access",
    "downloadable",
    "biospecimen_status",
    "case_status"
  ];
  
  //dataCategoryFileTypeMap = {
//	  "Other Metadata": ["Document", "Text", "Archive"], "Peptide Spectral Matches": ["Open Standard", "Text"], "Processed Mass Spectra" : ["Open Standard"],
//	  "Protein Assembly": ["Text"], "Protein Databases": ["Text"], "Quality Metrics": ["Text", "Web"], "Raw Mass Spectra": ["Proprietary"], 
//	  "Spectral Library": ["Proprietary"], "Alternate Processing Pipeline": ["Archive"]
 // };
  dataCategoryFileTypeMap = {};
  
  //fileTypeDataCategoryMap = {
	//	"Document": ["Other Metadata"], "Open Standard": ["Peptide Spectral Matches", "Processed Mass Spectra"], "Proprietary": ["Raw Mass Spectra", "Spectral Library"],
	//	"Text": ["Other Metadata", "Peptide Spectral Matches", "Protein Assembly", "Protein Databases", "Quality Metrics"], "Web": ["Quality Metrics"],
	//	"Archive": ["Alternate Processing Pipeline", "Other Metadata"]
  //};
  fileTypeDataCategoryMap = {};

  //array to keep all possible stduies
  allStudyArray: string[] = [];
  fenceRequest:boolean = false;

  constructor( private route:ActivatedRoute, private loc: Location,
    private browseFiltersService: BrowseFiltersService,
    private browseService: BrowseService
  ) {
    BrowseFiltersComponent.urlBase = environment.dictionary_base_url;
	this.getDataCategoryMapping();
    this.getAllFilterData();
  }

  get staticUrlBase() {
    return BrowseFiltersComponent.urlBase;
  }

  /*API call to get all filter data */
  private getAllFilterData() {
    this.loading = true;
    this.browseFiltersService.getAllFiltersData().subscribe((data: any) => {
      this.allCategoryFilterData = data.uiFilters;
	  this.getStudyUUIDNameMapping();
      this.populateFilters();
      this.loading = false;
    });
  }
  
  //Get data category to file type and vice a versa mapping
  private getDataCategoryMapping() {
	this.loading = true;
    this.browseFiltersService.getDataCategoryToFileTypeMapping().subscribe((data: any) => {
		console.log(data);
		var mapping:dataCategory2FileTypeMapping[] = data.uiDataCategoryFileTypeMapping;
		for (let record of mapping){
			//There might be several file types mapped to one data category
			if (this.dataCategoryFileTypeMap.hasOwnProperty(record.data_category)) {
				this.dataCategoryFileTypeMap[record.data_category].push(record.file_type);
			} else {
				this.dataCategoryFileTypeMap[record.data_category] = Array(record.file_type);
			}
			//There might be several data categories mapped to one file type
			if (this.fileTypeDataCategoryMap.hasOwnProperty(record.file_type)) {
				this.fileTypeDataCategoryMap[record.file_type].push(record.data_category);
			} else {
				this.fileTypeDataCategoryMap[record.file_type] = Array(record.data_category);
			}
		}
		console.log(this.dataCategoryFileTypeMap, this.fileTypeDataCategoryMap);
	});
  }
  
  private getStudyUUIDNameMapping(){
	  this.browseFiltersService.getStudyUUID2NameMapping().subscribe((data: any) => {
	  //@@@PDC-1123 call ui wrapper API
      let allPrograms = data.uiProgramsProjectsStudies;
	  for (let program of allPrograms){
		  for (let project of program.projects){
			  for (let study of project.studies){
				  this.studyNameUUIDMap[study.study_id] = study.submitter_id_name;
			  }
		  }
	  }
	  console.log(this.studyNameUUIDMap);
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
    for (let i = 0; i < this.allFilterCategory.length; i++) {
      let filterCategoryName = this.allFilterCategory[i];
      let filterList: Filter[] = this.findFilterListByName(filterCategoryName);
	  //console.log(this.allCategoryFilterData);
      let filterListData: FilterElement[] = this.allCategoryFilterData[filterCategoryName];
      for (let item of filterListData) {
        let filter: Filter = {
          filterName: item.filterName,
          filterCount: item.filterValue.length
        };
        filterList.push(filter);
        this.allStudyArray = _.union(this.allStudyArray, item.filterValue);
        this.allFilterCategoryMapData.set(
          filterCategoryName + ":" + item.filterName,
          item.filterValue
        );
      }
	  // Generate a map between study name and study id for study id URL filter
	  if (filterCategoryName == "submitter_id_name"){
		for (let study of filterListData) {
			this.studyNameStudyIdMap[study.filterValue[0]] = study.filterName;
		}
	  }
    }
    //keep full set of
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
    this.dataCategoryFilter.sort(this.compare);
    this.fileTypeFilter.sort(this.compare);
    this.accessFilter.sort(this.compare);
    this.downloadableFilter.sort(this.compare);
    this.biospecimenStatusFilter.sort(this.compare);
    this.caseStatusFilter.sort(this.compare);
	
  
  //After the filters were populated if there are any filter values set in URL need to emit these filter values and update filters
	//URL values for filters should be set in the following format:
	//https://mainurl/filters/[filter name 1]:[filter value 1]|[filter value 2]&[filter name 2]:[filter value 1]|[filter value 2]
	this.route.paramMap.subscribe(params => {
    let filters = params.get("filters");
    console.log(filters);
    if(filters !=null ||filters != undefined){
      filters = filters.replace('_slash', '/');
    }
		//If there were any URL filter values
		if (filters) {
			this.urlFilterParams = true;
			let filtersExtracted = filters.split('&');
			console.log(filtersExtracted);
			for (let filter_val of filtersExtracted){
				var timeoutId = setTimeout(() => {
					console.log(filter_val);
					let filter = filter_val.split(':');
					//PDC-786 allow study_id URL filter to work as study_name filter
					if (filter[0] == "study_submitter_id"){
						let studyNames = "";
						//Convert study submitter ids to study names
						for (let studyID of filter[1].split('|')){
							if (this.studyNameStudyIdMap[studyID.toUpperCase()]) {
								studyNames = studyNames + this.studyNameStudyIdMap[studyID.toUpperCase()] + "|";
							}
							else {
								console.log("Error, study submitter id: " + studyID.toUpperCase() + " does not exist!!!");
							}
						}
						console.log(studyNames);
						this.setFilters("study_name", studyNames);
						this.selectedFilters.emit("study_name:" + studyNames.split('|').join(';'));
					//PDC-835
					}else if (filter[0] == "study_id"){
						let studyNames = "";
						//Convert study uuids to study names
						for (let studyID of filter[1].split('|')){
							if (this.studyNameUUIDMap[studyID]) {
								studyNames = studyNames + this.studyNameUUIDMap[studyID] + "|";
							}
							else {
								console.log("Error, study uuid: " + studyID + " does not exist!!!");
							}
						}
						console.log(studyNames);
						this.setFilters("study_name", studyNames);
						this.selectedFilters.emit("study_name:" + studyNames.split('|').join(';'));
					} else if (filter[0] == "selectedTab"){
              this.selectedTabForStudySummary.emit({index:3});
          } else {
						//For all other URL filters set the apropriate filter and propagate to other modules
						this.setFilters(filter[0], filter[1]); //filter[0] - name of the filter, filter[1] - value of the filter
						this.selectedFilters.emit(filter[0] + ":" + filter[1].split('|').join(';')); //Change delimiter for multiple values for the same filter from | to ;
					}
					this.loadingURLParams = true;
					this.updateFiltersCounters();
				}, 500); //need to set a short timout so that other components will have time perform queries
			}
		}
    });

    //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
    //If its a fence request, populate previously selected filters.
    var selectedFiltersForBrowse = JSON.parse(localStorage.getItem("selectedFiltersForBrowse"));
    if (this.fenceRequest && selectedFiltersForBrowse) {
      for (var i=0;i<this.allFilterCategoriesForCntrlFiles.length;i++) {
        if (selectedFiltersForBrowse[this.allFilterCategoriesForCntrlFiles[i]]) {
          var filterName = this.allFilterCategoriesForCntrlFiles[i];
          var checkBoxVal = selectedFiltersForBrowse[filterName];
          if (filterName == "gene_name" || filterName == "studyName_genes_tab" || filterName == "geneNameStudyArray") {
            this.setFilters(filterName, checkBoxVal, true);
            if (filterName == "gene_name") { 
              this.selectedFilters.emit(filterName+":"+checkBoxVal.replace(/ /g, ";"));
            }
            if (filterName == "studyName_genes_tab") {
              this.selectedFilters.emit("study_name:"+checkBoxVal);
            }
          } else {
            for (var j = 0; j < checkBoxVal.length; j++) {
              this.setFilters(filterName, checkBoxVal[j], true);
            } 
            this.selectedFilters.emit(filterName+":"+checkBoxVal.join(";"));
            // This is for populating the 3 charts
            if (filterName == "submitter_id_name") {
              this.selectedFilters.emit("study_name:"+checkBoxVal.join(";"));
            }
        }
        }
      }
      this.updateFiltersCounters();
    }
  }

  //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
  // PDC-728 Helper function to put select checkboxes of the filters set using URL values
  private setFilters(filterName: string, filterVal: string, setValuesForFence = false, clearValuesforbreadcrumb = false){
    switch (filterName) {
      case "project_name":
      if (setValuesForFence) {
        this.selectedProjects.push(filterVal);
      } else if (clearValuesforbreadcrumb) {
        this.clearSelectionsProjects();
      } else {
        this.selectedProjects = filterVal.split('|');
      }
        break;
      case "primary_site":
        if (setValuesForFence) {
          this.selectedPrimarySites.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsPrimarySite();
        } else {
          this.selectedPrimarySites  = filterVal.split('|');
        }
        break;
      case "program_name":
        if (setValuesForFence) {
          this.selectedPrograms.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsPrograms();
        } else {
        this.selectedPrograms  = filterVal.split('|');
        }
        break;
      case "disease_type":
        if (setValuesForFence) {
          this.selectedDiseases.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsDiseaseType();
        } else {
          this.selectedDiseases  = filterVal.split('|');
        }
        break;
      case "analytical_fraction":
        if (setValuesForFence) {
          this.selectedAnFracs.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAnalyticalFraction();
        } else {
        this.selectedAnFracs  = filterVal.split('|');
        }
        break;
      case "experiment_type":
        if (setValuesForFence) {
          this.selectedExpStarts.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsExperimentalStrategy();
        } else {
        this.selectedExpStarts  = filterVal.split('|');
        }
        break;
      case "acquisition_type":
        if (setValuesForFence) {
          this.selectedAcquisitions.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAcquisitions();
        } else {
        this.selectedAcquisitions  = filterVal.split('|');
        }
        break;
      case "study_name":
        if (setValuesForFence) {
          //this code is not needed now but might be useful in the future.
          //this.selectedStudyFilter = new Array(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsStudyID();
        } else {
          this.selectedStudyFilter  = filterVal.split('|');
        }
        break;
      case "submitter_id_name":
        if (setValuesForFence) {
          this.selectedStudyFilter.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsStudyID();
        }  else {
          this.selectedStudyFilter  = filterVal.split('|');
        }
        break;
      case "studyName_genes_tab":
        if (setValuesForFence) {
          this.studyNameForGenesTab.push(filterVal);
        }
        break;
      case "geneNameStudyArray":
        if (setValuesForFence) {
          this.allStudyIDsForGenes = filterVal.split(";");
        }
        break;
      case "sample_type":
        if (setValuesForFence) {
          this.selectedSampleType.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsSampleType();
        } else {
          this.selectedSampleType  = filterVal.split('|');
        }
        break;
      case "ethnicity":
        if (setValuesForFence) {
          this.selectedEthnicity.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsEthnicity();
        } else {
        this.selectedEthnicity  = filterVal.split('|');
        }
        break;
      case "race":
        if (setValuesForFence) {
          this.selectedRace.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsRace();
        } else {
          this.selectedRace  = filterVal.split('|');
        }
        break;
      case "gender":
        if (setValuesForFence) {
          this.selectedGender.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsGender();
        } else {
        this.selectedGender  = filterVal.split('|');
        }
        break;
      case "tumor_grade":
        if (setValuesForFence) {
          this.selectedTumorGrade.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTumorGrade();
        } else {
        this.selectedTumorGrade  = filterVal.split('|');
        }
        break;
      case "data_category":
      if (setValuesForFence) {
        this.selectedDataCategory.push(filterVal);
      } else if (clearValuesforbreadcrumb) {
        this.clearSelectionsDataCategory();
      } else {
        this.selectedDataCategory  = filterVal.split('|');
      }
        break;
      case "file_type":
      if (setValuesForFence) {
        this.selectedFileType.push(filterVal);
      } else if (clearValuesforbreadcrumb) {
        this.clearSelectionsFileType();
      } else {
        this.selectedFileType  = filterVal.split('|');
      }
        break;
      case "access":
      if (setValuesForFence) {
        this.selectedAccess.push(filterVal);
      } else if (clearValuesforbreadcrumb) {
        this.clearSelectionsAccess();
      } else {
        this.selectedAccess  = filterVal.split('|');
      }
        break;
      case "downloadable":
      if (setValuesForFence) {
        this.selectedDownloadableRadiobuttonVal = filterVal;
        this.selectedDownloadable.push(this.selectedDownloadableRadiobuttonVal);
      } else if (clearValuesforbreadcrumb) {
        this.clearSelectionsDownloadable();
      } else {
        this.selectedDownloadable = filterVal.split('|');
      }
        break;
      case 'gene_name':
        if (setValuesForFence) {
          this.selectedGeneNames = filterVal.trim();
          this._validate(this.selectedGeneNames);
        } else if (clearValuesforbreadcrumb) {
          this.clearAllGenesSelections();
        }
        break;  
	  case "gene_names":
	    //gene names are expected to be delimited with spaces or new lines in the input field
		//therefore replacing commas with spaces
		//the data tables will not be filtered by gene names, the gene names will only be validated
        this.selectedGeneNames = filterVal.replace(/\|/, ' ').trim();
        this._validate(this.selectedGeneNames);
        break;
      case "biospecimen_status":
        if (setValuesForFence) {
          this.selectedBiospecimenStatus.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsBiospecimenStatus();
        } else {
          this.selectedBiospecimenStatus  = filterVal.split('|');
        }
        break;
        case "case_status":
          if (setValuesForFence) {
            this.selectedCaseStatus.push(filterVal);
          } else if (clearValuesforbreadcrumb) {
            this.clearSelectionsCaseStatus();
          } else {
            this.selectedCaseStatus  = filterVal.split('|');
          }
            break;
    }
  }

  //sort filters by alphabet
  private compare(filter1: Filter, filter2: Filter) {
    if ((filter1.filterName != null && filter1.filterName.toUpperCase()) < (filter2.filterName != null && filter2.filterName.toUpperCase())) {
      return -1;
    } else if ((filter1.filterName != null && filter1.filterName.toUpperCase()) > (filter2.filterName != null && filter2.filterName.toUpperCase())) {
      return 1;
    } else {
      return 0;
    }
  }

  /* Update filters counters when filter selection is changed */
  /*if only one filter category has been selected, all filter 
  counts in that category shouldn't update*/
  //@@@PDC-1216 redesign filter api
  updateFiltersCounters(geneNameStudyArray: string[] = [], geneNames = "", studyNamesList: any[] = [], studySelected: boolean = false) {
  // reset array of selected filters and localstorage
   localStorage.removeItem("selectedFiltersForBrowse");
   this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type":"", "primary_site":"", "analytical_fraction":"", "experiment_type":"",
  "ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "file_type": "", "access": "", "downloadable": "", "gene_name": "", "studyName_genes_tab": "", "geneNameStudyArray": "", "biospecimen_status": "", "case_status": ""};
	//If there were filters set through url parameters and a new filter was set manualy
  // need to clear url of any filter settings
	if (this.urlFilterParams){
		if (this.loadingURLParams) {
			this.loadingURLParams = false;
		}
		else {
			var currentUrl = this.loc.path();
			//Generate new url that does not contain filter parameters
			var newUrl = currentUrl.split("filters");
			this.loc.replaceState(newUrl[0]);
		}
	}
    //track how many filter category selected, handle one category selected special case
	let numOfFilterCategorySelected = 0;
    let intersectedStudyArray: string[];
    let geneFilterSelected = false;
		//if there is gene name selected, all other filter need to intersect with gene name filter
		//otherwise use full set of study array
		if(geneNameStudyArray.length >0 || this.allStudyIDsForGenes.length > 0){
      if (this.allStudyIDsForGenes.length > 0) {
        intersectedStudyArray = this.allStudyIDsForGenes;
      } else {
        intersectedStudyArray = geneNameStudyArray;
      }
      numOfFilterCategorySelected++;
      geneFilterSelected = true;
		}else if(this.selectedGeneStudyList.length >0){
      intersectedStudyArray = this.selectedGeneStudyList;
      numOfFilterCategorySelected++;
      geneFilterSelected = true;
		}else{
			intersectedStudyArray	= this.allStudyArray;
    }
    //track filter category name if only one category selected
    let selectedFilterCategoryName = null;
    /**loop all selected filters and do the below operation
     *  (selected filter 1 in filter category 1 Union selected filter 2 in filter category 1) intersect
     *  (selected filter 3 in filter category 2 Union selected filter 4 in filter category 2)*/
    for (let i = 0; i < this.allFilterCategory.length; i++) {
      let filterCategoryName = this.allFilterCategory[i];
      let selectedFilter: string[] = this.findSelectedFilterByName(filterCategoryName);
      if (selectedFilter.length > 0) {
        //populate array with selected filters.
        this.newFilterSelected[filterCategoryName] = selectedFilter;
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
        }
        //intersect all unionStudyInSameCategory which is the result of union all selected filters in each category
        intersectedStudyArray = _.intersection(
          intersectedStudyArray,
          unionStudyInSameCategory
        );
      }
    }

    //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
    //Set selected filters in local storage.
    if(geneNameStudyArray.length >0) {
      this.newFilterSelected["geneNameStudyArray"] = geneNameStudyArray.join(";");
      localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));
    }
    if (studyNamesList.length > 0) {
      this.newFilterSelected["studyName_genes_tab"] = studyNamesList.join(";");
      localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));
    }
    if (geneNames != "") {
      this.newFilterSelected["gene_name"] = geneNames;
      localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));
    }
    if (this.studyNameForGenesTab.length > 0) {
      this.newFilterSelected["studyName_genes_tab"] = this.studyNameForGenesTab.join(";");
      localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));
    }
    if (this.selectedGeneNames != '') {
      this.newFilterSelected["gene_name"] = this.selectedGeneNames;
      var geneNamesArray = this.selectedGeneNames.trim().split(";");
      for (var i=0;i < geneNamesArray.length; i++) {
        this.selectedGeneStudyList.push(geneNamesArray[i]);
      }
      localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));
    }
    localStorage.setItem("selectedFiltersForBrowse", JSON.stringify(this.newFilterSelected));

    /**find final intersectedStudyArray across all selected fitler from above and each filter intersects
     * with intersectedStudyArray to find the updated count for each filter  */
    for (let filterCategoryName of this.allFilterCategory) {
      if (numOfFilterCategorySelected === 1 && !geneFilterSelected && filterCategoryName == selectedFilterCategoryName) {
        continue;
      }
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

    let noStudyAvailable = false;
    let submitterIdNameList = this.newFilterSelected['submitter_id_name'];
    if(this.selectedGeneNames != '' && Array.isArray(submitterIdNameList) &&  submitterIdNameList.length> 0){
      if(this.newFilterSelected['study_name'] == ''){
        this.newFilterSelected['study_name'] = _.intersection(this.selectedGeneStudyNamesList, submitterIdNameList).join(";");
      }else{
        this.newFilterSelected['study_name'] = this.newFilterSelected['study_name']+ ";"+ _.intersection(this.selectedGeneStudyNamesList, submitterIdNameList).join(";");
      }
      if(_.intersection(this.selectedGeneStudyNamesList, submitterIdNameList).length == 0){
        noStudyAvailable = true;
      }
    }else if(this.selectedGeneNames != ''){
      if(this.newFilterSelected['study_name'] == ''){
        this.newFilterSelected['study_name'] = this.selectedGeneStudyNamesList.join(";");
      }else{
        this.newFilterSelected['study_name'] = this.newFilterSelected['study_name']+ ";"+ this.selectedGeneStudyNamesList.join(";");
      }
    }else if(Array.isArray(submitterIdNameList) &&  submitterIdNameList.length> 0){
      if(this.newFilterSelected['study_name'] == ''){
        this.newFilterSelected['study_name'] = submitterIdNameList.join(";");
      }else{
        this.newFilterSelected['study_name'] = this.newFilterSelected['study_name']+ ";"+ submitterIdNameList.join(";");
      }
    }

    for(let filterName of this.allFilterCategory){
      if(Array.isArray(this.newFilterSelected[filterName])){
        this.newFilterSelected[filterName] = this.newFilterSelected[filterName].join(";");
      }
    }
    if(noStudyAvailable){
      for (let i = 0; i < this.allFilterCategory.length; i++) {
        let filterCategoryName = this.allFilterCategory[i];
        let selectedFilter: Filter[] = this.findFilterListByName(
          filterCategoryName
        );
        for (let selectedFilterData of selectedFilter) {
          selectedFilterData.filterCount = 0;
        }
      }
    }else{
      this.browseFiltersService
      .getFilteredFiltersDataQuery(this.newFilterSelected)
      .subscribe((data: any) => {
        for (let i = 0; i < this.allFilterCategory.length; i++) {
          let filterCategoryName = this.allFilterCategory[i];
          //@@@PDC-2113: Browse - Clinical - Pick filters & then reverse - Study count does not match
          //This piece of code stops further processing and does not update filter's study count for the first filter (when filters are deselected in reverse).
		  //Commeting out of the next three lines of code causes issue with filters - when no more than 1 filter option can be chosen in the same filter section. 
          if (numOfFilterCategorySelected === 1 && !geneFilterSelected && filterCategoryName == selectedFilterCategoryName) {
          //@@@PDC-2283 fix the issue filters are deselected in reverse.
            let allFilterData = this.allCategoryFilterData[filterCategoryName];
            let selectedFilter: Filter[] = this.findFilterListByName(
              filterCategoryName
            );
            for(let filterData of allFilterData){
              for(let filterElement of selectedFilter){
                if(filterData['filterName'] == filterElement.filterName){
                  filterElement.filterCount = filterData['filterValue'].length;
                }
              }
            }
            continue;
          } 

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
    let studyList: Filter[] = [];
    for (let studyFilter of this.allStudyFilter) {
      if (studyFilter.filterCount > 0) {
        studyList.push(studyFilter);
      }
    }
    //@@@PDC-1161: Can't select multiple studies if any other filter is applied
    if(!studySelected){
      this.studyFilter = studyList;
    }
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
      case 'study_name':
        selectedFilter = this.selectedStudyFilter;
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
        break;
      case "data_category":
        selectedFilter = this.selectedDataCategory;
        break;
      case "file_type":
        selectedFilter = this.selectedFileType;
        break;
      case "access":
        selectedFilter = this.selectedAccess;
        break;
      case 'downloadable':
        selectedFilter = this.selectedDownloadable;
        break;
      case "biospecimen_status":
        selectedFilter = this.selectedBiospecimenStatus;
        break;
      case "case_status":
        selectedFilter = this.selectedCaseStatus;
        break;
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
      case "study_name":
        filter = this.studyFilter;
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
        break;
      case "data_category":
        filter = this.dataCategoryFilter;
        break;
      case "file_type":
        filter = this.fileTypeFilter;
        break;
      case "access":
        filter = this.accessFilter;
        break;
      case "downloadable":
        filter =  this.downloadableFilter;
        break;
      case "biospecimen_status":
        filter =  this.biospecimenStatusFilter;
        break;
      case "case_status":
        filter = this.caseStatusFilter;
        break;
    }
    return filter;
  }

  /* Project filter callback onChange */
  filterDataByProject(e) {
    let newFilterValue = "project_name:" + this.selectedProjects.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  /* Primary site filter callback onChange */
  filterDataByPrimarySite(e) {
    let newFilterValue = "primary_site:" + this.selectedPrimarySites.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  //@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
     if (changes['breadCrumbFilters'] && changes['breadCrumbFilters'].currentValue) {
        var filterChangedInBreadcrumbBar = changes['breadCrumbFilters'].currentValue;
        if (filterChangedInBreadcrumbBar == "Clear all selections") {
            this.clearAllSelections();
        } else {
          //@@@PDC-1418: Unable to clear breadcrumbs when the user clicks on breadcrumbs other than "Clear"
          let filterValWithrandowmNum =  filterChangedInBreadcrumbBar.split("~");
          let filterValWithoutrandomNum = filterValWithrandowmNum[0];
          var filter_value = filterValWithoutrandomNum.split(":");
          if (filter_value[1] != "") {
            if (filter_value[0] == "gene_name") {
              //special case for gene_name filter
              const filterVal = this.replaceAll(filter_value[1], "|", " ");
              this.setFilters(filter_value[0], filterVal, true);
              this.filterDataByGeneName();
            } else {
              this.setFilters(filter_value[0], filter_value[1]);
              var modifiedfilterval = this.replaceAll(filterValWithoutrandomNum, "|", ";");
              this.selectedFilters.emit(modifiedfilterval);
              this.updateFiltersCounters();
            }
          } else {
            this.setFilters(filter_value[0], '', false, true);
          }
        }
      }
    }, 1000);
  }

  //@@@PDC-277: Add a filter crumb bar at the top that explains the filter criteria selected
  replaceAll(str,replaceWhat,replaceTo){
		replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		var re = new RegExp(replaceWhat, 'g');
		return str.replace(re,replaceTo);
  }
  
  /* Program filter callback onChange */
  filterDataByProgram(e) {
    var newFilterValue = "program_name:" + this.selectedPrograms.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  /* Disease type filter callback onChange */
  filterDataByDiseaseType(e) {
    var newFilterValue = "disease_type:" + this.selectedDiseases.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  /* Analytical fraction filter callback onChange */
  filterDataByAnalyticalFraction(e) {
    var newFilterValue = "analytical_fraction:" + this.selectedAnFracs.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  /* Experimental strategy filter callback onChange */
  filterDataByExperimentalStrategy(e) {
    var newFilterValue = "experiment_type:" + this.selectedExpStarts.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  filterDataByAcquisition(e) {
    var newFilterValue = "acquisition_type:" + this.selectedAcquisitions.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  filterDataByEthnicity(e) {
    var newFilterValue = "ethnicity:" + this.selectedEthnicity.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  filterDataByRace(e) {
    var newFilterValue = "race:" + this.selectedRace.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  filterDataByGender(e) {
    var newFilterValue = "gender:" + this.selectedGender.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  filterDataByTumorGrade(e) {
    var newFilterValue = "tumor_grade:" + this.selectedTumorGrade.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  //PDC-567
  filterDataBySampleType(e) {
    var newFilterValue = "sample_type:" + this.selectedSampleType.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  //PDC-1161: Can't select multiple studies if any other filter is applied
  filterDataByStudy(e) {
    var newFilterValue = "study_name:" + this.selectedStudyFilter.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters([], "", [], true);
  }

  filterDataByDataCategory(e) {
	//In case where user clicked on metadata files counter on study table
	if (this.selectedDataCategory.length > 0 && this.selectedDataCategory[0].indexOf(";") > -1) {
		var temp = this.selectedDataCategory[0].split(';');
		this.selectedDataCategory = temp;
	}
    var newFilterValue = "data_category:" + this.selectedDataCategory.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  filterDataByFileType(e) {
    var newFilterValue = "file_type:" + this.selectedFileType.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  //@@@PDC-1095
  // If Data category filter is selected only defined in mapping file type filters should be available for selection
  fileTypeFilterDisabled(filterName: string):boolean {
	  let result = false;
	  let isSelected = false;
	  if (this.selectedDataCategory.length > 0 && this.selectedDataCategory[0] != ""){
		  //Check in the mapping if the current file type filter should be available for selection
		  for (let dataCat of  this.fileTypeDataCategoryMap[filterName]){
			  if (this.selectedDataCategory.indexOf(dataCat) > -1) {
				  isSelected = true;
			  }
		  }
		  if (!isSelected){
			  result = true;
		  }
	  }
	  //console.log("Return " + result + " for " + filterName);
	  return result;
  }
  //@@@PDC-1095
  //// If File type filter is selected only defined in mapping data category filters should be available for selection
  dataCetegoryFilterDisabled(filterName: string):boolean {
	  let result = false;
	  let isSelected = false;
	  if (this.selectedFileType.length > 0 && this.selectedFileType[0] != ""){
		    //Check in the mapping if the current data category filter should be available for selection
		  for (let fileType of this.dataCategoryFileTypeMap[filterName]){
			  if (this.selectedFileType.indexOf(fileType) > -1){
				  isSelected = true;
			  }
		  }
		  if (!isSelected) {
			  result = true;
		  }
	  }
	  return result;
  }
  
  filterDataByAccess(e) {
    var newFilterValue = "access:" + this.selectedAccess.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  //@@@PDC-775: Add new downloadable filter option to file filters
  filterDataByDownloadable(e) {
    setTimeout(() => {
      this.selectedDownloadable = [];
      if (this.selectedDownloadableRadiobuttonVal != '') {
        this.selectedDownloadable.push(this.selectedDownloadableRadiobuttonVal);
      }
      var newFilterValue = "downloadable:" + this.selectedDownloadable;
      this.selectedFilters.emit(newFilterValue);
      this.updateFiltersCounters();
    },1000);
  }

	filterDataByGeneName(){
		//emit new gene name to selectedFilters
		this.loading = true;
		//Have to replace spaces with semicolon since that is the expected list delimiter for the API
		let processedGeneNames = this.selectedGeneNames.trim().toUpperCase().replace(/\s+|\n+/g, ';');
		console.log(processedGeneNames);
		//Genes data tab will be filtered directly by gene names
		var newFilterValue = "gene_name:" + processedGeneNames;
		this.selectedFilters.emit(newFilterValue);
		//PDC-1001 added a timeout to send the list of studies associated with the search gene(s)
		// to allow time to proccess the gene name filter.
		setTimeout(() => {
		  this.browseFiltersService.getStudyByGeneName(processedGeneNames).subscribe((data: any) => {
			let studyList = [];
			let studyNamesList = [];
			console.log(data.uiGeneStudySpectralCount);
			for(const item of data.uiGeneStudySpectralCount){
				studyList.push(item.study_submitter_id); //study id in format SXXXX-X
				studyNamesList.push(item.submitter_id_name); //study name
			}
      this.selectedGeneStudyList = studyList;
      this.selectedGeneStudyNamesList = studyNamesList;
			this.updateFiltersCounters(studyList, this.selectedGeneNames, studyNamesList);
			//All data tabs except for Genes tab will be filtered by studies that include the selected genes
			var newFilterValue = "gene_study_name:" + studyNamesList.join(";");
			this.selectedFilters.emit(newFilterValue);
			var newFilterValue = "study_name:" + studyNamesList.join(";");
			this.selectedFilters.emit(newFilterValue);
			this.loading = false;
		  });
		}, 200);
  }
  
  filterDataByBiospecimenStatus(e) {
    var newFilterValue = "biospecimen_status:" + this.selectedBiospecimenStatus.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }

  filterDataByCaseStatus(e) {
    var newFilterValue = "case_status:" + this.selectedCaseStatus.join(";");
    this.selectedFilters.emit(newFilterValue);
    this.updateFiltersCounters();
  }
  

  //Clear projects filter selections callback button
  clearSelectionsProjects() {
    this.selectedProjects = [];
    this.filterDataByProject(false);
  }
  //Clear programs filter selections callback button
  clearSelectionsPrograms() {
    this.selectedPrograms = [];
    this.filterDataByProgram(false);
  }
  //Clear primary sites filter selections callback button
  clearSelectionsPrimarySite() {
    this.selectedPrimarySites = [];
    this.filterDataByPrimarySite(false);
  }
  //Clear disease types filter selections callback button
  clearSelectionsDiseaseType() {
    this.selectedDiseases = [];
    this.filterDataByDiseaseType(false);
  }
  //Clear analytical fractions filter selections callback button
  clearSelectionsAnalyticalFraction() {
    this.selectedAnFracs = [];
    this.filterDataByAnalyticalFraction(false);
  }
  //Clear experimental strategies filter selections callback button
  clearSelectionsExperimentalStrategy() {
    this.selectedExpStarts = [];
    this.filterDataByExperimentalStrategy(false);
  }
  clearSelectionsAcquisitions() {
    this.selectedAcquisitions = [];
    this.filterDataByAcquisition(false);
  }
  clearSelectionsEthnicity() {
    this.selectedEthnicity = [];
    this.filterDataByEthnicity(false);
  }
  clearSelectionsRace() {
    this.selectedRace = [];
    this.filterDataByRace(false);
  }
  clearSelectionsGender() {
    this.selectedGender = [];
    this.filterDataByGender(false);
  }
  clearSelectionsTumorGrade() {
    this.selectedTumorGrade = [];
    this.filterDataByTumorGrade(false);
  }

  clearSelectionsSampleType() {
    this.selectedSampleType = [];
    this.filterDataBySampleType(false);
  }

  clearSelectionsStudyID() {
    this.selectedStudyFilter = [];
    this.filterDataByStudy(false);
  }

  clearSelectionsDataCategory() {
    this.selectedDataCategory = [];
    this.filterDataByDataCategory(false);
  }

  clearSelectionsFileType() {
    this.selectedFileType = [];
    this.filterDataByFileType(false);
  }

  clearSelectionsAccess() {
    this.selectedAccess = [];
    this.filterDataByAccess(false);
  }

  //@@@PDC-775: Add new downloadable filter option to file filters
  clearSelectionsDownloadable() {
    this.selectedDownloadable = [];
    this.selectedDownloadableRadiobuttonVal = "";
    this.filterDataByDownloadable(false);
  }

  clearSelectionsBiospecimenStatus() {
    this.selectedBiospecimenStatus = [];
    this.filterDataByBiospecimenStatus(false);
  }

  clearSelectionsCaseStatus() {
    this.selectedCaseStatus = [];
    this.filterDataByCaseStatus(false);
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
    this.selectedDataCategory = [];
    this.selectedFileType = [];
    this.selectedAccess = [];
    this.selectedDownloadable = [];
    this.selectedDownloadableRadiobuttonVal = "";
    this.selectedGeneNames = "";
    this.selectedGeneStudyList = [];
    this.selectedGeneStudyNamesList = [];
    this.studyNameForGenesTab = [];
    this.allStudyIDsForGenes = [];
    this.selectedBiospecimenStatus = [];
    this.selectedCaseStatus = [];
    sessionStorage.removeItem('tableLoading');
    sessionStorage.removeItem('tableUnloading');
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
    this.selectedCaseStatus = [];
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
    this.updateFiltersCounters();
  }

  clearAllBiospecimenSelections() {
    var newFilterValue = "Clear all biospecimen filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedSampleType = [];
    this.selectedStudyFilter = [];
    this.selectedBiospecimenStatus = [];
    this.updateFiltersCounters();
  }

  clearAllFileSelections() {
    var newFilterValue = "Clear all file filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedStudyFilter = [];
    this.selectedDataCategory = [];
    this.selectedFileType = [];
    this.selectedAccess = [];
    this.selectedDownloadable = [];
    this.selectedDownloadableRadiobuttonVal = "";
    this.updateFiltersCounters();
  }
  
   clearAllGenesSelections() {
  	var newFilterValue = "Clear all genes filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedGeneNames = "";
    this.selectedGeneStudyList = [];
    this.selectedGeneStudyNamesList = [];
    this.studyNameForGenesTab = [];
    this.allStudyIDsForGenes = [];
    this.updateFiltersCounters();
  }
  
  //Search for a gene name to validate that such gene exists in our system 
  searchGeneNames(search_term:string){
	this.loadingGeneSymbolValidation = true;
	this.browseFiltersService.getGeneSearchResults(search_term).subscribe((data: any) =>{
		this.geneSearchResults = data.geneSearch.genes;
		this.geneNameValid = false;
		for (let returnValue of this.geneSearchResults){
			if (returnValue.name.toLowerCase() === search_term.toLowerCase()){
				this.geneNameValid = true;
				this.options += returnValue.name + " ";
			}
		}
		if (this.geneNameValid) {
			this.allGeneNamesValid = this.allGeneNamesValid && true;
		}
		else {
			this.allGeneNamesValid = this.allGeneNamesValid && false;
		}
		console.log(this.allGeneNamesValid);
		console.log(this.options);
		//Change loading to false only after finished checking all genes in the list
		if ( this.validatingGeneNamesCounter == this.valudatedGeneNamesList.length) {
			this.loadingGeneSymbolValidation = false;  
		}
		else {
			this.validatingGeneNamesCounter++;
		}
	});
  }	
	
  //This function validates all gene names entered in text area
  private _validate(value: string): string {
	  const filterValue = value.toLowerCase();
	  this.options = "";
	  this.allGeneNamesValid = true;
	  this.valudatedGeneNamesList = value.trim().split(/\s+|\n+/);
	  console.log(this.valudatedGeneNamesList);
	  this.validatingGeneNamesCounter = 1;
	  for (let geneName of this.valudatedGeneNamesList) {
		this.searchGeneNames(geneName);
	  }
	  return this.options;
  }	
  
  //helper function to update Subject variable with current value
  triggerInputEvent(event){
	  this.genesNamesInputField.next(event);
  }

  ngOnInit() {
    //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.code) {
         this.fenceRequest = true;
      }
    });
	  
	// PDC-685 and PDC-683 Monitor changes to gene names textarea field and validate all gene symbols
	// 	as soon as the user entered at least 3 characters or a predefined list of genes was selected
	this.genesNamesInputField.pipe(
		debounceTime(200))
		.subscribe(value => value.length > 2 ? this._validate(value) : '');  
	  
    this.parentCharts.subscribe(event => {
      console.log("in filter child component " + event);
      let filterField = event.split(":");
      let filterCatalog = filterField[0];
      let filterName = filterField[1];
      let found = -1;
      switch (filterCatalog) {
        case "disease type":
          found = this.selectedDiseases.indexOf(filterName);
          if (found === -1) {
            this.selectedDiseases = [];
            this.selectedDiseases.push(filterName);
            this.filterDataByDiseaseType(true);
          } else {
            this.selectedDiseases = this.selectedDiseases.filter(e => e !== filterName);
            this.filterDataByDiseaseType(false);
          }
          break;
        case "experiment types":
          found = this.selectedExpStarts.indexOf(filterName);
          if (found === -1) {
            this.selectedExpStarts = [];
            this.selectedExpStarts.push(filterName);
            this.filterDataByExperimentalStrategy(true);
          } else {
            this.selectedExpStarts = this.selectedExpStarts.filter(e => e !== filterName);
            this.filterDataByExperimentalStrategy(false);
          }
          break;
        case "analytical fractions":
          found = this.selectedAnFracs.indexOf(filterName);
          if (found === -1) {
            this.selectedAnFracs = [];
            this.selectedAnFracs.push(filterName);
            this.filterDataByAnalyticalFraction(true);
          } else {
            this.selectedAnFracs = this.selectedAnFracs.filter(e => e !== filterName);
            this.filterDataByAnalyticalFraction(false);
          }
      }
    });
    //@@@PDC 613: As a user of PDC I want to be able to click on the counts in the Study tab table to see the data
    // Access values from browse.component.ts by subscribing to the click events in it. Filter by study, file type.
    this.browseService.notifyObservable$.subscribe(res => {
      if (res.hasOwnProperty("studyNameForCaseCount")) {
        this.selectedStudyFilter = new Array(res.studyNameForCaseCount);
        this.filterDataByStudy(event);
      }
      if (
        res.hasOwnProperty("studyNameForFileType") &&
        res.hasOwnProperty("fileDetailsforFileType") &&
        res.hasOwnProperty("fileDetailsforDataCategory")
      ) {
        this.selectedStudyFilter = new Array(res.studyNameForFileType);
        this.filterDataByStudy(event);
        setTimeout(() => {
          this.selectedFileType = new Array(res.fileDetailsforFileType);
          this.filterDataByFileType(event);
        }, 1000);
        setTimeout(() => {
          //@@@PDC-1252: Add data category as a filter for the "file counts" section of the Study table
          this.selectedDataCategory = new Array(res.fileDetailsforDataCategory);
		  console.log(this.selectedDataCategory);
          this.filterDataByDataCategory(event);
        }, 2000);
      }
    });
  }

  ngOnDestroy() {
    this.parentCharts.unsubscribe();
  }
}
