/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {Token} from './Token';
import BufferedTokenStream from './BufferedTokenStream';
/**
 *
 * @description
 * This class extends {@link BufferedTokenStream} with functionality to filter
 * token stream to tokens on a particular channel (tokens where {@link Token#getChannel}
 * returns a particular value).
 *
 * <p>This token stream provides access to all tokens by index or when calling
 * methods like {@link BufferedTokenStream#getText}. The channel filtering is only used for code
 * accessing tokens via the lookahead method {@link BufferedTokenStream#LA}, {@link BufferedTokenStream#LT}, and
 * {@link BufferedTokenStream#LB}.</p>
 *
 * <p>By default tokens are placed on the default channel {@link Token#DEFAULT_CHANNEL},
 * but may be reassigned by using the {@code ->channel(HIDDEN)} lexer command,
 * or by using an embedded action to call {@link Lexer#setChannel}.
 *
 * <p>Note: Lexer rules which use the {@code ->} lexer command or call {@link Lexer#skip}
 * do not produce tokens at all, so input text matched by such a rule will
 * no be available as part of the token stream, regardless of channel.<p>
 *
 */
class CommonTokenStream extends BufferedTokenStream {
	/**
	 *
	 * @param {Lexer} lexer
	 * @param {number} [channel=Token.DEFAULT_CHANNEL]
	 * @returns {CommonTokenStream}
	 */
	constructor(lexer, channel=Token.DEFAULT_CHANNEL) {
		super(lexer);
		this.channel = channel;
	}
	/**
	 *
	 * @param {number} index
	 * @returns {number}
	 */
	adjustSeekIndex(index) {
		return this.nextTokenOnChannel(index,  this.channel);
	}
	/**
	 *
	 * @param {number} k
	 * @returns {string|null}
	 */
	LB(k) {
		if(k === 0 || this.index - k < 0) {
			return null;
		}
		let i = this.index;
		let n = 1;
		while (n <= k) {
			i = this.previousTokenOnChannel(i - 1, this.channel);
			n += 1;
		}
		if (i < 0) {
			return null;
		}
		return this.tokens[i];
	}
	/**
	 *
	 * @param {number} k
	 * @returns {string|null}
	 */
	LT(k) {
		this.lazyInit();
		if (k === 0) {
			return null;
		}
		if (k < 0) {
			return this.LB(-k);
		}
		let i = this.index;
		let n = 1;
		while (n < k) {
			// skip off-channel tokens, but make sure to not look past EOF
			if (this.sync(i + 1)) {
				i = this.nextTokenOnChannel(i + 1, this.channel);
			}
			n += 1;
		}
		return this.tokens[i];
	}
	/**
	 *
	 * @returns {number}
	 */
	getNumberOfOnChannelTokens() {
		let n = 0;
		this.fill();
		const tokensSize = this.tokens.length;
		for (let i = 0; i < tokensSize; i++) {
			const token = this.tokens[i];
			if (token.channel === this.channel) {
				n += 1;
			}
			if (token.type === Token.EOF) {
				break;
			}
		}
		return n;
	}
}

export default CommonTokenStream;
