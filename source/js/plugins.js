/**
 * {{name}}
 * Plugins JS
 *
 * version: {{version}}
 * file:    {{file}}
 * author:  Squiz Australia
 * modified: {{date}}
 * @preserve
 */

/*
 * Table of Contents
 *
 * - Global
 * - Modules
{{toc}}
 */

/*
--------------------
Global
--------------------
*/

// Fallback for inadvertant console statements
if (!window.console) {
    window.console = {
        log:   function(){},
        warn:  function(){},
        error: function(){}
    };
}

/*eslint no-unused-vars: 0*/
// Source: http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}

/*
--------------------
Modules
--------------------
*/
