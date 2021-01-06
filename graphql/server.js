import express from 'express';
import SERVER from './pdc/schema';
import { db } from './pdc/util/dbconnect';
//@@@PDC-1215 use winston logger
import { logger } from './pdc/util/logger';

//@@@PDC-814 Track API usage through Google Analytics
import ua from 'universal-analytics'
import { getAPI } from './pdc/util/sort';

const GRAPHQL_PORT = 3000;

const cors = require('cors');

const GQ_APP = express();

//@@@PDC-3050 google analytics tracking
var track = function(req, res, next) {
	//@@@PDC-814 Track API usage through Google Analytics
	//@@@PDC-930 not tracking for calls from UI
	//logger.info("Request: "+Object.getOwnPropertyNames(req));
	//var api = getAPI(req.query.query);
	//if (api !== 'noTrack') {
		//req.visitor.pageview().send();
		//logger.info("post body: "+req.body);		
	//}
	return next();
}


GQ_APP.use(cors());

//@@@PDC-1966 large payload
//GQ_APP.use(bodyParser.json({limit: '50MB'}));

//@@@PDC-814 Track API usage through Google Analytics
GQ_APP.use(ua.middleware(process.env.GA_TRACKING_ID, {cookieName: '_ga'}));

//GQ_APP.use(track);

//@@@PDC-2192 apollo server 2.0
SERVER.applyMiddleware({
  app: GQ_APP
});

GQ_APP.listen(GRAPHQL_PORT, () => {
	logger.info(
	  `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphql`
	);

}
);
