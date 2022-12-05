import winston from 'winston';

var logLevel = 'info';


//@@@PDC-5625 get filter usage statistics
const filterLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: 'GraphQL' },
  transports: [
    new winston.transports.File({ 
	filename: 'logs/filter.log',
	options: {flags: 'a+', encoding: 'utf8'},	
	maxsize: 5000000, 
	maxFiles: 10, 	
	/*format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss A ZZ'
        }),
        winston.format.json()
      )*/ 
	  })
  ]
});

const searchLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: 'GraphQL' },
  transports: [
    new winston.transports.File({ 
	filename: 'logs/search.log',
	options: {flags: 'a+', encoding: 'utf8'},	
	maxsize: 5000000, 
	maxFiles: 10, 	
	/*format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss A ZZ'
        }),
        winston.format.json()
      )*/ 
	  })
  ]
});
 
export {
	filterLogger,
	searchLogger
} ;