/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {InputStream} from './InputStream';
import {fs, isNode, isBrowser, hasPromise} from './environment';
/**
 *
 * @typedef CharStreams
 * @type {object}
 * @function fromString
 * @function fromBlob
 * @function fromBuffer
 * @function fromPath
 * @function fromPathPromise
 * @function fromPathSync
 */
/**
 *
 * @description
 * Creates an {@link InputStream} from a string
 *
 * @param {string} string
 * @returns {InputStream}
 */
const fromString = string => new InputStream(string, true);
/**
 *
 * @description
 * Asynchronously creates an {@link InputStream} from a {@code Blob} given the
 * encoding bytes in that {@code Blob} (defaults to 'utf8' if encoding is
 * {@code null}). Invokes onLoad() on success and onError() on failure.
 *
 * @param {Blob} blob
 * @param {string} encoding
 * @param {function} onLoad - success callback
 * @param {function} onError - error callback
 */
const fromBlob = (blob, encoding, onLoad, onError) => {
	if (isNode) {
		return null;
	}
	let reader = FileReader();
	reader.onload = ({target}) => {
		onLoad(new InputStream(target.result));
	};
	reader.onerror = onError;
	reader.readAsText(blob, encoding);
};
/**
 *
 * @description
 * Creates an {@link InputStream} from a Buffer given the encoding of the bytes
 * in that Buffer (defaults to 'utf8' if encoding is {@code null}).
 *
 * @param {Buffer} buffer
 * @param {string} [encoding='utf8']
 * @returns {null|InputStream}
 */
const fromBuffer = (buffer, encoding) => {
	// throw an Error instead?
	if (isBrowser || !Buffer.isBuffer(buffer)) {
		return null;
	}
	return new InputStream(buffer.toString(), encoding);
};
/**
 * @typedef fromPathCallback
 * @type {function(Error, InputStream)}
 * @callback fromPathCallback
 * @param {Error}
 * @param {InputStream}
 */
/**
 *
 * @description
 * Asynchronously creates an {@link InputStream} from a file on disk given
 * the encoding of the bytes in that file (defaults to 'utf8' if encoding
 * is {@code null}).
 *
 * @param {string} path
 * @param {string} encoding
 * @param {fromPathCallback} callback
 * @callback fromPathCallback
 * @void
 */
const fromPath = (path, encoding, callback) => {
	fs.readFile(path, (encoding || 'utf8'), (err, data) => {
		if (err) {
			callback(err);
			return;
		}
		if (data == null) {
			callback(null, null);
			return;
		}
		callback(null, new InputStream(data, true));
	});
};
/**
 *
 * @description
 * Asynchronously creates an {@link InputStream} from a file on disk given
 * the encoding of the bytes in that file (defaults to 'utf8' if encoding
 * is {@code null}).
 *
 * @param {string} path
 * @param {string} encoding
 * @returns {null|Promise<InputStream>}
 */
const fromPathPromise = (path, encoding) => {
	// detect if the environment supports Promises, if not return null
	if (!hasPromise()) {
		return null;
	}
	// @NOTE: NodeJS v10.0.0 added promise methods natively, for now we'll just
	//       handle it manually here.
	return new Promise((resolve, reject) => {
		// just call fromPath and pass a callback, this allows fromPath to remain
		//  the implementation source.
		fromPath(path, encoding, (err, inputStream) => {
			if (err) {
				// there's no need to return as a rejected promise will not resolve
				// since it is already fulfilled
				reject(err);
			}
			resolve(inputStream);
		});
	});
};
/**
 *
 * @description
 * Synchronously creates an {@link InputStream} from a file on disk given
 * the encoding of the bytes in that file (defaults to 'utf8' if encoding
 * is {@code null}).
 *
 * @param {string} path
 * @param {string} encoding
 * @returns {InputStream}
 */
const fromPathSync = (path, encoding) => {
	const data = fs.readFileSync(path, (encoding || 'utf8'));
	if (data == null) {
		return null;
	}
	return new InputStream(data, true);
};
/**
 *
 * @description
 * Utility functions to create {@link InputStream}s from various sources.
 * All returned {@link InputStream}s support the full range of Unicode
 * up to U+10FFFF (the default behavior of {@link InputStream} only supports
 * code points up to U+FFFF).
 *
 * @type {CharStreams}
 */
const CharStreams = {
	fromString,
	fromBlob,
	fromBuffer,
	fromPath,
	fromPathPromise,
	fromPathSync
};

exports.CharStreams = CharStreams;
