'use strict';
var passthrough = require('../util/stream.js').passthrough;
var through = require('through2');
var build = require('../util/build');
var sourcemaps = require('gulp-sourcemaps');
var combine = require('stream-combiner');

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
        start:   /^\s*build:css\s+([^\s]+)\s+(.*)/,
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

        // After concatenation stream handler (gulp vinyl fs stream)
        afterConcat: function (options) {

            var streams = [];

            if (options.attr.sourcemaps) {
                streams.push(sourcemaps.init({
                    loadMaps: true
                }));
            }

            if (options.attr.sourcemaps) {
                streams.push(sourcemaps.write());
            }

            return streams.length ? combine.apply(this, streams) : passthrough();
        }
    });
};
