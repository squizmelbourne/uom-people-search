'use strict';
/**
 * Configuration data shared across multiple tasks
 */
var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var through = require('through2');
var merge = require('lodash.defaults');
var args = minimist(process.argv.slice(2));
var Handlebars = require('handlebars');
var cwd = process.cwd();
var gutil = require('gulp-util');
var _ = require('lodash');

// Use user defined helpers in output transformations
var helpers = require(path.resolve(__dirname, '../source/js/helpers.js'));
helpers(Handlebars);

function readJSON(file) {
    return JSON.parse(fs.readFileSync(path.join(cwd, file)), {encoding: 'utf8'});
}

var boilerplate = readJSON('config.json');
var bower = readJSON('.bowerrc').directory;
var pkg = readJSON('package.json');

// Custom relative dest directory
if (args.hasOwnProperty('dest')) {
    boilerplate.dest = args.dest;
}

if (args.docs) {
    boilerplate.dest = 'docs';
}

var config = {
    // Template config
    date:  new Date(),
    bower: bower,
    pkg:   pkg,

    // Arguments passed via command line
    args: args,

    // Prefixes for magic-paths
    prefixes: {
        source: path.join(cwd, boilerplate.source) + '/',
        bower:  path.join(cwd, bower) + '/',
        module: [
            path.join(cwd, bower, boilerplate.module_prefix),
            path.join(cwd, boilerplate.source, 'modules') + '/'
        ],
        dist: path.join(cwd, boilerplate.dest) + '/',
        dest: path.join(cwd, boilerplate.dest) + '/',
        tmp:  path.join(cwd, boilerplate.tmp) + '/'
    },

    // Sass specific config
    sass: {
        includePaths: [
            cwd,
            path.join(cwd, 'source/styles/imports/'),
            path.join(cwd, bower)
        ],
        outputStyle: 'expanded'
    },

    verbose: args.verbose || false,

    // Handlebars.compile options http://handlebarsjs.com/reference.html
    handlbars: {}
};

// Build a table of contents from module names that appear in files
function buildToc(content) {
    var regExp = /\/\* Module: ([^\*]+) \*\//gim;
    var match;
    var toc = [];
    while ((match = regExp.exec(content)) !== null) {
        toc.push(match[1]);
    }

    toc = _.uniq(toc);

    return toc.join('\n    ');
}

// Transformation for generated build directives
config.outputTransformation = function() {
    return through.obj(function(file, enc, cb) {

        // Do not pass through files that are prefixed _generated_
        if (/^_generated_/.test(file.path)) {
            return cb(null);
        }

        // Run handlebars across generated .js and .css files
        if (/\.(css|js)$/.test(file.path)) {
            var content = file.contents.toString();
            var basename = path.basename(file.path);
            var template = Handlebars.compile(content, config.handlebars);

            var toc = buildToc(content);

            file.contents = new Buffer(template(
                merge({
                    file: basename,
                    toc:  toc
                }, config, config.pkg)
            ));
            gutil.log('Handlebars compile', basename);
        }
        cb(null, file);
    });
};

// Boilerplate config comes in as-is for easier template replacements
config = merge(config, boilerplate);

// Transformation Plugins
config.plugins = [
    require('gulp-squiz-boilerplate/lib/plugins/import-content'),
    require('gulp-squiz-boilerplate/lib/plugins/import-markdown'),
    require('gulp-squiz-boilerplate/lib/plugins/comment'),
    require('gulp-squiz-boilerplate/lib/plugins/import-tag'),
    require('gulp-squiz-boilerplate/lib/plugins/build-css'),
    require('gulp-squiz-boilerplate/lib/plugins/build-sass'),
    require('gulp-squiz-boilerplate/lib/plugins/build-js')
];

module.exports = config;
