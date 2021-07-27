import {
  ApolloTestingController,
  ApolloTestingModule
} from "apollo-angular/testing";
import gql from "graphql-tag";

import { inject, TestBed } from "@angular/core/testing";

import { LegacyStudySummaryService } from "./legacy-study-summary.service";

describe("LegacyStudySummaryService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LegacyStudySummaryService],
      imports: [ApolloTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject(
    [LegacyStudySummaryService],
    (service: LegacyStudySummaryService) => {
      expect(service).toBeTruthy();
    }
  ));


 /* it("test getLegacyStudyData", inject(
    [LegacyStudySummaryService],
    (service: LegacyStudySummaryService) => {
      service
        .getLegacyStudyData("57f5b781-75ec-4a90-af3d-a23042137d59")
        .subscribe((data) => {
          expect(data["uiLegacyStudies"]).toBeDefined();
          expect(data["uiLegacyStudies"].length).toBe(1);
          expect(data["uiLegacyStudies"][0].submitter_id_name).toBe("Study 5 CPTC");
        });

      const op = controller.expectOne(service.getLegacyStudyData);

      op.flush({
        data: {
          uiLegacyStudies: [
		  {
            study_id: "57f5b781-75ec-4a90-af3d-a23042137d59",
			submitter_id_name: "Study 5 CPTC",
			study_submitter_id: "Study 5 CPTC",
			pdc_study_id: "S005-Proteome",
			study_description: "<p>Study 5 extended upon Study 3 by revising the SOP to version 2.1 and adding a new sample: yeast sample spiked with BSA. The Unbiased Discovery Working Group probed the yeast sample in depth and evaluated the impact of spiking a small amount of BSA into samples. Each LTQ and Orbitrap instrument produced six RPLC analyses of yeast and six of BSA-spiked yeast, with NCI-20 samples present as QC mixtures. The study showed no negative effects from the spikes on other identifications, but the need for SOP v2.1 to specify flow rate was demonstrated by an outlier instrument.</p>",
			project_submitter_id: "CPTAC Phase I",
			analytical_fraction: "Proteome",
			experiment_type: "Label Free",
			sort_order: 5,
			embargo_date: null,
			supplementaryFilesCount: [
			{
				data_category: "Peptide Spectral Matches",
				file_type: "Open Standard",
				files_count: 279,
			 }
			],
			nonSupplementaryFilesCount: [
			{
				data_category: "Raw Mass Spectra",
				file_type: "Proprietary",
				files_count: 282,
			}
			],
			publications: [
			  {
				publication_id: "4e3d4451-d97e-41b1-ac3e-a5aed534a99a",
				pubmed_id: "24494671",
				doi: "10.1021/ac4034455",
				author: "Wang X, Chambers MC, Vega-Montoto LJ, Bunk DM, Stein SE, Tabb DL.",
				title: "QC metrics from CPTAC raw LC-MS/MS data interpreted through multivariate statistics",
				journal: "Analytical chemistry",
				journal_url: "https://pubs.acs.org/doi/10.1021/ac4034455",
				year: "2014",
				abstract: "Shotgun proteomics experiments integrate a complex sequence of processes, any of which can introduce variability. Quality metrics computed from LC-MS/MS data have relied upon identifying MS/MS scans, but a new mode for the QuaMeter software produces metrics that are independent of identifications. Rather than evaluating each metric independently, we have created a robust multivariate statistical toolkit that accommodates the correlation structure of these metrics and allows for hierarchical relationships among data sets. The framework enables visualization and structural assessment of variability. Study 1 for the Clinical Proteomics Technology Assessment for Cancer (CPTAC), which analyzed three replicates of two common samples at each of two time points among 23 mass spectrometers in nine laboratories, provided the data to demonstrate this framework, and CPTAC Study 5 provided data from complex lysates under Standard Operating Procedures (SOPs) to complement these findings. Identification-independent quality metrics enabled the differentiation of sites and run-times through robust principal components analysis and subsequent factor analysis. Dissimilarity metrics revealed outliers in performance, and a nested ANOVA model revealed the extent to which all metrics or individual metrics were impacted by mass spectrometer and run time. Study 5 data revealed that even when SOPs have been applied, instrument-dependent variability remains prominent, although it may be reduced, while within-site variability is reduced significantly. Finally, identification-independent quality metrics were shown to be predictive of identification sensitivity in these data sets. QuaMeter and the associated multivariate framework are available from http://fenchurch.mc.vanderbilt.edu and http://homepages.uc.edu/~wang2x7/ , respectively.",
				citation: "Wang, X., Chambers, M. C., Vega-Montoto, L. J., Bunk, D. M., Stein, S. E., & Tabb, D. L. (2014). QC metrics from CPTAC raw LC-MS/MS data interpreted through multivariate statistics. Analytical chemistry, 86(5), 2497â€“2509. https://doi.org/10.1021/ac4034455",
			  },
			  {
				publication_id: "aba47ba0-624f-4dac-96a3-4b57ad2a29b9",
				pubmed_id: "19921851",
				doi: "10.1021/pr9006365",
				author: "Tabb DL, Vega-Montoto L, Rudnick PA, Variyath AM, Ham AJ, Bunk DM, Kilpatrick LE, Billheimer DD, Blackman RK, Cardasis HL, Carr SA, Clauser KR, Jaffe JD, Kowalski KA, Neubert TA, Regnier FE, Schilling B, Tegeler TJ, Wang M, Wang P, Whiteaker JR, Zimmerman LJ, Fisher SJ, Gibson BW, Kinsinger CR, Mesri M, Rodriguez H, Stein SE, Tempst P, Paulovich AG, Liebler DC, Spiegelman C",
				title: "Repeatability and reproducibility in proteomic identifications by liquid chromatography-tandem mass spectrometry",
				journal: "Journal of proteome research",
				journal_url: "https://pubs.acs.org/doi/abs/10.1021/pr9006365",
				year: "2010",
				abstract: "The complexity of proteomic instrumentation for LC-MS/MS introduces many possible sources of variability. Data-dependent sampling of peptides constitutes a stochastic element at the heart of discovery proteomics. Although this variation impacts the identification of peptides, proteomic identifications are far from completely random. In this study, we analyzed interlaboratory data sets from the NCI Clinical Proteomic Technology Assessment for Cancer to examine repeatability and reproducibility in peptide and protein identifications. Included data spanned 144 LC-MS/MS experiments on four Thermo LTQ and four Orbitrap instruments. Samples included yeast lysate, the NCI-20 defined dynamic range protein mix, and the Sigma UPS 1 defined equimolar protein mix. Some of our findings reinforced conventional wisdom, such as repeatability and reproducibility being higher for proteins than for peptides. Most lessons from the data, however, were more subtle. Orbitraps proved capable of higher repeatability and reproducibility, but aberrant performance occasionally erased these gains. Even the simplest protein digestions yielded more peptide ions than LC-MS/MS could identify during a single experiment. We observed that peptide lists from pairs of technical replicates overlapped by 35-60%, giving a range for peptide-level repeatability in these experiments. Sample complexity did not appear to affect peptide identification repeatability, even as numbers of identified spectra changed by an order of magnitude. Statistical analysis of protein spectral counts revealed greater stability across technical replicates for Orbitraps, making them superior to LTQ instruments for biomarker candidate discovery. The most repeatable peptides were those corresponding to conventional tryptic cleavage sites, those that produced intense MS signals, and those that resulted from proteins generating many distinct peptides. Reproducibility among different instruments of the same type lagged behind repeatability of technical replicates on a single instrument by several percent. These findings reinforce the importance of evaluating repeatability as a fundamental characteristic of analytical technologies.",
				citation: "Tabb, D. L., Vega-Montoto, L., Rudnick, P. A., Variyath, A. M., Ham, A. J., Bunk, D. M., Kilpatrick, L. E., Billheimer, D. D., Blackman, R. K., Cardasis, H. L., Carr, S. A., Clauser, K. R., Jaffe, J. D., Kowalski, K. A., Neubert, T. A., Regnier, F. E., Schilling, B., Tegeler, T. J., Wang, M., Wang, P., â€¦ Spiegelman, C. (2010). Repeatability and reproducibility in proteomic identifications by liquid chromatography-tandem mass spectrometry. Journal of proteome research, 9(2), 761â€“776. https://doi.org/10.1021/pr9006365",
			  },
			  {
				publication_id: "d97e5dca-fa68-4a72-a920-9c93627aadeb",
				pubmed_id: "19837981",
				doi: "10.1074/mcp.M900223-MCP200",
				author: "Rudnick PA, Clauser KR, Kilpatrick LE, Tchekhovskoi DV, Neta P, Blonder N, Billheimer DD, Blackman RK, Bunk DM, Cardasis HL, Ham AJ, Jaffe JD, Kinsinger CR, Mesri M, Neubert TA, Schilling B, Tabb DL, Tegeler TJ, Vega-Montoto L, Variyath AM, Wang M, Wang P, Whiteaker JR, Zimmerman LJ, Carr SA, Fisher SJ, Gibson BW, Paulovich AG, Regnier FE, Rodriguez H, Spiegelman C, Tempst P, Liebler DC, Stein SE.",
				title: "Performance metrics for liquid chromatography-tandem mass spectrometry systems in proteomics analyses",
				journal: "Molecular & cellular proteomics : MCP",
				journal_url: "https://www.mcponline.org/article/S1535-9476(20)33795-6/fulltext",
				year: "2010",
				abstract: "A major unmet need in LC-MS/MS-based proteomics analyses is a set of tools for quantitative assessment of system performance and evaluation of technical variability. Here we describe 46 system performance metrics for monitoring chromatographic performance, electrospray source stability, MS1 and MS2 signals, dynamic sampling of ions for MS/MS, and peptide identification. Applied to data sets from replicate LC-MS/MS analyses, these metrics displayed consistent, reasonable responses to controlled perturbations. The metrics typically displayed variations less than 10% and thus can reveal even subtle differences in performance of system components. Analyses of data from interlaboratory studies conducted under a common standard operating procedure identified outlier data and provided clues to specific causes. Moreover, interlaboratory variation reflected by the metrics indicates which system components vary the most between laboratories. Application of these metrics enables rational, quantitative quality assessment for proteomics and other LC-MS/MS analytical applications.",
				citation: "Rudnick, P. A., Clauser, K. R., Kilpatrick, L. E., Tchekhovskoi, D. V., Neta, P., Blonder, N., Billheimer, D. D., Blackman, R. K., Bunk, D. M., Cardasis, H. L., Ham, A. J., Jaffe, J. D., Kinsinger, C. R., Mesri, M., Neubert, T. A., Schilling, B., Tabb, D. L., Tegeler, T. J., Vega-Montoto, L., Variyath, A. M., â€¦ Stein, S. E. (2010). Performance metrics for liquid chromatography-tandem mass spectrometry systems in proteomics analyses. Molecular & cellular proteomics : MCP, 9(2), 225â€“241. https://doi.org/10.1074/mcp.M900223-MCP200",
			  }
			 ]
		  }]
		}
      });

      controller.verify();
    }
  ));*/


  it("test getPublicationsData", inject(
    [LegacyStudySummaryService],
    (service: LegacyStudySummaryService) => {
      service.getPublicationsData("S015-2").subscribe(data => {
        expect(data["uiPublication"]).toBeDefined();
        expect(data["uiPublication"].length).toBe(1);
        expect(data["uiPublication"][0].publication_id).toBe(
          "44e2e766-89c7-11e8-bcf1-0a2705229b82"
        );
      });

      const op = controller.expectOne(service.publicationsQuery);

      op.flush({
        data: {
          uiPublication: [
            {
              publication_id: "44e2e766-89c7-11e8-bcf1-0a2705229b82",
              pubmed_id: "http://www.ncbi.nlm.nih.gov/pubmed/27251275",
              title:
                "Mertins P, Mani DR, Ruggles KV, Gillette MA, Clauser KR, Wang P et al., Nature (2016) Proteogenomics Connects Somatic Mutations to Signalling in Breast Cancere (2016) Proteogenomics Connects Somatic Mutations to Signalling in Breast Cancer"
            }
          ]
        }
      });

      controller.verify();
    }
  ));

    //@@@PDC-1123 call ui wrapper API
  it("test getFilesCounts", inject(
    [LegacyStudySummaryService],
    (service: LegacyStudySummaryService) => {
      service.getFilesCounts("S015-2").subscribe(data => {
        expect(data["uiFilesCountPerStudy"]).toBeDefined();
        expect(data["uiFilesCountPerStudy"].length).toBe(2);
        expect(data["uiFilesCountPerStudy"][0].file_type).toBe("MZML");
        expect(data["uiFilesCountPerStudy"][1].file_type).toBe("PROTOCOL");
      });

      const op = controller.expectOne(service.filesCountPerStudyQuery);

      op.flush({
        data: {
          uiFilesCountPerStudy: [
            {
              study_submitter_id: "S038-3",
              file_type: "MZML",
              files_count: 144
            },
            {
              study_submitter_id: "S038-3",
              file_type: "PROTOCOL",
              files_count: 13
            }
          ]
        }
      });

      controller.verify();
    }
  ));
});
