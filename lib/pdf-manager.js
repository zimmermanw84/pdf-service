'use strict';

const puppeteer = require('puppeteer');
const util = require('util');
const Promise = require('bluebird');
const mkpathAsync = Promise.promisify(require('mkpath'));
const tempFilePath = require('../config/config').pdf.TMP_FILE_DIR;

let instance;
let browser;

class PdfManager {
	static async init() {
		// init browser
		await PdfManager.getBrowser();
		// return instance
		return PdfManager.getInstance();
	}

	async htmlToPdf(html) {
		try {
			const page = await browser.newPage();
			const filenameAndPath = `${tempFilePath}/${Math.round((new Date()).getTime() / 1000)}.pdf`;
			await page.goto(`data:text/html,\ufeff${html}`, { waitUntil: 'networkidle' });
			await mkpathAsync(tempFilePath, parseInt('0777', 8));
			await page.pdf({path: filenameAndPath, format: 'A4'});

			return filenameAndPath;
		}
		catch(err) {
			throw err;
		}
	}

	static async getBrowser() {
		if (!browser) {
			browser = await puppeteer.launch();
		}
		return browser;
	}

	static getInstance() {
		if (!instance) {
			instance = new PdfManager();
		}
		return instance;
	}
}

process.on('SIGTERM', async () => {
	if (browser) {
		browser.close();
		// not really needed app dies in this case
		browser = null;
	}
});

module.exports = PdfManager;