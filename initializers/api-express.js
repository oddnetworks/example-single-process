'use strict';

const express = require('express');

module.exports = function (app) {
	const debug = app.debug('initializeExpress');
	debug('initializing');

	app.API.express = express();
	app.API.express.disable('x-powered-by');

	debug('initialized');
	return app;
};
