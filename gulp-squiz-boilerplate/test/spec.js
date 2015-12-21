'use strict';
/*eslint no-unused-vars: 0*/
/*globals describe, it, afterEach, before*/
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var rimraf = require('rimraf');
var gulp = require('gulp');
var Parser = require('../index.js').Parser;
var async = require('async');
var helpers = require('./helpers');
var path = require('path');
var relations = require('../lib/util/relations');
var through = require('through2');
var _ = require('lodash');
var fs = require('fs');

var plugins = [
    require('../lib/plugins/import-content'),
    require('../lib/plugins/import-markdown'),
    require('../lib/plugins/comment'),
    require('../lib/plugins/import-tag'),
    require('../lib/plugins/build-css'),
    require('../lib/plugins/build-sass'),
    require('../lib/plugins/build-js')
];

describe('Squiz Boilerplate Parser', function() {
    var tmpDir = path.resolve(__dirname, '.tmp');

    var parser = new Parser({
        plugins: plugins,
        verbose: false,

        outputTransformation: function() {
            return through.obj(function(file, enc, cb) {
                file.contents = new Buffer(file.contents.toString().replace('__VAR__', '[REPLACEMENT]'));
                cb(null, file);
            });
        }
    });

    var watchList = [];

    function parseHTMLToTemp(filePath, cb) {
        gulp.src(filePath)
            .pipe(parser.parse())
            .pipe(gulp.dest(tmpDir))
            .on('finish', cb)
            .on('error', cb);
    }

    function expectWatchList(count) {
        var newWatchlist = parser.getWatchList();
        var diff = _.difference(watchList, newWatchlist);
        expect(newWatchlist).to.be.a('array');
        expect(newWatchlist.length).to.at.least(1);
        assert.equal(diff.length, 0, 'Expected additions to the watchlist');
        watchList = newWatchlist;
    }

    before(function(done) {
        rimraf(tmpDir, done);
    });

    it('allows html content be be passed through transformations', function(done) {
        var src = helpers.getFixture('index.html');
        parseHTMLToTemp(src, function() {
            helpers.compareFiles(helpers.getTemp('index.html'), src, done);
        });
    });

    it('handles simple tag replacements', function(done) {
        var fileName = 'import_js.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('handles extra space in the directive', function(done) {
        var fileName = 'import_space.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function(err) {
            if (err) {
                throw err;
            }
            done();
        });
    });

    it('handles simple tag replacements with attributes', function(done) {
        var fileName = 'import_css.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('handles css build blocks', function(done) {
        var fileName = 'build_css.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(2);
            Promise.all([
                helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName)),
                helpers.compareFiles(helpers.getExpected('styles/main.scss'), helpers.getTemp('styles/main.scss'))
            ]).then(function() {
                done();
            });
        });
    });

    it('handles sass build blocks', function(done) {
        var fileName = 'sass.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(2);
            Promise.all([
                helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName)),
                helpers.compareFiles(helpers.getExpected('styles/main.css'), helpers.getTemp('styles/main.css'))
            ]).then(function() {
                done();
            });
        });
    });

    it('handles js build blocks', function(done) {
        var fileName = 'build_js.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('handles combinations of blocks with glob patterns', function(done) {
        var fileName = 'build_combined.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(2);
            async.series([
                helpers.compareFiles.bind(this, helpers.getExpected(fileName), helpers.getTemp(fileName)),
                helpers.compareFiles.bind(this, helpers.getExpected('styles/combined.scss'), helpers.getTemp('styles/combined.scss')),
                helpers.compareFiles.bind(this, helpers.getExpected('styles/combined_two.scss'), helpers.getTemp('styles/combined_two.scss')),
                helpers.compareFiles.bind(this, helpers.getExpected('styles/combined.css'), helpers.getTemp('styles/combined.css')),
                helpers.compareFiles.bind(this, helpers.getExpected('styles/combined_two.css'), helpers.getTemp('styles/combined_two.css'))
            ], done);
        });
    });

    it('handles sass with attributes', function(done) {
        var fileName = 'sass_attr.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            async.series([
                helpers.compareFiles.bind(this, helpers.getExpected(fileName), helpers.getTemp(fileName)),
                helpers.compareFiles.bind(this, helpers.getExpected('styles/sass_attr.css'), helpers.getTemp('styles/sass_attr.css'))
            ], done);
        });
    });

    it('can wrap partial content around build output', function(done) {
        var fileName = 'sass_wrap.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(3);
            Promise.all([
                helpers.compareFiles(helpers.getExpected('styles/sass_wrap.css'), helpers.getTemp('styles/sass_wrap.css'))
            ]).then(function() {
                done();
            });
        });
    });

    it('can import multiple nested content directives', function(done) {
        var fileName = 'import_nested.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(2);

            // The next 2 groups of tests ensure that the relations are recorded with the correct parents and patterns

            // The first nested level
            var firstNest = relations.get(helpers.getFixture('fragments/nest1.html'));
            expect(Object.keys(firstNest)).to.contain('parent');
            assert.isArray(firstNest.parent, 'First nested level is an array');
            expect(firstNest.parent[0]).to.be.equal(helpers.getFixture(fileName));
            expect(firstNest.pattern[0]).to.be.equal(' import:content test/fixtures/fragments/nest1.html ');

            // The second nested level
            var secondNest = relations.get(helpers.getFixture('fragments/nest2.html'));
            expect(Object.keys(secondNest)).to.contain('parent');
            assert.isArray(secondNest.nestings, 'Second nested level is an array');
            expect(secondNest.nestings[0]).to.be.equal(helpers.getFixture('fragments/nest1.html'));
            expect(secondNest.pattern[0]).to.be.equal(' import:content test/fixtures/fragments/nest2.html ');

            // Ensure the resulting file has the correct content from the nested levels
            helpers.compareFiles(helpers.getExpected('import_nested.html'), helpers.getTemp('import_nested.html'), done);
        });
    });

    it('watches files correctly passing down the correct parent', function(done) {
        var files = [];
        gulp.src(parser.getWatchList())
            .pipe(parser.watchHandler())
            .pipe(through.obj(function(file, enc, cb) {
                files.push(file.path);
                cb(null, file);
            }, function(next) {
                var expected = [
                    'sass.html',
                    'sass_attr.html',
                    'sass_wrap.html',
                    'import_nested.html',
                    'build_combined.html',
                    'build_css.html',
                    'build_js.html'
                ].map(helpers.getFixture);
                files = _.uniq(files);
                assert.lengthOf(files, expected.length);
                files.forEach(function(file) {
                    expect(expected).to.contain(file);
                });
                next();
            }))
            .resume()
            .on('finish', done);
    });

    it('understands relationships between build patterns and parent files', function(done) {
        var nest2 = relations.get(helpers.getFixture('fragments/nest2.html'));

        expect(nest2.pattern[0]).to.be.equal(' import:content test/fixtures/fragments/nest2.html ');
        expect(nest2.parent.length).to.be.equal(0);
        expect(nest2.nestings.length).to.be.equal(1);
        expect(nest2.nestings[0]).to.be.equal(helpers.getFixture('fragments/nest1.html'));

        gulp.src(helpers.getFixture('fragments/nest1.html'))
            .pipe(through.obj(function(file, enc, cb) {
                var relation = relations.get(file.path);
                expect(relation.pattern[0]).to.be.equal(' import:content test/fixtures/fragments/nest1.html ');
                expect(relation.parent[0]).to.be.equal(helpers.getFixture('import_nested.html'));
                // Relations testing
                cb(null, file);
            }))
            .pipe(parser.watchHandler())
            .pipe(through.obj(function(file, enc, cb) {
                expect(file.path).to.be.equal(helpers.getFixture('import_nested.html'));
                cb(null, file);
            }))
            .resume()
            .on('finish', done);
    });

    it('strips comments from tokenised HTML', function(done) {
        var fileName = 'comment.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(0);
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('can pass files destined for output through an output transformation stream', function(done) {
        var fileName = 'output_transformation.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            helpers.compareFiles(
                helpers.getExpected('styles/output_transformation.css'),
                helpers.getTemp('styles/output_transformation.css'),
                done);
        });
    });

    it('can pull in handlebars content and parse it into HTML', function(done) {
        var fileName = 'import_handlebars.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('can pull in markdown content and parse it into HTML', function(done) {
        var fileName = 'import_markdown.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            helpers.compareFiles(helpers.getExpected(fileName), helpers.getTemp(fileName), done);
        });
    });

    it('can render headers and footers on imported files', function(done) {
        var fileName = 'headers.html';
        parseHTMLToTemp(helpers.getFixture(fileName), function() {
            expectWatchList(1);
            helpers.compareFiles(helpers.getExpected('styles/headers.scss'), helpers.getTemp('styles/headers.scss'), done);
        });
    });

    it('can properly handle file system changes (e.g. gulp.watch)', function(done) {
        var fileName = 'watch.html';
        var inputFile = helpers.getTemp('styles/watch_input.scss');
        async.series([
            // Setup the first input
            helpers.copy.bind(
                this,
                helpers.getFixture('styles/watch1.scss'),
                inputFile
            ),

            // Parse the template (1st time)
            parseHTMLToTemp.bind(this, helpers.getFixture(fileName)),

            helpers.compareFiles.bind(this, helpers.getExpected(fileName),
                    helpers.getTemp(fileName)),

            helpers.compareFiles.bind(this, helpers.getExpected('styles/watch_input1.css'),
                    helpers.getTemp('styles/watch_output.scss')),

            // Copy the second input to mimick a change in file content
            helpers.copy.bind(
                this,
                helpers.getFixture('styles/watch2.scss'),
                inputFile
            ),

            // Mimick an edit and cache expiry
            function (next) {
                var list = parser.getWatchList();

                // Watchlist should have the input file
                expect(list.indexOf(inputFile)).not.to.equal(-1);

                gulp.src(list.filter(function(item) {
                        return item === inputFile;
                    }))
                    .pipe(parser.expireCache())
                    .pipe(parser.watchHandler())
                    .resume()
                    .on('finish', next);
            },

            // Parse the template (2nd time)
            parseHTMLToTemp.bind(this, helpers.getFixture(fileName)),

            // function (next) {
            //     console.log('relations', relations.get());
            //     next();
            // },

            helpers.compareFiles.bind(this, helpers.getExpected('styles/watch_input2.css'),
                    helpers.getTemp('styles/watch_output.scss')),

            helpers.compareFiles.bind(this, helpers.getExpected('styles/watch_output.css'),
                    helpers.getTemp('styles/watch_output.css'))
        ], done);
    });
});
