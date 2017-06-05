'use strict';

const oddworks = require('@oddnetworks/oddworks');
const vimeoProvider = require('oddworks-vimeo-provider');
const vimeoCollectionTransform = require('../lib/vimeo/collection-transform');
const vimeoVideoTransform = require('../lib/vimeo/video-transform');

module.exports = function (app) {
	const debug = app.debug('initializeOddworksServices');
	debug('initializing');

	app.API.oddworks = Object.create(null);

	oddworks.middleware['response-transform'] = require('../middleware/response-transform');

	return Promise.resolve(null)

		// Initialize the Redis store
		.then(() => {
			if (app.API.redis) {
				debug('redis store : initializing');
				const options = {
					redis: app.API.redis,
					types: app.config.redis.types
				};

				return oddworks.stores.redis(app.API.bus, options).then(store => {
					app.API.oddworks.redisStore = store;
					return null;
				});
			}

			debug('redis store : skipping');
		})

		// Initialize the reds store
		.then(() => {
			if (app.API.redis) {
				debug('reds store : initializing');
				const options = {
					redis: app.API.redis,
					store: app.API.oddworks.redisStore,
					types: app.config.reds.types,
					autoindex: true
				};

				return oddworks.stores.reds(app.API.bus, options).then(store => {
					app.API.oddworks.reds = store;
					return null;
				});
			}

			debug('reds store : skipping');
			return null;
		})

		// Initialize the identity service
		.then(() => {
			debug('identity');
			const config = app.config.identity;
			return oddworks.services.identity(app.API.bus, config).then(service => {
				app.API.oddworks.identityService = service;
				return null;
			});
		})

		// Initialize the catalog service
		.then(() => {
			debug('catalog');
			const config = app.config.catalog;
			return oddworks.services.catalog(app.API.bus, config).then(service => {
				app.API.oddworks.catalogService = service;
				return null;
			});
		})

		// Initialize the Vimeo provider
		.then(() => {
			debug('Vimeo provider');

			const options = {
				bus: app.API.bus,
				collectionTransform: vimeoCollectionTransform(app),
				videoTransform: vimeoVideoTransform(app)
			};

			return vimeoProvider.initialize(options).then(provider => {
				app.API.oddworks.vimeoProvider = provider;
				return null;
			});
		})

		.then(() => {
			debug('initialized');
			return app;
		});
};
