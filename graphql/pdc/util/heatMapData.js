import { logger } from './logger';
import fs from 'fs';

var studiesWithHM = null;
//@@@PDC-3597 heatmap study api
function getHeatMapStudies(study_id) {
	if (studiesWithHM == null) {
		var hmf = 'pdc/util/heatmap_data.json';
		let rawData = fs.readFileSync(hmf);
		let hmStudies = JSON.parse(rawData);
		const hmsMap = new Map(Object.entries(hmStudies));
		let fileMap = new Map();
		for (const key of hmsMap.keys()) {
			fileMap.set(key, hmsMap.get(key).files);
			//logger.info("New map: "+fileMap.get(key));
		}
		studiesWithHM = fileMap;
		logger.info("New map!!!");
		
	}
	else {
		logger.info("Existing map!!!");
		/*for (const key of studiesWithHM.keys()) {
			logger.info("Existing map: "+studiesWithHM.get(key));
		}*/		
	}
	if (study_id)
		return studiesWithHM.get(study_id);
	else {
		return Array.from(studiesWithHM.keys()).join("') , UUID_TO_BIN('");
	}
	
}

export { getHeatMapStudies };