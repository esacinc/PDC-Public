import { GenePageService } from './../gene-page.service';
import { GeneFiltersService } from './gene-filters.service';
import { GeneFiltersComponent } from './gene-filters.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowseFiltersComponent } from './../../browse/filters/browse-filters.component';
import { BrowseFiltersService } from './../../browse/filters/browse-filters.service';
import { BrowseService } from './../../browse/browse.service';
import { Apollo } from "apollo-angular";
import { Observable, of, Subject } from "rxjs";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

class MockGeneFiltersService {
  getAllData(): Observable<any> {
    return of({
      uiStudy: []
    });
  }

  getAllFiltersData(): Observable<any> {
    return of({
      uiFilters: []
    });
  }
}

class MockGenePageService {
  notifyObservable$ = new Subject();
}

describe("GeneFiltersComponent", () => {
  let component: GeneFiltersComponent;
  let fixture: ComponentFixture<GeneFiltersComponent>;
  let service: GeneFiltersComponent;
  let browseSerivce: BrowseService;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GeneFiltersComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Apollo, useValue: {} }, BrowseFiltersService]
    });

    TestBed.overrideComponent(GeneFiltersComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          { provide: GeneFiltersService, useClass: MockGeneFiltersService },
          { provide: GenePageService, useClass: MockGenePageService }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(GeneFiltersComponent);
      component = fixture.componentInstance;
      component.parentCharts = new Subject();
      fixture.detectChanges();
    });
  }));

  it("should create", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.allStudyArray.length).toBe(0);
    });
  });

  // it("test populate filters", () => {
  //   let allCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "doc",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     },
  //     {
  //       study_submitter_id: "S039-1",
  //       submitter_id_name: "Prospective_Breast_BI_Proteome",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC2 Confirmatory",
  //       disease_type: "Breast Invasive Carcinoma",
  //       primary_site: "Breast",
  //       analytical_fraction: "Proteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "not hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "not reported",
  //       primary_diagnosis:
  //         "Mixed Histology (specify)Infiltrating Ductal and Mucinous Carcinoma",
  //       site_of_resection_or_biopsy: "not reported",
  //       tissue_or_organ_of_origin: "Breast",
  //       tumor_grade: "not reported",
  //       tumor_stage: "Stage IIA",
  //       data_category: "doc",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   let projectsFilter = [
  //     {
  //       filter_name: "CPTAC-Confirmatory",
  //       submitter_id_name: "cae72433",
  //       counter: 1
  //     }
  //   ];

  //   let primarySitesFilter = [
  //     {
  //       filter_name: "Colon",
  //       submitter_id_name: "cae72483",
  //       counter: 1
  //     }
  //   ];

  //   let diseaseTypesFilter = [
  //     {
  //       filter_name: "Colon Adenocarcinoma",
  //       submitter_id_name: "cae739583",
  //       counter: 1
  //     }
  //   ];

  //   let analyticalFractionsFilter = [
  //     {
  //       filter_name: "Glycoproteome",
  //       submitter_id_name: "cae793843",
  //       counter: 1
  //     }
  //   ];

  //   let experimentalStrategiesFilter = [
  //     {
  //       filter_name: "iTRAQ4",
  //       submitter_id_name: "cae7932245563",
  //       counter: 1
  //     }
  //   ];

  //   component.allCasesData = allCasesData;
  //   component.projectsFilter = projectsFilter;
  //   component.primarySitesFilter = primarySitesFilter;
  //   component.diseaseTypesFilter = diseaseTypesFilter;
  //   component.analyticalFractionsFilter = analyticalFractionsFilter;
  //   component.experimentalStrategiesFilter = experimentalStrategiesFilter;

  //   component.populateFilters();

  //   expect(component.projectsFilter.length).toBe(3);
  //   if (component.projectsFilter[0].filter_name === "CPTAC-Confirmatory") {
  //     expect(component.projectsFilter[0].counter).toBe(1);
  //   } else {
  //     expect(component.projectsFilter[0].counter).toBe(2);
  //   }
  //   if (component.projectsFilter[1].filter_name === "CPTAC-Confirmatory") {
  //     expect(component.projectsFilter[1].counter).toBe(1);
  //   } else {
  //     expect(component.projectsFilter[1].counter).toBe(2);
  //   }

  //   expect(component.primarySitesFilter.length).toBe(3);
  //   if (component.primarySitesFilter[0].filter_name === "Colon") {
  //     expect(component.primarySitesFilter[0].counter).toBe(2);
  //   } else {
  //     expect(component.primarySitesFilter[0].counter).toBe(2);
  //   }
  //   if (component.primarySitesFilter[1].filter_name === "Colon") {
  //     expect(component.primarySitesFilter[1].counter).toBe(2);
  //   } else {
  //     expect(component.primarySitesFilter[1].counter).toBe(2);
  //   }

  //   expect(component.diseaseTypesFilter.length).toBe(3);
  //   if (component.diseaseTypesFilter[0].filter_name === "Colon Adenocarcinoma") {
  //     expect(component.diseaseTypesFilter[0].counter).toBe(2);
  //   } else {
  //     expect(component.diseaseTypesFilter[0].counter).toBe(2);
  //   }
  //   if (component.diseaseTypesFilter[1].filter_name === "Colon Adenocarcinoma") {
  //     expect(component.diseaseTypesFilter[1].counter).toBe(2);
  //   } else {
  //     expect(component.diseaseTypesFilter[1].counter).toBe(2);
  //   }

  //   expect(component.analyticalFractionsFilter.length).toBe(3);
  //   if (component.analyticalFractionsFilter[0].filter_name === "Glycoproteome") {
  //     expect(component.analyticalFractionsFilter[0].counter).toBe(2);
  //   } else {
  //     expect(component.analyticalFractionsFilter[0].counter).toBe(1);
  //   }
  //   if (component.analyticalFractionsFilter[1].filter_name === "Glycoproteome") {
  //     expect(component.analyticalFractionsFilter[1].counter).toBe(2);
  //   } else {
  //     expect(component.analyticalFractionsFilter[1].counter).toBe(1);
  //   }

  //   expect(component.experimentalStrategiesFilter.length).toBe(3);
  //   if (component.experimentalStrategiesFilter[0].filter_name === "iTRAQ4") {
  //     expect(component.experimentalStrategiesFilter[0].counter).toBe(2);
  //   } else {
  //     expect(component.experimentalStrategiesFilter[0].counter).toBe(2);
  //   }
  //   if (component.experimentalStrategiesFilter[1].filter_name === "iTRAQ4") {
  //     expect(component.experimentalStrategiesFilter[1].counter).toBe(2);
  //   } else {
  //     expect(component.experimentalStrategiesFilter[1].counter).toBe(2);
  //   }
  // });

  // it("test updateFiltersCounters with filter flag true", () => {
  //   let projectsFilter = [
  //     {
  //       filter_name: "CPTAC-Confirmatory",
  //       submitter_id_name: "cae72433",
  //       counter: 1
  //     }
  //   ];

  //   let primarySitesFilter = [
  //     {
  //       filter_name: "Colon",
  //       submitter_id_name: "cae72483",
  //       counter: 1
  //     }
  //   ];

  //   let programsFilter = [
  //     {
  //       filter_name: "PMID",
  //       submitter_id_name: "cae7239483",
  //       counter: 1
  //     }
  //   ];

  //   let diseaseTypesFilter = [
  //     {
  //       filter_name: "Colon Adenocarcinoma",
  //       submitter_id_name: "cae739583",
  //       counter: 1
  //     }
  //   ];

  //   let analyticalFractionsFilter = [
  //     {
  //       filter_name: "Glycoproteome",
  //       submitter_id_name: "cae793843",
  //       counter: 1
  //     }
  //   ];

  //   let experimentalStrategiesFilter = [
  //     {
  //       filter_name: "iTRAQ4",
  //       submitter_id_name: "cae7932245563",
  //       counter: 1
  //     }
  //   ];

  //   component.projectsFilter = projectsFilter;
  //   component.primarySitesFilter = primarySitesFilter;
  //   component.programsFilter = programsFilter;
  //   component.diseaseTypesFilter = diseaseTypesFilter;
  //   component.analyticalFractionsFilter = analyticalFractionsFilter;
  //   component.experimentalStrategiesFilter = experimentalStrategiesFilter;

  //   component.projectsFlag = true;
  //   component.primarySitesFlag = true;
  //   component.programsFlag = true;
  //   component.diseasesFlag = true;
  //   component.analytFracFlag = true;
  //   component.experimentsFlag = true;
  //   component.primarySitesFlag = true;

  //   component.updateFiltersCounters();

  //   expect(component.projectsFilter[0].counter).toBe(0);
  //   expect(component.primarySitesFilter[0].counter).toBe(0);
  //   expect(component.programsFilter[0].counter).toBe(0);
  //   expect(component.diseaseTypesFilter[0].counter).toBe(0);
  //   expect(component.analyticalFractionsFilter[0].counter).toBe(0);
  //   expect(component.experimentalStrategiesFilter[0].counter).toBe(0);

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filteredCasesData = filteredCasesData;
  //   component.updateFiltersCounters();

  //   expect(component.projectsFilter[0].counter).toBe(1);
  //   expect(component.primarySitesFilter[0].counter).toBe(1);
  //   expect(component.programsFilter[0].counter).toBe(1);
  //   expect(component.diseaseTypesFilter[0].counter).toBe(1);
  //   expect(component.analyticalFractionsFilter[0].counter).toBe(1);
  //   expect(component.experimentalStrategiesFilter[0].counter).toBe(1);

  //   component.unselectedFlag = true;
  //   component.selectedProjects.push("");

  //   component.projectsFlag = false;
  //   component.primarySitesFlag = false;
  //   component.programsFlag = false;
  //   component.diseasesFlag = false;
  //   component.analytFracFlag = false;
  //   component.experimentsFlag = false;
  //   component.primarySitesFlag = false;

  //   component.filteredCasesForUnselected = filteredCasesData;

  //   component.updateFiltersCounters();

  //   expect(component.projectsFilter[0].counter).toBe(1);
  //   expect(component.primarySitesFilter[0].counter).toBe(1);
  //   expect(component.programsFilter[0].counter).toBe(1);
  //   expect(component.diseaseTypesFilter[0].counter).toBe(1);
  //   expect(component.analyticalFractionsFilter[0].counter).toBe(1);
  //   expect(component.experimentalStrategiesFilter[0].counter).toBe(1);
  // });

  // it("test filterDataByProject", () => {
  //   component.filterDataByProject(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterDataByPrimarySite", () => {
  //   component.filterDataByPrimarySite(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterDataByProgram", () => {
  //   component.filterDataByProgram(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterDataByDiseaseType", () => {
  //   component.filterDataByDiseaseType(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterDataByAnalyticalFraction", () => {
  //   component.filterDataByAnalyticalFraction(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterDataByExperimentalStrategy", () => {
  //   component.filterDataByExperimentalStrategy(true);
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test getStyleForCheckbox", () => {
  //   let filter_name_exist = "kidney";
  //   let filter_name_non_exist = "breast";
  //   let target_filter_list = [];
  //   target_filter_list.push(filter_name_exist);

  //   expect(
  //     component.getStyleForCheckbox(filter_name_non_exist, target_filter_list)
  //   ).toEqual({
  //     "font-family": "Lato",
  //     color: "#000000",
  //     "font-weight": 400,
  //     "font-size": "12px"
  //   });

  //   expect(component.getStyleForCheckbox(filter_name_exist, target_filter_list)).toEqual({
  //     "font-family": "Lato",
  //     color: "#000000",
  //     "font-weight": "bold",
  //     "font-size": "12px"
  //   });
  // });

  // it("test getClassForCheckbox", () => {
  //   let longName = "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples";
  //   let shortName = "kidney";

  //   expect(component.getClassForCheckbox(longName)).toEqual({
  //     "card-list-checkbox-multi-ln": true
  //   });
  //   expect(component.getClassForCheckbox(shortName)).toEqual({
  //     "card-list-checkbox-single-ln": true
  //   });
  // });

  // it("test filterAllData selected projects", () => {
  //   component.selectedProjects.push("CPTAC-Confirmatory");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllData selected primary sites", () => {
  //   component.selectedPrimarySites.push("Colon");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllData selected programs", () => {
  //   component.selectedPrograms.push("PMID");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllData selected diseases", () => {
  //   component.selectedDiseases.push("Colon Adenocarcinoma");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllData selected analytical fraction", () => {
  //   component.selectedAnFracs.push("Glycoproteome");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllData selected experiment type", () => {
  //   component.selectedExpStarts.push("iTRAQ4");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;
  //   component.filteredCasesData = [];
  //   component.filterAllData();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesData.length).toBe(0);

  //   component.filteredCasesData = filteredCasesData;
  //   component.filterAllData();
  //   expect(component.filteredCasesData.length).toBe(0);
  // });

  // it("test filterAllDataAfterClear with all filters empty", () => {
  //   component.selectedProjects = [];
  //   component.selectedPrimarySites = [];
  //   component.selectedPrograms = [];
  //   component.selectedDiseases = [];
  //   component.selectedAnFracs = [];
  //   component.selectedExpStarts = [];

  //   component.filterAllDataAfterClear();

  //   expect(component.projectsFlag).toBeFalsy();
  //   expect(component.primarySitesFlag).toBeFalsy();
  //   expect(component.programsFlag).toBeFalsy();
  //   expect(component.diseasesFlag).toBeFalsy();
  //   expect(component.analytFracFlag).toBeFalsy();
  //   expect(component.experimentsFlag).toBeFalsy();
  // });

  // it("test filterAllDataAfterClear with projects filter", () => {
  //   component.selectedProjects.push("CPTAC-Confirmatory");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.projectsFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test filterAllDataAfterClear with primary sites filter", () => {
  //   component.selectedPrimarySites.push("Colon");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.primarySitesFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test filterAllDataAfterClear with programs filter", () => {
  //   component.selectedPrograms.push("PMID");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.programsFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test filterAllDataAfterClear with diseases filter", () => {
  //   component.selectedDiseases.push("Colon Adenocarcinoma");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.diseasesFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test filterAllDataAfterClear with analytical fraction filter", () => {
  //   component.selectedAnFracs.push("Glycoproteome");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.analytFracFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test filterAllDataAfterClear with experiments type filter", () => {
  //   component.selectedExpStarts.push("iTRAQ4");

  //   let filteredCasesData: FilterData[] = [
  //     {
  //       study_submitter_id: "S044-2",
  //       submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
  //       program_name: "Clinical Proteomic Tumor Analysis Consortium",
  //       project_name: "CPTAC3 ccRCC Discovery",
  //       disease_type: "Clear Cell Renal Cell Carcinoma",
  //       primary_site: "Kidney",
  //       analytical_fraction: "Phosphoproteome",
  //       experiment_type: "TMT10",
  //       ethnicity: "hispanic or latino",
  //       race: "white",
  //       gender: "Female",
  //       morphology: "8312/3",
  //       primary_diagnosis: "Renal cell carcinoma, NOS",
  //       site_of_resection_or_biopsy: "Kidney, NOS",
  //       tissue_or_organ_of_origin: "Kidney, NOS",
  //       tumor_grade: "G2",
  //       tumor_stage: "Stage I",
  //       data_category: "mzIdentML",
  //       file_type: "txt",
  //       access: "open",
  //       sample_type: "Primary Tumor",
  //       acquisition_type: "DDA"
  //     }
  //   ];

  //   component.filterChangedFlag = true;
  //   component.allCasesData = filteredCasesData;

  //   component.filterAllDataAfterClear();
  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);

  //   component.filteredCasesData = filteredCasesData;
  //   component.experimentsFlag = true;
  //   component.filterAllDataAfterClear();

  //   expect(component.filterChangedFlag).toBeFalsy();
  //   expect(component.filteredCasesForUnselected.length).toBe(1);
  //   expect(component.filteredCasesData.length).toBe(1);
  // });

  // it("test clearSelectionsProjects", () => {
  //   component.selectedProjects.push("");
  //   component.clearSelectionsProjects();
  //   expect(component.selectedProjects.length).toBe(0);
  // });

  // it("test clearSelectionsPrograms", () => {
  //   component.selectedPrograms.push("");
  //   component.clearSelectionsPrograms();
  //   expect(component.selectedPrograms.length).toBe(0);
  // });

  // it("test clearSelectionsPrimarySite", () => {
  //   component.selectedPrimarySites.push("");
  //   component.clearSelectionsPrimarySite();
  //   expect(component.selectedPrimarySites.length).toBe(0);
  // });

  // it("test clearSelectionsDiseaseType", () => {
  //   component.selectedDiseases.push("");
  //   component.clearSelectionsDiseaseType();
  //   expect(component.selectedDiseases.length).toBe(0);
  // });

  // it("test clearSelectionsAnalyticalFraction", () => {
  //   component.selectedAnFracs.push("");
  //   component.clearSelectionsAnalyticalFraction();
  //   expect(component.selectedAnFracs.length).toBe(0);
  // });

  // it("test clearSelectionsExperimentalStrategy", () => {
  //   component.selectedExpStarts.push("");
  //   component.clearSelectionsExperimentalStrategy();
  //   expect(component.selectedExpStarts.length).toBe(0);
  // });

  // it("test clearSelectionsFilesDataCategory", () => {
  //   component.selectedDataCategory.push("");
  //   component.clearSelectionsDataCategory();
  //   expect(component.selectedDataCategory.length).toBe(0);
  // });

  // it("test clearAllSelections", () => {
  //   component.selectedProjects.push("");
  //   component.selectedPrograms.push("");
  //   component.selectedPrimarySites.push("");
  //   component.selectedDiseases.push("");
  //   component.selectedAnFracs.push("");
  //   component.selectedExpStarts.push("");

  //   component.clearAllSelections();

  //   expect(component.selectedProjects.length).toBe(0);
  //   expect(component.selectedPrograms.length).toBe(0);
  //   expect(component.selectedPrimarySites.length).toBe(0);
  //   expect(component.selectedDiseases.length).toBe(0);
  //   expect(component.selectedAnFracs.length).toBe(0);
  //   expect(component.selectedExpStarts.length).toBe(0);
  // });
});
