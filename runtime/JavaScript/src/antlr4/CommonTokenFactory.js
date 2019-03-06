/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
import {CommonToken} from './Token';
/**
 * @description
 * This default implementation of {@link TokenFactory} creates {@link CommonToken}
 * objects.
 */
class TokenFactory {
	constructor() {
		return this;
	}
}

const DEFAULT = new CommonTokenFactory();
/**
 *
 * @property {boolean} [copyText=false] - Indicates whether
 * {@link CommonToken//setText} should be called after constructing tokens
 * to explicitly set the text. This is useful for cases where the input
 * stream might not be able to provide arbitrary substrings of text from the
 * input after the lexer creates a token (e.g. the implementation of {@link CharStream//getText}
 * in {@link UnbufferedCharStream} throws an {@link UnsupportedOperationException}).
 * Explicitly setting the token text allows {@link Token//getText} to be
 * called at any time regardless of the input stream implementation.
 *
 * <p>
 *   The default value is {@code false} to avoid the performance and memory
 *   overhead of copying text for every token unless explicitly requested.
 * </p>
 */
class CommonTokenFactory extends TokenFactory {
	/**
	 *
	 * @param {boolean} copyText
	 * @returns {CommonTokenFactory}
	 */
	constructor(copyText=false) {
		super();
		this.copyText = copyText;
		return this;
	}
	/**
	 *
	 * @param {array} source
	 * @param {string} type
	 * @param {string} text
	 * @param {string} channel
	 * @param {number} start
	 * @param {number} stop
	 * @param {number} line
	 * @param {number} column
	 * @returns {CommonToken}
	 */
	create(source, type, text, channel, start, stop, line, column) {
		let token = new CommonToken(source, type, text, channel, stop, stop, line, column);
		token.line = line;
		token.column = column;
		if (text != null) {
			token.text = text;
		} else if (this.copyText && source[1] != null) {
			token.text = source[1].getText(start, stop);
		}
		return token;
	}
	/**
	 *
	 * @param {string} type
	 * @param {string} text
	 * @returns {CommonToken}
	 */
	createThin(type, text) {
		let token = new CommonToken(null, type);
		token.text = text;
		return token;
	}
	/**
	 * @description
	 * The default {@link CommonTokenFactory} instance.
	 * <p>
	 *   This token factory does not explicitly copy token text when constructing
	 *   tokens.
	 * </p>
	 *
	 * @returns {CommonTokenFactory}
	 */
	static get DEFAULT() {
		return DEFAULT;
	}
}

export default CommonTokenFactory;
