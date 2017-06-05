'use strict';

const Promise = require('bluebird');

module.exports = function (app) {
	const bus = app.API.bus;
	const types = app.config.store.types;

	// args.channel
	return function dumpChannelData(args) {
		const channelId = args.channel;

		return types.reduce((promise, type) => {
			return promise.then(docs => {
				console.log('getting %s', type);

				if (type === 'channel') {
					return bus.query(
						{role: 'store', cmd: 'get', type: 'channel'},
						{type: 'channel', id: channelId}
					).then(channel => {
						docs.push(channel);
						return docs;
					});
				}

				return bus.query(
					{role: 'store', cmd: 'scan', type},
					{channel: channelId, limit: 10000}
				).then(results => {
					return docs.concat(results);
				});
			});
		}, Promise.resolve([]));
	};
};
