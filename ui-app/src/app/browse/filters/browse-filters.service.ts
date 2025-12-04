import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
//import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {HttpHeaders} from '@angular/common/http';


import {Apollo} from 'apollo-angular';
import {map} from 'rxjs/operators';
import gql from 'graphql-tag';

import {
  AllStudiesData,
  QueryAllStudiesData,
  QueryAllFiltersData,
  SearchResultsGenesProteins,
  QueryPrograms,
  dataCategory2FileTypeMapping,
  GeneStudyCount, QueryReleaseVersionData, QueryProgramNameData
} from '../../types';

/*This is a service class used for the API queries */

@Injectable()
export class BrowseFiltersService {

  headers: HttpHeaders;
  options: {};

//constructor(private http: Http, private apollo: Apollo) {
  constructor(private apollo: Apollo) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'q=0.8;application/json;q=0.9'
    });
    this.options = {headers: this.headers};
  }

  getAllData() {
    return this.apollo.watchQuery<QueryAllStudiesData>({
      query: gql`
				query CasesData{
					uiStudy {
					submitter_id_name
					program_name
					project_name
					disease_type
					primary_site
					analytical_fraction
					experiment_type
					num_raw
					num_mzml
					num_prot
					num_prot_assem
					num_psm
					}
				}`
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  geneStudyData = gql`
	query GeneStudyData($gene_name: String!){
		uiGeneStudySpectralCount(gene_name: $gene_name) {
			study_submitter_id
			submitter_id_name
		}
	}
	`;

  getStudyByGeneName(geneName: string) {
    return this.apollo.watchQuery({
      query: this.geneStudyData,
      variables: {
        gene_name: geneName
      }
    })
      .valueChanges
      .pipe(
        map(result => {
          return result.data;
        })
      );
  }

  //@@@PDC-616 Add acquisition type to the general filters
  getAllFiltersData() {
    return this.apollo.watchQuery<QueryAllFiltersData>({
      query: gql`
				query FiltersData {
					uiFilters{
						project_name {
							filterName
							filterValue
						}
						primary_site {
							filterName
							filterValue
						}
						program_name {
							filterName
							filterValue
						}
						disease_type {
							filterName
							filterValue
						}
						analytical_fraction {
							filterName
							filterValue
						}
						experiment_type {
							filterName
							filterValue
						}
						acquisition_type {
							filterName
							filterValue
						}
						submitter_id_name {
							filterName
							filterValue
						}
						sample_type {
							filterName
							filterValue
						}
						ethnicity {
							filterName
							filterValue
						}
						race {
							filterName
							filterValue
						}
						gender {
							filterName
							filterValue
						}
						tumor_grade {
							filterName
							filterValue
						}
						data_category {
							filterName
							filterValue
						}
						vital_status {
							filterName
							filterValue
						}
						age_at_diagnosis {
							filterName
							filterValue
						}
						ajcc_clinical_stage {
							filterName
							filterValue
						}
						ajcc_pathologic_stage {
							filterName
							filterValue
						}
						morphology {
							filterName
							filterValue
						}
						site_of_resection_or_biopsy {
							filterName
							filterValue
						}
						progression_or_recurrence {
							filterName
							filterValue
						}
						therapeutic_agents {
							filterName
							filterValue
						}
						treatment_intent_type {
							filterName
							filterValue
						}
						treatment_outcome {
							filterName
							filterValue
						}
						treatment_type {
							filterName
							filterValue
						}
						alcohol_history {
							filterName
							filterValue
						}
						alcohol_intensity {
							filterName
							filterValue
						}
						tobacco_smoking_status {
							filterName
							filterValue
						}
						cigarettes_per_day {
							filterName
							filterValue
						}
						case_status {
							filterName
							filterValue
						}
					}
				}`,
      context: {
        method: 'POST'
      }
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  programNamesQuery = gql`
        query uiProgramNames {
            uiProgram {
                shortname
                fullname
            }
        } `;

  getProgramNamesData() {
    return this.apollo.watchQuery<QueryProgramNameData>({
      query: this.programNamesQuery
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-8588 add alias
  GeneQuery = gql`
			query GeneSearchQuery($gene_name: String!){
					geneSearch(name: $gene_name){
						genes {
							gene_id
							record_type
							name
							description
							ncbi_gene_id
							alias
						}
					}
			}`;

  getGeneSearchResults(gene_param: any) {
    return this.apollo.watchQuery<SearchResultsGenesProteins>({
      query: this.GeneQuery,
      variables: {
        gene_name: gene_param,
      }
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }


  GeneStudyCountQuery = gql`
		query GeneStudyCountQuery($gene_name: String!){
			geneStudyCount(gene_name: $gene_name)
		}`;

  //@@@PDC-7786: UI change to report error for genes not used in studies
  getGeneStudyCountResults(gene_name: any) {
    return this.apollo.watchQuery<GeneStudyCount>({
      query: this.GeneStudyCountQuery,
      variables: {
        gene_name: gene_name,
      }
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  getStudyUUID2NameMapping() {
    //@@@PDC-1123 call ui wrapper API
    //@@@PDC-3778 add pdc_study_id filter URL filter option
    return this.apollo.watchQuery<QueryPrograms>({
      query: gql`
				query StudyNameUUIDMapping {
					uiProgramsProjectsStudies {
					  program_id
					  program_submitter_id
					  name
					  sponsor
					  start_date
					  end_date
					  program_manager
					  projects {
						project_id
						project_submitter_id
						name
						studies {
							study_id
							pdc_study_id
							submitter_id_name
							study_submitter_id
							analytical_fraction
							experiment_type
							acquisition_type
						}
					  }
					}
				}`
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  filteredFiltersDataQuery = gql`
		query FiltersData($program_name_filter: String!,
		$project_name_filter: String!,
		$study_name_filter: String!,
		$disease_filter: String!,
		$filterValue: String!,
		$analytical_frac_filter: String!,
		$exp_type_filter: String!,
		$ethnicity_filter: String!,
		$race_filter: String!,
		$gender_filter: String!,
		$morphology_filter: String!,
		$site_of_resection_or_biopsy_filter: String!,
		$tumor_grade_filter: String!,
		$sample_type_filter: String!,
		$acquisition_type_filter: String!,
		$data_category_filter: String!,
		$vital_status_filter: String!,
		$age_at_diagnosis_filter: String!,
		$ajcc_clinical_stage_filter: String!,
		$ajcc_pathologic_stage_filter: String!,
		$progression_or_recurrence_filter: String!,
		$therapeutic_agents_filter: String!,
		$treatment_intent_type_filter: String!,
		$treatment_outcome_filter: String!,
		$treatment_type_filter: String!,
		$alcohol_history_filter: String!,
		$alcohol_intensity_filter: String!,
		$tobacco_smoking_status_filter: String!,
		$cigarettes_per_day_filter: String!,
		$case_status_filter: String!){
			uiFilters(program_name: $program_name_filter,
			project_name: $project_name_filter,
			study_name: $study_name_filter,
			disease_type: $disease_filter,
			primary_site: $filterValue,
			analytical_fraction: $analytical_frac_filter,
			experiment_type: $exp_type_filter,
			ethnicity: $ethnicity_filter,
			race: $race_filter,
			gender: $gender_filter,
			morphology: $morphology_filter,
			site_of_resection_or_biopsy: $site_of_resection_or_biopsy_filter
			tumor_grade: $tumor_grade_filter,
			data_category: $data_category_filter,
			sample_type: $sample_type_filter,
			acquisition_type: $acquisition_type_filter,
			vital_status: $vital_status_filter,
			age_at_diagnosis: $age_at_diagnosis_filter,
			ajcc_clinical_stage: $ajcc_clinical_stage_filter,
			ajcc_pathologic_stage: $ajcc_pathologic_stage_filter,
			progression_or_recurrence: $progression_or_recurrence_filter,
			therapeutic_agents: $therapeutic_agents_filter,
			treatment_intent_type: $treatment_intent_type_filter,
			treatment_type: $treatment_type_filter,
			treatment_outcome: $treatment_outcome_filter,
			alcohol_history: $alcohol_history_filter,
			alcohol_intensity: $alcohol_intensity_filter,
			tobacco_smoking_status: $tobacco_smoking_status_filter,
			cigarettes_per_day: $cigarettes_per_day_filter,
			case_status: $case_status_filter) {
				project_name {
					filterName
					filterValue
				}
				primary_site {
					filterName
					filterValue
				}
				program_name {
					filterName
					filterValue
				}
				disease_type {
					filterName
					filterValue
				}
				analytical_fraction {
					filterName
					filterValue
				}
				experiment_type {
					filterName
					filterValue
				}
				acquisition_type {
					filterName
					filterValue
				}
				submitter_id_name {
					filterName
					filterValue
				}
				sample_type {
					filterName
					filterValue
				}
				ethnicity {
					filterName
					filterValue
				}
				race {
					filterName
					filterValue
				}
				gender {
					filterName
					filterValue
				}
				tumor_grade {
					filterName
					filterValue
				}
				data_category {
					filterName
					filterValue
				}
				vital_status {
					filterName
					filterValue
				}
				age_at_diagnosis {
					filterName
					filterValue
				}
				ajcc_clinical_stage {
					filterName
					filterValue
				}
				ajcc_pathologic_stage {
					filterName
					filterValue
				}
				morphology {
					filterName
					filterValue
				}
				site_of_resection_or_biopsy {
					filterName
					filterValue
				}
				progression_or_recurrence {
					filterName
					filterValue
				}
				therapeutic_agents {
					filterName
					filterValue
				}
				treatment_intent_type {
					filterName
					filterValue
				}
				treatment_outcome {
					filterName
					filterValue
				}
				treatment_type {
					filterName
					filterValue
				}
				alcohol_history {
					filterName
					filterValue
				}
				alcohol_intensity {
					filterName
					filterValue
				}
				tobacco_smoking_status {
					filterName
					filterValue
				}
				cigarettes_per_day {
					filterName
					filterValue
				}
				case_status {
					filterName
					filterValue
				}
			}
		}
	`;

  getFilteredFiltersDataQuery(filters: any) {
    let filter_ethnicity = filters["ethnicity"];
    if (filter_ethnicity === "Empty value") {
      filter_ethnicity = "";
    }
    let filter_race = filters["race"];
    if (filter_race === "Empty value") {
      filter_race = "";
    }
    return this.apollo.watchQuery<QueryAllFiltersData>({
      query: this.filteredFiltersDataQuery,
      variables: {
        program_name_filter: filters["program_name"],
        project_name_filter: filters["project_name"],
        study_name_filter: filters["study_name"],
        disease_filter: filters["disease_type"],
        filterValue: filters["primary_site"],
        analytical_frac_filter: filters["analytical_fraction"],
        exp_type_filter: filters["experiment_type"],
        ethnicity_filter: filter_ethnicity,
        race_filter: filter_race,
        gender_filter: filters["gender"],
        tumor_grade_filter: filters["tumor_grade"],
        sample_type_filter: filters["sample_type"],
        acquisition_type_filter: filters["acquisition_type"],
        data_category_filter: filters["data_category"] || '',
        vital_status_filter: filters["vital_status"] || '',
        age_at_diagnosis_filter: filters["age_at_diagnosis"] || '',
        ajcc_clinical_stage_filter: filters["ajcc_clinical_stage"] || '',
        ajcc_pathologic_stage_filter: filters["ajcc_pathologic_stage"] || '',
        morphology_filter: filters["morphology"] || '',
        site_of_resection_or_biopsy_filter: filters["site_of_resection_or_biopsy"] || '',
        progression_or_recurrence_filter: filters["progression_or_recurrence"] || '',
        therapeutic_agents_filter: filters["therapeutic_agents"] || '',
        treatment_intent_type_filter: filters["treatment_intent_type"] || '',
        treatment_outcome_filter: filters["treatment_outcome"] || '',
        treatment_type_filter: filters["treatment_type"] || '',
        alcohol_history_filter: filters["alcohol_history"] || '',
        alcohol_intensity_filter: filters["alcohol_intensity"] || '',
        tobacco_smoking_status_filter: filters["tobacco_smoking_status"] || '',
        cigarettes_per_day_filter: filters["cigarettes_per_day"] || '',
        case_status_filter: filters["case_status"] || ''
      },
      context: {
        method: 'POST'
      }
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

  //@@@PDC-3010 Update ui to start using file type to data category mapping APIs
  getDataCategoryToFileTypeMapping() {
    return this.apollo.watchQuery<dataCategory2FileTypeMapping>({
      query: gql`
				query DataCategoryMappingData{
					uiDataCategoryFileTypeMapping
					{
						data_category
						file_type
					}
				} `
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }

}
