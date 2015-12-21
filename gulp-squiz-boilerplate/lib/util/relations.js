'use strict';
var _ = require('lodash');
var path = require('path');

//@todo - document and refine

var parents = {};
var files = {};
var reset = false;
var relations = {};
var nestings = {};
var patterns = {};

// Create relation lookups for parents and file patterns (tokeniser.transform() plugins)
function createLookups() {
    relations = {};
    _.each(files, function(matches, key) {
        matches.forEach(function(file) {
            file = path.normalize(file);
            // Create the relation if it doesn't exist
            if (!relations.hasOwnProperty(file)) {
                relations[file] = {
                    pattern:  [],
                    parent:   [],
                    nestings: []
                };
            }
            // Gather up any nested parents
            if (nestings.hasOwnProperty(key)) {
                relations[file].nestings = _.uniq(relations[file].parent.concat(nestings[key]));
            }
            // Gather up any actual root parent paths
            if (parents.hasOwnProperty(key)) {
                relations[file].parent = _.uniq(relations[file].parent.concat(parents[key]));
            }

            // Filter down all the uniq paths
            relations[file].pattern = _.uniq(relations[file].pattern.concat(key));
        });
    });
    reset = false;
}

// Push a pattern with a matching file to internal storage
module.exports.pushFile = function(pattern, file) {
    reset = true;
    if (!files.hasOwnProperty(pattern)) {
        files[pattern] = [];
    }
    files[pattern].push(file);
};

module.exports.pushChildPatterns = function(parent, child) {
    if (!patterns.hasOwnProperty(parent)) {
        patterns[parent] = [];
    }
    if (Array.isArray(child)) {
        patterns[parent] = patterns[parent].concat(child);
    } else {
        patterns[parent].push(child);
    }
};

module.exports.getChildPatterns = function(parent) {
    return patterns[parent] || [];
};

module.exports.getParentPatterns = function(child) {
    return Object.keys(patterns).filter(function(parent) {
        return patterns[parent].indexOf(child) !== -1;
    });
};

// Push a pattern with a matching parent (root) path
module.exports.pushParent = function(pattern, parentPath, nested) {
    reset = true;
    if (!nested) {
        if (!parents.hasOwnProperty(pattern)) {
            parents[pattern] = [];
        }
        parents[pattern].push(path.normalize(parentPath));
    } else {
        if (!nestings.hasOwnProperty(pattern)) {
            nestings[pattern] = [];
        }
        nestings[pattern].push(path.normalize(parentPath));
    }
};

// Get a relation by key (file path), or all relations with no arguments
module.exports.get = function(key) {
    if (reset) {
        createLookups();
    }
    if (key) {
        return relations.hasOwnProperty(key) ? relations[key] : null;
    }
    return relations;
};

// Delete a relation
module.exports.del = function(key) {
    delete relations[key];
};
