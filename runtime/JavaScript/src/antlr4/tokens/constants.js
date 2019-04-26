/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
/**
 *
 * @type "<no token>"
 * @constant
 */
export const NO_TOKEN = '<no token>';
/**
 *
 * @type "<EOF>"
 * @constant
 */
export const EOF = '<EOF>';
/**
 *
 * @type {string}
 * @constant
 */
export const MISSING_EOF = `<missing EOF>`;
/**
 *
 * @type "<no text>"
 * @constant
 */
export const NO_TEXT = '<no text>';
/**
 *
 * @type "<empty>"
 * @constant
 */
export const EMPTY = '<empty>';
/**
 *
 * @type "<EPSILON"
 * @constant
 */
export const EPSILON = '<EPSILON>';
/**
 *
 * @type "<unknown input>"
 * @constant
 */
export const UNKNOWN_INPUT = '<unknown input>';
/**
 *
 * @param {string} literalName
 * @returns {string}
 */
export const createMissing = literalName => create(`missing ${literalName}`);
/**
 *
 * @param {string} type
 * @returns {string}
 */
export const create = type => `<${type}>`;
