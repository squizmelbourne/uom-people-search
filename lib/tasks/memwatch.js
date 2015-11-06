'use strict';
/**
 * Memory watching and reporting
 */
var memwatch = require('memwatch-next');
var gutil = require('gulp-util');
var chalk = require('chalk');
var lastMem;

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Byte';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// If verbose watching report on memory usage
memwatch.on('stats', function(stats) {
    var mem = bytesToSize(stats.current_base);
    if (mem !== lastMem) {
        gutil.log(chalk.yellow('Memory Usage:'), mem);
        lastMem = mem;
    }
});

memwatch.on('leak', function(info) {
    gutil.error('Potential memory leak: '+info.reason);
});
