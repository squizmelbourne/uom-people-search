'use strict';
/**
 * Simply deletes the dist directory
 */
var gulp = require('gulp');
var config = require('../config.js');
var del = require('del');

gulp.task('clean', function (cb) {
    del([config.dest], cb);
});
