'use strict';

const debug = require('debug');

// spec.appdir
// spec.packageJSON
// spec.environment
// spec.name (default=spec.packageJSON.name)
// spec.config (default={})
module.exports = function (spec) {
	const app = Object.create(null);
	const packageJSON = spec.packageJSON;
	const name = spec.name || packageJSON.name;

	Object.defineProperties(app, {
		name: {
			enumerable: true,
			value: name
		},
		version: {
			enumerable: true,
			value: spec.version || packageJSON.version
		},
		appdir: {
			enumerable: true,
			value: spec.appdir
		},
		packageJSON: {
			enumerable: true,
			value: packageJSON
		},
		environment: {
			enumerable: true,
			value: spec.environment
		},
		config: {
			enumerable: true,
			value: Object.assign(Object.create(null), spec.configs)
		},
		debug: {
			enumerable: true,
			value(modname) {
				return debug(`${name}:${modname}`);
			}
		},
		API: {
			enumerable: true,
			value: Object.create(null)
		}
	});

	return app;
};
