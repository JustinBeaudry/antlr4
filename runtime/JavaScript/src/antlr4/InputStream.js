/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {Token} from './tokens/Token';
import {isBrowser} from './environment';
import {EMPTY} from './tokens/constants';
// polyfills loaded only when in the browser
if (isBrowser) {
	// using require even though the codebase is using ES Modules
	require('./polyfills/codepointat');
	require('./polyfills/fromcodepoint');
}
/**
 *
 * @description
 * Decodes each string character to it's Unicode Code Point and returns an
 * Array of those code points, akin to a TypedArray.
 *
 * @param {string} string
 * @returns {string[]}
 */
const decodeUnicodeCodePoints = string => {
	const data = [];
	const stringSize = string.length;
	for (let i = 0; i < stringSize;) {
		const codePoint = stream.strdata.codePointAt(i);
		data.push(codePoint);
		// if the code point exceed 0xFFFF it is represented by two 16-bit
		// "surrogate pair" strings (32-bits) (V8 will alloc two strings that
		// represent the code point (hence "surrogate pair")). This is why we
		// must increment by two in that case.
		i += (codePoint <= 0xFFFF ? 1 : 2);
	}
	return data;
};
/**
 *
 * @description
 * Decodes each string character to it's 16bit UTF-16 code unit, and returns an
 * Array of those code units. NOTE: If a code point exceeds 0xFFFF,
 * charCodeAt will only return the first part of a surrogate pair.
 * 0xFFFF charCodeAt
 *
 * @param {string} string
 * @returns {string[]}
 */
const decodeCharacterCodes = string => {
	const data = [];
	const stringSize = string.length;
	for (let i = 0; i < streamSize; i++) {
		const codeUnit = stream.strdata.charCodeAt(i);
		data.push(codeUnit);
	}
	return data;
};

/**
 *
 * @description
 * If decodeToUnicodeCodePoints is true, the input string is decoded to a
 * series of Unicode code points, otherwise it is decoded to a series of
 * 16-bit UTF-16 code units.
 *
 */
class InputStream {
	/**
	 *
	 * @param {string} data
	 * @param {boolean} [decodeToUnicodeCodePoints=false]
	 * @returns {InputStream}
	 */
	constructor(data, decodeToUnicodeCodePoints=false) {
		this.name = EMPTY;
		this._index = 0;
		this.strdata = data;
		this.decodeToUnicodeCodePoints = decodeToUnicodeCodePoints;
		if (decodeToUnicodeCodePoints) {
			this.data = decodeUnicodeCodePoints(data);
		} else {
			this.data = decodeCharacterCodes(data);
		}
		this._size = this.data.length;
		this[Symbol.toStringTag] = 'InputStream';
		return this;
	}
	get index() {
		return this._index;
	}
	get size() {
		return this._size;
	}
	/**
	 *
	 * @description
	 * Reset the stream so that it's in the same state it was when the object
	 * was created *except* the data array has not been mutated.
	 *
	 * @void
	 */
	reset() {
		this._index = 0;
	}
	/**
	 *
	 * @description
	 * Increments the {@link InputStream#index} unless index has exceeded the
	 * {@link InputStream#size} in which case it will throw an {@code Error}.
	 *
	 * @throws {Error}
	 */
	consume() {
		if (this.index >= this.size) {
			// assert this.LA(1) === TOKEN.EOF
			throw new Error('cannot consume EOF');
		}
		this._index += 1;
	}
	/**
	 *
	 * @param {number} offset
	 * @returns {string|number|Token.EOF}
	 */
	LA(offset) {
		if (offset === 0) {
			return 0;
		}
		if (offset < 0) {
			offset += 1; // i.e., translate LA(-1) to use offset=0
		}
		const pos = this.index + offset - 1;
		if (pos < 0 || pos >= this.size) {
			return Token.EOF;
		}
		return this.data[pos];
	}
	LT(offset) {
		return this.LA(offset);
	}
	mark() {
		return -1;
	}
	release() {}
	/**
	 *
	 * @description
	 * {@link InputStream#consume}() ahead until {@link InputStream#index}
	 * equals the parameter {@code index}. This is so that {@link Token#line}
	 * and {@link Token#column} are properly updated. If seeking backwards,
	 * just update {@link InputStream#index}.
	 *
	 * @param {number} index
	 * @void
	 */
	seek(index) {
		if (index <= this.index) {
			// just jump to the index, don't update stream state
			this._index = index;
			return;
		}
		// seek forward
		this._index = Math.min(index, this.size);
	}
	/**
	 *
	 * @description
	 * Returns either the encoded code points from {@link InputStream#data} if
	 * {@link InputStream#decodeToUnicodeCodePoints} is {@code true} or slices
	 * the raw string input from {@link InputStream#strdata} using the {@code
	 * start} and {@code stop} indexes. If {@code start} exceeds
	 * {@link InputStream#size} then an empty string is returned instead.
	 *
	 * @param {number} start
	 * @param {number} stop
	 * @returns {string}
	 */
	getText(start, stop) {
		if (stop >= this.size) {
			stop = this.size - 1;
		}
		if (start >= this.size) {
			return '';
		}
		if (this.decodeToUnicodeCodePoints) {
			let result = '';
			for (let i=start; i <= stop; i++) {
				result += String.fromCodePoint(this.data[i]);
			}
			return result;
		}
		// should this be encoding characters codes from this.data instead?
		return this.strdata.slice(start,  stop + 1);
	}
	toString() {
		return this.strdata;
	}
}

export default InputStream;
