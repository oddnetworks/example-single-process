'use strict';

const _ = require('lodash');
const appLib = require('../');
const lib = require('./lib');

const formatCollectionImages = pictures => {
	if (!pictures || typeof pictures !== 'object' || !Array.isArray(pictures.sizes)) {
		return [];
	}

	let images = pictures.sizes.map(image => {
		return Object.assign({}, {
			width: image.width,
			height: image.height,
			url: image.link,
			label: `${image.width}x${image.height}`
		});
	});

	images = lib.ensureMinImageSize(images);

	return images;
};

module.exports = app => {
	return (spec, album) => {
		const config = app.config.vimeoProvider;
		const maxAge = spec.maxAge || config.collectionMaxAge || 600;
		const staleWhileRevalidate = spec.staleWhileRevalidate || config.collectionStaleWhileRevalidate || 86400;

		// seconds
		const defaultMeta = {
			maxAge: appLib.randomWithMedian(maxAge),
			staleWhileRevalidate,
			internal: {
				searchable: true
			}
		};

		const albumId = album.uri.split('/').pop();
		const id = `res-vimeo-album-${albumId}`;

		const collection = {
			id,
			title: album.name,
			description: album.description,
			images: formatCollectionImages(album.pictures),
			meta: _.merge(defaultMeta, spec.meta)
		};

		collection.meta.source = {
			spec: _.clone(spec),
			upstream: album
		};

		delete collection.meta.source.spec.album;
		return collection;
	};
};
