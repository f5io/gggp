const all = require('./utils/all');
const get = require('./get');
const resolve = require('./resolve');
const { log } = require('./utils/log');
const { paths, localConfig } = require('./utils/config');

const init = () =>
  localConfig.get()
    .then(({ dependencies, links, path = paths.local.protos }) => {
      if (!dependencies) throw new Error('no dependencies found');
      const lnks = Object.keys(links)
        .map(k => [ k, ...links[k].split('@') ])
        .map(ln => () => resolve(...ln));
      const deps = Object.keys(dependencies)
        .map(k => [ k, ...[ dependencies[k] !== 'latest' ? dependencies[k] : undefined, undefined ] ]);
      return all(...lnks).then(() => get(path, ...deps));
    });

module.exports = init;
