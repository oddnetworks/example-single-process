'use strict';

const Promise = require('bluebird');

module.exports = function initializeClose(app) {
	const debug = app.debug('initializeClose');
	debug('initializing');

	app.API.close = function () {
		return Promise.all(app.API.close.closers.map(fn => {
			return fn();
		}));
	};

	app.API.close.closers = [];

	app.API.close.addCloser = function (fn) {
		app.API.close.closers.push(fn);
	};

	debug('initialized');
};
