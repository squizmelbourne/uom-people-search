'use strict';
/**
 * Run ESLint on source JS files
 */
var gulp = require('gulp');
var config = require('../config');
var path = require('path');

gulp.task('eslint', ['deferTestTasks'], function() {
    var eslint = require('gulp-eslint');
    return gulp.src([
        'gulpfile.js',
        path.join(config.source, 'js/*.js'),
        path.join(config.source, 'modules/**/js/*.js'),
        path.join(config.bower, config.module_prefix+'*/js/*.js'),
        '!**/plugin.js',
        '!**/*.min.js'
    ]).pipe(eslint())
      .pipe(eslint.format());
});
