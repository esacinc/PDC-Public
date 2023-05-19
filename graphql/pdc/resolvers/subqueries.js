import { db } from '../util/dbconnect';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import Sequelize from 'sequelize';
import {filters, filtersView} from '../util/filters'
import { replacementFilters, replacementFiltersView } from "../util/replacementFilters";
import {getSignedUrl} from '../util/getSignedUrl'
import {RedisCacheClient, CacheName} from '../util/cacheClient';
//@@@PDC-1215 use winston logger
import { logger } from '../util/logger';
import  {queryList} from '../util/browsePageFilters';
import { getHeatMapStudies } from '../util/heatMapData';


const Op = Sequelize.Op;
const labelQuery = "select distinct bin_to_uuid(aliquot_id) as aliquot_id, bin_to_uuid(aliquot_run_metadata_id) as aliquot_run_metadata_id, aliquot_submitter_id FROM aliquot_run_metadata ";
//@@@PDC-952 remove hard-coded schema name
//@@@PDC-1340 remove authorization code
//@@@PDC-1874 add pdc_study_id to all study-related APIs
//@@@PDC-5257 add case_id and case_submitter_id to all clinbio objects
//@@@PDC-5037 track api parent
//@@@PDC-5630 log base/sub relationship
export const resolvers = {
	//Definition of the type of Date
	Date: new GraphQLScalarType({
		name: 'Date',
		description: 'Date custom scalar type',
		parseValue(value) {
		  return new Date(value);
		},
		serialize(value) {
		  return value;
		},
		parseLiteral(ast) {
		  if (ast.kind === Kind.INT) {
			return parseInt(ast.value, 10);
		  }
		  return null;
		},
	}),
    //@@@PDC-474 programs-projects-studies API
    //@@@PDC-1430 link program/project/study using uuid
	Program: {
		projects(obj, args, context) {
			logger.info("projects is called via "+context.parent);
			let comboQuery = "";
			let replacements = { };
			if (context.noFilter != null) {
				comboQuery = "SELECT distinct bin_to_uuid(proj.project_id) as project_id, proj.project_submitter_id, proj.name "+
				" FROM project proj "+
				" WHERE proj.program_id = uuid_to_bin('"+
				obj.program_id +
				"') ";
			}
			else {
				comboQuery = "SELECT distinct bin_to_uuid(proj.project_id) as project_id, proj.project_submitter_id, proj.name "+
				" FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al, project proj, program prog, protocol ptc "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id and ptc.study_id = s.study_id "+
				" and proj.program_id = prog.program_id and prog.program_id = uuid_to_bin('"+
				obj.program_id +
				"') ";
				//"and s.project_submitter_id IN ('" + context.value.join("','") + "')";

				comboQuery += replacementFilters(context.arguments, { name: "" }, replacements);
			}
			return db.getSequelize().query(
					comboQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Project')
					}
				);
		}
	},
    //@@@PDC-1430 link program/project/study using uuid
	Project: {
		studies(obj, args, context) {
			logger.info("studies is called via "+context.parent);
			let comboQuery = "";
			let replacements = { };
			//@@@PDC-3839 get current version of study
			//@@@PDC-3966 add more study fields per CDA request
			if (context.noFilter != null) {
				comboQuery = "SELECT distinct bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.submitter_id_name, "+
				" s.submitter_id_name, s.embargo_date, s.study_shortname as study_name,"+
				" s.analytical_fraction, s.experiment_type, s.acquisition_type, s.pdc_study_id"+
				" FROM study s"+
				" WHERE s.is_latest_version = 1 and s.project_id = uuid_to_bin('"+
				obj.project_id +
				"')";
			}
			else {
				comboQuery = "SELECT distinct bin_to_uuid(s.study_id) as study_id, s.study_submitter_id,"+
				" s.submitter_id_name, s.embargo_date, s.study_shortname as study_name,"+
				" s.analytical_fraction, s.experiment_type, s.acquisition_type, s.pdc_study_id"+
				" FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al, project proj, program prog, protocol ptc "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id and ptc.study_id = s.study_id "+
				" and proj.program_id = prog.program_id and s.is_latest_version = 1 and s.project_id = uuid_to_bin('"+
				obj.project_id +
				"') ";
				//"and s.project_submitter_id IN ('" + context.value.join("','") + "')";
				comboQuery += replacementFilters(context.arguments, { name: " " }, replacements);
			}
			return db.getSequelize().query(
					comboQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelStudy')
					}
				);
		}
	},
	//@@@PDC-2979 add external reference.
	PublicCase: {
		externalReferences(obj, args, context) {
			logger.info("externalReferences is called via "+context.parent);
			let refQuery = "SELECT reference_resource_shortname, trim(both '\r' from reference_entity_location) as reference_entity_location, " +
				" reference_entity_alias as external_reference_id, reference_resource_name " +
				" FROM reference r where entity_type = 'case' and reference_type = 'external' " +
				" and entity_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery,
				{ model: db.getModelByName('ModelEntityReference') });
		}
	},
	//@@@PDC-180 Case API for UI case summary
	//@@@PDC-650 implement elasticache for API
	//@@@PDC-1371 use uuid instead of submitter_id
	//@@@PDC-2979 add external reference
	//@@@PDC-4391 add new columns
	Case: {
		externalReferences(obj, args, context) {
			logger.info("externalReferences is called via "+context.parent);
			var refQuery = "SELECT reference_resource_shortname, trim(both '\r' from reference_entity_location) as reference_entity_location, reference_entity_alias as external_reference_id, reference_resource_name FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelEntityReference') });
		},
		//@@@PDC-4293 add new clinbio entities
		//@@@PDC-4639 remove bmi, height and weight columns from exposure
		exposures(obj, args, context) {
				logger.info("exposures is called via "+context.parent);
				var refQuery = "SELECT bin_to_uuid(exposure_id) as exposure_id, exposure_submitter_id, bin_to_uuid(case_id) as case_id, case_submitter_id, alcohol_days_per_week, alcohol_drinks_per_day, alcohol_history, alcohol_intensity, asbestos_exposure, cigarettes_per_day, coal_dust_exposure, environmental_tobacco_smoke_exposure, pack_years_smoked, radon_exposure, respirable_crystalline_silica_exposure, smoking_frequency, time_between_waking_and_first_smoke, tobacco_smoking_onset_year, tobacco_smoking_quit_year, tobacco_smoking_status, type_of_smoke_exposure, type_of_tobacco_used, years_smoked, age_at_onset, alcohol_type, exposure_duration, exposure_duration_years, exposure_type, marijuana_use_per_week, parent_with_radiation_exposure, secondhand_smoke_as_child, smokeless_tobacco_quit_age, tobacco_use_per_day FROM exposure where case_id = uuid_to_bin('"+ obj.case_id + "')";
				return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelExposure') });
		},
		family_histories(obj, args, context) {
			logger.info("family_histories is called via "+context.parent);
			var refQuery = "SELECT bin_to_uuid(family_history_id) as family_history_id, family_history_submitter_id, bin_to_uuid(case_id) as case_id, case_submitter_id, relationship_type, relationship_gender, relationship_age_at_diagnosis, relationship_primary_diagnosis, relative_with_cancer_history, relatives_with_cancer_history_count FROM family_history where case_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFamilyHistory') });
		},
		follow_ups(obj, args, context) {
			logger.info("follow_ups is called via "+context.parent);
			var refQuery = "SELECT bin_to_uuid(follow_up_id) as follow_up_id, follow_up_submitter_id, bin_to_uuid(case_id) as case_id, case_submitter_id, adverse_event, barretts_esophagus_goblet_cells_present, bmi, cause_of_response, comorbidity, comorbidity_method_of_diagnosis, days_to_adverse_event, days_to_comorbidity, days_to_follow_up, days_to_progression, days_to_progression_free, days_to_recurrence, diabetes_treatment_type, disease_response, dlco_ref_predictive_percent, ecog_performance_status, fev1_ref_post_bronch_percent, fev1_ref_pre_bronch_percent, fev1_fvc_pre_bronch_percent, fev1_fvc_post_bronch_percent, height, hepatitis_sustained_virological_response, hpv_positive_type, karnofsky_performance_status, menopause_status, pancreatitis_onset_year, progression_or_recurrence, progression_or_recurrence_anatomic_site, progression_or_recurrence_type, reflux_treatment_type, risk_factor, risk_factor_treatment, viral_hepatitis_serologies, weight, adverse_event_grade, aids_risk_factors, body_surface_area, cd4_count, cdc_hiv_risk_factors, days_to_imaging, evidence_of_recurrence_type, eye_color, haart_treatment_indicator, history_of_tumor, history_of_tumor_type, hiv_viral_load, hormonal_contraceptive_type, hormonal_contraceptive_use, hormone_replacement_therapy_type, hysterectomy_margins_involved, hysterectomy_type, imaging_result, imaging_type, immunosuppressive_treatment_type, nadir_cd4_count, pregnancy_outcome, procedures_performed, recist_targeted_regions_number, recist_targeted_regions_sum, scan_tracer_used, undescended_testis_corrected, undescended_testis_corrected_age, undescended_testis_corrected_laterality, undescended_testis_corrected_method, undescended_testis_history, undescended_testis_history_laterality FROM follow_up where case_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFollowUp') });
		},
		treatments(obj, args, context) {
			logger.info("treatments is called via "+context.parent);
			var refQuery = "SELECT bin_to_uuid(treatment_id) as treatment_id, treatment_submitter_id, bin_to_uuid(case_id) as case_id, case_submitter_id, days_to_treatment_end, days_to_treatment_start, initial_disease_status, regimen_or_line_of_therapy, therapeutic_agents, treatment_anatomic_site, treatment_effect, treatment_intent_type, treatment_or_therapy, treatment_outcome, treatment_type, chemo_concurrent_to_radiation, number_of_cycles, reason_treatment_ended, route_of_administration, treatment_arm, treatment_dose, treatment_dose_units, treatment_effect_indicator, treatment_frequency FROM treatment where case_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelTreatment') });
		},
		async demographics(obj, args, context) {
			logger.info("demographics is called via "+context.parent);
			var cacheFilterName = { name: '' };
			//@@@PDC-2544 use case_id in cache key
			cacheFilterName.name += "case_id:(" + obj.case_id + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseDemographic') + cacheFilterName['name']);
			if (res === null) {				
				var result = await db.getModelByName('Demographic').findAll({
					attributes: [['bin_to_uuid(demographic_id)', 'demographic_id'], 'demographic_submitter_id',
					['bin_to_uuid(case_id)', 'case_id'],
					'case_submitter_id',
						'ethnicity',
						'gender',
						'race',
						'cause_of_death',
						'days_to_birth',
						'days_to_death',
						'vital_status',
						'year_of_birth',
						'year_of_death',
						'age_at_index',
						'premature_at_birth',
						'weeks_gestation_at_birth',
						'age_is_obfuscated',
						'cause_of_death_source',
						'occupation_duration_years',
						'country_of_residence_at_enrollment'
					],
					where: {
						case_id: Sequelize.fn('uuid_to_bin', obj.case_id )
						//case_submitter_id: obj.case_submitter_id
					}
				});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('CaseDemographic') + cacheFilterName['name'], JSON.stringify(result));
				return result;
			} else {
				return JSON.parse(res);
			}
		},
		//@@@PDC-2038 add ajcc_staging_system_edition
		//@@@PDC-2417 Remove unused fields from Diagnosis
		//@@@PDC-3266 add icd_10_code and synchronous_malignancy
		//@@@PDC-3428 add tumor_largest_dimension_diameter
		//@@@PDC-5205 add auxiliary_data and tumor_cell_content
		//@@@PDC-5647 return N/A if null
		async diagnoses(obj, args, context) {
			logger.info("diagnoses is called via "+context.parent);
			var cacheFilterName = {name:''};
			cacheFilterName.name +="case_id:("+ obj.case_id + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseDiagnose')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getModelByName('Diagnosis').findAll({
					attributes: [['bin_to_uuid(diagnosis_id)', 'diagnosis_id'],
						'diagnosis_submitter_id',
						['bin_to_uuid(case_id)', 'case_id'],
						'case_submitter_id',
						'age_at_diagnosis',
						'classification_of_tumor',
						['IFNULL(days_to_last_follow_up, "N/A")', 'days_to_last_follow_up'],
						['IFNULL(days_to_last_known_disease_status, "N/A")', 'days_to_last_known_disease_status'],
						['IFNULL(days_to_recurrence, "N/A")', 'days_to_recurrence'],
						'last_known_disease_status',
						'morphology',
						'primary_diagnosis',
						'progression_or_recurrence',
						'site_of_resection_or_biopsy',
						'tissue_or_organ_of_origin',
						'tumor_grade',
						'tumor_stage',
						'tumor_largest_dimension_diameter',
						'prior_malignancy',
						'ajcc_clinical_m',
						'ajcc_clinical_n',
						'ajcc_clinical_stage',
						'ajcc_clinical_t',
						'ajcc_pathologic_m',
						'ajcc_pathologic_n',
						'ajcc_pathologic_stage',
						'ajcc_pathologic_t',
						'ajcc_staging_system_edition',
						'ann_arbor_b_symptoms',
						'ann_arbor_clinical_stage',
						'ann_arbor_extranodal_involvement',
						'ann_arbor_pathologic_stage',
						'best_overall_response',
						'burkitt_lymphoma_clinical_variant',
						'circumferential_resection_margin',
						'colon_polyps_history',
						'days_to_best_overall_response',
						'days_to_diagnosis',
						'days_to_hiv_diagnosis',
						'days_to_new_event',
						'figo_stage',
						'hiv_positive',
						'hpv_positive_type',
						'hpv_status',
						'iss_stage',
						'laterality',
						'ldh_level_at_diagnosis',
						'ldh_normal_range_upper',
						'lymph_nodes_positive',
						'lymphatic_invasion_present',
						'method_of_diagnosis',
						'new_event_anatomic_site',
						'new_event_type',
						'overall_survival',
						'perineural_invasion_present',
						'prior_treatment',
						'progression_free_survival',
						'progression_free_survival_event',
						'residual_disease',
						'vascular_invasion_present',
						'year_of_diagnosis',
						'icd_10_code',
						'synchronous_malignancy',
						'anaplasia_present',
						'anaplasia_present_type',
						'child_pugh_classification',
						'cog_liver_stage',
						'cog_neuroblastoma_risk_group',
						'cog_renal_stage',
						'cog_rhabdomyosarcoma_risk_group',
						'enneking_msts_grade',
						'enneking_msts_metastasis',
						'enneking_msts_stage',
						'enneking_msts_tumor_site',
						'esophageal_columnar_dysplasia_degree',
						'esophageal_columnar_metaplasia_present',
						'first_symptom_prior_to_diagnosis',
						'gastric_esophageal_junction_involvement',
						'goblet_cells_columnar_mucosa_present',
						'gross_tumor_weight',
						'inpc_grade',
						'inpc_histologic_group',
						'inrg_stage',
						'inss_stage',
						'irs_group',
						'irs_stage',
						'ishak_fibrosis_score',
						'lymph_nodes_tested',
						'medulloblastoma_molecular_classification',
						'metastasis_at_diagnosis',
						'metastasis_at_diagnosis_site',
						'mitosis_karyorrhexis_index',
						'peripancreatic_lymph_nodes_positive',
						'peripancreatic_lymph_nodes_tested',
						'supratentorial_localization',
						'tumor_confined_to_organ_of_origin',
						'tumor_focality',
						'tumor_regression_grade',
						'vascular_invasion_type',
						'wilms_tumor_histologic_subtype',
						'breslow_thickness',
						'gleason_grade_group',
						'igcccg_stage',
						'international_prognostic_index',
						'largest_extrapelvic_peritoneal_focus',
						'masaoka_stage',
						'non_nodal_regional_disease',
						'non_nodal_tumor_deposits',
						'ovarian_specimen_status',
						'ovarian_surface_involvement',
						'percent_tumor_invasion',
						'peritoneal_fluid_cytological_status',
						'primary_gleason_grade',
						'secondary_gleason_grade',
						'weiss_assessment_score',
						'adrenal_hormone',
						'ann_arbor_b_symptoms_described',
						'diagnosis_is_primary_disease',
						'eln_risk_classification',
						'figo_staging_edition_year',
						'gleason_grade_tertiary',
						'gleason_patterns_percent',
						'margin_distance',
						'margins_involved_site',
						'pregnant_at_diagnosis',
						'satellite_nodule_present',
						'sites_of_involvement',
						'tumor_depth',
						'auxiliary_data',
						'tumor_cell_content',
						'who_cns_grade',
						'who_nte_grade',
						'diagnosis_uuid'					
					],
					where: {
						case_id: Sequelize.fn('uuid_to_bin', obj.case_id )
						//case_submitter_id: obj.case_submitter_id
					}
				});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('CaseDiagnose')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		samples(obj, args, context) {
			//var cacheFilterName = { name: '' };
			//cacheFilterName.name += "case_id:(" + obj.case_id + ");";
			//const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseSample') + cacheFilterName['name']);
			//if (res === null) {
				//@@@PDC-2755 add pool, status, sample_is_ref attribute
				//@@@4486 add new columns for sample
				//@@@PDC-4569 remove is_ffpe and oct_embedded
				/*var result = await db.getModelByName('Sample').findAll({
					attributes: [['bin_to_uuid(sample_id)', 'sample_id'], 'sample_submitter_id', 'sample_type', 'sample_type_id', 'gdc_sample_id', 'gdc_project_id', 'biospecimen_anatomic_site', 'composition', 'current_weight', 'days_to_collection', 'days_to_sample_procurement', 'status', 'pool', 'sample_is_ref', 'diagnosis_pathologically_confirmed', 'freezing_method', 'initial_weight', 'intermediate_dimension', 'longest_dimension', 'method_of_sample_procurement', 'pathology_report_uuid', 'preservation_method', 'shortest_dimension', 'time_between_clamping_and_freezing', 'time_between_excision_and_freezing', 'tissue_type', 'tumor_code', 'tumor_code_id', 'tumor_descriptor', 'biospecimen_laterality', 'catalog_reference', 'distance_normal_to_tumor', 'distributor_reference', 'growth_rate', 'passage_count', 'sample_ordinal', 'tissue_collection_type'],
					where: {
						case_id: Sequelize.fn('uuid_to_bin', obj.case_id )
						//case_submitter_id: obj.case_submitter_id
					}
				});*/
				logger.info("samples is called via "+context.parent);
				//@@@PDC-5178 case-sample-aliquot across studies
				let sampleQuery = "select distinct bin_to_uuid(sam.sample_id) as sample_id, sam.sample_submitter_id, sample_type, sample_type_id, gdc_sample_id, gdc_project_id, biospecimen_anatomic_site, composition, current_weight, days_to_collection, days_to_sample_procurement, sam.status, sam.pool, sample_is_ref, diagnosis_pathologically_confirmed, freezing_method, initial_weight, intermediate_dimension, longest_dimension, method_of_sample_procurement, pathology_report_uuid, preservation_method, shortest_dimension, time_between_clamping_and_freezing, time_between_excision_and_freezing, tissue_type, tumor_code, tumor_code_id, tumor_descriptor, biospecimen_laterality, catalog_reference, distance_normal_to_tumor, distributor_reference, growth_rate, passage_count, sample_ordinal, tissue_collection_type "+
				"FROM study s, sample sam, aliquot_run_metadata alm, aliquot al, project proj, program prog "+
				"WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id and al.sample_id=sam.sample_id and proj.project_id = s.project_id and sam.case_id = uuid_to_bin(:case_id) ";
				
				let cache = { name:'' };
				let replacements = {};
				
				sampleQuery += replacementFilters(context.arguments, cache, replacements);
				
				replacements['case_id'] = obj.case_id;
				
				return db.getSequelize().query(
						sampleQuery,
						{
							replacements: replacements,
							model: db.getModelByName('Sample')
						}
					);
				
				//RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('CaseSample') + cacheFilterName['name'], JSON.stringify(result));
				//return result;
			//} else {
				//return JSON.parse(res);
			//}
		}
	},
	//@@@PDC-5252 fetch diagnosis-sample association
	//@@@PDC-5412 add diagnosis-sample annotation	
	Diagnosis: {
		samples(obj, args, context) {
			logger.info("samples is called via "+context.parent);
			let refQuery = "select bin_to_uuid(reference_entity_id) sample_id, "+
			"reference_entity_alias as sample_submitter_id, annotation from reference where entity_id = "+
			"uuid_to_bin(:diagnosis_id) and reference_entity_type = 'sample'"
			let replacements = {};
			replacements['diagnosis_id'] = obj.diagnosis_id;
			return db.getSequelize().query(
					refQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Sample')
					}
			);
							
		}
	},
	Sample: {
		aliquots(obj, args, context) {
			logger.info("aliquots is called via "+context.parent);
			//@@@PDC-2755 add pool, status, aliquot_is_ref attribute
			//@@@PDC-5178 case-sample-aliquot across studies
			let aliquotQuery = "select distinct bin_to_uuid(al.aliquot_id) aliquot_id, al.aliquot_submitter_id, analyte_type, aliquot_quantity, aliquot_volume, amount, concentration, al.pool, al.status, aliquot_is_ref "+
			"FROM study s, aliquot_run_metadata alm, aliquot al, project proj, program prog "+
			"WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id and proj.project_id = s.project_id and al.sample_id = uuid_to_bin(:sample_id) ";
			let cache = { name:'' };
			let replacements = {};	
			aliquotQuery += replacementFilters(context.arguments, cache, replacements);
				
			replacements['sample_id'] = obj.sample_id;
				
			return db.getSequelize().query(
						aliquotQuery,
						{
							replacements: replacements,
							model: db.getModelByName('Aliquot')
						}
				);
				
		},
		//@@@PDC-5252 fetch diagnosis-sample association
		//@@@PDC-5412 add diagnosis-sample annotation	
		diagnoses(obj, args, context) {
			logger.info("diagnoses is called via "+context.parent);
			let refQuery = "select bin_to_uuid(entity_id) diagnosis_id, annotation, "+
			"entity_submitter_id as diagnosis_submitter_id from reference where reference_entity_id = "+
			"uuid_to_bin(:sample_id) and entity_type = 'diagnosis'"
			let replacements = {};
			replacements['sample_id'] = obj.sample_id;
			return db.getSequelize().query(
					refQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Diagnosis')
					}
			);
							
		}
	},
	//@@@PDC-2366 Add aliquot_run_metadata_id to aliquot_run_metadata API entity
	Aliquot:{
		aliquot_run_metadata(obj, args, context) {
			logger.info("aliquot_run_metadata is called via "+context.parent);
			// db.getModelByName('ModelAliquotRunMetadata').findAll({attributes: ['aliquot_submitter_id', ['bin_to_uuid(aliquot_run_metadata_id)','aliquot_run_metadata_id']],
			// where: {aliquot_submitter_id: obj.aliquot_submitter_id}
			// });
			let aliquotQuery = "select aliquot_submitter_id , bin_to_uuid(aliquot_run_metadata_id) as aliquot_run_metadata_id FROM aliquot_run_metadata where bin_to_uuid(aliquot_id) = '"+ obj.aliquot_id +"'";
			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
		}
	},
	//@@@PDC-2614 rearrange geneSpectralCount
	//@@@PDC-3668 add project_id and study_id
	Gene: {
		spectral_counts(obj, args, context) {
			logger.info("spectral_counts is called via "+context.parent);
			var spQuery = "";
			if (typeof context.arguments.dataset_alias != 'undefined'){
				//@@@PDC-2638 enhance aliquotSpectralCount
				//@@@PDC-6285 force case insenetive on gene_name
				spQuery = "SELECT bin_to_uuid(s.project_id) as project_id, s.project_submitter_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, pdc_study_id, dataset_alias as plex, spectral_count, distinct_peptide, unshared_peptide from spectral_count sp left join study s on sp.study_id = s.study_id where dataset_alias like '%"+context.arguments.dataset_alias+"%' and gene_name = '"+
				obj.gene_name+"' COLLATE utf8mb4_general_ci";

			}
			else {
				spQuery = "SELECT bin_to_uuid(s.project_id) as project_id, s.project_submitter_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, pdc_study_id, dataset_alias as plex, spectral_count, distinct_peptide, unshared_peptide from spectral_count sp left join study s on sp.study_id = s.study_id where plex_name = 'All' and gene_name = '"+
				obj.gene_name+"'  COLLATE utf8mb4_general_ci";

			}
			return db.getSequelize().query(spQuery, { model: db.getModelByName('Spectral') });
		}
	},
	GeneSp: {
		async spectral_counts(obj, args, context) {
			logger.info("spectral_counts is called via "+context.parent);
			var cacheFilterName = {name:''};
			cacheFilterName.name +="sp_gene_name:("+ obj.gene_name + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name']);
			if(res === null){
				var spQuery = "SELECT project_submitter_id, study_submitter_id, dataset_alias as plex, spectral_count, distinct_peptide, unshared_peptide from spectral_count where plex_name = 'All' and gene_name = '"+obj.gene_name+"'";
				var result = await db.getSequelize().query(spQuery, { model: db.getModelByName('Spectral') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		}
	},
	FileMetadata: {
		aliquots(obj, args, context) {
			logger.info("aliquots is called via "+context.parent);
			//@@@PDC-490 display label for all aliquot_ids in aliquot_run_metadata
			//@@@PDC-898 new public APIs--fileMetadata
			var aliquotQuery = "select distinct bin_to_uuid(arm.aliquot_id) as aliquot_id, "+
			"arm.aliquot_submitter_id, arm.label, bin_to_uuid(a.sample_id) as sample_id, "+
			"a.sample_submitter_id, bin_to_uuid(c.case_id) as case_id, c.case_submitter_id from file f "+
			"join study_file sf on f.file_id = sf.file_id "+
			"left join study_run_metadata srm on sf.study_run_metadata_id = srm.study_run_metadata_id "+
			//"join study_run_metadata srm on sf.study_id = srm.study_id "+
            "join aliquot_run_metadata arm on srm.study_run_metadata_id = arm.study_run_metadata_id "+
            "left join aliquot a on arm.aliquot_id = a.aliquot_id "+
            "left join sample sam on a.sample_id = sam.sample_id "+
            "left join `case` c on sam.case_id = c.case_id "+
			"where f.file_name = '"+ obj.file_name + "'";

			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('Aliquot') });
		}
	},
	//@@@PDC-191 experimental metadata API
	//@@@PDC-3668 add study_run_metadata_id to output
	ExperimentalMetadata: {
		study_run_metadata(obj, args, context) {
			logger.info("study_run_metadata is called via "+context.parent);
			//@@@PDC-1120 StudyRunMetadata table change
			return db.getModelByName('ModelStudyRunMetadata').findAll({attributes: [['bin_to_uuid(study_run_metadata_id)', 'study_run_metadata_id'],'study_run_metadata_submitter_id', 'fraction'],
			where: {study_submitter_id: obj.study_submitter_id}
			});
		}
	},
	//@@@PDC-3921 new studyCatalog api
	StudyCatalogEntry: {
		versions(obj, args, context) {
			logger.info("versions is called via "+context.parent);
			var verQuery = "SELECT bin_to_uuid(study_id) as study_id, study_submitter_id, "+
			"study_shortname, submitter_id_name, study_version, if(is_latest_version, 'yes', 'no') as is_latest_version FROM study WHERE pdc_study_id = '" +obj.pdc_study_id+ "' order by study_version desc";
			return db.getSequelize().query(verQuery, { model: db.getModelByName('ModelStudy') });
		}
	},
	//@@@PDC-2366 Add aliquot_run_metadata_id to aliquot_run_metadata API entity
	//@@@PDC-3668 add aliquot_id to output
	StudyRunMetadata: {
		aliquot_run_metadata(obj, args, context) {
			logger.info("aliquot_run_metadata is called via "+context.parent);
			let aliquotQuery = "select bin_to_uuid(aliquot_id) as aliquot_id, aliquot_submitter_id , bin_to_uuid(aliquot_run_metadata_id) as aliquot_run_metadata_id FROM aliquot_run_metadata where study_run_metadata_submitter_id = '"+ obj.study_run_metadata_submitter_id +"'";
			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			// db.getModelByName('ModelAliquotRunMetadata').findAll({attributes: ['aliquot_submitter_id'],
			// 	where: {study_run_metadata_submitter_id: obj.study_run_metadata_submitter_id}
			// });
		},
		//@@@PDC-774 add downloadable
		files(obj, args, context) {
			logger.info("files is called via "+context.parent);
			var fileQuery = "SELECT file.file_type as file_type, file.data_category, file.downloadable, file.file_location "+
			"FROM file AS file, study AS study, study_file AS sf "+
			"WHERE file.file_id = sf.file_id and study.study_id = sf.study_id "+
			"and sf.study_run_metadata_submitter_id = '"+ obj.study_run_metadata_submitter_id +"'";
			return db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });

		}
	},
	//@@@PDC-2026 add case external reference
	//@@@PDC-4259 add exposure, family history, follow up and treatment
	//@@@PDC-4391 add new columns
	UIClinical: {
		async externalReferences(obj, args, context) {
			logger.info("externalReferences is called via "+context.parent);
			var refCacheName = context.dataCacheName + ':'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			if (res === null) {
				var refQuery = "SELECT reference_resource_shortname, reference_entity_location FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelEntityReference') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async exposures(obj, args, context) {
			logger.info("exposures is called via "+context.parent);
			var refCacheName = context.dataCacheName + ':Exposure:'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			//@@@PDC-4639 remove bmi, height and weight columns from exposure
			if (res === null) {
				var refQuery = "SELECT bin_to_uuid(exposure_id) as exposure_id, exposure_submitter_id, alcohol_days_per_week, alcohol_drinks_per_day, alcohol_history, alcohol_intensity, asbestos_exposure, cigarettes_per_day, coal_dust_exposure, environmental_tobacco_smoke_exposure, pack_years_smoked, radon_exposure, respirable_crystalline_silica_exposure, smoking_frequency, time_between_waking_and_first_smoke, tobacco_smoking_onset_year, tobacco_smoking_quit_year, tobacco_smoking_status, type_of_smoke_exposure, type_of_tobacco_used, years_smoked, age_at_onset, alcohol_type, exposure_duration, exposure_duration_years, exposure_type, marijuana_use_per_week, parent_with_radiation_exposure, secondhand_smoke_as_child, smokeless_tobacco_quit_age, tobacco_use_per_day FROM exposure where case_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelExposure') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async family_histories(obj, args, context) {
			logger.info("family_histories is called via "+context.parent);
			var refCacheName = context.dataCacheName + ':FamilyHistory:'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			if (res === null) {
				var refQuery = "SELECT bin_to_uuid(family_history_id) as family_history_id, family_history_submitter_id, relationship_type, relationship_gender, relationship_age_at_diagnosis, relationship_primary_diagnosis, relative_with_cancer_history, relatives_with_cancer_history_count FROM family_history where case_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFamilyHistory') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async follow_ups(obj, args, context) {
			logger.info("follow_ups is called via "+context.parent);
			var refCacheName = context.dataCacheName + ':FollowUp:'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			if (res === null) {
				var refQuery = "SELECT bin_to_uuid(follow_up_id) as follow_up_id, follow_up_submitter_id, adverse_event, barretts_esophagus_goblet_cells_present, bmi, cause_of_response, comorbidity, comorbidity_method_of_diagnosis, days_to_adverse_event, days_to_comorbidity, days_to_follow_up, days_to_progression, days_to_progression_free, days_to_recurrence, diabetes_treatment_type, disease_response, dlco_ref_predictive_percent, ecog_performance_status, fev1_ref_post_bronch_percent, fev1_ref_pre_bronch_percent, fev1_fvc_pre_bronch_percent, fev1_fvc_post_bronch_percent, height, hepatitis_sustained_virological_response, hpv_positive_type, karnofsky_performance_status, menopause_status, pancreatitis_onset_year, progression_or_recurrence, progression_or_recurrence_anatomic_site, progression_or_recurrence_type, reflux_treatment_type, risk_factor, risk_factor_treatment, viral_hepatitis_serologies, weight, adverse_event_grade, aids_risk_factors, body_surface_area, cd4_count, cdc_hiv_risk_factors, days_to_imaging, evidence_of_recurrence_type, eye_color, haart_treatment_indicator, history_of_tumor, history_of_tumor_type, hiv_viral_load, hormonal_contraceptive_type, hormonal_contraceptive_use, hormone_replacement_therapy_type, hysterectomy_margins_involved, hysterectomy_type, imaging_result, imaging_type, immunosuppressive_treatment_type, nadir_cd4_count, pregnancy_outcome, procedures_performed, recist_targeted_regions_number, recist_targeted_regions_sum, scan_tracer_used, undescended_testis_corrected, undescended_testis_corrected_age, undescended_testis_corrected_laterality, undescended_testis_corrected_method, undescended_testis_history, undescended_testis_history_laterality FROM follow_up where case_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFollowUp') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async treatments(obj, args, context) {
			logger.info("treatments is called via "+context.parent);
			var refCacheName = context.dataCacheName + ':Treatment:'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			if (res === null) {
				var refQuery = "SELECT bin_to_uuid(treatment_id) as treatment_id, treatment_submitter_id, days_to_treatment_end, days_to_treatment_start, initial_disease_status, regimen_or_line_of_therapy, therapeutic_agents, treatment_anatomic_site, treatment_effect, treatment_intent_type, treatment_or_therapy, treatment_outcome, treatment_type, chemo_concurrent_to_radiation, number_of_cycles, reason_treatment_ended, route_of_administration, treatment_arm, treatment_dose, treatment_dose_units, treatment_effect_indicator, treatment_frequency FROM treatment where case_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelTreatment') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		//@@@PDC-5252 fetch diagnosis-sample association
		//@@@PDC-5412 add diagnosis-sample annotation	
		samples(obj, args, context) {
			logger.info("samples is called via "+context.parent);
			/*let refQuery = "select bin_to_uuid(reference_entity_id) sample_id, annotation, "+
			"reference_entity_alias as sample_submitter_id from reference where entity_id = "+
			"uuid_to_bin(:diagnosis_id) and reference_entity_type = 'sample'"*/
			//@@@PDC-6397 concat sample info
			let refQuery = "select "+
			"GROUP_CONCAT(DISTINCT bin_to_uuid(reference_entity_id) SEPARATOR '|') AS sample_id, "+
			"GROUP_CONCAT(DISTINCT annotation SEPARATOR '|') AS annotation, "+
			"GROUP_CONCAT(DISTINCT reference_entity_alias  SEPARATOR '|') as sample_submitter_id "+
			"from reference where entity_id = "+
			"uuid_to_bin(:diagnosis_id) and reference_entity_type = 'sample'"
			let replacements = {};
			replacements['diagnosis_id'] = obj.diagnosis_id;
			return db.getSequelize().query(
					refQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Sample')
					}
			);
							
		}
	},
	//@@@PDC-2978 add case external reference
	//@@@PDC-4391 add new columns
	//@@@PDC-5329 add samples associated with diagnosis
	//@@@PDC-5412 add diagnosis-sample annotation	
	Clinical: {
		samples(obj, args, context) {
			logger.info("samples is called via "+context.parent);
			let refQuery = "select bin_to_uuid(reference_entity_id) sample_id, annotation, "+
			"reference_entity_alias as sample_submitter_id from reference where entity_id = "+
			"uuid_to_bin(:diagnosis_id) and reference_entity_type = 'sample'"
			let replacements = {};
			replacements['diagnosis_id'] = obj.diagnosis_id;
			return db.getSequelize().query(
					refQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Sample')
					}
			);
							
		},
		externalReferences(obj, args, context) {
			logger.info("externalReferences is called via "+context.parent);
			//var refQuery = "SELECT reference_resource_shortname, trim(both '\r' from reference_entity_location) as reference_entity_location FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
			var refQuery = "SELECT reference_resource_shortname, trim(both '\r' from reference_entity_location) as reference_entity_location, reference_entity_alias as external_reference_id, reference_resource_name FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelEntityReference') });
		},
		//@@@PDC-4293 add new clinbio entities
		exposures(obj, args, context) {
			logger.info("exposures is called via "+context.parent);
				//@@@PDC-4639 remove bmi, height and weight columns from exposure
				var refQuery = "SELECT bin_to_uuid(exposure_id) as exposure_id, exposure_submitter_id, alcohol_days_per_week, alcohol_drinks_per_day, alcohol_history, alcohol_intensity, asbestos_exposure, cigarettes_per_day, coal_dust_exposure, environmental_tobacco_smoke_exposure, pack_years_smoked, radon_exposure, respirable_crystalline_silica_exposure, smoking_frequency, time_between_waking_and_first_smoke, tobacco_smoking_onset_year, tobacco_smoking_quit_year, tobacco_smoking_status, type_of_smoke_exposure, type_of_tobacco_used, years_smoked, age_at_onset, alcohol_type, exposure_duration, exposure_duration_years, exposure_type, marijuana_use_per_week, parent_with_radiation_exposure, secondhand_smoke_as_child, smokeless_tobacco_quit_age, tobacco_use_per_day FROM exposure where case_id = uuid_to_bin('"+ obj.case_id + "')";
				return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelExposure') });
		},
		family_histories(obj, args, context) {
			logger.info("family_histories is called via "+context.parent);
				var refQuery = "SELECT bin_to_uuid(family_history_id) as family_history_id, family_history_submitter_id, relationship_type, relationship_gender, relationship_age_at_diagnosis, relationship_primary_diagnosis, relative_with_cancer_history, relatives_with_cancer_history_count FROM family_history where case_id = uuid_to_bin('"+ obj.case_id + "')";
				return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFamilyHistory') });
		},
		follow_ups(obj, args, context) {
			logger.info("follow_ups is called via "+context.parent);
				var refQuery = "SELECT bin_to_uuid(follow_up_id) as follow_up_id, follow_up_submitter_id, adverse_event, barretts_esophagus_goblet_cells_present, bmi, cause_of_response, comorbidity, comorbidity_method_of_diagnosis, days_to_adverse_event, days_to_comorbidity, days_to_follow_up, days_to_progression, days_to_progression_free, days_to_recurrence, diabetes_treatment_type, disease_response, dlco_ref_predictive_percent, ecog_performance_status, fev1_ref_post_bronch_percent, fev1_ref_pre_bronch_percent, fev1_fvc_pre_bronch_percent, fev1_fvc_post_bronch_percent, height, hepatitis_sustained_virological_response, hpv_positive_type, karnofsky_performance_status, menopause_status, pancreatitis_onset_year, progression_or_recurrence, progression_or_recurrence_anatomic_site, progression_or_recurrence_type, reflux_treatment_type, risk_factor, risk_factor_treatment, viral_hepatitis_serologies, weight, adverse_event_grade, aids_risk_factors, body_surface_area, cd4_count, cdc_hiv_risk_factors, days_to_imaging, evidence_of_recurrence_type, eye_color, haart_treatment_indicator, history_of_tumor, history_of_tumor_type, hiv_viral_load, hormonal_contraceptive_type, hormonal_contraceptive_use, hormone_replacement_therapy_type, hysterectomy_margins_involved, hysterectomy_type, imaging_result, imaging_type, immunosuppressive_treatment_type, nadir_cd4_count, pregnancy_outcome, procedures_performed, recist_targeted_regions_number, recist_targeted_regions_sum, scan_tracer_used, undescended_testis_corrected, undescended_testis_corrected_age, undescended_testis_corrected_laterality, undescended_testis_corrected_method, undescended_testis_history, undescended_testis_history_laterality FROM follow_up where case_id = uuid_to_bin('"+ obj.case_id + "')";
				return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelFollowUp') });
		},
		treatments(obj, args, context) {
			logger.info("treatments is called via "+context.parent);
				var refQuery = "SELECT bin_to_uuid(treatment_id) as treatment_id, treatment_submitter_id, days_to_treatment_end, days_to_treatment_start, initial_disease_status, regimen_or_line_of_therapy, therapeutic_agents, treatment_anatomic_site, treatment_effect, treatment_intent_type, treatment_or_therapy, treatment_outcome, treatment_type, chemo_concurrent_to_radiation, number_of_cycles, reason_treatment_ended, route_of_administration, treatment_arm, treatment_dose, treatment_dose_units, treatment_effect_indicator, treatment_frequency  FROM treatment where case_id = uuid_to_bin('"+ obj.case_id + "')";
				return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelTreatment') });
		}
	},
	Biospecimen: {
		externalReferences(obj, args, context) {
			logger.info("externalReferences is called via "+context.parent);
			var refQuery = "SELECT reference_resource_shortname, trim(both '\r' from reference_entity_location) as reference_entity_location, reference_entity_alias as external_reference_id, reference_resource_name FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
			return db.getSequelize().query(refQuery, { model: db.getModelByName('ModelEntityReference') });
		}
	},
	//@@@PDC-788 remove hard-coded file types
	//@@@PDC-2377 add supplementary file counts
	UIStudy: {
		async filesCount(obj, args, context) {
			logger.info("filesCount is called via "+context.parent);
			var fileCacheName = context.dataCacheName + ':'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(fileCacheName);
			if (res === null) {
				//@@@PDC-794 order by data_category
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM file f, study s, study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id +
				"') group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(fileCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		//@@@PDC-2435 add contacts to study
		async contacts(obj, args, context) {
			logger.info("contacts is called via "+context.parent);
			var contactCacheName = context.dataCacheName + ':contact:'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(contactCacheName);
			if (res === null) {
				var fileQuery = "SELECT c.name, c.institution, c.email, c.url "+
				"FROM contact c, study s, study_contact sc "+
				"WHERE c.contact_id = sc.contact_id and s.study_id = sc.study_id "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id + "')";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('Contact') });
				RedisCacheClient.redisCacheSetExAsync(contactCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		//@@@PDC-2938 add versions to study summary
		async versions(obj, args, context) {
			logger.info("versions is called via "+context.parent);
			var contactCacheName = context.dataCacheName + ':version:'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(contactCacheName);
			if (res === null) {
				var fileQuery = "SELECT study_version as number "+
				"FROM study s "+
				"WHERE s.pdc_study_id like '"+ obj.pdc_study_id + "%' order by study_version desc ";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelVersion') });
				RedisCacheClient.redisCacheSetExAsync(contactCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async supplementaryFilesCount(obj, args, context) {
			logger.info("supplementaryFilesCount is called via "+context.parent);
			var suppFileCacheName = context.dataCacheName + ':supp:'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(suppFileCacheName);
			if (res === null) {
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM file f, study s, study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and f.data_source = 'Submitter' and f.data_category <> 'Raw Mass Spectra' "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id +
				"') group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(suppFileCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async nonSupplementaryFilesCount(obj, args, context) {
			logger.info("nonSupplementaryFilesCount is called via "+context.parent);
			var nonSuppFileCacheName = context.dataCacheName + ':nonSupp:'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(nonSuppFileCacheName);
			if (res === null) {
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM file f, study s, study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and (f.data_source = 'CDAP' or (f.data_source = 'Submitter' and f.data_category = 'Raw Mass Spectra')) "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id +
				"') group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(nonSuppFileCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		}
	},
	//@@@PDC-898 new public APIs--study
	Study: {
		//@@@PDC-3966 add more study fields per CDA request
		async disease_types(obj, args, context) {
			logger.info("disease_types is called via "+context.parent);
			var diseaseQuery = "SELECT distinct c.disease_type as disease_type FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm WHERE alm.study_id = s.study_id and al.aliquot_id "+
			" = alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and s.study_id = uuid_to_bin('"+
			obj.study_id + "')";
			var diseases = await db.getSequelize().query(diseaseQuery, { raw: true });
			var diseaseTypes = [];
			diseases[0].forEach((row) =>diseaseTypes.push(row['disease_type']));
			return diseaseTypes;
		},
		async primary_sites(obj, args, context) {
			logger.info("primary_sites is called via "+context.parent);
			var siteQuery = "SELECT distinct c.primary_site as primary_site FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm WHERE alm.study_id = s.study_id and al.aliquot_id "+
			" = alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and s.study_id = uuid_to_bin('"+
			obj.study_id + "')";
			var sites = await db.getSequelize().query(siteQuery, { raw: true });
			var primarySites = [];
			sites[0].forEach((row) =>primarySites.push(row['primary_site']));
			return primarySites;
		},
		//@@@PDC-2435 add contacts to study
		contacts(obj, args, context) {
			logger.info("contacts is called via "+context.parent);
			var contactQuery = "SELECT c.name, c.institution, c.email, c.url "+
			"FROM contact c, study s, study_contact sc "+
			"WHERE c.contact_id = sc.contact_id and s.study_id = sc.study_id "+
			"and s.is_latest_version = 1 and s.study_submitter_id = '"+ obj.study_submitter_id + "'";
			return db.getSequelize().query(contactQuery, { model: db.getModelByName('Contact') });
		},
		filesCount(obj, args, context) {
			logger.info("filesCount is called via "+context.parent);
			var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
			"FROM file f, study s, study_file sf "+
			"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
			"and s.study_id = uuid_to_bin('"+ obj.study_id +
			"') group by f.data_category, f.file_type order by f.data_category";
			return db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
		}
	},
	//@@@PDC-3847 get aliquot info per label
	StudyExperimentalDesign: {
		label_free(obj, args, context) {
			logger.info("label_free is called via "+context.parent);
			//logger.info("label free: "+JSON.stringify(obj));
			if (obj.label_free_asi != null && obj.label_free_asi.length > 0){
				let lfQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.label_free_asi+"' and label = 'label_free' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(lfQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_113(obj, args, context) {
			logger.info("itraq_113 is called via "+context.parent);
			if (obj.itraq_113_asi != null && obj.itraq_113_asi.length > 0){
				let itraq_113Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_113_asi+"' and label = 'itraq_113' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_113Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_114(obj, args, context) {
			logger.info("itraq_114 is called via "+context.parent);
			if (obj.itraq_114_asi != null && obj.itraq_114_asi.length > 0){
				let itraq_114Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_114_asi+"' and label = 'itraq_114' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_114Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_115(obj, args, context) {
			logger.info("itraq_115 is called via "+context.parent);
			if (obj.itraq_115_asi != null && obj.itraq_115_asi.length > 0){
				let itraq_115Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_115_asi+"' and label = 'itraq_115' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_115Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_116(obj, args, context) {
			logger.info("itraq_116 is called via "+context.parent);
			if (obj.itraq_116_asi != null && obj.itraq_116_asi.length > 0){
				let itraq_116Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_116_asi+"' and label = 'itraq_116' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_116Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_117(obj, args, context) {
			logger.info("itraq_117 is called via "+context.parent);
			if (obj.itraq_117_asi != null && obj.itraq_117_asi.length > 0){
				let itraq_117Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_117_asi+"' and label = 'itraq_117' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_117Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_118(obj, args, context) {
			logger.info("itraq_118 is called via "+context.parent);
			if (obj.itraq_118_asi != null && obj.itraq_118_asi.length > 0){
				let itraq_118Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_118_asi+"' and label = 'itraq_118' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_118Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_119(obj, args, context) {
			logger.info("itraq_119 is called via "+context.parent);
			if (obj.itraq_119_asi != null && obj.itraq_119_asi.length > 0){
				let itraq_119Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_119_asi+"' and label = 'itraq_119' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_119Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		itraq_121(obj, args, context) {
			logger.info("itraq_121 is called via "+context.parent);
			if (obj.itraq_121_asi != null && obj.itraq_121_asi.length > 0){
				let itraq_121Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.itraq_121_asi+"' and label = 'itraq_121' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(itraq_121Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_126(obj, args, context) {
			logger.info("tmt_126 is called via "+context.parent);
			if (obj.tmt_126_asi != null && obj.tmt_126_asi.length > 0){
				let tmt_126Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_126_asi+"' and label = 'tmt_126' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_126Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_127n(obj, args, context) {
			logger.info("tmt_127n is called via "+context.parent);
			if (obj.tmt_127n_asi != null && obj.tmt_127n_asi.length > 0){
				let tmt_127nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_127n_asi+"' and label = 'tmt_127n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_127nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_127c(obj, args, context) {
			logger.info("tmt_127c is called via "+context.parent);
			if (obj.tmt_127c_asi != null && obj.tmt_127c_asi.length > 0){
				let tmt_127cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_127c_asi+"' and label = 'tmt_127c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_127cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_128n(obj, args, context) {
			logger.info("tmt_128n is called via "+context.parent);
			if (obj.tmt_128n_asi != null && obj.tmt_128n_asi.length > 0){
				let tmt_128nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_128n_asi+"' and label = 'tmt_128n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_128nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_128c(obj, args, context) {
			logger.info("tmt_128c is called via "+context.parent);
			if (obj.tmt_128c_asi != null && obj.tmt_128c_asi.length > 0){
				let tmt_128cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_128c_asi+"' and label = 'tmt_128c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_128cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_129n(obj, args, context) {
			logger.info("tmt_129n is called via "+context.parent);
			if (obj.tmt_129n_asi != null && obj.tmt_129n_asi.length > 0){
				let tmt_129nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_129n_asi+"' and label = 'tmt_129n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_129nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_129c(obj, args, context) {
			logger.info("tmt_129c is called via "+context.parent);
			if (obj.tmt_129c_asi != null && obj.tmt_129c_asi.length > 0){
				let tmt_129cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_129c_asi+"' and label = 'tmt_129c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_129cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_130c(obj, args, context) {
			logger.info("tmt_130c is called via "+context.parent);
			if (obj.tmt_130c_asi != null && obj.tmt_130c_asi.length > 0){
				let tmt_130cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_130c_asi+"' and label = 'tmt_130c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_130cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_130n(obj, args, context) {
			logger.info("tmt_130n is called via "+context.parent);
			if (obj.tmt_130n_asi != null && obj.tmt_130n_asi.length > 0){
				let tmt_130nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_130n_asi+"' and label = 'tmt_130n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_130nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_131(obj, args, context) {
			logger.info("tmt_131 is called via "+context.parent);
			if (obj.tmt_131_asi != null && obj.tmt_131_asi.length > 0){
				let tmt_131Query = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_131_asi+"' and label = 'tmt_131' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_131Query, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_131c(obj, args, context) {
			logger.info("tmt_131c is called via "+context.parent);
			if (obj.tmt_131c_asi != null && obj.tmt_131c_asi.length > 0){
				let tmt_131cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_131c_asi+"' and label = 'tmt_131c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_131cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		//@@@PDC-5290 add experiment types of TMT16 and TMT18
		tmt_132n(obj, args, context) {
			logger.info("tmt_132n is called via "+context.parent);
			if (obj.tmt_132n_asi != null && obj.tmt_132n_asi.length > 0){
				let tmt_132nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_132n_asi+"' and label = 'tmt_132n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_132nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_132c(obj, args, context) {
			logger.info("tmt_132c is called via "+context.parent);
			if (obj.tmt_132c_asi != null && obj.tmt_132c_asi.length > 0){
				let tmt_132cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_132c_asi+"' and label = 'tmt_132c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_132cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_133n(obj, args, context) {
			logger.info("tmt_133n is called via "+context.parent);
			if (obj.tmt_133n_asi != null && obj.tmt_133n_asi.length > 0){
				let tmt_133nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_133n_asi+"' and label = 'tmt_133n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_133nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_133c(obj, args, context) {
			logger.info("tmt_133c is called via "+context.parent);
			if (obj.tmt_133c_asi != null && obj.tmt_133c_asi.length > 0){
				let tmt_133cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_133c_asi+"' and label = 'tmt_133c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_133cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_134n(obj, args, context) {
			logger.info("tmt_134n is called via "+context.parent);
			if (obj.tmt_134n_asi != null && obj.tmt_134n_asi.length > 0){
				let tmt_134nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_134n_asi+"' and label = 'tmt_134n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_134nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_134c(obj, args, context) {
			logger.info("tmt_134c is called via "+context.parent);
			if (obj.tmt_134c_asi != null && obj.tmt_134c_asi.length > 0){
				let tmt_134cQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_134c_asi+"' and label = 'tmt_134c' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_134cQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		},
		tmt_135n(obj, args, context) {
			logger.info("tmt_135n is called via "+context.parent);
			if (obj.tmt_135n_asi != null && obj.tmt_135n_asi.length > 0){
				let tmt_135nQuery = labelQuery + " where aliquot_submitter_id = '"+
				obj.tmt_135n_asi+"' and label = 'tmt_135n' and study_run_metadata_id = uuid_to_bin('"+obj.study_run_metadata_id+"')";
				return db.getSequelize().query(tmt_135nQuery, { model: db.getModelByName('ModelAliquotRunMetadata') });
			}
			else
				return null;
		}
	},
	//@@@PDC-3362 handle legacy studies
	LegacyStudy: {
		async supplementaryFilesCount(obj, args, context) {
			logger.info("supplementaryFilesCount is called via "+context.parent);
			var suppFileCacheName = 'legacy:supp:'+obj.study_id;
			const res = await RedisCacheClient.redisCacheGetAsync(suppFileCacheName);
			//@@@PDC-3878 use data_category to decide supple or not
			if (res === null) {
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM legacy_file f, legacy_study s, legacy_study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and f.data_source = 'Submitter' "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id +
				"') group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(suppFileCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		async nonSupplementaryFilesCount(obj, args, context) {
			logger.info("nonSupplementaryFilesCount is called via "+context.parent);
			var nonSuppFileCacheName = 'legacy:nonSupp:'+obj.study_id;
			const res = await RedisCacheClient.redisCacheGetAsync(nonSuppFileCacheName);
			if (res === null) {
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM legacy_file f, legacy_study s, legacy_study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and f.data_source <> 'Submitter' "+
				"and s.study_id = uuid_to_bin('"+ obj.study_id +
				"') group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(nonSuppFileCacheName, JSON.stringify(getIt));
				return getIt;
			}
			return JSON.parse(res);
		},
		publications(obj, args, context) {
			logger.info("publications is called via "+context.parent);
			var pubQuery = "SELECT distinct bin_to_uuid(pub.publication_id) as publication_id, "+
			"pub.pubmed_id, pub.doi, pub.author, pub.title, pub.journal, pub.journal_url, pub.year, "+
			"pub.abstract, pub.citation FROM legacy_publication pub, legacy_study_publication sp "+
			"WHERE pub.publication_id = sp.publication_id and sp.study_id = uuid_to_bin('"+
			obj.study_id +"')";
			return db.getSequelize().query(pubQuery, { model: db.getModelByName('ModelUIPublication') });
		}
	},
	//@@@PDC-3803 get sup data for legacy publication.
	LegacyPublication: {
		async supplementary_data(obj, args, context) {
			logger.info("supplementary_data is called via "+context.parent);
			var suppleQuery = "SELECT distinct f.file_name as file_name FROM legacy_file f, legacy_study s, legacy_study_file sf, legacy_study_publication sp WHERE s.study_id = sf.study_id and sf.file_id = f.file_id and sp.study_id = s.study_id and f.data_category = 'Publication Supplementary Material' and sp.publication_id = uuid_to_bin('"+
			obj.publication_id + "') ";
			var supples = await db.getSequelize().query(suppleQuery, { raw: true });
			var suppleTypes = [];
			supples[0].forEach((row) =>suppleTypes.push(row['file_name']));
			return suppleTypes;
		}
	},
	//@@@PDC-3446 API for new publication screen
	Publication: {
		studies(obj, args, context) {
			logger.info("studies is called via "+context.parent);
			var studyQuery = "SELECT bin_to_uuid(s.study_id) as study_id, s.pdc_study_id, s.submitter_id_name "+
			"from study s, study_publication sp "+
			"where sp.study_id = s.study_id and sp.publication_id = uuid_to_bin('"+
			obj.publication_id + "') and s.is_latest_version = 1";
			return db.getSequelize().query(studyQuery, { model: db.getModelByName('ModelUIStudy') });
		},
		async disease_types(obj, args, context) {
			logger.info("disease_types is called via "+context.parent);
			var diseaseQuery = "SELECT distinct c.disease_type as disease_type FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm, study_publication sp WHERE alm.study_id = s.study_id and al.aliquot_id "+
			" = alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and sp.study_id = s.study_id and sp.publication_id = uuid_to_bin('"+
			obj.publication_id + "') and s.is_latest_version = 1 and c.disease_type != 'Other'";
			var diseases = await db.getSequelize().query(diseaseQuery, { raw: true });
			var diseaseTypes = [];
			diseases[0].forEach((row) =>diseaseTypes.push(row['disease_type']));
			return diseaseTypes;
		},
		//@@@PDC-3671 get publication file from file table
		async supplementary_data(obj, args, context) {
			logger.info("supplementary_data is called via "+context.parent);
			var suppleQuery = "SELECT distinct f.file_name as file_name FROM file f WHERE  f.publication_id = uuid_to_bin('"+
			obj.publication_id + "') ";
			var supples = await db.getSequelize().query(suppleQuery, { raw: true });
			var suppleTypes = [];
			supples[0].forEach((row) =>suppleTypes.push(row['file_name']));
			return suppleTypes;
		}
	},
	//@@@PDC-6513 API for new pancancer publication page
	UIPancancerPublication: {
		files(obj, args, context) {
			let replacements = { };
			let fileQuery  = "SELECT bin_to_uuid(f.file_id) as file_id, file_name, downloadable, data_category, annotation from file f, publication_file pf "+
			"where f.file_id = pf.file_id and data_category = 'Publication Supplementary Material' "+
			" and pf.publication_id = uuid_to_bin(:publication_id) ";
			replacements['publication_id'] = obj.publication_id;
			return db.getSequelize().query(
							fileQuery,
							{
								replacements: replacements,
								model: db.getModelByName('ModelUIFile')
							}
						);
			/*let rawData = await db.getSequelize().query(
							fileQuery,
							{
								replacements: replacements,
								model: db.getModelByName('ModelUIFile')
							}
						);
			console.log(JSON.stringify(rawData));
			rawData.forEach(row => {
				let parsed = JSON.parse(row['annotation']);
				row['description'] = parsed['description'];
				row['characterization'] = parsed['related characterizations'];
				row['cohorts'] = parsed['related cohorts'].toString();
				row['related_publications'] = parsed['related publications (pubmed ids)'].toString();
				row['related_studies'] = parsed['related studies'].toString();
			}
			);
			return rawData;*/
		},
		//@@@PDC-6575 add related studies to pancancer publication
		studies(obj, args, context) {
			let replacements = { };
			let studyQuery  = "SELECT bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.pdc_study_id, s.submitter_id_name "+
			"from study s, study_publication sp "+
			"where s.study_id = sp.study_id and sp.publication_id = uuid_to_bin(:publication_id) ";
			replacements['publication_id'] = obj.publication_id;
			return db.getSequelize().query(
							studyQuery,
							{
								replacements: replacements,
								model: db.getModelByName('ModelUIStudy')
							}
						);
		}
	},
	//@@@PDC-3640 new pdc metrics api
	PDCMetrics: {
		async programs(obj, args, context) {
			logger.info("programs is called via "+context.parent);
			let myQuery = "SELECT count(*) as programs FROM program";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].programs);
		},
		async projects(obj, args, context) {
			logger.info("projects is called via "+context.parent);
			let myQuery = "SELECT count(*) as projects FROM project";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].projects);
		},
		async studies(obj, args, context) {
			logger.info("studies is called via "+context.parent);
			let myQuery = "SELECT count(*) as studies FROM study WHERE is_latest_version = 1";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].studies);
		},
		async cases(obj, args, context) {
			logger.info("cases is called via "+context.parent);
			let myQuery = "SELECT  COUNT(DISTINCT dia.diagnosis_id) AS cases FROM study s, aliquot al, "+
			"aliquot_run_metadata alm, `case` c, sample sam, demographic dem, diagnosis dia "+
			"WHERE alm.study_id = s.study_id AND al.aliquot_id = alm.aliquot_id "+
			"AND al.sample_id = sam.sample_id AND sam.case_id = c.case_id "+
			"AND c.case_id = dem.case_id AND c.case_id = dia.case_id and s.is_latest_version = 1";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].cases);
		},
		async files(obj, args, context) {
			logger.info("files is called via "+context.parent);
			let myQuery = "SELECT count(*) as files FROM file f, study_file sf, study s "+
			"WHERE f.file_id = sf.file_id and sf.study_id = s.study_id and s.is_latest_version = 1";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].files);
		},
		async data_size_TB(obj, args, context) {
			logger.info("data_size_TB is called via "+context.parent);
			let myQuery = "select round(((sum(file_size))/POWER(1024,4)), 0) as data_size from file";
			var result = await db.getSequelize().query(myQuery, { raw: true });
			return parseInt(result[0][0].data_size);
		}
	},
	PublicationFilters: {
		async disease_types(obj, args, context) {
			logger.info("disease_types is called via "+context.parent);
			var diseaseQuery = "SELECT distinct c.disease_type as disease_type FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm, study_publication sp WHERE alm.study_id = s.study_id and al.aliquot_id "+
			" = alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and sp.study_id = s.study_id and s.is_latest_version = 1 and c.disease_type != 'Other' order by c.disease_type";
			var diseases = await db.getSequelize().query(diseaseQuery, { raw: true });
			var diseaseTypes = [];
			diseases[0].forEach((row) =>diseaseTypes.push(row['disease_type']));
			return diseaseTypes;
		},
		async years(obj, args, context) {
			logger.info("years is called via "+context.parent);
			var yearQuery = "SELECT distinct pub.year FROM publication pub order by pub.year desc";
			var years = await db.getSequelize().query(yearQuery, { raw: true });
			var yearsPub = [];
			years[0].forEach((row) =>yearsPub.push(row['year']));
			return yearsPub;
		},
		async programs(obj, args, context) {
			logger.info("programs is called via "+context.parent);
			var programQuery = "SELECT distinct prog.name FROM study s, project proj, program prog, "+
			"study_publication sp, publication pub WHERE sp.study_id = s.study_id and s.is_latest_version = 1 "+
			"and s.project_id = proj.project_id and proj.program_id = prog.program_id order by prog.name";
			var programs = await db.getSequelize().query(programQuery, { raw: true });
			var programNames = [];
			programs[0].forEach((row) =>programNames.push(row['name']));
			return programNames;
		}
	},
	//@@@PDC-3597 heatmap study api
	HeatmapFilters: {
		async disease_types(obj, args, context) {
			logger.info("disease_types is called via "+context.parent);
			var diseaseQuery = "SELECT distinct c.disease_type as disease_type FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm WHERE alm.study_id = s.study_id and al.aliquot_id "+
			"= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
			//"c.disease_type != 'Other' "+
			"s.study_id IN (UUID_TO_BIN('"+getHeatMapStudies()+"')) "+
			"order by c.disease_type";
			var diseases = await db.getSequelize().query(diseaseQuery, { raw: true });
			var diseaseTypes = [];
			diseases[0].forEach((row) =>diseaseTypes.push(row['disease_type']));
			return diseaseTypes;
		},
		async primary_sites(obj, args, context) {
			logger.info("primary_sites is called via "+context.parent);
			var siteQuery = "SELECT distinct c.primary_site as primary_site FROM study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm WHERE alm.study_id = s.study_id and al.aliquot_id "+
			"= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
			//"c.primary_site != 'Not Reported' "+
			"s.study_id IN (UUID_TO_BIN('"+getHeatMapStudies()+"')) "+
			"order by c.primary_site";
			var sites = await db.getSequelize().query(siteQuery, { raw: true });
			var siteTypes = [];
			sites[0].forEach((row) =>siteTypes.push(row['primary_site']));
			return siteTypes;
		},
		async analytical_fractions(obj, args, context) {
			logger.info("analytical_fractions is called via "+context.parent);
			var fractionQuery = "SELECT distinct s.analytical_fraction FROM study s WHERE s.study_id IN (UUID_TO_BIN('"+getHeatMapStudies()+"')) "+
			"order by s.analytical_fraction";
			var fractions = await db.getSequelize().query(fractionQuery, { raw: true });
			var fractionNames = [];
			fractions[0].forEach((row) =>fractionNames.push(row['analytical_fraction']));
			return fractionNames;
		}
	},
	//@@@PDC-3723 add sorting
	/*UIHeatmapStudy: {
		async disease_types (obj, args, context) {
			var dtQuery = "SELECT distinct c.disease_type "+
				"FROM study s, aliquot al, aliquot_run_metadata alm, `case` c, "+
				"sample sam WHERE alm.study_id = s.study_id AND al.aliquot_id = alm.aliquot_id "+
				"AND al.sample_id = sam.sample_id AND sam.case_id = c.case_id "+
				//"AND c.disease_type != 'Other' "+
				"AND s.study_id = UUID_TO_BIN('"+obj.study_id+"')";
			var dts = await db.getSequelize().query(dtQuery, { raw: true });
			var dtValues = [];
			dts[0].forEach((row) =>dtValues.push(row['disease_type']));
			return dtValues;
		},
		async primary_sites (obj, args, context) {
			var psQuery = "SELECT distinct c.primary_site "+
				"FROM study s, aliquot al, aliquot_run_metadata alm, `case` c, "+
				"sample sam WHERE alm.study_id = s.study_id AND al.aliquot_id = alm.aliquot_id "+
				"AND al.sample_id = sam.sample_id AND sam.case_id = c.case_id "+
				//"AND c.primary_site != 'Not Reported' "+
				"AND s.study_id = UUID_TO_BIN('"+obj.study_id+"')";
			var pss = await db.getSequelize().query(psQuery, { raw: true });
			var psValues = [];
			pss[0].forEach((row) =>psValues.push(row['primary_site']));
			return psValues;
		}
	},*/
	//@@@PDC-136 pagination
	//@@@PDC-650 implement elasticache for API
	Paginated: {
		total(obj, args, context) {
			logger.info("total is called via "+context.parent);
			context['total'] = obj[0].total;
			return obj[0].total;
		},
		async uiFiles(obj, args, context) {
			logger.info("uiFiles is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				let result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIFile')
						}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-6601 Add paginate API for pancancer related files
		uiPancancerFiles(obj, args, context) {
			logger.info("uiPancancerFiles is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelUIFile')
					}
				);
			/*let rawData =await db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelUIFile')
					}
				);			
			rawData.forEach(row => {
				let parsed = JSON.parse(row['annotation']);
				row['description'] = parsed['description'];
				row['characterization'] = parsed['related characterizations'];
				row['cohorts'] = parsed['related cohorts'].toString();
				row['related_publications'] = parsed['related publications (pubmed ids)'].toString();
				row['related_studies'] = parsed['related studies'].toString();
			}
			);
			return rawData;*/
		},
		async uiLegacyFiles(obj, args, context) {
			logger.info("uiLegacyFiles is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				let result =await db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelUIFile')
					}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		async uiCases(obj, args, context) {
			logger.info("uiCases is called via "+context.parent);
			logger.info("getPaginatedUICaseDetail: "+ context.dataCacheName);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				let result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUICase')
						}
					);
					logger.info("Num of Cases fetched: "+result.length);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				logger.info("Num of Cases cached: "+JSON.parse(res).length);
				return JSON.parse(res);
			}
		},
		//@@@PDC-255 API for UI clinical tab
		async uiClinical(obj, args, context) {
			logger.info("uiClinical is called via "+context.parent);
			logger.info("getPaginatedUIClinical "+ context.dataCacheName);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				let result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIClinical')
						}
					);
					logger.info("Clinicals: "+JSON.stringify(result))
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-579 gene tabe pagination
		async uiGenes(obj, args, context) {
			logger.info("uiGenes is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if (res === null) {
				let replacements = context.replacements;
				let result = await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIGene')
						}
					);
				let geneNameArray = [];
				result.forEach(element => geneNameArray.push(element.gene_name));
				let geneStudyCountQuery = context.geneStudyCountQuery;
				if (geneNameArray.length > 0) {
					geneStudyCountQuery = geneStudyCountQuery + `
							AND sc.gene_name in (:geneNameArray)
					GROUP BY sc.gene_name
				`;
					replacements['geneNameArray'] = geneNameArray;
				}
				let geneStudyCount = await db.getSequelize().query(
						geneStudyCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelUIGeneName')
						}
					);
				let geneStudyCountMap = new Map();
				geneStudyCount.forEach(element => geneStudyCountMap.set(element.gene_name, element.num_study));

				result.forEach(element => element.num_study= geneStudyCountMap.get(element.gene_name));
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-681 ui ptm data API
		async uiPtm(obj, args, context) {
			logger.info("uiPtm is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIPtm')
						}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-3446 API for new publication screen
		async uiPublication(obj, args, context) {
			logger.info("uiPublication is called via "+context.parent);
			//console.log("cacheName: "+context.dataCacheName);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIPublication')
						}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-3171 new ptm abundance tables
		/*async uiBatchedPtm(obj, args, context) {
			var uiPtmBaseQuery = "SELECT distinct pq.gene_name, pq.ptm_type, pq.site, pq.peptide FROM ";
			var cacheFilterName = {name:'batch'};

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			cacheFilterName['dataFilterName'] += 'offet:'+context.arguments.offset+';';
			cacheFilterName['dataFilterName'] += 'limit:'+context.arguments.limit+';';
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name);
			var all = [];
			if(res === null){
				for (var i = context.arguments.offset; i < context.arguments.limit; i++) {
					uiPtmBaseQuery += "ptm_abundance_"+queryList.abundance_suffix[i]+ " pq";
					logger.info("ptm query: "+uiPtmBaseQuery);
					var result =await db.getSequelize().query(uiPtmBaseQuery, { model: db.getModelByName('ModelUIPtm') });
					Array.prototype.push.apply(all,result);
				}
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name, JSON.stringify(all));
				return all;
			}else{
				return JSON.parse(res);
			}
		},*/
		//@@@PDC-333 gene/spectral count API pagination
		//@@@PDC-391 gene/spectral count query change
		async uiGeneStudySpectralCounts(obj, args, context) {
			logger.info("uiGeneStudySpectralCounts is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var initialStudies = await db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelUIGeneStudySpectralCount')
					});
				//@@@PDC-3079 get latest version of study
				var gssQuery = "SELECT sc.study_submitter_id, " +
				"s.submitter_id_name, s.experiment_type, " +
				"count(distinct sc.study_run_metadata_id) as plexes_count, "+
				"count(distinct al.aliquot_id) as aliquots_count "+
				 " FROM spectral_count sc, aliquot al, aliquot_run_metadata alm, study s "+
				" WHERE sc.study_id = alm.study_id and alm.aliquot_id = al.aliquot_id "+
				" and sc.study_id = s.study_id and s.is_latest_version = 1 ";
				if (typeof context.arguments.gene_name != 'undefined') {
					let gene_names = context.arguments.gene_name.split(';');
					gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')";
				}
				gssQuery += " group by sc.study_submitter_id";

				var studyCounts = await db.getSequelize().query(gssQuery, { model: db.getModelByName('ModelUIGeneStudySpectralCount') });

				for (var i = 0; i < initialStudies.length; i++) {
					for (var j = 0; j < studyCounts.length; j++) {
						if (initialStudies[i].study_submitter_id===studyCounts[j].study_submitter_id){
							initialStudies[i].plexes_count = studyCounts[j].plexes_count;
							initialStudies[i].aliquots_count = studyCounts[j].aliquots_count;
						}
					}
				}
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(initialStudies));
				return initialStudies;
			}else{
				return JSON.parse(res);
			}
		},
		async uiGeneAliquotSpectralCounts(obj, args, context) {
			logger.info("uiGeneAliquotSpectralCounts is called via "+context.parent);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIGeneStudySpectralCount')
						}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-485 spectral count per study/aliquot API
		spectralCounts(obj, args, context) {
			logger.info("spectralCounts is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelSpectralCount')
					}
				);
		},
		//@@@PDC-2690 api returns gene info without spectral count
		genesProper(obj, args, context) {
			logger.info("genesProper is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelGene')
					}
				);
		},
		//@@@PDC-329 Pagination for UI study summary page
		//@@@PDC-788 remove hard-coded file types
		//@@@PDC-1291 Redesign Browse Page data tabs
		async uiStudies(obj, args, context) {
			logger.info("uiStudies is called via "+context.parent);
			//console.log("studyQuery: "+context.query);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				let myCombo = await db.getSequelize().query(
						context.query,
						{
							replacements: context.replacements,
							model: db.getModelByName('ModelUIStudy')
						}
					);
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(myCombo));
				return myCombo;
			}else{
				return JSON.parse(res);
			}
		},
		files(obj, args, context) {
			logger.info("files is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelFile')
					}
				);
		},
		//PDC-3022 enhance getPaginatedCase API
		cases(obj, args, context) {
			logger.info("cases is called via "+context.parent);
			return db.getModelByName('Case').findAll({
					attributes: [['bin_to_uuid(case_id)', 'case_id'],
						'case_submitter_id',
						['bin_to_uuid(project_id)', 'project_id'],
						'project_submitter_id',
						'disease_type',
						'primary_site'
					],
					//@@@PDC-2619 change to accommodate calling from documentation
					/*where: {
						project_submitter_id: {
							[Op.in]: context.value
						}
					},*/
					offset: context.arguments.offset,
					limit: context.arguments.limit });
		},
		//@@@PDC-472 casesSamplesAliquots API
		casesSamplesAliquots(obj, args, context) {
			logger.info("casesSamplesAliquots is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		//@@@PDC-475 caseDiagnosesPerStudy API
		caseDiagnosesPerStudy(obj, args, context) {
			logger.info("caseDiagnosesPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		//@@@PDC-473 caseDemographicsPerStudy API
		caseDemographicsPerStudy(obj, args, context) {
			logger.info("caseDemographicsPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		//@@@PDC-4547 public apis for new clinbio entities
		caseExposuresPerStudy(obj, args, context) {
			logger.info("caseExposuresPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		caseFamilyHistoriesPerStudy(obj, args, context) {
			logger.info("caseFamilyHistoriesPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		caseFollowUpsPerStudy(obj, args, context) {
			logger.info("caseFollowUpsPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		caseTreatmentsPerStudy(obj, args, context) {
			logger.info("caseTreatmentsPerStudy is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('Case')
					}
				);
		},
		searchCases(obj, args, context) {
			logger.info("searchCases is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelSearchCaseRecord')
					}
				);
		},
		genes(obj, args, context) {
			logger.info("genes is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelSearchRecord')
					}
				);
		},
		//@@@PDC-380 gene search by proteins
		genesWithProtein(obj, args, context) {
			logger.info("genesWithProtein is called via "+context.parent);
			return db.getSequelize().query(
				context.query,
				{
					replacements: context.replacements,
					model: db.getModelByName('ModelSearchRecord')
				}
			);
		},
		searchAliquots(obj, args, context) {
			logger.info("searchAliquots is called via "+context.parent);
			return db.getSequelize().query(
				context.query,
				{
					replacements: context.replacements,
					model: db.getModelByName('ModelSearchAliquotRecord')
				}
			);
		},
		studies(obj, args, context) {
			logger.info("studies is called via "+context.parent);
			return db.getSequelize().query(
					context.query,
					{
						replacements: context.replacements,
						model: db.getModelByName('ModelSearchStudyRecord')
					}
				);
		},
		//@@@PDC-486 data matrix API
		//@@@PDC-562 quant data matrix API
		async dataMatrix(obj, args, context) {
			logger.info("dataMatrix is called via "+context.parent);
			var matrix = [];
			var matrixCountQuery = '';
			switch (context.arguments.data_type) {
				case 'spectral_count':
				case 'distinct_peptide':
				case 'unshared_peptide':
					matrixCountQuery = "select distinct sc.study_submitter_id, sc.plex_name" +
					" FROM spectral_count sc"+
					" WHERE sc.study_submitter_id = '"+ context.arguments.study_submitter_id +
					//"' and sc.project_submitter_id IN ('" + context.value.join("','") +
					"' order by sc.plex_name";
					break;
				//@@@PDC-669 support all areas/ratios in gene_abundance
				case 'precursor_area':
				case 'log2_ratio':
				case 'unshared_precursor_area':
				case 'unshared_log2_ratio':
				//@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
					matrixCountQuery = "select distinct ga.study_submitter_id, ga.aliquot_submitter_id, ga.aliquot_alias" +
					" FROM gene_abundance ga"+
					" WHERE ga.study_submitter_id = '"+
					context.arguments.study_submitter_id +
					//"' and ga.project_submitter_id IN ('" + context.value.join("','") + "')" +
					"' order by ga.aliquot_submitter_id";
					break;
				case 'log_ratio':
					matrixCountQuery = "select distinct pq.study_submitter_id, pq.aliquot_submitter_id " +
					" FROM phosphosite_quant pq"+
					" WHERE pq.study_submitter_id = '"+ context.arguments.study_submitter_id +
					//"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')" +
					"' order by pq.aliquot_submitter_id";
					break;
			}
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof context.arguments.offset != 'undefined' && typeof context.arguments.limit != 'undefined') {
				myOffset = context.arguments.offset;
				myLimit = context.arguments.limit;
			}
			var matrixLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			var aliquots = await db.getSequelize().query(matrixCountQuery+matrixLimitQuery, { model: db.getModelByName('ModelMatrix') });
			var row1 = ['Gene/Aliquot'];
			matrix.push(row1);
			var genes = null, geneQuery = null;
			for (var i = 0; i < aliquots.length; i++) {
				switch (context.arguments.data_type) {
					case 'spectral_count':
					case 'distinct_peptide':
					case 'unshared_peptide':
						matrix[0].push(aliquots[i].plex_name);
						geneQuery = "select sc.gene_name, sc." +context.arguments.data_type +
						" FROM spectral_count sc" +
						" WHERE sc.study_submitter_id = '"+ aliquots[i].study_submitter_id +
						"' and sc.plex_name = '"+ aliquots[i].plex_name + "'"+
						" order by sc.gene_name";
						break;
					//@@@PDC-669 support all areas/ratios in gene_abundance
					case 'precursor_area':
					case 'log2_ratio':
					case 'unshared_precursor_area':
					case 'unshared_log2_ratio':
					//@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
						matrix[0].push(aliquots[i].aliquot_submitter_id+":"+aliquots[i].aliquot_alias);
						geneQuery = "select ga.gene_name, ga." +context.arguments.data_type +
						" FROM gene_abundance ga" +
						" WHERE ga.study_submitter_id = '"+ aliquots[i].study_submitter_id +
						"' and ga.aliquot_submitter_id = '"+ aliquots[i].aliquot_submitter_id +
						"' and ga.aliquot_alias = '"+ aliquots[i].aliquot_alias + "'"+
						" order by ga.gene_name";
						break;
					case 'log_ratio':
						matrix[0].push(aliquots[i].aliquot_submitter_id);
						geneQuery = "select pq.gene_name, pq." +context.arguments.data_type +
						" FROM phosphosite_quant pq" +
						" WHERE pq.study_submitter_id = '"+ aliquots[i].study_submitter_id +
						"' and pq.aliquot_submitter_id = '"+ aliquots[i].aliquot_submitter_id + "'"+
						" order by pq.gene_name";
						break;
				}
				var geneRow = null;
				genes = await db.getSequelize().query(geneQuery, { model: db.getModelByName('ModelMatrix') });
				//@@@PDC-740 dealing with duplicate gene in one aliquot
				var currentGene = 'xxxx';
				var geneCount = 0;
				for (var j = 0; j < genes.length; j++){
					if (genes[j].gene_name === currentGene){
						continue;
					}
					currentGene = genes[j].gene_name;
					if (i == 0) {
						geneRow = new Array();
						geneRow.push(genes[j].gene_name);
						geneRow.push(eval("genes[j]."+context.arguments.data_type));
						matrix.push(geneRow);
					}
					else {
						matrix[j+1].push(eval("genes[j]."+context.arguments.data_type));
					}
				}
			}
			logger.info("Ready to return matrix");
			return matrix;
		},
		//@@@PDC-678 ptm data matrix API
		async ptmDataMatrix(obj, args, context) {
			logger.info("ptmDataMatrix is called via "+context.parent);
			var matrix = [];
			if (typeof context.error != 'undefined' ) {
				var error = [context.error];
				matrix.push(error);
				return matrix;
			}
			var matrixCountQuery = "select distinct pq.study_submitter_id, pq.aliquot_submitter_id " +
				" FROM ptm_abundance pq"+
				" WHERE pq.study_submitter_id = '"+ context.arguments.study_submitter_id +
				//"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')" +
				"' order by pq.aliquot_submitter_id";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof context.arguments.offset != 'undefined' && typeof context.arguments.limit != 'undefined') {
				myOffset = context.arguments.offset;
				myLimit = context.arguments.limit;
			}
			var matrixLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			var aliquots = await db.getSequelize().query(matrixCountQuery+matrixLimitQuery, { model: db.getModelByName('ModelMatrix') });
			var row1 = ['Gene/Aliquot'];
			matrix.push(row1);
			var genes = null, geneQuery = null;
			for (var i = 0; i < aliquots.length; i++) {
				matrix[0].push(aliquots[i].aliquot_submitter_id);
				geneQuery = "select pq.gene_name, pq.log2_ratio" +
				" FROM ptm_abundance pq" +
				" WHERE pq.study_submitter_id = '"+ aliquots[i].study_submitter_id +
				"' and pq.aliquot_submitter_id = '"+ aliquots[i].aliquot_submitter_id + "'"+
				" order by pq.gene_name";
				var geneRow = null;
				genes = await db.getSequelize().query(geneQuery, { model: db.getModelByName('ModelMatrix') });
				for (var j = 0; j < genes.length; j++){
					if (i == 0) {
						geneRow = new Array();
						geneRow.push(genes[j].gene_name);
						geneRow.push(eval("genes[j]."+context.arguments.data_type));
						matrix.push(geneRow);
					}
					else {
						matrix[j+1].push(eval("genes[j]."+context.arguments.data_type));
					}
				}
			}
			logger.info("Ready to return ptm matrix");
			return matrix;
		},
		pagination(obj, args, context) {
			logger.info("pagination is called via "+context.parent);
			logger.info("Paginated total: "+JSON.stringify(context.total));
			return context.total;
		}
	},
	//@@@PDC-1122 add signed url
	FilePerStudy: {
		signedUrl(obj, args, context) {
			logger.info("signedUrl is called via "+context.parent);
			//@@@PDC-3837 use s3 key for large files
			//logger.info("File Size: "+obj.file_size);
			if (obj.file_size >= 32212254720)
				return getSignedUrl(obj.file_location, false);
			else
				return getSignedUrl(obj.file_location, true);
		}
	},
	//@@@PDC-2167 group files by data source
	StudyFileSource: {
		async fileCounts(obj, args, context) {
			logger.info("fileCounts is called via "+context.parent);
			//@@@PDC-3839 get current version of study
			var fileQuery = "SELECT f.file_type, f.data_category, COUNT(f.file_id) AS files_count FROM file f, study s, study_file sf WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
			"and s.study_id = uuid_to_bin('"+obj.study_id+"') and f.data_source = '"+
			obj.data_source+ "' group by file_type, data_category";
			var cacheFilterName = {name:''};
			cacheFilterName.name +="pdc_study_id:("+ obj.pdc_study_id +
			"):data_category:("+ obj.data_source +");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('StudyFilesCountBySource')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('StudyFilesCountBySource')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		}
	},
	//@@@PDC-2020 use major primary site
	UIHumanBody: {
		async primarySites(obj, args, context) {
			logger.info("primarySites is called via "+context.parent);
			var getPSQuery = 'select distinct primary_site from `case` c where ';
			getPSQuery += " major_primary_site = '" + obj.major_primary_site + "'";
			var pss = await db.getSequelize().query(getPSQuery, { raw: true });
			var listPss = [];
			pss[0].forEach((row) =>listPss.push(row['primary_site']));
			return listPss;
		}
	},
	//@@@PDC-5252 fetch diagnosis-sample association
	//@@@PDC-5412 add diagnosis-sample annotation	
	UICase: {
		diagnoses(obj, args, context) {
			logger.info("diagnoses is called via "+context.parent);
			let refQuery = "select bin_to_uuid(entity_id) diagnosis_id, annotation, "+
			"entity_submitter_id as diagnosis_submitter_id from reference where reference_entity_id = "+
			"uuid_to_bin(:sample_id) and entity_type = 'diagnosis'"
			let replacements = {};
			replacements['sample_id'] = obj.sample_id;
			return db.getSequelize().query(
					refQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Diagnosis')
					}
			);							
		}		
	},
	Pagination: {
		size(obj, args, context) {
			var mySize = 10;
			if (context.arguments != 'undefined')
				mySize = context.arguments.limit;
			return mySize;
		},
		count(obj, args, context) {
			var remains = obj - context.arguments.offset
			if (remains <= context.arguments.limit)
				return remains;
			else
				return context.arguments.limit;
		},
		//@@@PDC-497 Make table column headers sortable on the browse page tabs
		sort(obj, args, context) {
			var sort = '';
			if(context.arguments != 'undefined' && context.arguments.sort != undefined){
				sort = context.arguments.sort;
			}
			return sort;
		},
		from(obj, args, context) {
			var myOffset = 0;
			if (context.arguments != 'undefined')
				myOffset = context.arguments.offset;
			return myOffset;
		},
		//@@@PDC-3204 handle zero limit.
		page(obj, args, context) {
			var myPage = 0;
			if (context.arguments != 'undefined' && context.arguments.limit > 0)
				myPage = Math.ceil(context.arguments.offset / context.arguments.limit)+1;
			return myPage;
		},
		total(obj, args, context) {
			return obj;
		},
		//@@@PDC-3204 handle zero limit.
		pages(obj, args, context) {
			var myPages = 0;
			if (context.arguments != 'undefined' && context.arguments.limit > 0)
				myPages = Math.ceil(obj / context.arguments.limit);
			return myPages;
		}

	}
};

//export default resolvers;
