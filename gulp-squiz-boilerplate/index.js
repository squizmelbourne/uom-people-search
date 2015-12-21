'use strict';
var Parser = require('./lib/Parser.js');

module.exports = function(options) {
    return new Parser(options);
};

module.exports.Parser = Parser;
