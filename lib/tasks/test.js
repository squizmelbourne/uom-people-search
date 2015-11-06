'use strict';
/**
 * The test task invokes ESLint, HTML validation and Unit testing
 */
var gulp = require('gulp');
var config = require('../config');
var path = require('path');
var defer = require('../util/defer');

gulp.task('deferTestTasks', function(done) {
    defer([
        'gulp-eslint', 'babel-eslint', // eslint
        'gulp-htmlhint', 'git+https://github.com/ironikart/gulp-htmlcs.git', // validate
        'gulp-qunit' // Qunit
    ], done);
});


gulp.task('unit', ['deferTestTasks'], function() {
    var qunit = require('gulp-qunit');
    return gulp.src([
        path.join(config.source, 'modules/**/tests/*.html'),
        path.join(config.bower, config.module_prefix+'*/tests/*.html')
    ])
    .pipe(qunit({'phantomjs-options': ['--ssl-protocol=any']}));
});

gulp.task('test', ['eslint', 'validate', 'unit']);
