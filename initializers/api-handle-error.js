'use strict';

const _ = require('lodash');

module.exports = function (app) {
	const debug = app.debug('initializeHandleError');
	debug('initializing');

	function reportError(err, req) {
		if (req) {
			const id = _.uniqueId('request-id-');
			app.API.log.error({req}, id);
			app.API.log.error(err, id);
		} else {
			app.API.log.error(err);
		}

		if (app.environment === 'development') {
			console.error('Error Report:');
			// Express 'error' event handling restructures the Error object
			// which causes the err.stack not report the error name and message.
			if (err.stack && err.message) {
				const stack = err.stack.split('\n');
				stack.splice(0, 1, `${err.name || 'Error'}: ${err.message}`);
				err.stack = stack.join('\n');
			}
			console.error(err.stack || err.message || err);
		}
	}

	app.API.handleError = function handleError(err, meta) {
		reportError(err);
		if (app.API.opbeat) {
			try {
				app.API.opbeat.captureError(err, meta);
			} catch (err) {
				reportError(err);
			}
		}
	};

	debug('initialized');
	return app;
};
