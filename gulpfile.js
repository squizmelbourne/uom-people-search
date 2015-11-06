'use strict';
var gulp = require('gulp');
var requireDir = require('require-dir');

requireDir('./lib/tasks', {
    recurse: true
});

gulp.task('default', ['build']);
