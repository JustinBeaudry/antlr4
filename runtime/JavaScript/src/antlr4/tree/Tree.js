/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {Token} from '../tokens/Token';
import {Interval} from '../IntervalSet';
import {EOF} from '../tokens/constants';
/**
 *
 * @type {Interval}
 * @constant
 * @private
 */
const INVALID_INTERVAL = new Interval(-1, -2);
/**
 * @description
 * The basic notion of a tree has a parent, a payload, and a list of children.
 * It is the most abstract interface for all the trees used by ANTLR.
 *
 * @todo This inheritance chain in JavaScript is not necessary, and will
 * hurt the performance of each implementation. Consider refactoring.
 */
class Tree {}
class SyntaxTree extends Tree {}
class ParseTree extends SyntaxTree {}
class RuleNode extends ParseTree {}
class TerminalNode extends ParseTree {}
class ErrorNode extends TerminalNode {}
class ParseTreeVisitor {
	visit(ctx) {
		if (Array.isArray(ctx)) {
			return ctx.map(child => child.accept(this));
		}
		return ctx.accept(this);
	}
	visitChildren(ctx) {
		if (ctx.children) {
			return this.visit(ctx.children);
		}
		return null;
	}
	visitTerminal(node) {}
	visitErrorNode(node) {}
}
class ParseTreeListener {
	visitTerminal(node) {}
	visitErrorNode(node) {}
	enterEveryRule(node) {}
	exitEveryRule(node) {}
}

class TerminalNodeImpl extends TerminalNode {
	constructor(symbol) {
		this.parentCtx = null;
		this.symbol = symbol;
	}
	getChild() {
		return null;
	}
	getSymbol() {
		return this.symbol;
	}
	getParent() {
		return this.parentCtx;
	}
	getPayload() {
		return this.symbol;
	}
	getSourceInterval() {
		if (this.symbol == null) {
			return INVALID_INTERVAL;
		}
		const tokenIndex = this.symbol.tokenIndex;
		return new Interval(tokenIndex, tokenIndex);
	}
	getChildCount() {
		return 0;
	}
	accept(visitor) {
		return visitor.visitTerminal(this);
	}
	getText() {
		if (this.symbol == null) {
			return null;
		}
		return this.symbol.text;
	}
	toString() {
		if (this.symbol == null) {
			return null;
		}
		if (this.symbol.type === Token.EOF) {
			return EOF;
		}
		return this.symbol.text;
	}
}

/**
 * @description
 * Represents a token that was consumed during resynchronization rather than
 * during a valid match operation. For example, we will create this kind of a
 * node during single token insertion and deletion as well as during
 * "consume until error recovery set" upon no viable alternative exceptions.
 *
 */
class ErrorNodeImpl extends TerminalNodeImpl {
	constructor(token) {
		super(token);
	}
	isErrorNode() {
		return true;
	}
	accept(visitor) {
		return visitor.visitErrorNode(this);
	}
}

class ParseTreeWalker {
	/**
	 *
	 * @param {ParseTreeListener} listener
	 * @param {*} t
	 */
	walk(listener, t) {
		if (t instanceof ErrorNode || (t.isErrorNode != null && t.isErrorNode())) {
			listener.visitErrorNode(t);
		} else if (t instanceof TerminalNode) {
			listener.visitTerminalNode(t);
		} else {
			this.enterRule(listener, t);
			for (let i = 0; i < t.getChildCount(); i++) {
				const child = t.getChild(i);
				this.walk(listener, child);
			}
			this.exitRule(listener, t);
		}
	}
	/**
	 *
	 * @description
	 * The discovery of a rule node, involves sending two events: the generic
	 * {@link ParseTreeListener#enterEveryRule} and a
	 * {@link RuleContext}-specific event. First we trigger the generic and then
	 * the rule specific. We to them in reverse order upon finishing the node.
	 *
	 * @param {ParseTreeListener} listener
	 * @param {*} r
	 */
	enterRule(listener, r) {
		const ctx = r.getRuleContext();
		listener.enterEveryRule(ctx);
		ctx.enterRule(listener);
	}
	/**
	 *
	 * @param {ParseTreeListener} listener
	 * @param {*} r
	 */
	exitRule(listener, r) {
		const ctx = r.getRuleContext();
		ctx.exitRule(listener);
		listener.exitEveryRule(ctx);
	}
	static get DEFAULT() {
		return DEFAULT_PARSE_TREE_WALKER;
	}
}
/**
 *
 * @type {ParseTreeWalker}
 * @constant
 * @private
 */
const DEFAULT_PARSE_TREE_WALKER = new ParseTreeWalker();

export {
	RuleNode,
	ErrorNode,
	TerminalNode,
	ErrorNodeImpl,
	TerminalNodeImpl,
	ParseTreeListener,
	ParseTreeVisitor,
	ParseTreeWalker,
	INVALID_INTERVAL
}
