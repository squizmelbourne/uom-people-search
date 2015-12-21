'use strict';
var transform = require('html-tokeniser').transform;
var magic = require('magic-paths');
var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var through = require('through2');
var path = require('path');
var fs = require('fs');
var relations = require('../util/relations');
var _ = require('lodash');
var merge = require('lodash.defaults');
var Promise = require('bluebird');
var combine = require('stream-combiner');
var Handlebars = require('handlebars');
var gutil = require('gulp-util');
var chalk = require('chalk');
var File = require('vinyl');
var streamify = require('stream-array');
var readFile = Promise.promisify(fs.readFile);

/**
 * Filters an array of token to desired matching tokens (by tagName and extracting a file path)
 * @param  {Array} tokens   Block tokens
 * @param  {Object} options Hash of options
 * @return {[type]}         [description]
 */
function getMatchingTokens(tokens, options) {
    return tokens.filter(function(token) {
        if (token.type === 'open' &&
            token.name === options.tagname) {
            if (token.fullPath) {
                return true;
            } else if (token.attr &&
                token.attr.hasOwnProperty(options.attrname)) {
                return true;
            }
        }
        return false;
    });
}

/**
 * Add banner content (header/footer) to a string of file contents
 * @param {String} content  The contents of the file
 * @param {String} filePath The full path to the file
 * @param {Object} header   Handlebars template instance for the header
 * @param {Object} footer   Handlebars template instance for the footer
 * @return {Array} array of Vinyl file objects which help with more accurate source maps
 */
function getFilesWithBanners(content, filePath, header, footer) {
    var files = [];
    if (header) {
        files.push(new File({
            path:     '_generated_header.scss',
            contents: new Buffer(header({path: filePath}))
        }));
    }
    files.push(new File({
        path:     filePath,
        contents: new Buffer(content)
    }));
    if (footer) {
        files.push(new File({
            path:     '_generated_footer.scss',
            contents: new Buffer(footer({path: filePath}))
        }));
    }
    return files;
}

/**
 * Convert tokens to a stream of vinyl files
 * @param  {Object} block   Block data
 * @param  {Object} options Hash of options
 * @return {Object}         Promise
 */
function concatTokenContent(block, options) {
    var header = options.attr.header ? Handlebars.compile(options.attr.header) : null;
    var footer = options.attr.footer ? Handlebars.compile(options.attr.footer) : null;
    var tokens = getMatchingTokens(block.tokens, options);
    return Promise.map(tokens, function(token) {
        return magic
            .expand(token.fullPath || token.attr[options.attrname], options)
            .then(function(paths) {
                options.tokenMap.push({
                    files: paths,
                    token: token
                });
                if (token.hasOwnProperty('content')) {
                    // We already have token content
                    return getFilesWithBanners(token.content, paths[0], header, footer);
                } else {
                    // We need to resolve the content of the tokens
                    return Promise.map(paths, readFile).then(function(contents) {
                        return _.flatten(contents.map(function(content, i) {
                            return getFilesWithBanners(content, paths[i], header, footer);
                        }));
                    });
                }
            });
    }).then(function(files) {
        var map;
        files = _.flatten(files);

        // Gather relations for files to this block pattern
        files.forEach(function(file) {
            relations.pushFile(block.matches[0], file.path);
        });

        var read = [streamify(files)];

        // Sourcemaps
        read.push(sourcemaps.init({loadMaps: true}));

        // Before concat
        if (options.beforeConcat) {
            read.push(options.beforeConcat(options));
        }

        // Concatentation
        read.push(concat(path.basename(options.dest)));

        read.push(through.obj(function(file, enc, cb) {
            if (file.sourceMap) {
                map = file.sourceMap;
            }
            cb(null, file);
        }));

        // After concatenation
        if (options.afterConcat) {
            read.push(options.afterConcat(options));
        }

        // Post output transformations
        if (options.outputTransformation) {
            read.push(options.outputTransformation(options));
        }

        // Write sourcemaps
        read.push(sourcemaps.write('./'));

        // Return a single stream
        return combine.apply(this, read).on('error', function(err) {
            // Ensure any errors in the stream don't kill the process
            gutil.log(chalk.red('Error caused by directive'), block.matches[0]);
            console.log(chalk.red(err.message));

            if (map) {
                var consumer = new SourceMapConsumer(map);
                var pos = consumer.originalPositionFor({
                    line:   err.line,
                    column: err.column
                });
                console.log(chalk.red('On line '+pos.line+' of '+pos.source));
            }

            this.emit('end');
        });
    });
}

/**
 * Render block content to a token (or array of tokens)
 * @param  {Object}   block   Block data
 * @param  {Object}   options Hash of options
 * @param  {Function} cb      Callback
 * @return {void}
 */
function render(block, options, cb) {
    var fetchToken = options.fetchToken || function() {
        return {
            type:    'comment',
            content: 'Token not handled'
        };
    };
    concatTokenContent(block, options)
    .then(function(concatStream) {

        // Concat and write out the file
        concatStream
        .pipe(gulp.dest(path.dirname(options.dest)))

        // Send back a token
        .on('finish', function() {
            var token = fetchToken(options);
            if (options.attr.hasOwnProperty('hide') && options.attr.hide === true) {
                token = [];
            }
            cb(null, token);
        });
    });
}

/**
 * Fetch an array of child patterns
 * @param  {Array} tokens Array of block tokens
 * @return {Array}
 */
function getChildPatterns(tokens) {
    var childPatterns = [];
    tokens.forEach(function(token) {
        if (token.hasOwnProperty('pattern')) {
            childPatterns = childPatterns.concat(token.pattern);
        }
    });
    return childPatterns;
}

/**
 * Get a transformation plugin for block build:* directives
 * @param  {object}    options
 *         parentPath  The path to the parent file (containing the tokens)
 *         prefixes    A hash of prefixes to file paths, e.g. { module: ['source/modules/', 'source/bower_components/squiz-module-*']
 *         expr        The expression to extract matching comment paths, e.g. <!-- import:js /path/to.js -->
 *         attrname    The name of the attribute that sources url references ('href' or 'src')
 *         beforeConcat (function) - return a gulp file stream transformation before concatentation
 *         afterConcat (function) - return a gulp file stream transformation after concatentation
 * @return {object}   Transformation plugin
 */
function getPlugin(options) {
    var tOpts = merge(options, {
        onMatchStart: function(match) {
            relations.pushParent(match[0], options.parentPath);
        },

        handler: function (block, cb) {
            var match = block.matches[1];
            var dest = magic.prefix(match, options.prefixes).shift();

            // Construction of HTML relative paths
            options.relPath = match.indexOf(':') !== -1 ? match.split(':').pop() : match;
            options.match = match;
            options.matches = block.matches;
            options.attr = {};
            options.dest = dest;
            options.tokenMap = [];

            try {
                options.attr = block.matches[2] ? JSON.parse(block.matches[2]) : {};
            } catch(e) {
                // Reports the error without throwing
                console.log('ERROR: Unable to parse options from', block.matches[0], 'in', options.parentPath, '\tCheck for valid JSON');
            }

            // Mixin handlebars helpers
            if (options.attr.hasOwnProperty('helpers')) {
                var helperPath = path.join(process.cwd(), options.attr.helpers);
                var stat = fs.statSync(helperPath);
                if (stat.isFile()) {
                    require(helperPath)(Handlebars);
                }
            }

            var childPatterns = getChildPatterns(block.tokens);
            relations.pushChildPatterns(block.matches[0], childPatterns);

            render(block, options, cb);
        }
    });

    return transform(tOpts);
}

/**
 * Factory function to create build plugins
 * @param  {object} options hash of options
 * @return {[object}        Token transformation plugin
 */
module.exports = function(options) {
    return getPlugin(merge(options, {
        prefixes: [],
        attrname: ''
    }));
};
