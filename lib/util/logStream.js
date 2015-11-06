'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function(msg) {
    return through.obj(function(file, enc, cb) {
        var relPath = path.relative(process.cwd(), file.path);
        gutil.log.call(this, msg, gutil.colors.cyan(relPath));
        cb(null, file);
    });
};
