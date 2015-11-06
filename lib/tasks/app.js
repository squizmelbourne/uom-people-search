'use strict';
var gulp = require('gulp');
var path = require('path');
var config = require('../config.js');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var src = path.join(config.source, 'js/app.js');
var defer = require('../util/defer');
var b;

var watchified = false;

function doBundle() {
    var watchify = require('watchify');
    var source = require('vinyl-source-stream');
    var buffer = require('vinyl-buffer');
    var bundle = b;

    if (global.isWatching && !watchified) {
        bundle = watchify(b);
        watchified = true;
    }

    gutil.log((global.isWatching ? 'Watchify' : 'Browserify') + ' building entry file:', path.basename(src));
    return bundle.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(config.dest, 'js')))
        .on('finish', function() {
            if (global.isWatching && global.sync) {
                global.sync.reload();
            }
        });
}

gulp.task('deferAppTasks', function(done) {
    defer(['vinyl-buffer', 'vinyl-source-stream', 'browserify',
           'watchify', 'reactify', 'uglifyify'], function() {
        var browserify = require('browserify');
        b = browserify({
            entries:      [src],
            cache:        {},
            packageCache: {},
            debug:        true
        });

        b.transform({
          global: true
        }, 'reactify');

        b.transform({
          global: true
        }, 'uglifyify');

        b.on('update', doBundle);
        b.on('log', gutil.log.bind(gutil, 'Browserify'));

        done();
    });
});

gulp.task('browserify', ['deferAppTasks'], doBundle);
