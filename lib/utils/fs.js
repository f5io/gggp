const fs = require('fs');
const mkdirp = require('mkdirp');
const lnf = require('lnf');
const rimraf = require('rimraf');
const omit = require('./omit');
const promisify = require('./promisify');
const { log } = require('./log');
const chalk = require('chalk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const copyFile = (source, target) =>
  new Promise((resolve, reject) => {
    const rd = fs.createReadStream(source);
    rd.on('error', rejectCleanup);
    const wr = fs.createWriteStream(target);
    wr.on('error', rejectCleanup);
    function rejectCleanup(err) {
        rd.destroy();
        wr.end();
        reject(err);
    }
    wr.on('finish', resolve);
    rd.pipe(wr);
  });

const writeJSON = path => config =>
  Promise.resolve(config)
    .then(x => JSON.stringify(x, null, 2))
    .then(str => writeFile(path, str, 'utf8'))
    .catch(err => {
      throw new Error(`something went wrong updating: ${path}`);
    })

const getJSON = path => () => {
  return readFile(path, 'utf8')
    .then(JSON.parse)
    .catch(err => {
      log(`${chalk.blue('ℹ')} no config file found, creating a local one.\n`);
      return writeJSON(path)({}).then(() => ({}));
    })
    .then(config => config || {})
}

const unsetJSON = path => (...keys) =>
  getJSON(path)()
    .then(config => omit(keys, config))
    .then(writeJSON(path))

const setJSON = path => (key, value) =>
  getJSON(path)()
    .then(config => Object.assign(
      {}, config,
      typeof key !== 'object' && value
        ? { [key]: value }
        : key))
    .then(writeJSON(path))


exports.copyFile = copyFile;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.appendFile = promisify(fs.appendFile);
exports.unlink = promisify(fs.unlink);
exports.symlink = promisify(lnf);
exports.mkdir = promisify(mkdirp);
exports.rmrf = promisify(rimraf);
exports.exists = fs.existsSync;
exports.writeJSON = writeJSON;
exports.getJSON = exports.readJSON = getJSON;
exports.unsetJSON = unsetJSON;
exports.setJSON = setJSON;


