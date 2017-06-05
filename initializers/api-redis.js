'use strict';

const Promise = require('bluebird');
const redis = require('redis');
const fakeredis = require('fakeredis');

module.exports = function inintializeRedis(app) {
	const debug = app.debug('initializeRedis');
	debug('initializing');

	if (!app.config.redis) {
		debug('skipping Redis initialization due to lack of config.redis');
		return app;
	}

	Promise.promisifyAll(redis.RedisClient.prototype);
	Promise.promisifyAll(redis.Multi.prototype);
	Promise.promisifyAll(fakeredis.RedisClient.prototype);
	Promise.promisifyAll(fakeredis.Multi.prototype);

	if (app.config.redis.url === 'fakeredis') {
		app.API.redis = fakeredis.createClient();
	} else {
		app.API.redis = redis.createClient({
			url: app.config.redis.url
		});
	}

	app.API.redis.on('error', err => {
		if (err.code === 'ECONNREFUSED') {
			app.API.handleError(new Error(
				'Redis connection refused. Is the redis server running?'
			));
		} else {
			app.API.handleError(err);
		}

		app.API.redis.end(false);
	});

	app.API.close.addCloser(() => {
		debug('closing');
		return new Promise((resolve, reject) => {
			app.API.redis.on('error', reject);

			// For some reason, we don't get the "end" or "close" event, so we use
			// setTimeout instead.
			setTimeout(() => {
				resolve(app.API.redis);
			}, 300);

			app.API.redis.end(false);
		});
	});

	debug('initialized');
};
