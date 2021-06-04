import { PublicationsService } from "./publications.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";
import gql from "graphql-tag";

describe("PublicationsService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PublicationsService],
      imports: [ApolloTestingModule, HttpClientTestingModule],
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([PublicationsService], (service: PublicationsService) => {
    expect(service).toBeTruthy();
  }));

  it("test getPublicationsFilters", inject([PublicationsService], (service: PublicationsService) => {
    service.getPublicationsFilters().subscribe((data) => {
      expect(data["getUIPublicationFilters"]).toBeDefined();
    });

    const op = controller.expectOne(gql`
      query allPublicationsFilters{
				getUIPublicationFilters {
					disease_types
					years
					programs
				 }
		   }
    `);

    op.flush({
      data: {
        getUIPublicationFilters: {
			disease_types: [
				"Breast Invasive Carcinoma",
				"Chromophobe Renal Cell Carcinoma",
				"Clear Cell Renal Cell Carcinoma",
				"Colon Adenocarcinoma",
				"Early Onset Gastric Cancer",
				"Glioblastoma",
				"Head and Neck Squamous Cell Carcinoma",
				"Hepatocellular Carcinoma ",
				"Lung Adenocarcinoma",
				"Lung Squamous Cell Carcinoma",
				"Oral Squamous Cell Carcinoma",
				"Ovarian Serous Cystadenocarcinoma",
				"Papillary Renal Cell Carcinoma",
				"Pediatric/AYA Brain Tumors",
				"Rectum Adenocarcinoma",
				"Uterine Corpus Endometrial Carcinoma"
			],
			programs: [
				"Clinical Proteomic Tumor Analysis Consortium",
				"International Cancer Proteogenome Consortium",
				"Pediatric Brain Tumor Atlas - CBTN",
				"Quantitative digital maps of tissue biopsies"
			],
			years: [
				"2021",
				"2020",
				"2019",
				"2017",
				"2016",
				"2015",
				"2014"
			]
		}
	  },
    });

    controller.verify();
  }));

  it("test getFilteredPaginatedPublications", inject(
    [PublicationsService],
    (service: PublicationsService) => {
      service.getFilteredPaginatedPublications(0, 10, { year: "2014" }).subscribe((data) => {
        expect(data["getPaginatedUIPublication"]).toBeDefined();
        expect(data["getPaginatedUIPublication"].uiPublication.length).toBe(1);
        expect(data["getPaginatedUIPublication"].uiPublication[0].pubmed_id).toBe("33577785");
        expect(data["getPaginatedUIPublication"].uiPublication[0].year).toBe("2014");
      });

      const op = controller.expectOne(gql`
        query FilterdPaginatedPublicationsQuery ($offset_value: Int, $limit_value: Int, $year_filter: String!, 
													$disease_type_filter: String!, $program_filter: String!, $pubmedid_filter: String!) {
		getPaginatedUIPublication(offset: $offset_value, limit: $limit_value, year: $year_filter, 
													disease_type: $disease_type_filter, program: $program_filter, pubmed_id: $pubmedid_filter) {
			total
			uiPublication {
				publication_id
				pubmed_id
				doi
				author
				title
				journal
				journal_url
				year
				abstract
				citation
				studies {
					study_id
					pdc_study_id
					submitter_id_name
				}
				disease_types
						supplementary_data
			}
			pagination {
				count
				sort
				from
				page
				total
				pages
				size
			}
		}
	}
      `);

      op.flush({
        data: {
          getPaginatedUIPublication: {
			  uiPublication: {
				  year:2014,
				  studies: [
					{
						pdc_study_id: "PDC000111",
						submitter_id_name: "TCGA Colon Cancer Proteome"
					}
				  ],
				  doi: "10.1038/nature13438",
				  journal: "Nature",
				  journal_url: "https://www.nature.com/articles/nature13438",
				  publication_id: "44e2e0ce-89c7-11e8-bcf1-0a2705229b82",
				  pubmed_id: "25043054",
				  supplementary_data:[
						"TCGA_VU_N95-Normal_VU_N60.idpDB",
						"TCGA_Colorectal_Cancer_proBAM_PSM_genome_mapping_files.tar.gz",
						"TCGA_VU_N95_Custom.idpDB",
						"TCGA_VU_N95.idpDB"
				  ]
			  },
			  total: 1
		  }
        },
      });

      controller.verify();
    }
  ));

});
