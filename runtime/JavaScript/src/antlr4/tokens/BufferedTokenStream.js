/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {Token} from './Token';
import Lexer from '../Lexer';
import {Interval} from '../IntervalSet';
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const DEFAULT_MARK = 0;
/**
 *
 * @description
 * This class is just keep meaningful parameter type to Parser
 *
 * @private
 */
class TokenStream {}
/**
 *
 * @description
 * This implementation of {@link TokenStream} loads tokens from a {@link TokenSource}
 * on-demand and places the tokens in a bugger to provide access to any previous
 * token by index.
 *
 * <p>
 *   This token stream ignore the value of {@link Token#channel}. If your
 *   parser requires the token stream, filter tokens to only those on a
 *   particular channel, such as {@link Token#DEFAULT_CHANNEL} or
 *   {@link Token#HIDDEN_CHANNEL}, use a filtering token stream such as
 *   {@link CommonTokenStream}.
 * </p>
 *
 * @property {string[]} [tokens=[]] - A collection of all tokens fetched
 * from the token source. The list is considered a complete view of the
 * input once {@link BufferedTokenStream#fetchedEOF} is set to {@code true}.
 *
 * @property {number} [index=-1] - The index into {@link //tokens} of the
 * current token (next token to {@link //consume}). {@link //tokens}{@code
 * [}{@link //p}{@code ]} should be @link //#LT LT(1)}. <p>This field is set
 * to -1 when the stream is first constructed or when {@link //setTokenSource}
 * is called, indicating that the first token has not yet
 * been fetched from the token source. For additional information, see the
 * documentation of {@link IntStream} for a description of Initializing
 * Methods.</p>
 *
 * @property {boolean} [fetchedEOF=false] - Indicates whether the
 * {@link Token#EOF} token has been fetched from
 * {@link BufferedTokenStream#tokenSource} and added to
 * {@link BufferedTokenStream#tokens}. This field improves performance for
 * the following cases:
 * <ul>
 *   <li>{@link BufferedTokenStream#consume}: The lookahead check in
 *        {@link BufferedTokenStream#consume} to prevent consuming the EOF
 *        symbol is optimized by checking the values of
 *        {@link BufferedTokenStream#fetchedEOF} and {@link //p} instead of
 *        calling {@link BufferedTokenStream#LA}.
 *   </li>
 *   <li>{@link BufferedTokenStream#fetch}: The check to prevent adding
 *        multiple EOF symbols into {@link BufferedTokenStream#tokens} is trivial
 *        with this field.
 *   </li>
 * <ul>
 */
class BufferedTokenStream extends TokenStream {
	/**
	 *
	 * @param {@link Lexer} tokenSource - The {@link TokenSource} from which
	 * tokens for this stream are fetched.
	 * @returns {BufferedTokenStream}
	 */
	constructor(tokenSource) {
		super();
		this.tokenSource = tokenSource;
		this.tokens = [];
		this.index = -1;
		this.fetchedEOF = false;
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'BufferedTokenStream';
		}
	}
	/**
	 *
	 * @returns {number}
	 */
	mark() {
		return DEFAULT_MARK;
	}
	/**
	 *
	 * @param {number} marker
	 * @void
	 */
	release(marker) {
		// no resource to release
	}
	/**
	 *
	 * @void
	 */
	reset() {
		this.seek(0);
	}
	/**
	 *
	 * @param {number} index
	 * @void
	 */
	seek(index) {
		this.lazyInit();
		this.index = this.adjustSeekIndex(index);
	}
	/**
	 *
	 * @param {number }index
	 * @returns {string}
	 */
	get(index) {
		this.lazyInit();
		return this.tokens[index];
	}
	/**
	 *
	 * @description
	 * Loops through tokens until EOF
	 *
	 * @throws {Error}
	 * @void
	 */
	consume() {
		let skipEOFCheck = false;
		if (this.index >= 0) {
			// the last token in tokens is EOF. skip check if p indexes any
			// fetched token except the last.
			const isEOF = this.index < this.tokens.length;
			skipEOFCheck = this.fetchedEOF ? isEOF - 1 : isEOF;
		}
		if (!skipEOFCheck && this.LA(1) === Token.EOF) {
			throw new Error('cannot consume EOF');
		}
		if (this.sync(this.index + 1)) {
			this.index = this.adjustSeekIndex(this.index +1);
		}
	}
	/**
	 *
	 * @description
	 * Make sure {@code index} in tokens has a token. Returns {@code true} if a token is located at index
	 * {@code index}, otherwise returns {@code false}.
	 *
	 * @todo this is not a "pure" function in the sense that calling this
	 * function according to its description has side effects.
	 * Consider refactoring to be atomic.
	 *
	 * @param {number} index
	 * @returns {boolean}
	 */
	sync(index) {
		const elementsNeeded = index - this.tokens.length + 1;
		if (elementsNeeded > 0) {
			return this.fetch(elementsNeeded) >= elementsNeeded;
		}
		return true;
	}
	/**
	 *
	 * @param {number} elementsToBuffer
	 * @returns {number}
	 */
	fetch(elementsToBuffer) {
		if (this.fetchedEOF) {
			return 0;
		}
		for (let i=0; i < elementsToBuffer; i++) {
			const token = this.tokenSource.nextToken();
			token.tokenIndex = this.tokens.length;
			this.tokens.push(token);
			if (token.type === Token.EOF) {
				this.fetchedEOF = true;
				return i + 1;
			}
		}
		return elementsToBuffer;
	}
	/**
	 *
	 * Get all tokens in a range from {@code start} to {@code stop} inclusively
	 *
	 * @param {number} start
	 * @param {number} stopElement
	 * @param {Set|BitSet} types
	 * @returns {null|Array}
	 */
	getTokens(start, stop, types) {
		if (types == null) {
			types = null;
		}
		if (start < 0 || stop < 0) {
			return null;
		}
		this.lazyInit();
		const subset = [];
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}
		for (let i = start; i < stop; i++) {
			const token = this.tokens = this.tokens[i];
			if (token.type === Token.EOF) {
				break;
			}
			if (types == null || types.contains(token.type)) {
				subset.push(token);
			}
		}
		return subset;
	}
	/**
	 *
	 * @param {number} index
	 * @returns {number}
	 */
	LA(index) {
		return this.LT(index).type;
	}
	/**
	 *
	 * @param {number} k
	 * @returns {null|Token}
	 */
	LB(k) {
		if (this.index - k < 0) {
			return null;
		}
		return this.tokens[this.index - k];
	}
	/**
	 *
	 * @param {number} k
	 * @returns {null|Token}
	 */
	LT(k) {
		this.lazyInit();
		if (k === 0) {
			return this.LB(-k);
		}
		const i = this.index + k - 1;
		this.sync(i);
		// return EOF token
		if (i >= this.tokens.length) {
			// EOF must be last token
			return this.tokens[this.tokens.length - 1];
		}
		return this.tokens[i];
	}
	/**
	 *
	 * @description
	 * Allows derived classes to modify the behavior of operations which change
	 * the current stream position by adjusting the target token index of a seek
	 * operation. The default implementation simply returns the passed in {@code index}.
	 * If an exception is thrown in this method, the current stream index should not be change.
	 *
	 * @example
	 * For example, {@link CommonTokenStream} overrides this method to ensure that the seek target
	 * is always an on-channel token.
	 *
	 * @param {number} index - the target token index
	 * @returns {number} - the adjusted target token index
	 */
	adjustSeekIndex(index) {
		return index;
	}
	/**
	 *
	 * @description
	 * If {@link BufferedTokenStream#index} has not been set ({@code -1}) calls
	 * {@link BufferedTokenStream#setup}. Otherwise is a noop.
	 *
	 * @void
	 */
	lazyInit() {
		if (this.index === -1) {
			this.setup();
		}
	}
	/**
	 *
	 * @description
	 * Calls {@link BufferedTokenStream#sync} with a value of {@code 0}, and sets
	 * the {@link BufferedTokenStream#index} to the return value of
	 * {@link BufferedTokenStream#adjustSeekIndex}.
	 *
	 * @void
	 */
	setup() {
		this.sync(0);
		this.index = this.adjustSeekIndex(0);
	}
	/**
	 *
	 * @description
	 * Reset this token stream by setting it's token source.
	 *
	 * @param {Lexer} tokenSource - Lexer
	 */
	setTokenSource(tokenSource) {
		this.tokenSource = tokenSource;
		this.tokens = [];
		this.index = -1;
		this.fetchedEOF = false;
	}
	/**
	 *
	 * @description
	 * Given a starting {@code index} return the index of the next token on channel.
	 * Return {@code index} if {@code tokens[index]} is on channel. Return {@code -1} if there
	 * are no tokens on channel between {@code index} and {@code EOF}.
	 *
	 * @param {number} index
	 * @param {string} channel
	 * @returns {number}
	 */
	nextTokenOnChannel(index, channel) {
		this.sync(index);
		if (index >= this.tokens.length) {
			return -1;
		}
		let token = this.tokens[index];
		while(token.channel !== this.channel) {
			if (token.type === Token.EOF) {
				return -1;
			}
			index += 1;
			this.sync(index);
			token = this.tokens[index];
		}
		return index;
	}
	/**
	 *
	 * @description
	 * Given a starting {@code index} return the {@code index} of the previous token on {@code channel}.
	 * Return {@code index} if {@code tokens[index]} is on {@code channel}. Return -1 if there
	 * are no tokens on {@code channel} between {@code index} and {@code 0};
	 *
	 * @param {number} index
	 * @param {string} channel
	 * @returns {number}
	 */
	previousTokenOnChannel(index, channel) {
		while(index >= 0 && this.tokens[index].channel !== channel) {
			index -= 1;
		}
		return index;
	}
	/**
	 *
	 * @param {number} tokenIndex
	 * @param {string} channel
	 * @returns {Array}
	 */
	getHiddenTokensToRigh(tokenIndex, channel) {
		if (channel == null) {
			channel = -1;
		}
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw new Error(`${tokenIndex} not in 0..${this.tokens.length - 1}`);
		}
		const nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1, Lexer.DEFAULT_TOKEN_CHANNEL);
		const from = tokenIndex + 1;
		const to = nextOnChannel === -1
			? this.tokens.length - 1
			: nextOnChannel
			;
		return this.filterForChannel(from,  to, channel);
	}
	/**
	 *
	 * @description
	 * Collect all tokens on specified channel to the left of the current token
	 * up until we see a token on {@link Lexer#DEFAULT_TOKEN_CHANNEL}. If channel
	 * is {@code -1} find any non-default tokens.
	 *
	 * @param {index} tokenIndex
	 * @param {string} channel
	 * @returns {null|Array}
	 */
	getHiddenTokensToLeft(tokenIndex, channel) {
		if (channel == null) {
			channel = -1;
		}
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw new Error(`${tokenIndex} not in 0..${this.tokens.length - 1}`);
		}
		const prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1, Lexer.DEFAULT_TOKEN_CHANNEL);
		if (!prevOnChannel) {
			return null;
		}
		const from = prevOnChannel + 1;
		const to = tokenIndex - 1;
		return this.filterForChannel(from, to, channel);
	}
	/**
	 *
	 * @param {number} left
	 * @param {number} right
	 * @param {string} channel
	 * @returns {null|Array}
	 */
	filterForChannel(left, right, channel) {
		const hidden = [];
		for (let i = left; i < right + 1; i++) {
			const token = this.tokens[i];
			if (channel === -1) {
				if (token.channel !== Lexer.DEFAULT_TOKEN_CHANNEL) {
					hidden.push(token);
				}
			} else if (token.channel === channel) {
				hidden.push(token);
			}
		}
		if (hidden.length === 0) {
			return null;
		}
		return hidden;
	}
	getSourceName() {
		return this.tokenSource.getSourceName();
	}
	/**
	 *
	 * @description
	 * Get the text of all tokens in this buffer.
	 *
	 * @param {number} interval
	 * @returns {string}
	 */
	getText(interval) {
		this.lazyInit();
		this.fill();
		if (interval == null) {
			interval = new Interval(0, this.tokens.length - 1);
		}
		let start = interval.start;
		if (start instanceof Token) {
			start = start.tokenIndex;
		}
		let stop = interval.stop;
		if (stop instanceof Token) {
			stop = stop.tokenIndex;
		}
		if (start == null || stop == null || start < 0 || stop < 0) {
			return '';
		}
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}
		let tokenText = '';
		for (let i = start; i < stop + 1; i++) {
			const token = this.tokens[ i ];
			if ( token.type === Token.EOF ) {
				break;
			}
			tokenText += token.text;
		}
		return tokenText;
	}
	/**
	 *
	 * @description
	 * Get all tokens from lexer until {@link Token#EOF}.
	 *
	 * @void
	 */
	fill() {
		const fillValue = 1000;
		this.lazyInit();
		while (this.fetch(fillValue) === fillValue) {}
	}
}

module.exports = BufferedTokenStream;
