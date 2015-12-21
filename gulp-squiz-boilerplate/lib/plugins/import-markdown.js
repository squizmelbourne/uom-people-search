'use strict';
var t = require('html-tokeniser');
var through = require('through2');
var magic = require('magic-paths');
var relations = require('../util/relations');
var matchExpr = /^\s*?import:markdown\s+([^\s]+)\s+(.*)/;
var stream = require('../util/stream');
var gulp = require('gulp');
var markdown = require('gulp-markdown');

// Token transformation stream
module.exports = function (options, parentPath) {
    return t.transform({
        start: matchExpr,
        cache: true,

        onMatchStart: function(match) {
            relations.pushParent(match[0], parentPath);
        },
        handler: function (opts, cb) {
            var content = '';
            magic.expand(opts.matches[1], {
                prefixes: options.prefixes
            })
            .then(function(files) {
                gulp.src(files)
                .pipe(markdown())
                .pipe(through.obj(function(file, enc, next) {
                    relations.pushFile(opts.matches[0], file.path);
                    content += file.contents.toString();
                    next(null);
                }, function(done) {
                    this.push(content);
                    done();
                }))
                .pipe(t.tokeniser())
                .pipe(stream.toArray(function(tokens) {
                    cb(null, tokens);
                }));
            });
        }
    });
};
