/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
/**
 * @module Errors
 * @description
 * The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 * 3 kinds of errors: prediction errors, failed predicate errors, and
 * mismatched input errors. In each case, the parser knows where it is
 * in the input, where it is in the ATN, the rule invocation stack,
 * and what kind of problem occurred.
 */
import {PredicateTransition} from '../atn/Transition';
import {Recognizer} from '../Recognizer';
import Lexer from '../Lexer';
/**
 *
 * @property offendingToken - The current {@link Token} when an error occurred.
 * Since not all streams support accessing symbols by index, we have to track
 * the {@link Token} instance itself.
 * @property offendingState - Get the ATN state number the parser was in at
 * the time the error occurred. For {@link NoViableAltException} and
 * {@link LexerNoViableAltException} exceptions, this is the {@link DecisionState}
 * number. For others, it is the state whose outgoing edge we couldn't match.
 */
class RecognitionException extends Error {
	/**
	 *
	 * @param {object} params
	 * @param {Lexer} params.recognizer
	 * @param {*} params.input
	 * @param {*} params.ctx
	 */
	constructor({
		message='',
		recognizer=null,
		input=null,
		ctx=null
	}) {
		super(message);
		if (!this.stack && Error.captureStackTrace) {
			Error.captureStackTrace(this, RecognitionException);
		} else {
			this.stack = new Error().stack;
		}
		this.recognizer = recognizer;
		this.input = input;
		this.ctx = ctx;
		this.offendingToken = null;
		this.offendingState = -1;
		if (this.recognizer != null) {
			this.offendingState = this.recognizer.state;
		}
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'RecognitionException';
		}
	}
	/**
	 *
	 * @description
	 * <p>If the state number is not known, this method returns -1.</p>
	 *
	 * Gets the set of input symbols which could potentially follow the
	 * previously matched symbol at the time this exception was thrown.
	 * <p>If the set of expected tokens is not known and could not be computed,
	 * this method returns {@code null}.</p>
	 *
	 * @returns {*|IntervalSet|null} - The set of token types that could
	 * potentially follow the current state in the ATN, or {@code null} if the
	 * information is not available.
	 */
	getExpectedTokens() {
		if (this.recognizer == null) {
			return null;
		}
		return this.recognizer.atn.getExpectedTokens(this.offendingState, this.ctx);
	}
	/**
	 *
	 * @description
	 * Used internally when {@code JSON.stringify} is called on this object.
	 * Such as when an error is logged to the console.
	 *
	 * @returns {{
	 *   input: RecognitionException.input,
	 *   stack: RecognitionException.stack,
	 *   offendingState: RecognitionException.offendingState,
	 *   ctx: RecognitionException.ctx,
	 *   offendingToken: RecognitionException.offendingToken,
	 *   recognizer: RecognitionException.recognizer,
	 *   message: RecognitionException.message
	 * }}
	 * @private
	 */
	toJSON() {
		const {
			message,
			stack,
			input,
			recognizer,
			ctx,
			offendingToken,
			offendingState
		} = this;
		return {
			message,
			stack,
			input,
			recognizer,
			ctx,
			offendingToken,
			offendingState
		};
	}
	/**
	 *
	 * @returns {string}
	 */
	toString() {
		return this.message;
	}
}

class LexerNoViableAltException extends RecognitionException {
	constructor(lexer, input, startIndex, deadEndConfigs) {
		super({
			message: '',
			recognizer: lexer,
			input
		});
		this.startIndex = startIndex;
		this.deadEndConfigs = deadEndConfigs;
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'LexerNoViableAltException';
		}
	}
	toString() {
		let symbol = '';
		if (this.startIndex >= 0 && this.startIndex < this.input.size) {
			symbol += this.input.getText((this.startIndex, this.startIndex));
		}
		return `LexerNoViableAltException${symbol}`;
	}
	toJSON() {
		const {startIndex, deadEndConfigs} = this;
		let obj = super.toJSON();
		return {
			startIndex,
			deadEndConfigs,
			...obj
		};
	}
}
/**
 *
 * @description
 * Indicates that the parser could not decide which of two or more paths
 * to take based upon the remaining input. It tracks the starting token
 * of the offending input and also knows where the parser was
 * in the various paths when the error. Reported by reportNoViableAlternative()
 *
 * @property deadEndConfigs - Which configurations did we try at input.index()
 * that couldn't match input.LT(1)?
 *
 * @property startToken - The token object at the start index; the input
 * stream might not be buffering tokens so get a reference to it. (At the time
 * the error occurred, of course the stream needs to keep a buffer all of the
 * tokens but later we might not have access to those.)
 *
 */
class NoViableAltException extends RecognitionException {
	constructor(
		recognizer,
		input=recognizer.getInputStream(),
		startToken=recognizer.getCurrentToken(),
		offendingToken=recognizer.getCurrentToken(),
		deadEndConfigs,
		ctx=recognizer._ctx
	) {
		super({
			message: '',
			recognizer,
			input,
			ctx
		});
		this.deadEndConfigs = deadEndConfigs;
		this.startToken = startToken;
		this.offendingToken = offendingToken;
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'NoViableAltException';
		}
	}
	toJSON() {
		const {startIndex, deadEndConfigs} = this;
		let obj = super.toJSON();
		return {
			startIndex,
			deadEndConfigs,
			...obj
		};
	}
}

/**
 *
 * @description
 * This signifies any kind of mismatched input exceptions such as when the
 * current input does not match the expected token.
 */
class InputMismatchException extends RecognitionException {
	constructor(recognizer) {
		super({
			message: '',
			recognizer,
			input: recognizer.getInputStream(),
			ctx: recognizer._ctx
		});
		this.offendingToken = recognizer.getCurrentToken();
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'InputMismatchException';
		}
	}
}

/**
 *
 * @description
 * A semantic predicate failed during validation. Validation of predicates
 * occurs when normally parsing the alternative just like matching a token.
 * Disambiguating predicate evaluation occurs when we test a predicate during
 * prediction.
 *
 */
class FailedPredicateException extends RecognitionException {
	constructor(recognizer, predicate, message=null) {
		super({
			message: this.formatMessage(predicate, message),
			recognizer,
			input: recognizer.getInputStream(),
			ctx: recognizer._ctx
		});
		this.ruleIndex = 0;
		this.predicateIndex = 0;
		const state = recognizer._interp.atn.state[recognizer.state];
		if (state != null) {
			const transition = state.transitions[0];
			if (transition instanceof PredicateTransition) {
				this.ruleIndex = transition.ruleIndex;
				this.predicateIndex = transition.predIndex;
			}
		}
		this.predicate = predicate;
		this.offendingToken = recognizer.getCurrentToken();
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'FailedPredicateException';
		}
	}
	formatMessage(predicate, message) {
		if (message == null) {
			return `failed predicate {${predicate}}?`;
		}
		return message;
	}
	toJSON() {
		const {ruleIndex, predicateIndex, predicate} = this;
		let obj = super.toJSON();
		return {
			ruleIndex,
			predicateIndex,
			predicate,
			...obj
		};
	}
}

class ParseCancellationException extends Error {
	constructor() {
		super();
		if (!this.stack && Error.captureStackTrace) {
			Error.captureStackTrace(this, ParseCancellationException);
		}
		if (Symbol && Symbol.toStringTag) {
			this[Symbol.toStringTag] = 'ParseCancellationException';
		}
	}
}

export {
	RecognitionException,
	NoViableAltException,
	LexerNoViableAltException,
	InputMismatchException,
	FailedPredicateException,
	ParseCancellationException
}
