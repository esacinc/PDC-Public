import { FilterElement } from './../../types';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ElementRef, ViewChild, ViewChildren, QueryList } from "@angular/core";
import * as _ from "lodash";
import { Observable, Subject, fromEvent } from "rxjs";
//import { map } from 'rxjs/operators';
import { map, debounceTime, startWith, take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from "../../../environments/environment";
import { Filter, FilterData, GeneNameList, dataCategory2FileTypeMapping } from "../../types";
import { BrowseService } from "../browse.service";
import { BrowseFiltersService } from "./browse-filters.service";
@Component({
    selector: "browse-filters",
    templateUrl: "./browse-filters-new.html",
    styleUrls: ["../../../assets/css/global.css", "./browse-filters.scss"],
    providers: [BrowseFiltersService],
    standalone: false
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
//@@@PDC-3778: Implement deep linking to study filtering using PDC study ID
export class BrowseFiltersComponent implements OnInit, OnChanges {
  showAnalyticalFraction: boolean = false;
  showDropdown: boolean = true;
  showDiseaseType: boolean = false;
  showAcquisitionType: boolean = false; // or false, as default
  showStudyFilter: boolean = false;
  showStudy: boolean = false;
  showSampleStatus: boolean = false;
  showGeneFilter: boolean = false;
  showExperimentType: boolean = false;
  showBiospecimenStatus: boolean = false;
  showSamplePanel: boolean = false;
  showCasePanel: boolean = false;
  showTreatmentPanel: boolean = false;
  showEthnicityPanel: boolean = false;
  showRacePanel: boolean = false;
  showGenderPanel: boolean = false;
  showTumorGradePanel: boolean = false;
  showCaseStatusPanel: boolean = false;
  showDemographicPanel: boolean = false;
  showVitalStatusPanel: boolean = false;
  showDiagnosisPanel: boolean = false;
  showExposurePanel: boolean = false;
  showAgeAtDiagnosisPanel: boolean = false;
  showAjccClinicalStagePanel: boolean = false;

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
  selectedBiospecimenStatus: string[] = [];
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
  programNames = {};

  diseaseTypesFilter: Filter[] = [];
  selectedDiseases: string[] = [];

  analyticalFractionsFilter: Filter[] = [];
  selectedAnFracs: string[] = [];

  experimentalStrategiesFilter: Filter[] = [];
  selectedExpStarts: string[] = [];

  dataCategoryFilter: Filter[] = [];
  selectedDataCategory: string[] = [];

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

  vitalStatusFilter: Filter[] = [];
  selectedVitalStatus: string[] = [];

  ageAtDiagnosisFilter: Filter[] = [];
  selectedAgeAtDiagnosis: string[] = [];

  ajccClinicalStageFilter: Filter[] = [];
  selectedAjccClinicalStage: string[] = [];

  ajccPathologicStageFilter: Filter[] = [];
  selectedAjccPathologicStage: string[] = [];

  progressionOrRecurrenceFilter: Filter[] = [];
  selectedProgressionOrRecurrence: string[] = [];

  morphologyFilter: Filter[] = [];
  selectedMorphology: string[] = [];

  siteResectionOrBiopsyFilter: Filter[] = [];
  selectedSiteResectionOrBiopsy: string[] = [];

  therapeuticAgentsFilter: Filter[] = [];
  selectedTherapeuticAgents: string[] = [];

  treatmentIntentTypeFilter: Filter[] = [];
  selectedTreatmentIntentType: string[] = [];

  treatmentOutcomeFilter: Filter[] = [];
  selectedTreatmentOutcome: string[] = [];

  treatmentTypeFilter: Filter[] = [];
  selectedTreatmentType: string[] = [];

  alcoholHistoryFilter: Filter[] = [];
  selectedAlcoholHistory: string[] = [];

  alcoholIntensityFilter: Filter[] = [];
  selectedAlcoholIntensity: string[] = [];

  tobaccoSmokingStatusFilter: Filter[] = [];
  selectedTobaccoSmokingStatus: string[] = [];

  cigarettesPerDayFilter: Filter[] = [];
  selectedCigarettesPerDay: string[] = [];

  caseStatusFilter: Filter[] = [];
  selectedCaseStatus: string[] = [];

  studyNameStudyIdMap: any = [];
  studyNameUUIDMap: any = [];
  studyNamePDCStudyIDMap: any = [];

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
  newFilterSelected = {
    "program_name": "",
    "project_name": "",
    "study_name": "",
    "submitter_id_name": "",
    "disease_type": "",
    "primary_site": "",
    "analytical_fraction": "",
    "experiment_type": "",
    "ethnicity": "",
    "race": "",
    "gender": "",
    "tumor_grade": "",
    "sample_type": "",
    "vital_status": "",
    "age_at_diagnosis": "",
    "ajcc_clinical_stage": "",
    "ajcc_pathologic_stage": "",
    "morphology": "",
    "site_of_resection_or_biopsy": "",
    "progression_or_recurrence": "",
    "therapeutic_agents": "",
    "treatment_intent_type": "",
    "treatment_outcome": "",
    "treatment_type": "",
    "alcohol_history": "",
    "alcohol_intensity": "",
    "tobacco_smoking_status": "",
    "cigarettes_per_day": "",
    "acquisition_type": "",
    "data_category": "",
    "gene_name": "",
    "studyName_genes_tab": "",
    "geneNameStudyArray": "",
    "case_status": ""
  };
  allFilterCategoriesForCntrlFiles: string[] = ["project_name", "primary_site", "program_name", "disease_type", "analytical_fraction", "experiment_type", "acquisition_type", "submitter_id_name", "sample_type", "study_name", "ethnicity", "race", "gender", "tumor_grade", "vital_status", "age_at_diagnosis", "ajcc_clinical_stage", "ajcc_pathologic_stage", "morphology", "site_of_resection_or_biopsy", "progression_or_recurrence", "therapeutic_agents", "treatment_intent_type", "treatment_outcome", "treatment_type", "alcohol_history", "alcohol_intensity", "tobacco_smoking_status", "cigarettes_per_day", "data_category", "gene_name", "studyName_genes_tab", "geneNameStudyArray", "case_status"];

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
    "vital_status",
    "age_at_diagnosis",
    "ajcc_clinical_stage",
    "ajcc_pathologic_stage",
    "morphology",
    "site_of_resection_or_biopsy",
    "progression_or_recurrence",
    "therapeutic_agents",
    "treatment_intent_type",
    "treatment_outcome",
    "treatment_type",
    "alcohol_history",
    "alcohol_intensity",
    "tobacco_smoking_status",
    "cigarettes_per_day",
    "case_status"
  ];

  dataCategoryFileTypeMap = {};
  fileTypeDataCategoryMap = {};

  //array to keep all possible stduies
  allStudyArray: string[] = [];
  fenceRequest:boolean = false;

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
  showCaseStatus: boolean = false;
  showDataCategory: boolean = false;
  showStudyName: boolean = false;
  showVitalStatus: boolean = false;
  showAgeAtDiag: boolean = false;
  showAjccClinicalStage: boolean = false;
  showAjccPathoStage: boolean = false;
  showProgOrRecur: boolean = false;
  showMorph: boolean = false;
  showSiteResectBiop: boolean = false;
  showTherapAgents: boolean = false;
  showTreatIntType: boolean = false;
  showTreatOc: boolean = false;
  showTreatType: boolean = false;
  showAlcoholHist: boolean = false;
  showAlcoholIntense: boolean = false;
  showSmokingStatus: boolean = false;
  showCigarPerDay: boolean = false;
  invalidGenesEnteredByUser = [];
  validGenesNotUsedInPDCStudies = [];

  @ViewChild("primarySiteLists") primarySiteLists: ElementRef;

  constructor(private route: ActivatedRoute, private loc: Location,
              private browseFiltersService: BrowseFiltersService,
              private browseService: BrowseService,
              private elRef: ElementRef,
  ) {
    BrowseFiltersComponent.urlBase = environment.dictionary_base_url;
    this.getDataCategoryMapping();
    this.getAllFilterData();
    this.getProgramNamesData();
  }

  get staticUrlBase() {
    return BrowseFiltersComponent.urlBase;
  }

  /*API call to get all filter data */
  private getAllFilterData() {
    this.loading = true;
    this.browseFiltersService.getAllFiltersData().subscribe((data: any) => {
    this.allCategoryFilterData = data.uiFilters;
    //@@@PDC-4763: One of the link of CPTAC forwarding has issues
    //getStudyUUIDNameMapping is called from populateFilters()
    //this.getStudyUUIDNameMapping();
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
				  this.studyNamePDCStudyIDMap[study.pdc_study_id] = study.submitter_id_name;
			  }
		  }
	  }
	  //console.log(this.studyNameUUIDMap);
    //console.log(this.studyNamePDCStudyIDMap);
    })
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

      //@@@PDC-6692: UI Changes for the Experimental Design tab of Study Summary Page
      //Hide N/A for Metabolomics
      if (filterCategoryName == "acquisition_type") {
        filterList = filterList.filter(item => item.filterName !== "N/A");
        this.acquisitionFilter = filterList;
      }
      // Generate a map between study name and study id for study id URL filter
      if (filterCategoryName == "submitter_id_name") {
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
    this.vitalStatusFilter.sort(this.compare);
    this.ageAtDiagnosisFilter.sort(this.compare);
    this.ajccClinicalStageFilter.sort(this.compare);
    this.ajccPathologicStageFilter.sort(this.compare);
    this.progressionOrRecurrenceFilter.sort(this.compare);
    this.morphologyFilter.sort(this.compare);
    this.therapeuticAgentsFilter.sort(this.compare);
    this.treatmentIntentTypeFilter.sort(this.compare);
    this.treatmentOutcomeFilter.sort(this.compare);
    this.treatmentTypeFilter.sort(this.compare);
    this.alcoholHistoryFilter.sort(this.compare);
    this.alcoholIntensityFilter.sort(this.compare);
    this.tobaccoSmokingStatusFilter.sort(this.compare);
    this.cigarettesPerDayFilter.sort(this.compare);
    this.caseStatusFilter.sort(this.compare);


    //After the filters were populated if there are any filter values set in URL need to emit these filter values and update filters
    //URL values for filters should be set in the following format:
    //https://mainurl/filters/[filter name 1]:[filter value 1]|[filter value 2]&[filter name 2]:[filter value 1]|[filter value 2]
    this.route.paramMap.subscribe(params => {
      let filters = params.get("filters");
      console.log(filters);
      if (filters != null || filters != undefined) {
        filters = filters.replace('_slash', '/');
      }
      //If there were any URL filter values
      if (filters) {
        //@@@PDC-4763: One of the link of CPTAC forwarding has issues
        //The results of this API call are required for URL filters processing.
        this.browseFiltersService.getStudyUUID2NameMapping().subscribe((studyUUIDData: any) => {
          //@@@PDC-1123 call ui wrapper API
          let allPrograms = studyUUIDData.uiProgramsProjectsStudies;
          for (let program of allPrograms) {
            for (let project of program.projects) {
              for (let study of project.studies) {
                this.studyNameUUIDMap[study.study_id] = study.submitter_id_name;
                this.studyNamePDCStudyIDMap[study.pdc_study_id] = study.submitter_id_name;
              }
            }
          }
          console.log(this.studyNameUUIDMap);
          console.log(this.studyNamePDCStudyIDMap);
          //@@@PDC-1123 call ui wrapper API
          this.urlFilterParams = true;
          let filtersExtracted = filters.split('&');
          console.log(filtersExtracted);
          for (let filter_val of filtersExtracted) {
            var timeoutId = setTimeout(() => {
              console.log(filter_val);
              let filter = filter_val.split(':');
              //PDC-786 allow study_id URL filter to work as study_name filter
              if (filter[0] == "study_submitter_id") {
                let studyNames = "";
                //Convert study submitter ids to study names
                for (let studyID of filter[1].split('|')) {
                  if (this.studyNameStudyIdMap[studyID.toUpperCase()]) {
                    studyNames = studyNames + this.studyNameStudyIdMap[studyID.toUpperCase()] + "|";
                  } else {
                    console.log("Error, study submitter id: " + studyID.toUpperCase() + " does not exist!!!");
                  }
                }
                console.log(studyNames);
                this.setFilters("study_name", studyNames);
                this.selectedFilters.emit("study_name:" + studyNames.split('|').join(';'));
                //PDC-835
              } else if (filter[0] == "study_id") {
                let studyNames = "";
                //Convert study uuids to study names
                for (let studyID of filter[1].split('|')) {
                  console.log(studyID);
                  if (this.studyNameUUIDMap[studyID]) {
                    studyNames = studyNames + this.studyNameUUIDMap[studyID] + "|";
                  } else {
                    console.log("Error, study uuid: " + studyID + " does not exist!!!");
                  }
                }
                studyNames = studyNames.slice(0, -1);
                console.log(studyNames);
                this.setFilters("study_name", studyNames);
                this.selectedFilters.emit("study_name:" + studyNames.split('|').join(';'));
                //PDC-3778 add pdc_study_id filter URL filter option
              } else if (filter[0] == "pdc_study_id") {
                let studyNames = "";
                //Convert study uuids to study names
                for (let studyID of filter[1].split('|')) {
                  if (this.studyNamePDCStudyIDMap[studyID]) {
                    studyNames = studyNames + this.studyNamePDCStudyIDMap[studyID] + "|";
                  } else {
                    console.log("Error, PDC Study ID: " + studyID + " does not exist!!!");
                  }
                }
                studyNames = studyNames.slice(0, -1);
                console.log(studyNames);
                this.setFilters("study_name", studyNames);
                this.selectedFilters.emit("study_name:" + studyNames.split('|').join(';'));
              } else if (filter[0] == "selectedTab") {
                this.selectedTabForStudySummary.emit({index: 3});
              } else {
                //For all other URL filters set the apropriate filter and propagate to other modules
                this.setFilters(filter[0], filter[1]); //filter[0] - name of the filter, filter[1] - value of the filter
                this.selectedFilters.emit(filter[0] + ":" + filter[1].split('|').join(';')); //Change delimiter for multiple values for the same filter from | to ;
              }
              this.loadingURLParams = true;
              this.updateFiltersCounters();
            }, 700); //need to set a short timout so that other components will have time perform queries
          }
        }); //main
      }
    });

    //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
    //If its a fence request, populate previously selected filters.
    var selectedFiltersForBrowse = JSON.parse(localStorage.getItem("selectedFiltersForBrowse"));
    if (this.fenceRequest && selectedFiltersForBrowse) {
      for (var i = 0; i < this.allFilterCategoriesForCntrlFiles.length; i++) {
        if (selectedFiltersForBrowse[this.allFilterCategoriesForCntrlFiles[i]]) {
          var filterName = this.allFilterCategoriesForCntrlFiles[i];
          var checkBoxVal = selectedFiltersForBrowse[filterName];
          if (filterName == "gene_name" || filterName == "studyName_genes_tab" || filterName == "geneNameStudyArray") {
            this.setFilters(filterName, checkBoxVal, true);
            if (filterName == "gene_name") {
              this.selectedFilters.emit(filterName + ":" + checkBoxVal.replace(/ /g, ";"));
            }
            if (filterName == "studyName_genes_tab") {
              this.selectedFilters.emit("study_name:" + checkBoxVal);
            }
          } else {
            for (var j = 0; j < checkBoxVal.length; j++) {
              this.setFilters(filterName, checkBoxVal[j], true);
            }
            this.selectedFilters.emit(filterName + ":" + checkBoxVal.join(";"));
            // This is for populating the 3 charts
            if (filterName == "submitter_id_name") {
              this.selectedFilters.emit("study_name:" + checkBoxVal.join(";"));
            }
          }
        }
      }
      this.updateFiltersCounters();
    }
  }

  /**
   * Get the program names data from the backend service
   */
  private getProgramNamesData() {
    setTimeout(() => {
      this.browseFiltersService.getProgramNamesData().subscribe((data: any) => {
        if (data && data.uiProgram) {
          for (const program of data.uiProgram) {
            this.programNames[program.shortname] = program.fullname;
          }
          console.log("Program Names:");
          console.log(this.programNames);
        }
      });
    }, 1000);
  }

  //@@@PDC-799: Redirecting to the NIH login page for the file authorization loses PDC state
  // PDC-728 Helper function to put select checkboxes of the filters set using URL values
  private setFilters(filterName: string, filterVal: string, setValuesForFence = false, clearValuesforbreadcrumb = false) {
    console.log("Filter Selected: " + filterVal);
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
          this.selectedPrimarySites = filterVal.split('|');
        }
        let sortedPrimList = this.moveFilterToTop(this.primarySitesFilter, this.selectedPrimarySites, 'true', '-primSite');
        this.primarySitesFilter = sortedPrimList;
        break;
      case "program_name":
        if (setValuesForFence) {
          this.selectedPrograms.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsPrograms();
        } else {
          this.selectedPrograms = filterVal.split('|');
        }
        let sortedProgramsList = this.moveFilterToTop(this.programsFilter, this.selectedPrograms, 'true', '-program');
        this.programsFilter = sortedProgramsList;
        break;
      case "disease_type":
        if (setValuesForFence) {
          this.selectedDiseases.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsDiseaseType();
        } else {
          this.selectedDiseases = filterVal.split('|');
        }
        let sortedDiseaseTypeList = this.moveFilterToTop(this.diseaseTypesFilter, this.selectedDiseases, 'true', '-diseaseType');
        this.diseaseTypesFilter = sortedDiseaseTypeList;
        break;
      case "analytical_fraction":
        if (setValuesForFence) {
          this.selectedAnFracs.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAnalyticalFraction();
        } else {
          this.selectedAnFracs = filterVal.split('|');
        }
        let sortedAnFractionList = this.moveFilterToTop(this.analyticalFractionsFilter, this.selectedAnFracs, 'true', '-anFrac');
        this.analyticalFractionsFilter = sortedAnFractionList;
        break;
      case "experiment_type":
        if (setValuesForFence) {
          this.selectedExpStarts.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsExperimentalStrategy();
        } else {
          this.selectedExpStarts = filterVal.split('|');
        }
        let sortedExpTypeList = this.moveFilterToTop(this.experimentalStrategiesFilter, this.selectedExpStarts, 'true', '-expStrategy');
        this.experimentalStrategiesFilter = sortedExpTypeList;
        break;
      case "acquisition_type":
        if (setValuesForFence) {
          this.selectedAcquisitions.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAcquisitions();
        } else {
          this.selectedAcquisitions = filterVal.split('|');
        }
        let sortedAcqTypeList = this.moveFilterToTop(this.acquisitionFilter, this.selectedAcquisitions, 'true', '-acqType');
        this.acquisitionFilter = sortedAcqTypeList;
        break;
      case "study_name":
        console.log("Study Name Selected: " + filterVal);
        if (setValuesForFence) {
          //this code is not needed now but might be useful in the future.
          //this.selectedStudyFilter = new Array(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsStudyID();
        } else {
          this.selectedStudyFilter = filterVal.split('|');
        }
        let sortedStudyList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, 'true', '-study');
        this.studyFilter = sortedStudyList;
        break;
      case "submitter_id_name":
        console.log("Study Name Selected: " + filterVal);
        if (setValuesForFence) {
          this.selectedStudyFilter.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsStudyID();
        } else {
          this.selectedStudyFilter = filterVal.split('|');
        }
        let sortedStudyNameList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, 'true', '-study');
        this.studyFilter = sortedStudyNameList;
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
          this.selectedSampleType = filterVal.split('|');
        }
        let sortedSampleTypeList = this.moveFilterToTop(this.sampleTypeFilter, this.selectedSampleType, 'true', '-sampType');
        this.sampleTypeFilter = sortedSampleTypeList;
        break;
      case "ethnicity":
        if (setValuesForFence) {
          this.selectedEthnicity.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsEthnicity();
        } else {
          this.selectedEthnicity = filterVal.split('|');
        }
        let sortedEthnicityList = this.moveFilterToTop(this.ethnicityFilter, this.selectedEthnicity, 'true', '-ethn');
        this.ethnicityFilter = sortedEthnicityList;
        break;
      case "race":
        if (setValuesForFence) {
          this.selectedRace.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsRace();
        } else {
          this.selectedRace = filterVal.split('|');
        }
        let sortedRaceList = this.moveFilterToTop(this.raceFilter, this.selectedRace, 'true', '-race');
        this.raceFilter = sortedRaceList;
        break;
      case "gender":
        if (setValuesForFence) {
          this.selectedGender.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsGender();
        } else {
          this.selectedGender = filterVal.split('|');
        }
        let sortedGenderList = this.moveFilterToTop(this.genderFilter, this.selectedGender, 'true', '-gender');
        this.genderFilter = sortedGenderList;
        break;
      case "tumor_grade":
        if (setValuesForFence) {
          this.selectedTumorGrade.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTumorGrade();
        } else {
          this.selectedTumorGrade = filterVal.split('|');
        }
        let sortedTumorGradeList = this.moveFilterToTop(this.tumorGradeFilter, this.selectedTumorGrade, 'true', '-tumorGrade');
        this.tumorGradeFilter = sortedTumorGradeList;
        break;
      case "data_category":
        if (setValuesForFence) {
          this.selectedDataCategory.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsDataCategory();
        } else {
          this.selectedDataCategory = filterVal.split('|');
        }
        let sortedDataCategoryList = this.moveFilterToTop(this.dataCategoryFilter, this.selectedDataCategory, 'true', '-dataCategory');
        this.dataCategoryFilter = sortedDataCategoryList;
        break;
      case "vital_status":
        if (setValuesForFence) {
          this.selectedVitalStatus.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsVitalStatus();
        } else {
          this.selectedVitalStatus = filterVal.split('|');
        }
        let sortedVitalStatusList = this.moveFilterToTop(this.vitalStatusFilter, this.selectedVitalStatus, 'true', '-vitalStatus');
        this.vitalStatusFilter = sortedVitalStatusList;
        break;
      case "age_at_diagnosis":
        if (setValuesForFence) {
          this.selectedAgeAtDiagnosis.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAgeAtDiagnosis();
        } else {
          this.selectedAgeAtDiagnosis = filterVal.split('|');
        }
        let sortedAgeAtDiagnosisList = this.moveFilterToTop(this.ageAtDiagnosisFilter, this.selectedAgeAtDiagnosis, 'true', '-ageAtDiag');
        this.ageAtDiagnosisFilter = sortedAgeAtDiagnosisList;
        break;
      case "ajcc_clinical_stage":
        if (setValuesForFence) {
          this.selectedAjccClinicalStage.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAjccClinicalStage();
        } else {
          this.selectedAjccClinicalStage = filterVal.split('|');
        }
        let sortedAjccClinicalStageList = this.moveFilterToTop(this.ajccClinicalStageFilter, this.selectedAjccClinicalStage, 'true', '-ajccClinicStage');
        this.ajccClinicalStageFilter = sortedAjccClinicalStageList;
        break;
      case "ajcc_pathologic_stage":
        if (setValuesForFence) {
          this.selectedAjccPathologicStage.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAjccPathologicStage();
        } else {
          this.selectedAjccPathologicStage = filterVal.split('|');
        }
        let sortedAjccPathologicStageList = this.moveFilterToTop(this.ajccPathologicStageFilter, this.selectedAjccPathologicStage, 'true', '-ajccPathoStage');
        this.ajccPathologicStageFilter = sortedAjccPathologicStageList;
        break;
      case "progression_or_recurrence":
        if (setValuesForFence) {
          this.selectedProgressionOrRecurrence.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsProgressionOrRecurrence();
        } else {
          this.selectedProgressionOrRecurrence = filterVal.split('|');
        }
        let sortedProgressionOrRecurrenceList = this.moveFilterToTop(this.progressionOrRecurrenceFilter, this.selectedProgressionOrRecurrence, 'true', '-progOrRecur');
        this.progressionOrRecurrenceFilter = sortedProgressionOrRecurrenceList;
        break;
      case "morphology":
        if (setValuesForFence) {
          this.selectedMorphology.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsMorphology();
        } else {
          this.selectedMorphology = filterVal.split('|');
        }
        let sortedMorphologyList = this.moveFilterToTop(this.morphologyFilter, this.selectedMorphology, 'true', '-morph');
        this.morphologyFilter = sortedMorphologyList;
        break;
      case "site_of_resection_or_biopsy":
        if (setValuesForFence) {
          this.selectedSiteResectionOrBiopsy.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsSiteResectionOrBiopsy();
        } else {
          this.selectedSiteResectionOrBiopsy = filterVal.split('|');
        }
        let sortedSiteResectionOrBiopsyList = this.moveFilterToTop(this.siteResectionOrBiopsyFilter, this.selectedSiteResectionOrBiopsy, 'true', '-siteResectBiop');
        this.siteResectionOrBiopsyFilter = sortedSiteResectionOrBiopsyList;
        break;
      case "therapeutic_agents":
        if (setValuesForFence) {
          this.selectedTherapeuticAgents.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTherapeuticAgents();
        } else {
          this.selectedTherapeuticAgents = filterVal.split('|');
        }
        let sortedTherapeuticAgentsList = this.moveFilterToTop(this.therapeuticAgentsFilter, this.selectedTherapeuticAgents, 'true', '-therapAgents');
        this.therapeuticAgentsFilter = sortedTherapeuticAgentsList;
        break;
      case "treatment_intent_type":
        if (setValuesForFence) {
          this.selectedTreatmentIntentType.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTreatmentIntentType();
        } else {
          this.selectedTreatmentIntentType = filterVal.split('|');
        }
        let sortedTreatmentIntentTypeList = this.moveFilterToTop(this.treatmentIntentTypeFilter, this.selectedTreatmentIntentType, 'true', '-treatIntType');
        this.treatmentIntentTypeFilter = sortedTreatmentIntentTypeList;
        break;
      case "treatment_outcome":
        if (setValuesForFence) {
          this.selectedTreatmentOutcome.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTreatmentOutcome();
        } else {
          this.selectedTreatmentOutcome = filterVal.split('|');
        }
        let sortedTreatmentOutcomeList = this.moveFilterToTop(this.treatmentOutcomeFilter, this.selectedTreatmentOutcome, 'true', '-treatOc');
        this.treatmentOutcomeFilter = sortedTreatmentOutcomeList;
        break;
      case "treatment_type":
        if (setValuesForFence) {
          this.selectedTreatmentType.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTreatmentType();
        } else {
          this.selectedTreatmentType = filterVal.split('|');
        }
        let sortedTreatmentTypeList = this.moveFilterToTop(this.treatmentTypeFilter, this.selectedTreatmentType, 'true', '-treatType');
        this.treatmentTypeFilter = sortedTreatmentTypeList;
        break;
      case "alcohol_history":
        if (setValuesForFence) {
          this.selectedAlcoholHistory.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAlcoholHistory();
        } else {
          this.selectedAlcoholHistory = filterVal.split('|');
        }
        let sortedAlcoholHistoryList = this.moveFilterToTop(this.alcoholHistoryFilter, this.selectedAlcoholHistory, 'true', '-alcoholHist');
        this.alcoholHistoryFilter = sortedAlcoholHistoryList;
        break;
      case "alcohol_intensity":
        if (setValuesForFence) {
          this.selectedAlcoholIntensity.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsAlcoholIntensity();
        } else {
          this.selectedAlcoholIntensity = filterVal.split('|');
        }
        let sortedAlcoholIntensityList = this.moveFilterToTop(this.alcoholIntensityFilter, this.selectedAlcoholIntensity, 'true', '-alcoholIntense');
        this.alcoholIntensityFilter = sortedAlcoholIntensityList;
        break;
      case "tobacco_smoking_status":
        if (setValuesForFence) {
          this.selectedTobaccoSmokingStatus.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsTobaccoSmokingStatus();
        } else {
          this.selectedTobaccoSmokingStatus = filterVal.split('|');
        }
        let sortedTobaccoSmokingStatusList = this.moveFilterToTop(this.tobaccoSmokingStatusFilter, this.selectedTobaccoSmokingStatus, 'true', '-smokingStatus');
        this.tobaccoSmokingStatusFilter = sortedTobaccoSmokingStatusList;
        console.log("Sorted Smoking Status List");
        console.log(this.selectedTobaccoSmokingStatus);
        break;
      case "cigarettes_per_day":
        if (setValuesForFence) {
          this.selectedCigarettesPerDay.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsCigarettesPerDay();
        } else {
          this.selectedCigarettesPerDay = filterVal.split('|');
        }
        let sortedCigarettesPerDayList = this.moveFilterToTop(this.cigarettesPerDayFilter, this.selectedCigarettesPerDay, 'true', '-cigarPerDay');
        this.cigarettesPerDayFilter = sortedCigarettesPerDayList;
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
      case "case_status":
        if (setValuesForFence) {
          this.selectedCaseStatus.push(filterVal);
        } else if (clearValuesforbreadcrumb) {
          this.clearSelectionsCaseStatus();
        } else {
          this.selectedCaseStatus = filterVal.split('|');
        }
        let sortedCaseStatusList = this.moveFilterToTop(this.caseStatusFilter, this.selectedCaseStatus, 'true', '-caseStatus');
        this.caseStatusFilter = sortedCaseStatusList;
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
   this.newFilterSelected = {"program_name" : "", "project_name": "", "study_name": "", "submitter_id_name": "", "disease_type": "", "primary_site": "", "analytical_fraction": "", "experiment_type": "", "ethnicity": "", "race": "", "gender": "", "tumor_grade": "", "sample_type": "", "acquisition_type": "", "data_category": "", "vital_status": "", "age_at_diagnosis": "", "ajcc_clinical_stage": "", "ajcc_pathologic_stage": "", "morphology": "", "site_of_resection_or_biopsy": "", "progression_or_recurrence": "", "therapeutic_agents": "", "treatment_intent_type": "", "treatment_outcome": "", "treatment_type": "", "alcohol_history": "", "alcohol_intensity": "", "tobacco_smoking_status": "", "cigarettes_per_day":"", "gene_name": "", "studyName_genes_tab": "", "geneNameStudyArray": "", "case_status": ""};
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
        //@@@PDC-4904: Study Filters in the sidebar do not bubble to the top when Browse URL has preselected filters
        if (this.selectedStudyFilter && this.selectedStudyFilter.length > 0) {
          let sortedStudyList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, 'true', '-study');
          this.studyFilter = sortedStudyList;
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
    //@@@PDC-4904: Study Filters in the sidebar do not bubble to the top when Browse URL has preselected filters
    if (this.selectedStudyFilter && this.selectedStudyFilter.length > 0) {
      let sortedStudyList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, 'true', '-study');
      this.studyFilter = sortedStudyList;
    }
  }

  private findSelectedFilterByName(filterName: string): string[] {
    let selectedFilter: string[];
	console.log("Filter Name: "+filterName);
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
      case "vital_status":
        selectedFilter = this.selectedVitalStatus;
        break;
      case "age_at_diagnosis":
        selectedFilter = this.selectedAgeAtDiagnosis;
        break;
      case 'ajcc_pathologic_stage':
        selectedFilter = this.selectedAjccPathologicStage;
        break;
      case 'ajcc_clinical_stage':
        selectedFilter = this.selectedAjccClinicalStage;
        break;
      case "morphology":
        selectedFilter = this.selectedMorphology;
        break;
      case "site_of_resection_or_biopsy":
        selectedFilter = this.selectedSiteResectionOrBiopsy;
        break;
      case "progression_or_recurrence":
        selectedFilter = this.selectedProgressionOrRecurrence;
        break;
      case "therapeutic_agents":
        selectedFilter = this.selectedTherapeuticAgents;
        break;
      case "treatment_intent_type":
        selectedFilter = this.selectedTreatmentIntentType;
        break;
      case "treatment_outcome":
        selectedFilter = this.selectedTreatmentOutcome;
        break;
      case "treatment_type":
        selectedFilter = this.selectedTreatmentType;
        break;
      case "alcohol_history":
        selectedFilter = this.selectedAlcoholHistory;
        break;
      case "alcohol_intensity":
        selectedFilter = this.selectedAlcoholIntensity;
        break;
      case "tobacco_smoking_status":
        selectedFilter = this.selectedTobaccoSmokingStatus;
        break;
      case "cigarettes_per_day":
        selectedFilter = this.selectedCigarettesPerDay;
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
      case "vital_status":
        filter = this.vitalStatusFilter;
        break;
      case "age_at_diagnosis":
        filter = this.ageAtDiagnosisFilter;
        break;
      case "ajcc_clinical_stage":
        filter =  this.ajccClinicalStageFilter;
        break;
      case "ajcc_pathologic_stage":
        filter =  this.ajccPathologicStageFilter;
        break;
      case "morphology":
        filter =  this.morphologyFilter;
        break;
      case "site_of_resection_or_biopsy":
        filter =  this.siteResectionOrBiopsyFilter;
        break;
      case "progression_or_recurrence":
        filter =  this.progressionOrRecurrenceFilter;
        break;
      case "therapeutic_agents":
        filter =  this.therapeuticAgentsFilter;
        break;
      case "treatment_intent_type":
        filter =  this.treatmentIntentTypeFilter;
        break;
      case "treatment_outcome":
        filter =  this.treatmentOutcomeFilter;
        break;
      case "treatment_type":
        filter =  this.treatmentTypeFilter;
        break;
      case "alcohol_history":
        filter =  this.alcoholHistoryFilter;
        break;
      case "alcohol_intensity":
        filter =  this.alcoholIntensityFilter;
        break;
      case "tobacco_smoking_status":
        filter =  this.tobaccoSmokingStatusFilter;
        break;
      case "cigarettes_per_day":
        filter =  this.cigarettesPerDayFilter;
        break;
      case "case_status":
        filter = this.caseStatusFilter;
        break;
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
      case "case_status":
        this.showCaseStatus = !this.showCaseStatus;
        break;
      case "data_category":
        this.showDataCategory = !this.showDataCategory;
        break;
      case "vital_status":
        this.showVitalStatus = !this.showVitalStatus;
        break;
      case "age_at_diagnosis":
        this.showAgeAtDiag = !this.showAgeAtDiag;
        break;
      case "ajcc_clinical_stage":
        this.showAjccClinicalStage = !this.showAjccClinicalStage;
        break;
      case "ajcc_pathologic_stage":
        this.showAjccPathoStage = !this.showAjccPathoStage;
        break;
      case "morphology":
        this.showMorph = !this.showMorph;
        break;
      case "site_of_resection_or_biopsy":
        this.showSiteResectBiop = !this.showSiteResectBiop;
        break;
      case "therapeutic_agents":
        this.showTherapAgents = !this.showTherapAgents;
        break;
      case "treatment_intent_type":
        this.showTreatIntType = !this.showTreatIntType;
        break;
      case "treatment_outcome":
        this.showTreatOc = !this.showTreatOc;
        break;
      case "treatment_type":
        this.showTreatType = !this.showTreatType;
        break;
      case "alcohol_history":
        this.showAlcoholHist = !this.showAlcoholHist;
        break;
      case "alcohol_intensity":
        this.showAlcoholIntense = !this.showAlcoholIntense;
        break;
      case "tobacco_smoking_status":
        this.showSmokingStatus = !this.showSmokingStatus;
        break;
      case "cigarettes_per_day":
        this.showCigarPerDay = !this.showCigarPerDay;
        break;
      case "study_name":
        this.showStudyName = !this.showStudyName;
        break;
    }
  }


  /* Project filter callback onChange */
  filterDataByProject(e) {
    let newFilterValue = "project_name:" + this.selectedProjects.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.projectsFilter, this.selectedProjects);
    this.projectsFilter = sortedList;
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

  //@@@PDC-4792: Increase font size in all tables to pass 508 compliance
  moveFilterToTop (filterData, selectedFilterData, checkboxClicked = '', filterSub = '', index = 0) {
    let filterDataCopy = filterData;
    let sortedList = [];
    for (let filter of selectedFilterData) {
      let filterFound = filterDataCopy.find(item => item.filterName === filter);
      if (filterFound != undefined) {
        sortedList.push(filterFound);
        filterDataCopy = filterDataCopy.filter(item=>item.filterName != filter );
      }
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
		  //console.log("Filter Raw: "+ filterValWithoutrandomNum);
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
        let sortedList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, 'true');
        this.studyFilter = sortedList;
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
  filterDataByProgram(e, filterSub = '', index = 0) {
    var newFilterValue = "program_name:" + this.selectedPrograms.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.programsFilter, this.selectedPrograms, e, filterSub, index);
    this.programsFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Disease type filter callback onChange */
  filterDataByDiseaseType(e, filterSub = '', index = 0) {
    var newFilterValue = "disease_type:" + this.selectedDiseases.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.diseaseTypesFilter, this.selectedDiseases, e, filterSub, index);
    this.diseaseTypesFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Analytical fraction filter callback onChange */
  filterDataByAnalyticalFraction(e, filterSub = '', index = 0) {
    var newFilterValue = "analytical_fraction:" + this.selectedAnFracs.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.analyticalFractionsFilter, this.selectedAnFracs, e, filterSub, index);
    this.analyticalFractionsFilter = sortedList;
    this.updateFiltersCounters();
  }
  /* Experimental strategy filter callback onChange */
  filterDataByExperimentalStrategy(e, filterSub = '', index = 0) {
    var newFilterValue = "experiment_type:" + this.selectedExpStarts.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.experimentalStrategiesFilter, this.selectedExpStarts, e, filterSub, index);
    this.experimentalStrategiesFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByAcquisition(e, filterSub = '', index = 0) {
    var newFilterValue = "acquisition_type:" + this.selectedAcquisitions.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.acquisitionFilter, this.selectedAcquisitions, e, filterSub, index);
    this.acquisitionFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByEthnicity(e, filterSub = '', index = 0) {
    var newFilterValue = "ethnicity:" + this.selectedEthnicity.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.ethnicityFilter, this.selectedEthnicity, e, filterSub, index);
    this.ethnicityFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByRace(e, filterSub = '', index = 0) {
    var newFilterValue = "race:" + this.selectedRace.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.raceFilter, this.selectedRace, e, filterSub, index);
    this.raceFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByGender(e, filterSub = '', index = 0) {
    var newFilterValue = "gender:" + this.selectedGender.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.genderFilter, this.selectedGender, e, filterSub, index);
    this.genderFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByTumorGrade(e, filterSub = '', index = 0) {
    var newFilterValue = "tumor_grade:" + this.selectedTumorGrade.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.tumorGradeFilter, this.selectedTumorGrade, e, filterSub, index);
    this.tumorGradeFilter = sortedList;
    this.updateFiltersCounters();
  }

  //PDC-567
  filterDataBySampleType(e, filterSub = '', index = 0) {
    var newFilterValue = "sample_type:" + this.selectedSampleType.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.sampleTypeFilter, this.selectedSampleType, e, filterSub, index);
    this.sampleTypeFilter = sortedList;
    this.updateFiltersCounters();
  }

  //PDC-1161: Can't select multiple studies if any other filter is applied
  filterDataByStudy(e, filterSub = '', index = 0) {
    var newFilterValue = "study_name:" + this.selectedStudyFilter.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.studyFilter, this.selectedStudyFilter, e, filterSub, index);
    this.studyFilter = sortedList;
    this.updateFiltersCounters([], "", [], true);
  }

  filterDataByDataCategory(e, filterSub = '', index = 0) {
	//In case where user clicked on metadata files counter on study table
	if (this.selectedDataCategory.length > 0 && this.selectedDataCategory[0].indexOf(";") > -1) {
		var temp = this.selectedDataCategory[0].split(';');
		this.selectedDataCategory = temp;
	}
    var newFilterValue = "data_category:" + this.selectedDataCategory.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.dataCategoryFilter, this.selectedDataCategory, e, filterSub, index);
    this.dataCategoryFilter = sortedList;
    this.updateFiltersCounters();
  }

  /*filterDataByFileType(e, filterSub = '', index = 0) {
    var newFilterValue = "file_type:" + this.selectedFileType.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.fileTypeFilter, this.selectedFileType, e, filterSub, index);
    this.fileTypeFilter = sortedList;
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
  }*/
  //@@@PDC-1095
  //// If File type filter is selected only defined in mapping data category filters should be available for selection
  dataCetegoryFilterDisabled(filterName: string):boolean {
	  let result = false;
	  /*let isSelected = false;
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
	  }*/
	  return result;
  }

  /*filterDataByAccess(e, filterSub = '', index = 0) {
    var newFilterValue = "access:" + this.selectedAccess.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.accessFilter, this.selectedAccess, e, filterSub, index);
    this.accessFilter = sortedList;
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
  }*/

	filterDataByGeneName(){
		//emit new gene name to selectedFilters
		this.loading = true;
		//Have to replace spaces with semicolon since that is the expected list delimiter for the API
		//@@@PDC-6288 gene name is case sensitive
		//let processedGeneNames = this.selectedGeneNames.trim().toUpperCase().replace(/\s+|\n+/g, ';');
		let processedGeneNames = this.selectedGeneNames.trim().replace(/\s+|\n+/g, ';');
		console.log(processedGeneNames);
		//Genes data tab will be filtered directly by gene names
		var newFilterValue = "gene_name:" + processedGeneNames;
		this.selectedFilters.emit(newFilterValue);
		//PDC-1001 added a timeout to send the list of studies associated with the search gene(s)
		// to allow time to process the gene name filter.
		//@@@PDC-9697 request brevity

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

  filterDataByAjccPathologicStage(e, filterSub = '', index = 0) {
    var newFilterValue = "ajcc_pathologic_stage:" + this.selectedAjccPathologicStage.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.ajccPathologicStageFilter, this.selectedAjccPathologicStage, e, filterSub, index);
    this.ajccPathologicStageFilter = sortedList;
    this.updateFiltersCounters();
  }

  filterDataByVitalStatus(e, filterSub = '', index = 0) {
    var newFilterValue = "vital_status:" + this.selectedVitalStatus.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.vitalStatusFilter, this.selectedVitalStatus, e, filterSub, index);
    this.vitalStatusFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByAgeAtDiagnosis(e, filterSub = '', index = 0) {
    var newFilterValue = "age_at_diagnosis:" + this.selectedAgeAtDiagnosis.join(";");
	console.log("New Filter Age: "+newFilterValue)
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.ageAtDiagnosisFilter, this.selectedAgeAtDiagnosis, e, filterSub, index);
    this.ageAtDiagnosisFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByAjccClinicalStage(e, filterSub = '', index = 0) {
    var newFilterValue = "ajcc_clinical_stage:" + this.selectedAjccClinicalStage.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.ajccClinicalStageFilter, this.selectedAjccClinicalStage, e, filterSub, index);
    this.ajccClinicalStageFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByProgressionOrRecurrence(e, filterSub = '', index = 0) {
    var newFilterValue = "progression_or_recurrence:" + this.selectedProgressionOrRecurrence.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.progressionOrRecurrenceFilter, this.selectedProgressionOrRecurrence, e, filterSub, index);
    this.progressionOrRecurrenceFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByMorphology(e, filterSub = '', index = 0) {
    var newFilterValue = "morphology:" + this.selectedMorphology.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.morphologyFilter, this.selectedMorphology, e, filterSub, index);
    this.morphologyFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataBySiteResectionOrBiopsy(e, filterSub = '', index = 0) {
    var newFilterValue = "site_of_resection_or_biopsy:" + this.selectedSiteResectionOrBiopsy.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.siteResectionOrBiopsyFilter, this.selectedSiteResectionOrBiopsy, e, filterSub, index);
    this.siteResectionOrBiopsyFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByTherapeuticAgents(e, filterSub = '', index = 0) {
    var newFilterValue = "therapeutic_agents:" + this.selectedTherapeuticAgents.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.therapeuticAgentsFilter, this.selectedTherapeuticAgents, e, filterSub, index);
    this.therapeuticAgentsFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByTreatmentIntentType(e, filterSub = '', index = 0) {
    var newFilterValue = "treatment_intent_type:" + this.selectedTreatmentIntentType.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.treatmentIntentTypeFilter, this.selectedTreatmentIntentType, e, filterSub, index);
    this.treatmentIntentTypeFilter = sortedList;
  }
  filterDataByTreatmentOutcome(e, filterSub = '', index = 0) {
    var newFilterValue = "treatment_outcome:" + this.selectedTreatmentOutcome.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.treatmentOutcomeFilter, this.selectedTreatmentOutcome, e, filterSub, index);
    this.treatmentOutcomeFilter = sortedList;
  }
  filterDataByTreatmentType(e, filterSub = '', index = 0) {
    var newFilterValue = "treatment_type:" + this.selectedTreatmentType.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.treatmentTypeFilter, this.selectedTreatmentType, e, filterSub, index);
    this.treatmentTypeFilter = sortedList;
  }
  filterDataByAlcoholHistory(e, filterSub = '', index = 0) {
    var newFilterValue = "alcohol_history:" + this.selectedAlcoholHistory.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.alcoholHistoryFilter, this.selectedAlcoholHistory, e, filterSub, index);
    this.alcoholHistoryFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByAlcoholIntensity(e, filterSub = '', index = 0) {
    var newFilterValue = "alcohol_intensity:" + this.selectedAlcoholIntensity.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.alcoholIntensityFilter, this.selectedAlcoholIntensity, e, filterSub, index);
    this.alcoholIntensityFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByTobaccoSmokingStatus(e, filterSub = '', index = 0) {
    var newFilterValue = "tobacco_smoking_status:" + this.selectedTobaccoSmokingStatus.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.tobaccoSmokingStatusFilter, this.selectedTobaccoSmokingStatus, e, filterSub, index);
    this.tobaccoSmokingStatusFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByCigarettesPerDay(e, filterSub = '', index = 0) {
    var newFilterValue = "cigarettes_per_day:" + this.selectedCigarettesPerDay.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.cigarettesPerDayFilter, this.selectedCigarettesPerDay, e, filterSub, index);
    this.cigarettesPerDayFilter = sortedList;
    this.updateFiltersCounters();
  }
  filterDataByCaseStatus(e, filterSub = '', index = 0) {
    var newFilterValue = "case_status:" + this.selectedCaseStatus.join(";");
    this.selectedFilters.emit(newFilterValue);
    let sortedList = this.moveFilterToTop(this.caseStatusFilter, this.selectedCaseStatus, e, filterSub, index);
    this.caseStatusFilter = sortedList;
    this.updateFiltersCounters();
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

  clearSelectionsDataCategory() {
    this.selectedDataCategory = [];
    this.dataCategoryFilter.sort(this.compare);
    this.filterDataByDataCategory(false);
  }

  clearSelectionsVitalStatus() {
    this.selectedVitalStatus = [];
    this.vitalStatusFilter.sort(this.compare);
    this.filterDataByVitalStatus(false);
  }

  clearSelectionsAgeAtDiagnosis() {
    this.selectedAgeAtDiagnosis = [];
    this.ageAtDiagnosisFilter.sort(this.compare);
    this.filterDataByAgeAtDiagnosis(false);
  }

  clearSelectionsAjccClinicalStage() {
    this.selectedAjccClinicalStage = [];
    this.ajccClinicalStageFilter.sort(this.compare);
    this.filterDataByAjccClinicalStage(false);
  }

  clearSelectionsAjccPathologicStage() {
    this.selectedAjccPathologicStage = [];
    this.ajccPathologicStageFilter.sort(this.compare);
    this.filterDataByAjccPathologicStage(false);
  }

  clearSelectionsProgressionOrRecurrence() {
    this.selectedProgressionOrRecurrence = [];
    this.progressionOrRecurrenceFilter.sort(this.compare);
    this.filterDataByProgressionOrRecurrence(false);
  }
  clearSelectionsMorphology() {
    this.selectedMorphology = [];
    this.morphologyFilter.sort(this.compare);
    this.filterDataByMorphology(false);
  }
  clearSelectionsSiteResectionOrBiopsy() {
    this.selectedSiteResectionOrBiopsy = [];
    this.siteResectionOrBiopsyFilter.sort(this.compare);
    this.filterDataBySiteResectionOrBiopsy(false);
  }
  clearSelectionsTherapeuticAgents() {
    this.selectedTherapeuticAgents = [];
    this.therapeuticAgentsFilter.sort(this.compare);
    this.filterDataByTherapeuticAgents(false);
  }
  clearSelectionsTreatmentIntentType() {
    this.selectedTreatmentIntentType = [];
    this.treatmentIntentTypeFilter.sort(this.compare);
    this.filterDataByTreatmentIntentType(false);
  }
  clearSelectionsTreatmentOutcome() {
    this.selectedTreatmentOutcome = [];
    this.treatmentOutcomeFilter.sort(this.compare);
    this.filterDataByTreatmentOutcome(false);
  }
  clearSelectionsTreatmentType() {
    this.selectedTreatmentType = [];
    this.treatmentTypeFilter.sort(this.compare);
    this.filterDataByTreatmentType(false);
  }
  clearSelectionsAlcoholHistory() {
    this.selectedAlcoholHistory = [];
    this.alcoholHistoryFilter.sort(this.compare);
    this.filterDataByAlcoholHistory(false);
  }
  clearSelectionsAlcoholIntensity() {
    this.selectedAlcoholIntensity = [];
    this.alcoholIntensityFilter.sort(this.compare);
    this.filterDataByAlcoholIntensity(false);
  }
  clearSelectionsTobaccoSmokingStatus() {
    this.selectedTobaccoSmokingStatus = [];
    this.tobaccoSmokingStatusFilter.sort(this.compare);
    this.filterDataByTobaccoSmokingStatus(false);
  }

  // @@@PDC-10327 - Map tobacco smoking status codes to display values
  getTobaccoSmokingStatusDisplay(filterName: string): string {
    console.log("Filter Name: " + filterName);
    const statusMap: { [key: string]: string } = {
      '1': 'Life Long Non-Smoker',
      '2': 'Current Smoker',
      '3': 'Current Reformed Smoker for > 15 yrs',
      '4': 'Current Reformed Smoker for < or = 15 yrs',
      '5': 'Current Reformed Smoker, Duration Not Specified',
      '6': 'Smoker at Diagnosis',
      '7': 'Smoking history not documented'
    };
    console.log("Mapped Value: " + (statusMap[filterName] || filterName));
    
    return statusMap[filterName] || filterName; 
  }

  clearSelectionsCigarettesPerDay() {
    this.selectedCigarettesPerDay = [];
    this.cigarettesPerDayFilter.sort(this.compare);
    this.filterDataByCigarettesPerDay(false);
  }
  clearSelectionsCaseStatus() {
    this.selectedCaseStatus = [];
    this.caseStatusFilter.sort(this.compare);
    this.filterDataByCaseStatus(false);
  }

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
    this.vitalStatusFilter.sort(this.compare);
    this.ageAtDiagnosisFilter.sort(this.compare);
    this.ajccClinicalStageFilter.sort(this.compare);
    this.ajccPathologicStageFilter.sort(this.compare);
    this.progressionOrRecurrenceFilter.sort(this.compare);
    this.morphologyFilter.sort(this.compare);
    this.therapeuticAgentsFilter.sort(this.compare);
    this.treatmentIntentTypeFilter.sort(this.compare);
    this.treatmentOutcomeFilter.sort(this.compare);
    this.treatmentTypeFilter.sort(this.compare);
    this.alcoholHistoryFilter.sort(this.compare);
    this.alcoholIntensityFilter.sort(this.compare);
    this.tobaccoSmokingStatusFilter.sort(this.compare);
    this.cigarettesPerDayFilter.sort(this.compare);
    this.caseStatusFilter.sort(this.compare);
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
    this.selectedGeneNames = "";
    this.selectedGeneStudyList = [];
    this.selectedGeneStudyNamesList = [];
    this.studyNameForGenesTab = [];
    this.allStudyIDsForGenes = [];
	this.selectedVitalStatus = [];
	this.selectedAgeAtDiagnosis = [];
	this.selectedAjccClinicalStage = [];
    this.selectedAjccPathologicStage = [];
	this.selectedProgressionOrRecurrence = [];
	this.selectedMorphology = [];
	this.selectedSiteResectionOrBiopsy = [];
	this.selectedTherapeuticAgents = [];
	this.selectedTreatmentIntentType = [];
	this.selectedTreatmentOutcome = [];
	this.selectedTreatmentType = [];
	this.selectedAlcoholHistory = [];
	this.selectedAlcoholIntensity = [];
	this.selectedTobaccoSmokingStatus = [];
	this.selectedCigarettesPerDay = [];
    this.selectedCaseStatus = [];
    this.sortAllFilterLists();
    sessionStorage.removeItem('tableLoading');
    sessionStorage.removeItem('tableUnloading');
    this.updateFiltersCounters();
  }

  //Clear all filter selections in Clinical filters tab
  clearAllClinicalSelections() {
    var newFilterValue = "Clear all clinical filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedSampleType = [];
    this.selectedEthnicity = [];
    this.selectedRace = [];
    this.selectedGender = [];
    this.selectedPrimarySites = [];
    this.selectedDiseases = [];
    this.selectedTumorGrade = [];
	this.selectedVitalStatus = [];
	this.selectedAgeAtDiagnosis = [];
	this.selectedAjccClinicalStage = [];
    this.selectedAjccPathologicStage = [];
	this.selectedProgressionOrRecurrence = [];
	this.selectedMorphology = [];
	this.selectedSiteResectionOrBiopsy = [];
    this.selectedCaseStatus = [];
    this.primarySitesFilter.sort(this.compare);
    this.diseaseTypesFilter.sort(this.compare);
    this.ethnicityFilter.sort(this.compare);
    this.raceFilter.sort(this.compare);
    this.genderFilter.sort(this.compare);
    this.tumorGradeFilter.sort(this.compare);
    this.vitalStatusFilter.sort(this.compare);
    this.ageAtDiagnosisFilter.sort(this.compare);
    this.ajccClinicalStageFilter.sort(this.compare);
    this.ajccPathologicStageFilter.sort(this.compare);
    this.progressionOrRecurrenceFilter.sort(this.compare);
    this.morphologyFilter.sort(this.compare);
    this.therapeuticAgentsFilter.sort(this.compare);
    this.treatmentIntentTypeFilter.sort(this.compare);
    this.treatmentOutcomeFilter.sort(this.compare);
    this.treatmentTypeFilter.sort(this.compare);
    this.alcoholHistoryFilter.sort(this.compare);
    this.alcoholIntensityFilter.sort(this.compare);
    this.tobaccoSmokingStatusFilter.sort(this.compare);
    this.cigarettesPerDayFilter.sort(this.compare);
    this.caseStatusFilter.sort(this.compare);
    this.updateFiltersCounters();
  }
  //Clear all filters in General filters tab
  clearAllGeneralSelections() {
    var newFilterValue = "Clear all general filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    //clear all filters selections
    this.selectedProjects = [];
    this.selectedPrograms = [];
	this.selectedStudyFilter = [];
    this.selectedAnFracs = [];
    this.selectedExpStarts = [];
    this.selectedAcquisitions = [];
    this.selectedDataCategory = [];
    this.projectsFilter.sort(this.compare);
    this.programsFilter.sort(this.compare);
    this.analyticalFractionsFilter.sort(this.compare);
    this.experimentalStrategiesFilter.sort(this.compare);
    this.acquisitionFilter.sort(this.compare);
    this.dataCategoryFilter.sort(this.compare);
	this.studyFilter.sort(this.compare);
    this.updateFiltersCounters();
  }

  /*clearAllBiospecimenSelections() {
    var newFilterValue = "Clear all biospecimen filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedSampleType = [];
    this.selectedStudyFilter = [];
    this.selectedAjccPathologicStage = [];
    this.sampleTypeFilter.sort(this.compare);
    this.studyFilter.sort(this.compare);
    this.ajccPathologicStageFilter.sort(this.compare);
    this.ethnicityFilter.sort(this.compare);
    this.raceFilter.sort(this.compare);
    this.genderFilter.sort(this.compare);
    this.tumorGradeFilter.sort(this.compare);
    this.caseStatusFilter.sort(this.compare);
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
    this.studyFilter.sort(this.compare);
    this.dataCategoryFilter.sort(this.compare);
    this.fileTypeFilter.sort(this.compare);
    this.accessFilter.sort(this.compare);

    this.updateFiltersCounters();
  }*/

   clearAllGenesSelections() {
  	var newFilterValue = "Clear all genes filters selections:"; //set new filter value
    this.selectedFilters.emit(newFilterValue);
    this.selectedGeneNames = "";
    this.selectedGeneStudyList = [];
    this.selectedGeneStudyNamesList = [];
    this.studyNameForGenesTab = [];
    this.allStudyIDsForGenes = [];
    this.updateFiltersCounters();
    this.invalidGenesEnteredByUser = [];
    this.validGenesNotUsedInPDCStudies = [];
  }

  //Search for a gene name to validate that such gene exists in our system
  searchGeneNames(search_term:string) {
	this.loadingGeneSymbolValidation = true;
  this.validGenesNotUsedInPDCStudies = [];
	this.browseFiltersService.getGeneSearchResults(search_term).subscribe((data: any) => {
    //@@@PDC-7786: UI change to report error for genes not used in studies
    this.browseFiltersService.getGeneStudyCountResults(search_term).subscribe((geneData: any) => {
      let geneStudyCount = geneData.geneStudyCount;
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
        //@@@PDC-7447: Add a message to inform users when a Gene symbol cannot be searched
        this.selectedGeneNames = this.selectedGeneNames.replace(/\n/g, " ");
        var geneNamesArray = this.selectedGeneNames.trim().split(" ");
        this.allGeneNamesValid = this.allGeneNamesValid && false;
        if (!this.invalidGenesEnteredByUser.includes(search_term) && geneNamesArray.includes(search_term)) {
          this.invalidGenesEnteredByUser.push(search_term);
        }
      }
      if (geneStudyCount == 0) {
        if (!this.validGenesNotUsedInPDCStudies.includes(search_term) && !this.invalidGenesEnteredByUser.includes(search_term)) {
          //this.allGeneNamesValid = this.allGeneNamesValid && false;
          this.validGenesNotUsedInPDCStudies.push(search_term);
        }
      }
      //Change loading to false only after finished checking all genes in the list
      if ( this.validatingGeneNamesCounter == this.valudatedGeneNamesList.length) {
        this.loadingGeneSymbolValidation = false;
      }
      else {
        this.validatingGeneNamesCounter++;
      }
    });
	});
  }

  //@@@PDC-7447: Add a message to inform users when a Gene symbol cannot be searched
  deleteInvalidGeneBreadcrumb(invalidGene) {
    if (invalidGene.length > 0) {
      let isPresent = this.containsInvalidGene(invalidGene);
      if (isPresent != -1) {
        this.invalidGenesEnteredByUser.splice(isPresent, 1);
        this.selectedGeneNames = this.selectedGeneNames.replace(/\n/g, " ");
        var geneNamesArray = this.selectedGeneNames.split(" ");
        for (var i=0; i < geneNamesArray.length; i++) {
          if (geneNamesArray[i] == invalidGene) {
            delete geneNamesArray[i];
          }
        }
        this.selectedGeneNames = "";
        this.selectedGeneNames = geneNamesArray.join(' ');
        this.selectedGeneNames = this.selectedGeneNames.trim();
        if (this.selectedGeneNames.length > 0) {
          this._validate(this.selectedGeneNames);
        } else {
          this.loadingGeneSymbolValidation = false;
        }
      }
    }
  }

  //@@@PDC-7786: UI change to report error for genes not used in studies
  deleteGeneNotEnteredInStudyBreadcrumb(invalidGene) {
    if (invalidGene.length > 0) {
      let isPresent = this.containsGeneEnteredInStudy(invalidGene);
      if (isPresent != -1) {
        this.validGenesNotUsedInPDCStudies.splice(isPresent, 1);
        this.selectedGeneNames = this.selectedGeneNames.replace(/\n/g, " ");
        var geneNamesArray = this.selectedGeneNames.split(" ");
        for (var i=0; i < geneNamesArray.length; i++) {
          if (geneNamesArray[i] == invalidGene) {
            delete geneNamesArray[i];
          }
        }
        this.selectedGeneNames = "";
        this.selectedGeneNames = geneNamesArray.join(' ');
        this.selectedGeneNames = this.selectedGeneNames.trim();
        if (this.selectedGeneNames.length > 0) {
          this._validate(this.selectedGeneNames);
        } else {
          this.loadingGeneSymbolValidation = false;
        }
      }
    }
  }

  //@@@PDC-7447: Add a message to inform users when a Gene symbol cannot be searched
  containsInvalidGene(invalidGene) {
		var isPresent = -1;
		for (var i=0; i <this.invalidGenesEnteredByUser.length; i++) {
			if (this.invalidGenesEnteredByUser[i] == invalidGene) {
				isPresent = i;
				break;
			}
		}
		return isPresent;
	}

  //@@@PDC-7786: UI change to report error for genes not used in studies
  containsGeneEnteredInStudy(invalidGene) {
		var isPresent = -1;
		for (var i=0; i <this.validGenesNotUsedInPDCStudies.length; i++) {
			if (this.validGenesNotUsedInPDCStudies[i] == invalidGene) {
				isPresent = i;
				break;
			}
		}
		return isPresent;
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
    //@@@PDC-7447: Add a message to inform users when a Gene symbol cannot be searched
    this.clearInvalidGeneBreadcrumbs();
    this.clearGenesNotUsedInStudyBreadcrumbs();
  }

  //@@@PDC-7447: Add a message to inform users when a Gene symbol cannot be searched
  clearInvalidGeneBreadcrumbs() {
    if (this.selectedGeneNames.length == 0) {
      this.invalidGenesEnteredByUser = [];
    } else {
      this.selectedGeneNames = this.selectedGeneNames.replace(/\n/g, " ");
      var geneNamesArray = this.selectedGeneNames.trim().split(" ");
      for (var i=0; i < this.invalidGenesEnteredByUser.length; i++) {
        if (!geneNamesArray.includes(this.invalidGenesEnteredByUser[i])) {
          const elem = document.querySelectorAll(`.invalidGenes-${this.invalidGenesEnteredByUser[i]}`);
          elem.forEach(e => e.remove());
          this.invalidGenesEnteredByUser.splice(i, 1);
          i--;
        }
      }
    }
  }

  //@@@PDC-7786: UI change to report error for genes not used in studies
  clearGenesNotUsedInStudyBreadcrumbs() {
    if (this.selectedGeneNames.length == 0) {
      this.validGenesNotUsedInPDCStudies = [];
    } else {
      this.selectedGeneNames = this.selectedGeneNames.replace(/\n/g, " ");
      var geneNamesArray = this.selectedGeneNames.trim().split(" ");
      for (var i=0; i < this.validGenesNotUsedInPDCStudies.length; i++) {
        if (!geneNamesArray.includes(this.validGenesNotUsedInPDCStudies[i])) {
          const elem = document.querySelectorAll(`.invalidGenes-${this.validGenesNotUsedInPDCStudies[i]}`);
          elem.forEach(e => e.remove());
          this.validGenesNotUsedInPDCStudies.splice(i, 1);
          i--;
        }
      }
    }
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
      /*if (
        res.hasOwnProperty("studyNameForFileType") &&
        res.hasOwnProperty("fileDetailsforFileType") &&
        res.hasOwnProperty("fileDetailsforDataCategory")
      )
	  {
        if (res.studyNameForFileType) {
          this.selectedStudyFilter = new Array(res.studyNameForFileType);
        }
        this.filterDataByStudy(event);
        if (res.fileDetailsforFileType != "") {
          setTimeout(() => {
            this.selectedFileType = new Array(res.fileDetailsforFileType);
            this.filterDataByFileType(event);
          }, 1000);
        } else if (this.selectedFileType.length > 0 && res.fileDetailsforFileType == "") {
          //@@@PDC-4805: PSM, Metadata, Protein Assembly, and Quality Metrics files number Issue
          this.clearSelectionsFileType();
        }
        if (res.fileDetailsforDataCategory) {
          setTimeout(() => {
            //@@@PDC-1252: Add data category as a filter for the "file counts" section of the Study table
            this.selectedDataCategory = new Array(res.fileDetailsforDataCategory);
        console.log(this.selectedDataCategory);
            this.filterDataByDataCategory(event);
          }, 2000);
        }
      }*/
    });
  }

  ngOnDestroy() {
    this.parentCharts.unsubscribe();
  }
}
