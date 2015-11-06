'use strict';
/**
 * Minify generated JS files (with *.min.js) and any image and SVG files located
 * in the dist directory.
 */
var gulp = require('gulp');
var config = require('../config');
var path = require('path');

gulp.task('minify-js', ['deferOptimiseTasks'], function() {
    var uglify = require('gulp-uglify');
    return gulp.src([
        path.join(config.dest, 'js/*.min.js')
    ]).pipe(uglify())
      .pipe(gulp.dest(config.dest + '/js/'));
});

// Re-write png, jpg, gif and svg in-place (destination directory)
gulp.task('imagemin', ['deferOptimiseTasks'], function() {
    var imagemin = require('gulp-imagemin');
    var pngquant = require('imagemin-pngquant');
    return gulp.src([
            path.join(config.file_dest, '/*'),
            path.join(config.dest, 'styles/'+config.file_dest+'/*')
        ], {
            base: './'
        })
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('minify', ['minify-js', 'imagemin']);
