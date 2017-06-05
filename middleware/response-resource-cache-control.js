'use strict';

const _ = require('lodash');

module.exports = function () {
	const responseResourceCacheControl = (req, res, next) => {
		const resourceMaxAge = _.get(res, 'body.data.meta.maxAge');
		if (resourceMaxAge) {
			let cacheControl = res.get('Cache-Control') || '';
			cacheControl = cacheControl.replace(/max-age=\d*/i, `max-age=${resourceMaxAge}`);
			res.set('Cache-Control', cacheControl);
		}

		next();
	};

	return responseResourceCacheControl;
};
