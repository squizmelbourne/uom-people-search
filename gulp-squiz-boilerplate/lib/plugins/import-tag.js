'use strict';
// Import simple directives referencing glob file paths into <script> or <link> tags (as tokens)
var transform = require('html-tokeniser').transform;
var matchExpr = /^\s*?import:(js|css)\s+([^\s]+)\s+?(.*)/;
var magic = require('magic-paths');
var path = require('path');
var Handlebars = require('handlebars');
var cfs = require('cacheable-fs');
var Promise = require('bluebird');
var fs = require('fs');

module.exports = function (opts) {
    return transform({
        start:   matchExpr,
        cache:   false,
        handler: function (options, cb) {
            var type = options.matches[1];
            var header;
            var footer;
            var attr = {};

            try {
                attr = options.matches[3] && !/^\s+$/.test(options.matches[3]) ? JSON.parse(options.matches[3]) : {};
                header = attr.header ? Handlebars.compile(attr.header) : null;
                footer = attr.footer ? Handlebars.compile(attr.footer) : null;

                // Mixin handlebars helpers
                if (attr.hasOwnProperty('helpers')) {
                    var helperPath = path.join(process.cwd(), attr.helpers);
                    var stat = fs.statSync(helperPath);
                    if (stat.isFile()) {
                        require(helperPath)(Handlebars);
                    } else {
                        console.log('ERROR: Handlebars helper not found ' + attr.helpers);
                    }
                }
            } catch(e) {
                console.log('ERROR:', e.message);
                console.log(e.stack);
            }

            /*eslint dot-notation: 0*/
            magic.expand(options.matches[2], opts)
            // Read each file and append any necessary header/footer content
            .then(function(files) {
                return Promise.map(files, function(fileName) {
                    return cfs.readFile(fileName)
                        .then(function(content) {
                            if (header) {
                                content = header({
                                    path: fileName
                                }) + content;
                            }
                            if (footer) {
                                content += footer({
                                    path: fileName
                                });
                            }
                            return {
                                path:    fileName,
                                content: content
                            };
                        });
                });
            })
            // Convert each file into tokens
            .then(function(files) {
                var tokens = [];
                files.forEach(function eachFile(file) {
                    var relPath = file.path;
                    var openTag = {};
                    // convert absolute file path to a relative path
                    if (path.isAbsolute(relPath)) {
                        relPath = path.normalize('./' + relPath.replace(process.cwd(), ''));
                    }
                    switch (type) {
                        case 'js':
                            openTag = {
                                type: 'open',
                                name: 'script',
                                attr: {
                                    src: relPath
                                },
                                content:  file.content,
                                fullPath: file.path
                            };

                            tokens.push(openTag);
                            tokens.push({
                                type: 'close',
                                name: 'script'
                            });
                        break;
                        case 'css':
                            openTag = {
                                type: 'open',
                                name: 'link',
                                attr: {
                                    href: relPath,
                                    rel:  'stylesheet'
                                },
                                content:     file.content,
                                fullPath:    file.path,
                                selfClosing: true
                            };

                            if (attr.media) {
                                openTag.attr.media = attr.media;
                            }

                            tokens.push(openTag);
                        break;
                    }
                });

                cb(null, tokens);
            }).catch(function(err) {
                cb(err, []);
            });
        }
    });
};
