'use strict';
var defaults = require('lodash.defaults');
var through = require('through2');
var t = require('html-tokeniser');
var combine = require('stream-combiner');
var duration = require('gulp-duration');
var File = require('vinyl');
var fs = require('cacheable-fs');
var streamUtil = require('./util/stream');
var combine = require('stream-combiner');
var relations = require('./util/relations');
var Promise = require('bluebird');

/**
 * Constructor
 * @param {object} opts
 *                      plugins {array} - array of plugin streams
 *                      prefixes {object} - hash of path prefixes
 *                      verbose {boolean} - verbose reporting flag
 *                      outputTransformation {function} - return a stream that transforms plugin file
 *                          output (vinyl-fs)
 */
var Parser = function(opts) {
    this.opts = defaults(opts || {}, {
        plugins:  [],
        prefixes: {},
        verbose:  true,

        outputTransformation: function() {
            return streamUtil.passthrough();
        }
    });
};

/**
 * Parsing transformation stream (vinyl-fs objects)
 * @return {object} stream
 */
Parser.prototype.parse = function() {
    var options = this.opts;
    return through.obj(function(file, enc, cb) {
        var content = '';

        var streams = [t.tokeniser()];

        // Fetch the plugin streams
        streams = streams.concat(options.plugins.map(function(plugin) {
            return plugin(options, file.path);
        }));

        streams.push(t.toHTML());

        if (options.verbose) {
            streams.push(duration('Parse complete:'+file.relative));
        }

        streams.push(through.obj(function toString(html, encr, done) {
            content += html;
            done();
        }, function flush(done) {
            file.contents = new Buffer(content);
            this.push(file);
            done();
            cb();
        }.bind(this)));

        file.pipe(combine(streams)).on('end', function() {
            // For each parse output the stats for the files resolved and cached by the cacheable fs
            if (options.verbose) {
                var cacheStats = fs.stats();
                console.log('File cache stats: hits(%s) misses(%s)', cacheStats.hits, cacheStats.misses);
                fs.resetStats();
            }
        });
    });
};

// Get a list of src files to watch
Parser.prototype.getWatchList = function(filterFn) {
    var keys = Object.keys(relations.get());
    if (filterFn) {
        keys = keys.filter(filterFn);
    }
    return keys;
};

// Stream that will expire any file path it finds from series of Vinyl file objects
Parser.prototype.expireCache = function() {
    return through.obj(function(file, enc, cb) {
        fs.expire(file.path);
        cb(null, file);
    });
};

Parser.prototype.expirePattern = function(pattern) {
    var parentPatterns = relations.getParentPatterns(pattern);
    // Delete cache for this pattern
    t.transform.cache.del(pattern);
    // Delete any parent pattern cache
    parentPatterns.forEach(t.transform.cache.del);
    if (this.opts.verbose) {
        console.log('Expiring token cache:', pattern, parentPatterns);
    }
}

// Exports Vinyl files in a stream with cache expiry on paths
Parser.prototype.watchHandler = function() {
    var self = this;
    return through.obj(function(file, enc, cb) {
        var relation = relations.get(file.path);

        if (!relation) {
            return cb(null);
        }

        var nestedParent = relation.parent;

        // Expire cache for patterns associated with each file
        // Patterns are keys for tokeniser.transform() matches - deleting the cache means
        // the parsed tokens are expired and not just handled from cache
        relation.pattern.forEach(self.expirePattern.bind(self));

        // If the relation is nested inside another parent we need to expire it's cache
        relation.nestings.forEach(function(nestedFile) {
            fs.expire(nestedFile);
            var parentRelation = relations.get(nestedFile);
            parentRelation.nestings.forEach(fs.expire);
            nestedParent = nestedParent.concat(parentRelation.parent);
            parentRelation.pattern.forEach(self.expirePattern.bind(self));
        });

        // Gather a list of unique parent files that have not been handled yet and emit
        // them for downstream handlers
        Promise.map(nestedParent, function(parentPath) {
            return fs.readFile(parentPath).then(function(content) {
                return {
                    path:    parentPath,
                    content: content
                };
            });
        }).then(function(results) {
            results.forEach(function(result) {
                this.push(new File({
                    path:     result.path,
                    contents: new Buffer(result.content)
                }));
            }.bind(this));
            cb(null);
        }.bind(this));
    });
};

module.exports = Parser;
