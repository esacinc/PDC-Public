import { db } from '../util/dbconnect';
import { GraphQLScalarType } from 'graphql';
import { ApolloError } from 'apollo-server-express';
import { Kind } from 'graphql/language';
import Sequelize from 'sequelize';
import {filters, filtersView} from '../util/filters'
import {sort} from '../util/sort';
import {CacheName, RedisCacheClient} from '../util/cacheClient';
import {uiFilterProcess} from '../util/uiFilterProcess';
import {fetchDataMatrix} from '../util/fetchDataMatrix';
import {getAliquotId} from '../util/getAliquotId';
//@@@PDC-1215 use winston logger
import { logger } from '../util/logger';
//@@@PDC-1437 db connect for public APIs
import { pubDb } from '../util/pubDbconnect';
import fs from 'fs';
import ua from 'universal-analytics';
import  {
	queryList,
	applyStudyFilter,
	applyProgProjFilter,
	applyFileFilter,
	applyAlSamCaDemDiaFilter,
	addStudyInQuery,
	studyIntersection,
	studyIdIntersection,
	uiFilterSubqueryProcess
  } from '../util/browsePageFilters';

const Op = Sequelize.Op;
//@@@PDC-3253 add acceptDUA
var DUA = "https://proteomic.datacommons.cancer.gov/pdc/data-use-guidelines"
if (typeof process.env.serverurl != "undefined") {
	DUA = process.env.serverurl + "data-use-guidelines";
}
const duaMsg = "Please note that some of the PDC data are under embargo for publication and/or citation. Go to "+ DUA +" on your web browser to learn about the PDC data use guidelines and retry the APIs with the parameter – 'acceptDUA: true' if you agree with them."
//const duaMsg = "Please note that some of the PDC data are under embargo for publication and/or citation. Go to https://pdc-dev.esacinc.com/data-dictionary/publicapi-documentation on your web browser to learn about the PDC data policy and retry the APIs with the parameter – 'acceptDUA: true' if you agree with the PDC data policy.";
const gaVisitor = ua(process.env.GA_TRACKING_ID);

export const resolvers = {
	//@@@PDC-140 authorization: filter query results with project id
	//@@@PDC-312 restructure resolver code 
	//@@@PDC-952 remove hard-coded schema name
    //@@@PDC-1011 replace gdc_case_id with external_case_id
    //@@@PDC-1073 use db.getSequelize instead of db when get fn or col
	//@@@PDC-1123 add ui wrappers public APIs
	//@@@PDC-1302 upgrade to Sequelize 5
	//@@@PDC-1340 remove authorization code
	//@@@PDC-1874 add pdc_study_id to all study-related APIs 
	//@@@PDC-3050 google analytics tracking
	//@@@PDC-3278 log all api calls
	Query: {
		uiFileMetadata(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.fileMetadata(_, args, context);
		},			
		uiCaseSummary(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.case(_, args, context);
		},			
		uiCasePerFile(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.casePerFile(_, args, context);
		},			
		uiAllPrograms(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.allPrograms(_, args, context);
		},			
		uiFilesCountPerStudy(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.filesCountPerStudy(_, args, context);
		},			
		uiProtein(_, args, context) {
			logger.info("uiProtein is called with "+ JSON.stringify(args));
			//@@@PDC-2642 gene-related apis enhancement
			context['arguments'] = args;
			return db.getModelByName('Gene').findOne({ where: {
			proteins: {
			  [Op.like]: '%'+args.protein+'%'
			}}     
			});			
		},			
		uiDiseasesAvailable(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.diseasesAvailable(_, args, context);
		},			
		uiTissueSitesAvailable(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.tissueSitesAvailable(_, args, context);
		},			
		uiPdcDataStats(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.pdcDataStats(_, args, context);
		},			
		uiWorkflowMetadata(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.workflowMetadata(_, args, context);
		},			
		uiProgramsProjectsStudies(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.programsProjectsStudies(_, args, context);
		},			
		uiBiospecimenPerStudy(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.biospecimenPerStudy(_, args, context);
		},			
		uiPdcEntityReference(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.pdcEntityReference(_, args, context);
		},			
		uiStudyExperimentalDesign(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.studyExperimentalDesign(_, args, context);
		},			
		uiFilesPerStudy(_, args, context) {
			context['isUI']= true;
			return resolvers.Query.filesPerStudy(_, args, context);
		},			
		//@@@PDC-768 clinical metadata API
		//@@@PDC-3428 add tumor_largest_dimension_diameter
		clinicalMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/clinicalMetadata").send();
				logger.info("clinicalMetadata is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("clinicalMetadata is called from UI with "+ JSON.stringify(args));
			var cmQuery = "SELECT a.aliquot_submitter_id, d.primary_diagnosis, d.tumor_stage, d.tumor_grade, d.morphology, d.tumor_largest_dimension_diameter "+
			"FROM study s, diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm "+
			"WHERE d.case_id=c.case_id AND c.case_id=sam.case_id AND "+
			"sam.sample_id=a.sample_id AND arm.aliquot_id = a.aliquot_id "+
			"AND arm.study_id = s.study_id";
			if (typeof args.study_submitter_id != 'undefined') {
				cmQuery += " and s.study_submitter_id = '"+ args.study_submitter_id +"'";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				cmQuery += " and s.pdc_study_id = '"+ args.pdc_study_id +"'";
			}			
			//"AND arm.study_submitter_id= '"+args.study_submitter_id+"'";
			return pubDb.getSequelize().query(cmQuery, { model: pubDb.getModelByName('ModelClinicalMetadata') });
		},
		//@@@PDC-191 experimental metadata API
		async experimentalMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/experimentalMetadata").send();
				logger.info("experimentalMetadata is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("experimentalMetadata is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var studyQuery = "select s.study_submitter_id, s.pdc_study_id, s.experiment_type, s.analytical_fraction, "+
			"p.instrument_model as instrument from study s, protocol p "+
			"where s.study_id = p.study_id ";
			if (typeof args.study_submitter_id != 'undefined') {
				studyQuery += "and s.study_submitter_id = '"+ args.study_submitter_id +"'";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				studyQuery += "and s.pdc_study_id = '"+ args.pdc_study_id +"'";
			}
			var result = await pubDb.getSequelize().query(studyQuery, { model: pubDb.getModelByName('ModelExperimentalMetadata') });
			return result;
		},
		//@@@PDC-109
		//@@@PDC-153 change count to cases_count
		/**
		* tissueSitesAvailable gets count of cases per tissue site per
		* project. 
		*
		* @param {string}   [tissue_or_organ_of_origin]
		* @param {string}   [project_submitter_id]
		*
		* @return {Diagnosis}
		*/
		tissueSitesAvailable (_, args, context) { 
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/tissueSitesAvailable").send();
				logger.info("tissueSitesAvailable is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("tissueSitesAvailable is called from UI with "+ JSON.stringify(args));
			if (typeof args.project_submitter_id != 'undefined') {
				/*var projectAllowed = false;
				for (var i = 0; i < context.value.length; i++) {
					if (context.value[i] === args.project_submitter_id){
						projectAllowed = true;
					}
				}
				if (!projectAllowed) {
					return null;
				}
				else {*/
				return db.getModelByName('Diagnosis').findAll({
				attributes: ['project_submitter_id', 'tissue_or_organ_of_origin', [db.getSequelize().fn('COUNT', db.getSequelize().col('case_id')), 'cases_count']],
				group: ['project_submitter_id', 'tissue_or_organ_of_origin'],
				where: args
				});					
				//}
			}
			else if (typeof args.tissue_or_organ_of_origin != 'undefined') {
				return db.getModelByName('Diagnosis').findAll({
				attributes: ['project_submitter_id', 'tissue_or_organ_of_origin', [db.getSequelize().fn('COUNT', db.getSequelize().col('case_id')), 'cases_count']],
				group: ['project_submitter_id', 'tissue_or_organ_of_origin'],
				where: {
					tissue_or_organ_of_origin: args.tissue_or_organ_of_origin
					/*project_submitter_id: {
						[Op.in]: context.value
					}*/
				}
				});				
			}
			else {
				return db.getModelByName('Diagnosis').findAll({
				attributes: ['project_submitter_id', 'tissue_or_organ_of_origin', [db.getSequelize().fn('COUNT', db.getSequelize().col('case_id')), 'cases_count']],
				group: ['project_submitter_id', 'tissue_or_organ_of_origin']
				/*where: {
					project_submitter_id: {
						[Op.in]: context.value
					}
				}*/
				});				
				
			}			
		},
		//@@@PDC-110
		//@@@PDC-155 change count to cases_count
		//@@@PDC-156 get disease type instead of primary diagnosis
		/**
		* diseasesAvailable gets count of cases per disease per tissue
		* site per project. 
		*
		* @param {string}   [disease_type]
		* @param {string}   [tissue_or_organ_of_origin]
		* @param {string}   [project_submitter_id]
		*
		* @return {Diagnosis}
		*/
		diseasesAvailable(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/diseasesAvailable").send();
				logger.info("diseasesAvailable is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("diseasesAvailable is called from UI with "+ JSON.stringify(args));
			/*if (typeof args.project_submitter_id != 'undefined') {
				var projectAllowed = false;
				for (var i = 0; i < context.value.length; i++) {
					if (context.value[i] === args.project_submitter_id){
						projectAllowed = true;
					}
				}
				if (!projectAllowed) {
					return null;
				}
			}*/
			//@@@PDC-1341 sync up case counts per disease type on home and browse pages
			var diseaseQuery = "SELECT dia.project_submitter_id,  dia.tissue_or_organ_of_origin, "+
			" c.disease_type, count(distinct dia.diagnosis_id) as cases_count FROM study s, `case` c, sample sam, aliquot al, "+
			" aliquot_run_metadata alm,  demographic dem, diagnosis dia, "+
			" project proj, program prog WHERE alm.study_id = s.study_id and al.aliquot_id "+
			" = alm.aliquot_id  and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
			" c.case_id = dem.case_id and c.case_id = dia.case_id and "+
			" proj.project_id = s.project_id and proj.program_id = prog.program_id ";
			if (typeof args.tissue_or_organ_of_origin != 'undefined'){
				diseaseQuery += " and dia.tissue_or_organ_of_origin = '"+args.tissue_or_organ_of_origin+"' ";				
			}
			if (typeof args.disease_type != 'undefined'){
				diseaseQuery += " and c.disease_type = '"+args.disease_type+"' ";								
			}
			if (typeof args.project_submitter_id != 'undefined') {
				diseaseQuery += " and dia.project_submitter_id = '"+args.project_submitter_id+"' ";								
			}
			/*else {
				diseaseQuery += " and dia.project_submitter_id IN ('" + context.value.join("','") + "')";
			}*/
			diseaseQuery += " GROUP BY dia.project_submitter_id,  dia.tissue_or_organ_of_origin, c.disease_type";
			return db.getSequelize().query(diseaseQuery, { model: db.getModelByName('Diagnosis') });
		},
		//@@@PDC-607 Add uiSunburstChart API
		/**
		* uiSunburstChart is used to create sunburst chart. 
		*
		* @return {UISunburst}
		*/
		uiSunburstChart(_, args, context) {
			logger.info("uiSunburstChart is called with "+ JSON.stringify(args));
			var diseaseQuery = "SELECT diag.project_submitter_id,  diag.tissue_or_organ_of_origin, "+
			" c.disease_type, sam.sample_type, count(diag.case_id) as cases_count "+ 
			" FROM diagnosis diag, `case` c, sample sam "+
			" WHERE diag.case_id = c.case_id and sam.case_id = c.case_id  "+
			" GROUP BY diag.project_submitter_id,  diag.tissue_or_organ_of_origin, c.disease_type, sample_type";		
			return db.getSequelize().query(diseaseQuery, { model: db.getModelByName('ModelUISunburst') });
		},
		//@@@PDC-3162 get current data/software version
		uiDataVersionSoftwareVersion(_, args, context) {
			logger.info("uiDataVersionSoftwareVersion is called with "+ JSON.stringify(args));
			var verQuery = "SELECT data_release, build_tag "+
			" from database_version WHERE is_current_version = 1 ";
			//var verQuery = "SELECT data_release, build_tag "+
			//" from database_version where updated = (select max(updated) from database_version) ";
			return db.getSequelize().query(verQuery, { model: db.getModelByName('ModelUIVersion') });
		},
		//@@@PDC-123
		//@@@PDC-154 get disease type instead of primary diagnosis
		/**
		* allExperimentTypes gets all distinct combination of
		* experiments, diseases and tissue sites. 
		*
		* @param {string}   [disease_type]
		* @param {string}   [tissue_or_organ_of_origin]
		* @param {string}   [experiment_type]
		*
		* @return {Experiment}
		*/
		allExperimentTypes(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/allExperimentTypes").send();
				logger.info("allExperimentTypes is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("allExperimentTypes is called from UI with "+ JSON.stringify(args));
			var experimentQuery = 'SELECT DISTINCT Esac.disease_type, Diag.tissue_or_organ_of_origin, Study.experiment_type FROM diagnosis as Diag, study as Study, `case` as Esac WHERE Diag.project_id = Study.project_id and Diag.case_id = Esac.case_id';
			//@@@PDC-151 check for undefined rather than empty string
			if (typeof args.experiment_type != 'undefined') {
				experimentQuery += " and Study.experiment_type = '"+args.experiment_type+"'";
			}
			if (typeof args.disease_type != 'undefined') {
				experimentQuery += " and Esac.disease_type = '"+args.disease_type+"'";
			}
			if (typeof args.tissue_or_organ_of_origin != 'undefined') {
				experimentQuery += " and Diag.tissue_or_organ_of_origin = '"+args.tissue_or_organ_of_origin+"'";
			}
			//experimentQuery += " and Diag.project_submitter_id IN ('" + context.value.join("','") + "')";
			
			return db.getSequelize().query(experimentQuery, { model: db.getModelByName('ModelExperiments') });
		},
		//@@@PDC-122
		/**
		* allExperimentTypes gets count of cases per experiment per 
		* disease per analytical fraction per project.  
		*
		* @param {string}   [project_submitter_id]
		*
		* @return {Study}
		*/
		diseaseTypesPerProject(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/diseaseTypesPerProject").send();
				logger.info("diseaseTypesPerProject is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("diseaseTypesPerProject is called from UI with "+ JSON.stringify(args));
			if (typeof args.project_submitter_id != 'undefined') {
				var projectAllowed = false;
				for (var i = 0; i < context.value.length; i++) {
					if (context.value[i] === args.project_submitter_id){
						projectAllowed = true;
					}
				}
				if (!projectAllowed) {
					return null;
				}
				else {
					  return db.getModelByName('ModelStudy').findAll({
						  order: [['project_submitter_id', 'DESC']],
						  group: ['project_id', 'experiment_type', 'analytical_fraction', 'cases.disease_type'],
						  where: args,
						  include: [{
								model: db.getModelByName('ModelCase'),
								required: true,
								attributes: ['disease_type', [db.getSequelize().fn('COUNT', db.getSequelize().col('cases.case_id')), 'count']]
							}
							]
					  });
				}
			}
			else {
					  return db.getModelByName('ModelStudy').findAll({
						  order: [['project_submitter_id', 'DESC']],
						  group: ['project_id', 'experiment_type', 'analytical_fraction', 'cases.disease_type'],
						  /*where: {
								project_submitter_id: {
									[Op.in]: context.value
								}
						  },*/
						  include: [{
								model: db.getModelByName('ModelCase'),
								required: true,
								attributes: ['disease_type', [db.getSequelize().fn('COUNT', db.getSequelize().col('cases.case_id')), 'count']]
							}
							]
					  });				
			}
		},
		/**
		* //@@@PDC-650 implement elasticache for API
		* case gets one specific case
		*
		* @param {string}   case_id
		*
		* @return {Case}
		*/
		async case(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/case").send();
				logger.info("case is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("case is called from UI with "+ JSON.stringify(args));
			//@@@PDC-180 Case API for UI case summary
			var cacheFilterName = {name:''};
			//@@@PDC-1371 use uuid instead of submitter_id
			if (typeof args.case_id != 'undefined') {
				cacheFilterName.name +="case_id:("+ args.case_id + ");";
			}
			if (typeof args.case_submitter_id != 'undefined') {
				cacheFilterName.name +="case_submitter_id:("+ args.case_submitter_id + ");";
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('Case')+cacheFilterName['name']);
			if(res === null){
				//@@@PDC-2335 get ext id from reference
				//@@@PDC-2657 reverse 2335
				var uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, "+
				"c.case_submitter_id, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, c.disease_type, "+ 
				"c.index_date, c.lost_to_followup, c.primary_site, c.project_submitter_id "+"from `case` c where case_id is not null ";

				var result = null;
				//@@@PDC-2980 handle multiple cases
				if (typeof args.case_id != 'undefined'){
					let caseIds = args.case_id.split(';');
					uiCaseBaseQuery += "and bin_to_uuid(c.case_id) IN ('" + caseIds.join("','") + "')";
				}
				else if (typeof args.case_submitter_id != 'undefined'){
					let caseSubmitterIds = args.case_submitter_id.split(';');
					uiCaseBaseQuery += "and c.case_submitter_id IN ('" + caseSubmitterIds.join("','") + "')";
				}
				result = await db.getSequelize().query(uiCaseBaseQuery, { model: db.getModelByName('Case') });
				console.log("Case result: "+JSON.stringify(result));
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('Case')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},

		/**
		* casePerFile gets case per file
		*
		* @param {string}   [file_id]
		*
		* @return {FilePerStudy}
		*/
		casePerFile (_, args, context) { 
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/casePerFile").send();
				logger.info("casePerFile is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("casePerFile is called from UI with "+ JSON.stringify(args));
			var fileQuery = "SELECT bin_to_uuid(f.file_id) as file_id, bin_to_uuid(f.case_id) as case_id, f.case_submitter_id from file f where";
			if (typeof args.file_id != 'undefined') {
				let fileIds = args.file_id.split(';');
				fileQuery += " bin_to_uuid(f.file_id) IN ('" + fileIds.join("','") + "')";
			}

			return db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelCaseFile') });
		},
		/**
		* allCases gets all cases
		*
		* @return {Array}
		*/
		allCases(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/allCases").send();
				logger.info("allCases is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("allCases is called from UI with "+ JSON.stringify(args));
			//logger.info("ga track id: "+process.env.GA_TRACKING_ID);
			/*gaVisitor.pageview("/graphqlAPI", function (err) {
				logger.info("ga error: "+err);
			});*/
			//@@@PDC-954 get case uuid
			return pubDb.getModelByName('Case').findAll({ attributes: [['bin_to_uuid(case_id)', 'case_id'],
						'case_submitter_id',
						'project_submitter_id',
						'disease_type',
						'primary_site'
					]
					/*where: {
						project_submitter_id: {
							[Op.in]: context.value
						}
					}*/
			});
		},
		/**
		* program gets one specific program with all its projects
		*
		* @param {string}   program_id
		*
		* @return {Program}
		*/
		program(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/program").send();
				logger.info("program is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("program is called from UI with "+ JSON.stringify(args));
			//@@@PDC-782 avoid null in subquery
			context['arguments']= args
			//@@@PDC-1430 add uuid parameter to program API
			context['noFilter']= "Yes";
			//@@@PDC-899 get program id as uuid
			if (typeof args.program_id != 'undefined'){
				return db.getModelByName('Program').findOne({ attributes: [['bin_to_uuid(program_id)', 'program_id'],
							'program_submitter_id',
							'name',
							'sponsor',
							'start_date',
							'end_date',
							'program_manager'
						],
						where: {
							program_id: Sequelize.fn('uuid_to_bin', args.program_id )
						}
					});
			}
			else {
				return db.getModelByName('Program').findOne({ attributes: [['bin_to_uuid(program_id)', 'program_id'],
							'program_submitter_id',
							'name',
							'sponsor',
							'start_date',
							'end_date',
							'program_manager'
						],
						where: {
							program_submitter_id: args.program_submitter_id
						}
					});				
			}

		},
		/**
		* allPrograms gets all programs
		*
		* @return {Array}
		*/
		allPrograms(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/allPrograms").send();
				logger.info("allPrograms is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("allPrograms is called from UI with "+ JSON.stringify(args));
			//@@@PDC-782 avoid null in subquery
			context['arguments']= args;
			//@@@PDC-1430 add uuid parameter to program API
			context['noFilter']= "Yes";
			//@@@PDC-899 get program id as uuid
		    return db.getModelByName('Program').findAll({ attributes: [['bin_to_uuid(program_id)', 'program_id'],
						'program_submitter_id',
						'name',
						'sponsor',
						'start_date',
						'end_date',
						'program_manager'
					]
				});
		},
		//@@@PDC-164 plex-level spectral count
		//@@@PDC-333 gene/spectral count API change
		//@@@PDC-650 implement elasticache for API
		/**
		* geneSpectralCount gets one specific gene with all its spectral * counts
		*
		* @param {string}   gene_name_id
		*
		* @return {Gene}
		*/
		async uiGeneSpectralCount(_, args, context) {
			logger.info("uiGeneSpectralCount is called with "+ JSON.stringify(args));
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getModelByName('Gene').findOne({ where: args});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-2614 rearrange geneSpectralCount
		geneSpectralCount(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/geneSpectralCount").send();
				logger.info("geneSpectralCount is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("geneSpectralCount is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var geneQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, ncbi_gene_id as NCBI_gene_id, authority, description, organism, locus, proteins, trim(both '\r' from assays) as assays FROM gene where gene_name = '"+ args.gene_name+"'";
			return db.getSequelize().query(geneQuery, { model: db.getModelByName('ModelGene') });
		},
		//@@@PDC-164 plex-level spectral count
		/**
		* geneSpectralCount gets all spectral counts for an aliquot
		* 
		* @param {string}   gene_name_id
		* @param {string}   dataset_alias
		*
		* @return {Gene}
		*/
		aliquotSpectralCount(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/aliquotSpectralCount").send();
				logger.info("aliquotSpectralCount is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("aliquotSpectralCount is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2638 enhance aliquotSpectralCount
			context['arguments'] = args;
			var aliquotQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, ncbi_gene_id as NCBI_gene_id, authority, description, organism, locus, proteins, trim(both '\r' from assays) as assays FROM gene where gene_name = '"+ args.gene_name+"'";
			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('ModelGene') });
		},
		/**
		* protein gets one specific gene with all its spectral counts
		*
		* @param {string}   protein
		*
		* @return {Gene}
		*/
		protein(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/protein").send();
				logger.info("protein is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("protein is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2642 gene-related apis enhancement
			context['arguments'] = args;
			var aliquotQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, ncbi_gene_id as NCBI_gene_id, authority, description, organism, locus, proteins, trim(both '\r' from assays) as assays FROM gene where proteins like '%"+ args.protein+"%'";
			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('ModelGene') });
		},
		//@@@PDC-133 projects per experiment_type
		/**
		* projectsPerExperimentType gets experiment types and all projects associated
		*
		* @param {string}   experiment_type
		*
		* @return {ExperimentProjects}
		*/
		projectsPerExperimentType(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/projectsPerExperimentType").send();
				logger.info("projectsPerExperimentType is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("projectsPerExperimentType is called from UI with "+ JSON.stringify(args));
			var experimentQuery = 'SELECT DISTINCT Study.experiment_type, Project.project_submitter_id, Project.name FROM study as Study, project as Project  WHERE Project.project_id = Study.project_id';
			//@@@PDC-151 check for undefined rather than empty string
			if (typeof args.experiment_type != 'undefined') {
				experimentQuery += " and Study.experiment_type = '"+args.experiment_type+"'";
			}
			//experimentQuery += " and Study.project_submitter_id IN ('" + context.value.join("','") + "')";
			
			return db.getSequelize().query(experimentQuery, { model: db.getModelByName('ModelExperimentProjects') });
		},
				
		//@@@PDC-162 file manifest
		//@@@PDC-188 study and file many-to-many
		//@@@PDC-650 implement elasticache for API
		/**
		* filesCountPerStudy gets count of files per study per
		* file type. 
		*
		* @param {string}   [study_submitter_id]
		* @param {string}   [file_type]
		*
		* @return {File}
		*/
		async filesCountPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/filesCountPerStudy").send();
				logger.info("filesCountPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesCountPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-270 replace file_submitter_id with file_id
			var fileQuery = 'SELECT study.study_submitter_id as study_submitter_id, study.pdc_study_id as pdc_study_id, file.file_type as file_type, file.data_category, COUNT(file.file_id) AS files_count FROM file AS file, study AS study, study_file AS sf WHERE file.file_id = sf.file_id and study.study_id = sf.study_id';
			var cacheFilterName = {name:''};
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and study.study_submitter_id = '"+args.study_submitter_id+"'";
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";		
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and study.pdc_study_id = '"+args.pdc_study_id+"'";
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";		
			}
			//@@@PDC-1355 add uuid parameter to ui APIs 
			if (typeof args.study_id != 'undefined') {
				fileQuery += " and study.study_id = uuid_to_bin('"+args.study_id+"')";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";		
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and file.file_type = '"+args.file_type+"'";
				cacheFilterName.name +="file_type:("+ args.file_type + ");";		
			}
			//fileQuery += " and study.project_submitter_id IN ('" + context.value.join("','") + "')";
			fileQuery += " GROUP BY sf.study_id, file.file_type, data_category";
			
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('FileCountPerStudy')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('FileCountPerStudy')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-2167 group files by data source
		async uiStudyFilesCountBySource (_, args, context) {
			logger.info("uiStudyFilesCountBySource is called with "+ JSON.stringify(args));
			var fileQuery = "SELECT distinct s.study_submitter_id, s.pdc_study_id, f.data_source "+
			"FROM file f, study s, study_file AS sf WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
			"and f.data_source is not null";
			var cacheFilterName = {name:''};
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and s.study_submitter_id = '"+args.study_submitter_id+"'";
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";		
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and s.pdc_study_id = '"+args.pdc_study_id+"'";
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";		
			}
			if (typeof args.study_id != 'undefined') {
				fileQuery += " and s.study_id = uuid_to_bin('"+args.study_id+"')";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";		
			}
			
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('StudyFilesCountBySource')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelStudyFileSource') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('StudyFilesCountBySource')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-162 file manifest
		//@@@PDC-188 study and file many-to-many
		//@@@PDC-471 filePerStudy api enhancement
		//@@@PDC-898 new public APIs--filesPerStudy
		/**
		* filesPerStudy gets files per study
		*
		* @param {string}   [study_submitter_id]
		* @param {string}   [file_type]
		* @param {string}   [file_name]
		*
		* @return {FilePerStudy}
		*/
		filesPerStudy (_, args, context) { 
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/filesPerStudy").send();
				logger.info("filesPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesPerStudy is called from UI with "+ JSON.stringify(args));
			var fileQuery = "SELECT s.study_submitter_id, s.pdc_study_id, s.submitter_id_name as study_name, bin_to_uuid(s.study_id) as study_id, bin_to_uuid(f.file_id) as file_id,"+
			" f.file_type, f.file_name, f.md5sum, f.file_size, f.data_category, "+
			" f.original_file_name as file_submitter_id, f.file_location, f.file_format"+
			" FROM file AS f, study AS s, study_file AS sf"+
			" WHERE f.file_id = sf.file_id and s.study_id = sf.study_id";
			//@@@PDC-3529 check for current version if not query by id
			let queryById = false;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				fileQuery += " and s.study_id = uuid_to_bin('" + args.study_id + "')";
				queryById = true;
			}
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and s.study_submitter_id = '"+args.study_submitter_id+"'";
				queryById = true;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and s.pdc_study_id = '"+args.pdc_study_id+"'";
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and f.file_type = '"+args.file_type+"'";
			}
			if (typeof args.file_name != 'undefined' && args.file_name.length > 0) {
				let fns = args.file_name.split(";");
				fileQuery += " and f.file_name IN ('" + fns.join("','") + "')";
			}
			if (typeof args.file_format != 'undefined') {
				fileQuery += " and f.file_format = '"+args.file_format+"'";
			}
			if (typeof args.data_category != 'undefined') {
				fileQuery += " and f.data_category = '"+args.data_category+"'";
			}
			if (!queryById) {
				fileQuery += " and s.is_latest_version = 1 ";
			}
			//fileQuery += " and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			fileQuery += " LIMIT 0, 5000";
			
			return db.getSequelize().query(fileQuery, { model: db.getModelByName('ModelStudyFile') });
		},

		//@@@PDC-163 project per instrument
		/**
		* projectsPerInstrument gets projects per instrument
		*
		* @param {string}   [instrument]
		*
		* @return {ModelProtocol}
		*/
		projectsPerInstrument (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/projectsPerInstrument").send();
				logger.info("filesPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-632 use id instead of submitter_id
			//@@@PDC-652 new protocol structure
			var protoQuery = 'SELECT DISTINCT proto.instrument_model as instrument_model, study.project_submitter_id as project_submitter_id FROM protocol AS proto, study AS study WHERE proto.study_id = study.study_id';
			if (typeof args.instrument != 'undefined') {
				protoQuery += " and proto.instrument_model like '%" +args.instrument+"%'";
			}
			else {
				protoQuery += " and proto.instrument_model != ''";
			}
			//protoQuery += " and study.project_submitter_id IN ('" + context.value.join("','") + "')";
			
			return db.getSequelize().query(protoQuery, { model: db.getModelByName('ModelProtocol') });
		},
		//@@@PDC-218 Portal Statistics API
		pdcDataStats(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/pdcDataStats").send();
				logger.info("pdcDataStats is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("pdcDataStats is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1389 get latest statistics
			let dataStatsQuery = "SELECT * from pdc_data_statistics order by updated desc";
			return db.getSequelize().query(dataStatsQuery, { model: db.getModelByName('ModelPDCDataStatistics') });
		},
		//@@@PDC-165 workflow metadata APIs
		//@@@PDC-650 implement elasticache for API
		/**
		* workflowMetadata gets workflowMetadata by id
		*
		* @param {string}   [workflow_metadata_id]
		*
		* @return {WorkflowMetadata}
		*/
		async workflowMetadata (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/workflowMetadata").send();
				logger.info("workflowMetadata is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else
				logger.info("workflowMetadata is called from UI with "+ JSON.stringify(args));
			var metadataQuery = 'SELECT metadata.workflow_metadata_submitter_id, metadata.study_submitter_id, study.pdc_study_id, metadata.protocol_submitter_id, metadata.cptac_study_id, metadata.submitter_id_name, metadata.study_submitter_name, metadata.analytical_fraction, metadata.experiment_type, metadata.instrument, metadata.refseq_database_version, metadata.uniport_database_version, metadata.hgnc_version, metadata.raw_data_processing, metadata.raw_data_conversion, metadata.sequence_database_search, metadata.search_database_parameters, metadata.phosphosite_localization, metadata.ms1_data_analysis, metadata.psm_report_generation, metadata.cptac_dcc_mzidentml, metadata.mzidentml_refseq, metadata.mzidentml_uniprot, metadata.gene_to_prot, metadata.cptac_galaxy_workflows, metadata.cptac_galaxy_tools, metadata.cdap_reports, metadata.cptac_dcc_tools FROM workflow_metadata AS metadata, study AS study WHERE metadata.study_id = study.study_id';
			var cacheFilterName = {name:''};
			if (typeof args.workflow_metadata_submitter_id != 'undefined') {
				metadataQuery += " and metadata.workflow_metadata_submitter_id = '"+args.workflow_metadata_submitter_id+"'";
				cacheFilterName.name +="workflow_metadata_submitter_id:("+ args.workflow_metadata_submitter_id + ");";		
			}
			if (typeof args.study_submitter_id != 'undefined') {
				metadataQuery += " and metadata.study_submitter_id = '"+args.study_submitter_id+"'";
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";		
			}
			if (typeof args.pdc_study_id != 'undefined') {
				metadataQuery += " and study.pdc_study_id = '"+args.pdc_study_id+"'";
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";		
			}
			//@@@PDC-1355 add uuid parameter to ui APIs 
			if (typeof args.study_id != 'undefined') {
				metadataQuery += " and metadata.study_id = uuid_to_bin('"+args.study_id+"')";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";		
			}
			//metadataQuery += " and study.project_submitter_id IN ('" + context.value.join("','") + "')";

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('WorkflowMetadata')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(metadataQuery, { model: db.getModelByName('ModelWorkflowMetadata')});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('WorkflowMetadata')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-185 API for UI page 2
		//@@@PDC-248 Rename API uiCombo to uiStudy
		//@@@PDC-584 Rework uiStudy to return study name only
		/**
		* uiStudy gets combo data for UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		* @param {string}   [study_submitter_id]
		* @param {string}   [ethnicity]
		* @param {string}   [race]
		* @param {string}   [gender]
		* @param {string}   [morphology]
		* @param {string}   [primary_diagnosis]
		* @param {string}   [site_of_resection_or_biopsy]
		* @param {string}   [tissue_or_organ_of_origin]
		* @param {string}   [tumor_grade]
		* @param {string}   [tumor_stage]
		* @param {string}   [data_category]
		* @param {string}   [sample_type]
		* @param {string}   [acquisition_type]
		*
		* @return {UIStudy}
		*/
		async uiStudy (_, args, context) {
			logger.info("uiStudy is called with "+ JSON.stringify(args));
			var comboQuery = "SELECT distinct s.study_submitter_id, s.pdc_study_id, s.submitter_id_name"+
			" FROM study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm,"+
			" demographic dem, diagnosis dia, study_file sf, file f,"+
			" project proj, program prog WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id and proj.project_id = s.project_id"+
			" and c.case_id = dem.case_id and c.case_id = dia.case_id and"+
			" s.study_id = sf.study_id and sf.file_id = f.file_id ";
			//" and proj.program_id = prog.program_id and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			comboQuery += filters(args);
			
			var result = await db.getSequelize().query(comboQuery, { model: db.getModelByName('ModelUIStudy') });
			return result;
			
		},
		//@@@PDC-1216 redesign filter api
		//The filter query was divided into 2 queries. Query1 joining study, aliquot, aliquot_run_metadata, 
		//case, sample, demographic, diagnosis tables. Query2 joining study, study_file, file tables.
		//Step 1: Apply filters on Query1 and Query2 to get study array and do intersection on these two arraies
		//Step 2: Apply filters and intersected study array on Query1 and Query2 to get all filters fields
		//Step 3: merge all filters fields together from Query1 and Query2 results
		/**
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [study_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		* @param {string}   [study_submitter_id]
		* @param {string}   [ethnicity]
		* @param {string}   [race]
		* @param {string}   [gender]
		* @param {string}   [morphology]
		* @param {string}   [primary_diagnosis]
		* @param {string}   [site_of_resection_or_biopsy]
		* @param {string}   [tissue_or_organ_of_origin]
		* @param {string}   [tumor_grade]
		* @param {string}   [tumor_stage]
		* @param {string}   [data_category]
		* @param {string}   [sample_type]
		* @param {string}   [acquisition_type]
		*
		* @return {UIFilter}
		*/
		async uiFilters (_, args, context) {
			logger.info("uiFilters is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			//Step1 get base queries
			let fileStudyQuery = queryList.file_study;
			let progProjAlSamCaDemDiaStudyQuery = queryList.prog_proj_al_sam_ca_dem_dia_study;

			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args);
			let projProjFilter = applyProgProjFilter(args);
			let fileFilter = applyFileFilter(args);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args);
			fileStudyQuery += studyFilter;
			progProjAlSamCaDemDiaStudyQuery += studyFilter;
			fileStudyQuery += fileFilter;
			progProjAlSamCaDemDiaStudyQuery += projProjFilter;
			progProjAlSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//Step1 get study_submitter_id on Query1 and Query2
			let fileStudyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let progProjAlSamCaDemDiaStudyResult = await db.getSequelize().query(progProjAlSamCaDemDiaStudyQuery, { model: db.getModelByName('ModelFilterStudy') });

			//Step1 do intersection on Query1 and Query2 to get intersected study array.
			let intersectedStudy = studyIntersection(fileStudyResult, progProjAlSamCaDemDiaStudyResult);

			//Step2 get base queries
			let fileFilterQuery = queryList.file_filter;
			let progProjAlSamCaDemDiaFilterQuery = queryList.prog_proj_al_sam_ca_dem_dia_filter;

			//Step2 apply filters on queries
			fileFilterQuery += studyFilter;
			progProjAlSamCaDemDiaFilterQuery += studyFilter;
			fileFilterQuery += fileFilter;
			progProjAlSamCaDemDiaFilterQuery += projProjFilter;
			progProjAlSamCaDemDiaFilterQuery += alSamCaDemDiaFilter;

			//Step2 get Query1 and Query2 results
			let fileFilterResult = await db.getSequelize().query(fileFilterQuery, { model: db.getModelByName('ModelFilterFile') });
			let progProjAlSamCaDemDiaFilterResult = await db.getSequelize().query(progProjAlSamCaDemDiaFilterQuery, { model: db.getModelByName('ModelFilterProgProjAlSamCaDemDia') });

			let fileFinalFilter = uiFilterSubqueryProcess('file', fileFilterResult, intersectedStudy);
			let progProjAlSamCaDemDiaFinalFilter = uiFilterSubqueryProcess('progProjAlSamCaDemDia', progProjAlSamCaDemDiaFilterResult, intersectedStudy);
			
			//Step3
			return Object.assign(fileFinalFilter, progProjAlSamCaDemDiaFinalFilter);
		},
		//@@@PDC-198 API for UI case page
		/**
		* uiCase gets case data for UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		*
		* @return {UICase}
		*/
		uiCase (_, args, context) {
			logger.info("uiCase is called with "+ JSON.stringify(args));
		    //@@@PDC-203 correct query for UI cases page
			//@@@PDC-337 add program name 
			var uiCaseQuery = "SELECT distinct bin_to_uuid(al.aliquot_id) as aliquot_id, "+
			" bin_to_uuid(sam.sample_id) as sample_id, bin_to_uuid(c.case_id) as case_id, "+
			" proj.name as project_name, sam.sample_type, c.disease_type, c.primary_site, prog.name as program_name "+
			" from study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm, "+
			" project proj, program prog  where alm.study_id=s.study_id and "+
			" al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			" and proj.project_id = s.project_id and proj.program_id = prog.program_id ";
			//" s.project_submitter_id IN ('" + context.value.join("','") + "')";
			uiCaseQuery += filters(args);
			//temporarily limit records to 500
			uiCaseQuery += " LIMIT 0, 500";
			return db.getSequelize().query(uiCaseQuery, { model: db.getModelByName('ModelUICase') });
		},
		//@@@PDC-199 API for UI file page
		/**
		* uiFile gets file data for UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		*
		* @return {UIFile}
		*/
		uiFile (_, args, context) {
			logger.info("uiFile is called with "+ JSON.stringify(args));
			var uiFileQuery = "select distinct s.submitter_id_name, f.file_name, "+
			" sf.study_run_metadata_submitter_id ,proj.name as project_name, f.file_type, f.file_size"+
			" from study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm, "+
			" project proj, program prog, study_file sf, file f where alm.study_id=s.study_id "+
			" and al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
			" proj.project_id = s.project_id and proj.program_id = prog.program_id and sf.study_id = s.study_id "+" and sf.file_id = f.file_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			uiFileQuery += filters(args);
			//temporarily limit records to 250
			uiFileQuery += " LIMIT 0, 500";
			return db.getSequelize().query(uiFileQuery, { model: db.getModelByName('ModelUIFile') });
		},
		//@@@PDC-271 API to retrieve protocol data for PDC UI
		//@@@PDC-650 implement elasticache for API
		/**
		* uiProtocol gets protocol data for UI
		*
		* @param {string}   [study_submitter_id]
		*
		* @return {uiProtocol}
		*/
		async uiProtocol (_, args, context) {
			logger.info("uiProtocol is called with "+ JSON.stringify(args));
			//@@@PDC-652 new protocol structure
			//@@@PDC-1154 column name correction: fractions_analyzed_count
			var protoQuery = "SELECT distinct bin_to_uuid(prot.protocol_id) as protocol_id, "+
			"prot.protocol_submitter_id, prot.experiment_type, protocol_name, "+ "protocol_date, document_name, quantitation_strategy, "+
			"label_free_quantitation, labeled_quantitation,  isobaric_labeling_reagent, "+ 
			"reporter_ion_ms_level, starting_amount, starting_amount_uom, "+ "digestion_reagent, alkylation_reagent, enrichment_strategy, enrichment, "+ 
			"chromatography_dimensions_count, 1d_chromatography_type as one_d_chromatography_type, "+ 
			"2d_chromatography_type as two_d_chromatography_type, "+ 
			"fractions_analyzed_count, column_type, amount_on_column, "+
			"amount_on_column_uom, column_length, column_length_uom, "+
			"column_inner_diameter, column_inner_diameter_uom, particle_size, "+
			"particle_size_uom, particle_type, gradient_length, "+
			"gradient_length_uom, instrument_make, instrument_model, "+
			"dissociation_type, ms1_resolution, ms2_resolution, "+
			"dda_topn, normalized_collision_energy, acquistion_type, "+ 
			"dia_multiplexing, dia_ims, auxiliary_data, prot.cud_label "+
			" from study s, project proj, protocol prot "+
			" where prot.study_id = s.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var cacheFilterName = {name:''};
			//@@@PDC-1355 add uuid parameter to ui APIs 
			if (typeof args.study_id != 'undefined') {
				protoQuery += " and s.study_id = uuid_to_bin('"+args.study_id+"')";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";		
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let study = args.study_submitter_id.split(";");
				protoQuery += " and s.study_submitter_id IN ('" + study.join("','") + "')";
				cacheFilterName.name +="study_submitter_id:("+ study.join("','") + ");";		
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				protoQuery += " and s.pdc_study_id IN ('" + studySub.join("','") + "')";
				cacheFilterName.name +="pdc_study_id:("+ studySub.join("','") + ");";		
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('Protocol')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(protoQuery, { model: db.getModelByName('ModelProtocol') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('Protocol')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-273 API to retrieve publication data for PDC UI
		//@@@PDC-650 implement elasticache for API
		/**
		* uiPublication gets publication data for UI
		*
		* @param {string}   [study_submitter_id]
		*
		* @return {uiPublication}
		*/
		async uiPublication (_, args, context) {
			logger.info("uiPublication is called with "+ JSON.stringify(args));
			//@@@PDC-3446 new publication data for PDC UI
			var pubQuery = "SELECT bin_to_uuid(pub.publication_id) as publication_id, concat('https://www.ncbi.nlm.nih.gov/pubmed/', pub.pubmed_id) as pubmed_id, pub.citation as title "+
			" from publication pub, study_publication sp, study s "+
			" where pub.publication_id = sp.publication_id and s.study_id = sp.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var cacheFilterName = {name:''};
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let study = args.study_submitter_id.split(";");
				pubQuery += " and sp.study_submitter_id IN ('" + study.join("','") + "')";
				cacheFilterName.name +="study_submitter_id:("+ study.join("','") + ");";		
			}
			if (typeof args.pdc_study_id != 'undefined') {
				pubQuery += " and s.pdc_study_id = '"+args.pdc_study_id+"'";
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";		
			}
			//@@@PDC-1355 add uuid parameter to ui APIs 
			if (typeof args.study_id != 'undefined') {
				pubQuery += " and sp.study_id = uuid_to_bin('"+args.study_id+"')";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";		
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('Publication')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(pubQuery, { model: db.getModelByName('ModelUIPublication') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('Publication')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-3362 handle legacy studies
		uiLegacyStudies(_, args, context) {
			logger.info("uiLegacyStudies is called with "+ JSON.stringify(args));
			var legacyQuery = "SELECT bin_to_uuid(study_id) as study_id, study_submitter_id, "+
			"pdc_study_id, project_submitter_id, study_shortname, study_description, submitter_id_name, "+"cptac_phase, analytical_fraction, experiment_type, acquisition_type, embargo_date "+
			"FROM legacy_study WHERE study_id is not null ";
			if (typeof args.project_submitter_id != 'undefined' && args.project_submitter_id.length > 0) {
				let projects = args.project_submitter_id.split(";");
				legacyQuery += " and project_submitter_id IN ('" + projects.join("','") + "')";
			}
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				legacyQuery += " and study_id = uuid_to_bin('"+args.study_id+"')";
			}
			return db.getSequelize().query(legacyQuery, { model: db.getModelByName('ModelUIStudy') });
			
		},
		//@@@PDC-329 Pagination for UI study summary page
		//@@@PDC-497 Make table column headers sortable on the browse page tabs
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIStudy (_, args, context) {
			logger.info("getPaginatedUIStudy is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByStudy = " GROUP BY submitter_id_name ";

			//Step1 get base queries
			let studyCountQuery=queryList.study_tab_count;
			let studyDataQuery=queryList.study_tab_data;
			let fileStudyQuery = queryList.file_study;

			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);
			studyCountQuery += studyFilter;
			studyDataQuery += studyFilter;
			fileStudyQuery += studyFilter;
			studyCountQuery += projProjFilter;
			studyDataQuery += projProjFilter;
			studyCountQuery += alSamCaDemDiaFilter;
			studyDataQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			//get study from file study subquery
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			//apply study where condition in study query
			studyCountQuery += studyResultCondition;
			studyDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			var uiSortQuery = sort(args, cacheFilterName);

			if(uiSortQuery.length === 0 ){
				//default sort by column
				uiSortQuery = " order by s.pdc_study_id desc ";
			}

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			//@@@PDC-3205 check offset and limit for zero and negative
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			else if (args.limit < 0) {
				myLimit = 0;
			}
			var uiComboLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] =studyDataQuery+groupByStudy+uiSortQuery+uiComboLimitQuery;
			//context['caCountQuery'] = uiComboCaseAliquotQuery+uiComboQuery;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyData')+cacheFilterName['dataFilterName'];
			//console.log("Cache Name: "+context['dataCacheName']);
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(studyCountQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-3362 handle legacy studies
		async getPaginatedUILegacyFile(_, args, context) {
			logger.info("getPaginatedUILegacyFile is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			let legacyCacheName = 'Legacy;File;';
			let legacyTotalCacheName = 'Total;Legacy;File;';
			let fileCountQuery= "SELECT COUNT(DISTINCT f.file_id) AS total ";
			let fileBaseQuery= "FROM legacy_study s, legacy_study_file sf, legacy_file f WHERE "+
			" s.study_id = sf.study_id AND sf.file_id = f.file_id ";
			let fileDataQuery= "SELECT DISTINCT BIN_TO_UUID(f.file_id) AS file_id, "+
			"BIN_TO_UUID(s.study_id) AS study_id, s.pdc_study_id, s.submitter_id_name, s.embargo_date, "+
			"f.file_name, sf.study_run_metadata_submitter_id, s.project_submitter_id AS project_name, "+
			"f.data_category, f.file_type, f.downloadable, f.md5sum, f.access, "+
			"CAST(f.file_size AS UNSIGNED) AS file_size ";
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				fileBaseQuery += " and s.study_id = uuid_to_bin('"+args.study_id+"')";
				legacyCacheName += 'Study:'+args.study_idt+';';
				legacyTotalCacheName += 'Study:'+args.study_idt+';';
			}
			let myOffset = 0;
			let myLimit = 1000;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				legacyCacheName += 'offet:'+args.offset+';';
				legacyCacheName += 'limit:'+args.limit+';';
			}
			let uiFileLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;

			let uiSortQuery = "";
			if (typeof args.sort != 'undefined' && args.sort.length > 0) {
				uiSortQuery += " order by " +args.sort + " ";
				legacyCacheName += "order_by:("+ args.sort + ");";
			}
			
			context['dataCacheName'] = legacyCacheName;
			context['query'] = fileDataQuery+fileBaseQuery+uiSortQuery+uiFileLimitQuery;
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(legacyTotalCacheName);
				if(res === null){
					var rawData = await db.getSequelize().query(fileCountQuery+fileBaseQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(legacyTotalCacheName, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
			
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIFile(_, args, context) {
			logger.info("getPaginatedUIFile is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			var cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			//Step1 get base queries
			let fileCountQuery=queryList.file_tab_count;
			let fileDataQuery=queryList.file_tab_data;
			let alSamCaDemDiaStudyQuery = queryList.al_sam_ca_dem_dia_study;

			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);
			fileCountQuery += studyFilter;
			fileDataQuery += studyFilter;
			alSamCaDemDiaStudyQuery += studyFilter;
			fileCountQuery += projProjFilter;
			fileDataQuery += projProjFilter;
			fileCountQuery += fileFilter;
			fileDataQuery += fileFilter;
			alSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//get study from aliquot sample case demographic diagnosis subquery
			let studyResult = await db.getSequelize().query(alSamCaDemDiaStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			fileCountQuery += studyResultCondition;
			fileDataQuery += studyResultCondition;
			
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			let uiSortQuery = sort(args, cacheFilterName);

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiFileLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;

			context['query'] = fileDataQuery+uiSortQuery+uiFileLimitQuery;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('FileData')+cacheFilterName['dataFilterName'];
			
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('FileTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(fileCountQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('FileTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIClinical(_, args, context) {
			logger.info("getPaginatedUIClinical is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			//Step1 get base queries
			let clinicalCountQuery=queryList.clinical_tab_count;
			let clinicalDataQuery=queryList.clinical_tab_data;
			let fileStudyQuery = queryList.file_study;
			
			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);
			clinicalCountQuery += studyFilter;
			clinicalDataQuery += studyFilter;
			fileStudyQuery += studyFilter;
			clinicalCountQuery += projProjFilter;
			clinicalDataQuery += projProjFilter;
			clinicalCountQuery += alSamCaDemDiaFilter;
			clinicalDataQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			//get study from file study subquery
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			clinicalCountQuery += studyResultCondition;
			clinicalDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiSortQuery = sort(args, cacheFilterName);

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiClinicalLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = clinicalDataQuery+uiSortQuery+uiClinicalLimitQuery;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalData')+cacheFilterName['dataFilterName'];
			
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(clinicalCountQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUICase (_, args, context) {
			logger.info("getPaginatedUICase is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			var cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			//Step1 get base queries
			//let caseCountQuery=queryList.case_tab_count + projectSubmitterIdCondition;
			//let caseDataQuery=queryList.case_tab_data + projectSubmitterIdCondition;
			//let fileStudyQuery = queryList.file_study + projectSubmitterIdCondition;
			let caseCountQuery=queryList.case_tab_count;
			let caseDataQuery=queryList.case_tab_data;
			let fileStudyQuery = queryList.file_study;
			
			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);
			caseCountQuery += studyFilter;
			caseDataQuery += studyFilter;
			fileStudyQuery += studyFilter;
			caseCountQuery += projProjFilter;
			caseDataQuery += projProjFilter;
			caseCountQuery += alSamCaDemDiaFilter;
			caseDataQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;
			
			//get study from file study subquery
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			caseCountQuery += studyResultCondition;
			caseDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiSortQuery = sort(args, cacheFilterName);

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = caseDataQuery+uiSortQuery+uiCaseLimitQuery;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseData')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(caseCountQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-3009 ataCategoryFileTypeMapping
		async uiDataCategoryFileTypeMapping(_, args, context) {
			logger.info("uiDataCategoryFileTypeMapping is called with "+ JSON.stringify(args));
			let DataCategoryFileTypeMapping = "DataCategoryFileTypeMapping";
			const res = await RedisCacheClient.redisCacheGetAsync(DataCategoryFileTypeMapping);
			if(res === null){
				let dataCategoryFileTypeMapping = "select distinct data_category, file_type from pdc.file order by data_category";
				var result = await db.getSequelize().query(dataCategoryFileTypeMapping, { model: db.getModelByName('ModelFile') });
				RedisCacheClient.redisCacheSetExAsync(DataCategoryFileTypeMapping, JSON.stringify(result));			
				return result;
			}
			else {
				return  JSON.parse(res);
			}
		},
		//@@@PDC-579 gene tabe pagination
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIGene(_, args, context) {
			logger.info("getPaginatedUIGene is called with "+ JSON.stringify(args));
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			var cacheFilterName = {name:''};

			//Step1 get base queries
			//let fileDataQuery=queryList.file_study + projectSubmitterIdCondition;
			//let progProjAlSamCaDemDiaStudyQuery = queryList.prog_proj_al_sam_ca_dem_dia_study + projectSubmitterIdCondition;
			let fileDataQuery=`
			SELECT DISTINCT
				BIN_TO_UUID(s.study_id) as study_id
			FROM
				study s,
				study_file sf,
				file f
			WHERE
				s.study_id = sf.study_id
					AND sf.file_id = f.file_id
			`;

			let progProjAlSamCaDemDiaStudyQuery =  `
			SELECT DISTINCT
				BIN_TO_UUID(s.study_id) as study_id
			FROM
				study s,
				project proj,
				program prog,	
				aliquot al,
				aliquot_run_metadata alm,
				\`case\` c,
				sample sam,
				demographic dem,
				diagnosis dia
			WHERE
				proj.program_id = prog.program_id
					AND proj.project_id = s.project_id
						AND alm.study_id = s.study_id
					AND al.aliquot_id = alm.aliquot_id
					AND al.sample_id = sam.sample_id
					AND sam.case_id = c.case_id
					AND c.case_id = dem.case_id
					AND c.case_id = dia.case_id
			`;
			
			//Step1 apply filters on queries
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);			
			fileDataQuery += studyFilter;
			progProjAlSamCaDemDiaStudyQuery += studyFilter;
			fileDataQuery += fileFilter;
			progProjAlSamCaDemDiaStudyQuery += projProjFilter;
			progProjAlSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//get study from file study subquery and program project aliquot sample case demographic diagnosis
			let studyResult1 = await db.getSequelize().query(fileDataQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResult2 = await db.getSequelize().query(progProjAlSamCaDemDiaStudyQuery, { model: db.getModelByName('ModelFilterStudy') });

			let studyArray = studyIdIntersection(studyResult1, studyResult2);
			let filterValue = studyArray.join("') , UUID_TO_BIN('");

			let studyIdQueryCondition = ` sc.study_id IN (UUID_TO_BIN('${filterValue}')) `;  		

			let geneDataQuery = `
					SELECT DISTINCT
					ge.gene_name, ge.gene_id, chromosome, locus, proteins
				FROM
					pdc.gene AS ge,
					(select distinct gene_name from pdc.spectral_count AS sc where ${studyIdQueryCondition}  ) sca
				where ge.gene_name = sca.gene_name
			`;

			let geneStudyCountQuery = `
				SELECT sc.gene_name, COUNT(distinct sc.study_id) AS num_study
				FROM
					pdc.spectral_count AS sc
				WHERE
					${studyIdQueryCondition}
			`;

			//proteins
			let geneNameSub;
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				geneNameSub = args.gene_name.split(";");
				cacheFilterName.name += "geneNameSub:("+ geneNameSub.join(",") + ")";
				geneDataQuery += " and ge.gene_name IN ('" + geneNameSub.join("','") + "') ";
			}

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var uiSortQuery = sort(args, cacheFilterName);

			if(uiSortQuery.length === 0 ){
				//default sort by column
				uiSortQuery = " order by ge.gene_name ";
			}

			var myOffset = 0;
			var myLimit = 1000;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var uiCaseLimitQuery = " LIMIT " + myOffset + ", " + myLimit;
			context['query'] = geneDataQuery  + uiSortQuery + uiCaseLimitQuery;
			context['geneStudyCountQuery'] = geneStudyCountQuery;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneData')+cacheFilterName['dataFilterName'];
			if (typeof geneNameSub != 'undefined' && geneNameSub.length > 0){
				return [{ total: geneNameSub.length }];
			}
			else if(myOffset == 0 && paginated) {
				//gene count query is slow, so cache genes mapping to each study
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneTotalCount')+cacheFilterName.name);
				if(res === null){
					//console.time('gene_cache_study');
					//get gene count
					let studyMap =new Map(); 
					let finalSet = new Set();
					for(let studyName of studyArray){
						let studyCacheName = CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneStudy')+studyName
						const studyGeneListRes = await RedisCacheClient.redisCacheGetAsync(studyCacheName);
						let studyGeneArray = [];
						if(studyGeneListRes == null){
							let studyQuery = `
							SELECT 
								distinct ge.gene_name
							FROM
								gene AS ge,
								spectral_count AS sc,
								study AS s
							WHERE
								s.study_id = sc.study_id
									AND ge.gene_id = sc.gene_id
									AND s.study_id = UUID_TO_BIN('${studyName}')
							`;
							
							let studyResult = await db.getSequelize().query(studyQuery, { model: db.getModelByName('ModelUIGeneName') });
							studyResult.forEach(element => {studyGeneArray.push(element.dataValues.gene_name);
							finalSet.add(element.dataValues.gene_name);} );
							RedisCacheClient.redisCacheSetExAsync(studyCacheName, JSON.stringify(studyGeneArray));
						}else{
							studyGeneArray = JSON.parse(studyGeneListRes);
							studyGeneArray.forEach(element => finalSet.add(element));
						}
						//studyMap.set(studyName, studyArray);
					}
					var totalCount = finalSet.size;
					//console.log('total gene count: '+finalSet.size);
					//console.timeEnd('gene_cache_study');
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{ total: args.limit }];
				return myJson;
			}
		},
		//@@@PDC-136 pagination
		getPaginatedFiles(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPaginatedFiles").send();
				logger.info("getPaginatedFiles is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("getPaginatedFiles is called from UI with "+ JSON.stringify(args));
			//@@@PDC-136 pagination
			context['arguments'] = args;
			var fileCountQuery = 'SELECT count(*) as total ';
			var fileBaseQuery = 'SELECT study.study_submitter_id as study_submitter_id, study.pdc_study_id as pdc_study_id, file.file_type as file_type, file.downloadable as downloadable, file.file_name as file_name, file.md5sum as md5sum ';
			var fileQuery = 'FROM file AS file, study AS study, study_file AS sf '+
			'WHERE file.file_id = sf.file_id and study.study_id = sf.study_id';
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and study.study_submitter_id = '"+args.study_submitter_id+"'";
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and file.file_type = '"+args.file_type+"'";
			}
			if (typeof args.file_name != 'undefined') {
				fileQuery += " and file.file_name = '"+args.file_name+"'";
			}
			//fileQuery += " and study.project_submitter_id IN ('" + context.value.join("','") + "')";
			
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var fileLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = fileBaseQuery+fileQuery+fileLimitQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(fileCountQuery+fileQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-136 pagination
		getPaginatedCases(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPaginatedCases").send();
				logger.info("getPaginatedCases is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("getPaginatedCases is called from UI with "+ JSON.stringify(args));
			//@@@PDC-136 pagination
			context['arguments'] = args;
			var caseCountQuery = "SELECT count(*) as total FROM `case` c ";
			//"WHERE c.project_submitter_id IN ('" + context.value.join("','") + "')";

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(caseCountQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-2690 api returns gene info without spectral count
		getPaginatedGenes(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPaginatedGenes").send();
				logger.info("getPaginatedGenes is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("getPaginatedGenes is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var geneCountQuery = "SELECT count(*) as total FROM gene g ";
			var geneQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, ncbi_gene_id as NCBI_gene_id, authority, description, organism, locus, proteins, trim(both '\r' from assays) as assays FROM gene g ";
			if (typeof args.gene_name != 'undefined') {
				geneCountQuery += "where gene_name like '%"+args.gene_name+"%'";
				geneQuery += "where gene_name like '%"+args.gene_name+"%'";
			}
			
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			geneQuery += " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = geneQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(geneCountQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-220 UI experiment type `case` count API
		//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
		/**
		* uiExperimentBar gets `case` count per experiment_type for UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		*
		* @return {UIExperimentType}
		*/
		async uiExperimentBar (_, args, context) {
			logger.info("uiExperimentBar is called with "+ JSON.stringify(args));
			//@@@PDC-243 get correct `case` count
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByExperimentType = 'GROUP BY experiment_type';
			let cacheFilterName = {name:''};
			let fileStudyQuery = queryList.file_study;
			let experimentBarQuery = `
					SELECT 
					s.experiment_type,
					COUNT(DISTINCT c.case_submitter_id) AS cases_count
				FROM
					study s,
					\`case\` c,
					sample sam,
					aliquot al,
					aliquot_run_metadata alm,
					demographic dem,
					diagnosis dia,
					project proj,
					program prog
				WHERE
					alm.study_id = s.study_id
						AND al.aliquot_id = alm.aliquot_id
						AND al.sample_id = sam.sample_id
						AND sam.case_id = c.case_id
						AND c.case_id = dem.case_id
						AND c.case_id = dia.case_id
						AND proj.project_id = s.project_id
						AND proj.program_id = prog.program_id
						AND proj.project_submitter_id IS NOT NULL			
			`;

			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);

			experimentBarQuery += studyFilter;
			experimentBarQuery += projProjFilter;
			experimentBarQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			experimentBarQuery += studyResultCondition;
			experimentBarQuery += groupByExperimentType;			

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('ExperimentBar')+cacheFilterName.name);
			if(res === null){
				var result = await  db.getSequelize().query(experimentBarQuery, { model: db.getModelByName('ModelUIExperiment') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePageChartCacheKey('ExperimentBar')+cacheFilterName.name, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},				
		//@@@PDC-265 API for UI analytical_fraction `case` count 
		//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
		/**
		* uiAnalyticalFractionsCount gets `case` count per analytical_fraction for UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		*
		* @return {UIExperimentType}
		*/
		async uiAnalyticalFractionsCount (_, args, context) {
			logger.info("uiAnalyticalFractionsCount is called with "+ JSON.stringify(args));
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByAnalyticalFraction =  " group by s.analytical_fraction";
			let cacheFilterName = {name:''};
			let fileStudyQuery = queryList.file_study;
			let uiAnalyticalFractionQuery = `
					SELECT DISTINCT
					s.analytical_fraction,
					COUNT(DISTINCT c.case_submitter_id) AS cases_count
				FROM
					study s,
					\`case\` c,
					sample sam,
					aliquot al,
					aliquot_run_metadata alm,
					demographic dem,
					diagnosis dia,
					project proj,
					program prog
				WHERE
					alm.study_id = s.study_id
						AND al.aliquot_id = alm.aliquot_id
						AND al.sample_id = sam.sample_id
						AND sam.case_id = c.case_id
						AND c.case_id = dem.case_id
						AND c.case_id = dia.case_id
						AND proj.project_id = s.project_id
						AND proj.program_id = prog.program_id
						AND proj.project_submitter_id IS NOT NULL					
			`;
			
			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);
			
			uiAnalyticalFractionQuery += studyFilter;
			uiAnalyticalFractionQuery += projProjFilter;
			uiAnalyticalFractionQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			uiAnalyticalFractionQuery += studyResultCondition;
			uiAnalyticalFractionQuery += groupByAnalyticalFraction;

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('AnalyticalFraction')+cacheFilterName.name);
			if(res === null){
				var result = await  db.getSequelize().query(uiAnalyticalFractionQuery, { model: db.getModelByName('ModelUIExperiment') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePageChartCacheKey('AnalyticalFraction')+cacheFilterName.name, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},				
		//@@@PDC-220 UI experiment type `case` count API
		//@@@PDC-1428 fix experiment type filter error
		//@@@PDC-1426 Charts not updated when Biospecimen/Clinical/Files filters applied
		/**
		* uiExperimentPie gets `case` count per disease_typefor UI
		*
		* @param {string}   [program_name]
		* @param {string}   [project_name]
		* @param {string}   [submitter_id_name]
		* @param {string}   [disease_type]
		* @param {string}   [primary_site]
		* @param {string}   [analytical_fraction]
		* @param {string}   [experiment_type]
		*
		* @return {UIExperimentType}
		*/
		async uiExperimentPie (_, args, context) {
			logger.info("uiExperimentPie is called with "+ JSON.stringify(args));
			//@@@PDC-243 get correct `case` count
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-1243 fix case count per primary site
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				var uiGeneNameStudyQuery = 'select distinct sc.study_submitter_id from spectral_count sc, study s where sc.study_id = s.study_id and s.is_latest_version = 1 and';
				uiGeneNameStudyQuery += " gene_name IN ('" + geneSub.join("','") + "')";
				var geneStudy = await db.getSequelize().query(uiGeneNameStudyQuery, { raw: true });
				var listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByDiseaseType = " group by disease_type";
			let cacheFilterName = {name:''};
			let fileStudyQuery = queryList.file_study;			
			let experimentPieQuery = `
					SELECT 
					c.disease_type,
					COUNT(DISTINCT dia.diagnosis_id) AS cases_count
				FROM
					study s,
					\`case\` c,
					sample sam,
					aliquot al,
					aliquot_run_metadata alm,
					demographic dem,
					diagnosis dia,
					project proj,
					program prog
				WHERE						
						alm.study_id = s.study_id
						AND al.aliquot_id = alm.aliquot_id
						AND al.sample_id = sam.sample_id
						AND sam.case_id = c.case_id
						AND c.case_id = dem.case_id
						AND c.case_id = dia.case_id
						AND proj.project_id = s.project_id
						AND proj.program_id = prog.program_id
						AND proj.project_submitter_id IS NOT NULL				
			`;

			let studyFilter = applyStudyFilter(args, cacheFilterName);
			let projProjFilter = applyProgProjFilter(args, cacheFilterName);
			let fileFilter = applyFileFilter(args, cacheFilterName);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheFilterName);			

			experimentPieQuery += studyFilter;
			experimentPieQuery += projProjFilter;
			experimentPieQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;
			let studyResult = await db.getSequelize().query(fileStudyQuery, { model: db.getModelByName('ModelFilterStudy') });
			let studyResultCondition = addStudyInQuery(studyResult);
			experimentPieQuery += studyResultCondition;
			experimentPieQuery += groupByDiseaseType;		

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('ExperimentPie')+cacheFilterName.name);
			if(res === null){
				var result = await  db.getSequelize().query(experimentPieQuery, { model: db.getModelByName('ModelUIExperiment') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePageChartCacheKey('ExperimentPie')+cacheFilterName.name, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},					
		//@@@PDC-222 UI tissue site `case` count API		
		/**
		* tissueSitesAvailable gets count of cases per tissue site type
		*
		* @return {Diagnosis}
		*/
		uiTissueSiteCaseCount (_, args, context) {
			logger.info("uiTissueSiteCaseCount is called with "+ JSON.stringify(args));
			//@@@PDC-2968 get case counts of studies of latest version
			var tscQuery = "SELECT d.tissue_or_organ_of_origin, count(distinct d.case_id)" + 
			" as cases_count FROM diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm, study s"+
			" where c.case_id = d.case_id and sam.case_id = c.case_id and a.sample_id = sam.sample_id and arm.aliquot_id = a.aliquot_id and arm.study_id = s.study_id and s.is_latest_version = 1 ";
			//"where d.project_submitter_id in ('" + context.value.join("','") + "')";
			tscQuery += " group by d.tissue_or_organ_of_origin";
			return db.getSequelize().query(tscQuery, { model: db.getModelByName('Diagnosis') });			
		},
		//@@@PDC-1220 add uiPrimarySiteCaseCount
		//@@@PDC-1243 fix case count per primary site
		//@@@PDC-2020 use major primary site
		async uiPrimarySiteCaseCount (_, args, context) {
			logger.info("uiPrimarySiteCaseCount is called with "+ JSON.stringify(args));
			//@@@PDC-2968 get case counts of studies of latest version
			var pscQuery = "select major_primary_site, count(distinct dia.case_id) as cases_count"+
			" from `case` c,  pdc.diagnosis dia, sample sam, aliquot a, aliquot_run_metadata arm, study s"+
            " where c.case_id = dia.case_id and sam.case_id = c.case_id and a.sample_id = sam.sample_id and arm.aliquot_id = a.aliquot_id and arm.study_id = s.study_id and s.is_latest_version = 1"+
			" group by major_primary_site";
			/*var pscQuery = "select primary_site, count(*) as cases_count "+" from (SELECT distinct bin_to_uuid(al.aliquot_id) as aliquot_id, "+
			" bin_to_uuid(sam.sample_id) as sample_id, al.aliquot_submitter_id,"+ 
			" al.status as aliquot_status, sam.sample_submitter_id, "+
			" c.status as case_status, sam.status as sample_status, "+
			" bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, "+
			" proj.name as project_name, sam.sample_type, c.disease_type, "+
			" c.primary_site, prog.name as program_name "+
			"from study s, `case` c, sample sam, aliquot al,"+
			" aliquot_run_metadata alm, project proj, program prog,"+
			" demographic dem, diagnosis dia, study_file sf, file f "+
			" where alm.study_id=s.study_id and "+
			" al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id"+
			" and c.case_id = dem.case_id and c.case_id = dia.case_id and s.study_id = sf.study_id and sf.file_id = f.file_id"+
			" and proj.project_id = s.project_id and proj.program_id = prog.program_id and "+
			" s.project_submitter_id IN ('" + context.value.join("','") + "'))as mytable group by primary_site ";*/
			var cacheFilterName = {name:''};

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('HumanBody'));
			if(res === null){
				var result = await  db.getSequelize().query(pscQuery, { model: db.getModelByName('ModelHumanBody') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePageChartCacheKey('HumanBody'), JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},

		//@@@PDC-311 case-level file counts
		//@@@PDC-650 implement elasticache for API
		/**
		* uiExperimentFileCount gets count of files per experiment type per case
		*
		* @param {string}   case_submitter_id
		*
		* @return {UIFileCount}
		*/
		async uiExperimentFileCount (_, args, context) {
			logger.info("uiExperimentFileCount is called with "+ JSON.stringify(args));
			//@@@PDC-337 add study name to file count table
			//@@@PDC-3188 get file counts for latest version only
			var efcQuery = "SELECT s.acquisition_type, s.experiment_type, count(distinct f.file_id) as files_count, s.submitter_id_name "+
			" FROM study s, `case` c, sample sam, aliquot al, "+
			" aliquot_run_metadata alm, file f, study_file sf "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id  and "+
			" al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			" and s.study_id = sf.study_id and sf.file_id = f.file_id and s.is_latest_version = 1 ";
			var cacheFilterName = {name:''};
			if (typeof args.case_submitter_id != 'undefined') {
				let csIds = args.case_submitter_id.split(';'); 
				efcQuery += " and c.case_submitter_id IN ('" + csIds.join("','") + "')"; 	
				cacheFilterName.name +="case_submitter_id:("+ csIds.join(",") + ");";		
			}
			//@@@PDC-1371 add case_id parameter to case-related APIs 
			if (typeof args.case_id != 'undefined') {
				let uuIds = args.case_id.split(';');
				efcQuery +=" and c.case_id IN (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";	
				cacheFilterName.name +="case_id:("+ uuIds.join(",") + ");";		
			}
			//@@@PDC-810 correct number of studies on the Case summary page
			efcQuery += " group by s.acquisition_type, s.experiment_type, s.submitter_id_name";
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('ExperimentFileCount')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(efcQuery, { model: db.getModelByName('ModelUIFileCount') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('ExperimentFileCount')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-311 case-level file counts
		//@@@PDC-650 implement elasticache for API
		/**
		* uiDataCategoryFileCount gets count of files per data category per case
		*
		* @param {string}   case_submitter_id
		*
		* @return {UIFileCount}
		*/
		async uiDataCategoryFileCount (_, args, context) {
			logger.info("uiDataCategoryFileCount is called with "+ JSON.stringify(args));
			//@@@PDC-759 add data_category to file count group
			//@@@PDC-3188 get file counts for latest version only
			var efcQuery = "SELECT f.file_type, f.data_category, count(distinct f.file_id) as files_count, s.submitter_id_name "+
			" FROM study s, `case` c, sample sam, aliquot al, "+
			" aliquot_run_metadata alm, file f, study_file sf "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id  and "+
			" al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			" and s.study_id = sf.study_id and sf.file_id = f.file_id and s.is_latest_version = 1 ";
			var cacheFilterName = {name:''};
			if (typeof args.case_submitter_id != 'undefined') {
				let csIds = args.case_submitter_id.split(';'); 
				efcQuery += " and c.case_submitter_id IN ('" + csIds.join("','") + "')"; 				
				cacheFilterName.name +="case_submitter_id:("+ csIds.join(",") + ");";		
			}
			//@@@PDC-1371 add case_id parameter to case-related APIs 
			if (typeof args.case_id != 'undefined') {
				let uuIds = args.case_id.split(';');
				efcQuery +=" and c.case_id IN (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";	
				cacheFilterName.name +="case_id:("+ uuIds.join(",") + ");";		
			}			
			efcQuery += " group by f.file_type, f.data_category, s.submitter_id_name ";

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('DataCategoryFileCount')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(efcQuery, { model: db.getModelByName('ModelUIFileCount') });	
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageCaseSummary('DataCategoryFileCount')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-307 spectral counts per study for a gene
		/**
		* uiGeneStudySpectralCount gets spectral counts per study for a gene
		*
		* @param {string}   gene_name
		*
		* @return {UIGeneStudySpectralCount}
		*/  
		uiGeneStudySpectralCount(_, args, context) {
			logger.info("uiGeneStudySpectralCount is called with "+ JSON.stringify(args));
			//@@@PDC-381 get correct counts of plexes and aliquots 
			var gssQuery = "SELECT sc.study_submitter_id, s.submitter_id_name, s.experiment_type, "+
			" sum(sc.spectral_count) as spectral_count, sum(sc.distinct_peptide) as distinct_peptide, "+
			" sum(sc.unshared_peptide) as  unshared_peptide, "+
			" count(distinct sc.study_run_metadata_id) as plexes_count, count(distinct al.aliquot_id) as aliquots_count "+
			" FROM spectral_count sc, aliquot al, aliquot_run_metadata alm, study s "+
			" WHERE sc.study_id = alm.study_id and alm.aliquot_id = al.aliquot_id "+
			" and sc.study_id = s.study_id ";
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')"; 				
			}
			
			gssQuery += " group by sc.study_submitter_id";
			return db.getSequelize().query(gssQuery, { model: db.getModelByName('ModelUIGeneStudySpectralCount') });			
			
		},
		//@@@PDC-333 gene/spectral count API pagination 
		//@@@PDC-391 gene/spectral count query change 
		//@@@PDC-650 implement elasticache for API
		async getPaginatedUIGeneStudySpectralCount(_, args, context) {
			logger.info("getPaginatedUIGeneStudySpectralCount is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			var gssCountQuery = "SELECT count(distinct sc.study_submitter_id) as total ";
			//@@@PDC-381 get correct counts of plexes and aliquots 
			var gssBaseQuery = "SELECT sc.study_submitter_id,"+
			" s.submitter_id_name, s.experiment_type, "+
			" sc.spectral_count, sc.distinct_peptide, "+
			" sc.unshared_peptide ";
			//@@@PDC-3079 get latest version of study
			var gssQuery = " FROM spectral_count sc, study s "+
			" WHERE sc.study_id = s.study_id and sc.plex_name = 'All' and s.is_latest_version = 1 ";
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')"; 	
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery+gssQuery+gssLimitQuery;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('StudySpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(gssCountQuery+gssQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-790 allow filters
		async getPaginatedUIGeneStudySpectralCountFiltered(_, args, context) {
			logger.info("getPaginatedUIGeneStudySpectralCountFiltered is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			var gssCountQuery = "SELECT count(distinct sc.study_submitter_id) as total ";
			//@@@PDC-2873 add pdc_study_id
			var gssBaseQuery = "SELECT distinct sc.study_submitter_id,"+
			" s.submitter_id_name, s.experiment_type, s.pdc_study_id, "+
			" sc.spectral_count, sc.distinct_peptide, "+
			" sc.unshared_peptide ";
			//@@@PDC-3079 get latest version of study
			var gssQuery = " FROM spectral_count sc, aliquot_run_metadata arm, "+
			"`case` c, sample sam, aliquot al, study s, "+
			"demographic dem, diagnosis dia, project proj, "+
			"program prog "+
			" WHERE sc.study_id = s.study_id and arm.study_id = s.study_id and al.aliquot_id = arm.aliquot_id "+
			"and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+ 
			"and proj.project_id = s.project_id and c.case_id = dem.case_id "+ 
			"and c.case_id = dia.case_id and proj.program_id = prog.program_id and sc.plex_name = 'All' and s.is_latest_version = 1 ";
			var cacheFilterName = {name:''};
			gssQuery += filters(args, cacheFilterName);
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')"; 	
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery+gssQuery+gssLimitQuery;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('StudySpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(gssCountQuery+gssQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-307 spectral counts per aliquot for a gene
		/**
		* uiGeneAliquotSpectralCount gets spectral counts per aliquot for a gene
		*
		* @param {string}   gene_name
		*
		* @return {UIGeneStudySpectralCount}
		*/  
		uiGeneAliquotSpectralCount(_, args, context) {
			logger.info("uiGeneAliquotSpectralCount is called with "+ JSON.stringify(args));
			//@@@PDC-415 get correct spectral count per aliquot 
			var gasQuery = "SELECT arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
			" arm.label, s.submitter_id_name, s.experiment_type, "+
			" sc.spectral_count, sc.distinct_peptide, "+
			" sc.unshared_peptide"+
			" FROM spectral_count sc, aliquot_run_metadata arm, study s "+
			" WHERE sc.study_run_metadata_submitter_id=arm.study_run_metadata_submitter_id "+
			" and sc.study_submitter_id=s.study_submitter_id ";
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gasQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')"; 				
			}
			
			gasQuery += " order by sc.dataset_alias, sc.study_run_metadata_submitter_id, s.study_id";
			return db.getSequelize().query(gasQuery, { model: db.getModelByName('ModelUIGeneStudySpectralCount') });			
			
		},
		//@@@PDC-333 gene/spectral count API pagination 
		//@@@PDC-650 implement elasticache for API
		async getPaginatedUIGeneAliquotSpectralCount(_, args, context) {
			logger.info("getPaginatedUIGeneAliquotSpectralCount is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-415 get correct spectral count per aliquot 
			var gssCountQuery = "SELECT count(arm.aliquot_submitter_id) as total ";
			//@@@PDC-564 add gene abundance data
			//@@@PDC-669 gene_abundance table change
			var gssBaseQuery = "SELECT arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
			" arm.label, s.submitter_id_name, s.experiment_type, "+
			" sc.spectral_count, sc.distinct_peptide, sc.unshared_peptide,"+
			" sc.unshared_peptide, ga.precursor_area, ga.log2_ratio, ga.unshared_precursor_area, ga.unshared_log2_ratio ";
			//@@@PDC-3079 get latest version of study
			var gssQuery = " FROM spectral_count sc, aliquot_run_metadata arm, study s, gene_abundance ga "+
			" WHERE sc.study_run_metadata_id=arm.study_run_metadata_id "+
			" and ga.study_run_metadata_id = arm.study_run_metadata_id "+
			" and ga.study_id = s.study_id "+
			" and sc.study_id=s.study_id " +
			" and ga.aliquot_submitter_id = arm.aliquot_submitter_id and s.is_latest_version = 1 ";
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')"+
				" and ga.gene_name IN ('" + gene_names.join("','") + "')"; 	
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";			
			}

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery+gssQuery+gssLimitQuery;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('AliquotSpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(gssCountQuery+gssQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-744 get ptm log2_ratio
		async getPaginatedUIGeneAliquotSpectralCountFiltered(_, args, context) {
			logger.info("getPaginatedUIGeneAliquotSpectralCountFiltered is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3171 new ptm abundance tables
			const ptmTableName = "ptm_abundance_"+ args.gene_name.substr(0, 1);
			var generalOpenCountQuery = "SELECT count(*) as total from (";
			var generalCloseCountQuery = ") x";
			//@@@PDC-2873 add pdc_study_id
			var generalSelectQuery = "SELECT distinct arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
			" arm.label, s.submitter_id_name, s.experiment_type, s.pdc_study_id, "+
			" sc.spectral_count, sc.distinct_peptide,"+
			" sc.unshared_peptide, ";
			var gaSelectQuery = "ga.precursor_area, ga.log2_ratio, ga.unshared_precursor_area, ga.unshared_log2_ratio ";
			//@@@PDC-769 access ptm_abundance
			var paSelectQuery = "'' as precursor_area, pa.log2_ratio, '' as unshared_precursor_area, '' as unshared_log2_ratio ";
			//var paSelectQuery = "'' as precursor_area, '' as log2_ratio, '' as unshared_precursor_area, '' as unshared_log2_ratio ";
			var generalFromQuery = " FROM spectral_count sc, aliquot_run_metadata arm, "+
			"study s, `case` c, sample sam, aliquot al, "+
			"demographic dem, diagnosis dia, project proj, "+
			"program prog";
			var gaFromQuery = ", gene_abundance ga ";
			//@@@PDC-769 access ptm_abundance
			//var paFromQuery = ", ptm_abundance pa ";
			var paFromQuery = ", "+ptmTableName+" pa ";
			//var paFromQuery = '';
			//@@@PDC-3079 get latest version of study
			var generalWhereQuery = " WHERE s.is_latest_version = 1 "+ 
			" and sc.study_run_metadata_id=arm.study_run_metadata_id "+
			" and sc.study_id=s.study_id " +
			" and arm.study_id = s.study_id and al.aliquot_id = arm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+ 
			" and proj.project_id = s.project_id and c.case_id = dem.case_id "+ 
			" and c.case_id = dia.case_id and proj.program_id = prog.program_id ";
			var gaWhereQuery = " and ga.study_run_metadata_id = arm.study_run_metadata_id "+
			" and ga.study_id = s.study_id "+
			" and ga.aliquot_submitter_id = arm.aliquot_submitter_id "+
			" and s.analytical_fraction = 'Proteome' ";
			//@@@PDC-769 access ptm_abundance
			var paWhereQuery = " and pa.study_run_metadata_id = arm.study_run_metadata_id "+
			" and pa.study_id = s.study_id "+
			" and pa.aliquot_submitter_id = arm.aliquot_submitter_id "+
			" and s.analytical_fraction != 'Proteome' ";
			//var paWhereQuery = " and s.analytical_fraction != 'Proteome' ";
			var cacheFilterName = {name:''};
			var filterQuery = filters(args, cacheFilterName);
			var generalGeneQuery = '', gaGeneQuery = '', paGeneQuery = '';
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				generalGeneQuery = " and sc.gene_name IN ('" + gene_names.join("','") + "')";
				gaGeneQuery = " and ga.gene_name IN ('" + gene_names.join("','") + "')"; 	
				//@@@PDC-769 access ptm_abundance
				paGeneQuery = " and pa.gene_name IN ('" + gene_names.join("','") + "')"; 	
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";			
			}
			var unionQuery = generalSelectQuery+gaSelectQuery+generalFromQuery+
			gaFromQuery+generalWhereQuery+gaWhereQuery+filterQuery+generalGeneQuery+
			gaGeneQuery+" union all "+generalSelectQuery+paSelectQuery+generalFromQuery+
			paFromQuery+generalWhereQuery+paWhereQuery+filterQuery+generalGeneQuery+
			paGeneQuery

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var generalLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = unionQuery+generalLimitQuery;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('AliquotSpectralCountFiltered')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCountFiltered')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(generalOpenCountQuery+unionQuery+generalCloseCountQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCountFiltered')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-485 spectral count per study/aliquot API
		paginatedSpectralCountPerStudyAliquot(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedSpectralCountPerStudyAliquot").send();
				logger.info("paginatedSpectralCountPerStudyAliquot is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("paginatedSpectralCountPerStudyAliquot is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var gssCountQuery = "SELECT count(sc.gene_name) as total ";
			var gssBaseQuery = "SELECT s.pdc_study_id, sc.study_submitter_id, sc.plex_name as aliquot_id, sc.gene_name, "+
			" sc.dataset_alias as plex, sc.spectral_count, sc.distinct_peptide, "+
			" sc.unshared_peptide";
			var gssQuery = " FROM spectral_count sc, study s WHERE sc.study_id = s.study_id ";
			//"sc.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_submitter_id != 'undefined') {
				let study_submitter_ids = args.study_submitter_id.split(';'); 
				gssQuery += " and sc.study_submitter_id IN ('" + study_submitter_ids.join("','") + "')";			
			}
			if (typeof args.pdc_study_id != 'undefined') {
				let pdc_study_ids = args.pdc_study_id.split(';'); 
				gssQuery += " and s.pdc_study_id IN ('" + pdc_study_ids.join("','") + "')";			
			}
			if (typeof args.plex_name != 'undefined') {
				let plex_names = args.plex_name.split(';'); 
				gssQuery += " and sc.plex_name IN ('" + plex_names.join("','") + "')";			
			}
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';'); 
				gssQuery += " and sc.gene_name IN ('" + gene_names.join("','") + "')";			
			}
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery+gssQuery+gssLimitQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(gssCountQuery+gssQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-287 APIs for name search
		/**
		* caseSearch gets search records from case table
		*
		* @param {string}   name
		*
		* @return Paginated
		*/  
		caseSearch(_, args, context) {
			logger.info("caseSearch is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(c.case_submitter_id) as total ";
			var searchBaseQuery = "SELECT c.case_submitter_id as name, bin_to_uuid(c.case_id) as case_id, 'case' as record_type ";
			var searchQuery = " FROM `case` c WHERE c.case_submitter_id like '%"+nameToSearch+"%' order by c.case_submitter_id";
			//" AND c.project_submitter_id IN ('" + context.value.join("','") + "')";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-387 gene search by description
		/**
		* geneSearch search gene table using gene_name and description 
		*
		* @param {string}   name
		*
		* @return {SearchRecord}
		*/  
		geneSearch(_, args, context) {
			logger.info("geneSearch is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(g.gene_name) as total ";
			//@@@PDC-398 Add description to the APIs for search
			var searchBaseQuery = "SELECT g.gene_name as name, g.description, 'gene' as record_type ";
			//@@@PDC-682 make search case insensitive for utf8 char set
			var searchQuery = " FROM gene g WHERE g.gene_name COLLATE UTF8_GENERAL_CI like '%"+nameToSearch+"%' OR g.description like '%"+nameToSearch+"%'";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-380 gene search by proteins
		/**
		* proteinSearch search gene table using protein
		*
		* @param {string}   name
		*
		* @return {SearchRecord}
		*/  
		proteinSearch(_, args, context) {
			logger.info("proteinSearch is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(g.gene_name) as total ";
			//@@@PDC-398 Add description to the APIs for search
			//@@@PDC-468 Add proteins to protein search
			var searchBaseQuery = "SELECT g.gene_name as name, g.description, g.proteins, 'protein' as record_type ";
			var searchQuery = " FROM gene g WHERE g.proteins like '%"+nameToSearch+"%'";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		/**
		* studySearch gets search records from study table
		*
		* @param {string}   name
		*
		* @return {SearchStudyRecord}
		*/  
		studySearch(_, args, context) {
			logger.info("studySearch is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(s.study_shortname) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			var searchBaseQuery = "SELECT s.study_shortname as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			var searchQuery = " FROM study s WHERE s.is_latest_version = 1 and s.study_shortname like '%"+nameToSearch+"%' order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		studySearchByPDCStudyId(_, args, context) {
			logger.info("studySearchByPDCStudyId is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var idToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				idToSearch = args.pdc_study_id.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(s.study_shortname) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			var searchBaseQuery = "SELECT s.study_shortname as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			var searchQuery = " FROM study s WHERE s.is_latest_version = 1 and s.pdc_study_id like '%"+idToSearch+"%' order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1959 search by external id
		studySearchByExternalId(_, args, context) {
			logger.info("studySearchByExternalId is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var idToSearch = 'xxxxxx';			
			if (typeof args.reference_entity_alias != 'undefined' && args.reference_entity_alias.length > 0) {
				idToSearch = args.reference_entity_alias.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(s.study_shortname) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			var searchBaseQuery = "SELECT s.study_shortname as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			var searchQuery = " FROM study s, reference r WHERE s.is_latest_version = 1 and s.study_id = r.entity_id and r.reference_entity_alias like '%"+idToSearch+"%' order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
		aliquotSearch(_, args, context) {
			logger.info("aliquotSearch is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
			}
			var searchCountQuery = "SELECT count(a.aliquot_submitter_id) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			var searchBaseQuery = "SELECT bin_to_uuid(a.aliquot_id) as aliquot_id, a.aliquot_submitter_id";
			var searchQuery = " FROM aliquot a WHERE a.aliquot_submitter_id like '%"+nameToSearch+"%' order by a.aliquot_submitter_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(searchCountQuery+searchQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-332 get file metadata--add more fields
		//@@@PDC-1257 replace fraction with fraction_number
		/**
		* fileMetadata gets file metadata
		*
		* @param {string}   file_name
		*
		* @return {FileMetadata}
		*/  
		fileMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/fileMetadata").send();
				logger.info("fileMetadata is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("fileMetadata is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2642 add file_id	
			var gasQuery = "select distinct bin_to_uuid(f.file_id) as file_id, f.file_name, f.file_location,"+
			" f.md5sum, f.file_size, f.original_file_name as file_submitter_id, f.data_category, f.file_type ,f.file_format, "+ 
			" srm.analyte, p.instrument_model as instrument, srm.folder_name as plex_or_dataset_name,"+
			" f.fraction_number, srm.experiment_type,"+ 
			" srm.study_run_metadata_submitter_id,"+
			" bin_to_uuid(srm.study_run_metadata_id) as study_run_metadata_id"+ 
			" from file f"+ 
		    " left join study_file sf on f.file_id = sf.file_id"+ 
			" left join study_run_metadata srm on srm.study_run_metadata_id = sf.study_run_metadata_id"+
			" left join study s on s.study_id = srm.study_id"+
			" left join protocol p on s.study_id = p.study_id"+
			" where f.file_id is not null ";
			//@@@PDC-884 fileMetadata API search by UUID 			
			if (typeof args.file_id != 'undefined') {
				gasQuery += " and f.file_id = uuid_to_bin('" + args.file_id + "')"; 				
			}
			//@@@PDC-898 new public APIs--fileMetadata
			if (typeof args.file_submitter_id != 'undefined') {
				gasQuery += " and f.file_submitter_id = uuid_to_bin('" + args.file_submitter_id + "')"; 				
			}
			if (typeof args.data_catefory != 'undefined') {
				gasQuery += " and f.data_catefory = '" + args.data_catefory + "'"; 				
			}
			if (typeof args.file_type != 'undefined') {
				gasQuery += " and f.file_type = '" + args.file_type + "'"; 				
			}
			if (typeof args.file_format != 'undefined') {
				gasQuery += " and f.file_format = '" + args.file_format + "'"; 				
			}
			if (typeof args.file_name != 'undefined') {
				let file_names = args.file_name.split(';'); 
				gasQuery += " and f.file_name IN ('" + file_names.join("','") + "')"; 				
			}
			//@@@PDC-3529 check for current version
			gasQuery += " and s.is_latest_version = 1 ";
			var myOffset = 0;
			var myLimit = 500;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var gasLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(gasQuery+gasLimitQuery, { model: db.getModelByName('ModelFileMetadata') });			
			
		},
		//@@@PDC-503 quantitiveDataCPTAC2 API
		quantitiveDataCPTAC2(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantitiveDataCPTAC2").send();
				logger.info("quantitiveDataCPTAC2 is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("quantitiveDataCPTAC2 is called from UI with "+ JSON.stringify(args));
			//@@@PDC-669 gene_abundance table change
			var quantQuery = "select bin_to_uuid(ga.gene_abundance_id) as gene_abundance_id, "+
			"bin_to_uuid(ga.gene_id) as gene_id, ga.gene_name, "+
			"bin_to_uuid(ga.study_id) as study_id, ga.study_submitter_id, s.pdc_study_id, "+
			"bin_to_uuid(ga.study_run_metadata_id) as study_run_metadata_id, "+ 
			"ga.study_run_metadata_submitter_id, s.experiment_type, "+
			"s.analytical_fraction, bin_to_uuid(ga.aliquot_id) as aliquot_id, "+
			"ga.aliquot_submitter_id, bin_to_uuid(ga.aliquot_run_metadata_id) as aliquot_run_metadata_id, "+
			"bin_to_uuid(ga.project_id) as project_id, "+
			"ga.project_submitter_id, ga.aliquot_alias, ga.log2_ratio, "+
			"ga.unshared_log2_ratio, ga.unshared_precursor_area, ga.precursor_area, "+
			"ga.cud_label "+
			"from study s, gene_abundance ga "+
			"where s.study_id = ga.study_id ";
			//"and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_submitter_id != 'undefined') {
				let study_submitter_ids = args.study_submitter_id.split(';'); 
				quantQuery += " and s.study_submitter_id IN ('" + study_submitter_ids.join("','") + "')"; 				
			}
			if (typeof args.pdc_study_id != 'undefined') {
				let studies = args.pdc_study_id.split(';'); 
				quantQuery += " and s.pdc_study_id IN ('" + studies.join("','") + "')"; 				
			}
			if (typeof args.experiment_type != 'undefined') {
				let experiment_types = args.experiment_type.split(';'); 
				quantQuery += " and s.experiment_type IN ('" + experiment_types.join("','") + "')"; 				
			}
			var myOffset = 0;
			var myLimit = 500;
			quantQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(quantQuery, { model: db.getModelByName('ModelQuantitativeData') });						
		},
		//@@@PDC-474 programs-projects-studies API
		programsProjectsStudies(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/programsProjectsStudies").send();
				logger.info("programsProjectsStudies is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("programsProjectsStudies is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-652 new protocol structure
			var comboQuery = "SELECT distinct bin_to_uuid(prog.program_id) as program_id, prog.program_submitter_id, prog.name, prog.sponsor, "+
			" prog.start_date, prog.end_date, prog.program_manager "+
			" FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
			" aliquot al, project proj, program prog, protocol ptc "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			" and proj.project_id = s.project_id and ptc.study_id = s.study_id "+
			" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			comboQuery += filters(args);
			return db.getSequelize().query(comboQuery, { model: db.getModelByName('Program') });			
		},
		//@@@PDC-472 casesSamplesAliquots API
		//@@@PDC-2335 get ext id from reference
		paginatedCasesSamplesAliquots (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCasesSamplesAliquots").send();
				logger.info("paginatedCasesSamplesAliquots is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("paginatedCasesSamplesAliquots is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-2657 reverse 2335
			var uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, "+
			"c.tissue_source_site_code, c.days_to_lost_to_followup, c.disease_type, "+ 
			"c.index_date, c.lost_to_followup, c.primary_site ";
			var uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
			" aliquot al, project proj, program prog "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			" and proj.project_id = s.project_id ";
			//" and proj.program_id = prog.program_id and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			uiCaseQuery += filters(args);

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery+uiCaseQuery+uiCaseLimitQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(uiCaseCountQuery+uiCaseQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-475 caseDiagnosesPerStudy API
		paginatedCaseDiagnosesPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseDiagnosesPerStudy").send();
				logger.info("paginatedCaseDiagnosesPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("paginatedCaseDiagnosesPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			var uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site ";
			var uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
			" aliquot al "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			uiCaseQuery += filters(args);

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery+uiCaseQuery+uiCaseLimitQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(uiCaseCountQuery+uiCaseQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-473 caseDemographicsPerStudy API
		paginatedCaseDemographicsPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseDemographicsPerStudy").send();
				logger.info("paginatedCaseDemographicsPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("paginatedCaseDemographicsPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			var uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site ";
			var uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
			" aliquot al "+
			" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			uiCaseQuery += filters(args);

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			var uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery+uiCaseQuery+uiCaseLimitQuery;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(uiCaseCountQuery+uiCaseQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-486 data matrix API
		//@@@PDC-562 quant data matrix API
		paginatedDataMatrix (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedDataMatrix").send();
				logger.info("paginatedDataMatrix is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("paginatedDataMatrix is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			var matrixCountQuery = '';
			switch (args.data_type) {
				case 'spectral_count':
				case 'distinct_peptide':
				case 'unshared_peptide':
					matrixCountQuery = "select count(distinct sc.plex_name) as total" +
					" FROM spectral_count sc"+
					" WHERE sc.study_submitter_id = '"+ args.study_submitter_id + "'";			
					//"' and sc.project_submitter_id IN ('" + context.value.join("','") + "')";
					break;
				//@@@PDC-669 support all areas/ratios in gene_abundance
				case 'precursor_area': 
				case 'log2_ratio': 
				case 'unshared_precursor_area': 
				case 'unshared_log2_ratio': 
				//@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
					matrixCountQuery = "select count(distinct ga.aliquot_submitter_id, ga.aliquot_alias) as total" +
					" FROM gene_abundance ga"+
					" WHERE ga.study_submitter_id = '"+ 
					args.study_submitter_id + "'";			
					//"' and ga.project_submitter_id IN ('" + context.value.join("','") + "')";
					break;
				/*case 'log_ratio': 
					matrixCountQuery = "select count(distinct pq.aliquot_submitter_id) as total" +
					" FROM phosphosite_quant pq"+
					" WHERE pq.study_submitter_id = '"+ args.study_submitter_id + "'";			
					"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')";
					break;*/
			}

			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(matrixCountQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-3446 API for new publication screen
		getUIPublicationFilters(_, args, context) {
			logger.info("getUIPublicationFilters is called from UI with "+ JSON.stringify(args));
			return "3";
		},
		async getPaginatedUIPublication (_, args, context) {
			logger.info("getPaginatedUIPublication is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			
			var cacheFilterName = {name:''};
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			
			var uiPubCountQuery = "select count(distinct pub.publication_id) as total ";
			var uiPubBaseQuery = "SELECT distinct bin_to_uuid(pub.publication_id) as publication_id, pub.pubmed_id, pub.doi, pub.author, pub.title, pub.journal, pub.journal_url, pub.year, pub.abstract, pub.citation ";
			var uiPubQuery = "FROM publication pub, study s, `case` c, sample sam, aliquot al, "+
			"aliquot_run_metadata alm, study_publication sp, project proj, program prog "+
			"WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			"and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
			"and sp.study_id = s.study_id and pub.publication_id = sp.publication_id "+ 
			"and s.project_id = proj.project_id and proj.program_id = prog.program_id "+
			"and s.is_latest_version = 1 ";
			if (typeof args.disease_type != 'undefined' && args.disease_type.length > 0) {
				let dts = args.disease_type.split(";");
				uiPubQuery += " and c.disease_type IN ('" + dts.join("','") + "')";
				cacheFilterName['dataFilterName'] += 'disease_type:'+args.disease_type+';';
			}
			if (typeof args.program != 'undefined' && args.program.length > 0) {
				let pgn = args.program.split(";");
				uiPubQuery += " and prog.name IN ('" + pgn.join("','") + "')";
				cacheFilterName['dataFilterName'] += 'program:'+args.program+';';
			}
			if (typeof args.year != 'undefined' && args.year.length > 0) {
				let yrs = args.year.split(";");
				uiPubQuery += " and pub.year IN ('" + yrs.join("','") + "')";
				cacheFilterName['dataFilterName'] += 'year:'+args.year+';';
			}
			uiPubQuery += " order by pub.year desc";
			
			
			

			var myOffset = 0;
			var myLimit = 500;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var uiPubLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiPubBaseQuery+uiPubQuery+uiPubLimitQuery;
			context['dataCacheName'] = 'Publication:'+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync('PublicationTotal:'+cacheFilterName['dataFilterName']);
				if(res === null){
					var rawData = await db.getSequelize().query(uiPubCountQuery+uiPubQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync('PublicationTotal:'+cacheFilterName['dataFilterName'], totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-681 ui ptm data API
		async getPaginatedUIPtm (_, args, context) {
			logger.info("getPaginatedUIPtm is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3171 new ptm abundance tables
			var ptmTableName = "ptm_abundance";
			if (typeof args.gene_name != 'undefined') {
				ptmTableName = "ptm_abundance_"+ args.gene_name.substr(0, 1);
			}				
			var uiPtmCountQuery = "select count(distinct pq.ptm_type, pq.site, pq.peptide) as total ";
			var uiPtmBaseQuery = "SELECT distinct pq.ptm_type, pq.site, pq.peptide ";
			//var uiPtmQuery = "FROM ptm_abundance pq"+
			var uiPtmQuery = "FROM "+ptmTableName+" pq"+
			" WHERE pq.gene_name = '"+ args.gene_name +"' ";
			//"and pq.project_submitter_id IN ('" + context.value.join("','") + "')";

			var cacheFilterName = {name:''};
			cacheFilterName.name +="gene_name: ("+args.gene_name+");";

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offet:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var uiPtmLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiPtmBaseQuery+uiPtmQuery+uiPtmLimitQuery;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name);
				if(res === null){
					var rawData = await db.getSequelize().query(uiPtmCountQuery+uiPtmQuery, { model: db.getModelByName('ModelPagination') });
					var totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				var myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-3171 new ptm abundance tables
		/*async getBatchedUIPtm (_, args, context) {
			if (args.limit > queryList.abundance_suffix.length)
				args.limit = queryList.abundance_suffix.length
			context['arguments'] = args;
			var myJson = [{total: queryList.abundance_suffix.length}];
			return myJson;
		},	*/	
		async getUIPtmAlphabetically (_, args, context) {
			var uiPtmBaseQuery = "SELECT distinct pq.gene_name, pq.ptm_type, pq.site, pq.peptide FROM ";
			var cacheFilterName = {name:'batchPtm'};

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			cacheFilterName['dataFilterName'] += ':gene:'+args.gene+';';
			console.log("cacheName: "+cacheFilterName.dataFilterName);
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.dataFilterName);
			if(res === null){
				uiPtmBaseQuery += "ptm_abundance_"+args.gene.toUpperCase()+ " pq";
				var result =await db.getSequelize().query(uiPtmBaseQuery, { model: db.getModelByName('ModelUIPtm') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},		
		//@@@PDC-678 ptm data matrix API
		async paginatedPtmDataMatrix (_, args, context) {
			logger.info("paginatedPtmDataMatrix is called with "+ JSON.stringify(args));
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedPtmDataMatrix").send();
				logger.info("visitor pageview sent for paginatedPtmDataMatrix");
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			context['arguments'] = args;
			var checkPtmQuery = "select study_submitter_id from study s"+
			" where s.study_submitter_id = '"+ args.study_submitter_id +
			"' and s.analytical_fraction IN ('Phosphoproteome', 'Glycoproteome')";
			var ptmStudy = await db.getSequelize().query(checkPtmQuery, { model: db.getModelByName('ModelStudy') });
			if (typeof ptmStudy == 'undefined' || ptmStudy == 0 ) {
				logger.info("PTM Not Found: "+JSON.stringify(ptmStudy) );
				context['error'] = "This is not a post translational modification study";
				var noRecord = [{total: 0}];
				return noRecord;					
			}
			var matrixCountQuery = "select count(distinct pq.aliquot_submitter_id) as total" +
			" FROM ptm_abundance pq"+
			" WHERE pq.study_submitter_id = '"+ args.study_submitter_id + "'"; 
			//+"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')";			
								
			var myOffset = 0;
			var myLimit = 100;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(matrixCountQuery, { model: db.getModelByName('ModelPagination') });
			}
			else {
				var myJson = [{total: 0}];
				return myJson;
			}
		},
		//@@@PDC-898 new public APIs--study
		async study (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/study").send();
				logger.info("study is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("study is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-2615 add embargo_date
			var studyBaseQuery = "SELECT bin_to_uuid(s.study_id) as study_id,"+
			" s.study_submitter_id, s.submitter_id_name as study_name, s.pdc_study_id,"+
			" s.study_shortname, s.embargo_date, bin_to_uuid(prog.program_id) as program_id,"+
			" bin_to_uuid(proj.project_id) as project_id,"+
			" prog.name as program_name, proj.name as project_name,"+
			" c.disease_type, c.primary_site, s.analytical_fraction,"+
			" s.experiment_type FROM study s, `case` c, sample sam,"+
			" aliquot al, aliquot_run_metadata alm, project proj,"+
			" program prog WHERE alm.study_id = s.study_id and "+
			" al.aliquot_id = alm.aliquot_id  and al.sample_id=sam.sample_id"+
			" and sam.case_id=c.case_id and proj.project_id = s.project_id"+
			" and proj.program_id = prog.program_id and s.study_id in "+
			" (select s.study_id ";
			var studyCaseAliquotQuery = "SELECT count(distinct c.case_id) as cases_count, "+ 
			" count(distinct al.aliquot_id) as aliquots_count ";
			
			var studyHeadWrapQuery = 
			`select study_id, study_submitter_id, pdc_study_id, study_name, study_shortname, embargo_date, program_id, program_name, project_id, project_name, GROUP_CONCAT(distinct disease_type SEPARATOR ';') as disease_type,
				GROUP_CONCAT(distinct primary_site SEPARATOR ';') as primary_site, analytical_fraction, experiment_type FROM	(`;

			var studyTailWrapQuery = 
			`) AS studytable GROUP BY study_name`;

			var studyQuery = " FROM study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm,"+
			" demographic dem, diagnosis dia, study_file sf, file f,"+
			" project proj, program prog WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
			" and al.sample_id=sam.sample_id and sam.case_id=c.case_id and proj.project_id = s.project_id"+
			" and c.case_id = dem.case_id and c.case_id = dia.case_id and"+
			" s.study_id = sf.study_id and sf.file_id = f.file_id"+
			" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				let studySub = args.study_id.split(";");
				studyQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let studySub = args.study_submitter_id.split(";");
				studyQuery += " and s.study_submitter_id IN ('" + studySub.join("','") + "')";
			}			
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				studyQuery += " and s.pdc_study_id IN ('" + studySub.join("','") + "')";
			}			
			
			var studyGroupQuery = ") group by s.submitter_id_name, c.disease_type";
			
			var studies = await db.getSequelize().query(studyHeadWrapQuery+studyBaseQuery+studyQuery+studyGroupQuery+studyTailWrapQuery, { model: db.getModelByName('ModelStudyPublic') });

			var caCounts = null, caCountQuery = null;
			for (var i = 0; i < studies.length; i++) {
				caCountQuery = studyCaseAliquotQuery+studyQuery+" and s.submitter_id_name = '"+
				studies[i].study_name + "'";
				caCounts = await db.getSequelize().query(caCountQuery, { model: db.getModelByName('ModelUICount') });
				studies[i].cases_count = caCounts[0].cases_count;
				studies[i].aliquots_count = caCounts[0].aliquots_count;
			}
			return studies;
		},
		//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id 
		//@@@PDC-1467 add case_submitter_id
		sample(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/sample").send();
				logger.info("sample is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("sample is called from UI with "+ JSON.stringify(args));
			var sampleQuery = "select bin_to_uuid(sample_id) as sample_id, status, sample_is_ref, "+
			"sample_submitter_id, sample_type, sample_type_id, gdc_sample_id, gdc_project_id, "+
			"biospecimen_anatomic_site, composition, current_weight, days_to_collection, "+
			"days_to_sample_procurement, diagnosis_pathologically_confirmed, freezing_method, "+
			"initial_weight, intermediate_dimension, is_ffpe, longest_dimension, "+
			"method_of_sample_procurement, oct_embedded, pathology_report_uuid, preservation_method, "+
			"time_between_clamping_and_freezing, time_between_excision_and_freezing, "+
			"shortest_dimension, tissue_type, tumor_code, tumor_code_id, tumor_descriptor, "+
			"case_submitter_id from sample ";
			if (typeof args.sample_id != 'undefined'){
				let uuIds = args.sample_id.split(';');
				sampleQuery += "where sample_id in (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";	
			}
			else if (typeof args.sample_submitter_id != 'undefined'){
				let subIds = args.sample_submitter_id.split(';');
				sampleQuery += "where sample_submitter_id in ('" + subIds.join("','") + "')";	
			}
			sampleQuery += " order by case_submitter_id";
			return db.getSequelize().query(sampleQuery, { model: db.getModelByName('Sample') });
			
		},
		//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id 
		//@@@PDC-1467 add case_submitter_id
		aliquot(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/aliquot").send();
				logger.info("aliquot is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("aliquot is called from UI with "+ JSON.stringify(args));
			var fileName = '86.21%_RC229872+13.80%_RA226166A.txt'
			console.log("Encoded: "+encodeURIComponent(fileName));
			var aliquotQuery = "select bin_to_uuid(aliquot_id) as aliquot_id, aliquot_submitter_id, "+
			"analyte_type, aliquot_quantity, aliquot_volume, amount, concentration, al.status, "+
			"aliquot_is_ref, sam.case_submitter_id from aliquot al, sample sam "+
			"where al.sample_id = sam.sample_id ";
			if (typeof args.aliquot_id != 'undefined'){
				let uuIds = args.aliquot_id.split(';');
				aliquotQuery += "and aliquot_id in (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";	
			}
			else if (typeof args.aliquot_submitter_id != 'undefined'){
				let subIds = args.aliquot_submitter_id.split(';');
				aliquotQuery += "and aliquot_submitter_id in ('" + subIds.join("','") + "')";	
			}
			aliquotQuery += " order by sam.case_submitter_id";
			return db.getSequelize().query(aliquotQuery, { model: db.getModelByName('Aliquot') });
		},
		//@@@PDC-898 new public APIs--protocolPerStudy
		protocolPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/protocolPerStudy").send();
				logger.info("protocolPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("protocolPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1154 column name correction: fractions_analyzed_count
			//@@@PDC-1251 remove duplicates
			var protoQuery = "SELECT distinct bin_to_uuid(prot.protocol_id) as protocol_id, "+
			"prot.protocol_submitter_id, prot.experiment_type, protocol_name, "+
			"bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.pdc_study_id, "+
			"bin_to_uuid(prog.program_id) as program_id, prog.program_submitter_id, proj.project_submitter_id, "+
			"protocol_date, document_name, quantitation_strategy, "+
			"label_free_quantitation, labeled_quantitation,  isobaric_labeling_reagent, "+ 
			"reporter_ion_ms_level, starting_amount, starting_amount_uom, "+ "digestion_reagent, alkylation_reagent, enrichment_strategy, enrichment, "+ 
			"chromatography_dimensions_count, 1d_chromatography_type as one_d_chromatography_type, "+ 
			"2d_chromatography_type as two_d_chromatography_type, "+ 
			"fractions_analyzed_count, column_type, amount_on_column, "+
			"amount_on_column_uom, column_length, column_length_uom, "+
			"column_inner_diameter, column_inner_diameter_uom, particle_size, "+
			"particle_size_uom, particle_type, gradient_length, "+
			"gradient_length_uom, instrument_make, instrument_model, "+
			"dissociation_type, ms1_resolution, ms2_resolution, "+
			"dda_topn, normalized_collision_energy, acquistion_type, "+ 
			"dia_multiplexing, dia_ims, auxiliary_data, prot.cud_label "+
			" from study s, program prog, project proj, protocol prot "+
			" where prot.study_id = s.study_id and s.project_id = proj.project_id "+ 
			" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				let studySub = args.study_id.split(";");
				protoQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let study = args.study_submitter_id.split(";");
				protoQuery += " and s.study_submitter_id IN ('" + study.join("','") + "')";
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let study = args.pdc_study_id.split(";");
				protoQuery += " and s.pdc_study_id IN ('" + study.join("','") + "')";
			}
			return db.getSequelize().query(protoQuery, { model: db.getModelByName('ModelProtocol') });
		},
		//@@@PDC-898 new public APIs--clinicalPerStudy
		//@@@PDC-1599 add all demographic and diagnosis data
		//@@@PDC-2417 Remove unused fields from Diagnosis
		//@@@PDC-2335 get ext id from reference
		//@@@PDC-2657 reverse 2335
		//@@@PDC-3428 add tumor_largest_dimension_diameter
		clinicalPerStudy(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/clinicalPerStudy").send();
				logger.info("clinicalPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("clinicalPerStudy is called from UI with "+ JSON.stringify(args));
			var clinicalQuery = "select distinct bin_to_uuid(c.case_id) as case_id, "+
			"c.case_submitter_id, c.status, c.disease_type, "+
			"c.primary_site, bin_to_uuid(dem.demographic_id) as demographic_id, "+
			"dem.demographic_submitter_id, dem.ethnicity, dem.gender, dem.race, "+
			"dem.cause_of_death, dem.days_to_birth, dem.days_to_death, dem.vital_status, "+
			"dem.year_of_birth, dem.year_of_death, "+
			"bin_to_uuid(dia.diagnosis_id) as diagnosis_id, dia.diagnosis_submitter_id, "+
			"dia.morphology, dia.primary_diagnosis, dia.site_of_resection_or_biopsy, "+
			"dia.tissue_or_organ_of_origin, dia.tumor_grade, dia.tumor_stage, dia.age_at_diagnosis, "+
			"dia.classification_of_tumor, dia.days_to_last_follow_up, "+
			"dia.days_to_last_known_disease_status, dia.days_to_recurrence,  "+
			"dia.last_known_disease_status, dia.progression_or_recurrence, "+
			"dia.tumor_cell_content, dia.tumor_largest_dimension_diameter, "+
			"dia.prior_malignancy, dia.ajcc_clinical_m, "+
			"dia.ajcc_clinical_n, dia.ajcc_clinical_stage, dia. ajcc_clinical_t, "+
			"dia.ajcc_pathologic_m, dia.ajcc_pathologic_n, dia.ajcc_pathologic_stage, "+
			"dia.ajcc_pathologic_t, dia.ann_arbor_b_symptoms, dia.ann_arbor_clinical_stage, "+
			"dia.ann_arbor_extranodal_involvement, dia.ann_arbor_pathologic_stage, "+
			"dia.best_overall_response, dia.burkitt_lymphoma_clinical_variant, "+
			"dia.circumferential_resection_margin, dia.colon_polyps_history, "+
			"dia.days_to_best_overall_response, dia.days_to_diagnosis, dia.days_to_hiv_diagnosis, "+
			"dia.days_to_new_event, dia.figo_stage, dia.hiv_positive, dia.hpv_positive_type, "+
			"dia.hpv_status, dia.iss_stage, dia.laterality, dia.ldh_level_at_diagnosis, "+
			"dia.ldh_normal_range_upper, dia.lymph_nodes_positive, dia.lymphatic_invasion_present, "+
			"dia.method_of_diagnosis, dia.new_event_anatomic_site, dia.new_event_type, "+
			"dia.overall_survival, dia.perineural_invasion_present, dia.prior_treatment, "+
			"dia.progression_free_survival, dia.progression_free_survival_event, "+
			"dia.residual_disease, dia.vascular_invasion_present, dia.year_of_diagnosis "+
			"FROM study s, `case` c, demographic dem, diagnosis dia, "+
			"sample sam, aliquot al, aliquot_run_metadata alm "+
			"where alm.study_id=s.study_id and al.aliquot_id= alm.aliquot_id "+
			"and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
			"c.case_id = dem.case_id and c.case_id=dia.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				let studySub = args.study_id.split(";");
				clinicalQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let studySub = args.study_submitter_id.split(";");
				clinicalQuery += " and s.study_submitter_id IN ('" + studySub.join("','") + "')";
			}			
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				clinicalQuery += " and s.pdc_study_id IN ('" + studySub.join("','") + "')";
			}			
			
			var myOffset = 0;
			var myLimit = 1000;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			clinicalQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(clinicalQuery, { model: db.getModelByName('ModelUIClinical') });
		},
		//@@@PDC-898 new public APIs--biospecimenPerStudy
		//@@@PDC-1156 add is_ref
		//@@@PDC-1396 add external_case_id
		biospecimenPerStudy(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/biospecimenPerStudy").send();
				logger.info("biospecimenPerStudy is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("biospecimenPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1127 add pool and taxon
			//@@@PDC-2335 get ext id from reference
			//@@@PDC-2657 reverse 2335
			var biospecimenQuery = "SELECT distinct bin_to_uuid(al.aliquot_id) as aliquot_id, "+
			" bin_to_uuid(sam.sample_id) as sample_id, al.aliquot_submitter_id, al.aliquot_is_ref, "+ 
			" al.status as aliquot_status, sam.sample_submitter_id, "+
			" c.status as case_status, sam.status as sample_status, "+
			" bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, "+
			" proj.name as project_name, sam.sample_type, c.disease_type, c.primary_site, "+
			" al.pool, c.taxon "+
			" from study s, `case` c, sample sam, aliquot al,"+
			" aliquot_run_metadata alm, project proj "+
			" where alm.study_id=s.study_id and "+
			" al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id"+
			" and proj.project_id = s.project_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				let studySub = args.study_id.split(";");
				biospecimenQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let studySub = args.study_submitter_id.split(";");
				biospecimenQuery += " and s.study_submitter_id IN ('" + studySub.join("','") + "')";
			}			
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				biospecimenQuery += " and s.pdc_study_id IN ('" + studySub.join("','") + "')";
			}			
			
			var myOffset = 0;
			var myLimit = 1000;
			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)  
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
			}
			biospecimenQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(biospecimenQuery, { model: db.getModelByName('ModelUICase') });
		},
		//@@@PDC-898 new public APIs--studyExperimentalDesign
		//@@@PDC-1120 StudyRunMetadata table change
		//@@@PDC-1156 add is_ref
		//@@@PDC-1316 remove itraq_120
		//@@@PDC-1383 convert labels to aliquot_id 
		//@@@PDC-2237 sort data by plex_dataset_name
		//@@@PDC-2336 get fraction count from protocol table
		//@@@PDC-2391 order by Study Run Metadata Submitter ID
		async studyExperimentalDesign(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/studyExperimentalDesign").send();
				logger.info("studyExperimentalDesign is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("studyExperimentalDesign is called from UI with "+ JSON.stringify(args));
			var experimentalQuery = "SELECT distinct bin_to_uuid(srm.study_run_metadata_id) as study_run_metadata_id, "+
			" bin_to_uuid(s.study_id) as study_id, srm.study_run_metadata_submitter_id,"+ 
			" s.study_submitter_id, s.pdc_study_id, "+
			" srm.analyte, s.acquisition_type, s.experiment_type,"+
			" srm.folder_name as plex_dataset_name, srm.experiment_number,"+
			" p.fractions_analyzed_count as number_of_fractions, label_free, itraq_113,"+
			" itraq_114, itraq_115, itraq_116, itraq_117,"+
			" itraq_118, itraq_119, itraq_121,"+
			" tmt_126, tmt_127n, tmt_127c, tmt_128n, tmt_128c,"+
			" tmt_129n, tmt_129c, tmt_130n, tmt_130c, tmt_131, tmt_131c"+
			" from study_run_metadata srm, study s, protocol p "+
			" where srm.study_id=s.study_id and p.study_id = s.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				let studySub = args.study_id.split(";");
				experimentalQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let studySub = args.study_submitter_id.split(";");
				experimentalQuery += " and s.study_submitter_id IN ('" + studySub.join("','") + "')";
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				experimentalQuery += " and s.pdc_study_id IN ('" + studySub.join("','") + "')";
			}
			experimentalQuery += " order by srm.study_run_metadata_submitter_id, srm.folder_name asc ";
			var studyExperimentalDesigns = await db.getSequelize().query(experimentalQuery, { model: db.getModelByName('ModelStudyExperimentalDesign') });
			if (typeof args.label_aliquot_id != 'undefined' && args.label_aliquot_id == 'true') {
				var aliquotIdQuery = "select distinct bin_to_uuid(al.aliquot_id) as label "+
				"from aliquot al where al.aliquot_submitter_id = '";
				var aliquotId = null;
				for (var i = 0; i < studyExperimentalDesigns.length; i++) {
					if (studyExperimentalDesigns[i].label_free != null && studyExperimentalDesigns[i].label_free.length > 0 ) {
						studyExperimentalDesigns[i].label_free = getAliquotId(studyExperimentalDesigns[i].label_free, 'label_free');
					}
					if (studyExperimentalDesigns[i].itraq_113 != null && studyExperimentalDesigns[i].itraq_113.length > 0) {
						studyExperimentalDesigns[i].itraq_113 = getAliquotId(studyExperimentalDesigns[i].itraq_113, 'itraq_113');
					}
					if (studyExperimentalDesigns[i].itraq_114 != null && studyExperimentalDesigns[i].itraq_114.length > 0) {
						studyExperimentalDesigns[i].itraq_114 = getAliquotId(studyExperimentalDesigns[i].itraq_114, 'itraq_114');
					}
					if (studyExperimentalDesigns[i].itraq_115 != null && studyExperimentalDesigns[i].itraq_115.length > 0) {
						studyExperimentalDesigns[i].itraq_115 = getAliquotId(studyExperimentalDesigns[i].itraq_115, 'itraq_115');
					}
					if (studyExperimentalDesigns[i].itraq_116 != null && studyExperimentalDesigns[i].itraq_116.length > 0) {
						studyExperimentalDesigns[i].itraq_116 = getAliquotId(studyExperimentalDesigns[i].itraq_116, 'itraq_116');
					}
					if (studyExperimentalDesigns[i].itraq_117 != null && studyExperimentalDesigns[i].itraq_117.length > 0) {
						studyExperimentalDesigns[i].itraq_117 = getAliquotId(studyExperimentalDesigns[i].itraq_117, 'itraq_117');
					}
					if (studyExperimentalDesigns[i].itraq_118 != null && studyExperimentalDesigns[i].itraq_118.length > 0) {
						studyExperimentalDesigns[i].itraq_118 = getAliquotId(studyExperimentalDesigns[i].itraq_118, 'itraq_118');
					}
					if (studyExperimentalDesigns[i].itraq_119 != null && studyExperimentalDesigns[i].itraq_119.length > 0) {
						studyExperimentalDesigns[i].itraq_119 = getAliquotId(studyExperimentalDesigns[i].itraq_119, 'itraq_119');
					}
					if (studyExperimentalDesigns[i].itraq_121 != null && studyExperimentalDesigns[i].itraq_121.length > 0) {
						studyExperimentalDesigns[i].itraq_121 = getAliquotId(studyExperimentalDesigns[i].itraq_121, 'itraq_121');
					}
					if (studyExperimentalDesigns[i].tmt_126 != null && studyExperimentalDesigns[i].tmt_126.length > 0) {
						studyExperimentalDesigns[i].tmt_126 = getAliquotId(studyExperimentalDesigns[i].tmt_126, 'tmt_126');
					}
					if (studyExperimentalDesigns[i].tmt_127n != null && studyExperimentalDesigns[i].tmt_127n.length > 0) {
						studyExperimentalDesigns[i].tmt_127n = getAliquotId(studyExperimentalDesigns[i].tmt_127n, 'tmt_127n');
					}
					if (studyExperimentalDesigns[i].tmt_127c != null && studyExperimentalDesigns[i].tmt_127c.length > 0) {
						studyExperimentalDesigns[i].tmt_127c = getAliquotId(studyExperimentalDesigns[i].tmt_127c, 'tmt_127c');
					}
					if (studyExperimentalDesigns[i].tmt_128n != null && studyExperimentalDesigns[i].tmt_128n.length > 0) {
						studyExperimentalDesigns[i].tmt_128n = getAliquotId(studyExperimentalDesigns[i].tmt_128n, 'tmt_128n');
					}
					if (studyExperimentalDesigns[i].tmt_128c != null && studyExperimentalDesigns[i].tmt_128c.length > 0) {
						studyExperimentalDesigns[i].tmt_128c = getAliquotId(studyExperimentalDesigns[i].tmt_128c, 'tmt_128c');
					}
					if (studyExperimentalDesigns[i].tmt_129n != null && studyExperimentalDesigns[i].tmt_129n.length > 0) {
						studyExperimentalDesigns[i].tmt_129n = getAliquotId(studyExperimentalDesigns[i].tmt_129n, 'tmt_129n');
					}
					if (studyExperimentalDesigns[i].tmt_129c != null && studyExperimentalDesigns[i].tmt_129c.length > 0) {
						studyExperimentalDesigns[i].tmt_129c = getAliquotId(studyExperimentalDesigns[i].tmt_129c, 'tmt_129c');
					}
					if (studyExperimentalDesigns[i].tmt_130n != null && studyExperimentalDesigns[i].tmt_130n.length > 0) {
						studyExperimentalDesigns[i].tmt_130n = getAliquotId(studyExperimentalDesigns[i].tmt_130n, 'tmt_130n');
					}
					if (studyExperimentalDesigns[i].tmt_130c != null && studyExperimentalDesigns[i].tmt_130c.length > 0) {
						studyExperimentalDesigns[i].tmt_130c = getAliquotId(studyExperimentalDesigns[i].tmt_130c, 'tmt_130c');
					}
					if (studyExperimentalDesigns[i].tmt_131 != null && studyExperimentalDesigns[i].tmt_131.length > 0) {
						studyExperimentalDesigns[i].tmt_131 = getAliquotId(studyExperimentalDesigns[i].tmt_131, 'tmt_131');
					}
					if (studyExperimentalDesigns[i].tmt_131c != null && studyExperimentalDesigns[i].tmt_131c.length > 0) {
						studyExperimentalDesigns[i].tmt_131c = getAliquotId(studyExperimentalDesigns[i].tmt_131c, 'tmt_131c');
					}
				}				
			}
			return studyExperimentalDesigns

		},
		//@@@PDC-1491 add dataMatrixFromFile API
		//@@@PDC-1772 allow study_id as a parameter
		//@@@PDC-2016 add pdc_study_id to quantDataMatrix
		async quantDataMatrix(obj, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantDataMatrix").send();
				logger.info("quantDataMatrix is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("quantDataMatrix is called from UI with "+ JSON.stringify(args));
			var sid = null;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				sid = args.study_id;
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0 && sid == null) {
				var studyQuery = "select bin_to_uuid(study_id) as study_id from study where study_submitter_id = '"+args.study_submitter_id+"'";
				var study = await db.getSequelize().query(studyQuery, { raw: true });
				sid = study[0][0].study_id;
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0 && sid == null) {
				var studyQuery = "select bin_to_uuid(study_id) as study_id from study where pdc_study_id = '"+args.pdc_study_id+"'";
				var study = await db.getSequelize().query(studyQuery, { raw: true });
				sid = study[0][0].study_id;
			}
			if (sid == null) {
				return [['One of the following is needed: ']['study_id or study_submitter_id or pdc_study_id']];
			}
			var matrixFile = 'matrixFiles/'+sid+ '_'+args.data_type+'.json';
			let rawData = fs.readFileSync(matrixFile);
			let matrix = JSON.parse(rawData);
			return matrix;
		},
		//@@@PDC-1882 pdcEntityReference api
		pdcEntityReference(obj, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/pdcEntityReference").send();
				logger.info("pdcEntityReference is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("pdcEntityReference is called from UI with "+ JSON.stringify(args));
			logger.info("pdcEntityReference is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2018 add submitter_id_name of study
			//@@@PDC-2968 get latest version by default
			//@@@PDC-3090 join on study_id
			//@@@PDC-3132 dynamic join based on reference_type
			//@@@PDC-3528 remove duplicates across versions
			var entityReferenceQuery = "SELECT distinct bin_to_uuid(reference_id) as reference_id, entity_type, bin_to_uuid(entity_id) as entity_id, reference_type, reference_entity_type, reference_entity_alias, reference_resource_name, reference_resource_shortname, reference_entity_location, s.submitter_id_name ";
			if (typeof args.reference_type == 'undefined' || args.reference_type.length <= 0) {
				return null;
			}
			//@@@PDC-3490 get references for non-current studies
			if (args.reference_type=='external') {
				entityReferenceQuery += " FROM reference r left join study s on r.entity_id = s.study_id where reference_type ='external' ";
			}
			else if (args.reference_type=='internal') {
				entityReferenceQuery += " FROM reference r left join study s on r.reference_entity_alias = s.pdc_study_id where reference_type ='internal' ";
			}
			if (typeof args.entity_id != 'undefined' && args.entity_id.length > 0) {
				entityReferenceQuery += " and entity_id = uuid_to_bin('" + args.entity_id+ "')";
			}
			else {
				entityReferenceQuery += " and s.is_latest_version = 1 "; 
			}
			if (typeof args.entity_type != 'undefined' && args.entity_type.length > 0) {
				entityReferenceQuery += " and entity_type ='" + args.entity_type + "'";
			}			
			/*if (typeof args.reference_type != 'undefined' && args.reference_type.length > 0) {
				entityReferenceQuery += " and reference_type ='" + args.reference_type + "'";
			}*/			
			return db.getSequelize().query(entityReferenceQuery, { model: db.getModelByName('ModelEntityReference') });

		},
		//@@@PDC-964 async api for data matrix
		//@@@PDC-1772 take quantDataMatrixDb offline
		async quantDataMatrixDb(obj, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantDataMatrixDb").send();
				logger.info("quantDataMatrixDb is called with "+ JSON.stringify(args));
				if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					throw new ApolloError(duaMsg);
			}
			else 
				logger.info("quantDataMatrixDb is called from UI with "+ JSON.stringify(args));
			var matrix = [];
			var row1 = ['Data Matrix: '];
			var row2 = ['Type: '];
			var row3 = [args.data_type];
			var row4 = ['Study: '];
			var row5 = [args.study_submitter_id];
			var row6 = ['Status: '];
			var row7 = ['Not Available '];
			var row8 = ['API is currently offline. Stay tuned!'];
			matrix.push(row1);
			matrix.push(row2);
			matrix.push(row3);
			matrix.push(row4);
			matrix.push(row5);
			matrix.push(row6);
			matrix.push(row7);
			matrix.push(row8);
			return matrix;

			//@@@PDC-1019 limit num of records returned
			/*var numOfAliquot = 0, numOfGene = 0;
			if (args.numOfAliquot != null && args.numOfAliquot > 0)
				numOfAliquot =args.numOfAliquot;
			if (args.numOfGene != null && args.numOfGene > 0)
				numOfGene =args.numOfGene;
			var matrixCacheName = 'PDCQUANT:Type:'+args.data_type+'Study:'+args.study_submitter_id+'Aliquots'+numOfAliquot+'numOfGene'+numOfGene;
			const res = await RedisCacheClient.redisCacheGetAsync(matrixCacheName);
			if(res === null){
				if (args.attempt == 0){
					fetchDataMatrix(args.data_type, args.study_submitter_id, numOfAliquot, numOfGene);					
				}
				var matrix = [];
				var row1 = ['Data Matrix: '];
				var row2 = ['Type: '];
				var row3 = [args.data_type];
				var row4 = ['Study: '];
				var row5 = [args.study_submitter_id];
				var row6 = ['Status: '];
				var row7 = ['Not ready '];
				var row8 = ['Increment attempt and try again!'];
				matrix.push(row1);
				matrix.push(row2);
				matrix.push(row3);
				matrix.push(row4);
				matrix.push(row5);
				matrix.push(row6);
				matrix.push(row7);
				matrix.push(row8);
				return matrix;
			}else{
				return JSON.parse(res);
			}*/	
			
		}	
	}
};

//export default resolvers;