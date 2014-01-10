**buddy-dependencies** is an add-on for [Buddy](https://github.com/popeindustries/buddy) to provide simple dependency management, supplementing the features provided by NPM.

## Features

- Copies __packages__ from GitHub to your project
- Copies packages listed in the [Bower](https://github.com/twitter/bower) registry to your project
- Copies __assets__ from a local destination to your project
- Optionally __bundles__ files into a single, concatenated/compressed file

## Installation

Add `buddy-dependencies` alongside `buddy` in your *package.json* file:

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.0.0",
    "buddy-dependencies": "0.2.x"
  }
}
```
```bash
$ cd path/to/project
$ npm install
```

## Usage

The `install` command is run via **buddy(1)**, and will download/copy all resources defined in *package.json/buddy.js/buddy.json*:

```bash
$ buddy install
```

### Examples

Copy project boilerplate from a local directory into the project root:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.0.0",
    "buddy-dependencies": "0.2.x"
  },
  "buddy": {
    "dependencies": {
      ".": {
        "sources": ["../../boilerplate/project"]
      }
    }
  }
```
```bash
$ buddy install
```

Download js dependencies `browser-require` and `jQuery` version 1.9.1, then concatenate and compress to `www/libs.js` for inclusion in html:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.0.0",
    "buddy-dependencies": "0.2.x"
  },
  "buddy": {
    "dependencies": {
      "libs/vendor": {
        "sources": [
          "popeindustries/browser-require",
          "jquery@1.9.1"
        ],
        "output": "www/libs.js"
      }
    }
  }
```
```bash
$ buddy install
```

Do the same as above but skip storing files in `libs/vendor`:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.0.0",
    "buddy-dependencies": "0.2.x"
  },
  "buddy": {
    "dependencies": {
      "www/libs.js": {
        "sources": [
          "popeindustries/browser-require",
          "jquery@1.9.1"
        ]
      }
    }
  }
```
```bash
$ buddy install
```

Download `visionmedia/nib` Stylus sources, specifying a specific directory to be referenced in your builds:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.0.0",
    "buddy-dependencies": "0.2.x"
  },
  "buddy": {
    "dependencies": {
      "libs/src/css": {
        "sources": [
          "visionmedia/nib#lib/nib"
        ]
      }
    }
  }
}
```
```bash
$ buddy install
```

## Concepts

Dependency resources are installed from local locations or remotely from Github.

**Sources**: An array of local or remote resource locations.

- **destination**: each group of sources will be installed to the project relative location specified. Alternatively, specify a file path to skip storage and directly concatenate/compress the sources.

- **identifier**: github `username/repo` identifiers are preferred, but it is also possible to use identifiers from the [bower](https://github.com/twitter/bower) package manager: `'jquery', 'backbone', 'underscore'`, etc.

- **versioning**: github sources can specify a version by appending `@` and a npm-style symantic version: `'*', '1.2.3', '1.x', '~1.2.0', '>=1.2.3'`

- **resources**: specific resources can be specified by appending `#` and a list of `|` separated relative file or directory locations: `'username/repo#a/file/or/directory|another/file/or/directory'`

**Output**: A file destination to concatenate and compress the source contents. The order of *sources* determines the content order.

(The MIT License)

Copyright (c) 2011-2014 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.