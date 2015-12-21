'use strict';
var through = require('through2');

module.exports = function(opts, parentPath) {
    return through.obj(function(token, enc, cb) {
        // Strip the token if it's a comment
        if (token.type === 'comment' &&
            /^\s?@@/.test(token.content)) {
            return cb(null);
        }
        cb(null, token);
    });
};
