import redis from 'redis';
import {promisify} from 'util';
//@@@PDC-1215 use winston logger
import { logger } from './logger';


//@@@PDC-650 implement elasticache for API
let cacheClient;
let cacheClientConnected = false;
let cacheEnabled = true;
let cacheFlush = true;

if (typeof process.env.PDC_ELASTICACHE_ENABLE !== 'undefined'){
  cacheEnabled = (process.env.PDC_ELASTICACHE_ENABLE === 'true');
}
if(typeof process.env.PDC_ELASTICACHE_FLUSH !== 'undefined'){
  cacheFlush = (process.env.PDC_ELASTICACHE_FLUSH === 'true');
}
// Create Redis Client
if (typeof process.env.PDC_ELASTICACHE_HOST !== 'undefined'){
  cacheClient = redis.createClient(process.env.PDC_ELASTICACHE_PORT, process.env.PDC_ELASTICACHE_HOST);
}else {
  cacheClient = redis.createClient();
}

cacheClient.on("error", (err) => {
  logger.error("Error " + err);
});

cacheClient.on('connect', () => {
  cacheClientConnected = true;
  logger.info('Connected to Redis    ...');
  if(cacheFlush){
    cacheClient.flushall( () => logger.info('Redis cache flushed'));
  }
});

//Set the value and expiration of a key.
const cacheSetExAsync = promisify(cacheClient.setex).bind(cacheClient);

const cacheSetAsync = promisify(cacheClient.set).bind(cacheClient);

const cacheGetAsync = promisify(cacheClient.get).bind(cacheClient);

//default key expiration time 24 hrs
const cacheExpirationTime = 1*60*60*24;

//All existing cache names
const pdcuiBrowsePagePaginatedDataTab = new Map();
pdcuiBrowsePagePaginatedDataTab.set('StudyTotalCount','PDCUI:BrowsePage:PaginatedDataTab:StudyTotalCount:');
pdcuiBrowsePagePaginatedDataTab.set('FileTotalCount','PDCUI:BrowsePage:PaginatedDataTab:FileTotalCount:');
pdcuiBrowsePagePaginatedDataTab.set('ClinicalTotalCount','PDCUI:BrowsePage:PaginatedDataTab:ClinicalTotalCount:');
pdcuiBrowsePagePaginatedDataTab.set('CaseTotalCount','PDCUI:BrowsePage:PaginatedDataTab:CaseTotalCount:');
pdcuiBrowsePagePaginatedDataTab.set('GeneTotalCount','PDCUI:BrowsePage:PaginatedDataTab:GeneTotalCount:');
pdcuiBrowsePagePaginatedDataTab.set('StudyData', 'PDCUI:BrowsePage:PaginatedDataTab:StudyData:');
pdcuiBrowsePagePaginatedDataTab.set('FileData', 'PDCUI:BrowsePage:PaginatedDataTab:FileData:');
pdcuiBrowsePagePaginatedDataTab.set('ClinicalData', 'PDCUI:BrowsePage:PaginatedDataTab:ClinicalData:');
pdcuiBrowsePagePaginatedDataTab.set('CaseData', 'PDCUI:BrowsePage:PaginatedDataTab:CaseData:');
pdcuiBrowsePagePaginatedDataTab.set('GeneData', 'PDCUI:BrowsePage:PaginatedDataTab:GeneData:');
pdcuiBrowsePagePaginatedDataTab.set('GeneStudy', 'PDCUI:BrowsePage:PaginatedDataTab:GeneStudy:');

const pdcuiBrowsePageFilter = new Map();
pdcuiBrowsePageFilter.set('Filter','PDCUI:BrowsePage:Filter');

const pdcuiBrowsePageChart = new Map();
pdcuiBrowsePageChart.set('AnalyticalFraction','PDCUI:BrowsePage:Chart:AnalyticalFraction:');
pdcuiBrowsePageChart.set('ExperimentBar','PDCUI:BrowsePage:Chart:ExperimentBar:');
pdcuiBrowsePageChart.set('ExperimentPie','PDCUI:BrowsePage:Chart:ExperimentPie:');
//@@@PDC-1220 add human body image
pdcuiBrowsePageChart.set('HumanBody','PDCUI:BrowsePage:Chart:HumanBody:');

const pdcuiSummaryPageGeneSummary = new Map();
pdcuiSummaryPageGeneSummary.set('AliquotSpectralCount','PDCUI:SummaryPage:GeneSummaryPaginatedData:AliquotSpectralCount:');
pdcuiSummaryPageGeneSummary.set('AliquotSpectralCountTotalCount','PDCUI:SummaryPage:GeneSummary:AliquotSpectralCountTotalCount:');
//@@@PDC-737 GeneAliquotSpectralCount supports filters
pdcuiSummaryPageGeneSummary.set('AliquotSpectralCountFiltered','PDCUI:SummaryPage:GeneSummaryPaginatedData:AliquotSpectralCountFiltered:');
pdcuiSummaryPageGeneSummary.set('AliquotSpectralCountTotalCountFiltered','PDCUI:SummaryPage:GeneSummary:AliquotSpectralCountTotalCountFiltered:');
pdcuiSummaryPageGeneSummary.set('GeneSpectralCount','PDCUI:SummaryPage:GeneSummary:GeneSpectralCount:');
pdcuiSummaryPageGeneSummary.set('StudySpectralCount','PDCUI:SummaryPage:GeneSummaryPaginatedData:StudySpectralCount:');
pdcuiSummaryPageGeneSummary.set('StudySpectralCountTotalCount','PDCUI:SummaryPage:GeneSummary:StudySpectralCountTotalCount:');
//@@@PDC-681 ui ptm data API
pdcuiSummaryPageGeneSummary.set('Ptm','PDCUI:SummaryPage:GeneSummary:Ptm:');

const pdcuiSummaryPageStudySummary = new Map();
pdcuiSummaryPageStudySummary.set('WorkflowMetadata','PDCUI:SummaryPage:StudySummary:WorkflowMetadata:');
pdcuiSummaryPageStudySummary.set('Protocol','PDCUI:SummaryPage:StudySummary:Protocol:');
pdcuiSummaryPageStudySummary.set('Publication','PDCUI:SummaryPage:StudySummary:Publication:');
pdcuiSummaryPageStudySummary.set('FileCountPerStudy','PDCUI:SummaryPage:StudySummary:FileCountPerStudy:');
//@@@PDC-2167 group files by data source
pdcuiSummaryPageStudySummary.set('StudyFilesCountBySource','PDCUI:SummaryPage:StudySummary:StudyFilesCountBySource:');

const pdcuiSummaryPageCaseSummary = new Map();
pdcuiSummaryPageCaseSummary.set('Case','PDCUI:SummaryPage:CaseSummary:Case:');
pdcuiSummaryPageCaseSummary.set('CaseDemographic','PDCUI:SummaryPage:CaseSummary:CaseDemographic:');
pdcuiSummaryPageCaseSummary.set('CaseDiagnose','PDCUI:SummaryPage:CaseSummary:CaseDiagnose:');
pdcuiSummaryPageCaseSummary.set('CaseSample','PDCUI:SummaryPage:CaseSummary:CaseSample:');
pdcuiSummaryPageCaseSummary.set('ExperimentFileCount','PDCUI:SummaryPage:CaseSummary:ExperimentFileCount:');
pdcuiSummaryPageCaseSummary.set('DataCategoryFileCount','PDCUI:SummaryPage:CaseSummary:DataCategoryFileCount:');

class RedisCacheClient{

  static async redisCacheGetAsync(cacheName){
    if(cacheClientConnected && cacheEnabled){
      let val = await cacheGetAsync(cacheName);
      if(val === undefined || val === null || val ==='undefined' || val ==='null' || val ==='nil'){
        return null
      }else{
        return val;
      }
    }else{
      return null;
    }
  }

  static redisCacheSetExAsync(cacheName, value){
    if(cacheClientConnected && cacheEnabled && (value !== undefined || value !== null || value !=='undefined' || value !=='null' || value !=='nil')){
      //cacheSetExAsync(cacheName, cacheExpirationTime, value);
      //cache never expire
      cacheSetAsync(cacheName, value);
    }
  }

}
class CacheName {

  static getBrowsePagePaginatedDataTabCacheKey(cacheName){
    let cacheKey = pdcuiBrowsePagePaginatedDataTab.get(cacheName);
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }

  static getBrowsePageFilterCacheKey(){
    let cacheKey =pdcuiBrowsePageFilter.get('Filter');
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }

  static getBrowsePageChartCacheKey(cacheName){
    let cacheKey =pdcuiBrowsePageChart.get(cacheName);
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }

  static getSummaryPageGeneSummary(cacheName){
    let cacheKey =pdcuiSummaryPageGeneSummary.get(cacheName);
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }

  static getSummaryPageStudySummary(cacheName){
    let cacheKey =pdcuiSummaryPageStudySummary.get(cacheName);
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }

  static getSummaryPageCaseSummary(cacheName){
    let cacheKey =pdcuiSummaryPageCaseSummary.get(cacheName);
    if(cacheKey === null){
      console.error('Cache key not exit for cache name: '+cacheName);
      return '';
    }else{
      return cacheKey;
    }
  }
}

export {CacheName, RedisCacheClient};