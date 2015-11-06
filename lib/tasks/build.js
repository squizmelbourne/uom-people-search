'use strict';
/**
 * The build task is the main task for triggering the construction of the template
 * based on the parsing of html files in source/html/*.html. The task will run
 * after copying files and includes Handlebars parsing and triggers a browserify
 * task if the app.js task file is present.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var config = require('../config.js');
var removeDirname = require('../util/removeDirname');
var path = require('path');
var fs = require('fs');
var parser = require('../parser.js');
var watch = require('gulp-watch');
var logStream = require('../util/logStream');
var handlebars = require('gulp-compile-handlebars');
var chalk = require('chalk');

var browserifyStarted = false;
var appStat;

var src = path.join(config.source, 'html/*.html');

if (config.args.docs) {
    src = path.join(config.source, 'html/docs/*.html');
}

function doBuild(srcStream) {
    var hbs = handlebars(config, config.handlebars);

    hbs.on('error', function(err) {
        if (err) {
            process.stderr.write(chalk.red('Handlebars Error'));
            process.stderr.write(chalk.red(err.message));
        }
        if (config.verbose) {
            process.stderr.write(chalk.red(err.stack));
        }
        console.log('\n\n\tIt is likely that the file contains information that Handlebars cannot parse.\n');
        console.log('\tUse --verbose to view error stack and more context regarding file parse status.\n');
        hbs.end();
    });

    srcStream = srcStream
        .pipe(parser.parse())
        .pipe(hbs)
        .pipe(removeDirname())
        .pipe(gulp.dest(config.dest));

    if (global.isWatching && global.sync) {

        srcStream.on('data', global.sync.reload);

        // Report on file cache size
        if (config.verbose) {
            var cfs = require('cacheable-fs');
            srcStream.on('data', function() {
                gutil.log(chalk.yellow('Cached files:'), cfs.stats().size);
            });
        }
    }

    if (!appStat) {
        try {
            appStat = fs.statSync(path.resolve(__dirname, './app.js'));
        } catch(e) {
            // Do nothing
        }
    }

    if (appStat && appStat.isFile() && !browserifyStarted) {
        gulp.start('browserify');
        browserifyStarted = true;
    }

    return srcStream;
}

gulp.task('build', ['copy'], function() {
    if (global.isWatching) {
        // Watch the same source files and rebuild on change
        doBuild(watch(src).pipe(parser.expireCache()))
            .pipe(logStream('File reloaded:'));
    }
    // Do a build
    return doBuild(gulp.src(src));
});
