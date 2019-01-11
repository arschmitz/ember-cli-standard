'use strict'
const standard = require('broccoli-standard')
const jsStringEscape = require('js-string-escape')

function render (errors) {
  return errors.map(function (error) {
    return error.line + ':' + error.column + ' ' +
      ' - ' + error.message + ' (' + error.ruleId + ')'
  }).join('\n')
}

module.exports = {
  name: 'ember-cli-standard',

  // TODO: Disable this (or set it to return false) before committing
  isDevelopingAddon: function () {
    return false
  },

  // instructs ember-cli-qunit and ember-cli-mocha to
  // disable their lintTree implementations (which use JSHint)
  isDefaultJSLinter: true,

  included: function (app) {
    this._super.included.apply(this, arguments)
    this.options = app.options.standard || {}
  },

  lintTree: function (type, tree) {
    let project = this.project
    let ui = this.ui

    if (type === 'templates') {
      return undefined
    }

    return standard(tree, Object.assign({}, this.options, {
      testGenerator: (relativePath, errors, results) => {
        if (!project.generateTestFile) {
          return ''
        }
        var passed, messages
        if (results) {
          passed = !results.errorCount || results.errorCount.length === 0

          messages = ''
          if (results.messages) {
            messages = jsStringEscape('\n' + render(results.messages))
          }
        }
        return project.generateTestFile('Standard - ' + relativePath, [{
          name: 'should pass Standard',
          passed: passed,
          errorMessage: relativePath + ' should pass standard.' + messages
        }])
      },
      console: {
        log (message) {
          ui.writeLine(message)
        },
        error (message) {
          ui.writeLine(message, 'ERROR')
        }
      },
      ignore (path) {
        return /^modules\//.test(path)
      }
    }))
  }
}
