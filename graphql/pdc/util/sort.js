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
	//console.log("queryin func: " + query);
	//@@@PDC-930 not tracking for calls from UI
	var api = "noTrack";
	if (query != null) {
		let q = query.split('\n');
		var r = q.join("");
		let s = r.split('{');
		let t = s[1].split('(');
		let u = t[0].trim();
		if (u.toLowerCase().indexOf("ui") < 0 ||
		u.toLowerCase().indexOf("search") < 0 ||
		u.indexOf("tissueSitesAvailable") < 0 ||
		u.indexOf("diseasesAvailable") < 0 ) {
			//console.log("Non ui API ");
			api = "/graphqlAPI/"+t[0].trim();
		}
	//console.log("API: "+ api);
	}
	return api;
	
}

export{sort, getAPI};