'use strict';
var rename = require('gulp-rename');

module.exports = function() {
    return rename(function(p) {
        p.dirname = '';
    });
};
