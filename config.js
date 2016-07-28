'use strict';

const oddcast = require('oddcast');
const oddworks = require('@oddnetworks/oddworks');

const redis = require('fakeredis').createClient();

// Require the stores and/or services you want to use
const redisStore = oddworks.stores.redis;
const redisSearchStore = oddworks.stores.redisSearch;
const identityService = oddworks.services.identity;
const catalogService = oddworks.services.catalog;

module.exports = {
	env: process.env.NODE_ENV,

	express: {
		port: process.env.PORT,
		jwtSecret: process.env.JWT_SECRET
	},

	oddcast: {
		events: {
			options: {},
			transport: oddcast.inprocessTransport()
		},
		commands: {
			options: {},
			transport: oddcast.inprocessTransport()
		},
		requests: {
			options: {},
			transport: oddcast.inprocessTransport()
		}
	},

	stores: [
		{
			store: redisStore,
			options: {redis, types: ['channel', 'platform', 'collection', 'promotion', 'video', 'view', 'user']}
		},
		{
			store: redisSearchStore,
			options: {redis, types: ['collection', 'video']}
		}
	],

	services: [
		{
			service: identityService,
			options: {jwtSecret: process.env.JWT_SECRET}
		},
		{
			service: catalogService,
			options: {}
		}
	]
};
