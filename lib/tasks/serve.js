'use strict';
/**
 * Serve out the dist directory with a local webserver (Browser Sync uses Express JS)
 * Optionally supress opening a browser window with --open=false
 */
var gulp = require('gulp');
var config = require('../config.js');

gulp.task('serve', ['setWatch', 'build'], function() {
    global.sync.init({
        open:   config.args.open !== 'false',
        server: {
            baseDir: config.dest
        },

        // Inject the snippet at the bottom body tag. If it's left at default it will find the first
        // regex body tag which is generally an IE conditional and the resulting injected JS will not
        // load properly unless that IE conditional matches
        snippetOptions: {
            rule: {
                match: /<\/body>/i,

                fn: function (snippet, match) {
                    return snippet + match;
                }
            }
        }
    });
    gulp.start('watchDependencies');
});
