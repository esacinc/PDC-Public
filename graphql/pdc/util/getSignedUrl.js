//@@@PDC-1122 add signed url
//@@@PDC-2910 get cloudfront signed url
//@@@PDC-8535 Update GraphQL getSignedUrl and PDC API file.js to use AWS SDK v3
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl as getCFSignedUrl } from "@aws-sdk/cloudfront-signer";
import { logger } from './logger';

class fileSignedUrl {
  constructor(url) {
	this.url = url;
  }
}

const cloudfrontAccessKeyId = process.env.CF_ACCESS_KEY_ID;
const cloudFrontPrivateKey = process.env.CF_PRIVATE_KEY;
const myBucket = process.env.AWS_S3_PDC_BUCKET;
const myRegion = process.env.AWS_REGION ?? 'us-east-1';

const getSignedUrl = function (location, isCF) {
	//logger.info("Incoming File location: "+ location);
	//location = "studies/214/PSM/tsv/FN18 N45T46 180min 10ug C1 032313.psm";
	//@@@PDC-3414 handle file name with special chars
	//PDC-8898 - signed url issue.
	let words = location.split('/');
	let indexOfName = words.length - 1;
	words[indexOfName] = encodeURIComponent(words[indexOfName]);
	location = words.join('/');

	//logger.info("Final File location: "+ location);
	
	//@@@PDC-3837 use s3 key for large files
	if (isCF) {	
		let envKey = '';
		if (typeof cloudFrontPrivateKey != 'undefined') {
			envKey = cloudFrontPrivateKey.replace(/\\n/g, '\n');
		}
		let wpKey = '-----BEGIN RSA PRIVATE KEY-----\n'+envKey+'\n-----END RSA PRIVATE KEY-----\n';

		//logger.info("CF Private Key: "+ wpKey);
		//const signer = new AWS.CloudFront.Signer(cloudfrontAccessKeyId, wpKey);
		const cfUrl = process.env.CF_BASE + location;
		console.log("Raw URL: "+ cfUrl);

		//const twoDays = 2*24*60*60*1000;
		//@@@PDC-3535 increase signed url validaty to 7 days
		const sevenDays = 7*24*60*60*1000;

		const cfPolicy = {
			Statement: [
				{
					Resource: cfUrl,
					Condition: {
						DateLessThan: {
							"AWS:EpochTime": Math.floor((Date.now() + sevenDays)/1000) // time in seconds
						},
					},
				},
			],
		};


		const signedUrl = getCFSignedUrl({
			region: myRegion,
			keyPairId: cloudfrontAccessKeyId,
			privateKey: wpKey,
			policy: JSON.stringify(cfPolicy)
		});			
		return new fileSignedUrl(signedUrl);
	}
	else {
		let s3 = new S3({
			region: myRegion,
			credentials: {
				accessKeyId: process.env.AWS_S3_READ_ACCESS_KEY,
				secretAccessKey: process.env.AWS_S3_READ_SECRET_KEY
			}
		});
						
		const myKey = location;
		const signedUrlExpireSeconds = 7*24*60*60;

		const url = getS3SignedUrl(s3, new GetObjectCommand({
			Bucket: myBucket,
			Key: myKey
		}), {
			expiresIn: signedUrlExpireSeconds
		})
		console.log("S3 Signed URL: "+ url);
		return new fileSignedUrl(url);		
	}	
	
}

export{getSignedUrl};
