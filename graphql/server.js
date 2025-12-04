import express from 'express';
import SERVER from './pdc/schema';
import { db } from './pdc/util/dbconnect';
//@@@PDC-1215 use winston logger
import { logger } from './pdc/util/logger';
import geoip from 'geoip-lite';
 
//@@@PDC-814 Track API usage through Google Analytics
//import ua from 'universal-analytics'
//import { getAPI } from './pdc/util/sort';

const GRAPHQL_PORT = 3000;

const cors = require('cors');

const GQ_APP = express();

GQ_APP.set('trust proxy', true)

GQ_APP.use(express.json());

//@@@PDC-3050 google analytics tracking
//@@@PDC-3292 get origin of graphql call
var showObj = function(req, res, next) {
	//@@@PDC-814 Track API usage through Google Analytics
	//@@@PDC-930 not tracking for calls from UI
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	//logger.info("Client IP: "+ip);
 
	var geo = geoip.lookup(ip);
 
	//logger.info(geo);
	//logger.info("Request: "+Object.getOwnPropertyNames(req.connection));
	//logger.info("Client IP from req.ip: "+req.ip);
	//logger.info("Client IP from req.ip: "+req.ips);
	//logger.info("Client IP from x-forwarded-for: "+req.headers['x-forwarded-for']);
	//logger.info("Client IP from req.connection.remoteAddress: "+req.connection.remoteAddress);
	
	//logger.info("query: "+JSON.stringify(req.body));
	//logger.info("Connection: "+JSON.stringify(req.connection));
	//logger.info("Domain: "+JSON.stringify(req.rawHeaders));
	//logger.info("Domain: "+Object.getOwnPropertyNames(req.client));
	//var api = getAPI(req.query.query);
	//if (api !== 'noTrack') {
		//req.visitor.pageview().send();
		//logger.info("page view sent!!!");		
	//}
	return next();
}


GQ_APP.use(cors());

//@@@PDC-1966 large payload
//GQ_APP.use(bodyParser.json({limit: '50MB'}));

//@@@PDC-814 Track API usage through Google Analytics
//GQ_APP.use(ua.middleware(process.env.GA_TRACKING_ID, {cookieName: '_ga'}));

GQ_APP.use(showObj);

//@@@PDC-5461 upgrade to apollo-server-express 3.9.0
async function startServer() {
    await SERVER.start();
    SERVER.applyMiddleware({
		app: GQ_APP
	});
}
startServer();

GQ_APP.listen(GRAPHQL_PORT, () => {
	logger.info(
	  `GraphQL is now running on http://localhost:${GRAPHQL_PORT}/graphql`
	);

}
);
