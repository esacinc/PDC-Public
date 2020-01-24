//@@@PDC-212 Bypass authentication
import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './pdc/schema';
import { db } from './pdc/util/dbconnect';
//@@@PDC-1215 use winston logger
import { logger } from './pdc/util/logger';

//@@@PDC-814 Track API usage through Google Analytics
import ua from 'universal-analytics'
import { getAPI } from './pdc/util/sort';

const GRAPHQL_PORT = 3000;

const cors = require('cors');

const graphQLServer = express();

//var projects = [];
//var email = 'lei.ma@esacinc.com';
//var email = '';

// verifyFailed sends http response with status code of 401
var verifyFailed = function(req, res){
	logger.error('Token verify failed: return 401');
	res.statusCode = 401;
	return res.send('Unauthorized');			
}

// authenticate verifies the ID token coming with API calls to decide whether
// an API call is authorized
var authenticate = function(req, res, next) {
	var idToken = req.headers['authorization'];
	if (idToken === undefined) {
		logger.error('Token not found: return 401');
		res.statusCode = 401;
		return res.send('Unauthorized');			
	}
	else {
		if (idToken.startsWith("Bearer ")) {
			idToken = idToken.substring(7);
		}
		logger.info('Token to be verified: '+ idToken);
		setTimeout(function(){
			const {OAuth2Client} = require('google-auth-library');
			//@@@PDC-603 make client id an env var
			const CLIENT_ID = process.env.PDC_GOOGLE_CLIENT_ID;
			const client = new OAuth2Client(CLIENT_ID);
			async function verify() {
			try {
			  const ticket = await client.verifyIdToken({
				  idToken: idToken,
				  audience: CLIENT_ID  
			  });
			  const payload = ticket.getPayload();
			  //@@@PDC-140 authorization
			  email = payload.email;
			  const userid = payload['sub'];
				return next();
			}
			catch (err) {
				logger.error('Token verify failed: return 401');
				res.statusCode = 401;
				return res.send('Unauthorized');			
				
			}
			}
			verify();
		}, 1000)
	}
};

var track = function(req, res, next) {
	//@@@PDC-814 Track API usage through Google Analytics
	//console.log("sending pageview..."+ req.query.query);	
	//@@@PDC-930 not tracking for calls from UI
	var api = getAPI(req.query.query);
	if (api !== 'noTrack') {
		req.visitor.pageview().send();
		logger.info("pageview sent: "+api);		
	}
	return next();
}

//@@@PDC-140 authorization
//@@@PDC-1340 remove authorization code
/*var authorize = async function(req, res, next) {
	//@@@PDC-814 Track API usage through Google Analytics
	//console.log("sending pageview..."+ req.query.query);	
	//@@@PDC-930 not tracking for calls from UI
	var api = getAPI(req.query.query);
	if (api !== 'noTrack') {
		req.visitor.pageview().send();
		logger.info("pageview sent: "+api);		
	}
	
	//console.log('Email: '+ email);
	//@@@PDC-1340 remove authorization code
	const userRole = await db.getModelByName('ModelUserRole').findAll({
		where: {
			login_username: email,
			role_name: 'viewer'
		}
	});
	if (userRole === undefined || userRole.length == 0) {
		logger.error('Viewer role not found: return 401');
		res.statusCode = 401;
		return res.send('Unauthorized Role');					
	}
	const userProject = await db.getModelByName('ModelUserProject').findAll({
		attributes: ['project_submitter_id'],
		where: {
			login_username: email
		}
	});
	if (userProject === undefined || userProject.length == 0) {
		logger.error('No project allowed: return 401');
		res.statusCode = 401;
		return res.send('Unauthorized Project');					
	}
	projects = [];
	for (var i = 0; i < userProject.length; i++) {
		projects.push(userProject[i].project_submitter_id);
	}
	
	logger.info('Projects allowed: '+ JSON.stringify(projects));
	return next();
}*/

graphQLServer.use(cors());

//@@@PDC-814 Track API usage through Google Analytics
graphQLServer.use(ua.middleware(process.env.GA_TRACKING_ID, {cookieName: '_ga'}));

//graphQLServer.use('/graphql', authenticate, authorize, bodyParser.json(), graphqlExpress(req => {
graphQLServer.use('/graphql', track, bodyParser.json(), graphqlExpress(req => {
    return {
      schema: schema,
      /*context: {
        value: projects
      }*/
    };
  })
);
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT, () => {
	logger.info(
	  `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
	);

    /*console.log(
      `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
    )*/
}
);
