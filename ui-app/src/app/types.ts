//This page provides types definitions for qraphql queries

// @@@PDC-210

export type PortalStats = {
	program: number;
	protein: number;
	project: number;
	peptide: number;
	data_size: number;
	data_label: string;
	data_file: number;
	study: number;
	spectra: number;
};
export type QueryPortalStats = {
	pdcPortalStats: PortalStats[];
};

export type TissueSite = {
  project_submitter_id: string;
  tissue_or_organ_of_origin: string;
  cases_count: number;
}

export type QueryTissueSites = {
	tissueSitesAvailable: TissueSite[];

}

export type Disease = {
	disease_type: string;
    tissue_or_organ_of_origin: string;
	project_submitter_id: string;
	cases_count: number;
}
//@@@PDC-1123 add ui wrappers public APIs
export type QueryDiseases = {
	uiDiseasesAvailable: Disease[];
}

export type Study = {
	study_id: string;
	submitter_id_name: string;
	study_submitter_id: string;
	analytical_fraction: string;
	experiment_type: string;
	acquisition_type: string;
}

export type Project = {
	project_id: string;
	project_submitter_id: string;
	name: string;
	studies: Study[];
}

export type Program = {
	program_id: string;
	program_submiter_id: string;
    name: string;
    sponsor: string;
    start_date: string;
    end_date: string;
    program_manager: string;
    projects: Project[];
}
//@@@PDC-1123 add ui wrappers public APIs
export type QueryPrograms = {
	uiAllPrograms: Program[];
}

export type Case = {
	case_id: string;
	project_submitter_id: string;
	external_case_id: string;
}

export type QueryCases = {
	allCases: Case[];
}

export type CaseCount = {
	disease_type: string;
    count: number;
}
export type DiseaseType = {
	project_submitter_id: string;
    experiment_type: string;
    analytical_fraction: string;
    cases: CaseCount[];
}

export type DiseaseTypeQuery = {
	diseasesTypes: DiseaseType[];
}

export type ExperimentTypeCount = {
	experiment_type: string;
	count: number;
}

export interface AnalyticFractionCount  {
	analytical_fraction: string;
	count: number;
}

//export type AllCasesData = {
export type AllStudiesData = {
	study_submitter_id: string;
	submitter_id_name: string;
	program_name: string;
	project_name: string;
	disease_type: string;
	primary_site: string;
	analytical_fraction: string;
	experiment_type: string;
	cases_count: number;
	aliquots_count: number;
	study_description: string;
	embargo_date: string;
	filesCount: FileCountsForStudyPage[];
}

export type FileCountsForStudyPage = {
	file_type: string;
	data_category: string;
	files_count: number
}

//export type QueryAllCasesData = {
export type QueryAllStudiesData = {
	allStudiesData: AllStudiesData[]; 
}

//@@@PDC-535 New filters for browse page
//@@@PDC-567 add sample_type field
export type FilterData = {
	project_name : FilterElement[];
  primary_site : FilterElement[];
  program_name : FilterElement[];
  disease_type : FilterElement[];
  analytical_fraction : FilterElement[];
  experiment_type : FilterElement[];
  acquisition_type : FilterElement[];
  submitter_id_name : FilterElement[];
  sample_type : FilterElement[];
  ethnicity : FilterElement[];
  race : FilterElement[];
  gender : FilterElement[];
  tumor_grade : FilterElement[];
  data_category : FilterElement[];
  file_type : FilterElement[];
  access : FilterElement[];
  downloadable: FilterElement[];
  biospecimen_status: FilterElement[];
  case_status: FilterElement[];
}

export type FilterElement = {
	filterName : string;
	filterValue : string[];
}

export type QueryAllFiltersData = {
	allFiltersData: FilterData[];
}

//@@@PDC-462 show submitter ids
export type AllCasesData = {
	aliquot_submitter_id: string;
	sample_submitter_id: string;
	case_id: string;
	case_submitter_id: string;
	project_name: string;
	program_name: string;
	sample_type: string;
	disease_type: string;
	primary_site: string;
}

export type QueryAllCasesData = {
	allCasesData: AllCasesData[];
}

export type AllFilesData = {
	file_id: string;
	submitter_id_name: string;
	file_name: string;
	study_run_metadata_submitter_id: string;
	project_name: string;
	data_category: string;
	file_type: string;
	access: string;
	file_size: string;
	downloadable: string;
	biospecimen_status: string;
	case_status: string;
}
//@@@PDC-232
//@@@PDC-462 show submitter ids
export type AllClinicalData = {
	case_submitter_id: string;
	external_case_id: string;
	ethnicity: string;
	gender: string;
	race: string;
	morphology: string;
	primary_diagnosis: string;
	site_of_resection_or_biopsy: string;
	tissue_or_organ_of_origin: string;
	tumor_grade: string;
	tumor_stage: string;
}

//@@@PDC-614 add gene data tab to browse page
export type AllGeneData = {
	gene_name: string;
    chromosome: string;
    locus: string;
    num_study: number;
	proteins: string;
}

export type QueryAllGeneDataPaginated = {
	allGenesData: AllGeneData[];
	total: number;
	pagination: Pagination;
}

export type QueryAllFilesData = {
	allFilesData: AllFilesData[];
}
//@@@PDC-379 add submitter_id_name
export type Filter = {
	filterName: string;
	filterCount: number;
}

//@@@PDC-237 - Pagination
export type Pagination = {
	count: number;
	sort: string;
	from: number;
	page: number;
	total: number;
	pages: number;
	size: number;
}

export type QueryAllCasesDataPaginated = {
	total: number;
	allCasesData: AllCasesData[];
	pagination: Pagination;
}

export type QueryAllFilesDataPaginated = {
	total: number;
	allFilesData: AllFilesData[];
	pagination: Pagination;
}
//@@@PDC-232
export type QueryAllClinicalDataPaginated = {
	total: number;
	allFilesData: AllClinicalData[];
	pagination: Pagination;
}

//@@@PDC-283
export type QueryAllStudyDataPaginated = {
	total: number;
	allStudyData: AllStudiesData[];
	pagination: Pagination;
}

//@@@PDC-230
export type WorkflowMetadata = {
	workflow_metadata_submitter_id: string;
	study_submitter_id: string;
	protocol_submitter_id: string;
	cptac_study_id: string;
	submitter_id_name: string;
	study_submitter_name: string;
	analytical_fraction: string;
	experiment_type: string;
	instrument: string;
	refseq_database_version: string;
	uniport_database_version: string;
	hgnc_version: string;
	raw_data_processing: string;
	raw_data_conversion: string;
	sequence_database_search: string;
	search_database_parameters: string;
	phosphosite_localization: string;
	ms1_data_analysis: string;
	psm_report_generation: string;
	cptac_dcc_mzidentml: string;
	mzidentml_refseq: string;
	mzidentml_uniprot: string;
	gene_to_prot: string;
	cptac_galaxy_workflows: string;
	cptac_galaxy_tools: string;
	cdap_reports: string;
	cptac_dcc_tools: string;
}

//@@@PDC-674 - UI changes to accomodate new protocol structure
export type ProtocolData = {
	protocol_id: string;
	protocol_submitter_id: string;
	program_id: string;
	program_submitter_id: string;
	protocol_name: string;
	protocol_date: string;
	document_name: string;
	quantitation_strategy: string;
	experiment_type: string;
	label_free_quantitation: string;
	labeled_quantitation: string;
	isobaric_labeling_reagent: string;
	reporter_ion_ms_level: string;
	starting_amount: string;
	starting_amount_uom: string;
	digestion_reagent: string;
	alkylation_reagent: string;
	enrichment_strategy: string;
	enrichment: string;
	chromatography_dimensions_count: string;
	one_d_chromatography_type: string;
	two_d_chromatography_type: string;
	fractions_analyzed_count: string;
	column_type: string;
	amount_on_column: string;
	amount_on_column_uom: string;
	column_length: string;
	column_length_uom: string;
	column_inner_diameter: string;
	column_inner_diameter_uom: string;
	particle_size: string;
	particle_size_uom: string;
	particle_type: string;
	gradient_length: string;
	gradient_length_uom: string;
	instrument_make: string;
	instrument_model: string;
	dissociation_type: string;
	ms1_resolution: string;
	ms2_resolution: string;
	dda_topn: string;
	normalized_collision_energy: string;
	acquistion_type: string;
	dia_multiplexing: string;
	dia_ims: string;
	auxiliary_data: string;
	cud_label: string;
}

export type PublicationData = {
	publication_id: string;
	pubmed_id: string;
	title: string;
}

export type QueryPublicationData = {
	publicationsData: PublicationData[];
}

export type FilesCountsPerStudyData = {
	study_submitter_id: string;
	file_type: string;
	files_count: number;
	data_category:string;
}

//PDC-288 Case Summary page
export type DemographicsData = {
	ethnicity: string;
    gender: string;
    demographic_submitter_id: string;
    race: string;
    cause_of_death: string;
    days_to_birth: string;
    days_to_death: string;
	vital_status: string;
    year_of_birth: string;
    year_of_death: string;
}

export type DiagnosesData = {
	tissue_or_organ_of_origin: string;
    age_at_diagnosis: string;
    primary_diagnosis: string;
    tumor_grade: string;
    tumor_stage: string;
    diagnosis_submitter_id: string;
    classification_of_tumor: string;
    days_to_last_follow_up: string;
    days_to_last_known_disease_status: string;
    days_to_recurrence: string;
    last_known_disease_status: string;
    morphology: string;
    progression_or_recurrence: string;
    site_of_resection_or_biopsy: string;
    vital_status: string;
    days_to_birth: string;
    days_to_death: string;
    prior_malignancy: string;
    ajcc_clinical_m: string;
    ajcc_clinical_n: string;
    ajcc_clinical_stage: string;
    ajcc_clinical_t: string;
    ajcc_pathologic_m: string;
    ajcc_pathologic_n: string;
    ajcc_pathologic_stage: string;
    ajcc_pathologic_t: string;
    ann_arbor_b_symptoms: string;
    ann_arbor_clinical_stage: string;
    ann_arbor_extranodal_involvement: string;
    ann_arbor_pathologic_stage: string;
    best_overall_response: string;
    burkitt_lymphoma_clinical_variant: string;
    cause_of_death: string;
    circumferential_resection_margin: string;
    colon_polyps_history: string;
    days_to_best_overall_response: string;
    days_to_diagnosis: string;
    days_to_hiv_diagnosis: string;
    days_to_new_event: string;
    figo_stage: string;
    hiv_positive: string;
    hpv_positive_type: string;
    hpv_status: string;
    iss_stage: string;
    laterality: string;
    ldh_level_at_diagnosis: string;
    ldh_normal_range_upper: string;
    lymph_nodes_positive: string;
    lymphatic_invasion_present: string;
    method_of_diagnosis: string;
    new_event_anatomic_site: string;
    new_event_type: string;
    overall_survival: string;
    perineural_invasion_present: string;
    prior_treatment: string;
    progression_free_survival: string;
    progression_free_survival_event: string;
    residual_disease: string;
    vascular_invasion_present: string;
    year_of_diagnosis: string;
}

export type AliquotData = {
	aliquot_submitter_id: string;
    aliquot_quantity: string;
    aliquot_volume: string;
    amount: string;
    analyte_type: string;
    concentration: string;
}

export type SampleData = {
	gdc_sample_id: string;
    gdc_project_id: string;
    sample_submitter_id: string;
    sample_type: string;
    biospecimen_anatomic_site: string;
    composition: string;
    current_weight: string;
    days_to_collection: string;
    days_to_sample_procurement: string;
    diagnosis_pathologically_confirmed: string;
    freezing_method: string;
    initial_weight: string;
    Intermediate_dimension: string;
    is_ffpe: string;
    longest_dimension: string;
    method_of_sample_procurement: string;
    oct_embedded: string;
    pathology_report_uuid: string;
    preservation_method: string;
    sample_type_id: string;
    shortest_dimension: string;
    time_between_clamping_and_freezing: string;
    time_between_excision_and_freezing: string;
    tissue_type: string;
    tumor_code: string;
    tumor_code_id: string;
    tumor_descriptor: string;
    aliquots: AliquotData[];
}

export type CaseData = {
	case_id: string;
    case_submitter_id: string;
    project_submitter_id: string;
    disease_type: string;
    external_case_id: string;
    tissue_source_site_code: string;
    days_to_lost_to_followup: string;
    index_date: string;
    lost_to_followup: string;
    primary_site: string;
    demographics: DemographicsData[];
	diagnoses: DiagnosesData[];
	samples: SampleData[];
}

export type ExperimentFileByCaseCount = {
	acquisition_type: string;
	submitter_id_name: string;
	experiment_type: string;
    files_count: number;
}

export type DataCategoryFileByCaseCount = {
	file_type: string;
	files_count: number;
}

export type FileMetadata = {
	file_name: string,
	file_location: string,
	sample_id: string, 
	sample_submitter_id: string,
	acquisition_file_name: string, 
	analyte: string, 
	instrument: string,
	folder_name: string,
	fraction: string,
}

export type FilesMetadata = {
	fileMetadata: FileMetadata[];
}

export type GitHubTagResponse = {
  data: {repository: {refs: {edges: [{node:{name: string}}]}}}
};

export type ChorusUserUpdateResponse = {
  error: boolean;
  data: ChorusUser[];
};

export type ChorusUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userLabMemberships: UserLabMembership[];
};

export type ChorusLabResponse = {
  error: boolean;
  data: ChorusLab[];
};

export type ChorusLab = {
  id: number;
  contactEmail: string;
  institutionUrl: string;
  name: string;
  uploadLimitInGb: number;
};

export type UserLabMembership = {
  id: number;
  lab_id:number;
  user_id:number;
}

//@@@PDC-231
export type SpectralCounts = {
	project_submitter_id: string;
	study_submitter_id: string;
	plex: string;
	spectral_count: number;
	distinct_peptide: string;
	unshared_peptide: string;
}

export type GeneProteinData = {
	gene_name: string;
	NCBI_gene_id: string;
	authority: string;
	description: string;
	organism: string;
	chromosome: string;
	locus: string;
	proteins: string;
	assays: string;
	spectral_counts: SpectralCounts[];
}

export type GeneStudySpectralCountData = {
	submitter_id_name: string;
	experiment_type: string;
	spectral_count: string;
	distinct_peptide: string;
	unshared_peptide: string;
	aliquots_count: string;
	plexes_count: string; 
}

export type GeneStudySpectralCountDataPaginated = {
	total: number;
	studySpectralCounts: GeneStudySpectralCountData[];
	pagination: Pagination;
}

export type GeneAliquotSpectralCountData = {
	aliquot_id: string; 
	plex: string;
	label: string;
	submitter_id_name: string; 
	experiment_type: string;
	spectral_count: string;
	distinct_peptide: string;
	unshared_peptide: string;
	//@@@PDC-557: Add protein abundance data to the Gene Summary screen
	precursor_area: string;
	//@@@PDC-669 gene_abundance table change
	log2_ratio: string;
	unshared_precursor_area: string;
	unshared_log2_ratio: string;
}

export type GeneAliquotSpectralCountDataPaginated = {
	total: number;
	aliquotSpectralCounts: GeneAliquotSpectralCountData[];
	pagination: Pagination;
}

//@@@PDC-357
export type SearchResults = {
	record_type: string; 
	name: string; 
}

export type SearchResultsStudy = {
	record_type: string; 
	name: string; 
	submitter_id_name: string;
}

//@@@PDC-440, PDC-438
export type SearchResultsGenesProteins = {
	record_type: string; 
	name: string;
	description: string; 
}

//@@@PDC-465
export type SearchResultsProteins = {
	record_type: string; 
	name: string;
	description: string; 
	proteins: string;
}


//@@@PDC-371

export type PDCUserCreateResponse = {
  error: boolean;
  data: ChorusUser[];
}

export type PDCUserResponse = {
  login_username: string;
  user_id_type: string;
  name: string;
  user_type: string;
}

export type PDCUserId = {
	type: string;
	data: number[];
}

export type PDCUserData = {
	user_id: PDCUserId;
	login_username: string;
	email: string; //@@@PDC-421 added email field 
	user_id_type: string;
	name: string;
	organization: string;
	user_type: string;
	last_login_date: string;
    create_date: string;
    registered: number;
}

export type LoginUserResponse = {
  error: boolean;
  data: PDCUserData[];
}

export type TableTotalRecordCount = {
	type: string,
	totalRecords: number
}

//@@@PDC-621 sunburst chart
export type SunburstData = {
	project_submitter_id : string;
    tissue_or_organ_of_origin : string;
    disease_type : string;
    sample_type : string;
    cases_count : number;
}

export type QuerySunburstData = {
	allSunburstData: SunburstData[];
}

//@@@PDC-683 - prepopulated genes list
export type GeneNameList = {
	listName: string;
	geneNamesList: string;
}

//@@@PDC-716 - add PTM data to Gene Summary and Gene data tab
export type ptmData = {
	ptm_type: string;
	site: string;
	peptide: string;
}

export type ptmDataPaginated = {
	total: number;
	uiPtm: ptmData[];
	pagination: Pagination;
}

export type HumanbodyImageData = {
	primary_site: string;
	cases_count: number;
}

//@@@PDC-1219 - Add a new experimental design tab on the study summary page
export type QueryStudyExperimentalDesign = {
	studyExperimentalDesignData: StudyExperimentalDesign[];
}

export type StudyExperimentalDesign = {
	study_id: string;
	study_submitter_id: string;
	study_run_metadata_id: string;
	study_run_metadata_submitter_id: string;
	experiment_number: string;
	experiment_type: string;
	plex_dataset_name: string;
	acquisition_type: string;
	number_of_fractions: string;
	analyte: string;
    label_free:string;
    itraq_114: string;
    itraq_115: string;
    itraq_116: string;
    itraq_117: string;
    itraq_118: string;
    itraq_119: string;
    itraq_120: string;
    itraq_121: string;
    tmt_126: string;
    tmt_127n: string;
    tmt_127c: string;
    tmt_128n: string;
    tmt_128c: string;
    tmt_129n: string;
    tmt_129c: string;
    tmt_130c: string;
    tmt_130n: string;
    tmt_131: string;
    tmt_131c: string;
}

export type QueryBiospecimenPerStudy = {
	biospecimenPerStudyData: BiospecimenPerStudy [];
}

export type BiospecimenPerStudy = {
	aliquot_id: string;
	sample_id: string;
	case_id: string;
	aliquot_submitter_id: string;
	sample_submitter_id: string;
	case_submitter_id: string;
	aliquot_is_ref: string;
	aliquot_status: string;
	case_status: string;
	sample_status: string;
	project_name: string;
	sample_type: string;
	disease_type: string;
	primary_site: string;
	pool: string;
	taxon: string;
}