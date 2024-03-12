import { Apollo } from "apollo-angular";
import { Observable, of } from "rxjs";

import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { AllStudiesData } from "../../types";
import { BrowseFiltersService } from "../filters/browse-filters.service";
import { BrowseByStudyComponent } from "./browse-by-study.component";
import { BrowseByStudyService } from "./browse-by-study.service";

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}
class MockBrowseByStudyService {
/*  getFilteredStudiesPaginated(): Observable<any> {
    return of({
      getPaginatedUIStudy: {
        total: 16,
        uiStudies: [
          {
            submitter_id_name: "guo_PCT_kidney_SWATH",
            program_name:
              "PMID: 25730263 (SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples)",
            project_name: "SWATH/DIA of Renal Cell Carcinoma from tissue biopsy samples",
            disease_type: "Renal Cell Carcinoma",
            primary_site: "kidney",
            analytical_fraction: "Protein",
            experiment_type: "Tumor/Normal",
            num_raw: 36,
            num_mzml: 0,
            num_prot: 0,
            num_prot_assem: 0,
            num_psm: 0
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 16,
          pages: 2,
          size: 10
        }
      }
    });
  }
}

describe("BrowseByStudyComponent", () => {
  let component: BrowseByStudyComponent;
  let fixture: ComponentFixture<BrowseByStudyComponent>;
  let serviceSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseByStudyComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(BrowseByStudyComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: BrowseByStudyService,
            useClass: MockBrowseByStudyService
          },
          { provide: MatDialog, useClass: MockDialog },
          { provide: BrowseFiltersService, useValue: {} }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      serviceSpy = spyOn(
        MockBrowseByStudyService.prototype,
        "getFilteredStudiesPaginated"
      ).and.callThrough();
      fixture = TestBed.createComponent(BrowseByStudyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it("should create and set data correctly", async () => {
    expect(component).toBeTruthy();
    fixture.whenStable().then(() => {
      expect(component.filteredStudiesData.length).toBe(1);
      expect(component.totalRecords).toBe(16);
      expect(component.offset).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.limit).toBe(10);
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  it("show study summary test", () => {
    this.filteredStudiesData = [
      {
        study_id:'CPTAC CCRCC Discovery Study - CompRef Proteome',
        pdc_study_id: 'PDC000221',
        submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
        study_submitter_id: "S043-2",
        study_description:
          "<p>Endometrial cancer is the most common cancer of the female reproductive organs. It is estimated that over 63,000 new cases of uterine body or corpus cancer will be diagnosed in 2018, and more than 11,000 women will die from this disease (<a href='https://seer.cancer.gov/statfacts/html/corp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Tumors from 100 patients with uterine corpus endometrial carcinoma (UCEC) were subjected to global proteome and phosphoproteome analysis following the CPTAC-optimized workflow for mass spectrometry analysis of tissues using the 10-plexed isobaric tandem mass tags (TMT-10) (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CPTAC cohort are available along with peptide spectrum matches (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided below. Additional clinical attributes and genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
        program_name: "Clinical Proteomic Tumor Analysis Consortium",
        project_name: "CPTAC3 Discovery",
        disease_type: "Uterine Corpus Endometrial Carcinoma;Other",
        primary_site: "Uterus, NOS;N/A",
        analytical_fraction: "Phosphoproteome",
        experiment_type: "TMT10",
        embargo_date: "2019-06-01",
        cases_count: 115,
        aliquots_count: 146,
        filesCount: [
          {
            data_category: "Other Metadata",
            file_type: "Document",
            files_count: 10
          },
          {
            data_category: "Peptide Spectral Matches",
            file_type: "Open Standard",
            files_count: 240
          },
          {
            data_category: "Peptide Spectral Matches",
            file_type: "Text",
            files_count: 240
          },
          {
            data_category: "Processed Mass Spectra",
            file_type: "Open Standard",
            files_count: 240
          },
          {
            data_category: "Protein Assembly",
            file_type: "Text",
            files_count: 13
          },
          {
            data_category: "Quality Metrics",
            file_type: "Web",
            files_count: 2
          },
          {
            data_category: "Raw Mass Spectra",
            file_type: "Proprietary",
            files_count: 240
          }
        ],
		versions: []
      }
    ];
    component.filteredStudiesData = [
      {
        study_id:'CPTAC CCRCC Discovery Study - CompRef Proteome',
        pdc_study_id: 'PDC000221',
        submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
        study_submitter_id: "S043-2",
        study_description:
          "<p>Endometrial cancer is the most common cancer of the female reproductive organs. It is estimated that over 63,000 new cases of uterine body or corpus cancer will be diagnosed in 2018, and more than 11,000 women will die from this disease (<a href='https://seer.cancer.gov/statfacts/html/corp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Tumors from 100 patients with uterine corpus endometrial carcinoma (UCEC) were subjected to global proteome and phosphoproteome analysis following the CPTAC-optimized workflow for mass spectrometry analysis of tissues using the 10-plexed isobaric tandem mass tags (TMT-10) (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CPTAC cohort are available along with peptide spectrum matches (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided below. Additional clinical attributes and genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
        program_name: "Clinical Proteomic Tumor Analysis Consortium",
        project_name: "CPTAC3 Discovery",
        disease_type: "Uterine Corpus Endometrial Carcinoma;Other",
        primary_site: "Uterus, NOS;N/A",
        analytical_fraction: "Phosphoproteome",
        experiment_type: "TMT10",
        embargo_date: "2019-06-01",
        cases_count: 115,
        aliquots_count: 146,
        filesCount: [
          {
            data_category: "Other Metadata",
            file_type: "Document",
            files_count: 10
          },
          {
            data_category: "Peptide Spectral Matches",
            file_type: "Open Standard",
            files_count: 240
          },
          {
            data_category: "Peptide Spectral Matches",
            file_type: "Text",
            files_count: 240
          },
          {
            data_category: "Processed Mass Spectra",
            file_type: "Open Standard",
            files_count: 240
          },
          {
            data_category: "Protein Assembly",
            file_type: "Text",
            files_count: 13
          },
          {
            data_category: "Quality Metrics",
            file_type: "Web",
            files_count: 2
          },
          {
            data_category: "Raw Mass Spectra",
            file_type: "Proprietary",
            files_count: 240
          }
        ],
        supplementaryFilesCount: [
            {
              data_category: "Other Metadata",
              file_type: "Document",
              files_count: 7
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Open Standard",
              files_count: 500
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Text",
              files_count: 500
            },
            {
              data_category: "Protein Assembly",
              file_type: "Text",
              files_count: 6
            }
        ],
        nonSupplementaryFilesCount: [
            {
              data_category: "Processed Mass Spectra",
              file_type: "Open Standard",
              files_count: 500
            },
            {
              data_category: "Quality Metrics",
              file_type: "Text",
              files_count: 1
            },
            {
              data_category: "Quality Metrics",
              file_type: "Web",
              files_count: 1
            },
            {
              data_category: "Raw Mass Spectra",
              file_type: "Proprietary",
              files_count: 500
            }
        ],
		contacts: [
			{
			  email: "",
			  institution: "Johns Hopkins University",
			  name: "Hui Zhang",
			  url: ""
			}
		], 
		versions: []
      }
    ];
    let router = TestBed.get(Router);
    spyOn(router, "navigate");
    let spy = spyOn(MockDialog.prototype, "open").and.callThrough();
    component.showStudySummary("S043-2");
    expect(router.navigate).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
 
/*  it("test find study by id", () => {
    let studyData: AllStudiesData = {
      study_id:'CPTAC CCRCC Discovery Study - CompRef Proteome',
      pdc_study_id: '',
      submitter_id_name: "CPTAC UCEC Discovery Study - Phosphoproteme",
      study_description:
        "<p>Endometrial cancer is the most common cancer of the female reproductive organs. It is estimated that over 63,000 new cases of uterine body or corpus cancer will be diagnosed in 2018, and more than 11,000 women will die from this disease (<a href='https://seer.cancer.gov/statfacts/html/corp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Tumors from 100 patients with uterine corpus endometrial carcinoma (UCEC) were subjected to global proteome and phosphoproteome analysis following the CPTAC-optimized workflow for mass spectrometry analysis of tissues using the 10-plexed isobaric tandem mass tags (TMT-10) (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CPTAC cohort are available along with peptide spectrum matches (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided below. Additional clinical attributes and genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
      study_submitter_id: "S043-2",
      program_name: "Clinical Proteomic Tumor Analysis Consortium",
      project_name: "CPTAC3 Discovery",
      disease_type: "Uterine Corpus Endometrial Carcinoma;Other",
      primary_site: "Uterus, NOS;N/A",
      analytical_fraction: "Phosphoproteome",
      experiment_type: "TMT10",
      embargo_date: "2019-06-01",
      cases_count: 115,
      aliquots_count: 146,
      filesCount: [
        {
          data_category: "Other Metadata",
          file_type: "Document",
          files_count: 10
        },
        {
          data_category: "Peptide Spectral Matches",
          file_type: "Open Standard",
          files_count: 240
        },
        {
          data_category: "Peptide Spectral Matches",
          file_type: "Text",
          files_count: 240
        },
        {
          data_category: "Processed Mass Spectra",
          file_type: "Open Standard",
          files_count: 240
        },
        {
          data_category: "Protein Assembly",
          file_type: "Text",
          files_count: 13
        },
        {
          data_category: "Quality Metrics",
          file_type: "Web",
          files_count: 2
        },
        {
          data_category: "Raw Mass Spectra",
          file_type: "Proprietary",
          files_count: 240
        }
      ],
      supplementaryFilesCount: [
            {
              data_category: "Other Metadata",
              file_type: "Document",
              files_count: 7
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Open Standard",
              files_count: 500
            },
            {
              data_category: "Peptide Spectral Matches",
              file_type: "Text",
              files_count: 500
            },
            {
              data_category: "Protein Assembly",
              file_type: "Text",
              files_count: 6
            }
      ],
      nonSupplementaryFilesCount: [
            {
              data_category: "Processed Mass Spectra",
              file_type: "Open Standard",
              files_count: 500
            },
            {
              data_category: "Quality Metrics",
              file_type: "Text",
              files_count: 1
            },
            {
              data_category: "Quality Metrics",
              file_type: "Web",
              files_count: 1
            },
            {
              data_category: "Raw Mass Spectra",
              file_type: "Proprietary",
              files_count: 500
            }
      ],
	  contacts: [ 
		{
			email: "",
			institution: "Johns Hopkins University",
			name: "Hui Zhang",
			url: ""
		}
	  ],
	  versions: []
    };

    let filteredCasesData = [studyData];
    expect(component.findStudyByID("guo_PCT_kidney_SWATH")).toBe(-1);
    component.filteredStudiesData = filteredCasesData;
    expect(component.findStudyByID("S043-2")).toBe(0);
  }); */

/*   it("test ngOnChanges with new filter", () => {
    let simpleChange = {};
    let newFilterValue = "Primary_Sites:kidney";
    component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
    expect(serviceSpy).toHaveBeenCalled();
  }); */

/*   it("test ngOnChanges with clear all selections", () => {
    let simpleChange = {};
    let newFilterValue = "Clear all selections: ";
    component.newFilterSelected = ["Primary_Sites", "Projects"];
    component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
    expect(serviceSpy).toHaveBeenCalled();
  }); 

  it("test load cases", () => {
    let event = {
      sortField: "study_submitter_id",
      sortOrder: 1,
      first: 0,
      rows: 10
    };
    component.loadNewPage(event);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it("test download disable", () => {
    expect(component.isDownloadDisabled()).toBeTruthy();
    let selectedData = [];
    component.selectedStudies = selectedData;
    expect(component.isDownloadDisabled()).toBeTruthy();
    selectedData.push("");
    expect(component.isDownloadDisabled()).toBeFalsy();
  });
  
  it("Test download complete manifest", () => {
	let simpleChange = {};
	let newFilterValue = "sample_type:Xenograft";
	component.newFilterValue = newFilterValue;
    component.ngOnChanges(simpleChange);
	component.downloadCompleteManifest(true);
    expect(serviceSpy).toHaveBeenCalled();	
  }); 
});*/
}
