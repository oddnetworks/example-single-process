'use strict';

const Boom = require('boom');

module.exports = function (app) {
	return function notFound(req, res, next) {
		app.API.log.warn({path: req.path}, 'path not found');
		next(Boom.notFound('missing'));
	};
};
