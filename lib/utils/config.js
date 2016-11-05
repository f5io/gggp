const { writeJSON, readJSON, unsetJSON, setJSON } = require('./fs');
const { log } = require('./log');
const omit = require('./omit');
const { join } = require('path');
const pkg = require('../../package');

const paths = {
  config: join(process.env.HOME, `.${pkg.name}rc`),
  cache: join(process.env.HOME, `.${pkg.name}/cache`),
  local: {
    config: join(process.cwd(), `Gadgetfile`),
    protos: `protos`,
  },
};

const rootConfig = {
  get: readJSON(paths.config),
  set: setJSON(paths.config),
  unset: unsetJSON(paths.config),
};

const localConfig = {
  get: readJSON(paths.local.config),
  set: setJSON(paths.local.config),
  unset: unsetJSON(paths.config),
};

exports.paths = paths;
exports.rootConfig = rootConfig;
exports.localConfig = localConfig;
