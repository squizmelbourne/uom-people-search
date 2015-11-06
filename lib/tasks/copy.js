'use strict';
/**
 * Copies (changed) files (mostly fonts and images) from selected
 * locations in the source directory to the dist directory.
 */
var gulp = require('gulp');
var path = require('path');
var changed = require('gulp-changed');
var config = require('../config.js');
var removeDirname = require('../util/removeDirname');
var log = require('../util/logStream');
var watch = require('gulp-watch');

var cwd = process.cwd();
var fileDest = path.join(cwd, config.dest, config.file_dest);

var src = {
    files: [
        path.join(cwd, config.source, 'files/*.*'),
        path.join(cwd, config.bower, config.module_prefix + '*/files/*.*'),
        path.join(cwd, config.source, 'modules/**/files/*.*')
    ],
    fonts: [
        path.join(cwd, config.bower, 'bootstrap-sass/assets/fonts/bootstrap/*.*'),
        path.join(cwd, config.bower, 'font-awesome/fonts/*.*')
    ],
    cssFiles: [
        path.join(cwd, config.source, 'styles/files/*.*'),
        path.join(cwd, config.bower, config.module_prefix + '*/css/files/*.*'),
        path.join(cwd, config.bower, config.source + 'modules/**/css/files/*.*')
    ]
};

var types = Object.keys(src);

var dest = {
    files:    fileDest,
    fonts:    path.join(cwd, config.dest, 'styles', config.file_dest),
    cssFiles: path.join(cwd, config.dest, 'styles', config.file_dest)
};

function doFileCopy(srcStream, destDir) {
    return srcStream
        .pipe(removeDirname())
        .pipe(changed(destDir))
        .pipe(gulp.dest(destDir));
}

function createWatchableTask(name, taskSrc, taskDest) {
    gulp.task(name, function() {
        if (global.isWatching) {
            doFileCopy(watch(taskSrc), taskDest)
                .pipe(log('Watched file changed:'))
                .on('data', global.sync.reload);
        }
        return doFileCopy(gulp.src(taskSrc), taskDest);
    });
}

types.forEach(function(type) {
    createWatchableTask('copy-' + type, src[type], dest[type]);
});

gulp.task('copy', types.map(function(type) {
    return 'copy-' + type;
}));
