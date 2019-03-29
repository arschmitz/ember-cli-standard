
ember-cli-standard
==============================================================================

[![Latest NPM release][npm-badge]][npm-badge-url]
[![TravisCI Build Status][travis-badge]][travis-badge-url]
[![Ember Observer Score][ember-observer-badge]][ember-observer-badge-url]

[npm-badge]: https://img.shields.io/npm/v/ember-cli-standard.svg
[npm-badge-url]: https://www.npmjs.com/package/ember-cli-standard
[travis-badge]: https://img.shields.io/travis/arschmitz/ember-cli-standard/master.svg
[travis-badge-url]: https://travis-ci.org/arschmitz/ember-cli-standard
[ember-observer-badge]: https://emberobserver.com/badges/ember-cli-standard.svg
[ember-observer-badge-url]: https://emberobserver.com/addons/ember-cli-standard

[Standard](https://github.com/feross/standard) for [Ember CLI](https://ember-cli.com/) apps and addons
This plugin is heavily inspired by and based on ember-cli-eslint [ember-cli/ember-cli-eslint](https://github.com/ember-cli/ember-cli-eslint).

Installation
------------------------------------------------------------------------------

Standard:

```
ember install ember-cli-standard
```

### Disabling JSHint

Congratulations! You've made the leap into the next generation of JavaScript
Standardization. At the moment, however, `ember-cli` defaults to generating
applications and addons with a `jshint` configuration.

<details>
  <summary>
    If you notice the two awkwardly running side by side, click here!
  </summary>

#### ember-cli >= 2.5.0

As of `ember-cli v.2.5.0`,
[`jshint` is provided through its own `ember-cli-jshint` addon](https://github.com/ember-cli/ember-cli/pull/5757).
Running `npm uninstall --save-dev ember-cli-jshint`, in addition to removing
any `.jshintrc` files from your project should guarantee that its behavior
is disabled.

#### ember-cli < 2.5.0

Controlling linting is a bit trickier on versions of `ember-cli` prior to
`2.5.0`. Within your `ember-cli-build.js` file, `ember-cli-qunit` or
`ember-cli-mocha` can be configured to have their default linting process
disabled during:

```javascript
module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-qunit': {
      useLintTree: false
    }
  });
};
```

or

```javascript
module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-mocha': {
      useLintTree: false
    }
  });
};
```

Alongside this setting, the `hinting` property can then be used to
enable/disable globally:

```javascript
const isTesting = process.env.EMBER_ENV === 'test';

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    hinting: !isTesting,
  });
};
```

</details>


Usage
------------------------------------------------------------------------------

Standard will be run by `ember-cli-qunit` or `ember-cli-mocha` automatically
when you run `ember test`.  If Standard is *not* being run automatically, try
updating your `ember-cli` and/or `ember-cli-qunit`/`ember-cli-mocha`
dependencies.


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
