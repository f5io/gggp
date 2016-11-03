const { parse, join } = require('path');
const { symlink, mkdir } = require('./utils/fs');
const { contents } = require('./utils/git');
const { log } = require('./utils/log');
const { paths, localConfig } = require('./utils/config');
const { has, set } = require('./utils/cache');
const chalk = require('chalk');

const createSuccessLog = (link, proto, sha) =>
  log(`${chalk.blue('⚭')} ${link} link created...\n`);

const resolve = (link, proto, sha) => {
  if (has(link)) return Promise.resolve();
  
  const isLatest = sha ? false : true;

  const saveLink = (key, value) =>
    localConfig.get()
      .then(config => localConfig.set({ links: Object.assign({}, config.links, { [key]: value }) }))

  return contents(proto, sha)
    .then(({ proto, content, encoding, sha }) =>
      set(proto, content, encoding, sha, isLatest))
    .then(({ sha }) => {
      const dots = link.split('/').map(_ => '..').join('/');
      const linkTo = join(proto, sha, 'pconf');
      createSuccessLog(link, proto, sha);
      return mkdir(join(paths.cache, link))
        .then(() => symlink(join(dots, linkTo), join(paths.cache, link, 'pconf')))
    })
    .then(() => saveLink(link, `${proto}${sha ? `@${sha}` : ''}`));
}

module.exports = resolve;