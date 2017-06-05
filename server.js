'use strict';

const _ = require('lodash');
const initialize = require('./lib/initialize');

exports.main = function () {
	return initialize
					.initializeApp({environment: process.env.NODE_ENV})
					.then(app => {
						return app.API.server.start().then(_.constant(app));
					});
};

if (require.main === module) {
	exports.main();
}
