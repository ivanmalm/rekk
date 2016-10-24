/*jslint es6: true */
/*jslint nomen: true */

(function () {
	"use strict";
	/*jslint node: true */

	/*global require */
	delete require.cache[require.resolve(__filename)];

	/* Dependencies */
	const fs = require('fs');
	const _ = require('underscore');
	const path = require('path');
	const recursive = require('recursive-readdir-synchronous');

	/**
	 * Accepts an input string and parses it to find the 
	 * relevant module using standard require(...)-syntax.
	 * The module saves me a lot of work as i don't have to 
	 * specify my module paths fully (and keep them updated).
	 * 
	 * The input string can be any of the following:
	 * 1) Just the filename, not ideal as the implementation will search in all folders then.
	 *    Example param: 'rekk'
	 * 2) A partial directory path, starting from the application root, and the file name (with or without .js).
	 *    Example: 'app/config', which would match a file at app/persistance/config.js
	 * 3) A full path to a JS-file, this is the absolute quickest way to use this module (but also kind of defeats the point...).
	 *    Example: 'app/persistance/config.js' which would return the file mentioned in 2).
	 *    
	 * Note: if there are multiple files matching the input, the one with the shortest absolute path will be chosen.
	 * This is to encourage throughly specifying the full (or at leat most of it) path.
	 * 
	 * @author Ivan Malmberg
	 * @param   {string} input For valid values, see above.
	 * @returns {{object}} Object/function corresponding with the search parameterer.
	 *                     Any failure caused by node's require(...) function will cause your application to exit with code 1.
	 */
	module.exports = function (input) {
		// Get root path of parent module
		var rootPath = findBaseDir(module.parent.paths);
		const inputFile = path.parse(input);

		// Add .js-extension to file if not provided
		if (!inputFile.ext) {
			inputFile.base += '.js';
		}

		// Add search dir to search start point
		const initialDirectory = path.join(rootPath, inputFile.dir);
		const fileList = getFileList(initialDirectory);
		const foundFile = findFile(inputFile, fileList);

		try {
			return require(foundFile);
		} catch (err) {
			console.error('Could not load file at <%s> due to:\n%s', foundFile, err.stack);
			process.exit(1);
		}
	};

	/**
	 * [[Description]]
	 * @author Ivan Malmberg
	 * @throws {Error} [[Description]]
	 * @param   {object}   input    [[Description]]
	 * @param   {[[Type]]} fileList [[Description]]
	 * @returns {boolean}  [[Description]]
	 */
	function findFile(input, fileList) {
		const foundFiles = _.filter(fileList, (obj) => {
			if (path.basename(obj).toUpperCase() === input.base.toUpperCase()) {
				return true;
			}

			return false;
		});

		if (foundFiles.length === 0) {
			throw new Error('No matching files found for params: ' + JSON.stringify(input, null, '\t'));
		} else if (foundFiles.length > 1) {
			// Try to take the file with the shortest path
			const filteredFiles = _.sortBy(foundFiles, (file) => {
				return file.length;
			});

			console.warn('Found amibigious files <%s> for search value <%s>, using <%s>',
				filteredFiles.toString(),
				input.base,
				filteredFiles[0]);
		}

		return foundFiles[0];
	}

	/**
	 * Finds the base (root) directory of the Node application.
	 * @author Ivan Malmberg
	 * @param   {String[]} paths [[Description]]
	 * @returns {[[Type]]} [[Description]]
	 */
	function findBaseDir(paths) {
		const existingPath = _.find(paths, function (p) {
			return fs.existsSync(p);
		});

		return path.normalize(existingPath + '/../');
	}

	/**
	 * Generates a list of files recursively from the input directory.
	 * 
	 * @author Ivan Malmberg 
	 * @throws {Error} If no files or subdirectories was found on the searchPath.
	 * @param   {string} searchPath The path where the search should start it's recursive hunt for the file in question.
	 * @returns {string[]} A list of filenames and paths found in the searchPath.
	 */
	function getFileList(searchPath) {
		const files = recursive(searchPath, ['node_modules']);

		if (!files) {
			throw new Error('No files found on path: ' + searchPath);
		}

		return files;
	}
})();
