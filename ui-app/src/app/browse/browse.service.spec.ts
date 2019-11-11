import { BrowseService } from "./browse.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";
import { TestBed, inject } from "@angular/core/testing";
import gql from "graphql-tag";

describe("BrowseService", () => {
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseService],
      imports: [ApolloTestingModule, HttpClientTestingModule]
    });

    controller = TestBed.get(ApolloTestingController);
  });

  it("should be created", inject([BrowseService], (service: BrowseService) => {
    expect(service).toBeTruthy();
  }));

  it("test getDiseases", inject([BrowseService], (service: BrowseService) => {
    service.getDiseases().subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiExperimentPie"].length).toBe(1);
      expect(data["uiExperimentPie"][0].disease_type).toBe("Breast Invasive Carcinoma");
      expect(data["uiExperimentPie"][0].cases_count).toBe(116);
    });

    const op = controller.expectOne(gql`
      query allDiseases {
        uiExperimentPie {
          disease_type
          cases_count
        }
      }
    `);

    op.flush({
      data: {
        uiExperimentPie: [
          {
            disease_type: "Breast Invasive Carcinoma",
            cases_count: 116
          }
        ]
      }
    });

    controller.verify();
  }));

  it("test getFilteredDiseases", inject([BrowseService], (service: BrowseService) => {
    service.getFilteredDiseases({ program_name: "" }).subscribe(data => {
      expect(data).toBeDefined();
      expect(data["uiExperimentPie"].length).toBe(1);
      expect(data["uiExperimentPie"][0].disease_type).toBe("Breast Invasive Carcinoma");
      expect(data["uiExperimentPie"][0].cases_count).toBe(116);
    });

    const op = controller.expectOne(gql`
      query ExperimentsTypes(
        $program_name_filter: String!
        $project_name_filter: String!
        $study_name_filter: String!
        $disease_filter: String!
        $filterValue: String!
        $analytical_frac_filter: String!
        $exp_type_filter: String!
        $acquisition_type_filter: String!
      ) {
        uiExperimentPie(
          program_name: $program_name_filter
          project_name: $project_name_filter
          study_name: $study_name_filter
          disease_type: $disease_filter
          primary_site: $filterValue
          analytical_fraction: $analytical_frac_filter
          experiment_type: $exp_type_filter
          acquisition_type: $acquisition_type_filter
        ) {
          disease_type
          cases_count
        }
      }
    `);

    op.flush({
      data: {
        uiExperimentPie: [
          {
            disease_type: "Breast Invasive Carcinoma",
            cases_count: 116
          }
        ]
      }
    });

    controller.verify();
  }));

  it("test getExperimentTypeCasesCount", inject(
    [BrowseService],
    (service: BrowseService) => {
      service.getExperimentTypeCasesCount().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiExperimentBar"].length).toBe(3);
        expect(data["uiExperimentBar"][0].experiment_type).toBe("iTRAQ4");
        expect(data["uiExperimentBar"][0].cases_count).toBe(284);
      });

      const op = controller.expectOne(gql`
        query ExperimentsTypes {
          uiExperimentBar {
            experiment_type
            cases_count
          }
        }
      `);

      op.flush({
        data: {
          uiExperimentBar: [
            {
              experiment_type: "iTRAQ4",
              cases_count: 284
            },
            {
              experiment_type: "Label Free",
              cases_count: 199
            },
            {
              experiment_type: "TMT10",
              cases_count: 695
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getAnalyticFractionTypeCasesCount", inject(
    [BrowseService],
    (service: BrowseService) => {
      service.getAnalyticFractionTypeCasesCount().subscribe(data => {
        expect(data).toBeDefined();
        expect(data["uiAnalyticalFractionsCount"].length).toBe(3);
        expect(data["uiAnalyticalFractionsCount"][0].analytical_fraction).toBe(
          "Glycoproteome"
        );
        expect(data["uiAnalyticalFractionsCount"][0].cases_count).toBe(6);
      });

      const op = controller.expectOne(gql`
        query AnalyticFractionTypes {
          uiAnalyticalFractionsCount {
            analytical_fraction
            cases_count
          }
        }
      `);

      op.flush({
        data: {
          uiAnalyticalFractionsCount: [
            {
              analytical_fraction: "Glycoproteome",
              cases_count: 6
            },
            {
              analytical_fraction: "Phosphoproteome",
              cases_count: 63
            },
            {
              analytical_fraction: "Proteome",
              cases_count: 68
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredAnalyticFractionTypeCasesCount", inject(
    [BrowseService],
    (service: BrowseService) => {
      service
        .getFilteredAnalyticFractionTypeCasesCount({ program_name: "" })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiAnalyticalFractionsCount"].length).toBe(2);
          expect(data["uiAnalyticalFractionsCount"][0].analytical_fraction).toBe(
            "Phosphoproteome"
          );
          expect(data["uiAnalyticalFractionsCount"][0].cases_count).toBe(103);
        });

      const op = controller.expectOne(gql`
        query AnalyticFractionTypes(
          $program_name_filter: String!
          $project_name_filter: String!
          $study_name_filter: String!
          $disease_filter: String!
          $filterValue: String!
          $analytical_frac_filter: String!
          $exp_type_filter: String!
          $acquisition_type_filter: String!
        ) {
          uiAnalyticalFractionsCount(
            program_name: $program_name_filter
            project_name: $project_name_filter
            study_name: $study_name_filter
            disease_type: $disease_filter
            primary_site: $filterValue
            analytical_fraction: $analytical_frac_filter
            experiment_type: $exp_type_filter
            acquisition_type: $acquisition_type_filter
          ) {
            analytical_fraction
            cases_count
          }
        }
      `);

      op.flush({
        data: {
          uiAnalyticalFractionsCount: [
            {
              analytical_fraction: "Phosphoproteome",
              cases_count: 103
            },
            {
              analytical_fraction: "Proteome",
              cases_count: 103
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test getFilteredExperimentTypeCasesCount", inject(
    [BrowseService],
    (service: BrowseService) => {
      service
        .getFilteredExperimentTypeCasesCount({ program_name: "" })
        .subscribe(data => {
          expect(data).toBeDefined();
          expect(data["uiExperimentBar"].length).toBe(3);
          expect(data["uiExperimentBar"][0].experiment_type).toBe(
            "iTRAQ4"
          );
          expect(data["uiExperimentBar"][0].cases_count).toBe(284);
        });

      const op = controller.expectOne(gql`
        query ExperimentsTypes(
          $program_name_filter: String!
          $project_name_filter: String!
          $study_name_filter: String!
          $disease_filter: String!
          $filterValue: String!
          $analytical_frac_filter: String!
          $exp_type_filter: String!
          $acquisition_type_filter: String!
        ) {
          uiExperimentBar(
            program_name: $program_name_filter
            project_name: $project_name_filter
            study_name: $study_name_filter
            disease_type: $disease_filter
            primary_site: $filterValue
            analytical_fraction: $analytical_frac_filter
            experiment_type: $exp_type_filter
            acquisition_type: $acquisition_type_filter
          ) {
            experiment_type
            cases_count
          }
        }
      `);

      op.flush({
        data: {
          uiExperimentBar: [
            {
              experiment_type: "iTRAQ4",
              cases_count: 284
            },
            {
              experiment_type: "Label Free",
              cases_count: 190
            },
            {
              experiment_type: "TMT10",
              cases_count: 695
            }
          ]
        }
      });

      controller.verify();
    }
  ));

  it("test notifyChangeTabEvents", inject([BrowseService], (service: BrowseService) => {
    expect(service).toBeTruthy();
    service.notifyChangeTabEvents(false);
    service.notifyChangeTabEvents(true);
  }));

});
