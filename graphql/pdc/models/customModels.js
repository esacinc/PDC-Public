import Sequelize from 'sequelize';
import _ from 'lodash';

//@@@PDC-122
/**
* ModelCase is mapped to the table of case and 
* used in diseaseTypesPerProject query.
*/

//@@@PDC-962 defnie db models after db is initialized asynchronously 
const defineCustomModels = (db) => {

	const ModelCase = db.getSequelize().define('case', {
		case_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		project_submitter_id: { type: Sequelize.INTEGER },
		disease_type: { type: Sequelize.STRING },
		count: { type: Sequelize.INTEGER },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'case'	
	  });
	  //ModelCase.removeAttribute('id');
	  
	  const ModelCaseFile = db.getSequelize().define('dummy', {
		  file_id: { type: Sequelize.STRING },
		  case_id: { type: Sequelize.STRING },
		  case_submitter_id: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelCaseFile.removeAttribute('id');
	  
	  /**
	  * ModelStudy is mapped to the table of study and 
	  * used in diseaseTypesPerProject query.
	  */
	  //@@@PDC-474 programs-projects-studies API
	  const ModelStudy = db.getSequelize().define('study', {
		study_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		study_submitter_id: { type: Sequelize.STRING },
		submitter_id_name: { type: Sequelize.STRING },
		project_submitter_id: { type: Sequelize.STRING },
		acquisition_type: { type: Sequelize.STRING },
		experiment_type: { type: Sequelize.STRING },
		analytical_fraction: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'study'	
	  });
	  ModelStudy.removeAttribute('id');
	  
	  /**
	  * ModelStudyRunMetadata is mapped to the table of study_run_metadata and 
	  * used in experimentalMetadata query.
	  */
	  //@@@PDC-191 experimental metadata API
	  //@@@PDC-1120 StudyRunMetadata table change
	  const ModelStudyRunMetadata = db.getSequelize().define('study_run_metadata', {
		study_run_metadata_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		study_run_metadata_submitter_id: { type: Sequelize.STRING },
		fraction: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'study_run_metadata'	
	  });
	  ModelStudyRunMetadata.removeAttribute('id');
	  /**
	  * ModelAliquotRunMetadata is mapped to the table of aliquot_run_metadata and 
	  * used in experimentalMetadata query.
	  */
	  //@@@PDC-191 experimental metadata API
	  const ModelAliquotRunMetadata = db.getSequelize().define('aliquot_run_metadata', {
		aliquot_run_metadata_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		aliquot_run_metadata_submitter_id: { type: Sequelize.STRING },
		aliquot_submitter_id: { type: Sequelize.STRING },
		fraction: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'aliquot_run_metadata'	
	  });
	  ModelAliquotRunMetadata.removeAttribute('id');
	  
	  const ModelExperimentalMetadata = db.getSequelize().define('dummy', {
		study_submitter_id: { type: Sequelize.STRING },
		experiment_type: { type: Sequelize.STRING },
		analytical_fraction: { type: Sequelize.STRING },
		instrument: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelExperimentalMetadata.removeAttribute('id');
	  
	  
	  ModelCase.hasMany(ModelStudy, {foreignKey: 'project_id', sourceKey: 'project_id'});
	  ModelStudy.hasMany(ModelCase, {foreignKey: 'project_id', sourceKey: 'project_id'});
	  
	  //@@@PDC-123
	  //@@@PDC-154 get disease type instead of primary diagnosis
	  /**
	  * ModelExperiments is a utility model
	  * used in allExperimentTypes query.
	  */
	  const ModelExperiments = db.getSequelize().define('dummy', {
		  experiment_type: { type: Sequelize.STRING },
		  tissue_or_organ_of_origin: { type: Sequelize.STRING },
		  disease_type: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelExperiments.removeAttribute('id');
	  
	  //@@@PDC-133
	  /**
	  * ModelExperimentProjects is a utility model
	  * used in projectsPerExperimentType query.
	  */
	  const ModelExperimentProjects = db.getSequelize().define('dummy', {
		  experiment_type: { type: Sequelize.STRING },
		  project_submitter_id: { type: Sequelize.STRING },
		  name: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelExperimentProjects.removeAttribute('id');
	  
	  //@@@PDC-140 authorization: models of user info
	  /**
	  * ModelUserProject is mapped to the table of user_project
	  * used in authorization.
	  */
	  const ModelUserProject = db.getSequelize().define('user_project', {
		login_username: { type: Sequelize.STRING,
					  primaryKey: true   },
		project_submitter_id: { type: Sequelize.STRING,
					  primaryKey: true },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'user_project'	
	  });
	  
	  /**
	  * ModelUserRole is mapped to the table of user_role
	  * used in authorization.
	  */
	  const ModelUserRole = db.getSequelize().define('user_role', {
		login_username: { type: Sequelize.STRING,
					  primaryKey: true   },
		role_name: { type: Sequelize.STRING,
					  primaryKey: true },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'user_role'	
	  });
	  
	  //@@@PDC-162 file manifest
	  //@@@PDC-774 add downloadable
	  /**
	  * ModelFile is a utility and used in 
	  *   filesCountPerStudy query.
	  */
	  const ModelFile = db.getSequelize().define('dummy', {
		  file_name: { type: Sequelize.STRING },
		  file_type: { type: Sequelize.STRING },
		  data_category : { type: Sequelize.STRING },
		  file_location: { type: Sequelize.STRING },
		  downloadable: { type: Sequelize.STRING },
		  md5sum: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  files_count: { type: Sequelize.INTEGER },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelFile.removeAttribute('id');
	  
	  //@@@PDC-471 filePerStudy api enhancement
	  //@@@PDC-898 new public APIs--filesPerStudy
	  /**
	  * ModelStudyFile is a utility and used in 
	  *   filesPerStudy query.
	  */
	  const ModelStudyFile = db.getSequelize().define('dummy', {
		  file_name: { type: Sequelize.STRING },
		  file_id: { type: Sequelize.STRING },
		  file_submitter_id: { type: Sequelize.STRING },
		  file_type: { type: Sequelize.STRING },
		  file_format: { type: Sequelize.STRING },
		  data_category: { type: Sequelize.STRING },
		  file_location: { type: Sequelize.STRING },
		  downloadable: { type: Sequelize.STRING },
		  md5sum: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_name: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  file_size: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelStudyFile.removeAttribute('id');
	  
	  
	  //@@@PDC-163 project per instrument
	  //@@@PDC-271 API to retrieve protocol data for PDC UI
	  //@@@PDC-652 new protocol structure
	  //@@@PDC-898 new public APIs--protocolPerStudy
	  //@@@PDC-1154 column name correction: fractions_analyzed_count
	  /**
	  * ModelProtocol is a utility and used in 
	  * projectsPerInstrument and uiProtocol queries.
	  */
	  const ModelProtocol = db.getSequelize().define('protocol', {
		  protocol_id: { type: Sequelize.STRING },
		  protocol_submitter_id: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  program_id: { type: Sequelize.STRING },
		  program_submitter_id: { type: Sequelize.STRING },
		  protocol_name: { type: Sequelize.STRING },
		  protocol_date: { type: Sequelize.STRING },
		  document_name: { type: Sequelize.STRING },
		  quantitation_strategy: { type: Sequelize.STRING },
		  experiment_type: { type: Sequelize.STRING },
		  label_free_quantitation: { type: Sequelize.STRING },
		  labeled_quantitation: { type: Sequelize.STRING },
		  isobaric_labeling_reagent: { type: Sequelize.STRING },
		  reporter_ion_ms_level: { type: Sequelize.STRING },
		  starting_amount: { type: Sequelize.STRING },
		  starting_amount_uom: { type: Sequelize.STRING },
		  digestion_reagent: { type: Sequelize.STRING },
		  alkylation_reagent: { type: Sequelize.STRING },
		  enrichment_strategy: { type: Sequelize.STRING },
		  enrichment: { type: Sequelize.STRING },
		  chromatography_dimensions_count: { type: Sequelize.STRING },
		  one_d_chromatography_type: { type: Sequelize.STRING },
		  two_d_chromatography_type: { type: Sequelize.STRING },
		  fractions_analyzed_count: { type: Sequelize.STRING },
		  column_type: { type: Sequelize.STRING },
		  amount_on_column: { type: Sequelize.STRING },
		  amount_on_column_uom: { type: Sequelize.STRING },
		  column_length: { type: Sequelize.STRING },
		  column_length_uom: { type: Sequelize.STRING },
		  column_inner_diameter: { type: Sequelize.STRING },
		  column_inner_diameter_uom: { type: Sequelize.STRING },	
		  particle_size: { type: Sequelize.STRING },
		  particle_size_uom: { type: Sequelize.STRING },
		  particle_type: { type: Sequelize.STRING },
		  gradient_length: { type: Sequelize.STRING },
		  gradient_length_uom: { type: Sequelize.STRING },
		  instrument_make: { type: Sequelize.STRING },
		  instrument_model: { type: Sequelize.STRING },
		  dissociation_type: { type: Sequelize.STRING },
		  ms1_resolution: { type: Sequelize.STRING },
		  ms2_resolution: { type: Sequelize.STRING },
		  dda_topn: { type: Sequelize.STRING },
		  normalized_collision_energy: { type: Sequelize.STRING },
		  acquistion_type: { type: Sequelize.STRING },
		  dia_multiplexing: { type: Sequelize.STRING },
		  dia_ims: { type: Sequelize.STRING },
		  auxiliary_data: { type: Sequelize.STRING },
		  cud_label: { type: Sequelize.STRING },
		  project_submitter_id: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'protocol'	
	  });
	  ModelProtocol.removeAttribute('id');
	  
	  //@@@PDC-218 portal statistics API
	  
	  const ModelPDCDataStatistics = db.getSequelize().define('pdc_data_statistics', {
		  program: { type: Sequelize.INTEGER},
		  study: { type: Sequelize.INTEGER},
		  spectra: { type: Sequelize.INTEGER},
		  protein: { type: Sequelize.INTEGER},
		  project: { type: Sequelize.INTEGER},
		  program: { type: Sequelize.INTEGER},
		  peptide: { type: Sequelize.INTEGER},
		  data_size: { type: Sequelize.INTEGER},
		  data_label:{ type: Sequelize.STRING},
		  data_file: { type: Sequelize.INTEGER}
	  });
	  ModelPDCDataStatistics.removeAttribute('id');
	  
	  //@@@PDC-165 workflow metadata APIs
	  /**
	  * ModelWorkflowMetadata is mapped to the table of workflow_metadata and * used in workflowMetadata and workflowMetadataPerStudy queries.
	  */
	  const ModelWorkflowMetadata = db.getSequelize().define('workflow_metadata', {
		workflow_metadata_submitter_id: { type: Sequelize.STRING},
		study_submitter_id: { type: Sequelize.STRING },
		protocol_submitter_id: { type: Sequelize.STRING },
		cptac_study_id: { type: Sequelize.STRING },
		submitter_id_name: { type: Sequelize.STRING },
		study_submitter_name: { type: Sequelize.STRING },
		analytical_fraction: { type: Sequelize.STRING },
		experiment_type: { type: Sequelize.STRING },
		instrument: { type: Sequelize.STRING },
		refseq_database_version: { type: Sequelize.STRING },
		uniport_database_version: { type: Sequelize.STRING },
		hgnc_version: { type: Sequelize.STRING },
		raw_data_processing: { type: Sequelize.STRING },
		raw_data_conversion: { type: Sequelize.STRING },
		sequence_database_search: { type: Sequelize.STRING },
		search_database_parameters: { type: Sequelize.STRING },
		phosphosite_localization: { type: Sequelize.STRING },
		ms1_data_analysis: { type: Sequelize.STRING },
		psm_report_generation: { type: Sequelize.STRING },
		cptac_dcc_mzidentml: { type: Sequelize.STRING },
		mzidentml_refseq: { type: Sequelize.STRING },
		mzidentml_uniprot: { type: Sequelize.STRING },
		gene_to_prot: { type: Sequelize.STRING },
		cptac_galaxy_workflows: { type: Sequelize.STRING },
		cptac_galaxy_tools: { type: Sequelize.STRING },
		cdap_reports: { type: Sequelize.STRING },
		cptac_dcc_tools: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'workflow_metadata'	
	  });
	  ModelWorkflowMetadata.removeAttribute('id');
	  
	  //@@@PDC-503 quantitiveDataCPTAC2 API
	  //@@@PDC-669 gene_abundance table change
	  /**
	  * ModelQuantitativeData is mapped to the table of gene_abundance and study and 
	  * used in quantitiveDataCPTAC2 query.
	  */
	  const ModelQuantitativeData = db.getSequelize().define('dummy', {
			  gene_abundance_id: { type: Sequelize.STRING},
			  gene_id: { type: Sequelize.STRING},
			  gene_name: { type: Sequelize.STRING},
			  study_id: { type: Sequelize.STRING},
			  study_submitter_id: { type: Sequelize.STRING},
			  study_run_metadata_id: { type: Sequelize.STRING},
			  study_run_metadata_submitter_id: { type: Sequelize.STRING},
			  analytical_fraction:  { type: Sequelize.STRING},
			  experiment_type:  { type: Sequelize.STRING},
			  aliquot_id: { type: Sequelize.STRING},
			  aliquot_submitter_id: { type: Sequelize.STRING},
			  aliquot_run_metadata_id: { type: Sequelize.STRING},
			  //aliquot_run_metadata_submitter_id: { type: Sequelize.STRING},
			  project_id: { type: Sequelize.STRING},
			  project_submitter_id: { type: Sequelize.STRING},
			  aliquot_alias: { type: Sequelize.STRING},
			  log2_ratio: { type: Sequelize.STRING},
			  unshared_log2_ratio: { type: Sequelize.STRING},
			  unshared_precursor_area: { type: Sequelize.STRING},
			  precursor_area: { type: Sequelize.STRING},
			  //log10_unshared_area: { type: Sequelize.STRING},
			  //area: { type: Sequelize.STRING},
			  //log10_area: { type: Sequelize.STRING},
			  //phospho_site: { type: Sequelize.STRING},
			  //log_ratio: { type: Sequelize.STRING},
			  //peptide: { type: Sequelize.STRING},
			  cud_label: { type: Sequelize.STRING},
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelQuantitativeData.removeAttribute('id');
	  
	  //@@@PDC-332 API for file metadata--add more fields
	  /**
	  * ModelFileMetadata is a utility and used in 
	  *   getFileMetadata query.
	  */
	  const ModelFileMetadata = db.getSequelize().define('dummy', {
		  file_name: { type: Sequelize.STRING },
		  file_location: { type: Sequelize.STRING },
		  md5sum: { type: Sequelize.STRING },
		  file_size: { type: Sequelize.STRING },
		  sample_id: { type: Sequelize.STRING }, 
		  sample_submitter_id: { type: Sequelize.STRING },
		  aliquot_id: { type: Sequelize.STRING }, 
		  aliquot_submitter_id: { type: Sequelize.STRING },
		  file_submitter_id: { type: Sequelize.STRING }, 
		  data_category: { type: Sequelize.STRING},
		  file_type: { type: Sequelize.STRING},
		  file_format: { type: Sequelize.STRING},
		  analyte: { type: Sequelize.STRING }, 
		  instrument: { type: Sequelize.STRING },
		  plex_or_dataset_name: { type: Sequelize.STRING },
		  fraction: { type: Sequelize.STRING },
		  experiment_type: { type: Sequelize.STRING },
		  study_run_metadata_id: { type: Sequelize.STRING }, 
		  study_run_metadata_submitter_id: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelFileMetadata.removeAttribute('id');
	  
	  //@@@PDC-287 APIs for name search
	  //@@@PDC-372 add submitter_id_name for study type
	  //@@@PDC-398 Add description to the APIs for search
	  //@@@PDC-468 Add proteins to protein search
	  /**
	  * ModelSearchRecord is a utility and used in 
	  *   caseSearch, geneSearch and studySearch queries.
	  */
	  const ModelSearchRecord = db.getSequelize().define('dummy', {
		  record_type: { type: Sequelize.STRING },
		  name: { type: Sequelize.STRING },
		  submitter_id_name: { type: Sequelize.STRING },
		  description: { type: Sequelize.STRING },
		  proteins: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelSearchRecord.removeAttribute('id');
	  
	  //@@@PDC-486 data matrix API
	  //@@@PDC-562 quant data matrix API
	  //@@@PDC-669 gene_abundance table change
	  //@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
	  //@@@PDC-1018 use aliquot_id instead of aliquot_submitter_id
	  /**
	  * ModelMatrix is a utility and used in 
	  *   dataMatrix query.
	  */
	  const ModelMatrix = db.getSequelize().define('dummy', {
		  study_submitter_id: { type: Sequelize.STRING },
		  plex_name: { type: Sequelize.STRING },
		  gene_name: { type: Sequelize.STRING },
		  spectral_count: { type: Sequelize.STRING },
		  distinct_peptide: { type: Sequelize.STRING },
		  unshared_peptide: { type: Sequelize.STRING },
		  aliquot_submitter_id: { type: Sequelize.STRING },
		  aliquot_id: { type: Sequelize.STRING },
		  aliquot_alias: { type: Sequelize.STRING },
		  precursor_area: { type: Sequelize.STRING },
		  log2_ratio: { type: Sequelize.STRING },
		  unshared_precursor_area: { type: Sequelize.STRING },
		  unshared_log2_ratio: { type: Sequelize.STRING },
		  log_ratio: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelMatrix.removeAttribute('id');
	  
	  /**
	  * ModelSpectralCount is a utility and used in spectral_count per study
	  * and aliquot query
	  */
	  //@@@PDC-485 spectral count per study and aliquot query
	  const ModelSpectralCount = db.getSequelize().define('dummy', {
		study_submitter_id: { type: Sequelize.STRING},
		gene_name: { 	type: Sequelize.STRING},
		aliquot_id: { type: Sequelize.STRING },
		plex: { type: Sequelize.STRING },
		spectral_count: { type: Sequelize.INTEGER },
		distinct_peptide: { type: Sequelize.INTEGER },
		unshared_peptide: { type: Sequelize.INTEGER },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelSpectralCount.removeAttribute('id');
	  
	  //@@@PDC-768 clinical metadata API
	  const ModelClinicalMetadata = db.getSequelize().define('dummy', {
		aliquot_submitter_id: { type: Sequelize.STRING},
		morphology: { 	type: Sequelize.STRING},
		primary_diagnosis: { type: Sequelize.STRING },
		tumor_grade: { type: Sequelize.STRING },
		tumor_stage: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelClinicalMetadata.removeAttribute('id');
	  
	  //@@@PDC-898 new public APIs--study
	  const ModelStudyPublic = db.getSequelize().define('dummy', {
		  study_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  study_submitter_id: { type: Sequelize.STRING },
		  submitter_id_name: { type: Sequelize.STRING },
		  study_name:  { type: Sequelize.STRING},
		  project_submitter_id: { type: Sequelize.STRING },
		  acquisition_type: { type: Sequelize.STRING },
		  program_name:  { type: Sequelize.STRING},
		  project_name:  { type: Sequelize.STRING},
		  program_id:  { type: Sequelize.STRING},
		  project_id:  { type: Sequelize.STRING},
		  disease_type:  { type: Sequelize.STRING},
		  primary_site:  { type: Sequelize.STRING},
		  analytical_fraction:  { type: Sequelize.STRING},
		  experiment_type:  { type: Sequelize.STRING},
		  cases_count:  { type: Sequelize.INTEGER},
		  aliquots_count:  { type: Sequelize.INTEGER},
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelStudyPublic.removeAttribute('id');
	  
	  //@@@PDC-898 new public APIs--studyExperimentalDesign
	  //@@@PDC-1120 StudyRunMetadata table change
	  //@@@PDC-1156 add is_ref
	  const ModelStudyExperimentalDesign = db.getSequelize().define('dummy', {
		  study_run_metadata_id: { type: Sequelize.STRING,
					  primaryKey: true },
		  study_run_metadata_submitter_id: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  aliquot_is_ref: { type: Sequelize.STRING },
		  acquisition_type: { type: Sequelize.STRING },
		  analyte:  { type: Sequelize.STRING},
		  plex_dataset_name:  { type: Sequelize.STRING},
		  experiment_number:  { type: Sequelize.STRING},
		  experiment_type:  { type: Sequelize.STRING},
		  number_of_fractions:  { type: Sequelize.STRING},
		  label_free:  { type: Sequelize.STRING},
		  itraq_114:  { type: Sequelize.STRING},
		  itraq_115:  { type: Sequelize.STRING},
		  itraq_116:  { type: Sequelize.STRING},
		  itraq_117:  { type: Sequelize.STRING},
		  itraq_118:  { type: Sequelize.STRING},
		  itraq_119:  { type: Sequelize.STRING},
		  itraq_120:  { type: Sequelize.STRING},
		  itraq_121:  { type: Sequelize.STRING},
		  tmt_126:  { type: Sequelize.STRING},
		  tmt_127n:  { type: Sequelize.STRING},
		  tmt_127c:  { type: Sequelize.STRING},
		  tmt_128n:  { type: Sequelize.STRING},
		  tmt_128c:  { type: Sequelize.STRING},
		  tmt_129n:  { type: Sequelize.STRING},
		  tmt_129c:  { type: Sequelize.STRING},
		  tmt_130n:  { type: Sequelize.STRING},
		  tmt_130c:  { type: Sequelize.STRING},
		  tmt_131:  { type: Sequelize.STRING},
		  tmt_131c:  { type: Sequelize.STRING},
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelStudyPublic.removeAttribute('id');

	  db['ModelCase'] = ModelCase;
	  db['ModelCaseFile'] = ModelCaseFile;
	  db['ModelStudy'] = ModelStudy;
	  db['ModelExperiments'] = ModelExperiments;
	  db['ModelUserProject'] = ModelUserProject;
	  db['ModelUserRole'] = ModelUserRole;
	  db['ModelExperimentProjects'] = ModelExperimentProjects;
	  db['ModelFile'] = ModelFile;
	  db['ModelStudyFile'] = ModelStudyFile;
	  db['ModelProtocol'] = ModelProtocol;
	  db['ModelWorkflowMetadata'] = ModelWorkflowMetadata;
	  db['ModelQuantitativeData'] = ModelQuantitativeData;
	  db['ModelPDCDataStatistics'] = ModelPDCDataStatistics;
	  db['ModelFileMetadata'] = ModelFileMetadata;
	  db['ModelSearchRecord'] = ModelSearchRecord;
	  db['ModelMatrix'] = ModelMatrix;
	  db['ModelSpectralCount'] = ModelSpectralCount;
	  db['ModelExperimentalMetadata'] = ModelExperimentalMetadata;
	  db['ModelStudyRunMetadata'] = ModelStudyRunMetadata;
	  db['ModelAliquotRunMetadata'] = ModelAliquotRunMetadata;
	  db['ModelClinicalMetadata'] = ModelClinicalMetadata;
	  db['ModelStudyPublic'] = ModelStudyPublic;
	  db['ModelStudyExperimentalDesign'] = ModelStudyExperimentalDesign;  
};

export { defineCustomModels };
