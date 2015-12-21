'use strict';
var build = require('../util/build');

module.exports = function(opts, parentPath) {
    return build({
        // Build plugin options
        parentPath: parentPath,
        prefixes:   opts.prefixes,
        tagname:    'script',
        attrname:   'src',

        // Pass output transformations
        outputTransformation: opts.outputTransformation,

        // Transform options
        start:   /^\s*build:js\s+([^\s]+)\s+(.*)/,
        end:     /^\s*endbuild\s*$/,
        cache:   true,
        isBlock: true,

        // Return token handler
        fetchToken: function (options) {
            return [{
                type: 'open',
                name: 'script',
                attr: {
                    src: options.relPath
                },
                fullPath: options.dest,
                pattern:  options.matches[0]
            }, {
                type: 'close',
                name: 'script'
            }];
        }
    });
};
