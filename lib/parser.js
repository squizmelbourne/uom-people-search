'use strict';
/**
 * A singleton boilerplate parser instance
 */
var Parser = require('gulp-squiz-boilerplate').Parser;
var config = require('./config.js');

// Singleton instance of the parser
var parser = new Parser(config);

module.exports = parser;
