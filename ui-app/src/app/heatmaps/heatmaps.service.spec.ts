import { HeatmapsService } from "./heatmaps.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";
import gql from "graphql-tag";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("HeatmapsService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ApolloTestingModule],
    providers: [HeatmapsService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([HeatmapsService], (service: HeatmapsService) => {
    expect(service).toBeTruthy();
  }));

  it("test getHeatmapsFilters", inject([HeatmapsService], (service: HeatmapsService) => {
    service.getHeatmapsFilters().subscribe((data) => {
      expect(data["getUIHeatmapFilters"]).toBeDefined();
    });

    const op = controller.expectOne(gql`
      query allHeatmapsFilters{
				getUIHeatmapFilters {
				filterCount
				disease_types
				primary_sites
				analytical_fractions
			  } 
		   } 
    `);

    op.flush({
      data: {
        getUIHeatmapFilters: {
			filterCount: null,
			disease_types: [
				"Breast Invasive Carcinoma",
				"Clear Cell Renal Cell Carcinoma",
				"Colon Adenocarcinoma",
				"Early Onset Gastric Cancer",
				"Glioblastoma",
				"Head and Neck Squamous Cell Carcinoma",
				"Hepatocellular Carcinoma ",
				"Lung Adenocarcinoma",
				"Lung Squamous Cell Carcinoma",
				"Other",
				"Ovarian Serous Cystadenocarcinoma",
				"Pancreatic Ductal Adenocarcinoma",
				"Pediatric/AYA Brain Tumors",
				"Rectum Adenocarcinoma",
				"Uterine Corpus Endometrial Carcinoma"
			],
			primary_sites: [
				"Brain",
				"Breast",
				"Bronchus and lung",
				"Colon",
				"Head and Neck",
				"Kidney",
				"Liver",
				"Not Reported",
				"Ovary",
				"Pancreas",
				"Rectum",
				"Stomach",
				"Uterus, NOS"
			],
			analytical_fractions: [
				"Acetylome",
				"Glycoproteome",
				"Phosphoproteome",
				"Proteome",
				"Ubiquitylome"
			]
		}
	  },
    });

    controller.verify();
  }));

  it("test getFilteredHeatmaps", inject(
    [HeatmapsService],
    (service: HeatmapsService) => {
      service.getFilteredHeatmaps("", {primary_site:"Kidney"}).subscribe((data) => {
        expect(data["uiHeatmapStudies"]).toBeDefined();
        expect(data["uiHeatmapStudies"].length).toBe(2);
        expect(data["uiHeatmapStudies"][0].study_id).toBe("dbe94609-1fb3-11e9-b7f8-0a80fada099c");
        expect(data["uiHeatmapStudies"][0].primary_site).toBe("Kidney");
      });

      const op = controller.expectOne(gql`
         query FilterdHeatmapsQuery ($sort_value: String!, $primary_sites_filter: String!, $disease_type_filter: String!, $analytical_fractions_filter: String!) {
			uiHeatmapStudies ( sort: $sort_value, primary_site: $primary_sites_filter, disease_type: $disease_type_filter, analytical_fraction: $analytical_fractions_filter) {
				study_id
				study_submitter_id
				submitter_id_name
				pdc_study_id
				study_description
				program_name
				project_name
				analytical_fraction
				primary_site
				disease_type
				experiment_type
				embargo_date
				heatmapFiles
			} 
		}
      `);

      op.flush({
        data: {
		  uiHeatmapStudies: [
			  {
				study_id: "dbe94609-1fb3-11e9-b7f8-0a80fada099c",
				study_submitter_id: "CPTAC CCRCC Discovery Study - Proteome S044-1",
				submitter_id_name: "CPTAC CCRCC Discovery Study - Proteome",
				pdc_study_id: "PDC000127",
				analytical_fraction: "Proteome",
				primary_site: "Kidney",
				disease_type: "Clear Cell Renal Cell Carcinoma",
				heatmapFiles: [
				  "dbe94609-1fb3-11e9-b7f8-0a80fada099c-log2_ratio.gct",
				  "dbe94609-1fb3-11e9-b7f8-0a80fada099c-unshared_log2_ratio.gct",
				  "manifest.json"
				]
			  },
			  {
				study_id: "dd0a228f-1fb3-11e9-b7f8-0a80fada099c",
				study_submitter_id: "CPTAC CCRCC Discovery Study - Phosphoproteome S044-2",
				submitter_id_name: "CPTAC CCRCC Discovery Study - Phosphoproteome",
				pdc_study_id: "PDC000128",
				analytical_fraction: "Phosphoproteome",
				primary_site: "Kidney",
				disease_type: "Clear Cell Renal Cell Carcinoma",
				heatmapFiles: [
				  "dd0a228f-1fb3-11e9-b7f8-0a80fada099c-log2_ratio.gct",
				  "manifest.json"
				]
			  }
			]
        },
      });

      controller.verify();
    }
  ));

});
