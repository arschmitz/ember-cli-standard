/* eslint-env node */
const unlink = require('fs').unlink
const resolve = require('path').resolve
const exec = require('child_process').exec
const RSVP = require('rsvp')
const walkSync = require('walk-sync')

/**
 * For each item in the array, call the callback, passing the item as the argument.
 * However, only call the next callback after the promise returned by the previous
 * one has resolved.
 *
 * @param {*[]} items the elements to iterate over
 * @param {Function} cb called for each item, with the item as the parameter. Should return a promise
 * @return {Promise}
 */
function synchronize (items, cb) {
  return items.reduce(function (promise, item) {
    return promise.then(function () {
      return cb.call(this, item)
    })
  }, RSVP.resolve())
}

module.exports = {
  name: 'ember-cli-standard',

  normalizeEntityName: function () {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  afterInstall: function () {
    var removeConfig = this._removeConfig.bind(this)
    const standardFormat = this._standardFormat.bind(this)

    if (!this.removePackageFromProject) {
      return
    }

    return this.removePackageFromProject('ember-cli-eslint')
      .then(_ => this.removePackageFromProject('ember-cli-jshint'))
      .then(removeConfig)
      .then(standardFormat)
      .catch((error) => console.log(error))
  },

  /**
   * Find JSHint and ESLint configuration files and offer to remove them
   *
   * @return {RSVP.Promise}
   */
  _removeConfig: function () {
    var promptRemove = this._promptRemove.bind(this)
    var removeFile = this._removeFile.bind(this)
    var ui = this.ui

    return this._findConfigFiles()
      .then(function (files) {
        if (files.length === 0) {
          ui.writeLine('No JSHint or ESLint config files found.')
          return RSVP.resolve({
            result: {
              deleteFiles: 'none'
            }
          })
        }

        ui.writeLine('\nI found the following JSHint and ESLint config files:')
        files.forEach(function (file) {
          ui.writeLine('  ' + file)
        })

        var promptPromise = ui.prompt({
          type: 'list',
          name: 'deleteFiles',
          message: 'What would you like to do?',
          choices: [
            { name: 'Remove them all', value: 'all' },
            { name: 'Remove individually', value: 'each' },
            { name: 'Nothing', value: 'none' }
          ]
        })

        return RSVP.hash({
          result: promptPromise,
          files: files
        })
      }).then(function (data) {
        var value = data.result.deleteFiles
        var files = data.files

        // Noop if we're not deleting any files
        if (value === 'none') {
          return RSVP.resolve()
        }

        if (value === 'all') {
          return RSVP.all(files.map(function (fileName) {
            return removeFile(fileName)
          }))
        }

        if (value === 'each') {
          return synchronize(files, function (fileName) {
            return promptRemove(fileName)
          })
        }
      })
  },

  _standardFormat () {
    return this.ui.prompt({
      type: 'list',
      name: 'formatFiles',
      message: 'Would you like to run standard format to upate current code to standard?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'Not now', value: false }
      ]
    }).then((format) => {
      return new Promise((resolve, reject) => {
        if (format) {
          this.ui.writeLine(`formatting...`)
          exec('standard --fix', {}, (error, stdout, stderr) => {
            if (error) {
              this.ui.writeLine('Remaining issues we couldnt fix for you...', 'ERROR')
            }
            this.ui.writeLine(stdout)
            this.ui.writeLine(stderr, 'ERROR')
            resolve()
          })
        }
      })
    })
  },

  /**
   * Find JSHint and ESLint configuration files
   *
   * @return {Promise->string[]} found file names
   */
  _findConfigFiles: function () {
    var projectRoot = this.project.root
    var ui = this.ui

    ui.startProgress('Searching for JSHint and ESLint config files')
    return new RSVP.Promise(function (resolve) {
      var files = walkSync(projectRoot, {
        globs: ['**/.jshintrc', '**/.eslintrc.js'],
        ignore: [
          '**/bower_components',
          '**/dist',
          '**/node_modules',
          '**/tmp'
        ]
      })

      ui.stopProgress()
      resolve(files)
    })
  },

  /**
   * Prompt the user about whether or not they want to remove the given file
   *
   * @param {string} filePath the path to the file
   * @return {RSVP.Promise}
   */
  _promptRemove: function (filePath) {
    var removeFile = this._removeFile.bind(this)
    var message = 'Should I remove `' + filePath + '`?'

    var promptPromise = this.ui.prompt({
      type: 'confirm',
      name: 'answer',
      message: message,
      choices: [
        { key: 'y', name: 'Yes, remove it', value: 'yes' },
        { key: 'n', name: 'No, leave it there', value: 'no' }
      ]
    })

    return promptPromise.then(function (response) {
      if (response.answer) {
        return removeFile(filePath)
      } else {
        return RSVP.resolve()
      }
    })
  },

  /**
   * Remove the specified file
   *
   * @param {string} filePath the relative path (from the project root) to remove
   * @return {RSVP.Promise}
   */
  _removeFile: function (filePath) {
    var projectRoot = this.project.root
    var fullPath = resolve(projectRoot, filePath)

    return RSVP.denodeify(unlink)(fullPath)
  }
}
