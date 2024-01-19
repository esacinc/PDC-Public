import Sequelize from 'sequelize';
import _ from 'lodash';

//@@@PDC-180 Case API for UI case summary
/**
* CaseModel is mapped to the table of case and 
* used in case and  allCases queries.
*/
//@@@PDC-962 defnie db models after db is initialized asynchronously 
//@@@PDC-1011 replace external_case_id with external_case_id
//@@@PDC-3668 add project_id
//@@@PDC-4391 add new columns
//@@@PDC-4968 expose case_is_ref
const defineSequelizeModels = (db) => {

	const CaseModel = db.getSequelize().define('case', {
		case_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		project_submitter_id: { type: Sequelize.STRING },
		project_id: { type: Sequelize.STRING },
		case_submitter_id: { type: Sequelize.STRING },
		case_is_ref: { type: Sequelize.STRING },
		external_case_id: { type: Sequelize.STRING },
		tissue_source_site_code: { type: Sequelize.STRING },
		days_to_lost_to_followup: { type: Sequelize.INTEGER },
		disease_type: { type: Sequelize.STRING },
		index_date: { type: Sequelize.STRING },
		lost_to_followup: { type: Sequelize.STRING },
		primary_site: { type: Sequelize.STRING },
		consent_type: { type: Sequelize.STRING },
		days_to_consent: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'case'	
	  });

	  //CaseModel.removeAttribute('id');
	  
	  /**
	  * DemographicModel is mapped to the table of diagnosis and used in 
	  * case queries.
	  */
	  //@@@PDC-4391 add new columns
	  //@@@PDC-5257 add case_submitter_id
	  const DemographicModel = db.getSequelize().define('demographic', {
		  demographic_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  case_id: { type: Sequelize.STRING },    
		  case_submitter_id: { type: Sequelize.STRING },    
		  demographic_submitter_id: { type: Sequelize.STRING },
		  ethnicity: { type: Sequelize.STRING },
		  gender: { type: Sequelize.STRING },
		  race: { type: Sequelize.STRING },
		  cause_of_death: { type: Sequelize.STRING },
		  days_to_birth: { type: Sequelize.INTEGER },
		  days_to_death: { type: Sequelize.INTEGER },
		  vital_status: { type: Sequelize.STRING },
		  year_of_birth: { type: Sequelize.INTEGER },
		  year_of_death: { type: Sequelize.INTEGER },
		age_at_index: { type: Sequelize.STRING },
		premature_at_birth: { type: Sequelize.STRING },
		weeks_gestation_at_birth: { type: Sequelize.STRING },
		age_is_obfuscated: { type: Sequelize.STRING },
		cause_of_death_source: { type: Sequelize.STRING },
		occupation_duration_years: { type: Sequelize.STRING },
		country_of_residence_at_enrollment: { type: Sequelize.STRING },	
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'demographic'	
	  });
	  

	  /**
	  * SampleModel is mapped to the table of sample and used in 
	  * case queries.
	  */
	  //@@@PDC-1093 change data type of is_ffpe from int to string
	  //@@@PDC-1467 add case_submitter_id
	  //@@@PDC-2755 add pool attribute
	  //@@@PDC-4391 add new columns
	  //@@@PDC-4486 add new columns for sample
	  //@@@PDC-4569 remove is_ffpe and oct_embedded
	  //@@@PDC-5412 add diagnosis-sample annotation
	  //@@@PDC-7899 add biospecimen_laterality
	  const SampleModel = db.getSequelize().define('sample', {
		  sample_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  case_id: { type: Sequelize.STRING },    
		  gdc_sample_id: { type: Sequelize.STRING },
		  gdc_project_id: { type: Sequelize.STRING },
		  sample_submitter_id: { type: Sequelize.STRING },
		  case_submitter_id: { type: Sequelize.STRING },
		  sample_type: { type: Sequelize.STRING },
		  sample_type_id: { type: Sequelize.STRING },
		  sample_is_ref: { type: Sequelize.STRING },
		  status: { type: Sequelize.STRING },
		  pool: { type: Sequelize.STRING },
		  biospecimen_anatomic_site: { type: Sequelize.STRING },
		  biospecimen_laterality: { type: Sequelize.STRING },
		  composition: { type: Sequelize.STRING },
		  current_weight: { type: Sequelize.FLOAT },
		  days_to_collection: { type: Sequelize.INTEGER },
		  days_to_sample_procurement: { type: Sequelize.INTEGER },
		  diagnosis_pathologically_confirmed: { type: Sequelize.STRING },
		  freezing_method: { type: Sequelize.STRING },
		  initial_weight: { type: Sequelize.FLOAT }, 
		  intermediate_dimension: { type: Sequelize.STRING },
		  longest_dimension: { type: Sequelize.STRING },
		  method_of_sample_procurement: { type: Sequelize.STRING },
		  pathology_report_uuid: { type: Sequelize.STRING },
		  preservation_method: { type: Sequelize.STRING },
		  sample_type_id: { type: Sequelize.STRING },
		  shortest_dimension: { type: Sequelize.STRING },
		  time_between_clamping_and_freezing: { type: Sequelize.STRING },
		  time_between_excision_and_freezing: { type: Sequelize.STRING },
		  tissue_type: { type: Sequelize.STRING },
		  tumor_code: { type: Sequelize.STRING },
		  tumor_code_id: { type: Sequelize.STRING },
		  tumor_descriptor: { type: Sequelize.STRING },
		  biospecimen_laterality: { type: Sequelize.STRING },			
		  catalog_reference: { type: Sequelize.STRING },
		  distance_normal_to_tumor: { type: Sequelize.STRING },
		  distributor_reference: { type: Sequelize.STRING },
		  growth_rate: { type: Sequelize.STRING },
		  passage_count: { type: Sequelize.STRING },
		  sample_ordinal: { type: Sequelize.STRING },
		  tissue_collection_type: { type: Sequelize.STRING },
		  annotation: { type: Sequelize.STRING },
		  
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'sample'	
	  });
	  
	  //@@@PDC-898 new public APIs--fileMetadata
	  //@@@PDC-2755 add pool attribute
	  /**
	  * AliquotModel is mapped to the table of aliquot and used in 
	  * case queries.
	  */
	  const AliquotModel = db.getSequelize().define('aliquot', {
		  aliquot_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  aliquot_submitter_id: { type: Sequelize.STRING },
		  aliquot_is_ref: { type: Sequelize.STRING },
		  sample_id: { type: Sequelize.STRING },    
		  sample_submitter_id: { type: Sequelize.STRING },
		  case_id: { type: Sequelize.STRING },    
		  case_submitter_id: { type: Sequelize.STRING },
		  status: { type: Sequelize.STRING },
		  pool: { type: Sequelize.STRING },
		  analyte_type: { type: Sequelize.STRING },
		  aliquot_quantity: { type: Sequelize.FLOAT },
		  aliquot_volume: { type: Sequelize.FLOAT },
		  amount: { type: Sequelize.FLOAT },
		  concentration: { type: Sequelize.FLOAT },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'aliquot'	
	  });
	  
	  //@@@PDC-109, 110
	  //@@@PDC-153 change count to cases_count
	  //@@@PDC-155 change count to cases_count
	  //@@@PDC-156 get disease type instead of primary diagnosis
	  //@@@PDC-1011 replace gdc_case_id with external_case_id
	  //@@@PDC-2038 add ajcc_staging_system_edition
	  //@@@PDC-2417 Remove unused fields from Diagnosis
	  //@@@PDC-3266 add icd_10_code and synchronous_malignancy
	  //@@@PDC-3428 add tumor_largest_dimension_diameter
	  //@@@PDC-4391 add new columns
	  //@@@PDC-5205 add auxiliary_data and tumor_cell_content
	  //@@@PDC-5412 add diagnosis-sample annotation
	  /**
	  * DiagnosisModel is mapped to the table of diagnosis and used in 
	  * tissueSitesAvailable and  diseasesAvailable queries.
	  */
	  const DiagnosisModel = db.getSequelize().define('diagnosis', {
		  diagnosis_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		  case_id: { type: Sequelize.STRING },    
		  external_case_id: { type: Sequelize.STRING },
		  project_submitter_id: { type: Sequelize.STRING },
		  tissue_or_organ_of_origin: { type: Sequelize.STRING },
		  disease_type: { type: Sequelize.STRING },
		  age_at_diagnosis: { type: Sequelize.STRING },
		  primary_diagnosis: { type: Sequelize.STRING },
		  tumor_grade: { type: Sequelize.STRING },
		  tumor_stage: { type: Sequelize.STRING },
		  tumor_largest_dimension_diameter : { type: Sequelize.STRING },
		  cases_count: { type: Sequelize.INTEGER },
		  diagnosis_submitter_id: { type: Sequelize.STRING },
		  case_submitter_id: { type: Sequelize.STRING },
		  project_id: { type: Sequelize.STRING },
		  classification_of_tumor: { type: Sequelize.STRING },
		  days_to_last_follow_up: { type: Sequelize.STRING },
		  days_to_last_known_disease_status: { type: Sequelize.STRING },
		  days_to_recurrence: { type: Sequelize.STRING },
		  last_known_disease_status: { type: Sequelize.STRING },
		  morphology: { type: Sequelize.STRING },
		  progression_or_recurrence: { type: Sequelize.STRING },
		  site_of_resection_or_biopsy: { type: Sequelize.STRING },
		  tissue_or_organ_of_origin: { type: Sequelize.STRING },
		  prior_malignancy: { type: Sequelize.STRING },
		  ajcc_clinical_m: { type: Sequelize.STRING },
		  ajcc_clinical_n: { type: Sequelize.STRING },
		  ajcc_clinical_stage: { type: Sequelize.STRING },
		  ajcc_clinical_t: { type: Sequelize.STRING },
		  ajcc_pathologic_m: { type: Sequelize.STRING },
		  ajcc_pathologic_n: { type: Sequelize.STRING },
		  ajcc_pathologic_stage: { type: Sequelize.STRING },
		  ajcc_pathologic_t: { type: Sequelize.STRING },
		  ajcc_staging_system_edition: { type: Sequelize.STRING },
		  ann_arbor_b_symptoms: { type: Sequelize.STRING },
		  ann_arbor_clinical_stage: { type: Sequelize.STRING },
		  ann_arbor_extranodal_involvement: { type: Sequelize.STRING },
		  ann_arbor_pathologic_stage: { type: Sequelize.STRING },
		  best_overall_response: { type: Sequelize.STRING },
		  burkitt_lymphoma_clinical_variant: { type: Sequelize.STRING },
		  circumferential_resection_margin: { type: Sequelize.STRING },
		  colon_polyps_history: { type: Sequelize.STRING },
		  days_to_best_overall_response: { type: Sequelize.STRING },
		  days_to_diagnosis: { type: Sequelize.STRING },
		  days_to_hiv_diagnosis: { type: Sequelize.STRING },
		  days_to_new_event: { type: Sequelize.STRING },
		  figo_stage: { type: Sequelize.STRING },
		  hiv_positive: { type: Sequelize.STRING },
		  hpv_positive_type: { type: Sequelize.STRING },
		  hpv_status: { type: Sequelize.STRING },
		  iss_stage: { type: Sequelize.STRING },
		  laterality: { type: Sequelize.STRING },
		  ldh_level_at_diagnosis: { type: Sequelize.STRING },
		  ldh_normal_range_upper: { type: Sequelize.STRING },
		  lymph_nodes_positive: { type: Sequelize.STRING },
		  lymphatic_invasion_present: { type: Sequelize.STRING },
		  method_of_diagnosis: { type: Sequelize.STRING },
		  new_event_anatomic_site: { type: Sequelize.STRING },
		  new_event_type: { type: Sequelize.STRING },
		  overall_survival: { type: Sequelize.STRING },
		  perineural_invasion_present: { type: Sequelize.STRING },
		  prior_treatment: { type: Sequelize.STRING },
		  progression_free_survival: { type: Sequelize.STRING },
		  progression_free_survival_event: { type: Sequelize.STRING },
		  residual_disease: { type: Sequelize.STRING },
		  vascular_invasion_present: { type: Sequelize.STRING },
		  year_of_diagnosis: { type: Sequelize.STRING },
		  icd_10_code: { type: Sequelize.STRING },
		  synchronous_malignancy: { type: Sequelize.STRING },
		anaplasia_present: { type: Sequelize.STRING },
		anaplasia_present_type: { type: Sequelize.STRING },
		child_pugh_classification: { type: Sequelize.STRING },
		cog_liver_stage: { type: Sequelize.STRING },
		cog_neuroblastoma_risk_group: { type: Sequelize.STRING },
		cog_renal_stage: { type: Sequelize.STRING },
		cog_rhabdomyosarcoma_risk_group: { type: Sequelize.STRING },
		enneking_msts_grade: { type: Sequelize.STRING },
		enneking_msts_metastasis: { type: Sequelize.STRING },
		enneking_msts_stage: { type: Sequelize.STRING },
		enneking_msts_tumor_site: { type: Sequelize.STRING },
		esophageal_columnar_dysplasia_degree: { type: Sequelize.STRING },
		esophageal_columnar_metaplasia_present: { type: Sequelize.STRING },
		first_symptom_prior_to_diagnosis: { type: Sequelize.STRING },
		gastric_esophageal_junction_involvement: { type: Sequelize.STRING },
		goblet_cells_columnar_mucosa_present: { type: Sequelize.STRING },
		gross_tumor_weight: { type: Sequelize.STRING },
		inpc_grade: { type: Sequelize.STRING },
		inpc_histologic_group: { type: Sequelize.STRING },
		inrg_stage: { type: Sequelize.STRING },
		inss_stage: { type: Sequelize.STRING },
		irs_group: { type: Sequelize.STRING },
		irs_stage: { type: Sequelize.STRING },
		ishak_fibrosis_score: { type: Sequelize.STRING },
		lymph_nodes_tested: { type: Sequelize.STRING },
		medulloblastoma_molecular_classification: { type: Sequelize.STRING },
		metastasis_at_diagnosis: { type: Sequelize.STRING },
		metastasis_at_diagnosis_site: { type: Sequelize.STRING },
		mitosis_karyorrhexis_index: { type: Sequelize.STRING },
		peripancreatic_lymph_nodes_positive: { type: Sequelize.STRING },
		peripancreatic_lymph_nodes_tested: { type: Sequelize.STRING },
		supratentorial_localization: { type: Sequelize.STRING },
		tumor_confined_to_organ_of_origin: { type: Sequelize.STRING },
		tumor_focality: { type: Sequelize.STRING },
		tumor_regression_grade: { type: Sequelize.STRING },
		vascular_invasion_type: { type: Sequelize.STRING },
		wilms_tumor_histologic_subtype: { type: Sequelize.STRING },
		breslow_thickness: { type: Sequelize.STRING },
		gleason_grade_group: { type: Sequelize.STRING },
		igcccg_stage: { type: Sequelize.STRING },
		international_prognostic_index: { type: Sequelize.STRING },
		largest_extrapelvic_peritoneal_focus: { type: Sequelize.STRING },
		masaoka_stage: { type: Sequelize.STRING },
		non_nodal_regional_disease: { type: Sequelize.STRING },
		non_nodal_tumor_deposits: { type: Sequelize.STRING },
		ovarian_specimen_status: { type: Sequelize.STRING },
		ovarian_surface_involvement: { type: Sequelize.STRING },
		percent_tumor_invasion: { type: Sequelize.STRING },
		peritoneal_fluid_cytological_status: { type: Sequelize.STRING },
		primary_gleason_grade: { type: Sequelize.STRING },
		secondary_gleason_grade: { type: Sequelize.STRING },
		weiss_assessment_score: { type: Sequelize.STRING },
		adrenal_hormone: { type: Sequelize.STRING },
		ann_arbor_b_symptoms_described: { type: Sequelize.STRING },
		diagnosis_is_primary_disease: { type: Sequelize.STRING },
		eln_risk_classification: { type: Sequelize.STRING },
		figo_staging_edition_year: { type: Sequelize.STRING },
		gleason_grade_tertiary: { type: Sequelize.STRING },
		gleason_patterns_percent: { type: Sequelize.STRING },
		margin_distance: { type: Sequelize.STRING },
		margins_involved_site: { type: Sequelize.STRING },
		pregnant_at_diagnosis: { type: Sequelize.STRING },
		satellite_nodule_present: { type: Sequelize.STRING },
		sites_of_involvement: { type: Sequelize.STRING },
		tumor_depth: { type: Sequelize.STRING },
		tumor_cell_content: { type: Sequelize.STRING },
		auxiliary_data: { type: Sequelize.STRING },
		who_cns_grade: { type: Sequelize.STRING },
		who_nte_grade: { type: Sequelize.STRING },
		diagnosis_uuid: { type: Sequelize.STRING },
		annotation: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'diagnosis'	
	  });
	  //DiagnosisModel.removeAttribute('id');
	  CaseModel.hasMany(DiagnosisModel, {foreignKey: 'case_id'});
	  DiagnosisModel.belongsTo(CaseModel, {foreignKey: 'case_id'});
	  CaseModel.hasMany(SampleModel, {foreignKey: 'case_id'});
	  SampleModel.belongsTo(CaseModel, {foreignKey: 'case_id'});
	  CaseModel.hasMany(DemographicModel, {foreignKey: 'case_id'});
	  DemographicModel.belongsTo(CaseModel, {foreignKey: 'case_id'});
	  SampleModel.hasMany(AliquotModel, {foreignKey: 'sample_id'});
	  AliquotModel.belongsTo(SampleModel, {foreignKey: 'sample_id'});
	  
	  /**
	  * ProgramModel is mapped to the table of program and used 
	  * in program and  allPrograms queries.
	  */
	  const ProgramModel = db.getSequelize().define('program', {
		program_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		program_submitter_id: { type: Sequelize.STRING },
		name: { type: Sequelize.INTEGER },
		sponsor: { type: Sequelize.STRING },
		program_manager: { type: Sequelize.STRING },
		start_date: { type: Sequelize.DATE },
		end_date: { type: Sequelize.DATE },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'program'	
	  });
	  
	  /**
	  * GenemModel is mapped to the table of gene and used 
	  * in gene and  protein queries.
	  */
	  //@@@PDC-2690 ncbi_gene_id type change
	  const GeneModel = db.getSequelize().define('gene', {
		gene_id: { 	type: Sequelize.STRING,
			primaryKey: true  },
		gene_name: { 	type: Sequelize.STRING  },
		ncbi_gene_id: { type: Sequelize.STRING },
		authority: { type: Sequelize.STRING },
		description: { type: Sequelize.STRING },
		organism: { type: Sequelize.STRING },
		chromosome: { type: Sequelize.STRING },
		locus: { type: Sequelize.STRING },
		assays: { type: Sequelize.STRING },
		proteins: { type: Sequelize.STRING },
	  }, {
		  indexes: [ { unique: true, fields: [ 'gene_name' ] } ] ,
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'gene'	
	  });
	  
	  /**
	  * SpectralCountModel is mapped to the table of spectral_count and used 
	  * in gene and  protein queries.
	  */
	  //@@@PDC-164 plex-level spectral count
	  //@@@PDC-333 gene/spectral count API change
	  //@@@PDC-3668 add project_id and study_id
	  const SpectralCountModel = db.getSequelize().define('spectral_count', {
		study_submitter_id: { 	type: Sequelize.STRING,
					  primaryKey: true  },
		gene_name: { 	type: Sequelize.STRING},
		gene_id: { type: Sequelize.STRING},
		project_submitter_id: { type: Sequelize.STRING },
		project_id: { type: Sequelize.STRING },
		study_id: { type: Sequelize.STRING },
		pdc_study_id: { type: Sequelize.STRING },
		plex: { type: Sequelize.STRING },
		plex_name: { type: Sequelize.STRING },
		spectral_count: { type: Sequelize.INTEGER },
		distinct_peptide: { type: Sequelize.INTEGER },
		unshared_peptide: { type: Sequelize.INTEGER },
	  }, {
		  indexes: [ { fields: [ 'gene_name', 'gene_id' ] } ] ,
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'spectral_count'	
	  });
	  SpectralCountModel.removeAttribute('id');
	  
	  /**
	  * ProjectModel is mapped to the table of project and used 
	  * in program and allProgram queries.
	  */
	  const ProjectModel = db.getSequelize().define('project', {
		project_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		project_submitter_id: { type: Sequelize.STRING },
		name: { type: Sequelize.INTEGER },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'project'	
	  });
	  
	  //@@@PDC-2435 add contacts to study
	  const ContactModel = db.getSequelize().define('contact', {
		contact_id: { type: Sequelize.STRING,
					  primaryKey: true   },
		name: { type: Sequelize.STRING },
		email: { type: Sequelize.STRING },
		institution: { type: Sequelize.STRING },
		url: { type: Sequelize.STRING },
	  }, {
		  timestamps: false,
		  underscored: true,
		  freezeTableName: true,
		  tableName: 'contact'	
	  });
	  ContactModel.removeAttribute('id');

	  //Relationships among models
	  ProgramModel.hasMany(ProjectModel, {foreignKey: 'program_id'});
	  ProjectModel.belongsTo(ProgramModel, {foreignKey: 'program_id'});
	  GeneModel.hasMany(SpectralCountModel, {foreignKey: 'gene_id'});
	  SpectralCountModel.belongsTo(GeneModel);
	  
	  db['Case'] = CaseModel;
	  db['Demographic'] = DemographicModel;
	  db['Sample'] = SampleModel;
	  db['Aliquot'] = AliquotModel;
	  db['Diagnosis'] = DiagnosisModel;
	  db['Program'] = ProgramModel;
	  db['Gene'] = GeneModel;
	  db['Spectral'] = SpectralCountModel;
	  db['Project'] = ProjectModel;
	  db['Contact'] = ContactModel;
};





export { defineSequelizeModels };