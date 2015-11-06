'use strict';
/**
 * Handlebars helpers used to inject things like HTML comments for modules
 */

module.exports = function(Handlebars) {

    // Add a module comment using the file path of the module
    Handlebars.registerHelper('moduleComment', function(data) {
        var matches = data.match(/(squiz\-)?module\-?\/?([^\/]+)/);
        if (matches) {
            var moduleName = matches[2].replace(/(\-+)/g, ' ');
            return '/* Module: ' + moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + ' */\n';
        } else {
            return '';
        }
    });
};
