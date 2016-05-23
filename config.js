'use strict';

const oddcast = require('oddcast');
const oddworks = require('@oddnetworks/oddworks');
const winston = require('winston');

// In your config, this would be real redis client
const redis = require('fakeredis').createClient();

// Require the stores and/or services you want to use
const memoryStore = oddworks.stores.memory;
const redisStore = oddworks.stores.redis;
const redisSearchStore = oddworks.stores.redisSearch;
const identityService = oddworks.services.identity;
const catalogService = oddworks.services.catalog;
const eventsService = oddworks.services.events;
const jsonAPIService = oddworks.services.jsonApi;
// As an example, if you wanted to run a sync service, you
// would include the service module, then look below in the
// service configuration to see how it is used
// const syncService = require('../services/sync');

// The following should be set in your environment
// We use these values for demonstration purposes
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const DATA_DIR = process.env.DATA_DIR;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || 'UA-XXXX-XX';

// Set up the logger
const UTC_OFFSET = 0;
const LOG_LEVEL = ENVIRONMENT === 'production' ? 'info' : 'debug';
oddworks.logger.configure({
	transports: [
		new winston.transports.Console({
			level: LOG_LEVEL,
			colorize: true,
			timestamp() {
				return new Date().format('YYYY-MM-DDThh:mm:ss.SSSZ', UTC_OFFSET); // eslint-disable-line no-use-extend-native/no-use-extend-native
			},
			handleExceptions: true
		})
	]
});

module.exports = {
	env: ENVIRONMENT,
	port: PORT,
	dataDir: DATA_DIR,
	seed: true,

	oddcast: {
		// override the default oddcast options/transports here
		events: {
			options: {},
			transport: oddcast.inprocessTransport()
		},
		commands: {
			options: {},
			transport: oddcast.inprocessTransport()
		},
		requests: {
			options: {},
			transport: oddcast.inprocessTransport()
		}
	},

	stores: [
		{
			store: memoryStore,
			options: {types: ['platform', 'channel']}
		},
		{
			store: redisStore,
			options: {redis, types: ['collection', 'promotion', 'video', 'view']}
		},
		{
			store: redisSearchStore,
			options: {redis, types: ['collection', 'video']}
		}
	],

	services: [
		{
			service: identityService,
			options: {jwtSecret: JWT_SECRET}
		},
		{
			service: catalogService,
			options: {}
		},
		{
			service: jsonAPIService,
			options: {}
		},
		{
			service: eventsService,
			options: {
				redis,
				analyzers: [
					eventsService.analyzers.googleAnalytics({trackingId: GOOGLE_ANALYTICS_ID})
				]
			}
		}
		// Adding a sync service with a single provider
		// ,{
		// 	service: syncService,
		// 	options: {
		// 		interval: (60 * 5 * 1000),
		// 		providers: [
		// 			syncService.providers.vimeo({token: process.env.VIMEO_APIKEY})
		// 		]
		// 	}
		// }
	],

	middleware: function (app) {
		// Decode the JWT set on the X-Access-Token header and attach to req.identity
		app.use(identityService.middleware.verifyAccess({header: 'x-access-token'}));

		// Decode the JWT set on the Authorization header and attach to req.authorization
		// app.use(authorizationService.middleware({header: 'Authorization'}));

		// Attach auth endpoints
		// POST /auth/platform/code
		// POST /auth/user/authorize
		// POST /auth/platform/token
		// GET /auth/user/:clientUserID/platforms
		// DELETE /auth/user/:clientUserID/platforms/:platformUserProfileID
		// app.use('/auth', authorizationService.router());

		// Attach events endpoint
		// POST /events
		// app.use('/events', eventsService.router());

		// Attach config endpoint
		// GET /config
		app.use('/', identityService.router());

		// Attach catalog endpoints with specific middleware, the authorization service is passed in as middleware to protect/decorate the entities as well
		// GET /videos
		// GET /videos/:id
		// GET /collections
		// GET /collections/:id
		// GET /views
		// GET /views/:id
		app.use(catalogService.router({middleware: []}));

		app.use(eventsService.router());

		// Serialize all data into the JSON API Spec
		app.use(jsonAPIService.middleware.formatter());
		app.use(jsonAPIService.middleware.deformatter());
	}
};

// Warn the user that they should override the default configuration
oddworks.logger.warn('Config Not Found');
oddworks.logger.warn('Loading default server configuration.');
oddworks.logger.warn('You may override defaults by creating your own configuration file like so:');
oddworks.logger.warn('\t$ cp ./config.js ./my-config.js');
oddworks.logger.warn('and using it in ./server.js');
