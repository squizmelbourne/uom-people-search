'use strict';
var Promise = require('bluebird');
var expect = require('chai').expect;
var through = require('through2');
var path = require('path');
var fs = require('fs');

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);

// Helpers
module.exports.compareFiles = function(a, b, cb) {
    return Promise.all([
        readFile(a),
        readFile(b)
    ]).then(function(results) {
        var fileA = results[0].toString();
        var fileB = results[1].toString();
        expect(fileA).not.to.be.equal('');
        expect(fileB).not.to.be.equal('');
        expect(fileB).to.equal(fileA);
        if (cb) {
            cb();
        }
    });
};

module.exports.copy = function(src, dest, cb) {
    readFile(src).then(function(buf) {
        var content = buf.toString();
        expect(content).not.to.be.equal('');
        writeFile(dest, content, {encoding: 'utf8'}).then(cb);
    });
};

module.exports.log = function() {
    return through.obj(function(obj, enc, cb) {
        console.log('log: ', obj);
        cb(null, obj);
    });
};

module.exports.logVinylFile = function(msg) {
    return through.obj(function(file, enc, cb) {
        console.log(msg, file.path);
        cb(null, file);
    });
};

module.exports.getFixture = function(filePath) {
    return path.join(__dirname, 'fixtures', filePath);
};

module.exports.getExpected = function(filePath) {
    return path.join(__dirname, 'expected', filePath);
};

module.exports.getTemp = function(filePath) {
    return path.resolve(__dirname, '.tmp', filePath);
};
