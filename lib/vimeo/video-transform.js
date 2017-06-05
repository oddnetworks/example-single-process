'use strict';

const _ = require('lodash');
const appLib = require('../');
const lib = require('./lib');

const formatImages = video => {
	let images = video.pictures.sizes.map(image => {
		return {
			url: image.link,
			width: image.width,
			height: image.height,
			label: `${image.width}x${image.height}`
		};
	});

	images = lib.ensureMinImageSize(images);

	return images;
};

const formatSources = video => {
	return video.files.map(file => {
		const container = file.type.split('/').pop();
		let mimeType = file.type;
		if (file.quality === 'hls') {
			mimeType = 'application/x-mpegURL';
		}
		let label = file.quality;
		if (label !== 'hls') {
			label = `${label}-${file.height}`;
		}

		return {
			url: file.link_secure,
			container,
			mimeType,
			sourceType: 'vod',
			broadcasting: false,
			height: file.height || video.height,
			width: file.width || video.width,
			maxBitrate: 0,
			label
		};
	});
};

const formatTags = video => {
	const tags = [];
	if (video.tags) {
		video.tags.forEach(tag => {
			tags.push(tag.name);
		});
	}

	return tags;
};

module.exports = app => {
	return (spec, vimeoVideo) => {
		// FYI: spec.video === vimeoVideo
		const config = app.config.vimeoProvider;
		const maxAge = spec.maxAge || config.videoMaxAge || 3600;
		const staleWhileRevalidate = spec.staleWhileRevalidate || config.videoStaleWhileRevalidate || 86400;

		// seconds
		const defaultMeta = {
			maxAge: appLib.randomWithMedian(maxAge),
			staleWhileRevalidate,
			internal: {
				searchable: true
			}
		};

		const videoId = vimeoVideo.uri.split('/').pop();
		const id = `res-vimeo-video-${videoId}`;

		const video = {
			id,
			title: vimeoVideo.name,
			description: vimeoVideo.description,
			images: formatImages(vimeoVideo),
			sources: formatSources(vimeoVideo),
			duration: vimeoVideo.duration * 1000,
			releaseDate: vimeoVideo.release_time,
			genres: [],
			cast: [],
			tags: formatTags(vimeoVideo),
			meta: _.merge(defaultMeta, spec.meta)
		};

		video.meta.source = {
			spec: _.clone(spec),
			upstream: vimeoVideo
		};

		delete video.meta.source.spec.video;
		return video;
	};
};
