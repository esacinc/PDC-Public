import { db } from './dbconnect';
import {RedisCacheClient} from '../util/cacheClient';

//@@@PDC-1383 convert labels to aliquot_id 
async function getAliquotId(aliquot_submitter_id, label) {
	var aliquotIdCashName = 'Experimental:Aliquot:'+aliquot_submitter_id+':label:'+label;
	const res = await RedisCacheClient.redisCacheGetAsync(aliquotIdCashName);
	if(res === null){
		var aliquotIdQuery = "select distinct bin_to_uuid(arm.aliquot_id) as label "+
					"from aliquot_run_metadata arm where arm.aliquot_submitter_id = '"+
					aliquot_submitter_id+"' and arm.label = '"+
					label+"'";
		var aliquotIds = await db.getSequelize().query(aliquotIdQuery, { raw: true });
		var aliquotId = null;
		if (aliquotIds != null && aliquotIds[0] != null && aliquotIds[0][0] != null){
			aliquotId = aliquotIds[0][0].label;		
			RedisCacheClient.redisCacheSetExAsync(aliquotIdCashName, aliquotId);	
		}
		return aliquotId;
	}
	else {
		return res;
	}
}

export { getAliquotId };