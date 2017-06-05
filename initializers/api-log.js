'use strict';

const bunyan = require('bunyan');

module.exports = function (app) {
	const debug = app.debug('initializeLogger');
	debug('initializing');

	app.API.log = bunyan.createLogger({
		name: app.name,
		level: app.config.log.level
	});

	debug('initialized');
	return app;
};
