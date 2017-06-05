'use strict';

module.exports = function (app) {
	const log = app.API.log;
	return function accessLogMiddleware(req, res, next) {
		log.debug({req: {
			method: req.method,
			path: req.url
		}}, 'client request');

		next();
	};
};
