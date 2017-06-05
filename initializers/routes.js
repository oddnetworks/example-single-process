'use strict';

const express = require('express');
const oddworks = require('@oddnetworks/oddworks');

const notFound = require('../middleware/not-found');
const accessLog = require('../middleware/access-log');
const responseResourceCacheControl = require('../middleware/response-resource-cache-control');

module.exports = function (app) {
	const debug = app.debug('initializeRoutes');
	debug('initializing');

	const requestMiddleware = oddworks.middleware.load(
		app.config.requestMiddleware
	);

	const responseMiddleware = oddworks.middleware.load(
		app.config.responseMiddleware
	);

	// Access logs for all routes.
	app.API.express.use(accessLog(app));

	const apiV2 = express.Router(); // eslint-disable-line babel/new-cap, new-cap

	// Request middleware is added before routes are defined.
	apiV2.use(requestMiddleware);

	apiV2.use((req, res, next) => {
		const log = app.API.log;
		if (req.method.toUpperCase() === 'PATCH') {
			log.debug({
				req: {
					method: req.method,
					path: req.url,
					body: req.body
				}
			});
		}
		next();
	});

	// Define identity service routes
	app.API.oddworks.identityService.router({
		types: ['channel', 'platform', 'viewer'],
		router: apiV2
	});

	// Define catalog service routes
	app.API.oddworks.catalogService.router({
		types: ['collection', 'video', 'view', 'promotion'],
		specTypes: ['collectionSpec', 'videoSpec'],
		router: apiV2
	});

	// Place the Resource Cache Controll middleware before the transform since it strips maxAge from the body
	responseMiddleware.splice(5, 0, responseResourceCacheControl());

	// Response middleware is added after the routes are defined.
	apiV2.use(responseMiddleware);

	// Mount our Router
	// http://expressjs.com/en/guide/routing.html
	app.API.express.use('/v2', apiV2);

	// Catch missed routes
	app.API.express.use(notFound(app));

	// Error handling middleware must go last, after all other middleware
	// and routes have been defined.
	app.API.express.use(oddworks.middleware['error-handler']({
		handler: app.API.handleError
	}));

	debug('initialized');
	return app;
};
