# Gulp Squiz Boilerplate

Processes directives supplied in HTML files (gulp stream) as tokens using [html-tokeniser](https://github.com/ironikart/html-tokeniser). Uses a plugin system (tokeniser.transform()) to manipulate tokens and generate modified output.

## Usage

The gulp squiz boilerplate works by pushing HTML content through the plugin. If you try to pipe through non HTML or invalid files you may encounter errors thrown by [htmlparser2](https://github.com/fb55/htmlparser2)

```javascript
var gulp = require('gulp');
var Parser = require('gulp-squiz-boilerplate');

var parser = new Parser({
    plugins: [
        require('plugin1'),
        require('plugin2')
    ],
});

gulp.task('build', function() {
    // Base build task
    return gulp.src('source/html/*.html')
        .pipe(parser.parse())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], function() {
    // Watch and rebuild on watchlist dependency changes
    // Note: requires plugins to notify dependent file relationships via
    // ./util/relations.js
    watch(parser.getWatchList())
       .pipe(parser.expireCache())
       .pipe(parser.watchHandler())
       .pipe(parser.parse())
       .pipe(gulp.dest('dist'));

    // Watch and rebuild on base HTML changes
    watch('source/html/*.html')
        .pipe(parser.expireCache())
        .pipe(parser.parse())
        .pipe(gulp.dest('dist'));
});
```
## Plugins

The boilerplate parser has 7 plugins available by default that transform the HTML in different ways. The `build` plugins share common functionality that transform not only the token itself, but all tokens found between a start and end block.

### Build CSS

Example source:
```html
<!-- build:css output/styles/main.scss { "media": "(min-width: 60em)" } -->
    <!-- import:css input/styles/main.scss -->
    <!-- import:css input/styles/concat.css -->
<!-- endbuild -->
```

### Build JS

Example source:
```html
<!-- build:js output/js/main.js -->
    <script src="input/js/test.js"></script>
<!-- endbuild -->
```

The above example will output a file called `main.js` in the path `output/js`. The transformation plugin will leave the following HTML in place of the build directives:
```html
<script src="output/js/main.js"></script>
```

### Build Sass

Example source:
```html
<!-- build:sass output/styles/main.css { "sourcemaps": true } -->
    <link rel="stylesheet" href="input/styles/main.scss" />
<!-- endbuild -->
```

### Comment

Example source:
```html
<!--@@ This is an internal comment and will be stripped out @@-->

<!--@@ This
is a 
multiline comment
that will be stripped out
@@-->
```

### Import Content

The content import plugin is a special one amongst the other import style directives. When a `.html` file extension is detected the parser will recursively parse any subsequent HTML files with the HTML tokeniser and apply the plugins. This allows for complex nesting arrangements between directives.

This plugin also parses Handlebars templates when called with `import:handlebars` instead of `import:content`

Example source:
```html
<!-- import:content path/to/other.html -->
```

Example handlebars:
```html
<!-- import:handlebars templates/template.hbs {"data": "data.json", "helpers": "helpers.js"} -->
```

**Note:** If the plugin does not detect HTML or Handlebars content it will not turn the resulting content into Tokenised HTML. This means that any plugins downstream will see the resulting content as a single 'text' token even if it is returning HTML. The reason for this is to cover use cases where you might want to import the content of another text file (e.g. *.txt or *.svg into the HTML but have it otherwise unmodified).

It is recommended that this plugin always be invoked first so that nested content can be brought in and passed to all other downstream plugins.

### Import Markdown

Turns markdown content into tokenised HTML and passes it to downstream plugins

Example source:
```html
<!-- import:markdown test/fixtures/README.md -->
````

### Import Tag

The import tag plugin currently covers 2 flavours, JS and CSS. This produces respective `<script>` and `<link>` tokens to be handled by downstream plugins.

Example source:
```html
<!-- import:css input/styles/main.css -->
<!-- import:js input/js/main.js -->
```

If the directive is called with `header` or `footer` options it is possible to wrap all matching files in a glob pattern with dynamic header and footer content to downstream `build` directives, e.g:
```html
<!-- build:css output/styles/headers.scss -->
    <!-- import:css input/styles/*.scss {"header": "/*Module Header {{moduleName path}}*/\n", "footer": "\n/*Module Footer {{moduleName path}}*/", "helpers": "input/js/helpers.js"} -->
<!-- endbuild -->
```

## Options

`plugins` - `Array` - An array of functions that return transform streams of html-tokeniser tokens

## Methods

### parse()

Main gulp plugin for transforming HTML content via plugins

### getWatchList()

Gets an array of files to watch as reported by previous parse() runs

### expireCache()

Expire any vinyl files from internal caching as they pass through the stream

### watchHandler()

Handle the watchList files expiring individual caches and emits vinyl file objects that represent 'parent' files that passed through the parse() method.