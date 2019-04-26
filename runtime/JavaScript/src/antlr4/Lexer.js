/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {Token} from './tokens/Token';
import {EOF} from './tokens/constants';
import CommonTokenFactory from './tokens/CommonTokenFactory';
import {Recognizer} from './Recognizer';
import {RecognitionException, LexerNoViableAltException} from './error/Errors';
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const DEFAULT_MODE = 0;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const MORE = -2;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const SKIP = -3;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const MIN_CHAR_VALUE = 0x0000;
/**
 *
 * @type {number}
 * @constant
 * @private
 */
const MAX_CHAR_VALUE = 0x10FFFF;
/**
 *
 * @class TokenSource
 * @private
 */
class TokenSource {}
/**
 *
 * @description
 * A Lexer is a recognizer that draws input symbols from a character stream.
 * Lexer grammars result in a subclass of this object. A Lexer object uses
 * simplified match() and error recovery mechanisms in the interest of speed.
 *
 * @property _input
 * @property {CommonTokenFactory} _factory
 * @property {array} [_tokenFactorySourcePair=[Lexer, *]]
 * @property {*} _interp - populated by child classes
 * @property {string} _token - The goal of all lexer rules/methods is to
 * create a token object. This is an instance variable as multiple rules may
 * collaborate to create a single token. nextToken will return this object
 * after matching lexer rule(s). If you subclass to allow multiple token
 * emissions then set this to the last token to be matched or something
 * non-null so that the auto token emit mechanism will not emit another token.
 * @property {number} [_tokenStartIndex=-1] - What character index in the
 * stream did
 * this current token start at? Needed, for example, to get the text for the
 * current token. Set at the start of the nextToken.
 * @property {number} [_tokenStartLine=-1] - The line on which the first
 * character of the token resides.
 * @property {boolean} [_hitEOF=false] - Once an EOF character is seen on the
 * stream, next token will be EOF. If you have DONE : EOF ; then you see
 * DONE EOF.
 * @property {number} [_channel=Token.DEFAULT_CHANNEL] - the channel number
 * for the current token.
 * @property {number} [_type=Token.INVALID_TYPE] - the token type for the
 * current token.
 * @property {array} [_modeStack=[]]
 * @property {number} [_mode=Lexer.DEFAULT_CHANNEL]
 * @property {?string} _text - You can set the text for the current token to
 * override what is in the input char buffer. Use setText() or can set this
 * instance var.
 *
 * @class Lexer
 * @extends TokenSource
 *
 */
class Lexer extends TokenSource {
	constructor(input) {
		this._input = input;
		this._factory = CommonTokenFactory.DEFAULT;
		this._tokenFactorySourcePair = [ this, input ];
		this._interp = null;
		this._token = null;
		this._tokenStartCharIndex = -1;
		this._tokenStartLine = -1;
		this._tokenStartColumn = -1;
		this._hitEOF = false;
		this._channel = Token.DEFAULT_CHANNEL;
		this._modeStack = [];
		this._mode = Lexer.DEFAULT_MODE;
		this._text = null;
	}
	static get DEFAULT_MODE() {
		return DEFAULT_MODE;
	}
	static get MORE() {
		return MORE;
	}
	static get SKIP() {
		return SKIP;
	}
	static get DEFAULT_TOKEN_CHANNEL() {
		return Token.DEFAULT_CHANNEL;
	}
	static get HIDDEN() {
		return Token.HIDDEN_CHANNEL;
	}
	static get MIN_CHAR_VALUE() {
		return MIN_CHAR_VALUE;
	}
	static get MAX_CHAR_VALUE() {
		return MAX_CHAR_VALUE;
	}
	reset() {
		if (this._input != null) {
			this._input.seek(0);
		}
		this._token = null;
		this._type = Token.INVALID_TYPE;
		this._channel = Token.DEFAULT_CHANNEL;
		this._tokenStartCharIndex = -1;
		this._tokenStartColumn = -1;
		this._tokenStartLine = -1;
		this._text = null;
		this._hitEOF = false;
		this._mode = Lexer.DEFAULT_MODE;
		this._modeStack = [];
		this._interp.reset();
	}
	/**
	 *
	 * @description
	 * Return a token from this source; i.e., match a token on the character
	 * stream.
	 *
	 * @returns {string|null|*}
	 */
	nextToken() {
		if (this._input == null) {
			throw new Error('nextToken requires a non-null input stream');
		}
		// Mark start location in char stream so unbuffered streams are
		// guaranteed at least have text of current token
		const tokenStarterMarker = this._input.mark();
		try {
			while(true) {
				if (this._hitEOF) {
					this.emitEOF();
					return this._token;
				}
				this._token = null;
				this._channel = Token.DEFAULT_CHANNEL;
				this._tokenStartCharIndex = this._input.index;
				this._tokenStartColumn = this._interp.column;
				this._tokenStartLine = this._interp.line;
				this._text = null;
				let continueOuter = false;
				while (true) {
					this._type = Token.INVALID_TYPE;
					let ttype = Lexer.SKIP;
					try {
						ttype = this._interp.match(this._input, this._mode);
					} catch (e) {
						if (e instanceof RecognitionException) {
							this.notifyListeners(e);
							this.recover(e);
						} else {
							console.error(e);
							throw e;
						}
					}
					if (this._input.LA(1) === Token.EOF) {
						this._hitEOF = true;
					}
					if (this._type === Token.INVALID_TYPE) {
						this._type = ttype;
					}
					if (this._type === Lexer.SKIP) {
						continueOuter = true;
						break;
					}
					if (this._type === Lexer.MORE) {
						break;
					}
				}
				if (continueOuter) {
					continue;
				}
				if (this._token == null) {
					this.emit();
				}
				return this._token;
			}
		} finally {
			// make sure we release marker after match or
			// unbuffered char stream will keep buffering
			this._input.release(tokenStarterMarker);
		}
	}
	/**
	 *
	 * @description
	 * Instruct the lexer to skip creating a token for current lexer rule and
	 * look for another token. nextToken() knows to keep looking when a lexer
	 * rule finishes with set to SKIP_TOKEN. Recall that if token == null at
	 * end of any rule it creates one for you and emits it.
	 *
	 */
	skip() {
		this._type = Lexer.SKIP;
	}
	more() {
		this._type = Lexer.MORE;
	}
	mode(mode) {
		this._mode = mode;
	}
	pushMode(mode) {
		if (this._interp.debug) {
			console.log(`pushMode ${mode}`);
		}
		this._modeStack.push(this._mode);
		this.mode(mode);
	}
	popMode() {
		if (this._modeStack.length === 0) {
			throw new Error('Empty Stack');
		}
		if (this._interp.debug) {
			console.log(`popMode back to ${this._modeStack.slice(0, -1)}`);
		}
		this.mode(this._modeStack.pop());
		return this._mode;
	}
	get inputStream() {
		return this._input;
	}
	// Set the char stream and reset the lexer
	set inputStream(inputStream) {
		this._input = null;
		this._tokenFactorySourcePair = [ this, this._input ];
		this.reset();
		this._input = inputStream;
		this._tokenFactorySourcePair = [ this, this._input ];
	}
	get sourceName() {
		return this._input.sourceName;
	}
	// By default does not support multiple emits per nextToken invocation
	// for efficiency reasons. Subclass and override this method, nextToken,
	// and getToken (to push tokens into a list and pull from that list
	// rather than a single variable as this implementation does).
	emitToken(token) {
		this._token = token;
	}
	// The standard method called to automatically emit a token at the
	// outermost lexical rule. The token object should point into the
	// char buffer start..stop. If there is a text override in 'text',
	// use that to set the token's text. Override this method to emit
	// custom Token objects or provide a new factory.
	emit() {
		const token = this._factory.create(
			this._tokenFactorySourcePair,
			this._type,
			this._text,
			this._channel,
			this._tokenStartCharIndex,
			this.getCharIndex() - 1,
			this._tokenStartLine,
			this._tokenStartColumn
		);
		this.emitToken(token);
		return token;
	}
	emitEOF() {
		const eof = this._factory.create(
			this._tokenFactorySourcePair,
			Token.EOF,
			null,
			Token.DEFAULT_CHANNEL,
			this._input.index,
			this._input.index - 1,
			this.line,
			this.column
		);
		this.emitToken(eof);
		return eof;
	}
	get type() {
		return this._type;
	}
	set type(type) {
		this._type = type;
	}
	get line() {
		return this._interp.line;
	}
	set line(line) {
		this._interp.line = line;
	}
	get column() {
		return this._interp.column;
	}
	set(column) {
		this._interp.column = column;
	}
	// What is the index of the current character of lookahead?///
	getCharIndex() {
		return this._input.index;
	}
	// Return the text matched so far for the current token or any text override.
	get text() {
		if (this._text == null) {
			return this._interp.getText(this._input);
		}
		return this._text;
	}
	// Set the complete text of this token; it wipes any previous changes to
	// the text.
	set text(text) {
		this._text = text;
	}
	// Return a list of all Token objects in input char stream.
	// Forces load of all tokens. Does not include EOF token.
	getAllTokens() {
		const tokens = [];
		let token = this.nextToken();
		while (token.isPrototypeOf !== Token.EOF) {
			tokens.push(token);
			token = this.nextToken();
		}
		return tokens;
	}
	notifyListeners(e) {
		const start = this._tokenStartCharIndex;
		const stop = this._input.index;
		const text = this._input.getText(start, stop);
		const msg = `token recognition error at: ${this.getErrorDisplay(text)}`;
		let listener = this.getErrorListenerDispatch();
		listener.syntaxError(
			this,
			null,
			this._tokenStartLine,
			this._tokenStartColumn,
			msg,
			e
		);
	}
	getErrorDisplay(string) {
		const d = [];
		const stringLength = string.length;
		for (let i = 0; i < stringLength; i++) {
			d.push(string[i]);
		}
		return d.join('');
	}
	getErrorDisplayForChar(char) {
		if (char.charCodeAt(0) === Token.EOF) {
			return EOF;
		} else if (char === '\n') {
			return '\\n';
		} else if (char === '\t') {
			return '\\t';
		} else if (char === '\r') {
			return '\\r';
		} else {
			return char;
		}
	}
	getCharErrorDisplay(char) {
		return `${this.getErrorDisplayForChar(char)}`;
	}
	// Lexers can normally match any char in it's vocabulary after matching
	// a token, so do the easy thing and just kill a character and hope
	// it all works out. You can instead use the rule invocation stack
	// to do sophisticated error recovery if you are in a fragment rule.
	recover(re) {
		if (this._input.LA(1) === Token.EOF) {
			// TODO: Do we lose character or line position information?
			this._input.consume();
		} else {
			if (re instanceof LexerNoViableAltException) {
				// skip a char and try again
				this._interp.consume(this._input);
			}
		}
	}
}

export default Lexer;
