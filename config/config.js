const path = require('path');

module.exports = {
	s3: {
		BUCKET: process.env.AWS_S3_BUCKET,
		SECRET_KEY: process.env.AWS_SECRET_KEY,
		ACCESS_KEY: process.env.AWS_ACCESS_KEY,
		REGION: process.env.AWS_REGION,
		BUCKET_DIR: process.env.BUCKET_DIR,
	},
	pdf: {
		TMP_FILE_DIR: process.env.TMP_FILE_DIR || path.resolve('../tmp/')
	}
};