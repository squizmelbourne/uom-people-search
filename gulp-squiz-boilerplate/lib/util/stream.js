'use strict';
var through = require('through2');

// A simple passthrough stream that does nothing
module.exports.passthrough = function() {
    return through.obj(function(chunk, enc, cb) {
        cb(null, chunk);
    });
};

module.exports.toString = function(out) {
    var str = '';
    return through.obj(function(chunk, enc, cb) {
        str += chunk.toString();
        cb(null);
    }, function(done) {
        var output = out(str);
        this.push(new Buffer(output || str));
        done();
    });
};

module.exports.toArray = function(out) {
    var a = [];
    return through.obj(function(chunk, enc, cb) {
        a.push(chunk);
        cb(null);
    }, function(done) {
        this.push(a);
        out(a);
        done();
    });
};
