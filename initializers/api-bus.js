'use strict';

const oddcast = require('oddcast');
const _ = require('lodash');

module.exports = function (app) {
	const debug = app.debug('initializeBus');
	debug('initializing');

	app.API.bus = oddcast.bus();

	// Initialize message bus for events, commands, requests

	app.API.bus.events.use(
		app.config.oddcast.events.options,
		oddcast.inprocessTransport()
	);

	app.API.bus.commands.use(
		app.config.oddcast.commands.options,
		oddcast.inprocessTransport()
	);

	app.API.bus.requests.use(
		app.config.oddcast.requests.options,
		oddcast.inprocessTransport()
	);

	// Add error event handlers

	app.API.bus.events.on('error', err => {
		app.API.log.error('error event from bus.events channel');
		app.API.handleError(err);
	});

	app.API.bus.requests.on('error', err => {
		app.API.log.error('error event from bus.requests channel');
		app.API.handleError(err);
	});

	app.API.bus.commands.on('error', err => {
		app.API.log.error('error event from bus.commands channel');
		app.API.handleError(err);
	});

	// Add Oddcast event handlers
	function pluckEventMessage(event, defaultMessage) {
		const message = event.message || event.msg;
		if (message) {
			return message;
		}

		return _.isString(event) ? event : defaultMessage;
	}

	app.API.bus.observe({level: 'error'}, event => {
		let error;

		if (event.stack) {
			error = event;
		} else {
			error = event.error;
		}

		if (error) {
			app.API.handleError(error, event.meta || event);
		} else {
			app.API.log.error({event}, pluckEventMessage(event, 'generic error event'));
		}

		return null;
	});

	app.API.bus.observe({level: 'warn'}, event => {
		app.API.log.warn({event}, pluckEventMessage(event, 'generic warn event'));
		return null;
	});

	app.API.bus.observe({level: 'info'}, event => {
		app.API.log.info({event}, pluckEventMessage(event, 'generic info event'));
		return null;
	});

	app.API.bus.observe({level: 'debug'}, event => {
		app.API.log.debug({event}, pluckEventMessage(event, 'generic debug event'));
		return null;
	});

	// Add the bus to middleware configs

	app.config.requestMiddleware.forEach(config => {
		config.bus = app.API.bus;
	});

	app.config.responseMiddleware.forEach(config => {
		config.bus = app.API.bus;
	});

	debug('initialized');
};
