'use strict';
/**
 * Validate HTML for known issues and accessibility problems
 */
var gulp = require('gulp');
var config = require('../config');

gulp.task('w3c', ['deferTestTasks'], function() {
    var html = require('gulp-htmlhint');
    return gulp.src(config.dest + '/*.html')
        .pipe(html())
        .pipe(html.reporter())
        .resume();
});

gulp.task('htmlcs', ['deferTestTasks'], function() {
    var htmlcs = require('gulp-htmlcs');
    return gulp.src(config.dest + '/*.html')
        .pipe(htmlcs())
        .pipe(htmlcs.reporter({
            filter: ['ERROR']
        }))
        .resume();
});

gulp.task('validate', ['w3c', 'htmlcs']);
