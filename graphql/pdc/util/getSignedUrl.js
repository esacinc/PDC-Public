//@@@PDC-1122 add signed url
//@@@PDC-2910 get cloudfront signed url
import AWS from 'aws-sdk';
import { logger } from './logger';

class fileSignedUrl {
  constructor(url) {
    this.url = url;
  }
}

const cloudfrontAccessKeyId = process.env.CF_ACCESS_KEY_ID;
const cloudFrontPrivateKey = process.env.CF_PRIVATE_KEY;
const myBucket = process.env.AWS_S3_PDC_BUCKET;

const getSignedUrl = function (location) {
	//logger.info("Incoming File location: "+ location);
	//location = "studies/214/PSM/tsv/FN18 N45T46 180min 10ug C1 032313.psm";
	//@@@PDC-3414 handle file name with special chars
	let words = location.split('/');
	let indexOfName = words.length-1;
	words[indexOfName] = encodeURIComponent(words[indexOfName]);
	location = words.join('/');
	
	//if (location.indexOf(' ') >= 0) {
		//location = encodeURIComponent(location);
	//}
	//logger.info("Final File location: "+ location);
	
	var envKey = '';
	if (typeof cloudFrontPrivateKey != 'undefined') {
		envKey = cloudFrontPrivateKey.replace(/\\n/g, '\n');
	}

	
	var wpKey = '-----BEGIN RSA PRIVATE KEY-----\n'+envKey+'\n-----END RSA PRIVATE KEY-----\n';

	//logger.info("CF Private Key: "+ wpKey);
	const signer = new AWS.CloudFront.Signer(cloudfrontAccessKeyId, wpKey);
	const cfUrl = process.env.CF_BASE + location;
	//console.log("Raw URL: "+ cfUrl);

	const twoDays = 2*24*60*60*1000;

	const signedUrl = signer.getSignedUrl({
	  url: cfUrl,
	  expires: Math.floor((Date.now() + twoDays)/1000) 
	});			
	return new fileSignedUrl(signedUrl);
	/*var s3 = new AWS.S3({
			accessKeyId: process.env.AWS_S3_READ_ACCESS_KEY,
			secretAccessKey: process.env.AWS_S3_READ_SECRET_KEY
	});
					
	const myKey = location;
	const signedUrlExpireSeconds = 48 * 60 * 60

	const url = s3.getSignedUrl('getObject', {
		Bucket: myBucket,
		Key: myKey,
		Expires: signedUrlExpireSeconds
	})
	//console.log("Signed URL: "+ signedUrl);
	return new fileSignedUrl(url);	*/		
	
}

export{getSignedUrl};