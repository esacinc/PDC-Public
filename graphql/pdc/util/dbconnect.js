//@@@PDC-109, 110, 122, 123 Factor out db connect obj
//@@@PDC-603 remove local db config for security reasons
import Sequelize from "sequelize";
import AWS from "aws-sdk";
import { defineSequelizeModels } from '../models/sequelizeModels';
import { defineCustomModels } from '../models/customModels';
import { defineUiModels } from '../models/uiModels';
//@@@PDC-1215 use winston logger
import { logger } from './logger';

//@@@PDC-411 get DB connect info from env variables
let db = {};
let region = "us-east-1";
let client = new AWS.SecretsManager({
  region: region
});
let sequelize = null;
//@@@PDC-2085 increase pool size
let maxConnection = 30;
if (typeof process.env.PDC_DB_GQ_MAX_CONN != "undefined") {
	maxConnection = parseInt(process.env.PDC_DB_GQ_MAX_CONN);
}


const getSequelize = () => { return sequelize; }; 
db.getSequelize = getSequelize;

const getModelByName = (modelName) => {
  return db[modelName];
};
db.getModelByName = getModelByName;

if (typeof process.env.PDC_DB_GQ_PWD != "undefined") {
  sequelize = new Sequelize(
    process.env.PDC_DB_GQ,
    process.env.PDC_DB_GQ_USER,
    process.env.PDC_DB_GQ_PWD,
    {
      host: process.env.PDC_DB_GQ_HOST,
      dialect: process.env.PDC_DB_GQ_DIALECT,
      port: process.env.PDC_DB_GQ_PORT,
	  pool: {
			max: maxConnection,
			min: 0,
			idle: 10000
	  },
	  //@@@PDC-3278 set sql query log to debug
	  logging: (msg) => logger.debug(msg)
	}
  );

  defineSequelizeModels(db);
  defineCustomModels(db);
  defineUiModels(db);
  
  //console.log("Max connections: "+sequelize.options.pool.max);

} else {
  const secretName = process.env.PDC_DB_PWD_SECRET_NAME;
  client.getSecretValue({ SecretId: secretName }, function(err, data) {
    if (err) {
      if (err.code === "DecryptionFailureException")
        // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InternalServiceErrorException")
        // An error occurred on the server side.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InvalidParameterException")
        // You provided an invalid value for a parameter.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InvalidRequestException")
        // You provided a parameter value that is not valid for the current state of the resource.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "ResourceNotFoundException")
        // We can't find the resource that you asked for.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
    } else {
      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
	//@@@PDC-1215 use winston logger
      sequelize = new Sequelize(
        process.env.PDC_DB_GQ,
        process.env.PDC_DB_GQ_USER,
        JSON.parse(data.SecretString)[secretName],
        {
          host: process.env.PDC_DB_GQ_HOST,
          dialect: process.env.PDC_DB_GQ_DIALECT,
          port: process.env.PDC_DB_GQ_PORT,
		  pool: {
				max: maxConnection,
				min: 0,
				idle: 10000
		  },    
		  logging: (msg) => logger.debug(msg)
        }
      );

      sequelize.authenticate().catch(err => {
        logger.error("Unable to connect to the database:", err);
      });

      defineSequelizeModels(db);
      defineCustomModels(db);
      defineUiModels(db);
      
      logger.info('retrieved password from aws secrets manager');
    }
  });
}

export { db };
