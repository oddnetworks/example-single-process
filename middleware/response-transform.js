'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const createStrictTransform = require('../lib/strict-transform');

// options.bus
// options.transforms
module.exports = function (options) {
	const bus = options.bus;

	const transforms = Object.keys(options.transforms).reduce((transforms, key) => {
		const factory = options.transforms[key];
		transforms[key] = factory(bus);
		return transforms;
	}, Object.create(null));

	const strictTransform = createStrictTransform(bus);

	function isRelationshipRoute(req) {
		const url = _.get(req, 'url', '');
		const regex = /\/relationships\//;
		return regex.test(url.toLowerCase());
	}

	return function responseTransform(req, res, next) {
		const type = res.body.data.type;
		const channel = _.get(res, 'body.meta.channel');

		if (!isRelationshipRoute(req)) {
			if (channel && type) {
				const transform = (transforms[channel] || {})[type];
				if (transform) {
					bus.broadcast({level: 'debug'}, {
						message: `using transform for ${channel}:${type}`
					});
					return Promise.resolve(transform(res.body)).then(body => {
						res.body = body;
						next();
					}).catch(next);
				}

				bus.broadcast({level: 'debug'}, {
					message: `using strict transform for ${channel}:${type}`
				});
			}

			res.body = strictTransform(res.body, req.identity);
		}

		return next();
	};
};
