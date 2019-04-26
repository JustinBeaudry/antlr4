/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {escapeWhitespace} from '../Utils';
import {Token} from '../tokens/Token';
import {RuleNode, ErrorNode, TerminalNode} from './Tree';
import {ParserRuleContext} from '../ParserRuleContext';
import {RuleContext} from '../RuleContext';
import {INVALID_ALT_NUMBER} from '../atn/ATN';
/**
 *
 * @description
 * A set of utility routines useful for all kinds of ANTLR trees.
 *
 */
class Trees {
	/**
	 *
	 * @description
	 * Print out a while {@link Tree} in LISP form. {@Trees#getNodeText} is
	 * used on the node payloads to get the text for the nodes. Detect parse
	 * trees and extract data appropriately.
	 *
	 * @param {Tree} tree
	 * @param {*} ruleNames
	 * @param {*} recog
	 * @returns {string}
	 */
	static toStringTree(tree, ruleNames=null, recog=null) {
		if (recog != null) {
			ruleNames = recog.ruleNames;
		}
		const text = escapeWhitespace(Trees.getNodeText(tree, ruleNames));
		const childCount = tree.getChildCount();
		if (childCount === 0) {
			return text;
		}
		let stringTree = `{${text} `;
		if (childCount > 0) {
			const childText = Trees.toStringTree(tree.getChild(0), ruleNames);
			stringTree += childText;
		}
		for (let i = 0; i < childCount; i++) {
			const childText = Trees.toStringTree(tree.getChild(i), ruleNames);
			stringTree += ` ${childText}`
		}
		stringTree += ')';
		return stringTree;
	}
	getNodeText(tree, ruleNames=null, recog=null) {
		if (recog != null) {
			ruleNames = recog.ruleNames;
		}
		if (ruleNames != null) {
			if (tree instanceof RuleContext) {
				const altNumber = tree.getAltNumber();
				if (altNumber !== INVALID_ALT_NUMBER) {
					return `${ruleNames[tree.ruleIndex]}:${altNumber}`;
				}
				return ruleNames[tree.ruleIndex];
			} else if (tree instanceof ErrorNode) {
				return tree.toString();
			}  else if (tree instanceof TerminalNode) {
				if (tree.symbol != null) {
					return tree.symbol.text;
				}
			}
		}
		// no recog for rule names
		const payload = tree.getPayload();
		if (payload instanceof Token) {
			return payload.text;
		}
		return payload.toString();
	}
	/**
	 *
	 * @description
	 * Return ordered list of all children of this node
	 *
	 * @param {Tree} tree
	 * @returns {Array}
	 */
	getChildren(tree) {
		const list = [];
		const childCount = tree.getChildCount();
		for (let i = 0; i < childCount; i++) {
			list.push(tree.getChild(i));
		}
		return list;
	}
	/**
	 *
	 * @description
	 * Return a list of all ancestors of this node. The first node of the list is
	 * the root and the last is the parent of this node.
	 *
	 * @param {Tree} tree
	 * @returns {Array}
	 */
	getAncestors(tree) {
		let ancestors = [];
		let parent = tree.getParent();
		while (parent != null) {
			ancestors = [
				parent,
				...ancestors
			];
			parent = parent.getParent();
		}
		return ancestors;
	}
	findAllTokenNodes(t, ttype) {
		return Trees.findAllNodes(t, ttype, true);
	}
	findAllRuleNodes(t, ruleIndex) {
		return Trees.findAllNodes(t, ruleIndex, false);
	}
	findAllNodes(t, index, findTokens) {
		const nodes = [];
		this._findAllNodes(t, index, findTokens, nodes);
		return nodes;
	}
	/**
	 *
	 * @param {Tree} t
	 * @param {number} index
	 * @param {boolean} findTokens
	 * @param {array} nodes
	 * @private
	 */
	_findAllNodes(t, index, findTokens, nodes) {
		if (findTokens && t instanceof TerminalNode) {
			if (t.symbol != null && t.symbol.type === index) {
				nodes.push(t);
			}
		} else if (!findTokens && t instanceof ParserRuleContext) {
			if (t.ruleIndex === index) {
				nodex.push(t);
			}
		}
		const childCount = t.getChildCount();
		for (let i = 0; i < childCount; i++) {
			findAllNodes(t.getChild(i), index, findTokens, nodes);
		}
	}
	descendants(t) {
		let nodes = [t];
		const childCount = t.getChildCount();
		for (let i = 0; i < childCount; i++) {
			nodes = [
				...nodes,
				Trees.descendants(t.getChild(i));
			];
		}
		return nodes;
	}
}

export default Trees;
