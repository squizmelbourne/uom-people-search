'use strict';
/**
 * The beautify task aims to solve the issue of imported content appearing with
 * incorrect indentation. It is a smaller part of the 'optimise' path to help
 * prep the content for inclusion in a production system.
 */
var gulp = require('gulp');
var path = require('path');
var config = require('../config');

gulp.task('beautify', ['deferOptimiseTasks'], function() {
    var prettify = require('gulp-prettify');
    gulp.src(path.join(config.dest, '*.html'))
    /*eslint camelcase: 0*/
    .pipe(prettify({
        indent_size: 4
    }))
    .pipe(gulp.dest(config.dest));
});
