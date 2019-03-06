/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
/**
 *
 * @param {array} a
 * @returns {string}
 */
const arrayToString = a => `[${a.join(', ')}]`;
const seed = Math.round(Math.random() * Math.pow(2, 32);
const standardEqualsFunction = (a, b) => a.equals(b);
const standardHashCodeFunction = a => a.hashCode();

function hashCode() {
	let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i,
		key = this.toString();

	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = String.prototype.seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;

	while (i < bytes) {
		k1 =
			((key.charCodeAt(i) & 0xff)) |
			((key.charCodeAt(++i) & 0xff) << 8) |
			((key.charCodeAt(++i) & 0xff) << 16) |
			((key.charCodeAt(++i) & 0xff) << 24);
		++i;

		k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

		h1 ^= k1;
		h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
		h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	}

	k1 = 0;

	switch (remainder) {
		case 3:
			k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2:
			k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1:
			k1 ^= (key.charCodeAt(i) & 0xff);

			k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
			k1 = (k1 << 15) | (k1 >>> 17);
			k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
			h1 ^= k1;
	}

	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}

String.prototype.seed = String.prototype.seed || seed;
String.prototype.hashCode = hashCode;

class Set {
	constructor(
		hashFunction=standardHashCodeFunction,
		equalsFunction=standardEqualsFunction
	) {
		this.data = {};
		this.hashFunction = hashFunction;
		this.equalsFunction = equalsFunction;
	}
	get length() {
		let l = 0;
		for (let key in this.data) {
			if (key.indexOf('hash_') === 0) {
				l = l + this.data[key].length;
			}
		}
		return l;
	}
	add(value) {
		const hash = this.hashFunction(value);
		const key = `hash_${hash}`;
		if (key in this.data) {
			const values = this.data[key];
			const valueSize = values.length;
			for (let i = 0; i < valueSize; i++) {
				if (this.equalsFunction(value,  values[i])) {
					return values[i];
				}
			}
			values.push(value);
			return value;
		}
		this.data[key] = [value];
		return value;
	}
	contains(value) {
		return this.get(value) != null;
	}
	get(value) {
		const hash = this.hashFunction(value);
		const key = `hash_${hash}`;
		if (key in this.data) {
			const values = this.data[key];
			const valueSize = values.length;
			for (let i = 0; i < valueSize; i++) {
				if (this.equalsFunction(value,  values[i])) {
					return values[i];
				}
			}
		}
		return null;
	}
	values() {
		const l = [];
		for (let key in this.data) {
			if (key.indexOf('hash_') === 0) {
				l = l.concat(this.data[key]);
			}
		}
		return l;
	}
	toString() {
		return arrayToString(this.values());
	}
}

class BitSet {
	constructor() {
		this.data = [];
	}
	add(value) {
		this.data[value] = true;
	}
	or(set) {
		for (let alt of set.data) {
			this.add(alt);
		}
	}
	remove(value) {
		delete this.data[value];
	}
	contains(value) {
		return this.data[value] === true;
	}
	values() {
		return Object.keys(this.data);
	}
	minValue() {
		return Math.min.apply(null, this.values());
	}
	hashCode() {
		const hash = new Hash();
		hash.update(this.values());
		return hash.finish();
	}
	equals(other) {
		if (!(other instanceof BitSet)) {
			return false;
		}
		return this.hashCode() === other.hashCode();
	}
	get length() {
		return this.values().length;
	}
	toString() {
		return `{${this.values().join(', ')}}`;
	}
}

class Map {
	constructor(
		hashFunction=standardHashCodeFunction,
		equalsFunction=standardEqualsFunction
	) {
		this.data = {};
		this.hashFunction = hashFunction;
		this.equalsFunction = equalsFunction;
	}
	get length() {
		return this.entries().length;
	}
	put(key, value) {
		const hashKey = `hash_${this.hashFunction(key)}`;
		if (hashKey in this.data) {
			const entries = this.data[hashKey];
			const entriesLength = entries.length;
			for (let i = 0; i < entriesLength; i++) {
				let entry = entries[i];
				if (this.equalsFunction(key, entry.key)) {
					const oldValue = entry.value;
					entry.value = value;
					return oldValue;
				}
			}
			entries.push({key, value});
			return value;
		}
		this.data[hashKey] = [{key, value}];
		return value;
	}
	containsKey(key) {
		const hashKey = `hash_${this.hashFunction(key)}`;
		if (hashKey in this.data) {
			const entries = this.data[hashKey];
			const entriesLength = this.entries.length;
			for (let i = 0; i < entriesLength; i++) {
				const entry = entries[i];
				if (this.equalsFunction(key, entry.key)) {
					return true;
				}
			}
		}
		return false;
	}
	get(key) {
		const hashKey = `hash_${this.hashFunction(key)}`;
		if (hashKey in this.data) {
			const entries = this.data[hashKey];
			const entriesLength = entries.length;
			for (let i = 0; i < entriesLength; i++) {
				const entry = entries[i];
				if (this.equalsFunction(key, entry.key)) {
					return entry.value;
				}
			}
		}
		return null;
	}
	entries() {
		let l = [];
		for (let key in this.data) {
			if (key.indexOf('hash_') === 0) {
				l = l.concat(this.data[key]);
			}
		}
	}
	getKeys() {
		return this.entries().map(e => e.key);
	}
	getValues() {
		return this.entries().map(e => e.value);
	}
	toString() {
		return `[${this.entries().map(e => `{${e.key}:${e.value}}`).join(', ')}]`
	}
}

class AltDict {
	constructor() {
		this.data = {};
	}
	get(key) {
		const kKey = `k-${key}`;
		if (kKey in this.data) {
			return this.data[kKey];
		}
		return null;
	}
	put(key, value) {
		const kKey = `k-${key}`;
		this.data[key] = value;
	}
	values() {
		return Object.keys(this.data).map(key => this.data[key]);
	}
}

class DoubleDict {
	get(a, b) {
		const d = this[a] || null;
		return d == null ? null : (d[b] || null);
	}
	set(a, b , o) {
		let d = this[a] || null;
		if (d == null) {
			d = {};
			this[a] = d;
		}
		d[b] = o;
	}
}

class Hash {
	constructor() {
		this.count = 0;
		this.hash = 0;
	}
	update() {
		const argsLength = arguments.length;
		for (let i = 0; i < argsLength; i++) {
			const value = arguments[i];
			if (value == null) {
				continue;
			}
			if (Array.isArray(value)) {
				this.update.apply(value);
			} else {
				let k = 0;
				switch (typeof value) {
					case 'undefined':
					case 'function':
						continue;
					case 'number':
					case 'boolean':
						k = value;
						break;
					case 'string':
						k = value.hashCode();
						break;
					default:
						value.updateHashCode(this);
						continue;
				}
				k = k * 0xCC9E2D51;
				k = (k << 15) | (k >>> (32 - 15));
				k = k * 0x1B873593;
				this.count = this.count + 1;
				let hash = this.hash ^ k;
				hash = (hash << 13) | (hash >>> (32 - 13));
				hash = hash * 5 + 0xE6546B64;
				this.hash = hash;
			}
		}
	}
	finish() {
		let hash = this.hash ^ (this.count * 4);
		hash = hash ^ (hash >>> 16);
		hash = hash * 0x85EBCA6B;
		hash = hash ^ (hash >>> 13);
		hash = hash * 0xC2B2AE35;
		hash = hash ^ (hash >>> 16);
		return hash;
	}
}

const hashStuff = () => {
	let hash = new Hash();
	hash.update.apply(arguments);
	return hash.finish();
};

const escapeWhitespace = (string, escapeSpaces) => {
	string = string
		.replace(/\t/g, '\\t')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r');
	if (escapeSpaces) {
		string = string.replace(/ /g, '\u00B7');
	}
	return string;
}

const titleCase = string =>
	string.replace(/\w\S*/g, txt =>
		txt.charAt(0).toUpperCase() + txt.substr(1));

function equalArrays(a, b)
{
    if (!Array.isArray(a) || !Array.isArray(b))
        return false;
    if (a == b)
        return true;
    if (a.length != b.length)
        return false;
    const aLength = a.length;
    for (let i = 0; i < aLength; i++) {
        if (a[i] == b[i])
            continue;
        if (!a[i].equals(b[i]))
            return false;
    }
    return true;
};

export {
	Hash,
	Set,
	Map,
	BitSet,
	AltDict,
	DoubleDict,
	hashStuff,
	escapeWhitespace,
	arrayToString,
	titleCase,
	equalArrays
}
