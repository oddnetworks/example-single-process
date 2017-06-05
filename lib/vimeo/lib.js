'use strict';

const _ = require('lodash');

exports.ensureMinImageSize = images => {
	const minSize = _.find(images, image => {
		return (image || {}).width >= 800;
	});

	if (!minSize) {
		let link;
		const tmpImage = images[0];
		link = tmpImage.link.replace(`${tmpImage.width}x`, '800x');
		link = link.replace(`${tmpImage.height}.`, '450.');
		images.push({
			width: 800,
			height: 450,
			label: '800x450',
			link
		});
	}

	return images;
};
