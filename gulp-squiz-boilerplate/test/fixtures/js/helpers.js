'use strict';
var path = require('path');
module.exports = function(Handlebars) {
    Handlebars.registerHelper('reverse', function(data) {
        return data.split('').reverse().join('');
    });

    Handlebars.registerHelper('moduleName', function(data) {
        var dir = path.dirname(data).split(/\//).pop().replace(/\-\_/, ' ');
        return dir.charAt(0).toUpperCase() + dir.slice(1);
    });
};
