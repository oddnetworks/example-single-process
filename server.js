'use strict';

const _ = require('lodash');
const boom = require('boom');
const express = require('express');
const oddcast = require('oddcast');
const jwt = require('jsonwebtoken');
const oddworks = require('@oddnetworks/oddworks');
const exampleData = require('@oddnetworks/oddworks-example-data');

const StoresUtils = oddworks.storesUtils;
const ServicesUtils = oddworks.servicesUtils;
const middleware = oddworks.middleware;

const config = require('./config');

const bus = oddcast.bus();
const app = express();

// Initialize oddcast for events, commands, requests
bus.events.use(config.oddcast.events.options, config.oddcast.events.transport);
bus.commands.use(config.oddcast.commands.options, config.oddcast.commands.transport);
bus.requests.use(config.oddcast.requests.options, config.oddcast.requests.transport);

module.exports = StoresUtils.load(bus, config.stores)
	// Initialize stores
	.then(() => {
		// Initialize services
		return ServicesUtils.load(bus, config.services);
	})
	// Seed the stores if config.seed is true
	.then(() => {
		if (config.seed && config.dataDir) {
			return require(`${config.dataDir}/seed`)(bus, oddworks.logger); // eslint-disable-line
		}

		return exampleData.nasa(bus, oddworks.logger);
	})

	// log out if you feel it necessary
	.then((loaded) => {
		for (let object of loaded) {
			oddworks.logger.debug(`${object.type}: ${object.id}`);
			if (object.type === 'platform') {
				const payload = {
					version: 1,
					channel: object.channel,
					platform: object.id,
					scope: ['platform']
				};

				const token = jwt.sign(payload, config.jwtSecret);
				oddworks.logger.debug(`     JWT: ${token}`);
			}
		}
	})

	// Start configuring express
	.then(() => {
		app.disable('x-powered-by');
		app.set('trust proxy', 'loopback, linklocal, uniquelocal');

		// Standard express middleware
		app.use(middleware());

		app.get('/', (req, res, next) => {
			res.body = {
				message: 'Server is running'
			};
			next();
		});

		config.middleware(app);

		app.use((req, res) => res.send(res.body));

		// 404
		app.use((req, res, next) => next(boom.notFound()));

		// 5xx
		app.use(function handleError(err, req, res, next) {
			if (err) {
				var statusCode = _.get(err, 'output.statusCode', (err.status || 500));
				if (!_.has(err, 'output.payload')) {
					err = boom.wrap(err, err.status);
				}

				res.status(statusCode || 500);
				res.body = err.output.payload;
				res.send(res.body);
			} else {
				next();
			}
		});

		if (!module.parent) {
			app.listen(config.port, () => {
				oddworks.logger.info(`Server is running on port: ${config.port}`);
			})
			.on('error', error => {
				oddworks.logger.error(`${error}`);
			});
		}

		return {bus, app};
	})
	.catch(err => oddworks.logger.error(err.stack));
