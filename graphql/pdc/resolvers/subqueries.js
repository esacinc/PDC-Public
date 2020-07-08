import { db } from '../util/dbconnect';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import Sequelize from 'sequelize';
import {filters, filtersView} from '../util/filters'
import {getSignedUrl} from '../util/getSignedUrl'
import {RedisCacheClient, CacheName} from '../util/cacheClient';
//@@@PDC-1215 use winston logger
import { logger } from '../util/logger';

const Op = Sequelize.Op;
//@@@PDC-952 remove hard-coded schema name
//@@@PDC-1340 remove authorization code
//@@@PDC-1874 add pdc_study_id to all study-related APIs 
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
			var comboQuery = "";
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
				comboQuery += filters(context.arguments);				
			}
			return db.getSequelize().query(comboQuery, { model: db.getModelByName('Project') });			
		}
	},
    //@@@PDC-1430 link program/project/study using uuid
	Project: {
		studies(obj, args, context) {
			var comboQuery = "";
			if (context.noFilter != null) {
				comboQuery = "SELECT distinct bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.submitter_id_name, "+
				" s.analytical_fraction, s.experiment_type, s.acquisition_type, s.pdc_study_id"+
				" FROM study s "+
				" WHERE s.project_id = uuid_to_bin('"+
				obj.project_id +
				"') ";
			}
			else {
				comboQuery = "SELECT distinct bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.submitter_id_name, "+
				" s.analytical_fraction, s.experiment_type, s.acquisition_type, s.pdc_study_id"+
				" FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al, project proj, program prog, protocol ptc "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id and ptc.study_id = s.study_id "+
				" and proj.program_id = prog.program_id and s.project_id = uuid_to_bin('"+
				obj.project_id +
				"') ";
				//"and s.project_submitter_id IN ('" + context.value.join("','") + "')";
				comboQuery += filters(context.arguments);
			}
			return db.getSequelize().query(comboQuery, { model: db.getModelByName('ModelStudy') });			
		}
	},
	//@@@PDC-180 Case API for UI case summary
	//@@@PDC-650 implement elasticache for API
	//@@@PDC-1371 use uuid instead of submitter_id
	Case: {
		async demographics(obj, args, context) {
			var cacheFilterName = { name: '' };
			cacheFilterName.name += "case_submitter_id:(" + obj.case_submitter_id + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseDemographic') + cacheFilterName['name']);
			if (res === null) {
				var result = await db.getModelByName('Demographic').findAll({
					attributes: [['bin_to_uuid(demographic_id)', 'demographic_id'], 'demographic_submitter_id',
						'ethnicity',
						'gender',
						'race',
						'cause_of_death',
						'days_to_birth',
						'days_to_death',
						'vital_status',
						'year_of_birth',
						'year_of_death'
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
		async diagnoses(obj, args, context) {
			var cacheFilterName = {name:''};
			cacheFilterName.name +="case_submitter_id:("+ obj.case_submitter_id + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseDiagnose')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getModelByName('Diagnosis').findAll({
					attributes: [['bin_to_uuid(diagnosis_id)', 'diagnosis_id'],
						'diagnosis_submitter_id',
						'age_at_diagnosis',
						'classification_of_tumor',
						'days_to_last_follow_up',
						'days_to_last_known_disease_status',
						'days_to_recurrence',
						'last_known_disease_status',
						'morphology',
						'primary_diagnosis',
						'progression_or_recurrence',
						'site_of_resection_or_biopsy',
						'tissue_or_organ_of_origin',
						'tumor_grade',
						'tumor_stage',
						'vital_status',
						'days_to_birth',
						'days_to_death',
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
						'cause_of_death',
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
						'year_of_diagnosis'
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
		async samples(obj, args, context) {
			var cacheFilterName = { name: '' };
			cacheFilterName.name += "case_submitter_id:(" + obj.case_submitter_id + ");";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('CaseSample') + cacheFilterName['name']);
			if (res === null) {
				var result = await db.getModelByName('Sample').findAll({
					attributes: [['bin_to_uuid(sample_id)', 'sample_id'], 'sample_submitter_id', 'sample_type', 'sample_type_id', 'gdc_sample_id', 'gdc_project_id', 'biospecimen_anatomic_site', 'composition', 'current_weight', 'days_to_collection', 'days_to_sample_procurement', 'diagnosis_pathologically_confirmed', 'freezing_method', 'initial_weight', 'intermediate_dimension', 'is_ffpe', 'longest_dimension', 'method_of_sample_procurement', 'oct_embedded', 'pathology_report_uuid', 'preservation_method', 'shortest_dimension', 'time_between_clamping_and_freezing', 'time_between_excision_and_freezing', 'tissue_type', 'tumor_code', 'tumor_code_id', 'tumor_descriptor'],
					where: {
						case_id: Sequelize.fn('uuid_to_bin', obj.case_id )
						//case_submitter_id: obj.case_submitter_id
					}
				});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('CaseSample') + cacheFilterName['name'], JSON.stringify(result));
				return result;
			} else {
				return JSON.parse(res);
			}
		}
	},
	Sample: {
		aliquots(obj, args, context) {
			return db.getModelByName('Aliquot').findAll({ attributes: [['bin_to_uuid(aliquot_id)', 'aliquot_id'],'aliquot_submitter_id', 'analyte_type', 'aliquot_quantity', 'aliquot_volume', 'amount', 'concentration'],
			where: {
				sample_id: Sequelize.fn('uuid_to_bin', obj.sample_id )
				//sample_submitter_id: obj.sample_submitter_id
			}
			});
		}		
	},
	FileMetadata: {
		aliquots(obj, args, context) {
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
	ExperimentalMetadata: {
		study_run_metadata(obj, args, context) {
			//@@@PDC-1120 StudyRunMetadata table change
			return db.getModelByName('ModelStudyRunMetadata').findAll({attributes: ['study_run_metadata_submitter_id', 'fraction'],
			where: {study_submitter_id: obj.study_submitter_id}
			});
		}
	},
	StudyRunMetadata: {
		aliquot_run_metadata(obj, args, context) {
			return db.getModelByName('ModelAliquotRunMetadata').findAll({attributes: ['aliquot_submitter_id'],
			where: {study_run_metadata_submitter_id: obj.study_run_metadata_submitter_id}
			});
		},
		//@@@PDC-774 add downloadable
		files(obj, args, context) {
			var fileQuery = "SELECT file.file_type as file_type, file.data_category, file.downloadable, file.file_location "+
			"FROM file AS file, study AS study, study_file AS sf "+
			"WHERE file.file_id = sf.file_id and study.study_id = sf.study_id "+
			"and sf.study_run_metadata_submitter_id = '"+ obj.study_run_metadata_submitter_id +"'";
			return db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });

		}
	},
	//@@@PDC-2026 add case external reference
	UIClinical: {
		async externalReferences(obj, args, context) {
			var refCacheName = context.dataCacheName + ':'+obj.case_id;
			const res = await RedisCacheClient.redisCacheGetAsync(refCacheName);
			if (res === null) {
				var refQuery = "SELECT reference_resource_shortname, reference_entity_location FROM reference r where entity_type = 'case' and reference_type = 'external' and entity_id = uuid_to_bin('"+ obj.case_id + "')";
				var getIt = await db.getSequelize().query(refQuery, { model: db.getModelByName('ModelEntityReference') });
				RedisCacheClient.redisCacheSetExAsync(refCacheName, JSON.stringify(getIt));
				return getIt;				
			}
			return JSON.parse(res);
		}
	},	
	//@@@PDC-788 remove hard-coded file types
	UIStudy: {
		async filesCount(obj, args, context) {
			var fileCacheName = context.dataCacheName + ':'+obj.study_submitter_id;
			const res = await RedisCacheClient.redisCacheGetAsync(fileCacheName);
			if (res === null) {
				//@@@PDC-794 order by data_category
				var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
				"FROM file f, study s, study_file sf "+
				"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				"and s.study_submitter_id = '"+ obj.study_submitter_id +
				"' group by f.data_category, f.file_type order by f.data_category";
				var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(fileCacheName, JSON.stringify(getIt));
				return getIt;				
			}
			return JSON.parse(res);
		}
	},
	//@@@PDC-898 new public APIs--study
	Study: {
		async filesCount(obj, args, context) {
			var fileQuery = "SELECT f.data_category, f.file_type, count(f.file_id) as files_count "+
			"FROM file f, study s, study_file sf "+
			"WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
			"and s.study_id = uuid_to_bin('"+ obj.study_id +
			"') group by f.data_category, f.file_type order by f.data_category";
			var getIt = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
			return getIt;				
		}
	},
	//@@@PDC-136 pagination
	//@@@PDC-650 implement elasticache for API
	Paginated: {
		total(obj, args, context) {
			context['total'] = obj[0].total;
			return obj[0].total;
		},
		async uiFiles(obj, args, context) {
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIFile') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		async uiCases(obj, args, context) {
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUICase') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-255 API for UI clinical tab 
		async uiClinical(obj, args, context) {
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIClinical') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-579 gene tabe pagination
		async uiGenes(obj, args, context) {
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIGene') });
				let geneNameArray = [];
				result.forEach(element => geneNameArray.push(element.gene_name));
				let geneNameFilterValue = geneNameArray.join("','");
				let geneStudyCountQuery = context.geneStudyCountQuery;
				geneStudyCountQuery = geneStudyCountQuery+`
							AND sc.gene_name in ('${geneNameFilterValue}')
					GROUP BY sc.gene_name
				`;
				let geneStudyCount = await db.getSequelize().query(geneStudyCountQuery, { model: db.getModelByName('ModelUIGeneName') });
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
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIPtm') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-333 gene/spectral count API pagination 
		//@@@PDC-391 gene/spectral count query change 
		async uiGeneStudySpectralCounts(obj, args, context) {
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var initialStudies = await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIGeneStudySpectralCount') });
				var gssQuery = "SELECT sc.study_submitter_id, " +
				"s.submitter_id_name, s.experiment_type, " +
				"count(distinct sc.study_run_metadata_id) as plexes_count, "+
				"count(distinct al.aliquot_id) as aliquots_count "+
				 " FROM spectral_count sc, aliquot al, aliquot_run_metadata alm, study s "+
				" WHERE sc.study_id = alm.study_id and alm.aliquot_id = al.aliquot_id "+
				" and sc.study_id = s.study_id ";
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
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var result =await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIGeneStudySpectralCount') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-485 spectral count per study/aliquot API
		spectralCounts(obj, args, context) {
			return db.getSequelize().query(context.query, { model: db.getModelByName('ModelSpectralCount') });
		},
		//@@@PDC-329 Pagination for UI study summary page
		//@@@PDC-788 remove hard-coded file types
		//@@@PDC-1291 Redesign Browse Page data tabs
		async uiStudies(obj, args, context) {
			//console.log("studyQuery: "+context.query);
			const res = await RedisCacheClient.redisCacheGetAsync(context.dataCacheName);
			if(res === null){
				var myCombo = await db.getSequelize().query(context.query, { model: db.getModelByName('ModelUIStudy') });
				RedisCacheClient.redisCacheSetExAsync(context.dataCacheName, JSON.stringify(myCombo));
				return myCombo;
			}else{
				return JSON.parse(res);
			}
		},
		files(obj, args, context) {
			return db.getSequelize().query(context.query, { model: db.getModelByName('ModelFile') });
		},
		cases(obj, args, context) {
			return db.getModelByName('Case').findAll({ where: {
				project_submitter_id: {
					[Op.in]: context.value
				}
			},
			offset: context.arguments.offset, 
			limit: context.arguments.limit });				
		},
		//@@@PDC-472 casesSamplesAliquots API
		casesSamplesAliquots(obj, args, context) {
			return db.getSequelize().query(context.query, { model: db.getModelByName('Case') });			
		},
		//@@@PDC-475 caseDiagnosesPerStudy API		
		caseDiagnosesPerStudy(obj, args, context) {
			return db.getSequelize().query(context.query, { model: db.getModelByName('Case') });			
		},
		//@@@PDC-473 caseDemographicsPerStudy API		
		caseDemographicsPerStudy(obj, args, context) {
			return db.getSequelize().query(context.query, { model: db.getModelByName('Case') });			
		},
		searchCases(obj, args, context) {
			return db.getSequelize().query(context.query, {model: db.getModelByName('ModelSearchCaseRecord')});
		},
		genes(obj, args, context) {
			return db.getSequelize().query(context.query, {model: db.getModelByName('ModelSearchRecord')});
		},
		//@@@PDC-380 gene search by proteins
		genesWithProtein(obj, args, context) {
			return db.getSequelize().query(context.query, {model: db.getModelByName('ModelSearchRecord')});
		},
		searchAliquots(obj, args, context) {
			return db.getSequelize().query(context.query, {model: db.getModelByName('ModelSearchAliquotRecord')});
		},
		studies(obj, args, context) {
			return db.getSequelize().query(context.query, {model: db.getModelByName('ModelSearchStudyRecord')});
		},
		//@@@PDC-486 data matrix API
		//@@@PDC-562 quant data matrix API
		async dataMatrix(obj, args, context) {
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
			logger.info("Paginated total: "+JSON.stringify(context.total));
			return context.total;
		}
	},
	//@@@PDC-1122 add signed url
	FilePerStudy: {
		signedUrl(obj, args, context) {
			return getSignedUrl(obj.file_location);
		}
	},
	//@@@PDC-2167 group files by data source
	StudyFileSource: {
		async fileCounts(obj, args, context) {
			var fileQuery = "SELECT f.file_type, f.data_category, COUNT(f.file_id) AS files_count FROM file f, study s, study_file sf WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
			"and s.pdc_study_id = '"+obj.pdc_study_id+"' and f.data_source = '"+
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
			var getPSQuery = 'select distinct primary_site from `case` c where ';
			getPSQuery += " major_primary_site = '" + obj.major_primary_site + "'";
			var pss = await db.getSequelize().query(getPSQuery, { raw: true });
			var listPss = [];
			pss[0].forEach((row) =>listPss.push(row['primary_site']));
			return listPss;
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
		page(obj, args, context) {
			var myPage = 1;
			if (context.arguments != 'undefined')
				myPage = Math.ceil(context.arguments.offset / context.arguments.limit)+1;
			return myPage;
		},
		total(obj, args, context) {
			return obj;			
		},
		pages(obj, args, context) {
			return Math.ceil(obj / context.arguments.limit) ;
		}

	}
};

//export default resolvers;