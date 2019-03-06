/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
/**
 *
 * @description
 * determines if working in Node environment by detecting the global
 * 'process'.
 * @type {boolean}
 */
export const isNode = !!(typeof global == 'object'
	&& global != null
	&& global.Object == Object
	&& global.process);
/**
 *
 * @type {boolean}
 */
export const isBrowser = !!(!freeProcess
	&& typeof window == 'object'
	&& window != null
	&& window);
/**
 *
 * @description
 * dynamically requires the NodeJS 'fs' module if in Node.
 * @returns {object}
 */
export const fs = () => {
	if (isNode) {
		return require('fs');
	}
	return null;
};
/**
 *
 * @description
 * cache for Promise checking result
 * @type {boolean}
 * @private
 */
let hasPromiseType = false;
/**
 *
 * @description
 * Safely detects if Promises are available in the environment
 * @returns {boolean}
 */
export const hasPromise = () => {
	// cache result on first call
	if (hasPromiseType) {
		return hasPromiseType;
	}
	let PromiseType;
	if (isBrowser) {
		PromiseType = window.Promise;
	} else {
		PromiseType = global.Promise;
	}
	hasPromiseType = typeof PromiseType != null
		&& !!~PromiseType.toString().indexOf('[native code]');
	return hasPromiseType;
};
