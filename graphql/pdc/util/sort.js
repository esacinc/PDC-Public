//@@@PDC-1215 use winston logger
import { logger } from './logger';

//@@@PDC-497 Make table column headers sortable on the browse page tabs
const sort = function (args, cache = {dataFilterName:''}) {
    let uiSortQuery = "";
    if (typeof args.sort != 'undefined' && args.sort.length > 0) {
        uiSortQuery += " order by " +args.sort + " ";
        cache.dataFilterName += "order_by:("+ args.sort + ");";
    }
    return uiSortQuery;
}
//@@@PDC-814 Track API usage through Google Analytics
const getAPI = function (query) {
	//@@@PDC-930 not tracking for calls from UI
	var api = "noTrack";
	if (query != null) {
		let q = query.split('\n');
		var r = q.join("");
		let s = r.split('{');
		let t = s[1].split('(');
		let u = t[0].trim();
		//@@@PDC-1123 add wrapper apis for ui
		if (u.indexOf("ui") < 0 &&
		u.indexOf("UI") < 0 &&
		u.indexOf("Search") < 0 ) {
			logger.info("Non ui API "+ u);
			api = "/graphqlAPI/"+t[0].trim();
		}
		else {
			logger.info("UI API "+ u +" "+api);
		}
	}
	return api;
	
}

export{sort, getAPI};