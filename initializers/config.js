'use strict';

module.exports = function (app) {
	const debug = app.debug('initializeConfig');
	debug('initializing');
	debug('environment : %s', app.environment);

	if (!process.env.JWT_SECRET) {
		throw new Error('env var JWT_SECRET is required');
	}

	app.config.log = {
		level: app.environment === 'test' ? 'fatal' : (process.env.LOG_LEVEL || 'debug').toLowerCase()
	};

	app.config.server = {
		port: normalizePort(process.env.PORT) || 3000,
		host: process.env.HOST || '0.0.0.0',
		trustProxy: 'loopback'
	};

	app.config.oddcast = {
		events: {
			options: {}
		},
		commands: {
			options: {}
		},
		requests: {
			options: {}
		}
	};

	app.config.store = {
		// Ordering of types is very important because of this pattern
		// matching bug in Oddcast:
		// https://github.com/oddnetworks/oddcast/issues/26
		types: [
			'channel',
			'collectionSpec',
			'collection',
			'liveEvent',
			'platform',
			'progress',
			'promotion',
			'viewer',
			'videoSpec',
			'video',
			'view'
		]
	};

	//
	// Initializers will only initialize stores which are fully configured.
	//

	// Redis
	if (process.env.REDIS_URL) {
		// Configure REDIS_URL as "fakeredis" to use fakeredis.
		app.config.redis = {
			url: process.env.REDIS_URL || 'redis://localhost:6379',
			types: app.config.store.types
		};

	// Or bail with fakeredis
	} else {
		app.config.redis = {
			url: 'fakeredis',
			types: app.config.store.types
		};
	}

	// Search
	app.config.reds = {
		types: ['collection', 'video']
	};

	app.config.identity = {
		jwtSecret: process.env.JWT_SECRET,
		jwtIssuer: process.env.JWT_ISSUER
	};

	app.config.catalog = {};

	app.config.requestMiddleware = [
		// CORS headers need to be set before an OPTIONS request.
		{middleware: 'response-cors'},
		// OPTIONS requests need to be handled before authentication
		{middleware: 'request-options'},
		{middleware: 'request-authenticate'},
		{middleware: 'request-verify'},
		{middleware: 'request-accept'},
		{middleware: 'body-parser-json'},
		{middleware: 'request-json-api'}
	];

	app.config.responseMiddleware = [
		{middleware: 'response-general'},
		{
			middleware: 'response-cache-control',
			maxAge: parseInt(process.env.MAX_AGE, 10) || 600,
			staleWhileRevalidate: parseInt(process.env.STALE_WHILE_REVALIDATE, 10) || 604800,
			staleIfError: parseInt(process.env.STALE_IF_ERROR, 10) || 604800
		},
		{middleware: 'response-vary'},
		{
			middleware: 'response-json-api',
			baseUrlPrefix: '/v2',
			excludePortFromLinks: (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'PRODUCTION'),
			allowPartialIncluded: Boolean(process.env.ALLOW_PARTIAL_INCLUDED)
		},
		{middleware: 'response-entitlements'},
		{middleware: 'response-send'}
	];

	app.config.vimeoProvider = {
		collectionMaxAge: 600, // seconds
		videoMaxAge: 3600, // seconds
		collectionStaleWhileRevalidate: 86400, // seconds
		videoStaleWhileRevalidate: 86400 // seconds
	};

	debug('initialized');
	return app;
};

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
