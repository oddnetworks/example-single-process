'use strict';

const _ = require('lodash');
const filepath = require('filepath');
const createApp = require('./app');

let app;
const executedInitializers = [];

// Serially loads initializers and makes sure each one returns
// a promise, even if it doesn't.
//
// Params:
// initializers - Array of initializer Functions
// options.appdir - The application root directory path String
// options.environment - The environment String
exports.initializer = function initializer(initializers, options) {
	options = options || {};

	if (!app) {
		const appdir = options.appdir && _.isObject(options.appdir) ?
			options.appdir : filepath.create(options.appdir);

		const packageJSON = require(appdir.append('package.json').toString());

		const environment = options.environment;

		// Create the app Object which will get passed through
		// all the initializers
		app = createApp({
			appdir,
			packageJSON,
			environment
		});
	}

	// Serially load initializers, passing the app object into each one.
	return initializers.reduce((promise, init, i) => {
		// Don't re-execute initializers that hav already been loaded.
		if (executedInitializers.indexOf(init) !== -1) {
			return promise.then(_.constant(app));
		}

		return promise.then(app => {
			let val = null;
			try {
				val = init(app);
			} catch (err) {
				console.error(`Error in initializer "${init.name || i}"`, err.message, err.stack);
				return Promise.reject(err);
			}

			return Promise.resolve(val).then(() => {
				executedInitializers.push(init);
				return app;
			});
		});
	}, Promise.resolve(app));
};

// options.environment - process.env.NODE_ENV
// options.appdir - Root directory String.
exports.initializeApp = function initializeApp(options) {
	options = options || {};

	const environment = options.environment || 'development';
	const appdir = options.appdir || filepath.create(__dirname).dir();

	const initializers = [
		require('../initializers/config'),
		require('../initializers/api-close'),
		require('../initializers/api-log'),
		require('../initializers/api-handle-error'),
		require('../initializers/api-bus'),
		require('../initializers/api-redis'),
		require('../initializers/api-oddworks'),
		require('../initializers/api-express'),
		require('../initializers/api-server'),
		require('../initializers/routes')
	];

	return exports.initializer(initializers, {environment, appdir});
};
