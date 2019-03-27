const expect = require('chai').expect
const fs = require('fs-extra')
const path = require('path')
const exec = require('child_process').exec
const spawn = require('child_process').spawn
let generated = false
let count = 0
function getDirectories (srcpath) {
  return fs.readdirSync(srcpath).filter((file) => {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
  })
}
const blueprint = function (cmd) {
  let proms = []
  blueprints.forEach((name, i) => {
    if (/standard/.test(name) || (/test/.test(name) && !/acceptance/.test(name))) {
      return
    }
    proms.push(new Promise((resolve, reject) => {
      const command = cmd === 'g' ? 'Generating' : 'Destroying'
      let output = spawn('ember', [cmd, name, `test-thing${i}`])

      output.on('exit', function (code) {
        resolve()
      })
    }))
  })

  return Promise.all(proms).catch((e) => {
    console.log(e)
  })
}
const lint = function (type) {
  return new Promise((resolve, reject) => {
    exec(`standard ./${type}/**/*.js`, { cwd: __dirname + '/..' }, (error, stdout, stderr) => {
      resolve({error, stdout, stderr})
    })
  })
}

const blueprints = getDirectories('blueprints')

const FAILING_FILE = path.join(__dirname, '/../tests/dummy/app/unused.js')

describe('ember-cli-Standard', function () {
  this.timeout(600000)

  afterEach(() => {
    fs.removeSync(FAILING_FILE)
  })

  it('passes if Standard tests pass', () => {
    return emberTest().then((result) => {
      expect(result.error).to.not.exist
      expect(result.stdout)
        .to.match(/ok 1 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - app\.js: should pass Standard/)
        .to.match(/ok 2 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - controllers\/thing\.js: should pass Standard/)
        .to.match(/ok 3 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/destroy-app\.js: should pass Standard/)
        .to.match(/ok 4 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/module-for-acceptance\.js: should pass Standard/)
        .to.match(/ok 5 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/resolver\.js: should pass Standard/)
        .to.match(/ok 6 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/start-app\.js: should pass Standard/)
        .to.match(/ok 7 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - models\/thing\.js: should pass Standard/)
        .to.match(/ok 8 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - resolver\.js: should pass Standard/)
        .to.match(/ok 9 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - router\.js: should pass Standard/)
        .to.match(/ok 11 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - test-helper\.js: should pass Standard/)
        .to.not.match(/not ok 12 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - unused\.js: should pass Standard/)
    })
  })

  it('fails if a Standard tests fails', () => {
    fs.outputFileSync(FAILING_FILE, 'let unused = 6;\n')

    return emberTest().then((result) => {
      expect(result.stdout)
        .to.match(/ok 1 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - app\.js: should pass Standard/)
        .to.match(/ok 2 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - controllers\/thing\.js: should pass Standard/)
        .to.match(/ok 3 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/destroy-app\.js: should pass Standard/)
        .to.match(/ok 4 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/module-for-acceptance\.js: should pass Standard/)
        .to.match(/ok 5 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/resolver\.js: should pass Standard/)
        .to.match(/ok 6 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - helpers\/start-app\.js: should pass Standard/)
        .to.match(/ok 7 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - models\/thing\.js: should pass Standard/)
        .to.match(/ok 8 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - resolver\.js: should pass Standard/)
        .to.match(/ok 9 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - router\.js: should pass Standard/)
        .to.match(/ok 11 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - test-helper\.js: should pass Standard/)
        .to.match(/not ok 12 Chrome [0-9]+\.[0-9]+ - \[[0-9]+ ms\] - Standard - unused\.js: should pass Standard/)
    })
  })

  it('All addon blueprints pass standard', () => {
    return blueprint('g').then(() => lint('addon')).then((result) => {
      expect(result.error).to.be.null
      expect(result.stdout.match(/[^\r\n]+/g))
        .to.be.null
    })
  })
  it('All test blueprints pass standard', () => {
    return lint('tests').then((result) => {
      expect(result.error).to.be.null
      expect(result.stdout.match(/[^\r\n]+/g))
        .to.be.null
    }).then(() => blueprint('d'))
  })
})

function emberTest (destroy) {
  return new Promise((resolve) => {
    exec('node_modules/.bin/ember test', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      resolve({
        error,
        stdout,
        stderr
      })
    })
  })
}
