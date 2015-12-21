'use strict';
/**
 * Import content (similar to SSIs except imported html content is tokenised)
 * Can be used as import:content or import:handlebars
 * If .html files are used the import will recurse
 */

var t = require('html-tokeniser');
var through = require('through2');
var magic = require('magic-paths');
var Promise = require('bluebird');
var _ = require('lodash');
var cfs = require('cacheable-fs');
var relations = require('../util/relations');
var stream = require('../util/stream');
var matchExpr = /^\s*?import:(content|handlebars)\s+([^\s]+)\s+(.*)/;
var merge = require('deep-extend');
var Handlebars = require('handlebars');
var path = require('path');

/*eslint block-scoped-var: 0, no-use-before-define: 0, dot-notation: 0*/
// Resolves a file pattern to an array of tokens
function resolvePatternToTokens(opts, cb) {
    magic.expand(opts.matches[2], {
        prefixes: opts.prefixes
    }, function(err, files) {
        if (err) {
            throw err;
        }
        Promise.map(files, function(file) {
            relations.pushFile(opts.matches[0], file);
            return resolveContent(file, opts, []);
        }).then(function(tokens) {
            cb(null, _.flatten(tokens));
        }).catch(cb);
    });
}

// Resolve the content of an individual file path into tokens and recursively parse
// any child import:content expressions
function resolveContent(filePath, opts, tokens) {
    if (!tokens) {
        tokens = [];
    }

    // detect recursion
    opts.seen.push(filePath);
    if (_.uniq(opts.seen).length !== opts.seen.length) {
        throw 'Cyclic recursion detected during import:content. The file path '+filePath+' was seen more than once';
    }

    return new Promise(function (resolve, reject) {
        var tk = tokens.slice();
        var read = cfs.createReadStream(filePath);
        read.on('error', function (err) {
            reject(err);
        });

        if (opts.matches[1] === 'handlebars') {
            if (opts.matches[3]) {
                var attr = JSON.parse(opts.matches[3]);

                // Mixin helpers
                if (attr.hasOwnProperty('helpers')) {
                    require(path.join(process.cwd(), attr.helpers))(Handlebars);
                }

                if (attr.hasOwnProperty('data')) {
                    // Read the JSON file
                    var dataPath = path.join(process.cwd(), attr.data);
                    cfs.readFile(dataPath)
                    .then(function(content) {
                        var data = JSON.parse(content);
                        // Parse as a handlebars template
                        read
                        .pipe(stream.toString(function(str) {
                            var template = Handlebars.compile(str);
                            var rendered = template(data);
                            return rendered;
                        }))
                        // Parse into tokens
                        .pipe(t.tokeniser())
                        .pipe(through.obj(function(token, enc, next) {
                            tk.push(token);
                            next(null, token);
                        }))
                        .on('finish', function() {
                            resolve(tk);
                        })
                        .on('error', reject)
                        .resume();
                    })
                    .catch(reject);
                } else {
                    console.log('ERROR: no data property');
                    resolve(tk);
                }
            } else {
                console.log('ERROR: no JSON data');
                resolve(tk);
            }
        } else if (filePath.match(/\.htm(l)?$/i)) {
            // Only process *.html with the tokeniser and recursive pattern matching
            read.pipe(t.tokeniser())
            .pipe(through.obj(function(token, enc, next) {
                this.push(token);

                if (token.type === 'comment') {
                    var match = token.content.match(matchExpr);
                    if (match) {
                        // Push a new parent relation
                        relations.pushParent(match[0], filePath, true);

                        // Resolve the pattern to a new series of tokens
                        resolvePatternToTokens(merge(opts, {
                            matches: match
                        }), function(err, newTokens) {
                            if (!err) {
                                tk = tk.concat(newTokens);
                            }
                            next();
                        });
                    } else {
                        tk.push(token);
                        next();
                    }
                } else {
                    tk.push(token);
                    next();
                }
            }))
            .on('finish', function() {
                resolve(tk);
            })
            .on('error', reject)
            .resume();
        } else {
            read.pipe(stream.toString(resolve));
        }
    });
}

// Token transformation stream
module.exports = function (options, parentPath) {
    return t.transform({
        start:        matchExpr,
        onMatchStart: function(match) {
            relations.pushParent(match[0], parentPath);
        },
        handler: function (opts, cb) {
            resolvePatternToTokens({
                matches:  opts.matches,
                prefixes: options.prefixes,
                seen:     []
            }, function(err, tokens) {
                if (err) {
                    cb(null, opts.token);
                } else {
                    cb(null, tokens);
                }
            });
        }
    });
};
