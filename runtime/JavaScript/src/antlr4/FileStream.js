/**
 * @copyright
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 * @license BSD-3-Clause
 */
import {InputStream} from './InputStream';
import {fs, isNode} from './environment';
/**
 *
 * @description
 * This is an {@link InputStream} that is loaded from a file at construction
 * time.
 */
class FileStream extends InputStream {
	/**
	 *
	 * @param {string} fileName
	 * @param {boolean} decodeToUnicodeCodePoints
	 * @returns {FileStream}
	 */
	constructor(fileName, decodeToUnicodeCodePoints) {
		let data;
		if (isNode) {
			data = fs.readFileSync(fileName, 'utf8');
		}
		super(data, decodeToUnicodeCodePoints);
		return this;
	}
}

export default FileStream;
