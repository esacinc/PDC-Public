import { StudySummaryOverlayService } from "./study-summary-overlay-window/study-summary-overlay-window.service";
import { Observable, of } from "rxjs";
import { StudySummaryService } from "./study-summary.service";
import { MAT_DIALOG_DATA } from "@angular/material";
import { MatDialogRef } from "@angular/material/dialog";
import { Apollo } from "apollo-angular";
import { RouterTestingModule } from "@angular/router/testing";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { StudySummaryComponent } from "./study-summary.component";
import { MatDialog } from '@angular/material/dialog';

class MockStudySummaryOverlayService {
  open() {}
}

class MockDialog {
  open(): any {
    return { afterClosed: () => of("closed") };
  }
}

class MockStudySummaryService {
  getFilteredStudyData(): Observable<any> {
    return of({
      getPaginatedUIStudy: {
        total: 22,
        uiStudies: [
          {
            submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteme",
            study_description:
              "<p>Kidney cancer is among the 10 most common cancers in both men and women and each year there are approximately 60,000 new cases with over 14,000 deaths (<a href='https://seer.cancer.gov/statfacts/html/kidrp.html' target='_blank'>NCI, Surveillance, Epidemiology and End Results – SEERs-- Program</a>). Several histological and molecular subtypes have been identified and clear cell renal cell carcinoma (CCRCC) is the most prevalent (<a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5936048/' target='_blank'>Hsieh el al., 2017 Nat Rev Dis Primers</a>). To advance the proteogenomic understanding of CCRCC, the CPTAC program has investigated 110 tumors (CPTAC discovery cohort) and subjected these samples to global proteome and phosphoproteome analysis. An optimized workflow for mass spectrometry of tissues using isobaric tags (TMT (tandem mass tags)-10) was used (<a href='https://www.nature.com/articles/s41596-018-0006-9' target='_blank'>Mertins et al., Nature Protocols 2018</a>). Proteome and phosphoproteome data from the CCRCC tumors is available below along with peptide spectrum analyses (PSMs) and protein summary reports from the CPTAC common data analysis pipeline (CDAP).</p><p>Clinical data is provided. Additional attributes along with genotypes will be available as cohort characterization proceeds.</p><p>Genomic data will be available from the NCI Genomic Data Commons.</p>",
            study_submitter_id: "S044-2",
            program_name: "Clinical Proteomic Tumor Analysis Consortium",
            project_name: "CPTAC3 Discovery",
            disease_type: "Clear Cell Renal Cell Carcinoma;Other",
            primary_site: "Kidney;N/A",
            analytical_fraction: "Phosphoproteome",
            experiment_type: "TMT10",
            embargo_date: "2019-06-01",
            cases_count: 126,
            aliquots_count: 218,
            filesCount: [
              {
                data_category: "Other Metadata",
                file_type: "Document",
                files_count: 7
              },
              {
                data_category: "Peptide Spectral Matches",
                file_type: "Open Standard",
                files_count: 338
              },
              {
                data_category: "Peptide Spectral Matches",
                file_type: "Text",
                files_count: 338
              },
              {
                data_category: "Processed Mass Spectra",
                file_type: "Open Standard",
                files_count: 338
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
                files_count: 338
              }
            ]
          }
        ]
      }
    });
  }

  getStudyData(): Observable<any> {
    return of({
      uiStudy: [
        {
          study_submitter_id: "",
          project_name: "CPTAC-Retrospective",
          primary_site: "Colon",
          submitter_id_name: "cae75943",
          program_name: "Clinical Proteomic",
          disease_type: "Colon Adenocarcinoma",
          analytical_fraction: "Glycoproteome",
          experiment_type: "iTRAQ4",
          cases_count: 1,
          aliquots_count: 1,
          num_raw: 1,
          num_mzml: 1,
          num_prot: 1,
          num_prot_assem: 1,
          num_psm: 1
        }
      ]
    });
  }

  getWorkflowMetadata(): Observable<any> {
	//@@@PDC-1123 call ui wrapper API    
	return of({
      uiWorkflowMetadata: [
        {
          workflow_metadata_submitter_id: "TCGA_Breast_Cancer_Proteome",
          study_submitter_id: "S015-1",
          protocol_submitter_id: "P-S015-1",
          cptac_study_id: "S015",
          submitter_id_name: "MSGF+ iTRAQ 4-plex (Thermo Q-Exactive HCD)",
          study_submitter_name: "TCGA_Breast_Cancer_Proteome",
          analytical_fraction: "Proteome",
          experiment_type: "iTRAQ4",
          instrument: "Thermo Q Exactive",
          refseq_database_version: "RefSeq human build 37",
          uniport_database_version: "N/A",
          hgnc_version: "",
          raw_data_processing: "ReAdw4Mascot2.exe version 1.2 ConvVer 20130604a",
          raw_data_conversion: "msconvert 3.0.3827",
          sequence_database_search: "MSGF+ v9733",
          search_database_parameters:
            "java –Xmx3500M –jar MSGFPlus.jar -d <file>.fasta -t 20ppm -e 1 -m (3 for QExactive, 1 for Orbitrap) -inst (1 for QExactive, 1 for Orbitrap) -ntt 1 -thread 2 -tda 1 -ti 0,1 -n 1 -maxLength 50 -mod <file>.txt",
          phosphosite_localization: "",
          ms1_data_analysis: "ProMS",
          psm_report_generation: "single_file_report.exe",
          cptac_dcc_mzidentml: "1.2.2",
          mzidentml_refseq: "r82",
          mzidentml_uniprot: "2017_06",
          gene_to_prot: "2017-07-20",
          cptac_galaxy_workflows: "N/A",
          cptac_galaxy_tools: "N/A",
          cdap_reports: "N/A",
          cptac_dcc_tools: "N/A"
        }
      ]
    });
  }

  getProtocolData(): Observable<any> {
    return of({
      uiProtocol: [
        {
          protocol_id: "00cc7966-571e-11e8-b664-00a098d917f8",
          protocol_submitter_id: "P-S015-1",
          analytical_fraction: "Proteome",
          experiment_type: "iTRAQ4",
          asp_name: "CPTAC-SOP-Broad_Proteome/Phosphoproteome_3.0",
          asp_type: "4-plex iTRAQ Analytical Protocol",
          asp_starting_amount: "4 mg",
          asp_proteolysis: "LysC/Trypsin",
          asp_alkylation: "Iodoacetamide",
          asp_enrichment:
            "Phosphopeptide enrichment with immobilized metal affinity chromatography (NiNTA beads stripped with EDTA and loaded with FeCl3; Qiagen)",
          asp_labelling: "4-plex iTRAQ",
          asp_fractionation: "Peptide basic pH Reversed Phase LC (pH 10)",
          asp_fractions: "25 (Proteome) / 13 (Phosphoproteome)",
          cp_name: "CPTAC-SOP-Broad_Q-Exactive_3.0",
          cp_column_type: "New Objective; PicoFrit SELF/P",
          cp_injected: "1 ug Proteome / 4 of 9 ul IMAC sample Phosphoprote",
          cp_column_length: "20 cm",
          cp_inside_diameter: "75 um",
          cp_particle_size: "1.9 um",
          cp_particle_type: "Dr Maisch GmbH; ReproSil-Pur 120 C18-AQ; 1.9 um",
          cp_gradient_length: "110 min",
          msp_name: "CPTAC-SOP-Broad_Q-Exactive_3.0",
          msp_type: "Orbitrap Mass Spectrometry Protocol",
          msp_instrument: "Q Exactive",
          msp_dissociation: "Higher-energy collisional dissociation (HCD)",
          msp_ms1_resolution: "70000",
          msp_ms2_resolution: "17500",
          msp_precursors: "Top12",
          msp_collision_energy: "0.28"
        }
      ]
    });
  }

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  getStudyExperimentalDesign(): Observable<any> {
    return of({
      studyExperimentalDesign: [
        {
          study_run_metadata_id: "0127c578-2075-11e9-b7f8-0a80fada099c",
          study_run_metadata_submitter_id: "S044-1-13",
          study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
          study_submitter_id: "S044-1",
          analyte: "null",
          acquisition_type: "DDA",
          experiment_type: "TMT10",
          plex_dataset_name: "10CPTAC_CCRCC_Proteome_JHU_20180119",
          experiment_number: "null",
          number_of_fractions: "25",
          label_free: "null",
          itraq_113: "null",
          itraq_114: "null",
          itraq_115: "null",
          itraq_116: "null",
          itraq_117: "null",
          itraq_118: "null",
          itraq_119: "null",
          itraq_121: "null",
          tmt_126: "CPT0001180009",
          tmt_127n: "CPT0082010001",
          tmt_127c: "CPT0015910003",
          tmt_128n: "CPT0086870003",
          tmt_128c: "CPT0063330001",
          tmt_129n: "CPT0001190001",
          tmt_129c: "CPT0063320003",
          tmt_130n: "CPT0081990003",
          tmt_130c: "CPT0086890003",
          tmt_131: "Pooled Sample",
          tmt_131c: "null"
        }
      ]
    });
  }

  //@@@PDC-1219: Add a new experimental design tab on the study summary page
  getBiospecimenPerStudy(): Observable<any> {
    return of({
      biospecimenPerStudy: [
        {
          aliquot_id: "5225d754-d0b0-11e9-9a07-0a80fada099c",
          sample_id: "9a3ef50b-d0a6-11e9-9a07-0a80fada099c",
          case_id: "f1ed9eb2-cf1e-11e9-9a07-0a80fada099c",
          aliquot_submitter_id: "CPT0000920017",
          sample_submitter_id: "C3L-00094-03",
          case_submitter_id: "C3L-00094",
          aliquot_is_ref: "no",
          aliquot_status: "Qualified",
          case_status: "Qualified",
          sample_status: "Qualified",
          project_name: "CPTAC3 Discovery",
          sample_type: "Primary Tumor",
          disease_type: "Lung Adenocarcinoma",
          primary_site: "Bronchus and lung",
          pool: "No",
          taxon: "Homo sapiens"
        }
      ]
    });
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

  getFilesCounts(): Observable<any> {
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

  getFilteredClinicalDataPaginated(): Observable<any> {
    return of({
      getPaginatedUIClinical: {
        total: 369,
        uiClinical: [
          {
            case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
            case_submitter_id: "14CO003",
            external_case_id: null,
            ethnicity: "not hispanic or latino",
            gender: "female",
            race: "white",
            morphology: "not reported",
            primary_diagnosis: "Colon Adenocarcinoma",
            site_of_resection_or_biopsy: "not reported",
            tissue_or_organ_of_origin: "Colon",
            tumor_grade: "not reported",
            tumor_stage: "Stage IIIB"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 369,
          pages: 37,
          size: 10
        }
      }
    });
  }
  
  getFilteredCasesPaginated(): Observable<any> {
    return of({
      getPaginatedUICase: {
        total: 1038,
        uiCases: [
          {
            aliquot_id: "2de529de-6427-11e8-bcf1-0a2705229b82",
            sample_id: "25567fdb-641d-11e8-bcf1-0a2705229b82",
            case_id: "cae72878-63d6-11e8-bcf1-0a2705229b82",
            aliquot_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05_D2",
            sample_submitter_id: "fd4edc52-09ef-4b01-be7c-f23f05",
            case_submitter_id: "14CO003",
            program_name: "Clinical Proteomic Tumor Analysis Consortium",
            project_name: "CPTAC-Confirmatory",
            sample_type: "Primary Tumor",
            disease_type: "Colon Adenocarcinoma",
            primary_site: "Colon"
          }
        ],
        pagination: {
          count: 10,
          sort: "",
          from: 0,
          page: 1,
          total: 1038,
          pages: 104,
          size: 10
        }
      }
    });
  }
}

describe("StudySummaryComponent", () => {
  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudySummaryComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(StudySummaryComponent, {
      set: {
        providers: [
          { provide: Apollo, useValue: {} },
          {
            provide: StudySummaryService,
            useClass: MockStudySummaryService
          },
          {
            provide: StudySummaryOverlayService,
            useClass: MockStudySummaryOverlayService
          },
          { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              summaryData: {
                case_submitter_id: "14CO003",
                submitter_id_name: "",
                project_name: ""
              }
            }
          },
          { provide: MatDialog, useClass: MockDialog }
        ]
      }
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(StudySummaryComponent);
      component = fixture.componentInstance;
      httpMock = TestBed.get(HttpTestingController);
      fixture.detectChanges();
    });
  }));

  it("should create and initalize data correctly", () => {
    expect(component).toBeTruthy();
    expect(component.studySummaryData.project_name).toBe("CPTAC3 Discovery");
    expect(component.workflowData.workflow_metadata_submitter_id).toBe(
      "TCGA_Breast_Cancer_Proteome"
    );
    expect(component.protocol.protocol_id).toBe("00cc7966-571e-11e8-b664-00a098d917f8");
    expect(component.publications.length).toBe(2);
    expect(component.publications[0].publication_id).toBe(
      "44e2e0ce-89c7-11e8-bcf1-0a2705229b82"
    );
    expect(component.publications[1].publication_id).toBe(
      "44e2e50c-89c7-11e8-bcf1-0a2705229b82"
    );
    expect(component.fileCountsRaw.length).toBe(2);
    expect(component.totalFilesCount).toBe(74);
  });

  it("test readManifest", () => {
    let manifestRequest = httpMock.expectOne(
      "assets/data-folder/undefined/manifest.json"
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
  });
});
