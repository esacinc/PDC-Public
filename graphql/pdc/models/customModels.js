import Sequelize from 'sequelize';
import _ from 'lodash';

//@@@PDC-122
/**
* ModelCase is mapped to the table of case and 
* used in diseaseTypesPerProject query.
*/

//@@@PDC-962 defnie db models after db is initialized asynchronously 
//@@@PDC-1874 add pdc_study_id to all study-related APIs 
const defineCustomModels = (db) => {

	//@@@PDC-1241 fix for latest version of Sequelize
	const ModelCase = db.getSequelize().define('case', {
		case_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		project_submitter_id: { type: Sequelize.INTEGER },
		project_id: { type: Sequelize.STRING },
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
	  //@@@PDC-1241 fix for latest version of Sequelize
	  //@@@PDC-3921 new studyCatalog api
	  //@@@PDC-3966 add more study fields per CDA request
	  const ModelStudy = db.getSequelize().define('study', {
		study_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		study_submitter_id: { type: Sequelize.STRING },
		pdc_study_id: { type: Sequelize.STRING },
		submitter_id_name: { type: Sequelize.STRING },
		study_shortname: { type: Sequelize.STRING },
		study_version: { type: Sequelize.STRING },
		is_latest_version: { type: Sequelize.STRING },
		project_submitter_id: { type: Sequelize.STRING },
		project_id: { type: Sequelize.STRING },
		acquisition_type: { type: Sequelize.STRING },
		experiment_type: { type: Sequelize.STRING },
		analytical_fraction: { type: Sequelize.STRING },
		disease_type: { type: Sequelize.STRING },
		primary_site: { type: Sequelize.STRING },
		study_name: { type: Sequelize.STRING },
		embargo_date: { type: Sequelize.DATE },	  
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
	  //@@@PDC-3668 add aliquot_id to output
	  //@@@PDC-7491 add more aliquot_run_metadata fields
	  const ModelAliquotRunMetadata = db.getSequelize().define('aliquot_run_metadata', {
		aliquot_run_metadata_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		aliquot_submitter_id: { type: Sequelize.STRING },
		aliquot_id: { type: Sequelize.STRING },
		fraction: { type: Sequelize.STRING },
		label: { type: Sequelize.STRING },
		experiment_number: { type: Sequelize.STRING },
		replicate_number: { type: Sequelize.STRING },
		date: { type: Sequelize.STRING },
		alias: { type: Sequelize.STRING },
		analyte: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'aliquot_run_metadata'	
	  });
	  ModelAliquotRunMetadata.removeAttribute('id');
	  
	  //@@@PDC-3668 add study_id to input/output
	  const ModelExperimentalMetadata = db.getSequelize().define('dummy', {
		study_id: { type: Sequelize.STRING },
		study_submitter_id: { type: Sequelize.STRING },
		pdc_study_id: { type: Sequelize.STRING },
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
	  //@@@PDC-7907 add file_id and file_format
	  /**
	  * ModelFile is a utility and used in 
	  *   filesCountPerStudy query.
	  */
	  const ModelFile = db.getSequelize().define('dummy', {
		  file_id: { type: Sequelize.STRING },
		  file_name: { type: Sequelize.STRING },
		  file_type: { type: Sequelize.STRING },
		  data_category : { type: Sequelize.STRING },
		  file_location: { type: Sequelize.STRING },
		  downloadable: { type: Sequelize.STRING },
		  md5sum: { type: Sequelize.STRING },
		  file_format: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  pdc_study_id: { type: Sequelize.STRING },
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
		  pdc_study_id: { type: Sequelize.STRING },
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
	  //@@@PDC-6690 add new columns for metabolomics
	  //@@@PDC-7235 add new columns for metabolomics
	  //@@@PDC-7386 add new columns for metabolomics
	  //@@@PDC-9698 get protocol at srm level
	  /**
	  * ModelProtocol is a utility and used in 
	  * projectsPerInstrument and uiProtocol queries.
	  */
	  const ModelProtocol = db.getSequelize().define('protocol', {
		  protocol_id: { type: Sequelize.STRING },
		  protocol_submitter_id: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  pdc_study_id: { type: Sequelize.STRING },
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
		  instrument: { type: Sequelize.STRING },
		  dissociation_type: { type: Sequelize.STRING },
		  ms1_resolution: { type: Sequelize.STRING },
		  ms2_resolution: { type: Sequelize.STRING },
		  dda_topn: { type: Sequelize.STRING },
		  normalized_collision_energy: { type: Sequelize.STRING },
		  acquistion_type: { type: Sequelize.STRING },
		  dia_multiplexing: { type: Sequelize.STRING },
		  dia_ims: { type: Sequelize.STRING },
		  analytical_technique: { type: Sequelize.STRING },
		  chromatography_instrument_make: { type: Sequelize.STRING },
		  chromatography_instrument_model: { type: Sequelize.STRING },
		  polarity: { type: Sequelize.STRING },
		  reconstitution_solvent: { type: Sequelize.STRING },
		  reconstitution_volume: { type: Sequelize.STRING },
		  reconstitution_volume_uom: { type: Sequelize.STRING },
		  internal_standards: { type: Sequelize.STRING },
		  extraction_method: { type: Sequelize.STRING },
		  ionization_mode: { type: Sequelize.STRING },
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
	  //@@@PDC-3668 add uuids
	  /**
	  * ModelWorkflowMetadata is mapped to the table of workflow_metadata and * used in workflowMetadata and workflowMetadataPerStudy queries.
	  */
	  const ModelWorkflowMetadata = db.getSequelize().define('workflow_metadata', {
		workflow_metadata_id: { type: Sequelize.STRING},
		study_id: { type: Sequelize.STRING },
		protocol_id: { type: Sequelize.STRING },
		workflow_metadata_submitter_id: { type: Sequelize.STRING},
		study_submitter_id: { type: Sequelize.STRING },
		pdc_study_id: { type: Sequelize.STRING },
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
			  pdc_study_id: { type: Sequelize.STRING },
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
	  //@@@PDC-1257 replace fraction with fraction_number	  
	  //@@@PDC-2642 add file_id	
	  //@@@PDC-3668 add study_id
	  //@@@PDC-6708 get pancancer file data
	  //@@@PDC-8988 support multi protocols per study	  
	  /**
	  * ModelFileMetadata is a utility and used in 
	  *   getFileMetadata query.
	  */
	  const ModelFileMetadata = db.getSequelize().define('dummy', {
		  file_id: { type: Sequelize.STRING },
		  file_name: { type: Sequelize.STRING },
		  file_location: { type: Sequelize.STRING },
		  md5sum: { type: Sequelize.STRING },
		  file_size: { type: Sequelize.STRING },
		  downloadable: { type: Sequelize.STRING },
		  sample_id: { type: Sequelize.STRING }, 
		  sample_submitter_id: { type: Sequelize.STRING },
		  aliquot_id: { type: Sequelize.STRING }, 
		  aliquot_submitter_id: { type: Sequelize.STRING },
		  file_submitter_id: { type: Sequelize.STRING }, 
		  data_category: { type: Sequelize.STRING},
		  data_source : { type: Sequelize.STRING },
		  file_type: { type: Sequelize.STRING},
		  file_format: { type: Sequelize.STRING},
		  analyte: { type: Sequelize.STRING }, 
		  instrument: { type: Sequelize.STRING },
		  protocol_submitter_id: { type: Sequelize.STRING },
		  protocol_id: { type: Sequelize.STRING },
		  plex_or_dataset_name: { type: Sequelize.STRING },
		  fraction_number: { type: Sequelize.STRING },
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
	  //@@@PDC-7628 add ncbi_gene_id to the APIs for search
	  //@@@PDC-8588 handle gene with aliases
	  /**
	  * ModelSearchRecord is a utility and used in 
	  *   caseSearch, geneSearch and studySearch queries.
	  */
	  const ModelSearchRecord = db.getSequelize().define('dummy', {
		  record_type: { type: Sequelize.STRING },
		  name: { type: Sequelize.STRING },
		  submitter_id_name: { type: Sequelize.STRING },
		  description: { type: Sequelize.STRING },
		  gene_id: { type: Sequelize.STRING },
		  ncbi_gene_id: { type: Sequelize.STRING },
		  alias: { type: Sequelize.STRING },
		  proteins: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelSearchRecord.removeAttribute('id');


	 //@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	 const ModelSearchStudyRecord = db.getSequelize().define('dummy', {
		record_type: { type: Sequelize.STRING },
		name: { type: Sequelize.STRING },
		submitter_id_name: { type: Sequelize.STRING },
		study_id: {type: Sequelize.STRING},
		study_submitter_id: {type: Sequelize.STRING},
		pdc_study_id: { type: Sequelize.STRING },
		description: { type: Sequelize.STRING },
		proteins: { type: Sequelize.STRING },
	}, {
		timestamps: false,
		underscored: true,
		freezeTableName: true,
		tableName: 'dummy'	
	});
	ModelSearchStudyRecord.removeAttribute('id');

	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	const ModelSearchCaseRecord = db.getSequelize().define('dummy', {
		record_type: { type: Sequelize.STRING },
		name: { type: Sequelize.STRING },
		submitter_id_name: { type: Sequelize.STRING },
		case_id: {type: Sequelize.STRING},
		description: { type: Sequelize.STRING },
		proteins: { type: Sequelize.STRING },
	}, {
		timestamps: false,
		underscored: true,
		freezeTableName: true,
		tableName: 'dummy'	
	});
	ModelSearchCaseRecord.removeAttribute('id');

	//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
	const ModelSearchAliquotRecord = db.getSequelize().define('dummy', {
		aliquot_id: { type: Sequelize.STRING },
		aliquot_submitter_id: { type: Sequelize.STRING }
	}, {
		timestamps: false,
		underscored: true,
		freezeTableName: true,
		tableName: 'dummy'	
	});
	ModelSearchAliquotRecord.removeAttribute('id');
	  
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
		  pdc_study_id: { type: Sequelize.STRING },
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
	  //@@@PDC-3668 add study_id to input/output
	  const ModelSpectralCount = db.getSequelize().define('dummy', {
		study_id: { type: Sequelize.STRING},
		study_submitter_id: { type: Sequelize.STRING},
		pdc_study_id: { type: Sequelize.STRING },
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
	  //@@@PDC-3428 add tumor_largest_dimension_diameter
	  //@@@PDC-3668 add aliquot_id to output
	  //@@@PDC-7491 add new clinical fields
	  const ModelClinicalMetadata = db.getSequelize().define('dummy', {
		aliquot_id: { type: Sequelize.STRING},
		aliquot_submitter_id: { type: Sequelize.STRING},
		morphology: { 	type: Sequelize.STRING},
		primary_diagnosis: { type: Sequelize.STRING },
		tumor_grade: { type: Sequelize.STRING },
		tumor_stage: { type: Sequelize.STRING },
		tumor_largest_dimension_diameter : { type: Sequelize.STRING },
		age_at_diagnosis: { type: Sequelize.STRING },
		classification_of_tumor: { type: Sequelize.STRING },
		site_of_resection_or_biopsy: { type: Sequelize.STRING },
		tissue_or_organ_of_origin: { type: Sequelize.STRING },
		days_to_recurrence: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelClinicalMetadata.removeAttribute('id');
	  
	  //@@@PDC-898 new public APIs--study
	  //@@@PDC-2615 add embargo_date
	  //@@@PDC-8597 add study_description
	  const ModelStudyPublic = db.getSequelize().define('dummy', {
		  study_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  study_submitter_id: { type: Sequelize.STRING },
		  pdc_study_id: { type: Sequelize.STRING },
		  submitter_id_name: { type: Sequelize.STRING },
		  study_name:  { type: Sequelize.STRING},
		  study_shortname:  { type: Sequelize.STRING},
		  study_description:  { type: Sequelize.STRING},
		  embargo_date: { type: Sequelize.DATE },		  
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
	  //@@@PDC-1316 remove itraq_120
	  //@@@PDC-3847 get aliquot info per label
	  //@@@PDC-5290 add experiment types of TMT16 and TMT18
	  //@@@PDC-6691 add acquisition_mode
	  //@@@PDC-7386 change acquisition_mode to polarity
	  //@@@PDC-8988 support multi protocols per study
	  const ModelStudyExperimentalDesign = db.getSequelize().define('dummy', {
		  study_run_metadata_id: { type: Sequelize.STRING,
					  primaryKey: true },
		  study_run_metadata_submitter_id: { type: Sequelize.STRING },
		  study_id: { type: Sequelize.STRING },
		  study_submitter_id: { type: Sequelize.STRING },
		  pdc_study_id: { type: Sequelize.STRING },
		  aliquot_is_ref: { type: Sequelize.STRING },
		  acquisition_type: { type: Sequelize.STRING },
		  analyte:  { type: Sequelize.STRING},
		  plex_dataset_name:  { type: Sequelize.STRING},
		  experiment_number:  { type: Sequelize.STRING},
		  experiment_type:  { type: Sequelize.STRING},
		  protocol_submitter_id: { type: Sequelize.STRING },
		  protocol_id: { type: Sequelize.STRING },
		  polarity: { type: Sequelize.STRING },		  
		  number_of_fractions:  { type: Sequelize.STRING},
		  label_free_asi:  { type: Sequelize.STRING},
		  itraq_113_asi:  { type: Sequelize.STRING},
		  itraq_114_asi:  { type: Sequelize.STRING},
		  itraq_115_asi:  { type: Sequelize.STRING},
		  itraq_116_asi:  { type: Sequelize.STRING},
		  itraq_117_asi:  { type: Sequelize.STRING},
		  itraq_118_asi:  { type: Sequelize.STRING},
		  itraq_119_asi:  { type: Sequelize.STRING},
		  itraq_121_asi:  { type: Sequelize.STRING},
		  tmt_126_asi:  { type: Sequelize.STRING},
		  tmt_127n_asi:  { type: Sequelize.STRING},
		  tmt_127c_asi:  { type: Sequelize.STRING},
		  tmt_128n_asi:  { type: Sequelize.STRING},
		  tmt_128c_asi:  { type: Sequelize.STRING},
		  tmt_129n_asi:  { type: Sequelize.STRING},
		  tmt_129c_asi:  { type: Sequelize.STRING},
		  tmt_130n_asi:  { type: Sequelize.STRING},
		  tmt_130c_asi:  { type: Sequelize.STRING},
		  tmt_131_asi:  { type: Sequelize.STRING},
		  tmt_131c_asi:  { type: Sequelize.STRING},
		  tmt_132n_asi:  { type: Sequelize.STRING},
		  tmt_132c_asi:  { type: Sequelize.STRING},
		  tmt_133n_asi:  { type: Sequelize.STRING},
		  tmt_133c_asi:  { type: Sequelize.STRING},
		  tmt_134n_asi:  { type: Sequelize.STRING},
		  tmt_134c_asi:  { type: Sequelize.STRING},
		  tmt_135n_asi:  { type: Sequelize.STRING},
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelStudyPublic.removeAttribute('id');

	  //@@@PDC-1882 pdcEntityReference api
	  //@@@PDC-2018 add submitter_id_name of study
	  //@@@PDC-2979 get external reference id
	  //@@@PDC-5511 support generic reference api
	  const ModelEntityReference = db.getSequelize().define('dummy', {
		  reference_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  entity_type: { type: Sequelize.STRING },
		  entity_id: { type: Sequelize.STRING },
		  entity_submitter_id: { type: Sequelize.STRING },
		  external_reference_id: { type: Sequelize.STRING },
		  reference_type: { type: Sequelize.STRING },
		  reference_entity_type:  { type: Sequelize.STRING},
		  reference_entity_alias: { type: Sequelize.STRING },
		  reference_entity_id: { type: Sequelize.STRING },
		  reference_resource_name: { type: Sequelize.STRING },
		  reference_resource_shortname:  { type: Sequelize.STRING},
		  reference_entity_location:  { type: Sequelize.STRING},
		  annotation:  { type: Sequelize.STRING},
		  submitter_id_name:  { type: Sequelize.STRING},
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelEntityReference.removeAttribute('id');
	  
	  //@@@PDC-4259 add exposure, family history, follow up and treatment
	  //@@@PDC-4391 add new columns
	  const ModelTreatment = db.getSequelize().define('dummy', {
			treatment_id: { type: Sequelize.STRING },
			treatment_submitter_id: { type: Sequelize.STRING },
			case_id: { type: Sequelize.STRING },
			case_submitter_id: { type: Sequelize.STRING },
			project_id: { type: Sequelize.STRING },
			project_submitter_id: { type: Sequelize.STRING },
			days_to_treatment_end: { type: Sequelize.STRING },
			days_to_treatment_start: { type: Sequelize.STRING },
			initial_disease_status: { type: Sequelize.STRING },
			regimen_or_line_of_therapy: { type: Sequelize.STRING },
			therapeutic_agents: { type: Sequelize.STRING },
			treatment_anatomic_site: { type: Sequelize.STRING },
			treatment_effect: { type: Sequelize.STRING },
			treatment_intent_type: { type: Sequelize.STRING },
			treatment_or_therapy: { type: Sequelize.STRING },
			treatment_outcome: { type: Sequelize.STRING },
			treatment_type: { type: Sequelize.STRING },
			chemo_concurrent_to_radiation: { type: Sequelize.STRING },
			number_of_cycles: { type: Sequelize.STRING },
			reason_treatment_ended: { type: Sequelize.STRING },
			route_of_administration: { type: Sequelize.STRING },
			treatment_arm: { type: Sequelize.STRING },
			treatment_dose: { type: Sequelize.STRING },
			treatment_dose_units: { type: Sequelize.STRING },
			treatment_effect_indicator: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelTreatment.removeAttribute('id');
	  
	  //@@@PDC-4391 add new columns
	  //@@@PDC-4639 remove bmi, height and weight columns from exposure
	  const ModelExposure = db.getSequelize().define('dummy', {
			exposure_id: { type: Sequelize.STRING },
			exposure_submitter_id: { type: Sequelize.STRING },
			case_id: { type: Sequelize.STRING },
			case_submitter_id: { type: Sequelize.STRING },
			project_id: { type: Sequelize.STRING },
			project_submitter_id: { type: Sequelize.STRING },
			alcohol_days_per_week: { type: Sequelize.STRING },
			alcohol_drinks_per_day: { type: Sequelize.STRING },
			alcohol_history: { type: Sequelize.STRING },
			alcohol_intensity: { type: Sequelize.STRING },
			asbestos_exposure: { type: Sequelize.STRING },
			//bmi: { type: Sequelize.STRING },
			cigarettes_per_day: { type: Sequelize.STRING },
			coal_dust_exposure: { type: Sequelize.STRING },
			environmental_tobacco_smoke_exposure: { type: Sequelize.STRING },
			//height: { type: Sequelize.STRING },
			pack_years_smoked: { type: Sequelize.STRING },
			radon_exposure: { type: Sequelize.STRING },
			respirable_crystalline_silica_exposure: { type: Sequelize.STRING },
			smoking_frequency: { type: Sequelize.STRING },
			time_between_waking_and_first_smoke: { type: Sequelize.STRING },
			tobacco_smoking_onset_year: { type: Sequelize.STRING },
			tobacco_smoking_quit_year: { type: Sequelize.STRING },
			tobacco_smoking_status: { type: Sequelize.STRING },
			type_of_smoke_exposure: { type: Sequelize.STRING },
			type_of_tobacco_used: { type: Sequelize.STRING },
			//weight: { type: Sequelize.STRING },
			years_smoked: { type: Sequelize.STRING },
			age_at_onset: { type: Sequelize.STRING },
			alcohol_type: { type: Sequelize.STRING },
			exposure_duration: { type: Sequelize.STRING },
			exposure_duration_years: { type: Sequelize.STRING },
			exposure_type: { type: Sequelize.STRING },
			marijuana_use_per_week: { type: Sequelize.STRING },
			parent_with_radiation_exposure: { type: Sequelize.STRING },
			secondhand_smoke_as_child: { type: Sequelize.STRING },
			smokeless_tobacco_quit_age: { type: Sequelize.STRING },
			tobacco_use_per_day: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelExposure.removeAttribute('id');
	  
	  const ModelFamilyHistory = db.getSequelize().define('dummy', {
			family_history_id: { type: Sequelize.STRING },
			family_history_submitter_id: { type: Sequelize.STRING },
			case_id: { type: Sequelize.STRING },
			case_submitter_id: { type: Sequelize.STRING },
			project_id: { type: Sequelize.STRING },
			project_submitter_id: { type: Sequelize.STRING },
			relationship_type: { type: Sequelize.STRING },
			relationship_gender: { type: Sequelize.STRING },
			relationship_age_at_diagnosis: { type: Sequelize.STRING },
			relationship_primary_diagnosis: { type: Sequelize.STRING },
			relative_with_cancer_history: { type: Sequelize.STRING },
			relatives_with_cancer_history_count: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelFamilyHistory.removeAttribute('id');
	  
	  //@@@PDC-4391 add new columns
	  const ModelFollowUp = db.getSequelize().define('dummy', {
			follow_up_id: { type: Sequelize.STRING },
			follow_up_submitter_id: { type: Sequelize.STRING },
			case_id: { type: Sequelize.STRING },
			case_submitter_id: { type: Sequelize.STRING },
			project_id: { type: Sequelize.STRING },
			project_submitter_id: { type: Sequelize.STRING },
			adverse_event: { type: Sequelize.STRING },
			barretts_esophagus_goblet_cells_present: { type: Sequelize.STRING },
			bmi: { type: Sequelize.STRING },
			cause_of_response: { type: Sequelize.STRING },
			comorbidity: { type: Sequelize.STRING },
			comorbidity_method_of_diagnosis: { type: Sequelize.STRING },
			days_to_adverse_event: { type: Sequelize.STRING },
			days_to_comorbidity: { type: Sequelize.STRING },
			days_to_follow_up: { type: Sequelize.STRING },
			days_to_progression: { type: Sequelize.STRING },
			days_to_progression_free: { type: Sequelize.STRING },
			days_to_recurrence: { type: Sequelize.STRING },
			diabetes_treatment_type: { type: Sequelize.STRING },
			disease_response: { type: Sequelize.STRING },
			dlco_ref_predictive_percent: { type: Sequelize.STRING },
			ecog_performance_status: { type: Sequelize.STRING },
			fev1_ref_post_bronch_percent: { type: Sequelize.STRING },
			fev1_ref_pre_bronch_percent: { type: Sequelize.STRING },
			fev1_fvc_pre_bronch_percent: { type: Sequelize.STRING },
			fev1_fvc_post_bronch_percent: { type: Sequelize.STRING },
			height: { type: Sequelize.STRING },
			hepatitis_sustained_virological_response: { type: Sequelize.STRING },
			hpv_positive_type: { type: Sequelize.STRING },
			karnofsky_performance_status: { type: Sequelize.STRING },
			menopause_status: { type: Sequelize.STRING },
			pancreatitis_onset_year: { type: Sequelize.STRING },
			progression_or_recurrence: { type: Sequelize.STRING },
			progression_or_recurrence_anatomic_site: { type: Sequelize.STRING },
			progression_or_recurrence_type: { type: Sequelize.STRING },
			reflux_treatment_type: { type: Sequelize.STRING },
			risk_factor: { type: Sequelize.STRING },
			risk_factor_treatment: { type: Sequelize.STRING },
			viral_hepatitis_serologies: { type: Sequelize.STRING },
			weight: { type: Sequelize.STRING },
			adverse_event_grade: { type: Sequelize.STRING },
			aids_risk_factors: { type: Sequelize.STRING },
			body_surface_area: { type: Sequelize.STRING },
			cd4_count: { type: Sequelize.STRING },
			cdc_hiv_risk_factors: { type: Sequelize.STRING },
			days_to_imaging: { type: Sequelize.STRING },
			evidence_of_recurrence_type: { type: Sequelize.STRING },
			eye_color: { type: Sequelize.STRING },
			haart_treatment_indicator: { type: Sequelize.STRING },
			history_of_tumor: { type: Sequelize.STRING },
			history_of_tumor_type: { type: Sequelize.STRING },
			hiv_viral_load: { type: Sequelize.STRING },
			hormonal_contraceptive_type: { type: Sequelize.STRING },
			hormonal_contraceptive_use: { type: Sequelize.STRING },
			hormone_replacement_therapy_type: { type: Sequelize.STRING },
			hysterectomy_margins_involved: { type: Sequelize.STRING },
			hysterectomy_type: { type: Sequelize.STRING },
			imaging_result: { type: Sequelize.STRING },
			imaging_type: { type: Sequelize.STRING },
			immunosuppressive_treatment_type: { type: Sequelize.STRING },
			nadir_cd4_count: { type: Sequelize.STRING },
			pregnancy_outcome: { type: Sequelize.STRING },
			procedures_performed: { type: Sequelize.STRING },
			recist_targeted_regions_number: { type: Sequelize.STRING },
			recist_targeted_regions_sum: { type: Sequelize.STRING },
			scan_tracer_used: { type: Sequelize.STRING },
			undescended_testis_corrected: { type: Sequelize.STRING },
			undescended_testis_corrected_age: { type: Sequelize.STRING },
			undescended_testis_corrected_laterality: { type: Sequelize.STRING },
			undescended_testis_corrected_method: { type: Sequelize.STRING },
			undescended_testis_history: { type: Sequelize.STRING },
			undescended_testis_history_laterality: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelFollowUp.removeAttribute('id');

	  //@@@PDC-2614 rearrange geneSpectralCount
	  //@@@PDC-2690 ncbi_gene_id type change
	  const ModelGene = db.getSequelize().define('dummy', {
		gene_id: { 	type: Sequelize.STRING},
		gene_name: { 	type: Sequelize.STRING  },
		NCBI_gene_id: { type: Sequelize.STRING },
 	    alias: { type: Sequelize.STRING },
		authority: { type: Sequelize.STRING },
		description: { type: Sequelize.STRING },
		organism: { type: Sequelize.STRING },
		chromosome: { type: Sequelize.STRING },
		locus: { type: Sequelize.STRING },
		assays: { type: Sequelize.STRING },
		proteins: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelGene.removeAttribute('id');
	  
	  //@@@PDC-2938 add versions to study summary
	  const ModelVersion = db.getSequelize().define('dummy', {
		number: { type: Sequelize.STRING},
		name: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'dummy'	
	  });
	  ModelVersion.removeAttribute('id');



	  db['ModelGene'] = ModelGene;
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
	  db['ModelSearchStudyRecord'] = ModelSearchStudyRecord;
	  db['ModelSearchCaseRecord'] = ModelSearchCaseRecord;
	  db['ModelSearchAliquotRecord'] = ModelSearchAliquotRecord;
	  db['ModelMatrix'] = ModelMatrix;
	  db['ModelSpectralCount'] = ModelSpectralCount;
	  db['ModelExperimentalMetadata'] = ModelExperimentalMetadata;
	  db['ModelStudyRunMetadata'] = ModelStudyRunMetadata;
	  db['ModelAliquotRunMetadata'] = ModelAliquotRunMetadata;
	  db['ModelClinicalMetadata'] = ModelClinicalMetadata;
	  db['ModelStudyPublic'] = ModelStudyPublic;
	  db['ModelStudyExperimentalDesign'] = ModelStudyExperimentalDesign;  
	  db['ModelEntityReference'] = ModelEntityReference;  
	  db['ModelVersion'] = ModelVersion;  
	  db['ModelFollowUp'] = ModelFollowUp;  
	  db['ModelFamilyHistory'] = ModelFamilyHistory;  
	  db['ModelTreatment'] = ModelTreatment;  
	  db['ModelExposure'] = ModelExposure;  
};

export { defineCustomModels };
