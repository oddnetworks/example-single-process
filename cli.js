'use strict';

const Promise = require('bluebird');
const yargs = require('yargs');
const filepath = require('filepath');
const createJwt = require('./commands/create-jwt');
const dumpChannelData = require('./commands/dump-channel-data');
const seedRemote = require('./commands/seed-remote');
const initialize = require('./lib/initialize');

exports.main = function () {
	const args = yargs
		.usage('Usage: $0 <command> [options]')
		.command('jwt', 'Generate a JWT', {
			subject: {
				alias: 's',
				describe: 'Will make this an Admin token if present'
			},
			channel: {
				alias: 'c',
				describe: 'Required for consumer API access'
			},
			platform: {
				alias: 'p',
				describe: 'Required for consumer API access'
			},
			viewer: {
				alias: 'u',
				describe: 'If the viewer is authenticated'
			}
		})
		.command('seed', 'Seed the system with seed data', {
			host: {
				alias: 'h',
				default: 'http://localhost:3000',
				describe: 'The hostname and port of the server to seed.'
			},
			source: {
				alias: 's',
				describe: 'A directory that contains the seed data.'
			},
			jwt: {
				alias: 'j',
				describe: 'JSON Web Token with subject and channel.'
			}
		})
		.command('dump-channel', 'Dump an entire channel of data', {
			channel: {
				alias: 'c',
				describe: 'The channel ID to dump.',
				demand: true
			}
		})
		.help();

	const argv = args.argv;
	const command = argv._[0];

	switch (command) {
		case 'jwt':
			if (!argv.subject) {
				if (!argv.channel) {
					console.error('--channel is required when no --subject is provided.');
					process.exit(1); // eslint-disable-line xo/no-process-exit
				}
				if (!argv.platform) {
					console.error('--platform is required when no --subject is provided.');
					process.exit(1); // eslint-disable-line xo/no-process-exit
				}
			}

			console.log('Using JWT_SECRET %s', process.env.JWT_SECRET);
			return generateJwt({
				subject: argv.subject,
				channel: argv.channel,
				platform: argv.platform
			});
		case 'seed':
			if (!argv.source) {
				console.error('--source directory is required');
				process.exit(1); // eslint-disable-line xo/no-process-exit
			}

			if (!argv.jwt) {
				console.error('--jwt STRING is required');
				process.exit(1); // eslint-disable-line xo/no-process-exit
			}

			return seedRemote()({
				host: argv.host,
				source: filepath.create(argv.source),
				jwt: argv.jwt
			});
		case 'dump-channel':
			return dumpChannel({channel: argv.channel});
		default:
			console.error('A command argument is required.');
			console.error('Use the --help flag to print out help.');
			return Promise.resolve(null);
	}
};

function generateJwt(args) {
	const params = {};

	if (args.subject) {
		params.audience = ['admin', 'platform'];
		params.subject = args.subject;
		if (args.platform) {
			params.platform = args.platform;
		}
		if (args.channel) {
			params.channel = args.channel;
		}
	} else {
		params.audience = ['platform'];
		params.platform = args.platform;
		params.channel = args.channel;
	}

	return initializeApp()
		.then(app => {
			return createJwt(app)(params);
		})
		.then(token => {
			console.log(token);
		});
}

function dumpChannel(args) {
	const channelId = args.channel;
	let APP;

	const target = filepath.root().append('tmp', channelId);

	return initializeApp()
		.then(app => {
			APP = app;
			if (app.config.dynamodb) {
				console.log(`Using DynamoDB at ${app.config.dynamodb.region}`);
			} else if (app.config.redis) {
				console.log(`Using Redis at ${app.config.redis.url}`);
			}
			return dumpChannelData(app)({channel: channelId});
		})
		.then(docs => {
			console.log('Got %d docs', docs.length);
			const promises = docs.map(doc => {
				const json = JSON.stringify(doc, null, 2);
				const file = target.append(doc.type, `${doc.id}.json`);
				return file.write(json);
			});
			return Promise.all(promises);
		})
		.then(() => {
			console.log('Wrote files to %s', target.toString());
			APP.API.close();
		});
}

function initializeApp() {
	const environment = process.env.NODE_ENV || 'development';
	return initialize.initializeApp({environment});
}
