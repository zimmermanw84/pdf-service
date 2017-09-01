const Koa = require('koa');
const app = module.exports = new Koa();

const logger = require('koa-logger');
const router = require('koa-router')();
const koaBody = require('koa-body');
const util = require('util');
const PdfManager = require('./lib/pdf-manager');

// middleware
app.use(logger());

app.use(koaBody());

// pretty cool
app.use(async function(ctx, next) {
	try {
		await next();
	}
	catch (err) {
		ctx.status = err.status || 500;
		ctx.type = 'json';
		ctx.body = { error: err.message };
		ctx.app.emit('error', err, ctx);
	}
});

// error handler
app.on('error', function(err) {
	if (process.env.NODE_ENV != 'test') {
		// send error to rollbar or some such
		util.error(err.message);
	}
});

// route handlers
// Move this to some controller or route handler file
router.post('/html-to-pdf', async (ctx) => {
	const pdfManager = await PdfManager.init();
	const s3 = require('./lib/s3');
	const { payload } = ctx.request.body;

	if (payload) {
		try {
			let filenameAndPath = await pdfManager.htmlToPdf(payload);
			ctx.body = await s3.uploadAndSign(filenameAndPath);
		}
		catch (err) {
			throw err;
		}
	}
	else {
		throw Error('No Payload Provided');
	}
});

app.use(router.routes());

if (!module.parent) {
	const PORT = 3000;
	app.listen(PORT, () => {
		util.log(`Pdf server running on port ${PORT}`);
	});
}