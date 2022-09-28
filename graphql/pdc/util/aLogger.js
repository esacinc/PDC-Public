import winston from 'winston';

var logLevel = 'info';
if (typeof process.env.GRAPHQL_LOG_LEVEL != "undefined") {
	logLevel = process.env.GRAPHQL_LOG_LEVEL;
}



const aLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: 'GraphQL' },
  transports: [
    new winston.transports.File({ 
	filename: 'logs/ana.log',
	options: {flags: 'a+', encoding: 'utf8'},	
	maxsize: 5000000, 
	maxFiles: 10, 	
	format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss A ZZ'
        }),
        winston.format.json()
      ) 
	  })
  ]
});
 
export {aLogger} ;