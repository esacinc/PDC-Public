import { Observable, of } from "rxjs";
import { LegacyStudySummaryService } from "./legacy-study-summary.service";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { Apollo } from "apollo-angular";
import { Router } from '@angular/router';
import { RouterTestingModule } from "@angular/router/testing";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from "@angular/core/testing";

import { LegacyStudySummaryComponent } from "./legacy-study-summary.component";
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

class MockLegacyStudySummaryService {
  getEntityReferenceData(entity_type, entity_id, reference_type): any{
    return of({pdcEntityReference:{}});
  }


  getPublicationsData(): Observable<any> {
    return of({
      uiPublication: [
        {
          publication_id: "44e2e0ce-89c7-11e8-bcf1-0a2705229b82",
          pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/25043054",
          title:
            "Zhang, B., et al., 2014 Proteogenomic characterization of human colon and rectal cancer. Nature. 2014 Sep 18;513(7518):382-7. doi: 10.1038/nature13438. Epub 2014 Jul 20."
        },
        {
          publication_id: "44e2e50c-89c7-11e8-bcf1-0a2705229b82",
          pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/26110064",
          title:
            "Slebos R.J.C., et al., (2015) Proteomic analysis of colon and rectal carcinoma using standard and customized databases. Scientific Data 2, Article number: 150022"
        }
      ]
    });
  }

  getFilesCountsPerStudy(): Observable<any> {
	//@@@PDC-1123 call ui wrapper API
	return of({
      uiFilesCountPerStudy: [
        {
          study_submitter_id: "ST25730263",
          file_type: "RAW",
          files_count: 36
        },
        {
          study_submitter_id: "S015-1",
          file_type: "MZML",
          files_count: 38
        }
      ]
    });
  }
}

describe("LegacyStudySummaryComponent", () => {
  let component: LegacyStudySummaryComponent;
  let fixture: ComponentFixture<LegacyStudySummaryComponent>;
  let httpMock: HttpTestingController;
  let router: Router;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LegacyStudySummaryComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(LegacyStudySummaryComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: LegacyStudySummaryService,
            useClass: MockLegacyStudySummaryService
          },
          { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              summaryData: {
                analytical_fraction: "Proteome",
				embargo_date: "N/A",
				experiment_type: "Label Free",
				nonSupplementaryFilesCount:[
					{data_category: "Raw Mass Spectra",
					 file_type: "Proprietary",
					 files_count: 320
					}
				],
				pdc_study_id: "S001-Proteome",
				project_submitter_id: "CPTAC Phase I",
				publications: [
					{
						abstract: "Shotgun proteomics experiments integrate a complex sequence of processes, any of which can introduce variability. Quality metrics computed from LC-MS/MS data have relied upon identifying MS/MS scans, but a new mode for the QuaMeter software produces metrics that are independent of identifications. Rather than evaluating each metric independently, we have created a robust multivariate statistical toolkit that accommodates the correlation structure of these metrics and allows for hierarchical relationships among data sets. The framework enables visualization and structural assessment of variability. Study 1 for the Clinical Proteomics Technology Assessment for Cancer (CPTAC), which analyzed three replicates of two common samples at each of two time points among 23 mass spectrometers in nine laboratories, provided the data to demonstrate this framework, and CPTAC Study 5 provided data from complex lysates under Standard Operating Procedures (SOPs) to complement these findings. Identification-independent quality metrics enabled the differentiation of sites and run-times through robust principal components analysis and subsequent factor analysis. Dissimilarity metrics revealed outliers in performance, and a nested ANOVA model revealed the extent to which all metrics or individual metrics were impacted by mass spectrometer and run time. Study 5 data revealed that even when SOPs have been applied, instrument-dependent variability remains prominent, although it may be reduced, while within-site variability is reduced significantly. Finally, identification-independent quality metrics were shown to be predictive of identification sensitivity in these data sets. QuaMeter and the associated multivariate framework are available from http://fenchurch.mc.vanderbilt.edu and http://homepages.uc.edu/~wang2x7/ , respectively.",
						author: "Wang X, Chambers MC, Vega-Montoto LJ, Bunk DM, Stein SE, Tabb DL.",
						citation: "Wang, X., Chambers, M. C., Vega-Montoto, L. J., Bunk, D. M., Stein, S. E., & Tabb, D. L. (2014). QC metrics from CPTAC raw LC-MS/MS data interpreted through multivariate statistics. Analytical chemistry, 86(5), 2497â€“2509. https://doi.org/10.1021/ac4034455",
						doi: "10.1021/ac4034455",
						journal: "Analytical chemistry",
						journal_url: "https://pubs.acs.org/doi/10.1021/ac4034455",
						publication_id: "4e3d4451-d97e-41b1-ac3e-a5aed534a99a",
						pubmed_id: "24494671",
						title: "QC metrics from CPTAC raw LC-MS/MS data interpreted through multivariate statistics",
						year: "2014",
					},
					{
						abstract: "The complexity of proteomic instrumentation for LC-MS/MS introduces many possible sources of variability. Data-dependent sampling of peptides constitutes a stochastic element at the heart of discovery proteomics. Although this variation impacts the identification of peptides, proteomic identifications are far from completely random. In this study, we analyzed interlaboratory data sets from the NCI Clinical Proteomic Technology Assessment for Cancer to examine repeatability and reproducibility in peptide and protein identifications. Included data spanned 144 LC-MS/MS experiments on four Thermo LTQ and four Orbitrap instruments. Samples included yeast lysate, the NCI-20 defined dynamic range protein mix, and the Sigma UPS 1 defined equimolar protein mix. Some of our findings reinforced conventional wisdom, such as repeatability and reproducibility being higher for proteins than for peptides. Most lessons from the data, however, were more subtle. Orbitraps proved capable of higher repeatability and reproducibility, but aberrant performance occasionally erased these gains. Even the simplest protein digestions yielded more peptide ions than LC-MS/MS could identify during a single experiment. We observed that peptide lists from pairs of technical replicates overlapped by 35-60%, giving a range for peptide-level repeatability in these experiments. Sample complexity did not appear to affect peptide identification repeatability, even as numbers of identified spectra changed by an order of magnitude. Statistical analysis of protein spectral counts revealed greater stability across technical replicates for Orbitraps, making them superior to LTQ instruments for biomarker candidate discovery. The most repeatable peptides were those corresponding to conventional tryptic cleavage sites, those that produced intense MS signals, and those that resulted from proteins generating many distinct peptides. Reproducibility among different instruments of the same type lagged behind repeatability of technical replicates on a single instrument by several percent. These findings reinforce the importance of evaluating repeatability as a fundamental characteristic of analytical technologies.",
						author: "Tabb DL, Vega-Montoto L, Rudnick PA, Variyath AM, Ham AJ, Bunk DM, Kilpatrick LE, Billheimer DD, Blackman RK, Cardasis HL, Carr SA, Clauser KR, Jaffe JD, Kowalski KA, Neubert TA, Regnier FE, Schilling B, Tegeler TJ, Wang M, Wang P, Whiteaker JR, Zimmerman LJ, Fisher SJ, Gibson BW, Kinsinger CR, Mesri M, Rodriguez H, Stein SE, Tempst P, Paulovich AG, Liebler DC, Spiegelman C",
						citation: "Tabb, D. L., Vega-Montoto, L., Rudnick, P. A., Variyath, A. M., Ham, A. J., Bunk, D. M., Kilpatrick, L. E., Billheimer, D. D., Blackman, R. K., Cardasis, H. L., Carr, S. A., Clauser, K. R., Jaffe, J. D., Kowalski, K. A., Neubert, T. A., Regnier, F. E., Schilling, B., Tegeler, T. J., Wang, M., Wang, P., â€¦ Spiegelman, C. (2010). Repeatability and reproducibility in proteomic identifications by liquid chromatography-tandem mass spectrometry. Journal of proteome research, 9(2), 761â€“776. https://doi.org/10.1021/pr9006365",
						doi: "10.1021/pr9006365",
						journal: "Journal of proteome research",
						journal_url: "https://pubs.acs.org/doi/abs/10.1021/pr9006365",
						publication_id: "aba47ba0-624f-4dac-96a3-4b57ad2a29b9",
						pubmed_id: "19921851",
						title: "Repeatability and reproducibility in proteomic identifications by liquid chromatography-tandem mass spectrometry",
						year: "2010",
					}
				],
				sort_order: 1,
				study_description: "<p>The Unbiased Discovery Working Group attempted to identify the components of the NCI-20 test sample, a mixture containing 20 human proteins, using different mass spectrometry experimental platforms. Three samples of intact NCI-20 (1A) and three samples of trypsin digested NCI-20 (1B) were sent to each laboratory during each of two successive weeks to identify the proteins using their own protocols with any available instruments. Instrument platform diversity was highest in this initial study.</p>",
				study_id: "eb1ec222-0b33-41a5-87db-1658c9921ce7",
				study_submitter_id: "Study 1 CPTC",
				submitter_id_name: "Study 1 CPTC",
				supplementaryFilesCount: [
					{
						data_category: "Peptide Spectral Matches",
						file_type: "Open Standard",
						files_count: 312,
					},
					{
						data_category: "Processed Mass Spectra",
						file_type: "Open Standard",
						files_count: 12,
					},
					{
						data_category: "Processed Mass Spectra",
						file_type: "Proprietary",
						files_count: 17,
					}
				]
              }
            }
          },
          { provide: MatDialog, useClass: MockDialog },
		  { provide: Router }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(LegacyStudySummaryComponent);
      component = fixture.componentInstance;
      httpMock = TestBed.get(HttpTestingController);
      fixture.detectChanges();
	  router = TestBed.get(Router);
    });
  }));

  it("should create and initalize data correctly", () => {
    expect(component).toBeTruthy();
    expect(component.studySummaryData.pdc_study_id).toBe("S001-Proteome");
    expect(component.publications.length).toBe(2);
    expect(component.publications[0].publication_id).toBe(
      "4e3d4451-d97e-41b1-ac3e-a5aed534a99a"
    );
    expect(component.publications[1].publication_id).toBe(
      "aba47ba0-624f-4dac-96a3-4b57ad2a29b9"
    );
  });

  /*it("test readManifest", () => {
    let manifestRequest = httpMock.expectOne(
      "assets/data-folder/dd0a228f-1fb3-11e9-b7f8-0a80fada099c/manifest.json"
    );
    manifestRequest.flush({
      heatmaps: [
        {
          "menu-label": "label",
          filename: "breast",
          "col-header": "col-header",
          "row-header": "row-header"
        }
      ]
    });
    component.readManifest();
  });*/
  //@@@PDC-2234 - open PDC HeatMap in a separate tab
  it("test navigate to HeatMap", fakeAsync(() => {
	  let windowOpenSpy = spyOn(window, 'open');
	  component.pdcStudyID = "PDC000128";
	  component.study_id = "dd0a228f-1fb3-11e9-b7f8-0a80fada099c";
//	  component.openHeatMap("Prospective Ovarian PNNL Proteome Qeplus");
//	  expect(windowOpenSpy).toHaveBeenCalledWith(['/pdc/analysis/PDC000118?StudyName=Prospective Ovarian PNNL Proteome Qeplus']);
  }));
  
  it("test isDownloadDisabled", () => {
	  component.isDownloadDisabled();
	  expect(component).toBeTruthy();
  });
  
  it("test displayTextforExternalID", () => {
	  var result = component.displayTextforExternalID("","https://cptac-data-portal.georgetown.edu/study-summary/S038");
	  expect(result).toBe('');
  });
  
  it("test getIcon", () => {
	  var result = component.getIcon(null);
	  expect(result).toBe('');
  });
});

