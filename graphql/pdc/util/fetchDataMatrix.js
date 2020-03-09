import { ModelMatrix } from '../models/customModels';
//@@@PDC-1437 db connect for public APIs
import { pubDb } from './pubDbconnect';
import { logger } from './logger';
//import { db } from './dbconnect';
import {RedisCacheClient} from '../util/cacheClient';

//@@@PDC-964 async api for data matrix
async function fetchDataMatrix(data_type, study_submitter_id, numOfAliquot, numOfGene) {
	logger.info("fetch data matrix for "+data_type + " "+study_submitter_id);
	var matrix = [];
	var matrixCountQuery = '';
	switch (data_type) {
		case 'spectral_count':
		case 'distinct_peptide':
		case 'unshared_peptide':
			matrixCountQuery = "select distinct sc.study_submitter_id, sc.plex_name" +
			" FROM pdc.spectral_count sc"+
			" WHERE sc.study_submitter_id = '"+ study_submitter_id +			
			//"' and sc.project_submitter_id IN ('" + context.value.join("','") + 
			"' order by sc.plex_name";
			break;
		case 'precursor_area': 
		case 'log2_ratio': 
		case 'unshared_precursor_area': 
		case 'unshared_log2_ratio': 
			//@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
			//@@@PDC-1018 use aliquot_id instead of aliquot_submitter_id
			matrixCountQuery = "select distinct ga.study_submitter_id,"+
			" bin_to_uuid(ga.aliquot_id) as aliquot_id, ga.aliquot_alias" +
			" FROM pdc.gene_abundance ga"+
			" WHERE ga.study_submitter_id = '"+ 
			study_submitter_id +			
			//"' and ga.project_submitter_id IN ('" + context.value.join("','") + "')" +
			"' order by aliquot_id";
			break;
		case 'log_ratio': 
			matrixCountQuery = "select distinct pq.study_submitter_id, bin_to_uuid(pq.aliquot_id) as aliquot_id " +
			" FROM pdc.phosphosite_quant pq"+
			" WHERE pq.study_submitter_id = '"+ study_submitter_id +			
			//"' and pq.project_submitter_id IN ('" + context.value.join("','") + "')" +
			"' order by aliquot_id";
			break;
	}
	//@@@PDC-1019 limit num of records returned
	if (numOfAliquot > 0){
		matrixCountQuery += " limit 0, "+numOfAliquot;
	}
	var aliquots = await pubDb.getSequelize().query(matrixCountQuery, { model: pubDb.getModelByName('ModelMatrix') });
	var row1 = ['Gene/Aliquot'];
	matrix.push(row1);
	var genes = null, geneQuery = null;
	for (var i = 0; i < aliquots.length; i++) {
		switch (data_type) {
			case 'spectral_count':
			case 'distinct_peptide':
			case 'unshared_peptide':
				matrix[0].push(aliquots[i].plex_name);
				geneQuery = "select sc.gene_name, sc." +data_type +
				" FROM pdc.spectral_count sc" +
				" WHERE sc.study_submitter_id = '"+ aliquots[i].study_submitter_id +
				"' and sc.plex_name = '"+ aliquots[i].plex_name + "'"+
				" order by sc.gene_name";
				break;
			case 'precursor_area': 
			case 'log2_ratio': 
			case 'unshared_precursor_area': 
			case 'unshared_log2_ratio': 
			//@@@PDC-765 Key data matrix with aliquot_submitter_id and aliquot_alias
				matrix[0].push(aliquots[i].aliquot_id+":"+aliquots[i].aliquot_alias);
				geneQuery = "select ga.gene_name, ga." +data_type +
				" FROM pdc.gene_abundance ga" +
				" WHERE ga.study_submitter_id = '"+ aliquots[i].study_submitter_id +
				"' and ga.aliquot_id = uuid_to_bin('"+ aliquots[i].aliquot_id + 
				"') and ga.aliquot_alias = '"+ aliquots[i].aliquot_alias + "'"+
				" order by ga.gene_name";
				break;
			case 'log_ratio': 
				matrix[0].push(aliquots[i].aliquot_id);
				geneQuery = "select pq.gene_name, pq." +data_type +
				" FROM pdc.phosphosite_quant pq" +
				" WHERE pq.study_submitter_id = '"+ aliquots[i].study_submitter_id +
				"' and pq.aliquot_submitter_id = '"+ aliquots[i].aliquot_submitter_id + "'"+
				" order by pq.gene_name";
				break;
		}
		//@@@PDC-1019 limit num of records returned
		if (numOfGene > 0){
			geneQuery += " limit 0, "+numOfGene;
		}
		var geneRow = null;
		genes = await pubDb.getSequelize().query(geneQuery, { model: pubDb.getModelByName('ModelMatrix') });
		var currentGene = 'xxxx';
		var geneCount = 0;
		for (var j = 0; j < genes.length; j++){
			if (genes[j].gene_name === currentGene){
				//console.log("find dup: "+genes[j].gene_name);
				continue;						
			}
			currentGene = genes[j].gene_name;
			if (i == 0) {
				geneRow = new Array();
				geneRow.push(genes[j].gene_name);
				geneRow.push(eval("genes[j]."+data_type));
				matrix.push(geneRow);
			}
			else {
				matrix[j+1].push(eval("genes[j]."+data_type));
			}
		}
	}
	console.log("Ready to cache matrix");
	var matrixCacheName = 'PDCQUANT:Type:'+data_type+'Study:'+study_submitter_id+'Aliquots'+numOfAliquot+'numOfGene'+numOfGene;
	RedisCacheClient.redisCacheSetExAsync(matrixCacheName, JSON.stringify(matrix));
}

export { fetchDataMatrix };