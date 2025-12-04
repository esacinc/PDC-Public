import { db } from './dbconnect';
import {RedisCacheClient} from '../util/cacheClient';

//@@@PDC-8588  
async function getPtmLegacyGeneName(gene_id, gene_name) {
	var ptmLegacyGeneName = 'PtmLegacyGeneName:'+gene_id;
	let legacyName = gene_name;
	const res = await RedisCacheClient.redisCacheGetAsync(ptmLegacyGeneName);
	if(res === null){
		var ptmLegacyGeneNameQuery = "select legacy_gene_name from gene where gene_id = uuid_to_bin('"+gene_id+"')";
		var leg = await db.getSequelize().query(ptmLegacyGeneNameQuery, { raw: true });
		if (leg[0][0].legacy_gene_name && leg[0][0].legacy_gene_name.length > 1) {
			legacyName = leg[0][0].legacy_gene_name;
			RedisCacheClient.redisCacheSetExAsync(ptmLegacyGeneName, legacyName);
		}
	}
	else {
		legacyName = res;
	}
	console.log("in func: ", legacyName);
	return legacyName;
}

export { getPtmLegacyGeneName };