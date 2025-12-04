import { LegacyDataService } from "./legacy-data.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";
import gql from "graphql-tag";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("LegacyDataService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ApolloTestingModule],
    providers: [LegacyDataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([LegacyDataService], (service: LegacyDataService) => {
    expect(service).toBeTruthy();
  }));

  it("test getAllLegacyStudies", inject([LegacyDataService], (service: LegacyDataService) => {
    service.getAllLegacyStudies().subscribe((data) => {
      expect(data["uiLegacyStudies"]).toBeDefined();
	  expect(data["uiLegacyStudies"].pdc_study_id).toBe("S013-Proteome");
    });

    const op = controller.expectOne(gql`
      query allLegacyStudies{
				uiLegacyStudies {
					study_id
					submitter_id_name
					study_submitter_id
					pdc_study_id
					study_description
					project_submitter_id
					analytical_fraction
					experiment_type
					sort_order
					embargo_date
					supplementaryFilesCount {
						data_category
						file_type
						files_count
					}
					nonSupplementaryFilesCount{
						data_category
						file_type
						files_count
					}
					publications {
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
					}
				} 
		   }
    `);

    

    controller.verify();
  }));

});
