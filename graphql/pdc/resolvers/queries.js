import { db } from '../util/dbconnect';
import { GraphQLScalarType } from 'graphql';
import { ApolloError } from 'apollo-server-express';
import { Kind } from 'graphql/language';
import Sequelize from 'sequelize';
import { QueryTypes } from 'sequelize';
import {filters, filtersView} from '../util/filters'
import { replacementFilters, replacementFiltersView } from "../util/replacementFilters";
import {sort} from '../util/sort';
import {CacheName, RedisCacheClient} from '../util/cacheClient';
import {uiFilterProcess} from '../util/uiFilterProcess';
import {fetchDataMatrix} from '../util/fetchDataMatrix';
import {getAliquotId} from '../util/getAliquotId';
//@@@PDC-1215 use winston logger
import { logger } from '../util/logger';
import {
	filterLogger,
	searchLogger
} from '../util/aLogger';
//@@@PDC-4865 extra logging for analytic data
//import { analyticLog } from '../util/analyticLog';
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

import  {
	applyStudyReplacementFilter,
	applyProgProjReplacementFilter,
	applyFileReplacementFilter,
	applyAlSamCaDemDiaReplacementFilter,
	addStudyInReplacementQuery,
} from '../util/browsePageReplacementFilters';

import { getHeatMapStudies } from '../util/heatMapData';

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
	//@@@PDC-5037 log api parent
	//@@@PDC-4812 add more ui wrappers of public APIs
	//@@@PDC-6137 make acceptDUA optional

	Query: {
		uiFileMetadata(_, args, context) {
			logger.info("The Wrapper: uiFileMetadata is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiFileMetadata";
			return resolvers.Query.fileMetadata(_, args, context);
		},
		uiCaseSummary(_, args, context) {
			logger.info("The Wrapper: uiCaseSummary is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiCaseSummary";
			return resolvers.Query.case(_, args, context);
		},
		uiStudySummary(_, args, context) {
			logger.info("The Wrapper: uiStudySummary is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiStudySummary";
			return resolvers.Query.study(_, args, context);
		},
		uiSampleSummary(_, args, context) {
			logger.info("The Wrapper: uiSampleSummary is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiSampleSummary";
			return resolvers.Query.sample(_, args, context);
		},
		uiAliquotSummary(_, args, context) {
			logger.info("The Wrapper: uiAliquotSummary is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiAliquotSummary";
			return resolvers.Query.aliquot(_, args, context);
		},
		uiCasePerFile(_, args, context) {
			logger.info("The Wrapper: uiCasePerFile is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiCasePerFile";
			return resolvers.Query.casePerFile(_, args, context);
		},
		uiAllPrograms(_, args, context) {
			logger.info("The Wrapper: uiAllPrograms is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiAllPrograms";
			return resolvers.Query.allPrograms(_, args, context);
		},
		uiFilesCountPerStudy(_, args, context) {
			logger.info("The Wrapper: uiFilesCountPerStudy is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiFilesCountPerStudy";
			return resolvers.Query.filesCountPerStudy(_, args, context);
		},
		uiProtein(_, args, context) {
			logger.info("uiProtein is called with "+ JSON.stringify(args));
			//@@@PDC-2642 gene-related apis enhancement
			context['arguments'] = args;
			context['parent']= "uiProtein";
			return db.getModelByName('Gene').findOne({ where: {
					proteins: {
						[Op.like]: '%'+args.protein+'%'
					}}
			});
		},
		uiDiseasesAvailable(_, args, context) {
			logger.info("The Wrapper: uiDiseasesAvailable is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiDiseasesAvailable";
			return resolvers.Query.diseasesAvailable(_, args, context);
		},
		uiTissueSitesAvailable(_, args, context) {
			logger.info("The Wrapper: uiTissueSitesAvailable is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiTissueSitesAvailable";
			return resolvers.Query.tissueSitesAvailable(_, args, context);
		},
		uiPdcDataStats(_, args, context) {
			logger.info("The Wrapper: uiPdcDataStats is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiPdcDataStats";
			return resolvers.Query.pdcDataStats(_, args, context);
		},
		uiWorkflowMetadata(_, args, context) {
			logger.info("The Wrapper: uiWorkflowMetadata is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiWorkflowMetadata";
			return resolvers.Query.workflowMetadata(_, args, context);
		},
		uiProgramsProjectsStudies(_, args, context) {
			logger.info("The Wrapper: uiProgramsProjectsStudies is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiProgramsProjectsStudies";
			return resolvers.Query.programsProjectsStudies(_, args, context);
		},
		uiBiospecimenPerStudy(_, args, context) {
			logger.info("The Wrapper: uiBiospecimenPerStudy is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiBiospecimenPerStudy";
			return resolvers.Query.biospecimenPerStudy(_, args, context);
		},
		uiPdcEntityReference(_, args, context) {
			logger.info("The Wrapper: uiPdcEntityReference is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiPdcEntityReference";
			return resolvers.Query.pdcEntityReference(_, args, context);
		},
		uiStudyExperimentalDesign(_, args, context) {
			logger.info("The Wrapper: uiStudyExperimentalDesign is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiStudyExperimentalDesign";
			return resolvers.Query.studyExperimentalDesign(_, args, context);
		},
		uiFilesPerStudy(_, args, context) {
			logger.info("The Wrapper: uiFilesPerStudy is called with "+ JSON.stringify(args));
			context['isUI']= true;
			context['parent']= "uiFilesPerStudy";
			return resolvers.Query.filesPerStudy(_, args, context);
		},
		//@@@PDC-3921 new studyCatalog api
		studyCatalog(_, args, context) {
			context['parent']= "studyCatalog";
			gaVisitor.pageview("/graphqlAPI/studyCatalog").send();
			logger.info("studyCatalog is called with "+ JSON.stringify(args));
			//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
			//throw new ApolloError(duaMsg);
			var scQuery = "SELECT distinct pdc_study_id from study ";
			if (typeof args.pdc_study_id != 'undefined') {
				scQuery += " WHERE pdc_study_id = :pdc_study_id ";
			}
			scQuery += " ORDER BY pdc_study_id ";
			return db.getSequelize().query(
				scQuery,
				{
					replacements: { pdc_study_id: args.pdc_study_id },
					model: db.getModelByName('ModelStudy')
				});

		},
		//@@@PDC-768 clinical metadata API
		//@@@PDC-3428 add tumor_largest_dimension_diameter
		//@@@PDC-3668 add study_id to input and aliquot_id to output
		clinicalMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/clinicalMetadata").send();
				logger.info("clinicalMetadata is called with "+ JSON.stringify(args));
				context['parent']= "clinicalMetadata";
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("clinicalMetadata is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3840 get current version of study unless specific id is given
			let isCurrent = true;
			//@@@PDC-7491 add new clinical fields
			var cmQuery = "SELECT bin_to_uuid(a.aliquot_id) as aliquot_id, a.aliquot_submitter_id, d.primary_diagnosis, d.tumor_stage, d.tumor_grade, d.morphology, "+
				"d.tumor_largest_dimension_diameter, d.age_at_diagnosis, d.classification_of_tumor, d.site_of_resection_or_biopsy, d.tissue_or_organ_of_origin, d.days_to_recurrence "+
				"FROM study s, diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm "+
				"WHERE d.case_id=c.case_id AND c.case_id=sam.case_id AND "+
				"sam.sample_id=a.sample_id AND arm.aliquot_id = a.aliquot_id "+
				"AND arm.study_id = s.study_id";

			let replacements = { };

			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				cmQuery += " and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				cmQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				cmQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
			}
			if (isCurrent) {
				cmQuery += " and s.is_latest_version = 1 ";
			}
			//"AND arm.study_submitter_id= '"+args.study_submitter_id+"'";
			return pubDb.getSequelize().query(
				cmQuery,
				{
					replacements: replacements,
					model: pubDb.getModelByName('ModelClinicalMetadata')
				}
			);
		},
		//@@@PDC-191 experimental metadata API
		//@@@PDC-3668 add study_id to input/output
		async experimentalMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/experimentalMetadata").send();
				logger.info("experimentalMetadata is called with "+ JSON.stringify(args));
				context['parent']= "experimentalMetadata";
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("experimentalMetadata is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3840 get current version of study unless specific id is given
			let isCurrent = true;
			var studyQuery = "select bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, s.pdc_study_id, s.experiment_type, s.analytical_fraction, "+
				"p.instrument_model as instrument from study s, protocol p "+
				"where s.study_id = p.study_id ";

			let replacements = { };
			let cacheFilterName = {name:''};

			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				studyQuery += "and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				studyQuery += "and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				studyQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (isCurrent) {
				studyQuery += " and s.is_latest_version = 1 ";
			}
			//@@@PDC-6930 add cache
			let cacheKey = "PDCPUB:experimentalMetadata:"+cacheFilterName['name'];
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				//logger.info("experimentalMetadata not found in cache "+cacheKey);
				let result = await pubDb.getSequelize().query(
					studyQuery,
					{
						replacements: replacements,
						model: pubDb.getModelByName('ModelExperimentalMetadata')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("experimentalMetadata found in cache "+cacheKey);
				return JSON.parse(res);
			}
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
		//@@@PDC-3668 add project_id to input/output
		tissueSitesAvailable (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/tissueSitesAvailable").send();
				logger.info("tissueSitesAvailable is called with "+ JSON.stringify(args));
				context['parent']= "tissueSitesAvailable";
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("tissueSitesAvailable is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3840 get current version of study
			//@@@PDC-6794 use case_id count as case count
			let tissueQuery = "SELECT bin_to_uuid(d.project_id) as project_id, d.project_submitter_id, "+
				"d.tissue_or_organ_of_origin, count(distinct d.case_id) as cases_count "+
				"FROM study s, diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm "+
				"WHERE d.case_id=c.case_id AND c.case_id=sam.case_id AND "+
				"sam.sample_id=a.sample_id AND arm.aliquot_id = a.aliquot_id "+
				"AND arm.study_id = s.study_id and s.is_latest_version = 1 ";

			let replacements = { };

			if (typeof args.project_submitter_id != 'undefined') {
				tissueQuery += "and d.project_submitter_id = :project_submitter_id ";
				replacements['project_submitter_id'] = args.project_submitter_id;
			}
			if (typeof args.project_id != 'undefined') {
				tissueQuery += "and d.project_id = uuid_to_bin(:project_id) ";
				replacements['project_id'] = args.project_id;
			}
			if (typeof args.tissue_or_organ_of_origin != 'undefined') {
				tissueQuery += "and d.tissue_or_organ_of_origin = :tissue_or_organ_of_origin ";
				replacements['tissue_or_organ_of_origin'] = args.tissue_or_organ_of_origin;
			}

			tissueQuery += " group by d.project_submitter_id, d.tissue_or_organ_of_origin ";
			return db.getSequelize().query(
				tissueQuery,
				{
					replacements: replacements,
					model: db.getModelByName('Diagnosis')
				}
			);
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
		//@@@PDC-3668 add project_id to input/output
		diseasesAvailable(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/diseasesAvailable").send();
				logger.info("diseasesAvailable is called with "+ JSON.stringify(args));
				context['parent']= "diseasesAvailable";
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
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
			//@@@PDC-5168 count case_id instead of diagnosis_id
			//@@@PDC-6794 use case_id count as case count
			let diseaseQuery = "SELECT bin_to_uuid(dia.project_id) as project_id, dia.project_submitter_id,  dia.tissue_or_organ_of_origin, "+
				" c.disease_type, count(distinct c.case_id) as cases_count "+
				" FROM study s, `case` c, diagnosis dia "+
				" WHERE c.case_id = dia.case_id and c.project_id = s.project_id "+
				" and s.is_latest_version = 1 ";

			let replacements = { };

			if (typeof args.tissue_or_organ_of_origin != 'undefined'){
				diseaseQuery += " and dia.tissue_or_organ_of_origin = :tissue_or_organ_of_origin ";
				replacements['tissue_or_organ_of_origin'] = args.tissue_or_organ_of_origin;
			}
			if (typeof args.disease_type != 'undefined'){
				diseaseQuery += " and c.disease_type = :disease_type ";
				replacements['disease_type'] = args.disease_type;
			}
			if (typeof args.project_submitter_id != 'undefined') {
				diseaseQuery += " and dia.project_submitter_id = :project_submitter_id ";
				replacements['project_submitter_id'] = args.project_submitter_id;
			}
			if (typeof args.project_id != 'undefined') {
				diseaseQuery += " and dia.project_id = uuid_to_bin(:project_id) ";
				replacements['project_id'] = args.project_id;
			}
			diseaseQuery += " GROUP BY dia.project_submitter_id,  dia.tissue_or_organ_of_origin, c.disease_type";
			return db.getSequelize().query(
				diseaseQuery,
				{
					replacements: replacements,
					model: db.getModelByName('Diagnosis')
				}
			);
		},
		//@@@PDC-607 Add uiSunburstChart API
		/**
		 * uiSunburstChart is used to create sunburst chart.
		 *
		 * @return {UISunburst}
		 */
		uiSunburstChart(_, args, context) {
			logger.info("uiSunburstChart is called with "+ JSON.stringify(args));
			context['parent']= "uiSunburstChart";
			//@@@PDC-3840 get current version of study
			//@@@PDC-6794 use case_id count as case count
			let diseaseQuery = "SELECT diag.project_submitter_id,  diag.tissue_or_organ_of_origin, "+
				" c.disease_type, sam.sample_type, count(distinct diag.case_id) as cases_count "+
				" FROM diagnosis diag, `case` c, sample sam , study s "+
				" WHERE diag.case_id = c.case_id and sam.case_id = c.case_id "+
				" and c.project_id = s.project_id "+
				" and s.is_latest_version = 1 "+
				" GROUP BY diag.project_submitter_id,  diag.tissue_or_organ_of_origin, c.disease_type, sample_type";
			return db.getSequelize().query(diseaseQuery, { model: db.getModelByName('ModelUISunburst') });
		},
		//@@@PDC-3162 get current data/software version
		uiDataVersionSoftwareVersion(_, args, context) {
			logger.info("uiDataVersionSoftwareVersion is called with "+ JSON.stringify(args));
			context['parent']= "uiDataVersionSoftwareVersion";
			let verQuery = "SELECT data_release, build_tag " +
				" from database_version WHERE is_current_version = 1 ";
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
				context['parent']= "allExperimentTypes";
				logger.info("allExperimentTypes is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("allExperimentTypes is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3840 get current version of study
			let experimentQuery = "SELECT DISTINCT Esac.disease_type, Diag.tissue_or_organ_of_origin, " +
				" Study.experiment_type FROM diagnosis as Diag, study as Study," +
				" `case` as Esac WHERE Diag.project_id = Study.project_id " +
				" and Diag.case_id = Esac.case_id and Study.is_latest_version = 1 ";

			let replacements = { };

			//@@@PDC-151 check for undefined rather than empty string
			if (typeof args.experiment_type != 'undefined') {
				experimentQuery += " and Study.experiment_type = :experiment_type ";
				replacements['experiment_type'] = args.experiment_type;
			}
			if (typeof args.disease_type != 'undefined') {
				experimentQuery += " and Esac.disease_type = :disease_type ";
				replacements['disease_type'] = args.disease_type;
			}
			if (typeof args.tissue_or_organ_of_origin != 'undefined') {
				experimentQuery += " and Diag.tissue_or_organ_of_origin = :tissue_or_organ_of_origin ";
				replacements['tissue_or_organ_of_origin'] = args.tissue_or_organ_of_origin;
			}
			//experimentQuery += " and Diag.project_submitter_id IN ('" + context.value.join("','") + "')";

			return db.getSequelize().query(
				experimentQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelExperiments')
				}
			);
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
		//@@@PDC-3668 add project_id to input/output
		diseaseTypesPerProject(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/diseaseTypesPerProject").send();
				context['parent']= "diseaseTypesPerProject";
				logger.info("diseaseTypesPerProject is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("diseaseTypesPerProject is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3840 get current version of study
			if (typeof args.project_id != 'undefined') {
				return db.getModelByName('ModelStudy').findAll({
					attributes: [[db.getSequelize().fn('bin_to_uuid', db.getSequelize().col('study.project_id')), 'project_id'], 'project_submitter_id','experiment_type', 'analytical_fraction'],
					order: [['project_submitter_id', 'DESC']],
					group: ['project_id', 'experiment_type', 'analytical_fraction', 'cases.disease_type'],
					where: {
						project_id: Sequelize.fn('uuid_to_bin', args.project_id),
						is_latest_version: 1
					},
					include: [{
						model: db.getModelByName('ModelCase'),
						required: true,
						attributes: ['disease_type', [db.getSequelize().fn('COUNT', db.getSequelize().col('cases.case_id')), 'count']]
					}
					]
				});
			}
			else if (typeof args.project_submitter_id != 'undefined') {
				return db.getModelByName('ModelStudy').findAll({
					attributes: [[db.getSequelize().fn('bin_to_uuid', db.getSequelize().col('study.project_id')), 'project_id'], 'project_submitter_id','experiment_type', 'analytical_fraction'],
					order: [['project_submitter_id', 'DESC']],
					group: ['project_id', 'experiment_type', 'analytical_fraction', 'cases.disease_type'],
					where: {
						project_submitter_id: args.project_submitter_id,
						is_latest_version: 1
					},
					include: [{
						model: db.getModelByName('ModelCase'),
						required: true,
						attributes: ['disease_type', [db.getSequelize().fn('COUNT', db.getSequelize().col('cases.case_id')), 'count']]
					}
					]
				});
			}
			else {
				return db.getModelByName('ModelStudy').findAll({
					attributes: [[db.getSequelize().fn('bin_to_uuid', db.getSequelize().col('study.project_id')), 'project_id'], 'project_submitter_id','experiment_type', 'analytical_fraction'],
					order: [['project_submitter_id', 'DESC']],
					group: ['project_id', 'experiment_type', 'analytical_fraction', 'cases.disease_type'],
					where: {
						is_latest_version: 1
					},
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
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to case:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to case:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/case").send();
				context['parent']= "case";
				logger.info("case is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("case is called from UI with "+ JSON.stringify(args));
			//@@@PDC-180 Case API for UI case summary
			let cacheFilterName = {name:''};
			//@@@PDC-1371 use uuid instead of submitter_id
			if (typeof args.case_id != 'undefined') {
				cacheFilterName.name +="case_id:("+ args.case_id + ");";
			}
			if (typeof args.case_submitter_id != 'undefined') {
				cacheFilterName.name +="case_submitter_id:("+ args.case_submitter_id + ");";
			}
			//@@@PDC-5178 case-sample-aliquot across studies
			let studyFilters = {};
			if (typeof args.study_id != 'undefined') {
				studyFilters['study_id'] = args.study_id
			}
			if (typeof args.pdc_study_id != 'undefined') {
				studyFilters['pdc_study_id'] = args.pdc_study_id
			}
			context['arguments'] = studyFilters;

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageCaseSummary('Case')+cacheFilterName['name']);
			if(res === null){
				//@@@PDC-2335 get ext id from reference
				//@@@PDC-2657 reverse 2335
				//@@@PDC-4486 new columns for case
				//@@@PDC-4968 expose case_is_ref
				let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, "+
					"c.case_submitter_id, c.case_is_ref, "+
					"c.tissue_source_site_code, c.days_to_lost_to_followup, c.disease_type, "+
					"c.index_date, c.lost_to_followup, c.primary_site, c.project_submitter_id, "+
					"c.consent_type, c.days_to_consent from `case` c where case_id is not null ";

				let result = null;
				let replacements = { };
				//@@@PDC-2980 handle multiple cases
				if (typeof args.case_id != 'undefined'){
					let caseIds = args.case_id.split(';');
					uiCaseBaseQuery += "and bin_to_uuid(c.case_id) IN (:case_ids) ";
					replacements['case_ids'] =  caseIds;
				}
				else if (typeof args.case_submitter_id != 'undefined'){
					let caseSubmitterIds = args.case_submitter_id.split(';');
					uiCaseBaseQuery += "and c.case_submitter_id IN (:case_submitter_ids) ";
					replacements['case_submitter_ids'] = caseSubmitterIds;
				}
				result = await db.getSequelize().query(
					uiCaseBaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('Case')
					}
				);

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
				context['parent']= "casePerFile";
				logger.info("casePerFile is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("casePerFile is called from UI with "+ JSON.stringify(args));
			let fileQuery = "SELECT bin_to_uuid(f.file_id) as file_id, bin_to_uuid(f.case_id) as case_id, " +
				" f.case_submitter_id from file f where ";

			let replacements = { };

			if (typeof args.file_id != 'undefined') {
				let fileIds = args.file_id.split(';');
				fileQuery += " bin_to_uuid(f.file_id) IN (:file_ids) ";
				replacements['file_ids'] = fileIds;
			}

			return db.getSequelize().query(
				fileQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelCaseFile')
				}
			);
		},
		/**
		 * allCases gets all cases
		 *
		 * @return {Array}
		 */
		async allCases(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/allCases").send();
				context['parent']= "allCases";
				logger.info("allCases is called with "+ JSON.stringify(args));
			}
			else
				logger.info("allCases is called from UI with "+ JSON.stringify(args));
			//@@@PDC-6930 add cache
			let cacheKey = "PDCPUB:allCases";
			let caseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id,  c.case_submitter_id, "+
				" bin_to_uuid(c.project_id) as project_id, c.project_submitter_id, "+
				" c.disease_type, c.primary_site "+
				"FROM study s, `case` c, sample sam, aliquot a, aliquot_run_metadata arm "+
				"WHERE c.case_id=sam.case_id AND "+
				"sam.sample_id=a.sample_id AND arm.aliquot_id = a.aliquot_id "+
				"AND arm.study_id = s.study_id and s.is_latest_version = 1 ";
			//@@@PDC-7965 add offset and limit for quick return
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				cacheKey += ":offset:"+args.offset+":limit:"+args.limit;
				caseQuery += " limit "+args.offset+", "+args.limit
			}
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null){
				//logger.info("allCases not cached ");
				let result = null;
				//@@@PDC-3840 get current version of study
				result = await db.getSequelize().query(caseQuery, { model: db.getModelByName('Case') });
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("allCases found in cache"+ cacheKey);
				return JSON.parse(res);
			}


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
				context['parent']= "program";
				logger.info("program is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
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
				context['parent']= "allPrograms";
				logger.info("allPrograms is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
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
		//@@@PDC-7628 use ncbi_gene_id in gene query
		/**
		 * geneSpectralCount gets one specific gene with all its spectral * counts
		 *
		 * @param {string}   gene_name_id
		 *
		 * @return {Gene}
		 */
		async uiGeneSpectralCount(_, args, context) {
			context['parent']= "uiGeneSpectralCount";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiGeneSpectralCount:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiGeneSpectralCount:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("uiGeneSpectralCount is called with CS: "+ JSON.stringify(args));
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
			}
			if (typeof args.ncbi_gene_id != 'undefined') {
				cacheFilterName.name +="ncbi_gene_id:("+ args.ncbi_gene_id + ");";
			}
			if (typeof args.gene_id != 'undefined') {
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
			}
			//@@@PDC-6287 case sensitive search
			/*let geneQuery = "SELECT bin_to_uuid(gene_id) as gene_id, gene_name, " +
								" ncbi_gene_id, authority, description, organism, chromosome, " +
								" locus, assays, proteins FROM gene " +
								" where BINARY gene_name = :gene_name ";*/
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name']);
			//@@@PDC-4755 stop using all args in where clause
			if(res === null){
				/*var result = await db.getSequelize().query(
					geneQuery,
					{
						replacements: { gene_name: args.gene_name },
						model: db.getModelByName('Gene')
					}
				);*/
				//logger.info("Gene Result: "+ JSON.stringify(result));
				let result = null;
				if (typeof args.gene_id != 'undefined') {
					result = await db.getModelByName('Gene').findOne(
						{
							attributes: [[db.getSequelize().fn('bin_to_uuid', db.getSequelize().col('gene_id')), 'gene_id'], 'gene_name', 'ncbi_gene_id', 'authority', 'description', 'organism', 'chromosome', 'locus', 'assays', 'proteins'],
							where: {
								gene_id: Sequelize.fn('uuid_to_bin', args.gene_id)
							}

						});
				}
				else if (typeof args.ncbi_gene_id != 'undefined') {
					result = await db.getModelByName('Gene').findOne(
						{
							attributes: [[db.getSequelize().fn('bin_to_uuid', db.getSequelize().col('gene_id')), 'gene_id'], 'gene_name', 'ncbi_gene_id', 'authority', 'description', 'organism', 'chromosome', 'locus', 'assays', 'proteins'],
							where: {
								ncbi_gene_id: args.ncbi_gene_id,
								gene_name: Sequelize.where(Sequelize.fn('BINARY', Sequelize.col('gene_name')), args.gene_name)
							}

						});
				}
				else {
					result = await db.getModelByName('Gene').findOne(
						{where: Sequelize.where(Sequelize.fn('BINARY', Sequelize.col('gene_name')), args.gene_name)});
				}
				//db.getModelByName('Gene').findOne({ where: { gene_name: args.gene_name}});
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+cacheFilterName['name'], JSON.stringify(result));
				//console.log("gene result: "+ JSON.stringify(result))
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-7785 get study count of a gene
		async geneStudyCount(_, args, context) {
			var cacheFilterName = {name:''};
			let genQuery = "";
			if (typeof args.gene_id != 'undefined') {
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
				genQuery = "SELECT count(distinct study_id) as total FROM pdc.spectral_count where gene_id = uuid_to_bin('"+ args.gene_id +"')";
			}
			else if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
				genQuery = "SELECT count(distinct study_id) as total FROM pdc.spectral_count where gene_name = '"+ args.gene_name +"'";
			}
			let cacheKey = "geneStudyCount:"+cacheFilterName['name'];
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			logger.info("cached: "+ res)
			if(res === null){
				var result = await db.getSequelize().query(
					genQuery,
					{
						raw: true
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, result[0][0].total);
				return result[0][0].total;
			} else {
				return res;
			}
		},
		//@@@PDC-2614 rearrange geneSpectralCount
		async geneSpectralCount(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/geneSpectralCount").send();
				context['parent']= "geneSpectralCount";
				logger.info("geneSpectralCount is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("geneSpectralCount is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-6860 cache search result
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
			}
			let cacheKey = CacheName.getSummaryPageGeneSummary('GeneSpectralCount')+"pub:"+cacheFilterName['name'];
			context['cacheKey'] = cacheKey;
			logger.info("cacheKey"+cacheKey);
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if(res === null){
				//@@@PDC-2638 enhance aliquotSpectralCount
				//@@@PDC-6285 force case insenetive on gene_name
				let genQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, " +
					" ncbi_gene_id as NCBI_gene_id, authority, description, organism, " +
					" locus, proteins, trim(both '\r' from assays) as assays FROM gene " +
					" where gene_name = :gene_name COLLATE utf8mb4_general_ci";

				var result = await db.getSequelize().query(
					genQuery,
					{
						replacements: { gene_name: args.gene_name },
						model: db.getModelByName('ModelGene')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				return JSON.parse(res);
			}
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
		async aliquotSpectralCount(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/aliquotSpectralCount").send();
				context['parent']= "aliquotSpectralCount";
				logger.info("aliquotSpectralCount is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("aliquotSpectralCount is called from UI with "+ JSON.stringify(args));

			//@@@PDC-2638 enhance aliquotSpectralCount
			context['arguments'] = args;
			//@@@PDC-6860 cache search result
			var cacheFilterName = {name:''};
			if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
			}
			if (typeof args.dataset_alias != 'undefined') {
				cacheFilterName.name +="dataset_alias:("+ args.dataset_alias + ");";
			}
			let cacheKey = CacheName.getSummaryPageGeneSummary('AliquotSpectralCount')+"pub:"+cacheFilterName['name'];
			context['cacheKey'] = cacheKey;
			logger.info("cacheKey"+cacheKey);
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if(res === null){
				//@@@PDC-2638 enhance aliquotSpectralCount
				//@@@PDC-6285 force case insenetive on gene_name
				let aliquotQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, " +
					" ncbi_gene_id as NCBI_gene_id, authority, description, organism, " +
					" locus, proteins, trim(both '\r' from assays) as assays FROM gene " +
					" where gene_name = :gene_name COLLATE utf8mb4_general_ci";

				var result = await db.getSequelize().query(
					aliquotQuery,
					{
						replacements: { gene_name: args.gene_name },
						model: db.getModelByName('ModelGene')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				return JSON.parse(res);
			}
		},
		/**
		 * protein gets one specific gene with all its spectral counts
		 *
		 * @param {string}   protein
		 *
		 * @return {Gene}
		 */
		async protein(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/protein").send();
				context['parent']= "protein";
				logger.info("protein is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("protein is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2642 gene-related apis enhancement
			context['arguments'] = args;
			//@@@PDC-6860 cache search result
			var cacheFilterName = {name:''};
			if (typeof args.protein != 'undefined') {
				cacheFilterName.name +="protein:("+ args.protein + ");";
			}
			let cacheKey = CacheName.getSummaryPageGeneSummary('Protein')+"pub:"+cacheFilterName['name'];
			context['cacheKey'] = cacheKey;
			logger.info("cacheKey"+cacheKey);
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if(res === null){
				let proteinQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, " +
					" ncbi_gene_id as NCBI_gene_id, authority, description, organism, " +
					" locus, proteins, trim(both '\r' from assays) as assays FROM gene " +
					" where proteins like :protein ";

				var result = await db.getSequelize().query(
					proteinQuery,
					{
						replacements: { protein: "%" + args.protein + "%" },
						model: db.getModelByName('ModelGene')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				return JSON.parse(res);
			}
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
				context['parent']= "projectsPerExperimentType";
				logger.info("projectsPerExperimentType is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("projectsPerExperimentType is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3839 get current version of study
			let experimentQuery = "SELECT DISTINCT Study.experiment_type, Project.project_submitter_id, " +
				" Project.name FROM study as Study, project as Project  " +
				" WHERE Project.project_id = Study.project_id and Study.is_latest_version = 1 ";

			let replacements = { };

			//@@@PDC-151 check for undefined rather than empty string
			if (typeof args.experiment_type != 'undefined') {
				experimentQuery += " and Study.experiment_type = :experiment_type ";
				replacements['experiment_type'] = args.experiment_type;
			}

			return db.getSequelize().query(
				experimentQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelExperimentProjects')
				}
			);
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
				context['parent']= "filesCountPerStudy";
				logger.info("filesCountPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesCountPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-270 replace file_submitter_id with file_id
			//@@@PDC-3668 add study_id
			//@@@PDC-3840 get current version of study unless specific id is given
			let isCurrent = true;
			let fileQuery = "SELECT bin_to_uuid(study.study_id) as study_id, study.study_submitter_id as study_submitter_id, " +
				" study.pdc_study_id as pdc_study_id, file.file_type as file_type, file.data_category, " +
				" COUNT(file.file_id) AS files_count FROM file AS file, study AS study, study_file AS sf " +
				" WHERE file.file_id = sf.file_id and study.study_id = sf.study_id ";
			let cacheFilterName = {name:''};
			let replacements = { };
			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and study.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and study.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			//@@@PDC-1355 add uuid parameter to ui APIs
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and study.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and file.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
				cacheFilterName.name +="file_type:("+ args.file_type + ");";
			}
			/*if (typeof args.file_format != 'undefined') {
				fileQuery += " and file.file_format = :file_format ";
				replacements['file_format'] = args.file_format;
				cacheFilterName.name +="file_format:("+ args.file_format + ");";
			}*/
			//@@@PDC-7907 add data_category to filter
			if (typeof args.data_category != 'undefined') {
				fileQuery += " and file.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
				cacheFilterName.name +="data_category:("+ args.data_category + ");";
			}
			if (isCurrent) {
				fileQuery += " and study.is_latest_version = 1 ";
			}
			fileQuery += " GROUP BY sf.study_id, file.file_type, data_category";

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('FileCountPerStudy')+cacheFilterName['name']);
			if(res === null){
				let result = await db.getSequelize().query(
					fileQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelFile')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('FileCountPerStudy')+cacheFilterName['name'], JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-2167 group files by data source
		async uiStudyFilesCountBySource (_, args, context) {
			context['parent']= "uiStudyFilesCountBySource";
			logger.info("uiStudyFilesCountBySource is called with "+ JSON.stringify(args));
			//@@@PDC-3839 get current version of study unless specific id is given
			let isCurrent = true;
			let fileQuery = "SELECT distinct bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, " +
				" s.pdc_study_id, f.data_source "+
				" FROM file f, study s, study_file AS sf " +
				" WHERE f.file_id = sf.file_id and s.study_id = sf.study_id "+
				" and f.data_source is not null ";
			let cacheFilterName = {name:''};
			let replacements = { };
			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (isCurrent) {
				fileQuery += " and s.is_latest_version = 1 ";
			}

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('StudyFilesCountBySource')+cacheFilterName['name']);
			if(res === null){
				let result = await db.getSequelize().query(
					fileQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelStudyFileSource')
					}
				);
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
		async filesPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/filesPerStudy").send();
				context['parent']= "filesPerStudy";
				logger.info("filesPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesPerStudy is called from UI with "+ JSON.stringify(args));
			let fileQuery = "SELECT s.study_submitter_id, s.pdc_study_id, s.submitter_id_name as study_name, " +
				" bin_to_uuid(s.study_id) as study_id, bin_to_uuid(f.file_id) as file_id,"+
				" f.file_type, f.file_name, f.md5sum, f.file_size, f.data_category, "+
				" f.original_file_name as file_submitter_id, f.file_location, f.file_format"+
				" FROM file AS f, study AS s, study_file AS sf"+
				" WHERE f.file_id = sf.file_id and s.study_id = sf.study_id";

			let replacements = { };
			let cacheFilterName = {name:''};

			//@@@PDC-3529 check for current version if not query by id
			let queryById = false;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				fileQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				queryById = true;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				queryById = true;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and f.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
				cacheFilterName.name +="file_type:("+ args.file_type + ");";
			}
			if (typeof args.file_name != 'undefined' && args.file_name.length > 0) {
				let fns = args.file_name.split(";");
				fileQuery += " and f.file_name IN (:fns) ";
				replacements['fns'] = fns;
				cacheFilterName.name +="file_name:("+ args.file_name + ");";
			}
			if (typeof args.file_format != 'undefined') {
				fileQuery += " and f.file_format = :file_format ";
				replacements['file_format'] = args.file_format;
				cacheFilterName.name +="file_format:("+ args.file_format + ");";
			}
			if (typeof args.data_category != 'undefined') {
				fileQuery += " and f.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
				cacheFilterName.name +="data_category:("+ args.data_category + ");";
			}
			if (!queryById) {
				fileQuery += " and s.is_latest_version = 1 ";
			}
			fileQuery += " LIMIT 0, 5000";
			//@@@PDC-6930 add cache
			let cacheKey = "PDCPUB:filesPerStudy:"+cacheFilterName['name'];
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				//logger.info("filesPerStudy not found in cache "+cacheKey);
				let result = await db.getSequelize().query(
					fileQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelStudyFile')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("filesPerStudy found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		//@@@PDC-3935 get legacy file info for download
		uiLegacyFilesPerStudy(_, args, context) {
			context['parent']= "uiLegacyFilesPerStudy";
			logger.info("uiLegacyFilesPerStudy is called from UI with "+ JSON.stringify(args));
			let fileQuery = "SELECT s.study_submitter_id, s.pdc_study_id, s.submitter_id_name as study_name, " +
				" bin_to_uuid(s.study_id) as study_id, bin_to_uuid(f.file_id) as file_id,"+
				" f.file_type, f.file_name, f.md5sum, f.file_size, f.data_category, "+
				" f.original_file_name as file_submitter_id, f.file_location, f.file_format"+
				" FROM legacy_file AS f, legacy_study AS s, legacy_study_file AS sf"+
				" WHERE f.file_id = sf.file_id and s.study_id = sf.study_id ";

			let replacements = { };

			//@@@PDC-3529 check for current version if not query by id
			let queryById = false;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				fileQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				queryById = true;
			}
			if (typeof args.study_submitter_id != 'undefined') {
				fileQuery += " and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				queryById = true;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and f.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
			}
			if (typeof args.file_name != 'undefined' && args.file_name.length > 0) {
				let fns = args.file_name.split(";");
				fileQuery += " and f.file_name IN (:fns) ";
				replacements['fns'] = fns;
			}
			if (typeof args.file_format != 'undefined') {
				fileQuery += " and f.file_format = :file_format ";
				replacements['file_format'] = args.file_format;
			}
			if (typeof args.data_category != 'undefined') {
				fileQuery += " and f.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
			}
			if (!queryById) {
				fileQuery += " and s.is_latest_version = 1 ";
			}
			//fileQuery += " and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			fileQuery += " LIMIT 0, 5000";

			return db.getSequelize().query(
				fileQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelStudyFile')
				}
			);
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
				context['parent']= "projectsPerInstrument";
				logger.info("filesPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("filesPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-632 use id instead of submitter_id
			//@@@PDC-652 new protocol structure
			//@@@PDC-3839 get current version of study
			let protoQuery = "SELECT DISTINCT proto.instrument_model as instrument_model, " +
				" study.project_submitter_id as project_submitter_id " +
				" FROM protocol AS proto, study AS study " +
				" WHERE proto.study_id = study.study_id and study.is_latest_version = 1 ";
			let replacements = { };
			if (typeof args.instrument != 'undefined') {
				protoQuery += " and proto.instrument_model like :instrument ";
				replacements['instrument'] = "%" + args.instrument + "%";
			}
			else {
				protoQuery += " and proto.instrument_model != ''";
			}
			//protoQuery += " and study.project_submitter_id IN ('" + context.value.join("','") + "')";

			return db.getSequelize().query(
				protoQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelProtocol')
				}
			);
		},
		//@@@PDC-218 Portal Statistics API
		pdcDataStats(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/pdcDataStats").send();
				context['parent']= "pdcDataStats";
				logger.info("pdcDataStats is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("pdcDataStats is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1389 get latest statistics
			let dataStatsQuery = "SELECT * from pdc_data_statistics order by updated desc ";
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
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to workflowMetadata:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to workflowMetadata:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/workflowMetadata").send();
				context['parent']= "workflowMetadata";
				logger.info("workflowMetadata is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("workflowMetadata is called from UI with "+ JSON.stringify(args));
			//@@@PDC-3839 get current version of study unless specific id is given
			let isCurrent = true;
			//@@@PDC-3668 add uuids
			let metadataQuery = "SELECT bin_to_uuid(wm.workflow_metadata_id) as workflow_metadata_id, "+
				" bin_to_uuid(wm.study_id) as study_id, bin_to_uuid(wm.protocol_id) as protocol_id, "+
				" wm.workflow_metadata_submitter_id, wm.study_submitter_id, s.pdc_study_id, "+
				" wm.protocol_submitter_id, wm.cptac_study_id, wm.submitter_id_name, wm.study_submitter_name, " +
				" wm.analytical_fraction, wm.experiment_type, wm.instrument, wm.refseq_database_version, "+
				" wm.uniport_database_version, wm.hgnc_version, wm.raw_data_processing, wm.raw_data_conversion, "+
				" wm.sequence_database_search, wm.search_database_parameters, wm.phosphosite_localization, "+
				" wm.ms1_data_analysis, wm.psm_report_generation, wm.cptac_dcc_mzidentml, wm.mzidentml_refseq, "+
				" wm.mzidentml_uniprot, wm.gene_to_prot, wm.cptac_galaxy_workflows, wm.cptac_galaxy_tools, "+
				" wm.cdap_reports, wm.cptac_dcc_tools FROM workflow_metadata wm, study s  "+
				" WHERE wm.study_id = s.study_id ";
			let cacheFilterName = {name:''};
			let replacements = { };
			if (typeof args.workflow_metadata_id != 'undefined') {
				isCurrent = false;
				metadataQuery += " and wm.workflow_metadata_id = uuid_to_bin(:workflow_metadata_id) ";
				replacements['workflow_metadata_id'] = args.workflow_metadata_id;
				cacheFilterName.name +="workflow_metadata_id:("+ args.workflow_metadata_id + ");";
			}
			if (typeof args.workflow_metadata_submitter_id != 'undefined') {
				isCurrent = false;
				metadataQuery += " and wm.workflow_metadata_submitter_id = :workflow_metadata_submitter_id ";
				replacements['workflow_metadata_submitter_id'] = args.workflow_metadata_submitter_id;
				cacheFilterName.name +="workflow_metadata_submitter_id:("+ args.workflow_metadata_submitter_id + ");";
			}
			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				metadataQuery += " and wm.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				metadataQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			//@@@PDC-1355 add uuid parameter to ui APIs
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				metadataQuery += " and wm.study_id = uuid_to_bin(:study_id)";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (isCurrent) {
				metadataQuery += " and s.is_latest_version = 1 ";
			}

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('WorkflowMetadata')+cacheFilterName['name']);
			if(res === null){
				var result = await db.getSequelize().query(
					metadataQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelWorkflowMetadata')
					}
				);
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
			context['parent']= "uiStudy";
			logger.info("uiStudy is called with "+ JSON.stringify(args));
			let comboQuery = "SELECT distinct s.study_submitter_id, s.pdc_study_id, s.submitter_id_name"+
				" FROM study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm,"+
				" demographic dem, diagnosis dia, study_file sf, file f,"+
				" project proj, program prog WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id and proj.project_id = s.project_id"+
				" and c.case_id = dem.case_id and c.case_id = dia.case_id and"+
				" s.study_id = sf.study_id and sf.file_id = f.file_id ";
			//" and proj.program_id = prog.program_id and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			comboQuery += replacementFilters(args, {name: ""}, replacements);

			let result = await db.getSequelize().query(
				comboQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIStudy')
				}
			);
			return result;

		},
		objectSearched(_, args, context) {
			let entry = '';
			for(var i in args) {
				if (args[i] != undefined && args[i].length > 0) {
					entry += i + ':' + args[i] + ';'
				}
			}
			entry = '['+entry+']';
			searchLogger.info(entry);
			return null;
		},
		//@@@PDC-5626 get search usage statistics
		searchStats (obj, args, context){
			let logFile = 'logs/search.log';
			let logError = 'log file not found!';
			let geneMap = new Map();
			let studyMap = new Map();
			let caseMap = new Map();
			let sampleMap = new Map();
			let aliquotMap = new Map();
			let rankingReq = 10;
			if (typeof args.ranking != 'undefined')
				rankingReq = args.ranking;

			if (fs.existsSync(logFile)) {
				let rawData = fs.readFileSync(logFile, 'utf8');
				rawData.split(/\r?\n/).forEach(line =>  {
					if (line.indexOf('[') >= 0) {
						let sData = line.substring(line.indexOf('[')+1, line.indexOf(']')-1);
						let sArray = sData.split(";");
						let sValue = sArray[2].substr(sArray[2].indexOf(':')+1);
						if (sArray[0].indexOf('gene') >= 0) {
							if (geneMap.has(sValue)) {
								geneMap.set(sValue, geneMap.get(sValue)+1);
							}
							else {
								geneMap.set(sValue, 1);
							}

						}
						else if (sArray[0].indexOf('study') >= 0) {
							if (studyMap.has(sValue)) {
								studyMap.set(sValue, studyMap.get(sValue)+1);
							}
							else {
								studyMap.set(sValue, 1);
							}

						}
						else if (sArray[0].indexOf('case') >= 0) {
							if (caseMap.has(sValue)) {
								caseMap.set(sValue, caseMap.get(sValue)+1);
							}
							else {
								caseMap.set(sValue, 1);
							}

						}
						else if (sArray[0].indexOf('sample') >= 0) {
							if (sampleMap.has(sValue)) {
								sampleMap.set(sValue, sampleMap.get(sValue)+1);
							}
							else {
								sampleMap.set(sValue, 1);
							}

						}
						else if (sArray[0].indexOf('aliquot') >= 0) {
							if (aliquotMap.has(sValue)) {
								aliquotMap.set(sValue, aliquotMap.get(sValue)+1);
							}
							else {
								aliquotMap.set(sValue, 1);
							}

						}
						//console.log("Filter Pair: "+ fPair +':'+ fPairMap.get(fPair));
					}
				});
				let geneMapSorted = new Map([...geneMap.entries()].sort((a, b) => b[1] - a[1]));
				let studyMapSorted = new Map([...studyMap.entries()].sort((a, b) => b[1] - a[1]));
				let caseMapSorted = new Map([...caseMap.entries()].sort((a, b) => b[1] - a[1]));
				let sampleMapSorted = new Map([...sampleMap.entries()].sort((a, b) => b[1] - a[1]));
				let aliquotMapSorted = new Map([...aliquotMap.entries()].sort((a, b) => b[1] - a[1]));

				//console.log(mapSort1);
				let result = [];
				const geneIterator = geneMapSorted[Symbol.iterator]();
				const studyIterator = studyMapSorted[Symbol.iterator]();
				const caseIterator = caseMapSorted[Symbol.iterator]();
				const sampleIterator = sampleMapSorted[Symbol.iterator]();
				const aliquotIterator = aliquotMapSorted[Symbol.iterator]();

				let ranking = 0;
				for (const item of geneIterator) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						type: 'gene',
						value: item[0],
						count: item[1]
					};
					result.push(obj);
					ranking++;
				}
				ranking = 0;
				for (const item of studyIterator) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						type: 'study',
						value: item[0],
						count: item[1]
					};
					result.push(obj);
					ranking++;
				}
				ranking = 0;
				for (const item of caseIterator) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						type: 'case',
						value: item[0],
						count: item[1]
					};
					result.push(obj);
					ranking++;
				}
				ranking = 0;
				for (const item of sampleIterator) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						type: 'sample',
						value: item[0],
						count: item[1]
					};
					result.push(obj);
					ranking++;
				}
				ranking = 0;
				for (const item of aliquotIterator) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						type: 'aliquot',
						value: item[0],
						count: item[1]
					};
					result.push(obj);
					ranking++;
				}
				return result;
			}
			else {
				throw new ApolloError(logError);
			}
			return null;

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
			context['parent']= "uiFilters";
			//@@@PDC-4727 log filled filters only
			//@@@PDC-5625 get filter usage statistics
			for(var i in args) {
				if (args[i] != undefined && args[i].length > 0) {
					let filterValue = args[i].split(";");
					filterValue.forEach(element => filterLogger.info("FILTER["+i+":"+element+"]")
					)
				}
			}
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			//Step 1 get base queries
			let fileStudyQuery = queryList.file_study;
			let progProjAlSamCaDemDiaStudyQuery = queryList.prog_proj_al_sam_ca_dem_dia_study;

			let cacheName = { name: "" };
			let replacements = { };

			//Step 2 apply filters on queries
			let studyFilter = applyStudyReplacementFilter(args, cacheName, replacements);
			let projProjFilter = applyProgProjFilter(args, cacheName, replacements);
			let fileFilter = applyFileFilter(args, cacheName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaFilter(args, cacheName, replacements);

			fileStudyQuery += studyFilter;
			fileStudyQuery += fileFilter;

			progProjAlSamCaDemDiaStudyQuery += studyFilter;
			progProjAlSamCaDemDiaStudyQuery += projProjFilter;
			progProjAlSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//Step1 get study_submitter_id on Query1 and Query2
			let fileStudyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);

			let progProjAlSamCaDemDiaStudyResult = await db.getSequelize().query(
				progProjAlSamCaDemDiaStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);

			//Step1 do intersection on Query1 and Query2 to get intersected study array.
			let intersectedStudy = studyIntersection(fileStudyResult, progProjAlSamCaDemDiaStudyResult);

			//Step2 get base queries
			let fileFilterQuery = queryList.file_filter;
			let progProjAlSamCaDemDiaFilterQuery = queryList.prog_proj_al_sam_ca_dem_dia_filter;

			//Step2 apply filters on queries
			fileFilterQuery += studyFilter;
			fileFilterQuery += fileFilter;

			progProjAlSamCaDemDiaFilterQuery += studyFilter;
			progProjAlSamCaDemDiaFilterQuery += projProjFilter;
			progProjAlSamCaDemDiaFilterQuery += alSamCaDemDiaFilter;

			//Step2 get Query1 and Query2 results
			let fileFilterResult = await db.getSequelize().query(
				fileFilterQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterFile')
				}
			);
			let progProjAlSamCaDemDiaFilterResult = await db.getSequelize().query(
				progProjAlSamCaDemDiaFilterQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterProgProjAlSamCaDemDia')
				}
			);

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
			context['parent']= "uiCase";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiCase:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiCase:  "+ JSON.stringify(args));
			}
			else*/
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
			context['parent']= "uiFile";
			logger.info("uiFile is called with "+ JSON.stringify(args));
			let uiFileQuery = "select distinct s.submitter_id_name, f.file_name, "+
				" sf.study_run_metadata_submitter_id ,proj.name as project_name, f.file_type, f.file_size"+
				" from study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm, "+
				" project proj, program prog, study_file sf, file f where alm.study_id=s.study_id "+
				" and al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
				" proj.project_id = s.project_id and proj.program_id = prog.program_id and sf.study_id = s.study_id "+" and sf.file_id = f.file_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			uiFileQuery += replacementFilters(args, { name: "" }, replacements);
			//temporarily limit records to 250
			uiFileQuery += " LIMIT 0, 500";
			return db.getSequelize().query(
				uiFileQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIFile')
				}
			);
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
			context['parent']= "uiProtocol";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiProtocol:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiProtocol:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("uiProtocol is called with "+ JSON.stringify(args));
			//@@@PDC-652 new protocol structure
			//@@@PDC-1154 column name correction: fractions_analyzed_count
			//@@@PDC-6690 add new columns for metabolomics
			//@@@PDC-7235 add new columns for metabolomics
			//@@@PDC-7386 change acquisition_mode to polarity
			let protoQuery = "SELECT distinct bin_to_uuid(prot.protocol_id) as protocol_id, "+
				"prot.protocol_submitter_id, prot.experiment_type, protocol_name, "+
				"protocol_date, document_name, quantitation_strategy, "+
				"label_free_quantitation, labeled_quantitation,  isobaric_labeling_reagent, "+
				"reporter_ion_ms_level, starting_amount, starting_amount_uom, "+
				"digestion_reagent, alkylation_reagent, enrichment_strategy, enrichment, "+
				"chromatography_dimensions_count, 1d_chromatography_type as one_d_chromatography_type, "+
				"2d_chromatography_type as two_d_chromatography_type, "+
				"fractions_analyzed_count, column_type, amount_on_column, "+
				"amount_on_column_uom, column_length, column_length_uom, "+
				"column_inner_diameter, column_inner_diameter_uom, particle_size, "+
				"particle_size_uom, particle_type, gradient_length, "+
				"gradient_length_uom, instrument_make, instrument_model, "+
				"dissociation_type, ms1_resolution, ms2_resolution, "+
				"dda_topn, normalized_collision_energy, acquistion_type, "+
				"dia_multiplexing, dia_ims, analytical_technique, "+
				"chromatography_instrument_make, chromatography_instrument_model, "+
				"trim(both '\r' from polarity) as polarity, "+
				"reconstitution_solvent, reconstitution_volume, reconstitution_volume_uom, "+
				"internal_standards, extraction_method, ionization_mode, auxiliary_data, prot.cud_label "+
				" from study s, project proj, protocol prot "+
				" where prot.study_id = s.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			let cacheFilterName = {name:''};
			//@@@PDC-1355 add uuid parameter to ui APIs
			if (typeof args.study_id != 'undefined') {
				protoQuery += " and s.study_id = uuid_to_bin(:study_id)";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let study = args.study_submitter_id.split(";");
				protoQuery += " and s.study_submitter_id IN (:study)";
				replacements['study'] = study;
				cacheFilterName.name +="study_submitter_id:("+ study.join("','") + ");";
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let studySub = args.pdc_study_id.split(";");
				protoQuery += " and s.pdc_study_id IN (:studySub)";
				replacements['studySub'] = studySub;
				cacheFilterName.name +="pdc_study_id:("+ studySub.join("','") + ");";
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('Protocol')+cacheFilterName['name']);
			if(res === null){
				let result = await db.getSequelize().query(
					protoQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelProtocol')
					}
				);
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
			context['parent']= "uiPublication";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiPublication:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiPublication:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("uiPublication is called with "+ JSON.stringify(args));
			//@@@PDC-3446 new publication data for PDC UI
			//@@@PDC-5768 add group_name
			let pubQuery = "SELECT bin_to_uuid(pub.publication_id) as publication_id, concat('https://www.ncbi.nlm.nih.gov/pubmed/', pub.pubmed_id) as pubmed_id, pub.citation as title, pub.group_name "+
				" from publication pub, study_publication sp, study s "+
				" where pub.publication_id = sp.publication_id and s.study_id = sp.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			let cacheFilterName = {name:''};
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				let study = args.study_submitter_id.split(";");
				pubQuery += " and sp.study_submitter_id IN (:study)";
				replacements['study'] = study;
				cacheFilterName.name +="study_submitter_id:("+ study.join("','") + ");";
			}
			if (typeof args.pdc_study_id != 'undefined') {
				pubQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			//@@@PDC-1355 add uuid parameter to ui APIs
			if (typeof args.study_id != 'undefined') {
				pubQuery += " and sp.study_id = uuid_to_bin(:study_id)";
				replacements['study_id'] = args.study_id;
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageStudySummary('Publication')+cacheFilterName['name']);
			if(res === null){
				logger.info("No cache "+pubQuery);
				let result = await db.getSequelize().query(
					pubQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIPublication')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageStudySummary('Publication')+cacheFilterName['name'], JSON.stringify(result));
				logger.info("No cache result "+result);
				return result;
			}else{
				logger.info("From cache"+res);
				return JSON.parse(res);
			}
		},
		//@@@PDC-3362 handle legacy studies
		uiLegacyStudies(_, args, context) {
			context['parent']= "uiLegacyStudies";
			logger.info("uiLegacyStudies is called with "+ JSON.stringify(args));
			//@@@PDC-3637 add sort_order column
			let legacyQuery = "SELECT bin_to_uuid(study_id) as study_id, study_submitter_id, "+
				"pdc_study_id, project_submitter_id, study_shortname, study_description, submitter_id_name, "+"cptac_phase, analytical_fraction, experiment_type, acquisition_type, embargo_date, sort_order "+
				"FROM legacy_study WHERE study_id is not null ";

			let replacements = { };

			if (typeof args.project_submitter_id != 'undefined' && args.project_submitter_id.length > 0) {
				let projects = args.project_submitter_id.split(";");
				legacyQuery += " and project_submitter_id IN (:projects)";
				replacements['projects'] = projects;
			}
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				legacyQuery += " and study_id = uuid_to_bin(:study_id)";
				replacements['study_id'] = args.study_id;
			}
			//@@@PDC-3805 references for legacy studies
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				legacyQuery += " and study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
			}
			//@@@PDC-3969 filter by PDC study id
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				legacyQuery += " and pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			return db.getSequelize().query(
				legacyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIStudy')
				}
			);

		},
		//@@@PDC-3597 heatmap study api
		getUIHeatmapFilters(_, args, context) {
			context['parent']= "getUIHeatmapFilters";
			logger.info("getUIPublicationFilters is called from UI with "+ JSON.stringify(args));
			return "3";
		},
		async uiHeatmapStudies(_, args, context) {
			context['parent']= "uiHeatmapStudies";
			logger.info("uiHeatmapStudies is called with "+ JSON.stringify(args));
			//logger.info("heatmap studies: "+ getHeatMapStudies());

			//@@@PDC-3723 add sorting
			//@@@PDC-3810 get studies of the current version
			let hmsQuery = "SELECT distinct BIN_TO_UUID(s.study_id) AS study_id, s.study_submitter_id, "+
				"s.pdc_study_id, s.submitter_id_name, "+
				"GROUP_CONCAT(DISTINCT c.disease_type SEPARATOR ';') AS disease_type, "+
				"GROUP_CONCAT(DISTINCT c.primary_site SEPARATOR ';') AS primary_site, "+
				"s.analytical_fraction, s.experiment_type "+
				"FROM study s, aliquot al, aliquot_run_metadata alm, `case` c, "+
				"sample sam WHERE alm.study_id = s.study_id AND al.aliquot_id = alm.aliquot_id "+
				"AND al.sample_id = sam.sample_id AND sam.case_id = c.case_id "+
				"AND s.is_latest_version = 1 "+
				"AND s.study_id IN (UUID_TO_BIN('" + getHeatMapStudies() +"'))";

			let replacements = { };

			if (typeof args.disease_type != 'undefined' && args.disease_type.length > 0) {
				let diseases = args.disease_type.split(";");
				hmsQuery += " and c.disease_type IN (:diseases)";
				replacements['diseases'] = diseases;
			}
			if (typeof args.primary_site != 'undefined' && args.primary_site.length > 0) {
				let sites = args.primary_site.split(";");
				hmsQuery += " and c.primary_site IN (:sites) ";
				replacements['sites'] = sites;
			}
			if (typeof args.analytical_fraction != 'undefined' && args.analytical_fraction.length > 0) {
				let fractions = args.analytical_fraction.split(";");
				hmsQuery += " and s.analytical_fraction IN (:fractions) ";
				replacements['fractions'] = fractions;
			}
			hmsQuery += " GROUP BY study_id"
			if (typeof args.sort != 'undefined' && args.sort.length > 0) {
				hmsQuery += " ORDER BY " + args.sort;
			}
			let result = await db.getSequelize().query(
				hmsQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIStudy')
				}
			);
			result.forEach(element => {
				element.heatmapFiles = getHeatMapStudies(element.study_id);
				//logger.info("heatmap files for: "+ element.study_id + ":"+element.heatmapFiles);
			});
			return result;
		},
		//@@@PDC-329 Pagination for UI study summary page
		//@@@PDC-497 Make table column headers sortable on the browse page tabs
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIStudy (_, args, context) {
			context['parent']= "getPaginatedUIStudy";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to getPaginatedUIStudy:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to getPaginatedUIStudy:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("getPaginatedUIStudy is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN ( :geneSub )";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: {geneSub: geneSub},
						raw: true
					}
				);
				let listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByStudy = " GROUP BY submitter_id_name ";

			// Step 1 get base queries
			let studyCountQuery=queryList.study_tab_count;
			let studyDataQuery=queryList.study_tab_data;
			let fileStudyQuery = queryList.file_study;

			let studyReplacement = { };

			// Step 2 apply filters on queries
			let studyReplacementFilter = applyStudyReplacementFilter(args, cacheFilterName, studyReplacement);
			let projProjReplacementFilter = applyProgProjReplacementFilter(args, cacheFilterName, studyReplacement);
			let fileReplacementFilter = applyFileReplacementFilter(args, cacheFilterName, studyReplacement);
			let alSamCaDemDiaReplacementFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, studyReplacement);

			//console.log("Replacements: " + JSON.stringify(studyReplacement));

			// Step 3 concatenate queries
			studyCountQuery += studyReplacementFilter;
			studyCountQuery += projProjReplacementFilter;
			studyCountQuery += alSamCaDemDiaReplacementFilter;

			studyDataQuery += studyReplacementFilter;
			studyDataQuery += projProjReplacementFilter;
			studyDataQuery += alSamCaDemDiaReplacementFilter;

			fileStudyQuery += studyReplacementFilter;
			fileStudyQuery += fileReplacementFilter;

			//get study from file study subquery
			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: studyReplacement,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, studyReplacement);
			//let studyResultCondition = addStudyInQuery(studyResult);

			//apply study where condition in study query
			studyCountQuery += studyResultCondition;
			studyDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiSortQuery = sort(args, cacheFilterName);

			if(uiSortQuery.length === 0 ){
				//default sort by column
				uiSortQuery = " order by s.pdc_study_id desc ";
			}

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			//@@@PDC-3205 check offset and limit for zero and negative
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined' && !args.getAll) {
				if (args.offset >= 0)
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offset:' + args.offset + ';';
				cacheFilterName['dataFilterName'] += 'limit:' + args.limit + ';';
			}
			else if (args.limit < 0) {
				myLimit = 0;
			}
			let uiComboLimitQuery = " LIMIT " + myOffset+ ", " + myLimit;
			if (args.getAll) {
				context['query'] = studyDataQuery + groupByStudy + uiSortQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyAllData')+cacheFilterName['dataFilterName'];
			}
			else {
				context['query'] = studyDataQuery + groupByStudy + uiSortQuery + uiComboLimitQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyData')+cacheFilterName['dataFilterName'];
			}
			context['replacements'] = studyReplacement;


			//console.log("Query: " + context['query']);
			//console.log("Replacements: " + JSON.stringify(context['replacements']));
			console.log("Cache name: " + context['dataCacheName']);

			if ((myOffset == 0 && paginated) || args.getAll) {
				let res;
				if (args.getAll){
					res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyAllCount')+cacheFilterName.name);
				}
				else {
					res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyTotalCount')+cacheFilterName.name);
				}
				if(res === null){
					let rawData = await db.getSequelize().query(
						studyCountQuery,
						{
							replacements: studyReplacement,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					if (args.getAll){
						RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyAllCount')+cacheFilterName.name, totalCount);
					}
					else {
						RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('StudyTotalCount')+cacheFilterName.name, totalCount);
					}
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
			context['parent']= "getPaginatedUILegacyFile";
			logger.info("getPaginatedUILegacyFile is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			let legacyCacheName = 'Legacy;File;';
			let legacyTotalCacheName = 'Total;Legacy;File;';
			let fileCountQuery= "SELECT COUNT(DISTINCT f.file_id) AS total ";
			let fileBaseQuery= "FROM legacy_study s, legacy_study_file sf, legacy_file f WHERE "+
				" s.study_id = sf.study_id AND sf.file_id = f.file_id ";
			//@@@PDC-3802 get run metadata id from plex_or_folder_name
			//@@@PDC-3909 add data_source to getPaginatedUILegacyFile API
			let fileDataQuery= "SELECT DISTINCT BIN_TO_UUID(f.file_id) AS file_id, "+
				"BIN_TO_UUID(s.study_id) AS study_id, s.pdc_study_id, s.submitter_id_name, s.embargo_date, "+
				"f.file_name, f.plex_or_folder_name AS study_run_metadata_submitter_id, s.project_submitter_id AS project_name, "+
				"f.data_source, f.data_category, f.file_type, f.downloadable, f.md5sum, f.access, "+
				"CAST(f.file_size AS UNSIGNED) AS file_size ";

			let replacements = { };

			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				fileBaseQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
				legacyCacheName += 'Study:'+args.study_id+';';
				legacyTotalCacheName += 'Study:'+args.study_id+';';
			}
			if (typeof args.file_type != 'undefined' && args.file_type.length > 0) {
				fileBaseQuery += " and f.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
				legacyCacheName += 'FileType:'+args.file_type+';';
				legacyTotalCacheName += 'FileType:'+args.file_type+';';
			}
			if (typeof args.data_category != 'undefined' && args.data_category.length > 0) {
				fileBaseQuery += " and f.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
				legacyCacheName += 'DataCategory:'+args.data_category+';';
				legacyTotalCacheName += 'DataCategory:'+args.data_category+';';
			}
			if (typeof args.data_source != 'undefined' && args.data_source.length > 0) {
				fileBaseQuery += " and f.data_source = :data_source ";
				replacements['data_source'] = args.data_source;
				legacyCacheName += 'Datasource:'+args.data_source+';';
				legacyTotalCacheName += 'Datasource:'+args.data_source+';';
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
				legacyCacheName += 'offset:' + args.offset + ';';
				legacyCacheName += 'limit:' + args.limit + ';';
			}
			let uiFileLimitQuery = " LIMIT " + myOffset + ", " + myLimit;

			let uiSortQuery = "";
			if (typeof args.sort != 'undefined' && args.sort.length > 0) {
				uiSortQuery += " order by " +args.sort + " ";
				legacyCacheName += "order_by:("+ args.sort + ");";
			}

			context['dataCacheName'] = legacyCacheName;
			context['query'] = fileDataQuery + fileBaseQuery + uiSortQuery + uiFileLimitQuery;
			context['replacements'] = replacements;

			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(legacyTotalCacheName);
				if (res === null) {
					let rawData = await db.getSequelize().query(
						fileCountQuery + fileBaseQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(legacyTotalCacheName, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				let myJson = [{total: args.limit}];
				return myJson;
			}

		},
		//@@@PDC-6601 Add paginate API for pancancer related files
		//@@@PDC-8075 load pancancer info from cache
		async getPaginatedUIPancancerFiles(_, args, context) {
			context['parent']= "getPaginatedUIFile";
			logger.info("getPaginatedUIFile is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			let replacements = { };

			let fileTotalQuery  = "SELECT count(distinct f.file_id) as total from file f, publication_file pf "+
				"where f.file_id = pf.file_id and pf.publication_id = uuid_to_bin(:publication_id) "+
				"and data_category = 'Publication Supplementary Material'";
			let fileQuery  = "SELECT distinct bin_to_uuid(f.file_id) as file_id, file_name, downloadable, data_category, annotation "+
				"from file f, publication_file pf "+
				"where f.file_id = pf.file_id and pf.publication_id = uuid_to_bin(:publication_id) "+
				"and data_category = 'Publication Supplementary Material'";
			replacements['publication_id'] = args.publication_id;

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
			}
			let uiFileLimitQuery = " LIMIT " + myOffset + ", " + myLimit;

			context['query'] = fileQuery + uiFileLimitQuery;
			context['replacements'] = replacements;

			if (myOffset == 0 && paginated) {
				let cacheKey = "PDCPUB:PaginatedUIPancancerFiles:"+args.publication_id+":total";
				const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
				if (res === null) {
					let rawData = await db.getSequelize().query(
						fileTotalQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(cacheKey, totalCount);
					return [{total: totalCount}];
				}
				else {
					return [{total: res}];
				}
			}
			else {
				let myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-6680 Add API to get all pancancer related files
		//@@@PDC-8075 load pancancer info from cache
		async getAllUIPancancerFiles(_, args, context) {
			context['parent']= "getAllUIPancancerFiles";
			logger.info("getAllUIPancancerFiles is called");
			let fileQuery  = "SELECT bin_to_uuid(f.file_id) as file_id, file_name, downloadable, "+
				"data_category, annotation from file f "+
				"where f.annotation is not null ";

			//let cacheKey = "PDCPUB:AllUIPancancerFiles";
			//const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			//if (res === null) {
			//logger.info("experimentalMetadata not found in cache "+cacheKey);
			let rawData = await db.getSequelize().query(
				fileQuery,
				{
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
			});
			//console.log(JSON.stringify(rawData));
			//RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(rawData));
			return rawData;
			//} else {
			//logger.info("AllUIPancancerFiles found in cache "+cacheKey);
			//return JSON.parse(res);
			//}
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIFile(_, args, context) {
			context['parent']= "getPaginatedUIFile";
			logger.info("getPaginatedUIFile is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			var cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";

				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
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

			let replacements = { };

			//Step1 apply filters on queries
			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			fileCountQuery += studyFilter;
			fileDataQuery += studyFilter;
			alSamCaDemDiaStudyQuery += studyFilter;
			fileCountQuery += projProjFilter;
			fileDataQuery += projProjFilter;
			fileCountQuery += fileFilter;
			fileDataQuery += fileFilter;
			alSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//get study from aliquot sample case demographic diagnosis subquery
			let studyResult = await db.getSequelize().query(
				alSamCaDemDiaStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
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
				cacheFilterName['dataFilterName'] += 'offset:' + args.offset + ';';
				cacheFilterName['dataFilterName'] += 'limit:' + args.limit + ';';
			}
			let uiFileLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;

			context['query'] = fileDataQuery+uiSortQuery+uiFileLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('FileData')+cacheFilterName['dataFilterName'];

			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('FileTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						fileCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						});
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('FileTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				let myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUIClinical(_, args, context) {
			context['parent']= "getPaginatedUIClinical";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to getPaginatedUIClinical:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to getPaginatedUIClinical:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("getPaginatedUIClinical is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;

			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
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

			let replacements = { };

			//Step1 apply filters on queries
			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			clinicalCountQuery += studyFilter;
			clinicalDataQuery += studyFilter;
			fileStudyQuery += studyFilter;
			clinicalCountQuery += projProjFilter;
			clinicalDataQuery += projProjFilter;
			clinicalCountQuery += alSamCaDemDiaFilter;
			clinicalDataQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			//get study from file study subquery
			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
			clinicalCountQuery += studyResultCondition;
			clinicalDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiSortQuery = sort(args, cacheFilterName);

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			//@@@PDC-4994 handle getAll request
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined' && !args.getAll) {
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
			if (args.getAll) {
				context['query'] = clinicalDataQuery+uiSortQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalAllData')+cacheFilterName['dataFilterName'];
			}
			else {
				context['query'] = clinicalDataQuery+uiSortQuery+uiClinicalLimitQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalData')+cacheFilterName['dataFilterName'];
			}
			context['replacements'] = replacements;

			if (args.getAll) {
				logger.info("getPaginatedUIClinicalGetAll: "+ CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalAllCount')+cacheFilterName.name);
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalAllCount')+cacheFilterName.name);
				if(res === null){
					logger.info("getAll Clinicals query: "+ clinicalCountQuery);
					let rawData = await db.getSequelize().query(
						clinicalCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalAllCount'), totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}

			}
			else if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						clinicalCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('ClinicalTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				let myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-1291 Redesign Browse Page data tabs
		async getPaginatedUICase (_, args, context) {
			context['parent']= "getPaginatedUICase";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to getPaginatedUICase:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to getPaginatedUICase:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("getPaginatedUICase is called with "+ JSON.stringify(args));
			//apply global project submitter id filter
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//@@@PDC-671 Add gene name as parameter for data tab api
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
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

			let replacements = { };

			//Step1 apply filters on queries
			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			caseCountQuery += studyFilter;
			caseDataQuery += studyFilter;

			fileStudyQuery += studyFilter;
			caseCountQuery += projProjFilter;
			caseDataQuery += projProjFilter;
			caseCountQuery += alSamCaDemDiaFilter;
			caseDataQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			//get study from file study subquery
			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
			caseCountQuery += studyResultCondition;
			caseDataQuery += studyResultCondition;

			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiSortQuery = sort(args, cacheFilterName);

			let myOffset = 0;
			let myLimit = 100;
			let paginated = false;
			//@@@PDC-4994 handle getAll request
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined' && !args.getAll) {
				if (args.offset >= 0)
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			if (args.getAll) {
				context['query'] = caseDataQuery+uiSortQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseAllData')+cacheFilterName['dataFilterName'];
			}
			else {
				context['query'] = caseDataQuery+uiSortQuery+uiCaseLimitQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseData')+cacheFilterName['dataFilterName'];
			}
			context['replacements'] = replacements;
			if (args.getAll) {
				logger.info("getPaginatedUICaseGetAll: "+ CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseAllCount')+cacheFilterName.name);
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseAllCount')+cacheFilterName.name);
				if(res === null){
					logger.info("getAll cases query: "+ caseCountQuery);
					let rawData = await db.getSequelize().query(
						caseCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseAllCount'), totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}

			}
			else if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						caseCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('CaseTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				let myJson = [{total: args.limit}];
				return myJson;
			}
		},
		//@@@PDC-3009 ataCategoryFileTypeMapping
		async uiDataCategoryFileTypeMapping(_, args, context) {
			context['parent']= "uiDataCategoryFileTypeMapping";
			logger.info("uiDataCategoryFileTypeMapping is called with "+ JSON.stringify(args));
			let DataCategoryFileTypeMapping = "DataCategoryFileTypeMapping";
			const res = await RedisCacheClient.redisCacheGetAsync(DataCategoryFileTypeMapping);
			if(res === null){
				let dataCategoryFileTypeMapping = "select distinct data_category, file_type from pdc.file order by data_category";
				let result = await db.getSequelize().query(dataCategoryFileTypeMapping, { model: db.getModelByName('ModelFile') });
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
			context['parent']= "getPaginatedUIGene";
			logger.info("getPaginatedUIGene is called with "+ JSON.stringify(args));
			//let projectSubmitterIdValue = context.value.join("','")
			//let projectSubmitterIdCondition = ` and s.project_submitter_id IN ('${projectSubmitterIdValue}')`;
			context['arguments'] = args;
			let cacheFilterName = {name:''};

			//Step1 get base queries
			//let fileDataQuery=queryList.file_study + projectSubmitterIdCondition;
			//let progProjAlSamCaDemDiaStudyQuery = queryList.prog_proj_al_sam_ca_dem_dia_study + projectSubmitterIdCondition;
			//@@@PDC-8029 restructure getPaginatedUIGene to improve performance
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
				AND s.is_latest_version = 1
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
					AND s.is_latest_version = 1
			`;

			let replacements = { };

			//Step1 apply filters on queries
			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);
			fileDataQuery += studyFilter;
			progProjAlSamCaDemDiaStudyQuery += studyFilter;
			fileDataQuery += fileFilter;
			progProjAlSamCaDemDiaStudyQuery += projProjFilter;
			progProjAlSamCaDemDiaStudyQuery += alSamCaDemDiaFilter;

			//get study from file study subquery and program project aliquot sample case demographic diagnosis
			let studyResult1 = await db.getSequelize().query(
				fileDataQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResult2 = await db.getSequelize().query(
				progProjAlSamCaDemDiaStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);

			let studyArray = studyIdIntersection(studyResult1, studyResult2);
			let filterValue = studyArray.join("') , UUID_TO_BIN('");

			let studyIdQueryCondition = ` sc.study_id IN (UUID_TO_BIN('${filterValue}')) `;

			//@@@PDC-5056 use gene_id instead of gene_name to join gene and spectral_count
			//@@@PDC-7629 add ncbi_gene_id to output
			/*let geneDataQuery = `
					SELECT DISTINCT
					ge.gene_name, bin_to_uuid(ge.gene_id) as gene_id, ncbi_gene_id, chromosome, locus, proteins
				FROM
					pdc.gene AS ge,
					(select distinct gene_id from pdc.spectral_count AS sc where ${studyIdQueryCondition}  ) sca
				where ge.gene_id = sca.gene_id
			`;*/
			//@@@PDC-8029 restructure gene data query
			//@@@PDC-8220 speed up study count query
			let geneDataQuery = `
					SELECT DISTINCT
					ge.gene_name, bin_to_uuid(ge.gene_id) as gene_id, ncbi_gene_id, chromosome, locus, proteins, num_study
				FROM
					pdc.gene ge, spectral_count sc
					where ge.gene_id = sc.gene_id and ${studyIdQueryCondition}
			`;

			//@@@PDC-4236 add study versioning
			/*let geneStudyCountQuery = `
				SELECT bin_to_uuid(sc.gene_id) as gene_id, COUNT(distinct sc.study_id) AS num_study
				FROM
					pdc.spectral_count AS sc, pdc.study AS s
				WHERE
					sc.study_id = s.study_id and sc.plex_name = 'All' and
					${studyIdQueryCondition}
			`;
			let geneStudyCountQuery = `
				SELECT sc.gene_name, COUNT(distinct sc.study_id) AS num_study
				FROM
					pdc.spectral_count AS sc, pdc.study AS s
				WHERE
					sc.study_id = s.study_id and sc.plex_name = 'All' and s.is_latest_version = 1 and
					${studyIdQueryCondition}
			`;*/

			//@@@PDC-7662 case insensitive search of gene name
			let geneNameSub;
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				geneNameSub = args.gene_name.split(";");
				cacheFilterName.name += "geneNameSub:("+ geneNameSub.join(",") + ")";
				geneDataQuery += " and ge.gene_name IN (:geneNameSub COLLATE utf8mb4_general_ci) ";
				replacements['geneNameSub'] = geneNameSub;
			}

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			let uiSortQuery = sort(args, cacheFilterName);

			if(uiSortQuery.length === 0 ){
				//default sort by column
				uiSortQuery = " order by ge.gene_name ";
			}

			let myOffset = 0;
			let myLimit = 1000;
			let paginated = false;
			//@@@PDC-4994 handle getAll request
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined' && !args.getAll) {
				if (args.offset >= 0)
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiCaseLimitQuery = " LIMIT " + myOffset + ", " + myLimit;
			if (args.getAll) {
				context['query'] = geneDataQuery+uiSortQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneAllData')+cacheFilterName['dataFilterName'];
			}
			else {
				context['query'] = geneDataQuery+uiSortQuery+uiCaseLimitQuery;
				context['dataCacheName'] = CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneData')+cacheFilterName['dataFilterName'];
			}
			//context['geneStudyCountQuery'] = geneStudyCountQuery;
			context['replacements'] = replacements;

			if (typeof geneNameSub != 'undefined' && geneNameSub.length > 0){
				//@@@PDC-7662 case insensitive search of gene name
				let geneNames = {};
				//@@@PDC-7896 count only genes used in studies
				let geneCountQuery = `
				SELECT
					count(distinct ge.gene_id) as total
				FROM
					gene ge, spectral_count sp
				WHERE
					ge.gene_id = sp.gene_id and
					ge.gene_name IN (:geneNameSub COLLATE utf8mb4_general_ci)
				`;

				geneNames['geneNameSub'] = geneNameSub;

				let geneCountResult = await db.getSequelize().query(
					geneCountQuery,
					{
						replacements: geneNames,
						model: db.getModelByName('ModelPagination')
					}
				);
				let totalCount = geneCountResult[0].total;
				logger.info('total gene count: '+geneCountResult[0].total);
				return [{ total: totalCount }];
			}
			else if((myOffset == 0 && paginated) || args.getAll) {
				//gene count query is slow, so cache genes mapping to each study
				let res;
				if (args.getAll) {
					res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneAllCount')+cacheFilterName.name);
				}
				else {
					res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneTotalCount')+cacheFilterName.name);
				}

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

							let studyResult = await db.getSequelize().query(
								studyQuery,
								{
									model: db.getModelByName('ModelUIGeneName')
								}
							);
							studyResult.forEach(element => {

								studyGeneArray.push(element.dataValues.gene_name);
								finalSet.add(element.dataValues.gene_name);} );
							RedisCacheClient.redisCacheSetExAsync(studyCacheName, JSON.stringify(studyGeneArray));
						}else{
							studyGeneArray = JSON.parse(studyGeneListRes);
							studyGeneArray.forEach(element => finalSet.add(element));
						}
						//logger.info("gene count after "+studyName+": "+finalSet.size);
						//studyMap.set(studyName, studyArray);
					}
					var totalCount = finalSet.size;
					logger.info('total gene count: '+finalSet.size);
					//console.timeEnd('gene_cache_study');
					if (args.getAll){
						RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneAllCount')+cacheFilterName.name, totalCount);
					}
					else {
						RedisCacheClient.redisCacheSetExAsync(CacheName.getBrowsePagePaginatedDataTabCacheKey('GeneTotalCount')+cacheFilterName.name, totalCount);
					}
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{ total: args.limit }];
			}
		},
		//@@@PDC-136 pagination
		getPaginatedFiles(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPaginatedFiles").send();
				context['parent']= "getPaginatedFiles";
				logger.info("getPaginatedFiles is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("getPaginatedFiles is called from UI with "+ JSON.stringify(args));
			//@@@PDC-136 pagination
			context['arguments'] = args;
			let fileCountQuery = 'SELECT count(*) as total ';
			//@@@PDC-3668 add study_id
			//@@@PDC-3839 get current version of study unless specific id is given
			let isCurrent = true;
			//@@@PDC-7907 add file_id, data_category and file_format to output
			let fileBaseQuery = 'SELECT bin_to_uuid(study.study_id) as study_id, study.study_submitter_id as study_submitter_id,' +
				' study.pdc_study_id as pdc_study_id, bin_to_uuid(file.file_id) as file_id, file.file_type as file_type, ' +
				' file.downloadable as downloadable, file.file_name as file_name, file.md5sum as md5sum, file.data_category, file.file_format ';
			let fileQuery = 'FROM file AS file, study AS study, study_file AS sf '+
				'WHERE file.file_id = sf.file_id and study.study_id = sf.study_id';

			let replacements = { };

			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and study.study_id = uuid_to_bin(:study_id)";
				replacements['study_id'] = args.study_id;
			}
			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				fileQuery += " and study.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				fileQuery += " and study.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			if (typeof args.file_type != 'undefined') {
				fileQuery += " and file.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
			}
			if (typeof args.file_name != 'undefined') {
				fileQuery += " and file.file_name = :file_name ";
				replacements['file_name'] = args.file_name;
			}
			//@@@PDC-7907 add data_category and file_format to filter
			if (typeof args.data_category != 'undefined') {
				fileQuery += " and file.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
			}
			if (typeof args.file_format != 'undefined') {
				fileQuery += " and file.file_format = :file_format ";
				replacements['file_format'] = args.file_format;
			}
			if (isCurrent) {
				fileQuery += " and study.is_latest_version = 1 ";
			}

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
			}
			var fileLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = fileBaseQuery + fileQuery + fileLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					fileCountQuery + fileQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
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
				context['parent']= "getPaginatedCases";
				logger.info("getPaginatedCases is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("getPaginatedCases is called from UI with "+ JSON.stringify(args));
			//@@@PDC-136 pagination
			context['arguments'] = args;
			let caseCountQuery = "SELECT count(*) as total FROM `case` c ";
			//"WHERE c.project_submitter_id IN ('" + context.value.join("','") + "')";

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
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					caseCountQuery,
					{
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		//@@@PDC-2690 api returns gene info without spectral count
		getPaginatedGenes(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPaginatedGenes").send();
				context['parent']= "getPaginatedGenes";
				logger.info("getPaginatedGenes is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("getPaginatedGenes is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let geneCountQuery = "SELECT count(*) as total FROM gene g ";
			let geneQuery = "SELECT gene_name, bin_to_uuid(gene_id) as gene_id, chromosome, ncbi_gene_id as NCBI_gene_id, " +
				" authority, description, organism, locus, proteins, trim(both '\r' from assays) as assays " +
				" FROM gene g ";

			let replacements = { };

			if (typeof args.gene_name != 'undefined') {
				//@@@PDC-6285 force case insenetive on gene_name
				geneCountQuery += "where gene_name like :gene_name COLLATE utf8mb4_general_ci";
				geneQuery += "where gene_name like :gene_name COLLATE utf8mb4_general_ci";
				replacements['gene_name'] = "%" + args.gene_name + "%";
			}

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
			}
			geneQuery += " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = geneQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					geneCountQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
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
			context['parent']= "uiExperimentBar";
			logger.info("uiExperimentBar is called with "+ JSON.stringify(args));
			//@@@PDC-243 get correct `case` count
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByExperimentType = 'GROUP BY experiment_type';
			let cacheFilterName = { name: '' };
			let fileStudyQuery = queryList.file_study;
			//@@@PDC-6794 use case_id count as case count
			let experimentBarQuery = `
					SELECT
					s.experiment_type,
					COUNT(DISTINCT c.case_id) AS cases_count
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

			let replacements = { };

			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			experimentBarQuery += studyFilter;
			experimentBarQuery += projProjFilter;
			experimentBarQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
			experimentBarQuery += studyResultCondition;
			experimentBarQuery += groupByExperimentType;

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('ExperimentBar')+cacheFilterName.name);
			if ( res === null ){
				let result = await  db.getSequelize().query(
					experimentBarQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIExperiment')
					}
				);
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
			context['parent']= "uiAnalyticalFractionsCount";
			logger.info("uiAnalyticalFractionsCount is called with "+ JSON.stringify(args));
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";

				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByAnalyticalFraction =  " group by s.analytical_fraction";
			let cacheFilterName = { name: '' };
			let fileStudyQuery = queryList.file_study;
			//@@@PDC-6794 use case_id count as case count
			let uiAnalyticalFractionQuery = `
					SELECT DISTINCT
					s.analytical_fraction,
					COUNT(DISTINCT c.case_id) AS cases_count
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

			let replacements = { };

			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			uiAnalyticalFractionQuery += studyFilter;
			uiAnalyticalFractionQuery += projProjFilter;
			uiAnalyticalFractionQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
			uiAnalyticalFractionQuery += studyResultCondition;
			uiAnalyticalFractionQuery += groupByAnalyticalFraction;

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('AnalyticalFraction')+cacheFilterName.name);
			if (res === null) {
				let result = await  db.getSequelize().query(
					uiAnalyticalFractionQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIExperiment')
					}
				);
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
			context['parent']= "uiExperimentPie";
			logger.info("uiExperimentPie is called with "+ JSON.stringify(args));
			//@@@PDC-243 get correct `case` count
			//@@@PDC-616 Add acquisition type to the general filters
			//@@@PDC-581 Add clinical filters
			//@@@PDC-1243 fix case count per primary site
			//@@@PDC-2968 get latest version by default
			if (typeof args.gene_name != 'undefined' && args.gene_name.length > 0) {
				let geneSub = args.gene_name.split(";");
				let uiGeneNameStudyQuery = "select distinct sc.study_submitter_id from spectral_count sc, study s " +
					" where sc.study_id = s.study_id and s.is_latest_version = 1 and ";
				uiGeneNameStudyQuery += " gene_name IN (:geneSub)";
				let geneStudy = await db.getSequelize().query(
					uiGeneNameStudyQuery,
					{
						replacements: { geneSub: geneSub },
						raw: true
					}
				);
				let listStudy = [];
				geneStudy[0].forEach((row) =>listStudy.push(row['study_submitter_id']));
				if(listStudy.length == 0){
					args.study_submitter_id = ' ';
				}else{
					args.study_submitter_id = listStudy.join(";");
				}
			}

			let groupByDiseaseType = " group by disease_type";
			let cacheFilterName = { name: '' };
			let fileStudyQuery = queryList.file_study;
			//@@@PDC-6794 use case_id count as case count
			let experimentPieQuery = `
					SELECT
					c.disease_type,
					COUNT(DISTINCT c.case_id) AS cases_count
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

			let replacements = { };

			let studyFilter = applyStudyReplacementFilter(args, cacheFilterName, replacements);
			let projProjFilter = applyProgProjReplacementFilter(args, cacheFilterName, replacements);
			let fileFilter = applyFileReplacementFilter(args, cacheFilterName, replacements);
			let alSamCaDemDiaFilter = applyAlSamCaDemDiaReplacementFilter(args, cacheFilterName, replacements);

			experimentPieQuery += studyFilter;
			experimentPieQuery += projProjFilter;
			experimentPieQuery += alSamCaDemDiaFilter;
			fileStudyQuery += fileFilter;

			let studyResult = await db.getSequelize().query(
				fileStudyQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelFilterStudy')
				}
			);
			let studyResultCondition = addStudyInReplacementQuery(studyResult, replacements);
			experimentPieQuery += studyResultCondition;
			experimentPieQuery += groupByDiseaseType;

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('ExperimentPie')+cacheFilterName.name);
			if (res === null) {
				let result = await  db.getSequelize().query(
					experimentPieQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIExperiment')
					}
				);
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
			context['parent']= "uiTissueSiteCaseCount";
			logger.info("uiTissueSiteCaseCount is called with "+ JSON.stringify(args));
			//@@@PDC-2968 get case counts of studies of latest version
			//@@@PDC-6794 use case_id count as case count
			let tscQuery = "SELECT d.tissue_or_organ_of_origin, count(distinct d.case_id)" +
				" as cases_count FROM diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm, study s"+
				" where c.case_id = d.case_id and sam.case_id = c.case_id and a.sample_id = sam.sample_id and arm.aliquot_id = a.aliquot_id and arm.study_id = s.study_id and s.is_latest_version = 1 ";
			//"where d.project_submitter_id in ('" + context.value.join("','") + "')";
			tscQuery += " group by d.tissue_or_organ_of_origin";
			return db.getSequelize().query(tscQuery, { model: db.getModelByName('Diagnosis') });
		},
		//@@@PDC-6794 use case_id count as case count
		getUICaseCountPerStudy(_, args, context) {
			let caseCountQuery = "SELECT count(distinct d.case_id) " +
				"as cases_count FROM diagnosis d, `case` c, sample sam, aliquot a, aliquot_run_metadata arm, study s"+
				" where c.case_id = d.case_id and sam.case_id = c.case_id and a.sample_id = sam.sample_id and arm.aliquot_id = a.aliquot_id and arm.study_id = s.study_id and s.is_latest_version = 1 ";

			let replacements = { };

			if (typeof args.study_submitter_id != 'undefined') {
				caseCountQuery += " and s.study_submitter_id = :study_submitter_id ";
				replacements['study_submitter_id'] = args.study_submitter_id;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				caseCountQuery += " and s.pdc_study_id = :pdc_study_id ";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			if (typeof args.study_id != 'undefined') {
				caseCountQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
			}
			return db.getSequelize().query(
				caseCountQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIStudy')
				}
			);
		},
		//@@@PDC-1220 add uiPrimarySiteCaseCount
		//@@@PDC-1243 fix case count per primary site
		//@@@PDC-2020 use major primary site
		async uiPrimarySiteCaseCount (_, args, context) {
			context['parent']= "uiPrimarySiteCaseCount";
			logger.info("uiPrimarySiteCaseCount is called with "+ JSON.stringify(args));
			//@@@PDC-2968 get case counts of studies of latest version
			//@@@PDC-6794 use case_id count as case count
			let pscQuery = "select major_primary_site, count(distinct dia.case_id) as cases_count"+
				" from `case` c,  pdc.diagnosis dia, sample sam, aliquot a, aliquot_run_metadata arm, study s"+
				" where c.case_id = dia.case_id and sam.case_id = c.case_id and a.sample_id = sam.sample_id and arm.aliquot_id = a.aliquot_id and arm.study_id = s.study_id and s.is_latest_version = 1"+
				" group by major_primary_site";
			let cacheFilterName = {name:''};

			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getBrowsePageChartCacheKey('HumanBody'));
			if (res === null) {
				let result = await  db.getSequelize().query(pscQuery, { model: db.getModelByName('ModelHumanBody') });
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
			context['parent']= "uiExperimentFileCount";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiExperimentFileCount:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiExperimentFileCount:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("uiExperimentFileCount is called with "+ JSON.stringify(args));
			//@@@PDC-337 add study name to file count table
			//@@@PDC-3188 get file counts for latest version only
			let efcQuery = "SELECT s.acquisition_type, s.experiment_type, count(distinct f.file_id) as files_count, s.submitter_id_name "+
				" FROM study s, `case` c, sample sam, aliquot al, "+
				" aliquot_run_metadata alm, file f, study_file sf "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id  and "+
				" al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and s.study_id = sf.study_id and sf.file_id = f.file_id and s.is_latest_version = 1 ";

			let replacements = { };

			let cacheFilterName = { name:'' };
			if (typeof args.case_submitter_id != 'undefined') {
				let csIds = args.case_submitter_id.split(';');
				efcQuery += " and c.case_submitter_id IN (:csIds)";
				replacements['csIds'] = csIds;
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
				let result = await db.getSequelize().query(
					efcQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIFileCount')
					}
				);
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
			context['parent']= "uiDataCategoryFileCount";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to uiDataCategoryFileCount:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to uiDataCategoryFileCount:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("uiDataCategoryFileCount is called with "+ JSON.stringify(args));
			//@@@PDC-759 add data_category to file count group
			//@@@PDC-3188 get file counts for latest version only
			let efcQuery = "SELECT f.file_type, f.data_category, count(distinct f.file_id) as files_count, s.submitter_id_name "+
				" FROM study s, `case` c, sample sam, aliquot al, "+
				" aliquot_run_metadata alm, file f, study_file sf "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id  and "+
				" al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and s.study_id = sf.study_id and sf.file_id = f.file_id and s.is_latest_version = 1 ";
			let cacheFilterName = {name:''};

			let replacements = { };

			if (typeof args.case_submitter_id != 'undefined') {
				let csIds = args.case_submitter_id.split(';');
				efcQuery += " and c.case_submitter_id IN (:csIds)";
				replacements['csIds'] = csIds;
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
				let result = await db.getSequelize().query(
					efcQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIFileCount')
					}
				);
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
		async uiGeneStudySpectralCount(_, args, context) {
			context['parent']= "uiGeneStudySpectralCount";
			logger.info("uiGeneStudySpectralCount is called with "+ JSON.stringify(args));
			//@@@PDC-381 get correct counts of plexes and aliquots
			//@@@PDC-3839 get current version of study
			//@@@PDC-8033 restructure query to improve performance
			let gssQuery = "SELECT distinct sc.study_submitter_id, s.submitter_id_name, s.experiment_type "+
				" FROM spectral_count sc, study s "+
				" WHERE sc.study_id = s.study_id and s.is_latest_version = 1 ";

			let replacements = { };

			let cacheFilterName = {name:''};

			if (typeof args.gene_name != 'undefined') {
				cacheFilterName.name +="gene_name:("+ args.gene_name + ");";
				let gene_names = args.gene_name.split(';');
				gssQuery += " and sc.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
			}
			let cacheKey = "PDCUI:uiGeneStudySpectralCount:"+cacheFilterName['name'];
			logger.info("uiGeneStudySpectralCount: "+cacheKey);
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null){
				let result = await db.getSequelize().query(
					gssQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIGeneStudySpectralCount')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				logger.info("uiGeneStudySpectralCount found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		//@@@PDC-333 gene/spectral count API pagination
		//@@@PDC-391 gene/spectral count query change
		//@@@PDC-650 implement elasticache for API
		async getPaginatedUIGeneStudySpectralCount(_, args, context) {
			context['parent']= "getPaginatedUIGeneStudySpectralCount";
			logger.info("getPaginatedUIGeneStudySpectralCount is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			let gssCountQuery = "SELECT count(distinct sc.study_submitter_id) as total ";
			//@@@PDC-381 get correct counts of plexes and aliquots
			let gssBaseQuery = "SELECT sc.study_submitter_id,"+
				" s.submitter_id_name, s.experiment_type, "+
				" sc.spectral_count, sc.distinct_peptide, "+
				" sc.unshared_peptide ";
			//@@@PDC-3079 get latest version of study
			let gssQuery = " FROM spectral_count sc, study s "+
				" WHERE sc.study_id = s.study_id and sc.plex_name = 'All' and s.is_latest_version = 1 ";
			let cacheFilterName = {name:''};
			let replacements = { };
			if (typeof args.gene_id != 'undefined') {
				gssQuery += " and sc.gene_id = uuid_to_bin (:gene_id)";
				replacements['gene_id'] = args.gene_id;
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
			}
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				gssQuery += " and sc.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
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
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let gssLimitQuery = " LIMIT " + myOffset + ", " + myLimit;
			context['query'] = gssBaseQuery+gssQuery + gssLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('StudySpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						gssCountQuery+gssQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-790 allow filters
		async getPaginatedUIGeneStudySpectralCountFiltered(_, args, context) {
			context['parent']= "getPaginatedUIGeneStudySpectralCountFiltered";
			logger.info("getPaginatedUIGeneStudySpectralCountFiltered is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			let gssCountQuery = "SELECT count(distinct sc.study_submitter_id) as total ";
			//@@@PDC-2873 add pdc_study_id
			let gssBaseQuery = "SELECT distinct sc.study_submitter_id,"+
				" s.submitter_id_name, s.experiment_type, s.pdc_study_id, "+
				" sc.spectral_count, sc.distinct_peptide, "+
				" sc.unshared_peptide ";
			//@@@PDC-3079 get latest version of study
			let gssQuery = " FROM spectral_count sc, aliquot_run_metadata arm, "+
				"`case` c, sample sam, aliquot al, study s, "+
				"demographic dem, diagnosis dia, project proj, "+
				"program prog "+
				" WHERE sc.study_id = s.study_id and arm.study_id = s.study_id and al.aliquot_id = arm.aliquot_id "+
				"and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				"and proj.project_id = s.project_id and c.case_id = dem.case_id "+
				"and c.case_id = dia.case_id and proj.program_id = prog.program_id and sc.plex_name = 'All' and s.is_latest_version = 1 ";
			let cacheFilterName = {name:''};

			let replacements = { };

			gssQuery += replacementFilters(args, cacheFilterName, replacements);
			//@@@PDC-7631 use gene_id to study/spectral_count
			if (typeof args.gene_id != 'undefined') {
				gssQuery += " and sc.gene_id = uuid_to_bin(:gene_id)";
				replacements['gene_id'] = args.gene_id;
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
			}
			else if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				gssQuery += " and sc.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}
			cacheFilterName['dataFilterName'] = cacheFilterName.name;
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
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery + gssQuery + gssLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('StudySpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						gssCountQuery + gssQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('StudySpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
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
			context['parent']= "uiGeneAliquotSpectralCount";
			logger.info("uiGeneAliquotSpectralCount is called with "+ JSON.stringify(args));
			//@@@PDC-415 get correct spectral count per aliquot
			let gasQuery = "SELECT arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
				" arm.label, s.submitter_id_name, s.experiment_type, "+
				" sc.spectral_count, sc.distinct_peptide, "+
				" sc.unshared_peptide"+
				" FROM spectral_count sc, aliquot_run_metadata arm, study s "+
				" WHERE sc.study_run_metadata_submitter_id=arm.study_run_metadata_submitter_id "+
				" and sc.study_submitter_id=s.study_submitter_id ";
			let replacements = { };
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				gasQuery += " and sc.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
			}

			gasQuery += " order by sc.dataset_alias, sc.study_run_metadata_submitter_id, s.study_id";
			return db.getSequelize().query(
				gasQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUIGeneStudySpectralCount')
				}
			);

		},
		//@@@PDC-333 gene/spectral count API pagination
		//@@@PDC-650 implement elasticache for API
		async getPaginatedUIGeneAliquotSpectralCount(_, args, context) {
			context['parent']= "getPaginatedUIGeneAliquotSpectralCount";
			logger.info("getPaginatedUIGeneAliquotSpectralCount is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-415 get correct spectral count per aliquot
			let gssCountQuery = "SELECT count(arm.aliquot_submitter_id) as total ";
			//@@@PDC-564 add gene abundance data
			//@@@PDC-669 gene_abundance table change
			let gssBaseQuery = "SELECT arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
				" arm.label, s.submitter_id_name, s.experiment_type, "+
				" sc.spectral_count, sc.distinct_peptide, sc.unshared_peptide,"+
				" sc.unshared_peptide, ga.precursor_area, ga.log2_ratio, ga.unshared_precursor_area, ga.unshared_log2_ratio ";
			//@@@PDC-3079 get latest version of study
			let gssQuery = " FROM spectral_count sc, aliquot_run_metadata arm, study s, gene_abundance ga "+
				" WHERE sc.study_run_metadata_id=arm.study_run_metadata_id "+
				" and ga.study_run_metadata_id = arm.study_run_metadata_id "+
				" and ga.study_id = s.study_id "+
				" and sc.study_id=s.study_id " +
				" and ga.aliquot_submitter_id = arm.aliquot_submitter_id and s.is_latest_version = 1 ";
			let cacheFilterName = { name: '' };
			let replacements = { };
			//@@@PDC-4755 fix named parameter
			//@@@PDC-7631 use gene_id instead of gene_name
			if (typeof args.gene_id != 'undefined') {
				gssQuery += " and sc.gene_id = uuid_to_bin(:gene_id)"+
					" and ga.gene_id = uuid_to_bin(:gene_id)";
				replacements['gene_id'] = args.gene_id;
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
			}
			else if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				//console.log("gene_names:"+gene_names);
				gssQuery += " and sc.gene_name IN (:gene_names)"+
					" and ga.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
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
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let gssLimitQuery = " LIMIT " + myOffset + ", " + myLimit;
			context['query'] = gssBaseQuery + gssQuery + gssLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('AliquotSpectralCount')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCount')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						gssCountQuery + gssQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCount')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-744 get ptm log2_ratio
		async getPaginatedUIGeneAliquotSpectralCountFiltered(_, args, context) {
			context['parent']= "getPaginatedUIGeneAliquotSpectralCountFiltered";
			logger.info("getPaginatedUIGeneAliquotSpectralCountFiltered is called with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3171 new ptm abundance tables
			let ptmTableName = "ptm_abundance";
			//@@PDC-6361 - gene summary page issues - check if first character of gene is number if so then use num table
			if(isNaN(args.gene_name.substr(0, 1))){
				ptmTableName = "ptm_abundance_"+ args.gene_name.substr(0, 1);
			} else {
				ptmTableName = "ptm_abundance_num";
			}



			let generalOpenCountQuery = "SELECT count(*) as total from (";
			let generalCloseCountQuery = ") x";
			//@@@PDC-2873 add pdc_study_id
			let generalSelectQuery = "SELECT distinct arm.aliquot_submitter_id as aliquot_id, sc.dataset_alias as plex, "+
				" arm.label, s.submitter_id_name, s.experiment_type, s.pdc_study_id, "+
				" sc.spectral_count, sc.distinct_peptide,"+
				" sc.unshared_peptide, ";
			let gaSelectQuery = "ga.precursor_area, ga.log2_ratio, ga.unshared_precursor_area, ga.unshared_log2_ratio ";
			//@@@PDC-769 access ptm_abundance
			let paSelectQuery = "'' as precursor_area, pa.log2_ratio, '' as unshared_precursor_area, '' as unshared_log2_ratio ";
			//var paSelectQuery = "'' as precursor_area, '' as log2_ratio, '' as unshared_precursor_area, '' as unshared_log2_ratio ";
			let generalFromQuery = " FROM spectral_count sc, aliquot_run_metadata arm, "+
				"study s, `case` c, sample sam, aliquot al, "+
				"demographic dem, diagnosis dia, project proj, "+
				"program prog";
			let gaFromQuery = ", gene_abundance ga ";
			//@@@PDC-769 access ptm_abundance
			//var paFromQuery = ", ptm_abundance pa ";
			let paFromQuery = ", "+ptmTableName+" pa ";
			//var paFromQuery = '';
			//@@@PDC-3079 get latest version of study
			let generalWhereQuery = " WHERE s.is_latest_version = 1 "+
				" and sc.study_run_metadata_id=arm.study_run_metadata_id "+
				" and sc.study_id=s.study_id " +
				" and arm.study_id = s.study_id and al.aliquot_id = arm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id and c.case_id = dem.case_id "+
				" and c.case_id = dia.case_id and proj.program_id = prog.program_id ";
			let gaWhereQuery = " and ga.study_run_metadata_id = arm.study_run_metadata_id "+
				" and ga.study_id = s.study_id "+
				" and ga.aliquot_submitter_id = arm.aliquot_submitter_id "+
				" and s.analytical_fraction = 'Proteome' ";
			//@@@PDC-769 access ptm_abundance
			let paWhereQuery = " and pa.study_run_metadata_id = arm.study_run_metadata_id "+
				" and pa.study_id = s.study_id "+
				" and pa.aliquot_submitter_id = arm.aliquot_submitter_id "+
				" and s.analytical_fraction != 'Proteome' ";
			//var paWhereQuery = " and s.analytical_fraction != 'Proteome' ";
			let cacheFilterName = {name:''};
			let replacements = { };
			let filterQuery = replacementFilters(args, cacheFilterName, replacements);
			let generalGeneQuery = '', gaGeneQuery = '', paGeneQuery = '';
			//@@@PDC-7631 use gene_id instead of gene_name
			if (typeof args.gene_id != 'undefined') {
				generalGeneQuery = " and sc.gene_id = uuid_to_bin(:gene_id)";
				gaGeneQuery = " and ga.gene_id = uuid_to_bin(:gene_id)";
				paGeneQuery = " and pa.gene_id = uuid_to_bin(:gene_id)";
				replacements['gene_id'] = args.gene_id;
				cacheFilterName.name +="gene_id:("+ args.gene_id + ");";
			}
			else if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				generalGeneQuery = " and sc.gene_name IN (:gene_names)";
				gaGeneQuery = " and ga.gene_name IN (:gene_names)";
				paGeneQuery = " and pa.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
				cacheFilterName.name +="gene_name:("+ gene_names.join(",") + ");";
			}
			let unionQuery = generalSelectQuery+gaSelectQuery+generalFromQuery+
				gaFromQuery+generalWhereQuery+gaWhereQuery+filterQuery+generalGeneQuery+
				gaGeneQuery+" union all "+generalSelectQuery+paSelectQuery+generalFromQuery+
				paFromQuery+generalWhereQuery+paWhereQuery+filterQuery+generalGeneQuery+
				paGeneQuery

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
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
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			var generalLimitQuery = " LIMIT " + myOffset + ", " + myLimit;
			context['query'] = unionQuery + generalLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('AliquotSpectralCountFiltered')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCountFiltered')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						generalOpenCountQuery + unionQuery + generalCloseCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('AliquotSpectralCountTotalCountFiltered')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-485 spectral count per study/aliquot API
		//@@@PDC-3668 add study_id to input/output
		paginatedSpectralCountPerStudyAliquot(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedSpectralCountPerStudyAliquot").send();
				context['parent']= "paginatedSpectralCountPerStudyAliquot";
				logger.info("paginatedSpectralCountPerStudyAliquot is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedSpectralCountPerStudyAliquot is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			let gssCountQuery = "SELECT count(sc.gene_name) as total ";
			let gssBaseQuery = "SELECT bin_to_uuid(s.study_id) as study_id, s.pdc_study_id, sc.study_submitter_id, sc.plex_name as aliquot_id, sc.gene_name, "+
				" sc.dataset_alias as plex, sc.spectral_count, sc.distinct_peptide, "+
				" sc.unshared_peptide";
			let gssQuery = " FROM spectral_count sc, study s WHERE sc.study_id = s.study_id ";
			//"sc.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			if (typeof args.study_submitter_id != 'undefined') {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(';');
				gssQuery += " and sc.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.study_id != 'undefined') {
				isCurrent = false;
				gssQuery += " and s.study_id = uuid_to_bin(:study_id) ";
				replacements['study_id'] = args.study_id;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				let pdc_study_ids = args.pdc_study_id.split(';');
				gssQuery += " and s.pdc_study_id IN (:pdc_study_id)";
				replacements['pdc_study_id'] = args.pdc_study_id;
			}
			if (typeof args.plex_name != 'undefined') {
				let plex_names = args.plex_name.split(';');
				gssQuery += " and sc.plex_name IN (:plex_names)";
				replacements['plex_names'] = plex_names;
			}
			if (typeof args.gene_name != 'undefined') {
				let gene_names = args.gene_name.split(';');
				gssQuery += " and sc.gene_name IN (:gene_names)";
				replacements['gene_names'] = gene_names;
			}
			if (isCurrent) {
				gssQuery += " and s.is_latest_version = 1 ";
			}

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
			}
			let gssLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = gssBaseQuery + gssQuery + gssLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					gssCountQuery + gssQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
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
			context['parent']= "caseSearch";
			//logger.info("SEARCH QUERY to caseSearch: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to caseSearch:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let nameToSearch = 'xxxxxx';
			//@@@PDC-514 escape wildcard characters

			let replacements = { };

			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['nameToSearch'] = "%" + nameToSearch + "%"
			}
			let searchCountQuery = "SELECT count(c.case_submitter_id) as total ";
			let searchBaseQuery = "SELECT c.case_submitter_id as name, bin_to_uuid(c.case_id) as case_id, 'case' as record_type ";
			let searchQuery = " FROM `case` c WHERE c.case_submitter_id like :nameToSearch order by c.case_submitter_id";


			//" AND c.project_submitter_id IN ('" + context.value.join("','") + "')";
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
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: args.limit}];
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
			context['parent']= "geneSearch";
			logger.info("SEARCH QUERY to geneSearch: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to geneSearch:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let nameToSearch = 'xxxxxx';
			let replacements = { };
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['nameToSearch'] = "%" + nameToSearch + "%";
			}
			let searchCountQuery = "SELECT count(g.gene_name) as total ";
			//@@@PDC-398 Add description to the APIs for search
			//@@@PDC-7628 add gene_id and ncbi_gene_id to the APIs for search
			let searchBaseQuery = "SELECT g.gene_name as name, g.description, bin_to_uuid(gene_id) as gene_id, g.ncbi_gene_id, 'gene' as record_type ";
			//@@@PDC-682 make search case insensitive for utf8 char set
			//@@@PDC-6285 adjust gene_name charset/collation
			//@@@PDC-6287 conduct case inseasitive search on gene_name
			let searchQuery = " FROM gene g WHERE g.gene_name like :nameToSearch COLLATE utf8mb4_general_ci OR g.description like :nameToSearch";
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
			}
			let searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery + searchQuery + searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery+searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
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
			context['parent']= "proteinSearch";
			//logger.info("SEARCH QUERY to proteinSearch: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to proteinSearch:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let nameToSearch = 'xxxxxx';
			let replacements = { };
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['nameToSearch'] = "%" + nameToSearch + "%";
			}
			let searchCountQuery = "SELECT count(g.gene_name) as total ";
			//@@@PDC-398 Add description to the APIs for search
			//@@@PDC-468 Add proteins to protein search
			//@@@PDC-7628 add ncbi_gene_id to the APIs for search
			let searchBaseQuery = "SELECT g.gene_name as name, g.description, bin_to_uuid(gene_id) as gene_id, g.ncbi_gene_id, g.proteins, 'protein' as record_type ";
			let searchQuery = " FROM gene g WHERE g.proteins like :nameToSearch";
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
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery + searchQuery + searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: args.limit}];
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
			context['parent']= "studySearch";
			//logger.info("SEARCH QUERY to studySearch: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to studySearch:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let nameToSearch = 'xxxxxx';
			let replacements = { };
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['nameToSearch'] = "%" + nameToSearch + "%";
			}
			//@@@PDC-7463 use submitter_id_name as study_name
			let searchCountQuery = "SELECT count(s.submitter_id_name) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			let searchBaseQuery = "SELECT s.submitter_id_name as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			let searchQuery = " FROM study s WHERE s.is_latest_version = 1 and s.submitter_id_name like :nameToSearch order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
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
			}
			let searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery + searchQuery + searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: args.limit}];
			}
		},
		studySearchByPDCStudyId(_, args, context) {
			context['parent']= "studySearchByPDCStudyId";
			//logger.info("SEARCH QUERY to studySearchByPDCStudyId: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to studySearchByPDCStudyId:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let idToSearch = 'xxxxxx';
			let replacements = { };
			//@@@PDC-514 escape wildcard characters
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				idToSearch = args.pdc_study_id.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['idToSearch'] = "%" + idToSearch + "%";
			}
			//@@@PDC-7463 use submitter_id_name as study_name
			let searchCountQuery = "SELECT count(s.submitter_id_name) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			let searchBaseQuery = "SELECT s.submitter_id_name as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			let searchQuery = " FROM study s WHERE s.is_latest_version = 1 and s.pdc_study_id like :idToSearch order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
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
			}
			let searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-1959 search by external id
		studySearchByExternalId(_, args, context) {
			context['parent']= "studySearchByExternalId";
			//logger.info("SEARCH QUERY to studySearchByExternalId: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to studySearchByExternalId:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let idToSearch = 'xxxxxx';
			let replacements = { };
			if (typeof args.reference_entity_alias != 'undefined' && args.reference_entity_alias.length > 0) {
				idToSearch = args.reference_entity_alias.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['idToSearch'] = "%" + idToSearch + "%";
			}
			//@@@PDC-7463 use submitter_id_name as study_name
			let searchCountQuery = "SELECT count(s.submitter_id_name) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			let searchBaseQuery = "SELECT s.submitter_id_name as name, s.submitter_id_name, s.pdc_study_id, bin_to_uuid(s.study_id) as study_id, s.study_submitter_id, 'study' as record_type ";
			//@@@PDC-2973 get the latest version of study
			let searchQuery = " FROM study s, reference r WHERE s.is_latest_version = 1 and s.study_id = r.entity_id and r.reference_entity_alias like :idToSearch order by s.pdc_study_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
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
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
		aliquotSearch(_, args, context) {
			context['parent']= "aliquotSearch";
			//logger.info("SEARCH QUERY to aliquotSearch: "+ JSON.stringify(args));
			//analyticLog.info("SEARCH QUERY to aliquotSearch:  "+ JSON.stringify(args));
			context['arguments'] = args;
			let nameToSearch = 'xxxxxx';
			let replacements = { };
			//@@@PDC-514 escape wildcard characters
			if (typeof args.name != 'undefined' && args.name.length > 0) {
				nameToSearch = args.name.replace(/%/g, "\\%").replace(/_/g, "\\_");
				replacements['nameToSearch'] = "%" + nameToSearch + "%";
			}
			let searchCountQuery = "SELECT count(a.aliquot_submitter_id) as total ";
			//@@@PDC-372 add submitter_id_name for study type
			let searchBaseQuery = "SELECT bin_to_uuid(a.aliquot_id) as aliquot_id, a.aliquot_submitter_id";
			let searchQuery = " FROM aliquot a WHERE a.aliquot_submitter_id like :nameToSearch order by a.aliquot_submitter_id";
			//" AND s.project_submitter_id IN ('" + context.value.join("','") + "')";
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
			}
			var searchLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = searchBaseQuery+searchQuery+searchLimitQuery;
			context['replacements'] = replacements;
			if (myOffset == 0 && paginated) {
				return db.getSequelize().query(
					searchCountQuery + searchQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
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
		async fileMetadata(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/fileMetadata").send();
				context['parent']= "fileMetadata";
				logger.info("fileMetadata is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("fileMetadata is called from UI with "+ JSON.stringify(args));

			let replacements = { };
			let cacheFilterName = {name:''};

			//@@@PDC-8159 set default limit to 20000
			var myOffset = 0;
			var myLimit = 20000;
			//@@@PDC-8190 get limit from env if configured
			if (typeof process.env.PDC_FILE_META_LIMIT != "undefined") {
				myLimit = process.env.PDC_FILE_META_LIMIT;
			}
			logger.info("fileMetadata limit: "+myLimit);


			var paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0) {
					myOffset = args.offset;
					cacheFilterName.name +="offset:("+ args.offset + ");";
				}
				if (args.limit >= 0 && args.limit <= myLimit) {
					myLimit = args.limit;
					cacheFilterName.name +="limit:("+ args.limit + ");";
				}
				else if (args.limit > myLimit) {
					throw new ApolloError("Limit cannot be over "+myLimit);
				}
				paginated = true;
			}
			//@@@PDC-3529 check for current version
			//@@@PDC-2642 add file_id
			let gasQuery = "select distinct bin_to_uuid(f.file_id) as file_id, f.file_name, f.file_location,"+
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
				" where s.is_latest_version = 1 ";
			//@@@PDC-5642 get non-raw files
			let gas2Query = "select distinct bin_to_uuid(f.file_id) as file_id, f.file_name, f.file_location,"+
				" f.md5sum, f.file_size, f.original_file_name as file_submitter_id, f.data_category, f.file_type ,f.file_format, "+
				" 'N/A', p.instrument_model as instrument, 'N/A',"+
				" f.fraction_number, 'N/A',"+
				" 'N/A',"+
				" 'N/A'"+
				" from file f"+
				" left join study_file sf on f.file_id = sf.file_id"+
				" left join study s on s.study_id = sf.study_id"+
				" left join protocol p on s.study_id = p.study_id"+
				" where sf.study_run_metadata_id is null and s.is_latest_version = 1 ";


			//@@@PDC-884 fileMetadata API search by UUID
			if (typeof args.file_id != 'undefined') {
				gasQuery += " and f.file_id = uuid_to_bin(:file_id)";
				gas2Query += " and f.file_id = uuid_to_bin(:file_id)";
				replacements['file_id'] = args.file_id;
				cacheFilterName.name +="file_id:("+ args.file_id + ");";
			}
			//@@@PDC-898 new public APIs--fileMetadata
			if (typeof args.file_submitter_id != 'undefined') {
				gasQuery += " and f.file_submitter_id = uuid_to_bin(:file_submitter_id)";
				gas2Query += " and f.file_submitter_id = uuid_to_bin(:file_submitter_id)";
				replacements['file_submitter_id'] = args.file_submitter_id;
				cacheFilterName.name +="file_submitter_id:("+ args.file_submitter_id + ");";
			}
			if (typeof args.data_category != 'undefined') {
				gasQuery += " and f.data_category = :data_category ";
				gas2Query += " and f.data_category = :data_category ";
				replacements['data_category'] = args.data_category;
				cacheFilterName.name +="data_category:("+ args.data_category + ");";
			}
			if (typeof args.file_type != 'undefined') {
				gasQuery += " and f.file_type = :file_type ";
				gas2Query += " and f.file_type = :file_type ";
				replacements['file_type'] = args.file_type;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.file_format != 'undefined') {
				gasQuery += " and f.file_format = :file_format ";
				gas2Query += " and f.file_format = :file_format ";
				replacements['file_format'] = args.file_format;
				cacheFilterName.name +="file_type:("+ args.file_type + ");";
			}
			if (typeof args.file_name != 'undefined') {
				//logger.info("file name entered: "+args.file_name);
				let file_names = args.file_name.split(';');
				gasQuery += " and f.file_name IN (:file_names) ";
				gas2Query += " and f.file_name IN (:file_names) ";
				replacements['file_names'] = file_names;
				//@@@PDC-7770 cache name fix
				cacheFilterName.name +="file_names:("+ args.file_name + ");";
			}
			logger.info("file name in cache key: "+cacheFilterName.name);
			var gasLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			//@@@PDC-6930 add cache
			let cacheKey = "PDCPUB:fileMetadata:"+cacheFilterName['name'];
			logger.info("fileMetadata cache key: "+cacheKey);
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				//logger.info("fileMetadata not found in cache "+cacheKey);
				let result = await db.getSequelize().query(
					gasQuery + " union "+ gas2Query + gasLimitQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelFileMetadata')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("fileMetadata found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		//@@@PDC-503 quantitiveDataCPTAC2 API
		//@@@PDC-7440 remove obsolete APIs
		/*quantitiveDataCPTAC2(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantitiveDataCPTAC2").send();
				context['parent']= "quantitiveDataCPTAC2";
				logger.info("quantitiveDataCPTAC2 is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					//throw new ApolloError(duaMsg);
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

			let replacements = { };

			if (typeof args.study_submitter_id != 'undefined') {
				let study_submitter_ids = args.study_submitter_id.split(';');
				quantQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.pdc_study_id != 'undefined') {
				let studies = args.pdc_study_id.split(';');
				quantQuery += " and s.pdc_study_id IN (:studies)";
				replacements['studies'] = studies;
			}
			if (typeof args.experiment_type != 'undefined') {
				let experiment_types = args.experiment_type.split(';');
				quantQuery += " and s.experiment_type IN (:experiment_types)";
				replacements['experiment_types'] = experiment_types;
			}
			let myOffset = 0;
			let myLimit = 500;
			quantQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(
					quantQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelQuantitativeData')
					}
				);
		},*/
		//@@@PDC-474 programs-projects-studies API
		programsProjectsStudies(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/programsProjectsStudies").send();
				context['parent']= "programsProjectsStudies";
				logger.info("programsProjectsStudies is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("programsProjectsStudies is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-652 new protocol structure
			let comboQuery = "SELECT distinct bin_to_uuid(prog.program_id) as program_id, prog.program_submitter_id, prog.name, prog.sponsor, "+
				" prog.start_date, prog.end_date, prog.program_manager "+
				" FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al, project proj, program prog, protocol ptc "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id and ptc.study_id = s.study_id "+
				" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			comboQuery += replacementFilters(args, { name: "" }, replacements);
			return db.getSequelize().query(
				comboQuery,
				{
					replacements: replacements,
					model: db.getModelByName('Program')
				}
			);
		},
		//@@@PDC-472 casesSamplesAliquots API
		//@@@PDC-2335 get ext id from reference
		paginatedCasesSamplesAliquots (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCasesSamplesAliquots").send();
				context['parent']= "paginatedCasesSamplesAliquots";
				logger.info("paginatedCasesSamplesAliquots is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCasesSamplesAliquots is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-2657 reverse 2335
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, c.disease_type, "+
				"c.index_date, c.lost_to_followup, c.primary_site, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al, project proj, program prog "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				" and proj.project_id = s.project_id ";
			//" and proj.program_id = prog.program_id and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			//@@@PDC-5178 case-sample-aliquot across studies
			context['routeQuery'] = uiCaseQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		//@@@PDC-475 caseDiagnosesPerStudy API
		paginatedCaseDiagnosesPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseDiagnosesPerStudy").send();
				context['parent']= "paginatedCaseDiagnosesPerStudy";
				logger.info("paginatedCaseDiagnosesPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseDiagnosesPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		//@@@PDC-473 caseDemographicsPerStudy API
		paginatedCaseDemographicsPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseDemographicsPerStudy").send();
				context['parent']= "paginatedCaseDemographicsPerStudy";
				logger.info("paginatedCaseDemographicsPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseDemographicsPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		//@@@PDC-4547 public apis for new clinbio entities
		paginatedCaseExposuresPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseExposuresPerStudy").send();
				context['parent']= "paginatedCaseExposuresPerStudy";
				logger.info("paginatedCaseExposuresPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseExposuresPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		paginatedCaseFollowUpsPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseFollowUpsPerStudy").send();
				context['parent']= "paginatedCaseFollowUpsPerStudy";
				logger.info("paginatedCaseFollowUpsPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseFollowUpsPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		paginatedCaseFamilyHistoriesPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseFamilyHistoriesPerStudy").send();
				context['parent']= "paginatedCaseFamilyHistoriesPerStudy";
				logger.info("paginatedCaseFamilyHistoriesPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseFamilyHistoriesPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		paginatedCaseTreatmentsPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedCaseTreatmentsPerStudy").send();
				context['parent']= "paginatedCaseTreatmentsPerStudy";
				logger.info("paginatedCaseTreatmentsPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedCaseTreatmentsPerStudy is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let uiCaseCountQuery = "select count(distinct c.case_id) as total ";
			//@@@PDC-4486 new columns for case
			let uiCaseBaseQuery = "SELECT distinct bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, c.disease_type, c.primary_site, "+
				"c.tissue_source_site_code, c.days_to_lost_to_followup, "+
				"c.index_date, c.lost_to_followup, c.consent_type, c.days_to_consent ";
			let uiCaseQuery = "FROM study s, `case` c, sample sam, aliquot_run_metadata alm, "+
				" aliquot al "+
				" WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			uiCaseQuery += replacementFilters(args, { name: "" }, replacements);

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
			}
			let uiCaseLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiCaseBaseQuery + uiCaseQuery + uiCaseLimitQuery;
			context['replacements'] = replacements;
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
					uiCaseCountQuery + uiCaseQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelPagination')
					}
				);
			}
			else {
				return [{total: 0}];
			}
		},
		//@@@PDC-486 data matrix API
		//@@@PDC-562 quant data matrix API
		//@@@PDC-7440 remove obsolete APIs
		/*paginatedDataMatrix (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedDataMatrix").send();
				context['parent']= "paginatedDataMatrix";
				logger.info("paginatedDataMatrix is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					//throw new ApolloError(duaMsg);
			}
			else
				logger.info("paginatedDataMatrix is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			let matrixCountQuery = '';
			let replacements = { };
			switch (args.data_type) {
				case 'spectral_count':
				case 'distinct_peptide':
				case 'unshared_peptide':
					matrixCountQuery = "select count(distinct sc.plex_name) as total" +
					" FROM spectral_count sc"+
					" WHERE sc.study_submitter_id = :study_submitter_id";
					replacements['study_submitter_id'] = args.study_submitter_id;
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
					" WHERE ga.study_submitter_id = :study_submitter_id";
					replacements['study_submitter_id'] = args.study_submitter_id;
					//"' and ga.project_submitter_id IN ('" + context.value.join("','") + "')";
					break;
				case 'log_ratio':
					matrixCountQuery = "select count(distinct pq.aliquot_submitter_id) as total" +
					" FROM phosphosite_quant pq"+
					" WHERE pq.study_submitter_id = '"+ args.study_submitter_id + "'";
					"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')";
					break;
			}

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
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
						matrixCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
			}
			else {
				return [{total: 0}];
			}
		},*/
		//@@@PDC-3640 new pdc metrics api
		getPDCMetrics(_, args, context) {
			logger.info("getPDCMetrics is called with "+ JSON.stringify(args));
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/getPDCMetrics").send();
				context['parent']= "getPDCMetrics";
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			return "pdcMetrics";
		},
		//@@@PDC-3446 API for new publication screen
		getUIPublicationFilters(_, args, context) {
			context['parent']= "getUIPublicationFilters";
			logger.info("getUIPublicationFilters is called from UI with "+ JSON.stringify(args));
			return "3";
		},
		//@@@PDC-6513 API for new pancancer publication page
		//@@@PDC-8075 load pancancer info from cache
		async getUIPancancerPublications(_, args, context) {
			context['parent']= "getUIPancancerPublications";
			let replacements = { };
			let uiPubQuery = "SELECT bin_to_uuid(pub.publication_id) as publication_id,  pub.pubmed_id, pub.group_name, pub.doi, pub.author, pub.title, pub.journal, pub.journal_url, pub.year, pub.abstract, pub.citation from publication pub where group_name = :group_name ";
			replacements['group_name'] = "Pancancer";
			let cacheKey = "PDCPUB:PancancerPublications";
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				let result = await db.getSequelize().query(
					uiPubQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIPublication')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("PancancerPublications found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		//@@@PDC-6708 get pancancer file data
		async pancancerFileMetadata(_, args, context) {
			let fileNameQuery = "";
			let replacements = { };
			let cacheFilterName = {name:''};
			if (typeof args.file_name != 'undefined' && args.file_name.length > 0) {
				fileNameQuery = "and f.file_name = :file_name ";
				replacements['file_name'] = args.file_name;
				cacheFilterName.name +="file_name:("+ args.file_name + ");";
			}

			let fileQuery = "select bin_to_uuid(file_id) as file_id, data_source, data_category, file_type, file_format, "+
				"file_size, file_location, file_name, downloadable from file f "+
				"where data_category = 'Supplementary Data' and annotation is not null "+
				fileNameQuery + " union "+
				"select bin_to_uuid(f.file_id) as file_id, data_source, data_category, file_type, file_format, "+
				"file_size, file_location, file_name, downloadable from file f, publication_file pf, publication p "+
				"where f.file_id = pf.file_id and pf.publication_id = p.publication_id and  "+
				"p.group_name = 'Pancancer' and f.data_category = 'Publication Supplementary Material' "+
				fileNameQuery;
			let cacheKey = "PDCPUB:pancancerFileMetadata:"+cacheFilterName['name'];
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				//logger.info("experimentalMetadata not found in cache "+cacheKey);
				let result = await db.getSequelize().query(
					fileQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelFileMetadata')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("experimentalMetadata found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		async getPaginatedUIPublication (_, args, context) {
			context['parent']= "getPaginatedUIPublication";
			logger.info("getPaginatedUIPublication is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;

			let replacements = { };
			let cacheFilterName = { name:'' };
			cacheFilterName['dataFilterName'] = cacheFilterName.name;

			let uiPubCountQuery = "select count(distinct pub.publication_id) as total ";
			//@@@PDC-5768 add group_name
			let uiPubBaseQuery = "SELECT distinct bin_to_uuid(pub.publication_id) as publication_id, prog.name as program_name, pub.pubmed_id, pub.group_name, pub.doi, pub.author, pub.title, pub.journal, pub.journal_url, pub.year, pub.abstract, pub.citation ";
			let uiPubQuery = "FROM publication pub, study s, `case` c, sample sam, aliquot al, "+
				"aliquot_run_metadata alm, study_publication sp, project proj, program prog "+
				"WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				"and al.sample_id=sam.sample_id and sam.case_id=c.case_id "+
				"and sp.study_id = s.study_id and pub.publication_id = sp.publication_id "+
				"and s.project_id = proj.project_id and proj.program_id = prog.program_id "+
				"and s.is_latest_version = 1 ";

			if (typeof args.disease_type != 'undefined' && args.disease_type.length > 0) {
				let dts = args.disease_type.split(";");
				uiPubQuery += " and c.disease_type IN (:dts)";
				replacements['dts'] = dts;
				cacheFilterName['dataFilterName'] += 'disease_type:'+args.disease_type+';';
			}
			if (typeof args.program != 'undefined' && args.program.length > 0) {
				let pgn = args.program.split(";");
				uiPubQuery += " and prog.name IN (:pgn)";
				replacements['pgn'] = pgn;
				cacheFilterName['dataFilterName'] += 'program:'+args.program+';';
			}
			if (typeof args.year != 'undefined' && args.year.length > 0) {
				let yrs = args.year.split(";");
				uiPubQuery += " and pub.year IN (:yrs)";
				replacements['yrs'] = yrs;
				cacheFilterName['dataFilterName'] += 'year:'+args.year+';';
			}
			//@@@PDC-3697 filter by pubmed_id
			if (typeof args.pubmed_id != 'undefined' && args.pubmed_id > 0) {
				uiPubQuery += " and pub.pubmed_id LIKE :pubmed_id ";
				replacements['pubmed_id'] = "%" + args.pubmed_id + "%";
				cacheFilterName['dataFilterName'] += 'pubmed_id:'+args.pubmed_id+';';
			}
			uiPubQuery += " order by pub.year desc";

			let myOffset = 0;
			let myLimit = 500;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0)
					myOffset = args.offset;
				if (args.limit >= 0)
					myLimit = args.limit;
				else
					myLimit = 0;
				paginated = true;
				cacheFilterName['dataFilterName'] += 'offset:'+args.offset+';';
				cacheFilterName['dataFilterName'] += 'limit:'+args.limit+';';
			}
			let uiPubLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiPubBaseQuery + uiPubQuery + uiPubLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = 'Publication:'+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync('PublicationTotal:'+cacheFilterName['dataFilterName']);
				if(res === null){
					let rawData = await db.getSequelize().query(
						uiPubCountQuery + uiPubQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync('PublicationTotal:'+cacheFilterName['dataFilterName'], totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
			}
		},
		//@@@PDC-5053 handle multiple genes in one call
		async getUIPtmMultiGenes (_, args, context) {
			context['parent']= "getUIPtmMultiGenes";
			/*if (args.source != 'undefined' && args.source === 'search') {
				analyticLog.info("SEARCH QUERY to getUIPtmMultiGenes:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("getUIPtmMultiGenes is called from UI with "+ JSON.stringify(args));

			let uiPtmHeaderQuery = "SELECT distinct pq.gene_name, pq.ptm_type, pq.site, pq.peptide FROM ";
			let uiPtmtrailerQuery = " WHERE pq.gene_name IN (:batch) ";
			let ptmTableName = "ptm_abundance";
			let genes = args.genes.split(";");
			genes.sort();
			let alpha = "";
			let batch = [];
			let result = [];
			let resPerGene = null;
			let replacements = { };
			for (let i = 0; i < genes.length; i++) {
				//@@@PDC-6405 handle numeric gene name
				if(isNaN(genes[i].substr(0, 1))){
					if (genes[i].substr(0, 1) === alpha) {
						batch.push(genes[i]);
					}
					else {
						if (batch.length > 0) {
							ptmTableName = "ptm_abundance_"+alpha;
							let queryPerGene = uiPtmHeaderQuery + ptmTableName + " pq " + uiPtmtrailerQuery;
							replacements['batch'] = batch;
							resPerGene = await db.getSequelize().query(	queryPerGene,
								{
									replacements: replacements,
									model: db.getModelByName('ModelUIPtm')
								}
							);
							if (resPerGene != null && resPerGene.length > 0) {
								result = [...result, ...resPerGene];
							}
						}
						alpha = genes[i].substr(0, 1);
						batch = [];
						batch.push(genes[i]);
					}
				}
				else{
					if (alpha === "num"){
						batch.push(genes[i]);
					}
					else {
						if (batch.length > 0) {
							ptmTableName = "ptm_abundance_num";
							let queryPerGene = uiPtmHeaderQuery + ptmTableName + " pq " + uiPtmtrailerQuery;
							replacements['batch'] = batch;
							resPerGene = await db.getSequelize().query(	queryPerGene,
								{
									replacements: replacements,
									model: db.getModelByName('ModelUIPtm')
								}
							);
							if (resPerGene != null && resPerGene.length > 0) {
								result = [...result, ...resPerGene];
							}
						}
						alpha = "num";
						batch = [];
						batch.push(genes[i]);
					}
				}

			}
			console.log("gene batch: "+ batch);
			if (batch.length > 0) {
				ptmTableName = "ptm_abundance_"+alpha;
				let queryPerGene = uiPtmHeaderQuery + ptmTableName + " pq " + uiPtmtrailerQuery;
				replacements['batch'] = batch;
				resPerGene = await db.getSequelize().query(	queryPerGene,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIPtm')
					}
				);
				if (resPerGene != null && resPerGene.length > 0) {
					result = [...result, ...resPerGene];
				}
			}
			return result;
		},

		//@@@PDC-681 ui ptm data API
		//@@@PDC-7628 use gene_id instead of gene_name
		async getPaginatedUIPtm (_, args, context) {
			context['parent']= "getPaginatedUIPtm";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to getPaginatedUIPtm:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to getPaginatedUIPtm:  "+ JSON.stringify(args));
			}
			else*/
			logger.info("getPaginatedUIPtm is called from UI with CS: "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-3171 new ptm abundance tables
			let ptmTableName = "ptm_abundance";
			if (typeof args.gene_name != 'undefined') {
				//@@PDC-6361 - gene summary page issues - check if first character of gene is number if so then use num table
				if(isNaN(args.gene_name.substr(0, 1))){
					ptmTableName = "ptm_abundance_"+ args.gene_name.substr(0, 1);
				} else {
					ptmTableName = "ptm_abundance_num";
				}
			}

			let uiPtmCountQuery = "select count(distinct pq.ptm_type, pq.site, pq.peptide) as total ";
			let uiPtmBaseQuery = "SELECT distinct pq.ptm_type, pq.site, pq.peptide ";
			//var uiPtmQuery = "FROM ptm_abundance pq"+
			//@@@PDC-6287 case sensitive search
			let uiPtmQuery = "FROM " + ptmTableName + " pq";
			let replacements = null;
			let cacheFilterName = { name:'' };
			if (typeof args.gene_id != 'undefined') {
				uiPtmQuery +=" WHERE pq.gene_id = uuid_to_bin(:gene_id) ";
				replacements = { gene_id: args.gene_id };
				cacheFilterName.name +="gene_id: ("+args.gene_id+");";
			}
			else {
				uiPtmQuery +=" WHERE pq.gene_name = :gene_name ";
				replacements = { gene_name: args.gene_name };
				cacheFilterName.name +="gene_name: ("+args.gene_name+");";
			}
			//"and pq.project_submitter_id IN ('" + context.value.join("','") + "')";

			//let replacements = { gene_name: args.gene_name };
			//let cacheFilterName = { name:'' };
			//cacheFilterName.name +="gene_name: ("+args.gene_name+");";

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
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
			let uiPtmLimitQuery = " LIMIT "+ myOffset+ ", "+ myLimit;
			context['query'] = uiPtmBaseQuery + uiPtmQuery + uiPtmLimitQuery;
			context['replacements'] = replacements;
			context['dataCacheName'] = CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName['dataFilterName'];
			if (myOffset == 0 && paginated) {
				const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name);
				if(res === null){
					let rawData = await db.getSequelize().query(
						uiPtmCountQuery + uiPtmQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelPagination')
						}
					);
					let totalCount = rawData[0].total;
					RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name, totalCount);
					return [{total: totalCount}];
				}else{
					return [{total: res}];
				}
			}
			else {
				return [{total: args.limit}];
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
			context['parent']= "getUIPtmAlphabetically";
			let uiPtmBaseQuery = "SELECT distinct pq.gene_name, pq.ptm_type, pq.site, pq.peptide FROM ";
			let cacheFilterName = {name:'batchPtm'};

			cacheFilterName['dataFilterName'] = cacheFilterName.name;
			cacheFilterName['dataFilterName'] += ':gene:'+args.gene+';';
			console.log("cacheName: "+cacheFilterName.dataFilterName);
			const res = await RedisCacheClient.redisCacheGetAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.dataFilterName);
			if(res === null){
				uiPtmBaseQuery += "ptm_abundance_" + args.gene.toUpperCase() + " pq";
				let result =await db.getSequelize().query(uiPtmBaseQuery, { model: db.getModelByName('ModelUIPtm') });
				RedisCacheClient.redisCacheSetExAsync(CacheName.getSummaryPageGeneSummary('Ptm')+cacheFilterName.name, JSON.stringify(result));
				return result;
			}else{
				return JSON.parse(res);
			}
		},
		//@@@PDC-678 ptm data matrix API
		//@@@PDC-7440 remove obsolete APIs
		/*async paginatedPtmDataMatrix (_, args, context) {
			logger.info("paginatedPtmDataMatrix is called with "+ JSON.stringify(args));
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/paginatedPtmDataMatrix").send();
				context['parent']= "paginatedPtmDataMatrix";
				logger.info("visitor pageview sent for paginatedPtmDataMatrix");
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					//throw new ApolloError(duaMsg);
			}
			context['arguments'] = args;
			let checkPtmQuery = "select study_submitter_id from study s"+
			" where s.study_submitter_id = :study_submitter_id " +
			"' and s.analytical_fraction IN ('Phosphoproteome', 'Glycoproteome')";

			let ptmStudy = await db.getSequelize().query(
					checkPtmQuery,
					{
						replacements: { study_submitter_id: args.study_submitter_id },
						model: db.getModelByName('ModelStudy')
					}
				);
			if (typeof ptmStudy == 'undefined' || ptmStudy == 0 ) {
				logger.info("PTM Not Found: "+JSON.stringify(ptmStudy) );
				context['error'] = "This is not a post translational modification study";
				let noRecord = [{total: 0}];
				return noRecord;
			}
			let matrixCountQuery = "select count(distinct pq.aliquot_submitter_id) as total" +
			" FROM ptm_abundance pq"+
			" WHERE pq.study_submitter_id = :study_submitter_id ";
			//+"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')";

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
			}
			//@@@PDC-2725 pagination enhancement
			//if (myOffset == 0 && paginated) {
			if (paginated) {
				return db.getSequelize().query(
						matrixCountQuery,
						{
							replacements: { study_submitter_id: args.study_submitter_id },
							model: db.getModelByName('ModelPagination')
						}
					);
			}
			else {
				return [{total: 0}];
			}
		},*/
		//@@@PDC-898 new public APIs--study
		async study (_, args, context) {
			context['parent']= "study";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to study:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to study:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/study").send();
				logger.info("study is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("study is called from UI with "+ JSON.stringify(args));
			context['arguments'] = args;
			//@@@PDC-2615 add embargo_date
			let studyBaseQuery = "SELECT bin_to_uuid(s.study_id) as study_id,"+
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
			//@@@PDC-6794 use case_id count as case count
			//@@@PDC-8027 move case/aliquot count to subquery
			//let studyCaseAliquotQuery = "SELECT count(distinct c.case_id) as cases_count, "+
			//" count(distinct al.aliquot_id) as aliquots_count ";

			let studyHeadWrapQuery =
				`select study_id, study_submitter_id, pdc_study_id, study_name, study_shortname, embargo_date, program_id, program_name, project_id, project_name, GROUP_CONCAT(distinct disease_type SEPARATOR ';') as disease_type,
				GROUP_CONCAT(distinct primary_site SEPARATOR ';') as primary_site, analytical_fraction, experiment_type FROM	(`;

			let studyTailWrapQuery =
				`) AS studytable GROUP BY study_name`;

			let studyQuery = " FROM study s, `case` c, sample sam, aliquot al, aliquot_run_metadata alm,"+
				" demographic dem, diagnosis dia, study_file sf, file f,"+
				" project proj, program prog WHERE alm.study_id = s.study_id and al.aliquot_id = alm.aliquot_id "+
				" and al.sample_id=sam.sample_id and sam.case_id=c.case_id and proj.project_id = s.project_id"+
				" and c.case_id = dem.case_id and c.case_id = dia.case_id and"+
				" s.study_id = sf.study_id and sf.file_id = f.file_id"+
				" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				isCurrent = false;
				let studySub = args.study_id.split(";");
				studyQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(";");
				studyQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let pdc_study_ids = args.pdc_study_id.split(";");
				studyQuery += " and s.pdc_study_id IN (:pdc_study_ids)";
				replacements['pdc_study_ids'] = pdc_study_ids;
			}
			if (isCurrent) {
				studyQuery += " and s.is_latest_version = 1 ";
			}

			let studyGroupQuery = ") group by s.submitter_id_name, c.disease_type";

			//@@@PDC-5178 case-sample-aliquot across studies
			context['replacements'] = replacements;
			let studies = await db.getSequelize().query(
				studyHeadWrapQuery + studyBaseQuery + studyQuery + studyGroupQuery + studyTailWrapQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelStudyPublic')
				}
			);

			/*let caCounts = null, caCountQuery = null;
			for (let i = 0; i < studies.length; i++) {
				caCountQuery = studyCaseAliquotQuery + studyQuery + " and s.submitter_id_name = '"+
				studies[i].study_name + "'";
				caCounts = await db.getSequelize().query(
						caCountQuery,
						{
							replacements: replacements,
							model: db.getModelByName('ModelUICount')
						}
					);
				studies[i].cases_count = caCounts[0].cases_count;
				studies[i].aliquots_count = caCounts[0].aliquots_count;
			}*/
			return studies;
		},
		//@@@PDC-5048 data stats per program
		async dataStatsPerProgram(_, args, context) {
			context['parent']= "dataStatsPerProgram";
			let programs = await db.getModelByName('Program').findAll({
				attributes: [['bin_to_uuid(program_id)', 'program_id'],
					'program_submitter_id',
					'name'
				]
			});
			for (let i = 0; i < programs.length; i++) {
				let projQuery = "SELECT count(*) as projects FROM project where program_id = uuid_to_bin('"+programs[i].program_id+"')";
				var resultProj = await db.getSequelize().query(projQuery, { raw: true });
				programs[i].project_count = parseInt(resultProj[0][0].projects);
				let studyQuery = "SELECT count(*) as studies FROM study s, project p " +
					"where s.project_id = p.project_id and program_id = uuid_to_bin('"+
					programs[i].program_id+"') and s.is_latest_version = 1";
				var resultStudy = await db.getSequelize().query(studyQuery, { raw: true });
				programs[i].study_count = parseInt(resultStudy[0][0].studies);
				let sizeQuery = "SELECT count(*) as file_count, round(((sum(file_size))/POWER(1024,4)), 0) as file_size "+
					"FROM pdc.file f , project p, study_file sf, study s where s.project_id = p.project_id "+
					"and s.study_id = sf.study_id and sf.file_id = f.file_id and program_id = uuid_to_bin('"+
					programs[i].program_id+"') and s.is_latest_version = 1";
				var resultSize = await db.getSequelize().query(sizeQuery, { raw: true });
				programs[i].data_size_TB = parseInt(resultSize[0][0].file_size);
				programs[i].data_file_count = parseInt(resultSize[0][0].file_count);
			}
			return programs
		},
		//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id
		//@@@PDC-1467 add case_submitter_id
		//@@@PDC-4569 remove is_ffpe and oct_embedded
		sample(_, args, context) {
			context['parent']= "sample";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to sample:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to sample:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/sample").send();
				logger.info("sample is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("sample is called from UI with "+ JSON.stringify(args));
			var sampleQuery = "select bin_to_uuid(sample_id) as sample_id, status, sample_is_ref, "+
				"sample_submitter_id, sample_type, sample_type_id, gdc_sample_id, gdc_project_id, "+
				"biospecimen_anatomic_site, composition, current_weight, days_to_collection, "+
				"days_to_sample_procurement, diagnosis_pathologically_confirmed, freezing_method, "+
				"initial_weight, intermediate_dimension, longest_dimension, "+
				"method_of_sample_procurement, pathology_report_uuid, preservation_method, "+
				"time_between_clamping_and_freezing, time_between_excision_and_freezing, "+
				"shortest_dimension, tissue_type, tumor_code, tumor_code_id, tumor_descriptor, "+
				"biospecimen_laterality, catalog_reference, distance_normal_to_tumor, distributor_reference, "+
				"growth_rate, passage_count, sample_ordinal, tissue_collection_type, case_submitter_id from sample ";

			let replacements = { };

			if (typeof args.sample_id != 'undefined'){
				let uuIds = args.sample_id.split(';');
				sampleQuery += "where sample_id in (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";
			}
			else if (typeof args.sample_submitter_id != 'undefined'){
				let subIds = args.sample_submitter_id.split(';');
				sampleQuery += "where sample_submitter_id in (:subIds)";
				replacements['subIds'] = subIds;
			}
			sampleQuery += " order by case_submitter_id";
			return db.getSequelize().query(
				sampleQuery,
				{
					replacements: replacements,
					model: db.getModelByName('Sample')
				}
			);

		},
		//@@@PDC-1376 add sample and aliquot APIs to search by uuid/submitter_id
		//@@@PDC-1467 add case_submitter_id
		aliquot(_, args, context) {
			context['parent']= "aliquot";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to aliquot:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to aliquot:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/aliquot").send();

				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("aliquot is called from UI with "+ JSON.stringify(args));
			let fileName = '86.21%_RC229872+13.80%_RA226166A.txt'
			console.log("Encoded: "+encodeURIComponent(fileName));
			let aliquotQuery = "select bin_to_uuid(aliquot_id) as aliquot_id, aliquot_submitter_id, "+
				"analyte_type, aliquot_quantity, aliquot_volume, amount, concentration, al.status, "+
				"aliquot_is_ref, sam.case_submitter_id from aliquot al, sample sam "+
				"where al.sample_id = sam.sample_id ";

			let replacements = { };

			if (typeof args.aliquot_id != 'undefined'){
				let uuIds = args.aliquot_id.split(';');
				aliquotQuery += "and aliquot_id in (uuid_to_bin('" + uuIds.join("'),uuid_to_bin('") + "'))";
			}
			else if (typeof args.aliquot_submitter_id != 'undefined'){
				let aliquot_submitter_ids = args.aliquot_submitter_id.split(';');
				aliquotQuery += "and aliquot_submitter_id in (:aliquot_submitter_ids)";
				replacements['aliquot_submitter_ids'] = aliquot_submitter_ids;
			}
			aliquotQuery += " order by sam.case_submitter_id";
			return db.getSequelize().query(
				aliquotQuery,
				{
					replacements: replacements,
					model: db.getModelByName('Aliquot')
				}
			);
		},
		//@@@PDC-898 new public APIs--protocolPerStudy
		//@@@PDC-6690 add new columns for metabolomics
		//@@@PDC-7235 add new columns for metabolomics
		protocolPerStudy (_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/protocolPerStudy").send();
				context['parent']= "protocolPerStudy";
				logger.info("protocolPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("protocolPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1154 column name correction: fractions_analyzed_count
			//@@@PDC-1251 remove duplicates
			//@@@PDC-7386 change acquisition_mode to polarity
			let protoQuery = "SELECT distinct bin_to_uuid(prot.protocol_id) as protocol_id, "+
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
				"dia_multiplexing, dia_ims, analytical_technique, "+
				"chromatography_instrument_make, chromatography_instrument_model, "+
				"trim(both '\r' from polarity) as polarity, "+
				"reconstitution_solvent, reconstitution_volume, reconstitution_volume_uom, "+
				"internal_standards, extraction_method, ionization_mode, auxiliary_data, prot.cud_label "+
				" from study s, program prog, project proj, protocol prot "+
				" where prot.study_id = s.study_id and s.project_id = proj.project_id "+
				" and proj.program_id = prog.program_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				isCurrent = false;
				let study_ids = args.study_id.split(";");
				protoQuery += " and s.study_id IN (uuid_to_bin('" + study_ids.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(";");
				protoQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let pdc_study_ids = args.pdc_study_id.split(";");
				protoQuery += " and s.pdc_study_id IN (:pdc_study_ids)";
				replacements['pdc_study_ids'] = pdc_study_ids;
			}
			if (isCurrent) {
				protoQuery += " and s.is_latest_version = 1 ";
			}
			return db.getSequelize().query(
				protoQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelProtocol')
				}
			);
		},
		//@@@PDC-898 new public APIs--clinicalPerStudy
		//@@@PDC-1599 add all demographic and diagnosis data
		//@@@PDC-2417 Remove unused fields from Diagnosis
		//@@@PDC-2335 get ext id from reference
		//@@@PDC-2657 reverse 2335
		//@@@PDC-3428 add tumor_largest_dimension_diameter
		//@@@PDC-4391 add new columns
		//@@@PDC-5205 add auxiliary_data and tumor_cell_content
		//@@@PDC-5647 return N/A if null
		async clinicalPerStudy(_, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/clinicalPerStudy").send();
				context['parent']= "clinicalPerStudy";
				logger.info("clinicalPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("clinicalPerStudy is called from UI with "+ JSON.stringify(args));
			let clinicalQuery = "select distinct bin_to_uuid(c.case_id) as case_id, "+
				"c.case_submitter_id, c.status, c.disease_type, c.consent_type, c.consent_type, c.days_to_consent, "+
				"c.primary_site, bin_to_uuid(dem.demographic_id) as demographic_id, "+
				"dem.demographic_submitter_id, dem.ethnicity, dem.gender, dem.race, "+
				"dem.cause_of_death, dem.days_to_birth, dem.days_to_death, dem.vital_status, "+
				"dem.year_of_birth, dem.year_of_death, 	dem.age_at_index, dem.premature_at_birth, "+
				"dem.weeks_gestation_at_birth, dem.age_is_obfuscated, dem.cause_of_death_source, "+
				"dem.occupation_duration_years, dem.country_of_residence_at_enrollment, "+
				"bin_to_uuid(dia.diagnosis_id) as diagnosis_id, dia.diagnosis_submitter_id, "+
				"dia.morphology, dia.primary_diagnosis, dia.site_of_resection_or_biopsy, "+
				"dia.tissue_or_organ_of_origin, dia.tumor_grade, dia.tumor_stage, "+
				"dia.age_at_diagnosis, dia.classification_of_tumor, "+
				"IFNULL(dia.days_to_last_follow_up, 'N/A') as days_to_last_follow_up, "+
				"IFNULL(dia.days_to_last_known_disease_status, 'N/A') as days_to_last_known_disease_status, "+"IFNULL(dia.days_to_recurrence, 'N/A') as days_to_recurrence,"+
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
				"dia.residual_disease, dia.vascular_invasion_present, dia.year_of_diagnosis, "+
				"dia.anaplasia_present, dia.anaplasia_present_type, dia.child_pugh_classification, "+
				"dia.cog_liver_stage, dia.cog_neuroblastoma_risk_group, dia.cog_renal_stage, "+
				"dia.cog_rhabdomyosarcoma_risk_group, dia.enneking_msts_grade, dia.enneking_msts_metastasis, "+
				"dia.enneking_msts_stage, dia.enneking_msts_tumor_site, dia.esophageal_columnar_dysplasia_degree, "+ "dia.esophageal_columnar_metaplasia_present, dia.first_symptom_prior_to_diagnosis, "+
				"dia.gastric_esophageal_junction_involvement, dia.goblet_cells_columnar_mucosa_present, "+
				"dia.gross_tumor_weight, dia.inpc_grade, dia.inpc_histologic_group, dia.inrg_stage, dia.inss_stage,"+
				"dia.irs_group, dia.irs_stage, dia.ishak_fibrosis_score, dia.lymph_nodes_tested, "+
				"dia.medulloblastoma_molecular_classification, dia.metastasis_at_diagnosis, "+
				"dia.metastasis_at_diagnosis_site, dia.mitosis_karyorrhexis_index, "+
				"dia.peripancreatic_lymph_nodes_positive, dia.peripancreatic_lymph_nodes_tested, "+
				"dia.supratentorial_localization, dia.tumor_confined_to_organ_of_origin, dia.tumor_focality, "+
				"dia.tumor_regression_grade, dia.vascular_invasion_type, dia.wilms_tumor_histologic_subtype, "+
				"dia.breslow_thickness, dia.gleason_grade_group, dia.igcccg_stage, "+
				"dia.international_prognostic_index, dia.largest_extrapelvic_peritoneal_focus, dia.masaoka_stage, "+ "dia.non_nodal_regional_disease, dia.non_nodal_tumor_deposits, dia.ovarian_specimen_status, "+
				"dia.ovarian_surface_involvement, dia.percent_tumor_invasion, "+
				"dia.peritoneal_fluid_cytological_status, dia.primary_gleason_grade, dia.secondary_gleason_grade, "+ "dia.weiss_assessment_score, dia.adrenal_hormone, dia.ann_arbor_b_symptoms_described, "+
				"dia.diagnosis_is_primary_disease, dia.eln_risk_classification, dia.figo_staging_edition_year, "+
				"dia.gleason_grade_tertiary, dia.gleason_patterns_percent, dia.margin_distance, "+
				"dia.margins_involved_site, dia.pregnant_at_diagnosis, dia.satellite_nodule_present, "+
				"dia.sites_of_involvement, dia.tumor_depth, dia.who_cns_grade, dia.who_nte_grade, dia.diagnosis_uuid, "+
				"dia.auxiliary_data, dia.tumor_cell_content "+
				"FROM study s, `case` c, demographic dem, diagnosis dia, "+
				"sample sam, aliquot al, aliquot_run_metadata alm "+
				"where alm.study_id=s.study_id and al.aliquot_id= alm.aliquot_id "+
				"and al.sample_id=sam.sample_id and sam.case_id=c.case_id and "+
				"c.case_id = dem.case_id and c.case_id=dia.case_id ";
			let replacements = { };
			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			let cacheFilterName = {name:''};

			//@@@PDC-3529 check for current version if not query by id
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				isCurrent = false;
				let studySub = args.study_id.split(";");
				clinicalQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
				cacheFilterName.name +="study_id:("+ args.study_id + ");";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(";");
				clinicalQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
				cacheFilterName.name +="study_submitter_id:("+ args.study_submitter_id + ");";
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let pdc_study_ids = args.pdc_study_id.split(";");
				clinicalQuery += " and s.pdc_study_id IN (:pdc_study_ids)";
				replacements['pdc_study_ids'] = pdc_study_ids;
				cacheFilterName.name +="pdc_study_id:("+ args.pdc_study_id + ");";
			}
			if (isCurrent) {
				clinicalQuery += " and s.is_latest_version = 1 ";
			}

			let myOffset = 0;
			let myLimit = 1000;
			let paginated = false;
			if (typeof args.offset != 'undefined' && typeof args.limit != 'undefined') {
				if (args.offset >= 0) {
					myOffset = args.offset;
					cacheFilterName.name +="offset:("+ args.offset + ");";
				}
				if (args.limit >= 0) {
					myLimit = args.limit;
					cacheFilterName.name +="limit:("+ args.limit + ");";
				}
				else
					myLimit = 0;
				paginated = true;
			}
			clinicalQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			//@@@PDC-6930 add cache
			let cacheKey = "PDCPUB:filesPerStudy:"+cacheFilterName['name'];
			const res = await RedisCacheClient.redisCacheGetAsync(cacheKey);
			if (res === null) {
				//logger.info("filesPerStudy not found in cache "+cacheKey);
				let result = await db.getSequelize().query(
					clinicalQuery,
					{
						replacements: replacements,
						model: db.getModelByName('ModelUIClinical')
					}
				);
				RedisCacheClient.redisCacheSetExAsync(cacheKey, JSON.stringify(result));
				return result;
			} else {
				//logger.info("filesPerStudy found in cache "+cacheKey);
				return JSON.parse(res);
			}
		},
		//@@@PDC-898 new public APIs--biospecimenPerStudy
		//@@@PDC-1156 add is_ref
		//@@@PDC-1396 add external_case_id
		biospecimenPerStudy(_, args, context) {
			context['parent']= "biospecimenPerStudy";
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to biospecimenPerStudy:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to biospecimenPerStudy:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/biospecimenPerStudy").send();
				logger.info("biospecimenPerStudy is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("biospecimenPerStudy is called from UI with "+ JSON.stringify(args));
			//@@@PDC-1127 add pool and taxon
			//@@@PDC-2335 get ext id from reference
			//@@@PDC-2657 reverse 2335
			//@@@PDC-4968 expose case_is_ref
			let biospecimenQuery = "SELECT distinct bin_to_uuid(al.aliquot_id) as aliquot_id, "+
				" bin_to_uuid(sam.sample_id) as sample_id, al.aliquot_submitter_id, al.aliquot_is_ref, "+
				" al.status as aliquot_status, sam.sample_submitter_id, "+
				" c.status as case_status, sam.status as sample_status, "+
				" bin_to_uuid(c.case_id) as case_id, c.case_submitter_id, "+
				" proj.name as project_name, sam.sample_type, c.disease_type, c.primary_site, "+
				" al.pool, c.taxon, c.case_is_ref "+
				" from study s, `case` c, sample sam, aliquot al,"+
				" aliquot_run_metadata alm, project proj "+
				" where alm.study_id=s.study_id and "+
				" al.aliquot_id= alm.aliquot_id and al.sample_id=sam.sample_id and sam.case_id=c.case_id"+
				" and proj.project_id = s.project_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";
			let replacements = { };
			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				isCurrent = false;
				let studySub = args.study_id.split(";");
				biospecimenQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(";");
				biospecimenQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let pdc_study_ids = args.pdc_study_id.split(";");
				biospecimenQuery += " and s.pdc_study_id IN (:pdc_study_ids)";
				replacements['pdc_study_ids'] = pdc_study_ids;
			}
			if (isCurrent) {
				biospecimenQuery += " and s.is_latest_version = 1 ";
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
			}
			biospecimenQuery +=" LIMIT "+ myOffset+ ", "+ myLimit;
			return db.getSequelize().query(
				biospecimenQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelUICase')
				}
			);
		},
		//@@@PDC-898 new public APIs--studyExperimentalDesign
		//@@@PDC-1120 StudyRunMetadata table change
		//@@@PDC-1156 add is_ref
		//@@@PDC-1316 remove itraq_120
		//@@@PDC-1383 convert labels to aliquot_id
		//@@@PDC-2237 sort data by plex_dataset_name
		//@@@PDC-2336 get fraction count from protocol table
		//@@@PDC-2391 order by Study Run Metadata Submitter ID
		//@@@PDC-3847 get aliquot info per label
		studyExperimentalDesign(_, args, context) {
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to studyExperimentalDesign:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to studyExperimentalDesign:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/studyExperimentalDesign").send();
				context['parent']= "studyExperimentalDesign";
				logger.info("studyExperimentalDesign is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("studyExperimentalDesign is called from UI with "+ JSON.stringify(args));

			//@@@PDC-5290 add experiment types of TMT16 and TMT18
			//@@@PDC-6691 add acquisition_mode
			//@@@PDC-7386 change acquisition_mode to polarity
			let experimentalQuery = "SELECT distinct bin_to_uuid(srm.study_run_metadata_id) as study_run_metadata_id, "+
				" bin_to_uuid(s.study_id) as study_id, srm.study_run_metadata_submitter_id,"+
				" s.study_submitter_id, s.pdc_study_id, "+
				" srm.analyte, s.acquisition_type, s.experiment_type,"+
				" srm.folder_name as plex_dataset_name, srm.experiment_number, srm.polarity, "+
				" p.fractions_analyzed_count as number_of_fractions, label_free as label_free_asi, itraq_113 as itraq_113_asi,"+
				" itraq_114 as itraq_114_asi, itraq_115 as itraq_115_asi, itraq_116 as itraq_116_asi, itraq_117 as itraq_117_asi,"+
				" itraq_118 as itraq_118_asi, itraq_119 as itraq_119_asi, itraq_121 as itraq_121_asi,"+
				" tmt_126 as tmt_126_asi, tmt_127n as tmt_127n_asi, tmt_127c as tmt_127c_asi, tmt_128n as tmt_128n_asi, tmt_128c as tmt_128c_asi,"+
				" tmt_129n as tmt_129n_asi, tmt_129c as tmt_129c_asi, tmt_130n as tmt_130n_asi, tmt_130c as tmt_130c_asi, tmt_131 as tmt_131_asi, tmt_131c as tmt_131c_asi, "+
				" tmt_132n as tmt_132n_asi, tmt_132c as tmt_132c_asi, tmt_133n as tmt_133n_asi, tmt_133c as tmt_133c_asi, tmt_134n as tmt_134n_asi, tmt_134c as tmt_134c_asi, tmt_135n as tmt_135n_asi "+
				" from study_run_metadata srm, study s, protocol p "+
				" where srm.study_id=s.study_id and p.study_id = s.study_id ";
			//" and s.project_submitter_id IN ('" + context.value.join("','") + "')";

			let replacements = { };

			//@@@PDC-3839 get current version of study
			let isCurrent = true;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				isCurrent = false;
				let studySub = args.study_id.split(";");
				experimentalQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
			}
			if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				isCurrent = false;
				let study_submitter_ids = args.study_submitter_id.split(";");
				experimentalQuery += " and s.study_submitter_id IN (:study_submitter_ids)";
				replacements['study_submitter_ids'] = study_submitter_ids;
			}
			if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				let pdc_study_ids = args.pdc_study_id.split(";");
				experimentalQuery += " and s.pdc_study_id IN (:pdc_study_ids)";
				replacements['pdc_study_ids'] = pdc_study_ids;
			}
			if (isCurrent) {
				experimentalQuery += " and s.is_latest_version = 1 ";
			}
			//@@@PDC-3241: Updates to UI for Experimental Design tab for Study Run Metadata Submitter ID, Plex Dataset name and tmt channel ordering
			//Order data by plex_dataset_name
			experimentalQuery += " order by srm.folder_name asc ";
			return db.getSequelize().query(
				experimentalQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelStudyExperimentalDesign')
				}
			);
		},
		//@@@PDC-1491 add dataMatrixFromFile API
		//@@@PDC-1772 allow study_id as a parameter
		//@@@PDC-2016 add pdc_study_id to quantDataMatrix
		//@@@PDC-4853 enhance error handling
		async quantDataMatrix(obj, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantDataMatrix").send();
				context['parent']= "quantDataMatrix";
				logger.info("quantDataMatrix is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("quantDataMatrix is called from UI with "+ JSON.stringify(args));
			let sid = null;
			let idType = '';
			let studyIdValidated = null;
			if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
				sid = args.study_id;
				idType = 'study_id';
			}
			else if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
				sid = args.study_submitter_id;
				idType = 'study_submitter_id';
			}
			else if (typeof args.pdc_study_id != 'undefined' && args.pdc_study_id.length > 0) {
				sid = args.pdc_study_id;
				idType = 'pdc_study_id';
			}
			else {
				throw new ApolloError('ID missing! Please enter one of the following: study_id or study_submitter_id or pdc_study_id');
				//return [['ID missing! Please enter one of the following: ']['study_id or study_submitter_id or pdc_study_id']];
			}

			let studyQuery = "select bin_to_uuid(study_id) as study_id from study where  is_latest_version = 1 and ";
			let study = null;
			if (idType === 'study_id') {
				studyQuery += " study_id = uuid_to_bin(:study_id)";
				study = await db.getSequelize().query(
					studyQuery,
					{
						replacements: { study_id: sid},
						raw: true
					}
				);
			}
			else if (idType === 'study_submitter_id') {
				studyQuery += " study_submitter_id = :study_submitter_id";
				study = await db.getSequelize().query(
					studyQuery,
					{
						replacements: { study_submitter_id: sid},
						raw: true
					}
				);
			}
			else if (idType === 'pdc_study_id') {
				studyQuery += " pdc_study_id = :pdc_study_id";
				study = await db.getSequelize().query(
					studyQuery,
					{
						replacements: { pdc_study_id: sid },
						raw: true
					}
				);
			}

			if (study[0].length > 0) {
				studyIdValidated = study[0][0].study_id;
			}
			else {
				logger.error('quantDataMatrix: Study not found! '+ idType +': '+sid);
				throw new ApolloError('Study not found! '+idType +': '+sid);
				//return [['Study not found! '][idType +': '+sid]];
			}

			let matrixFile = 'matrixFiles/'+studyIdValidated+ '_'+args.data_type+'.json';
			let matrix = null;
			let matrixError = 'Matrix data not found! '+idType +': '+sid+ ': '+args.data_type;
			if (fs.existsSync(matrixFile)) {
				let rawData = fs.readFileSync(matrixFile);
				return JSON.parse(rawData);
			}
			else {
				logger.error('quantDataMatrix: Matrix data not found! '+ idType +': '+sid+ ': '+args.data_type);
				throw new ApolloError(matrixError);
			}
			return matrix;
		},
		//@@@PDC-5625 get filter usage statistics
		filterStats (obj, args, context){
			let logFile = 'logs/filter.log';
			let logError = 'log file not found!';
			let fPairMap = new Map();
			let fNameMap = new Map();
			let rankingReq = 10;
			if (typeof args.ranking != 'undefined')
				rankingReq = args.ranking;

			if (fs.existsSync(logFile)) {
				let rawData = fs.readFileSync(logFile, 'utf8');
				rawData.split(/\r?\n/).forEach(line =>  {
					if (line.indexOf('FILTER') >= 0) {
						let fPair = line.substring(line.indexOf('[')+1, line.indexOf(']'));
						if (fPairMap.has(fPair)){
							fPairMap.set(fPair, fPairMap.get(fPair)+1);
						}
						else {
							fPairMap.set(fPair, 1);
						}
						console.log("Filter Pair: "+ fPair +':'+ fPairMap.get(fPair));
						let fName = fPair.substring(0, fPair.indexOf(':'));
						if (fNameMap.has(fName)){
							fNameMap.set(fName, fNameMap.get(fName)+1);
						}
						else {
							fNameMap.set(fName, 1);
						}
						console.log("Filter Name: "+ fName +':'+ fNameMap.get(fName));
					}
				});
				let mapSort1 = new Map([...fPairMap.entries()].sort((a, b) => b[1] - a[1]));
				console.log(mapSort1);
				let result = [];
				let ranking = 0;
				const iterator1 = mapSort1[Symbol.iterator]();

				for (const item of iterator1) {
					if (ranking >= rankingReq)
						break;
					let obj = {
						filterUsed: item[0],
						filterAppCount: item[1]
					};
					result.push(obj);
					ranking++;
				}
				return result;
			}
			else {
				throw new ApolloError(logError);
			}
			return null;

		},
		//@@@PDC-1882 pdcEntityReference api
		//@@@PDC-5511 add annotation
		pdcEntityReference(obj, args, context) {
			//@@@PDC-4726 log search query
			/*if (args.source != 'undefined' && args.source === 'search') {
				//logger.info("SEARCH QUERY to pdcEntityReference:  "+ JSON.stringify(args));
				analyticLog.info("SEARCH QUERY to pdcEntityReference:  "+ JSON.stringify(args));
			}*/
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/pdcEntityReference").send();
				context['parent']= "pdcEntityReference";
				logger.info("pdcEntityReference is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
				//throw new ApolloError(duaMsg);
			}
			else
				logger.info("pdcEntityReference is called from UI with "+ JSON.stringify(args));
			logger.info("pdcEntityReference is called from UI with "+ JSON.stringify(args));
			//@@@PDC-2018 add submitter_id_name of study
			//@@@PDC-2968 get latest version by default
			//@@@PDC-3090 join on study_id
			//@@@PDC-3132 dynamic join based on reference_type
			//@@@PDC-3528 remove duplicates across versions
			let entityReferenceQuery = "SELECT distinct bin_to_uuid(reference_id) as reference_id, entity_type, bin_to_uuid(entity_id) as entity_id, reference_type, reference_entity_type, reference_entity_alias, reference_resource_name, reference_resource_shortname, reference_entity_location, annotation, s.submitter_id_name ";
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

			let replacements = { };

			if (typeof args.entity_id != 'undefined' && args.entity_id.length > 0) {
				entityReferenceQuery += " and entity_id = uuid_to_bin(:entity_id)";
				replacements['entity_id'] = args.entity_id;
			}
			else {
				entityReferenceQuery += " and s.is_latest_version = 1 ";
			}
			if (typeof args.entity_type != 'undefined' && args.entity_type.length > 0) {
				entityReferenceQuery += " and entity_type = :entity_type";
				replacements['entity_type'] = args.entity_type;
			}
			/*if (typeof args.reference_type != 'undefined' && args.reference_type.length > 0) {
				entityReferenceQuery += " and reference_type ='" + args.reference_type + "'";
			}*/
			return db.getSequelize().query(
				entityReferenceQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelEntityReference')
				}
			);

		},
		//@@@PDC-5511 generic API for reference
		reference(obj, args, context) {
			gaVisitor.pageview("/graphqlAPI/reference").send();
			context['parent']= "reference";
			logger.info("reference is called with "+ JSON.stringify(args));
			//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
			//throw new ApolloError(duaMsg);

			let entityReferenceQuery = "SELECT distinct bin_to_uuid(reference_id) as reference_id, entity_type, bin_to_uuid(entity_id) as entity_id, entity_submitter_id, reference_type, reference_entity_type, reference_entity_alias, bin_to_uuid(reference_entity_id) as reference_entity_id, reference_resource_name, reference_resource_shortname, reference_entity_location, annotation FROM reference WHERE reference_id IS NOT NULL ";

			let replacements = { };

			if (typeof args.entity_id != 'undefined' && args.entity_id.length > 0) {
				entityReferenceQuery += " and entity_id = uuid_to_bin(:entity_id)";
				replacements['entity_id'] = args.entity_id;
			}
			if (typeof args.entity_type != 'undefined' && args.entity_type.length > 0) {
				entityReferenceQuery += " and entity_type = :entity_type";
				replacements['entity_type'] = args.entity_type;
			}
			if (typeof args.reference_type != 'undefined' && args.reference_type.length > 0) {
				entityReferenceQuery += " and reference_type ='" + args.reference_type + "'";
			}
			return db.getSequelize().query(
				entityReferenceQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelEntityReference')
				}
			);

		},
		//@@@PDC-3805 references for legacy studies
		uiLegacyStudyReference(obj, args, context) {
			context['parent']= "uiLegacyStudyReference";
			logger.info("uiLegcyStudyReference is called from UI with "+ JSON.stringify(args));
			//var entityReferenceQuery = "SELECT distinct bin_to_uuid(reference_id) as reference_id, entity_type, bin_to_uuid(entity_id) as entity_id, reference_type, reference_entity_type, reference_entity_alias, reference_resource_name, reference_resource_shortname, reference_entity_location from legacy_reference where entity_id is not null ";

			//@@@PDC-3975 include submitter_id_name field in uiLegacyStudyReference API
			var entityReferenceQuery = "SELECT distinct bin_to_uuid(reference_id) as reference_id, entity_type, bin_to_uuid(entity_id) as entity_id, reference_type, reference_entity_type, reference_entity_alias, reference_resource_name, reference_resource_shortname, reference_entity_location, s.study_submitter_id as submitter_id_name "

			if (args.reference_type=='external') {
				entityReferenceQuery += " FROM legacy_reference r left join legacy_study s on r.entity_id = s.study_id where entity_id is not null and reference_type ='external' ";
			}
			else if (args.reference_type=='internal') {
				entityReferenceQuery += " FROM legacy_reference r left join legacy_study s on r.reference_entity_alias = s.pdc_study_id where entity_id is not null and reference_type ='internal' ";
			}

			let replacements = { };

			if (typeof args.entity_id != 'undefined' && args.entity_id.length > 0) {
				entityReferenceQuery += " and entity_id = uuid_to_bin(:entity_id)";
				replacements['entity_id'] = args.entity_id
			}
			if (typeof args.reference_type != 'undefined' && args.reference_type.length > 0) {
				entityReferenceQuery += " and reference_type = :reference_type ";
				replacements['reference_type'] = args.reference_type;
			}
			return db.getSequelize().query(
				entityReferenceQuery,
				{
					replacements: replacements,
					model: db.getModelByName('ModelEntityReference')
				}
			);

		}
		//@@@PDC-964 async api for data matrix
		//@@@PDC-1772 take quantDataMatrixDb offline
		//@@@PDC-7440 remove obsolete APIs
		/*async quantDataMatrixDb(obj, args, context) {
			if(!context.isUI) {
				gaVisitor.pageview("/graphqlAPI/quantDataMatrixDb").send();
				context['parent']= "quantDataMatrixDb";
				logger.info("quantDataMatrixDb is called with "+ JSON.stringify(args));
				//if (typeof args.acceptDUA == 'undefined' || !args.acceptDUA)
					//throw new ApolloError(duaMsg);
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

		}*/
	}
};

//export default resolvers;
