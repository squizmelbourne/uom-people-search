// Defer load of NPMs
'use strict';
var exec = require('child_process').execFile;
var config = require('../config');
var gutil = require('gulp-util');
var _ = require('lodash');
var chalk = require('chalk');

var depValues = _.map(config.pkg.dependencies, function(val) {
    return val;
}).filter(function(val) {
    return /^git/i.test(val);
});

module.exports = function(npms, cb) {
    // Filter the npms against those read from package.json
    npms = _.chain(npms)
        .filter(function(npm) {
            return !config.pkg.dependencies.hasOwnProperty(npm) && depValues.indexOf(npm) === -1;
        })
        .value();

    if (npms.length <= 0) {
        return cb();
    }

    gutil.log('Loading npms:', chalk.green(npms.join(', ')));

    exec('npm', ['install'].concat(npms).concat(['--save']), function(err) {
        if (err) {
            throw err;
        }
        cb();
    });
};
