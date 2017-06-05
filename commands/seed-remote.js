'use strict';

const Promise = require('bluebird');
const request = require('request');

module.exports = function () {
	// args.source
	// args.host
	// args.jwt
	return function seed(args) {
		const source = args.source;
		const host = args.host;
		const jwt = args.jwt;
		const postDocument = createUploader(host, jwt);

		const files = [];

		source.recurse(file => {
			if (file.extname() === '.json') {
				files.push(file);
			}
		});

		const docs = files.map(file => {
			return file.read().then(text => {
				try {
					return JSON.parse(text);
				} catch (err) {
					console.error(`JSON error in ${file.toString()}`);
					return Promise.reject(err);
				}
			});
		});

		return Promise.all(docs).then(docs => {
			const promises = docs.map(doc => {
				return postDocument(doc);
			});

			return Promise.all(promises);
		});
	};
};

function createUploader(baseUrl, jwt) {
	console.log('Seeding %s', baseUrl);

	// Generic promisifed request - response
	function makeRequest(params) {
		return new Promise((resolve, reject) => {
			request(params, (err, res) => {
				if (err) {
					return reject(err);
				}
				return resolve(res);
			});
		});
	}

	function patch(doc) {
		const params = {
			method: 'PATCH',
			url: `${baseUrl}/v2/${doc.type}s/${doc.id}`,
			headers: {
				Authorization: `Bearer ${jwt}`
			},
			json: {data: doc}
		};

		return makeRequest(params).then(res => {
			console.log(`${res.statusCode} ${params.url} :: ${doc.id}`);

			if (res.statusCode !== 200 && res.statusCode !== 201) {
				console.log(res.body);
			}

			return null;
		});
	}

	function post(doc) {
		const params = {
			method: 'POST',
			url: `${baseUrl}/v2/${doc.type}s/`,
			headers: {
				Authorization: `Bearer ${jwt}`
			},
			json: {data: doc}
		};

		return makeRequest(params).then(res => {
			console.log(`${res.statusCode} ${params.url} :: ${doc.id}`);

			if (res.statusCode === 409) {
				return patch(doc);
			}

			if (res.statusCode !== 201) {
				console.log(res.body);
			}

			return null;
		});
	}

	return function updateDocument(doc) {
		if (doc.type === 'channel') {
			return patch(doc);
		}

		return post(doc);
	};
}
