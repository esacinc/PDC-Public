//@@@PDC-4865 extra logging for analytic data
import bunyan from 'bunyan';

const analyticLog = bunyan.createLogger({
    name: 'AnalyticLog',                     // Required
    //level: <level name or number>,      // Optional, see "Levels" section
    //stream: <node.js stream>,           // Optional, see "Streams" section
    streams: [
    {
      type: 'rotating-file',
	  level: 'info',
      path: 'logs/analytic.log',            // log INFO and above to stdout
	  period: '1d',   						// daily rotation
      count: 10 							// keep 10 back copies
    }
	],   
	// Optional, see "Streams" section
    //serializers: <serializers mapping>, // Optional, see "Serializers" section
    //src: <boolean>,                     // Optional, see "src" section

});
export {analyticLog} ;