//@@@PDC-351 modularize schemas
//@@@PDC-372 add case_submitter_id to filter of uiCase
//@@@PDC-380 gene search by proteins
//@@@PDC-471 filePerStudy api enhancement
//@@@PDC-332 get file metadata
//@@@PDC-474 programsProjectsStudies API
//@@@PDC-472 casesSamplesAliquots API
//@@@PDC-475 caseDiagnosesPerStudy API
//@@@PDC-473 caseDemographicsPerStudy API
//@@@PDC-533 additional filters
//@@@PDC-503 quantitiveDataCPTAC2 API
//@@@PDC-486 data matrix API
//@@@PDC-485 spectral count per study/aliquot API
//@@@PDC-566 Add sample_type and acquisition_type filters
//@@@PDC-584 Rework uiStudy to return study name only
//@@@PDC-607 Add uiSunburstChart API
//@@@PDC-581 Add clinical filters
//@@@PDC-652 new protocol structure
//@@@PDC-678 ptm data matrix API
//@@@PDC-681 ui ptm data API
//@@@PDC-191 experimental metadata API
//@@@PDC-737 GeneAliquotSpectralCount supports filters
//@@@PDC-768 clinical metadata API
//@@@PDC-774 add downloadable
//@@@PDC-790 getPaginatedUIGeneStudySpectralCountFiltered allows filters
//@@@PDC-884 fileMetadata API search by UUID 
//@@@PDC-894, 936 add status filters 
//@@@PDC-898 new public APIs--study,filesPerStudy, fileMetadata, protocolPerStudy, clinicalPerStudy, biospecimenPerStudy, studyExperimentalDesign
//@@@PDC-948 add new filters to getPaginatedUICase and getPaginatedUIClinical
//@@@PDC-954 get case uuid
//@@@PDC-964 async api for data matrix
//@@@PDC-1019 limit num of records returned in data matrix
//@@@PDC-1123 add ui wrappers public APIs
//@@@PDC-1122 add signed url to filesPerStudy
//@@@PDC-1220 add uiPrimarySiteCaseCount
//@@@PDC-1383 convert labels to aliquot_id 
//@@@PDC-1371 add case_id parameter to case-related APIs 
//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id 
//@@@PDC-1355 add uuid parameter to ui APIs
//@@@PDC-1430 add uuid parameter to program API
//@@@PDC-1491 add dataMatrixFromFile API

import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { resolvers as queryResolvers } from './resolvers/queries';
import { resolvers as subResolvers } from './resolvers/subqueries';
import _ from 'lodash';
import Aliquot from './schemas/aliquot';
import AliquotRunMetadata from './schemas/aliquotRunMetadata';
import Case from './schemas/case';
import PublicCase from './schemas/publicCase';
import Date from './schemas/date';
import Demographic from './schemas/demographic';
import Diagnosis from './schemas/diagnosis';
import Experiment from './schemas/experiment';
import ExperimentProjects from './schemas/experimentProjects';
import File from './schemas/file';
import FilePerStudy from './schemas/filePerStudy';
import FileMetadata from './schemas/fileMetadata';
import Gene from './schemas/gene';
import Paginated from './schemas/paginated';
import Pagination from './schemas/pagination';
import PdcDataStats from './schemas/pdcDataStats';
import Program from './schemas/program';
import Project from './schemas/project';
import Protocol from './schemas/protocol';
import Publication from './schemas/publication';
import QuantitiveData from './schemas/quantitiveData';
import Sample from './schemas/sample';
import SearchRecord from './schemas/searchRecord';
import SearchStudyRecord from './schemas/searchStudyRecord';
import SearchCaseRecord from './schemas/searchCaseRecord';
import SearchAliquotRecord from './schemas/searchAliquotRecord';
import SpectralCount from './schemas/spectralCount';
import Study from './schemas/study';
import StudyRunMetadata from './schemas/studyRunMetadata';
import UICase from './schemas/uiCase';
import UIClinical from './schemas/uiClinical';
import Clinical from './schemas/clinical';
import UIExperimentType from './schemas/uiExperimentType';
import UIFile from './schemas/uiFile';
import UIFileCount from './schemas/uiFileCount';
import UIGeneStudySpectralCount from './schemas/uiGeneStudySpectralCount';
import UIStudy from './schemas/uiStudy';
import UIFilter from './schemas/uiFilter';
import WorkflowMetadata from './schemas/workflowMetadata';
import UIGene from './schemas/uiGene';
import UISunburst from './schemas/uiSunburst';
import UIPtm from './schemas/uiPtm';
import ExperimentalMetadata from './schemas/experimentalMetadata';
import ClinicalMetadata from './schemas/clinicalMetadata';
import CasePerFile from './schemas/casePerFile';
import Biospecimen from './schemas/biospecimen';
import StudyExperimentalDesign from './schemas/studyExperimentalDesign';
import SignedUrl from './schemas/signedUrl';


const Query = `
type Query {
  quantDataMatrix(study_submitter_id: String!, data_type: String!, attempt: Int, numOfAliquot: Int, numOfGene: Int): [[String]]	
  quantDataMatrixDb(study_submitter_id: String!, data_type: String!, attempt: Int!, numOfAliquot: Int, numOfGene: Int): [[String]]	
  studyExperimentalDesign(study_id: String, study_submitter_id: String, label_aliquot_id: String): [StudyExperimentalDesign]
  biospecimenPerStudy(study_id: String, study_submitter_id: String): [Biospecimen]
  clinicalPerStudy(study_id: String, study_submitter_id: String): [Clinical]
  protocolPerStudy(study_id: String, study_submitter_id: String): [Protocol]
  study(study_id: String, study_submitter_id: String): [Study]
  sample(sample_id: String, sample_submitter_id: String): [Sample]
  aliquot(aliquot_id: String, aliquot_submitter_id: String): [Aliquot]
  clinicalMetadata(study_submitter_id: String): [ClinicalMetadata]	
  getPaginatedUIGeneStudySpectralCountFiltered(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, sample_type: String, acquisition_type: String, gene_name: String!, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedUIGeneAliquotSpectralCountFiltered(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, sample_type: String, acquisition_type: String, gene_name: String!, sort: String, offset: Int, limit: Int): Paginated
  experimentalMetadata(study_submitter_id: String!): [ExperimentalMetadata]
  getPaginatedUIPtm(gene_name: String!, offset: Int, limit: Int): Paginated
  paginatedPtmDataMatrix(study_submitter_id: String!, offset: Int, limit: Int): Paginated	
  uiSunburstChart: [UISunburst]
  paginatedSpectralCountPerStudyAliquot(study_submitter_id: String, plex_name: String, gene_name: String, offset: Int, limit: Int): Paginated	
  paginatedDataMatrix(study_submitter_id: String!, data_type: String!, offset: Int, limit: Int): Paginated	
  quantitiveDataCPTAC2 (study_submitter_id: String experiment_type: String): [QuantitiveData]	
  uiFilters(file_type: String, access: String, biospecimen_status: String, case_status: String, program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, downloadable: String, sample_type: String, acquisition_type: String): UIFilter	
  paginatedCaseDiagnosesPerStudy(study_id: String, study_name: String,study_submitter_id: String, offset: Int, limit: Int): Paginated	
  paginatedCaseDemographicsPerStudy(study_id: String, study_name: String,study_submitter_id: String, offset: Int, limit: Int): Paginated	
  programsProjectsStudies(disease_type: String, instrument_model: String, analytical_fraction: String, experiment_type: String): [Program]
  uiProgramsProjectsStudies(disease_type: String, instrument_model: String, analytical_fraction: String, experiment_type: String): [Program]
  paginatedCasesSamplesAliquots(program_name: String, project_name: String, study_name: String, program_submitter_id: String, project_submitter_id: String, study_submitter_id: String, offset: Int, limit: Int): Paginated
  fileMetadata(file_id: String, file_name: String, file_submitter_id: String, data_category: String, file_type: String, file_format: String, offset: Int, limit: Int): [FileMetadata]
  uiFileMetadata(file_id: String, file_name: String, file_submitter_id: String, data_category: String, file_type: String, file_format: String, offset: Int, limit: Int): [FileMetadata]
  getPaginatedUIStudy(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedUIClinical(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, case_status: String, biospecimen_status: String, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedUIFile(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String, site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedUICase(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedUIGene(gene_name: String, program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String, sort: String, offset: Int, limit: Int): Paginated
  getPaginatedFiles(study_submitter_id: String, file_type: String, file_name: String, offset: Int, limit: Int): Paginated
  getPaginatedCases(offset: Int, limit: Int): Paginated
  case(case_submitter_id: String, case_id: String): Case
  uiCaseSummary(case_submitter_id: String, case_id: String): Case
  casePerFile(file_id: String!): [CasePerFile] 
  uiCasePerFile(file_id: String!): [CasePerFile] 
  allCases: [PublicCase]
  program(program_submitter_id: String, program_id: String): Program
  allPrograms: [Program]
  uiAllPrograms: [Program]
  geneSpectralCount(gene_name: String!): Gene
  uiGeneSpectralCount(gene_name: String!): Gene
  aliquotSpectralCount(gene_name: String!, dataset_alias: String!): Gene
  protein(protein: String!): Gene
  uiProtein(protein: String!): Gene
  tissueSitesAvailable(tissue_or_organ_of_origin: String, project_submitter_id: String ): [Diagnosis]
  uiTissueSitesAvailable(tissue_or_organ_of_origin: String, project_submitter_id: String ): [Diagnosis]
  diseasesAvailable(disease_type: String, tissue_or_organ_of_origin: String, project_submitter_id: String): [Diagnosis]
  uiDiseasesAvailable(disease_type: String, tissue_or_organ_of_origin: String, project_submitter_id: String): [Diagnosis]
  allExperimentTypes(experiment_type: String, tissue_or_organ_of_origin: String, disease_type: String): [Experiment]
  diseaseTypesPerProject(project_submitter_id: String): [Study]
  projectsPerExperimentType(experiment_type: String): [ExperimentProjects] 
  filesCountPerStudy(study_submitter_id: String, study_id: String, file_type: String): [File]
  uiFilesCountPerStudy(study_submitter_id: String, study_id: String, file_type: String): [File]
  filesPerStudy(study_id: String,study_submitter_id: String, file_type: String, file_name: String, data_category: String, file_format: String ): [FilePerStudy]
  projectsPerInstrument(instrument: String): [Protocol] 
  uiProtocol(study_id: String, study_submitter_id: String): [Protocol] 
  pdcDataStats: [PdcDataStats]
  uiPdcDataStats: [PdcDataStats]
  workflowMetadata(workflow_metadata_submitter_id: String, study_submitter_id: String, study_id: String): [WorkflowMetadata]
  uiWorkflowMetadata(workflow_metadata_submitter_id: String, study_submitter_id: String, study_id: String): [WorkflowMetadata]
  uiStudy(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String,  site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, downloadable: String, sample_type: String, acquisition_type: String): [UIStudy]
  uiCase(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, case_submitter_id: String, case_id: String): [UICase]
  uiFile(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String): [UIFile]
  uiTissueSiteCaseCount: [Diagnosis]
  uiPrimarySiteCaseCount: [UIExperimentType]
  uiAnalyticalFractionsCount(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String, site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String): [UIExperimentType]
  uiExperimentBar(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String, site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String): [UIExperimentType]
  uiExperimentPie(program_name: String, project_name: String, study_name: String, disease_type: String, primary_site: String, analytical_fraction: String, experiment_type: String, study_submitter_id: String, ethnicity: String, race: String, gender: String, morphology: String, primary_diagnosis: String, site_of_resection_or_biopsy: String, tissue_or_organ_of_origin: String, tumor_grade: String, tumor_stage: String, data_category: String, file_type: String, downloadable: String, access: String, sample_type: String, acquisition_type: String, gene_name: String, biospecimen_status: String, case_status: String): [UIExperimentType]
  uiPublication(study_submitter_id: String, study_id: String): [Publication]
  uiExperimentFileCount(case_submitter_id: String, case_id: String): [UIFileCount]
  uiDataCategoryFileCount(case_submitter_id: String, case_id: String): [UIFileCount]
  uiGeneStudySpectralCount(gene_name: String!): [UIGeneStudySpectralCount]
  uiGeneAliquotSpectralCount(gene_name: String!): [UIGeneStudySpectralCount]
  getPaginatedUIGeneStudySpectralCount(gene_name: String!, offset: Int, limit: Int): Paginated
  getPaginatedUIGeneAliquotSpectralCount(gene_name: String!, offset: Int, limit: Int): Paginated
  caseSearch(name: String! offset: Int, limit: Int): Paginated
  geneSearch(name: String! offset: Int, limit: Int): Paginated
  studySearch(name: String! offset: Int, limit: Int): Paginated
  aliquotSearch(name: String! offset: Int, limit: Int): Paginated
  proteinSearch(name: String! offset: Int, limit: Int): Paginated
}`
;


const resolvers = _.merge(queryResolvers, subResolvers);
const schema = makeExecutableSchema({ typeDefs: [Query, FileMetadata, Study, Date, Paginated, Biospecimen, Case, CasePerFile, PublicCase, Clinical, Program, Gene, Diagnosis, Experiment, ExperimentProjects, File, FilePerStudy, PdcDataStats, Protocol, QuantitiveData, WorkflowMetadata, UIStudy, UIFilter, UIFile, UICase, UIClinical, UIGene, UIGeneStudySpectralCount, UIExperimentType, UIFileCount, UISunburst, UIPtm, Publication, SearchRecord, SearchStudyRecord, SearchCaseRecord, SearchAliquotRecord, Pagination, StudyRunMetadata, StudyExperimentalDesign, Project, Demographic, Sample, Aliquot, AliquotRunMetadata, SpectralCount, ExperimentalMetadata, ClinicalMetadata, SignedUrl], resolvers });

export default schema;
