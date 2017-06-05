'use strict';

const Promise = require('bluebird');
const oddworks = require('@oddnetworks/oddworks');

// Requires:
// app.API.express
module.exports = function initializeServer(app) {
	const debug = app.debug('initializeServer');
	debug('initializing');

	const options = app.config.server;
	options.app = app.API.express;

	app.API.server = {
		instance: null,

		start() {
			debug('starting server');
			return oddworks.services.server(app.API.bus, options)
				.then(service => {
					app.API.server.instance = service.server;
					return service.server;
				});
		},

		close() {
			debug('closing server');

			if (app.API.server.instance) {
				return new Promise((resolve, reject) => {
					app.API.server.instance.close(err => {
						if (err) {
							return reject(err);
						}

						return resolve(app.API.server.instance);
					});
				});
			}

			return Promise.resolve(null);
		}
	};

	app.API.close.addCloser(app.API.server.close);
	debug('initialized');
};
