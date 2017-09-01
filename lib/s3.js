'use strict';

const AWS = require('aws-sdk');
const fs = require("fs");
const s3Config = require('../config/config').s3;
const uuid = require('uuid');
const AwsS3Form = require('aws-s3-form');
const moment = require('moment');
const url = require('url');
const path = require('path');
const mime = require('mime');

class S3 {
	constructor() {
		const accessKeyId = s3Config.ACCESS_KEY;
		const secretAccessKey = s3Config.SECRET_KEY;
		const region = s3Config.REGION;
		const bucket = s3Config.BUCKET;

		this.awsS3 = new AWS.S3({
			signatureVersion: 'v4',
			s3ForcePathStyle: true,
			region, accessKeyId, secretAccessKey,
		});

	}

	_upload(fileNameAndPath, stream) {
		let fileName = path.basename(fileNameAndPath);
		let key = `tmp/${s3Config.BUCKET_DIR}/pdf/${uuid.v4()}`;

		let uploadData = {
			Bucket: s3Config.BUCKET,
			Key: key,
			Body: stream,
			ContentType: mime.lookup(fileNameAndPath),
			ServerSideEncryption: 'AES256'
		};

		return {
			managedUpload: this.awsS3.upload(uploadData),
			key: key
		};
	}

	async uploadAndSign(fileNameAndPath) {
		let stream = fs.createReadStream(fileNameAndPath);
		let upload = this._upload(fileNameAndPath, stream);

		await upload.managedUpload.send();
		fs.unlink(fileNameAndPath);

		let params = {
			Bucket: s3Config.BUCKET,
			Key: upload.key,
			Expires: 604800
		};

		return {
			url: this.awsS3.getSignedUrl('getObject', params)
		};
	}
}

module.exports = new S3;