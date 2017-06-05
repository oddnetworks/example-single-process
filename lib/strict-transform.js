'use strict';

const _ = require('lodash');

const META_OMITIONS = [
	'source',
	'upstream',
	'staleWhileRevalidate',
	'maxAge',
	'internal'
];

module.exports = function (bus) {
	function warn(message, object) {
		const event = _.cloneDeep(object);
		event.message = message;
		bus.broadcast({level: 'warn'}, event);
	}

	function configResource(resource) {
		const attributes = resource.attributes;

		const defaults = {
			active: false,
			display: {
				images: {},
				colors: {},
				fonts: {}
			},
			features: {
				authentication: {},
				sharing: {},
				metrics: {}
			},
			views: {}
		};

		const data = {
			id: resource.id,
			type: resource.type,
			attributes: {
				active: Boolean(attributes.active) || defaults.active,
				display: attributes.display || defaults.display,
				features: attributes.features || defaults.features,
				views: attributes.views || defaults.views
			},
			meta: _.clone(resource.meta)
		};

		data.meta.viewer = data.attributes.viewer;

		return data;
	}

	function collectionResource(resource) {
		const attributes = resource.attributes;

		const defaults = {
			title: '',
			description: '',
			images: [],
			genres: [],
			releaseDate: null,
			relationships: {
				entities: {
					data: []
				},
				featured: {
					data: []
				},
				related: {
					data: []
				}
			}
		};

		const data = {
			id: resource.id,
			type: resource.type,
			attributes: {
				title: attributes.title || defaults.title,
				description: attributes.description || defaults.description,
				images: attributes.images || defaults.images,
				genres: attributes.genres || defaults.genres,
				releaseDate: attributes.releaseDate || defaults.releaseDate
			},
			relationships: resource.relationships || defaults.relationships,
			links: resource.links,
			// Unknown use case for 'features'.
			// 'source' is added by sync providers and can get really big.
			meta: _.omit(resource.meta, META_OMITIONS)
		};

		return data;
	}

	function videoResource(resource) {
		const attributes = resource.attributes;

		const defaults = {
			title: '',
			description: '',
			duration: 0,
			position: 0,
			complete: false,
			images: [],
			sources: [],
			genres: [],
			cast: [],
			releaseDate: null,
			relationships: {
				related: {
					data: []
				}
			}
		};

		if (!_.isNumber(attributes.duration)) {
			warn('invalid attributes.duration', resource);
		}

		const data = {
			id: resource.id,
			type: resource.type,
			attributes: {
				title: attributes.title || defaults.title,
				description: attributes.description || defaults.description,
				images: attributes.images || defaults.images,
				sources: attributes.sources || defaults.sources,
				duration: parseInt(attributes.duration, 10) || defaults.duration,
				position: parseInt(attributes.position, 10) || defaults.position,
				complete: Boolean(attributes.complete, 10) || defaults.complete,
				genres: attributes.genres || defaults.genres,
				cast: attributes.cast || defaults.cast,
				releaseDate: attributes.releaseDate || defaults.releaseDate
			},
			relationships: resource.relationships || defaults.relationships,
			links: resource.links,
			// Unknown use case for 'features'.
			// 'source' is added by sync providers and can get really big.
			meta: _.omit(resource.meta, META_OMITIONS)
		};

		return data;
	}

	function transformResource(data, identity) {
		data = data || {};
		if (!data.type) {
			warn('resource missing .type', data);
			return data;
		}

		switch (data.type) {
			case 'config':
				return configResource(data, identity);
			case 'video':
				return videoResource(data, identity);
			case 'collection':
				return collectionResource(data, identity);
			default:
				return data;
		}
	}

	return function strictTransform(body, identity) {
		let data = body.data || {};
		const links = body.links;
		const included = body.included;
		const meta = body.meta;

		if (Array.isArray(data)) {
			data = data.map(resource => {
				return transformResource(resource, identity);
			});
			body = {data};
		} else {
			data = transformResource(data, identity);
			body = {data};
			if (included) {
				body.included = included.map(resource => {
					return transformResource(resource, identity);
				});
			}
		}

		body.links = links;
		body.meta = meta;
		return body;
	};
};
