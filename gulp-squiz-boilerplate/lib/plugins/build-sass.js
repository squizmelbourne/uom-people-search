'use strict';
var sass = require('gulp-sass');
var duration = require('gulp-duration');
var through = require('through2');
var combine = require('stream-combiner');
var build = require('../util/build');
var File = require('vinyl');

module.exports = function(opts, parentPath) {
    return build({
        // Build plugin options
        parentPath: parentPath,
        prefixes:   opts.prefixes,
        tagname:    'link',
        attrname:   'href',

        // Pass output transformations
        outputTransformation: opts.outputTransformation,

        // Transform options
        start:   /^\s*build:sass\s+([^\s]+)\s+(.*)/,
        end:     /^\s*endbuild\s*$/,
        cache:   true,
        isBlock: true,

        // Return token handler
        fetchToken: function (options) {
            var token = {
                type: 'open',
                name: 'link',
                attr: {
                    href: options.relPath,
                    rel:  'stylesheet'
                },
                fullPath:  options.dest,
                pattern:   options.matches[0],
                selfClose: true
            };

            // Apply the token to the output
            if (options.attr && options.attr.media) {
                token.attr.media = options.attr.media;
            }

            return token;
        },

        // Before concatenation we need to map any media attributes that come through <link> elements
        // into the content of the file otherwise they will stripped
        beforeConcat: function(options) {
            return through.obj(function(file, enc, next) {
                var media;
                options.tokenMap.forEach(function(item) {
                     if (item.files.indexOf(file.path) !== -1 &&
                        item.token.hasOwnProperty('attr') &&
                        item.token.attr.hasOwnProperty('media')) {
                        media = item.token.attr.media;
                    }
                });
                if (media) {
                    // Push the wrapping content as separate 'fake' files so
                    // that gulp-sourcemaps can retain file numbers correctly
                    this.push(new File({
                        path:     '_generated_media_head.scss',
                        contents: new Buffer('@media ' + media + ' {')
                    }));
                    this.push(file);
                    this.push(new File({
                        path:     '_generated_media_foot.scss',
                        contents: new Buffer('\n}')
                    }));
                } else {
                    this.push(file);
                }
                next(null);
            });
        },

        // After concatenation stream handler (gulp vinyl fs stream)
        afterConcat: function (options) {
            var sassTimer = duration('Sass render');

            var streams = [];

            streams = streams.concat([
                sass(opts.sass || {}),
                sassTimer
            ]);

            if (options.attr && options.attr.hasOwnProperty('media')) {
                streams.push(through.obj(function(file, enc, next) {
                    // Push the wrapping content as separate 'fake' files so
                    // that gulp-sourcemaps can retain file numbers correctly
                    this.push(new File({
                        path:     '_generated_media_head.scss',
                        contents: new Buffer('@media ' + options.attr.media + ' {')
                    }));
                    this.push(file);
                    this.push(new File({
                        path:     '_generated_media_foot.scss',
                        contents: new Buffer('}')
                    }));
                    next(null);
                }));
            }

            return combine.apply(this, streams);
        }
    });
};
