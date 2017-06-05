'use strict';

const Brixx = require('brixx');
const _ = require('lodash');

// Ensures the passed in object is, in fact, an Object.
// When `null` or `undefined` are passed in, ensure() returns a new Object
// created with `Object.create(null)`. Otherwise it returns the
// passed in Object.
exports.ensure = Brixx.ensure;

// Calls `Object.freeze()` recursively on the passed in Object.
// deepFreeze() will skip the `arguemnts`, `caller`, `callee` and `prototype`
// properties of a Function. deepFreeze() will throw if passed null or
// undefined just like `Object.freeze()` would.
exports.deepFreeze = Brixx.deepFreeze;

// Check to see if the passed in Object exists.
// Returns false for null, undefined, or NaN.
// Returns true for everything else.
exports.exists = Brixx.exists;

// A different way to stringify an Object, other than .toString().
// 1) Returns an empty string for null, undefined or NaN.
// 2) Returns the special '[object Function]' String for Functions.
// 3) Returns the result of .toString() for anything else if it exists.
// 4) Returns the result of Object.prototype.toString if .toString()
//    is not present.
exports.stringify = Brixx.stringify;

// Return a random cache age given a median
exports.randomWithMedian = function (median) {
	try {
		median = Math.abs(parseInt(median, 10)) || 150;
	} catch (err) {
		median = 150;
	}
	return Math.abs(_.random(1, Math.round(median * 2)));
};
