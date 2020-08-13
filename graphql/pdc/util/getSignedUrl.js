//@@@PDC-1122 add signed url
import AWS from 'aws-sdk';

class fileSignedUrl {
  constructor(url) {
    this.url = url;
  }
}

const getSignedUrl = function (location) {
	var s3 = new AWS.S3({
			accessKeyId: process.env.AWS_S3_READ_ACCESS_KEY,
			secretAccessKey: process.env.AWS_S3_READ_SECRET_KEY
	});
					
	const myBucket = process.env.AWS_S3_PDC_BUCKET;
	const myKey = location;
	const signedUrlExpireSeconds = 48 * 60 * 60

	const url = s3.getSignedUrl('getObject', {
		Bucket: myBucket,
		Key: myKey,
		Expires: signedUrlExpireSeconds
	})
	return new fileSignedUrl(url);
}

export{getSignedUrl};