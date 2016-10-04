'use strict';

const express = require('express');
const oddcast = require('oddcast');
const oddworks = require('@oddnetworks/oddworks');
const exampleData = require('@oddnetworks/oddworks-example-data');

const StoresUtils = oddworks.storesUtils;
const ServicesUtils = oddworks.servicesUtils;

const config = require('./config');

const bus = oddcast.bus();
const app = express();

// Initialize oddcast for events, commands, requests
bus.events.use(config.oddcast.events.options, config.oddcast.events.transport);
bus.commands.use(config.oddcast.commands.options, config.oddcast.commands.transport);
bus.requests.use(config.oddcast.requests.options, config.oddcast.requests.transport);

module.exports = StoresUtils.load(bus, config.stores)
	.then(() => {
		return ServicesUtils.load(bus, config.services);
	})

	// Seed the data and pass the services along
	.then(services => {
		if (config.seedScript) {
			return require(config.seedScript)(bus).then(() => services); // eslint-disable-line
		}
		return exampleData.nasa(bus).then(() => services);
	})
	.then(services => {
		app.disable('x-powered-by');
		app.set('trust proxy', 'loopback, linklocal, uniquelocal');

		app.use(oddworks.middleware['header-parser']());
		app.use(oddworks.middleware['body-parser-json']());

		app.use(oddworks.middleware['request-accept']());
		app.use(oddworks.middleware['request-options']());
		app.use(oddworks.middleware['request-authenticate']({bus}));

		app.use(services.identity.router({types: []}));
		app.use(services.catalog.router());
		app.get('/', (req, res, next) => {
			res.body = {
				message: 'Server is running'
			};
			next();
		});

		app.use(oddworks.middleware['response-general']());
		app.use(oddworks.middleware['response-vary']());
		app.use(oddworks.middleware['response-cache-control']());
		app.use(oddworks.middleware['response-json-api']({bus}));
		app.use(oddworks.middleware['response-send']());
		app.use((err, req, res, next) => {
			console.error(err.stack);

			if (err.isBoom) {
				return res.sendStatus(err.output.payload.statusCode);
			}

			res.sendStatus(500);
			next();
		});

		if (!module.parent) {
			app.listen(config.express.port, () => {
				console.info(`Server is running on port: ${config.express.port}`);
			})
			.on('error', error => {
				console.error(error.stack);
			});
		}

		return {bus, app};
	})
	.catch(err => console.error(err.stack));
