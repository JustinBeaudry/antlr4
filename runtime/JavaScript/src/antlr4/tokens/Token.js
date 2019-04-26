/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
import {NO_TEXT, EOF} from './constants';
import {escapeWhitespace} from '../Utils';
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const INVALID_TYPE = 0;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const EPSILON = -2;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const MIN_USER_TOKEN_TYPE = 1;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const EOF = -1;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const DEFAULT_CHANNEL = 0;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const HIDDEN_CHANNEL = 1;
/**
 *
 * @property {array} source
 * @property {number} type - token type.
 * @property {number} channel - the parser ignores everything not on
 * {@link Token#DEFAULT_CHANNEL}.
 * @property {?number} start - optional; return -1 if not implemented.
 * @property {?number} stop - optional; return -1 if not implemented.
 * @property {number} tokenIndex - from 0..n-1 of the token object in the
 * input stream.
 * @property {number} line - 1..n of the 1st character
 * @property {number} column - beginning of the line in which it occurs, 0..n-1
 * @property {string} text - text of the token
 * @class
 *
 */
class Token {
	/**
	 *
	 * @param {array} source
	 * @param {string} type
	 * @param {string} channel
	 * @param {number} start
	 * @param {number} stop
	 * @param {number} tokenIndex
	 * @param {number} line
	 * @param {number} column
	 * @param {string} text
	 * @returns {Token}
	 */
	constructor(
		source=null,
		type=null,
		channel=null,
		start=null,
		stop=null,
		tokenIndex=null,
		line=null,
		column=null,
		text=null
	) {
		this.source = source;
		this.type = type;
		this.channel = channel;
		this.start = start;
		this.stop = stop;
		this.tokenIndex = tokenIndex;
		this.line = line;
		this.column = column;
		this._text = text;
		if (Symbol && Symtol.toStringTag) {
			this[Symbol.toStringTag] = 'Token';
		}
	}
	/**
	 *
	 * @returns 0
	 */
	static get INVALID_TYPE() {
		return INVALID_TYPE;
	}
	/**
	 *
	 * @description
	 * During lookahead operations, this "token" signifies we hit rule end ATN
	 * state and did not follow it despite needing to.
	 *
	 * @returns -2
	 */
	static get EPSILON() {
		return EPSILON;
	}
	/**
	 *
	 * @returns 1
	 */
	static get MIN_USER_TOKEN_TYPE() {
		return MIN_USER_TOKEN_TYPE;
	}
	/**
	 *
	 * @returns -1
	 */
	static get EOF() {
		return EOF;
	}
	/**
	 *
	 * @description
	 * All tokens go to the parser (unless skip() is called in that rule) on a
	 * particular "channel". The parser tunes to a particular channel so that
	 * whitespace etc. can go to the parser on a "hidden" channel.
	 *
	 * @returns 0
	 */
	static get DEFAULT_CHANNEL() {
		return DEFAULT_CHANNEL;
	}
	/**
	 *
	 * @description
	 * Anything on a different channel that DEFAULT_CHANNEL is not parsed by
	 * parser.
	 *
	 * @returns 1
	 */
	static get HIDDEN_CHANNEL() {
		return HIDDEN_CHANNEL;
	}
	get text() {
		return this._text;
	}
	set text(text) {
		this._text = text;
	}
	getTokenSource() {
		return this.source[0];
	}
	getInputStream() {
		return this.source[1];
	}
	/**
	 *
	 * @description
	 * When this object is serialized e.g., @{code JSON.stringify} this method
	 * is called implicitly, and it's return value is used for serialization.
	 *
	 * @returns {{
	 *   stop: Token.stop,
	 *   line: Token.line,
	 *   channel: Token.channel,
	 *   start: Token.start,
	 *   column: Token.column,
	 *   tokenIndex: Token.tokenIndex,
	 *   text: Token.text,
	 *   type: Token.type
	 * }}
	 * @private
	 */
	toJSON() {
		const { type, channel, start, stop, tokenIndex, line, column, text } = this;
		return {
			type,
			channel,
			start,
			stop,
			tokenIndex,
			line,
			column,
			text
		};
	}
}

class CommonToken extends Token {
	/**
	 *
	 * @param {array} source
	 * @param {number} type
	 * @param {number} channel
	 * @param {number} start
	 * @param {number} stop
	 * @constructor
	 */
	constructor(
		source=CommonToken.EMPTY_SOURCE,
		type=null,
		channel=Token.DEFAULT_CHANNEL,
		start=-1,
		stop=-1
	) {
		let line = -1;
		let column = -1;
		if (source[0] != null) {
			line = source[0].line;
			column = source[0].column;
		}
		super(
			source,
			type,
			channel,
			start,
			stop,
			-1, // tokenIndex
			line,
			column
		);
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'CommonToken';
		}
	}
	/**
	 *
	 * @param {object} obj
	 * @param {array} obj.source
	 * @param {number} obj.type
	 * @param {number} obj.channel
	 * @param {number} obj.start
	 * @param {number} obj.stop
	 * @returns {CommonToken}
	 * @constructor
	 */
	static FromObject({
		source,
		type,
		channel,
		start,
		stop
	}) {
		return new CommonToken(source, type, channel, start, stop);
	}
	/**
	 *
	 * @description
	 * An empty {@link Pair} which is used as the default value of
	 * {@link //source} for tokens that do not have a source.
	 *
	 * @returns {[null, null]}
	 */
	static get EMPTY_SOURCE() {
		return [null, null];
	}
	/**
	 *
	 * @description
	 * Constructs a new {@link CommonToken} as a copy of another {@link Token}.
	 *
	 * <p>
	 *   {@link //text} will be assigned the result of calling {@link //getText},
	 *   and {@link //source} will be constructed from the result of
	 *   {@link Token//getTokenSource} and {@link Token//getInputStream}
	 * </p>
	 *
	 * @returns {CommonToken}
	 */
	clone() {
		const {tokenIndex, line, column, text} = this;
		let token = CommonToken.FromObject(this);
		token.tokenIndex = tokenIndex;
		token.line = line;
		token.column = column;
		token.text = text;
		return token;
	}
	get text() {
		if (this._text != null) {
			return this._text;
		}
		let input = this.getInputStream();
		if (input == null) {
			return null;
		}
		const size = input.size;
		if (this.start < size && this.stop < size) {
			return input.getText(this.start, this.stop);
		} else {
			return EOF;
		}
	}
	toString() {
		let text = this.text;
		if (text == null) {
			text = NO_TEXT;
		} else {
			// escape newline, carriage return, and tab
			text = escapeWhitespace(text);
		}
		const {tokenIndex, start, stop, type, channel, line, column} = this;
		let channelText = '';
		if (channel > 0) {
			channelText = `,channel=${channel},`;
		}
		return `[@${tokenIndex},${start}:${stop}='${text}',<${type}>${channelText},${line}:${column}]`;
	}
}

export {
	Token,
	CommonToken
}
