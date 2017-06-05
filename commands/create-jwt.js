'use strict';

module.exports = function (app) {
	const bus = app.API.bus;

	// args.audience - Array of Strings *required*
	// args.subject - String *required if admin*
	// args.channel - String *required if non admin*
	// args.platform - String *required if non admin*
	// args.user - String
	return function createJwt(args) {
		return bus.query({role: 'identity', cmd: 'sign'}, args);
	};
};
