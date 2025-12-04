import { RouterTestingModule } from "@angular/router/testing";
import { BrowseService } from "./../browse.service";
import { Apollo } from "apollo-angular";
import { Observable, of, Subject } from "rxjs";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AllStudiesData, FilterData } from "../../types";
import { BrowseFiltersComponent } from "./browse-filters.component";
import { BrowseFiltersService } from "./browse-filters.service";

class MockBrowseFiltersService {
  getAllData(): Observable<any> {
    return of({
      uiStudy: []
    });
  }
  
  //@@@PDC-3010: Update UI to use APIs for fily type to data category mapping
  getDataCategoryToFileTypeMapping(): Observable<any> {
    return of({
		uiDataCategoryFileTypeMapping: []
	});
  }

  getFilteredFiltersDataQuery({}): Observable<any> {
    return of({
      uiFilters: {
        project_name: [
          {
            filterName: "CPTAC3 Discovery",
            filterValue: ["S044-2", "S044-1"]
          },
          {
            filterName: "Quantitative digital maps of tissue biopsies",
            filterValue: ["S044-2"]
          }
        ],
        primary_site: [
          {
            filterName: "Kidney",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        program_name: [
          {
            filterName: "Aebersold Lab",
            filterValue: ["S016-1"]
          }
        ],
        disease_type: [
          {
            filterName: "Clear Cell Renal Cell Carcinoma",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        analytical_fraction: [
          {
            filterName: "Glycoproteome",
            filterValue: ["S016-1"]
          }
        ],
        experiment_type: [
          {
            filterName: "iTRAQ4",
            filterValue: ["S016-1"]
          }
        ],
        acquisition_type: [
          {
            filterName: "DIA",
            filterValue: ["S016-1"]
          }
        ],
        biospecimen_status: [
          {
            filterName: "Disqualified",
            filterValue: ["S044-2"]
          }
        ],
        case_status: [
          {
            filterName: "Qualified",
            filterValue: ["S044-2"]
          }
        ],
        submitter_id_name: [
          {
            filterName: "CPTAC CCRCC Discovery Study - Phosphoproteme",
            filterValue: ["S044-2"]
          }
        ],
        sample_type: [
          {
            filterName: "Tumor",
            filterValue: ["S044-2"]
          }
        ],
        ethnicity: [
          {
            filterName: "Unknown",
            filterValue: ["S044-2"]
          }
        ],
        race: [
          {
            filterName: "Not Received",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        gender: [
          {
            filterName: "Male",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        tumor_grade: [
          {
            filterName: "Unknown",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        data_category: [
          {
            filterName: "Quality Metrics",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        file_type: [
          {
            filterName: "Web",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        downloadable: [
          {
            filterName: "Yes",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        access: [
          {
            filterName: "Controlled",
            filterValue: ["S044-2"]
          }
        ]
      }
    });
  }

  getStudyUUID2NameMapping(): Observable<any> {
    //@@@PDC-1123 call ui wrapper API
    return of({
      uiProgramsProjectsStudies: [
        {
          program_id: "10251935-5540-11e8-b664-00a098d917f8",
          program_submitter_id: "CPTAC",
          name: "Clinical Proteomic Tumor Analysis Consortium",
          sponsor: "NCI",
          start_date: "01/01/2012",
          end_date: "",
          program_manager: "Christopher Kinsinger",
          projects: [
            {
              project_id: "267d6671-0e78-11e9-a064-0a9c39d33490",
              project_submitter_id: "PJ-CPTAC3",
              name: "CPTAC3 Discovery",
              studies: [
                {
                  study_id: "c935c587-0cd1-11e9-a064-0a9c39d33490",
                  submitter_id_name: "CPTAC UCEC Discovery Study - Proteome",
                  study_submitter_id: "S044-2",
                  analytical_fraction: "Proteome",
                  experiment_type: "TMT10",
                  acquisition_type: "DDA"
                },
                {
                  study_id: "cb7220f5-0cd1-11e9-a064-0a9c39d33490",
                  submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
                  study_submitter_id: "S044-1",
                  analytical_fraction: "Phosphoproteome",
                  experiment_type: "TMT10",
                  acquisition_type: "DDA"
                },
                {
                  study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                  submitter_id_name: "CPTAC CCRCC Discovery Study - Proteome",
                  study_submitter_id: "S044-1",
                  analytical_fraction: "Proteome",
                  experiment_type: "TMT10",
                  acquisition_type: "DDA"
                },
                {
                  study_id: "dd0a228f-1fb3-11e9-b7f8-0a80fada099c",
                  submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
                  study_submitter_id: "S016-1",
                  analytical_fraction: "Phosphoproteome",
                  experiment_type: "TMT10",
                  acquisition_type: "DDA"
                }
              ]
            }
          ]
        }
      ]
    });
  }

  getAllFiltersData(): Observable<any> {
    return of({
      uiFilters: {
        project_name: [
          {
            filterName: "CPTAC3 Discovery",
            filterValue: ["S044-2", "S044-1"]
          },
          {
            filterName: "Quantitative digital maps of tissue biopsies",
            filterValue: ["S044-2"]
          }
        ],
        primary_site: [
          {
            filterName: "Kidney",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        program_name: [
          {
            filterName: "Aebersold Lab",
            filterValue: ["S016-1"]
          }
        ],
        disease_type: [
          {
            filterName: "Clear Cell Renal Cell Carcinoma",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        analytical_fraction: [
          {
            filterName: "Glycoproteome",
            filterValue: ["S016-1"]
          }
        ],
        experiment_type: [
          {
            filterName: "iTRAQ4",
            filterValue: ["S016-1"]
          }
        ],
        acquisition_type: [
          {
            filterName: "DIA",
            filterValue: ["S016-1"]
          }
        ],
        biospecimen_status: [
          {
            filterName: "Disqualified",
            filterValue: ["S044-2"]
          }
        ],
        case_status: [
          {
            filterName: "Qualified",
            filterValue: ["S044-2"]
          }
        ],
        submitter_id_name: [
          {
            filterName: "CPTAC CCRCC Discovery Study - Phosphoproteme",
            filterValue: ["S044-2"]
          }
        ],
        sample_type: [
          {
            filterName: "Tumor",
            filterValue: ["S044-2"]
          }
        ],
        ethnicity: [
          {
            filterName: "Unknown",
            filterValue: ["S044-2"]
          }
        ],
        race: [
          {
            filterName: "Not Received",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        gender: [
          {
            filterName: "Male",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        tumor_grade: [
          {
            filterName: "Unknown",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        data_category: [
          {
            filterName: "Quality Metrics",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        file_type: [
          {
            filterName: "Web",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        downloadable: [
          {
            filterName: "Yes",
            filterValue: ["S044-2", "S044-1"]
          }
        ],
        access: [
          {
            filterName: "Controlled",
            filterValue: ["S044-2"]
          }
        ]
      }
    });
  }
}

class MockLocation {
  path(): string {
    return "pdc.url";
  }

  replaceState(url: string) {}
}

class MockBrowseService {
  notifyObservable$ = new Subject();
}

describe("BrowseFiltersComponent", () => {
  let component: BrowseFiltersComponent;
  let fixture: ComponentFixture<BrowseFiltersComponent>;
  let service: BrowseFiltersService;
  let browseSerivce: BrowseService;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseFiltersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule],
      providers: [{ provide: Apollo, useValue: {} }, BrowseFiltersService]
    });

    TestBed.overrideComponent(BrowseFiltersComponent, {
      set: {
        providers: [
          { provide: BrowseFiltersService, useClass: MockBrowseFiltersService },
          { provide: BrowseService, useClass: MockBrowseService },
          { provide: Location, useClass: MockLocation }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(BrowseFiltersComponent);
      component = fixture.componentInstance;
      component.parentCharts = new Subject();
      fixture.detectChanges();
    });
  }));

  it("should create", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.allCategoryFilterData).toBeDefined();
    });
  });

  it("test populate filters", () => {
    expect(component.projectsFilter.length).toBe(2, "project filter length");
    if (component.projectsFilter[0].filterName === "CPTAC3 Discovery") {
      expect(component.projectsFilter[0].filterCount).toBe(2, "project filter count");
    }

    if (
      component.projectsFilter[1].filterName ===
      "Quantitative digital maps of tissue biopsies"
    ) {
      expect(component.projectsFilter[1].filterCount).toBe(1);
    }

    expect(component.primarySitesFilter.length).toBe(1, "primary site length");
    if (component.primarySitesFilter[0].filterName === "Kidney") {
      expect(component.primarySitesFilter[0].filterCount).toBe(2, "primary site count");
    }

    expect(component.programsFilter.length).toBe(1, "programs filter length");
    if (component.programsFilter[0].filterName === "Aebersold Lab") {
      expect(component.programsFilter[0].filterCount).toBe(1, "programs filter count");
    }

    expect(component.diseaseTypesFilter.length).toBe(1, "disease type length");
    if (component.diseaseTypesFilter[0].filterName === "Rectum Adenocarcinoma") {
      expect(component.diseaseTypesFilter[0].filterCount).toBe(1, "disease type count");
    }

    expect(component.analyticalFractionsFilter.length).toBe(
      1,
      "analytical fraction length"
    );
    if (component.analyticalFractionsFilter[0].filterName === "Glycoproteome") {
      expect(component.analyticalFractionsFilter[0].filterCount).toBe(
        1,
        "analytical fraction count"
      );
    }

    expect(component.experimentalStrategiesFilter.length).toBe(1, "experimental length");
    if (component.experimentalStrategiesFilter[0].filterName === "iTRAQ4") {
      expect(component.experimentalStrategiesFilter[0].filterCount).toBe(
        1,
        "experimental count"
      );
    }

    expect(component.acquisitionFilter.length).toBe(1, "acquisition length");
    if (component.acquisitionFilter[0].filterName === "DIA") {
      expect(component.acquisitionFilter[0].filterCount).toBe(1, "acquisition count");
    }

    expect(component.studyFilter.length).toBe(1, "study length");
    if (component.studyFilter[0].filterName === "TCGA_Ovarian_PNNL_Proteome") {
      expect(component.studyFilter[0].filterCount).toBe(1, "study count");
    }

    expect(component.sampleTypeFilter.length).toBe(1, "sample type length");
    if (component.sampleTypeFilter[0].filterName === "Tumor") {
      expect(component.sampleTypeFilter[0].filterCount).toBe(1, "sample type count");
    }

    expect(component.raceFilter.length).toBe(1, "race length");
    if (component.raceFilter[0].filterName === "Unknown") {
      expect(component.raceFilter[0].filterCount).toBe(5, "race count");
    }

    expect(component.genderFilter.length).toBe(1, "gender length");
    if (component.genderFilter[0].filterName === "Not Received") {
      expect(component.genderFilter[0].filterCount).toBe(4, "gender count");
    }

    expect(component.tumorGradeFilter.length).toBe(1, "tumor grade length");
    if (component.tumorGradeFilter[0].filterName === "G2") {
      expect(component.tumorGradeFilter[0].filterCount).toBe(5, "tumor grade count");
    }

    expect(component.dataCategoryFilter.length).toBe(1, "data category length");
    if (component.dataCategoryFilter[0].filterName === "PSM") {
      expect(component.dataCategoryFilter[0].filterCount).toBe(3, "data category count");
    }

    /*expect(component.fileTypeFilter.length).toBe(1, "file type length");
    if (component.fileTypeFilter[0].filterName === "mzIdentML") {
      expect(component.fileTypeFilter[0].filterCount).toBe(3, "file type count");
    }

    expect(component.accessFilter.length).toBe(1, "access length");
    if (component.accessFilter[0].filterName === "open") {
      expect(component.accessFilter[0].filterCount).toBe(3, "access count");
    }*/
  });

  it("test updateFiltersCounters with filter flag true", () => {
    let projectsFilter = [
      {
        filterName: "CPTAC-Confirmatory",
        filterCount: 1
      }
    ];

    let primarySitesFilter = [
      {
        filterName: "Colon",
        filterCount: 1
      }
    ];

    let programsFilter = [
      {
        filterName: "PMID",
        filterCount: 1
      }
    ];

    let diseaseTypesFilter = [
      {
        filterName: "Colon Adenocarcinoma",
        filterCount: 1
      }
    ];

    let analyticalFractionsFilter = [
      {
        filterName: "Glycoproteome",
        filterCount: 1
      }
    ];

    let experimentalStrategiesFilter = [
      {
        filterName: "iTRAQ4",
        filterCount: 1
      }
	];
	
	let acquisitionTypeFilter = [
	  {
		filterName: "DDA",
        filterCount: 1
	  }
    ];

    component.projectsFilter = projectsFilter;
    component.primarySitesFilter = primarySitesFilter;
    component.programsFilter = programsFilter;
    component.diseaseTypesFilter = diseaseTypesFilter;
    component.analyticalFractionsFilter = analyticalFractionsFilter;
    component.experimentalStrategiesFilter = experimentalStrategiesFilter;
	component.acquisitionFilter = acquisitionTypeFilter;

    component.updateFiltersCounters();

    expect(component.projectsFilter[0].filterCount).toBe(0, "project filter count");
    expect(component.primarySitesFilter[0].filterCount).toBe(
      0,
      "primary site filter count"
    );
    expect(component.programsFilter[0].filterCount).toBe(0, "program filter count");
    expect(component.diseaseTypesFilter[0].filterCount).toBe(
      0,
      "disease type filter count"
    );
    expect(component.analyticalFractionsFilter[0].filterCount).toBe(
      1,
      "analytical fraction filter count"
    );
    expect(component.experimentalStrategiesFilter[0].filterCount).toBe(
      1,
      "experimental strategy filter count"
    );
	expect(component.acquisitionFilter[0].filterCount).toBe(
      0,
	  "acquisition type filter count"
	);
  });

  it("test filterDataByProject", () => {
    component.filterDataByProject(true);
  });

  it("test filterDataByPrimarySite", () => {
    component.filterDataByPrimarySite(true);
  });

  it("test filterDataByProgram", () => {
    component.filterDataByProgram(true);
  });

  it("test filterDataByDiseaseType", () => {
    component.filterDataByDiseaseType(true);
  });

  it("test filterDataByAnalyticalFraction", () => {
    component.filterDataByAnalyticalFraction(true);
  });

  it("test filterDataByExperimentalStrategy", () => {
    component.filterDataByExperimentalStrategy(true);
  });
  
  it("test filterDataByAcquisition", () => {
	  component.filterDataByAcquisition(true);
  });

  it("test getStyleForCheckbox", () => {
    let filter_name_exist = "kidney";
    let filter_name_non_exist = "breast";
    let target_filter_list = [];
    target_filter_list.push(filter_name_exist);

    expect(
      component.getStyleForCheckbox(filter_name_non_exist, target_filter_list)
    ).toEqual({
      "font-family": "Lato",
      color: "#000000",
      "font-weight": 400,
      "font-size": "12px"
    });

    expect(component.getStyleForCheckbox(filter_name_exist, target_filter_list)).toEqual({
      "font-family": "Lato",
      color: "#000000",
      "font-weight": "bold",
      "font-size": "12px"
    });
  });

  it("test getClassForCheckbox", () => {
    let longName = "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples";
    let shortName = "kidney";

    expect(component.getClassForCheckbox(longName)).toEqual({
      "card-list-checkbox-multi-ln": true
    });
    expect(component.getClassForCheckbox(shortName)).toEqual({
      "card-list-checkbox-single-ln": true
    });
  });

  it("test clearSelectionsProjects", () => {
    component.selectedProjects.push("");
    component.clearSelectionsProjects();
    expect(component.selectedProjects.length).toBe(0);
  });

  it("test clearSelectionsPrograms", () => {
    component.selectedPrograms.push("");
    component.clearSelectionsPrograms();
    expect(component.selectedPrograms.length).toBe(0);
  });

  it("test clearSelectionsPrimarySite", () => {
    component.selectedPrimarySites.push("");
    component.clearSelectionsPrimarySite();
    expect(component.selectedPrimarySites.length).toBe(0);
  });

  it("test clearSelectionsDiseaseType", () => {
    component.selectedDiseases.push("");
    component.clearSelectionsDiseaseType();
    expect(component.selectedDiseases.length).toBe(0);
  });

  it("test clearSelectionsAnalyticalFraction", () => {
    component.selectedAnFracs.push("");
    component.clearSelectionsAnalyticalFraction();
    expect(component.selectedAnFracs.length).toBe(0);
  });

  it("test clearSelectionsExperimentalStrategy", () => {
    component.selectedExpStarts.push("");
    component.clearSelectionsExperimentalStrategy();
    expect(component.selectedExpStarts.length).toBe(0);
  });

  it("test clearSelectionsFilesDataCategory", () => {
    component.selectedDataCategory.push("");
    component.clearSelectionsDataCategory();
    expect(component.selectedDataCategory.length).toBe(0);
  });
  
  it("test clearSelectionsEthnicity", () => {
    component.selectedEthnicity.push("");
	component.clearSelectionsEthnicity();
	expect(component.selectedEthnicity.length).toBe(0);
  });
  
  it("test clearSelectionsRace", () => {
    component.selectedRace.push("");
	component.clearSelectionsRace();
	expect(component.selectedRace.length).toBe(0);
  });
  
  it("test clearSelectionsGender", () => {
    component.selectedGender.push("");
	component.clearSelectionsGender();
	expect(component.selectedGender.length).toBe(0);
  });
  
  it("test clearSelectionsTumorGrade", () => {
    component.selectedTumorGrade.push("");
	component.clearSelectionsTumorGrade();
	expect(component.selectedTumorGrade.length).toBe(0);
  });
  
  it("test clearSelectionsSampleType", () => {
    component.selectedSampleType.push("");
	component.clearSelectionsSampleType();
	expect(component.selectedSampleType.length).toBe(0);
  });

  it("test clearAllSelections", () => {
    component.selectedProjects.push("");
    component.selectedPrograms.push("");
    component.selectedPrimarySites.push("");
    component.selectedDiseases.push("");
    component.selectedAnFracs.push("");
    component.selectedExpStarts.push("");

    component.clearAllSelections();

    expect(component.selectedProjects.length).toBe(0);
    expect(component.selectedPrograms.length).toBe(0);
    expect(component.selectedPrimarySites.length).toBe(0);
    expect(component.selectedDiseases.length).toBe(0);
    expect(component.selectedAnFracs.length).toBe(0);
    expect(component.selectedExpStarts.length).toBe(0);
  });
});
