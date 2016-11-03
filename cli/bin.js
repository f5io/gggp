#!/usr/bin/env node
const pkg = require('../package');
const path = require('path');
const program = require('commander');
const init = require('../lib/init');
const get = require('../lib/get');
const resolve = require('../lib/resolve');
const { clear } = require('../lib/utils/cache');
const { login, logout } = require('../lib/utils/git');
const { log } = require('../lib/utils/log');
const chalk = require('chalk');

process.on('uncaughtException', err => {
  console.error(err);
});

log(``);
const logo = () => log(`                             _         _   
   ___ ___ ___ ___ ___ ___ _| |___ ___| |_ 
  | . | . | . | . | . | .'| . | . | -_|  _|
  |_  |___|_  |___|_  |__,|___|_  |___|_|  
  |___|_ _|___|_| |___|_      |___|        
   _| . |  _| . |  _| . |                  
  |_|  _|_| |___|_| |___|  go go gadget .proto                
    |_|

`);

program
  .version(pkg.version)
  .description('go go gadget proto - dependency management for .proto files')

program
  .command('init')
  .description(`install all dependencies from \`Gadgetfile\``)
  .action(() => {
    logo();
    init()
      .then(() => log(`${chalk.green('✓')} successfully installed dependencies\n`))
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  })

program
  .command('get [proto]')
  .description(`get dependency and resolve tree`)
  .option('-s, --sha <sha>', 'sha of the github proto to use')
  .option('-p, --path <path>', 'path to store protos locally')
  .action((proto, { sha, path: pth = 'protos' }) => {
    logo();
    const protoPath = path.join(process.cwd(), pth);
    return (proto
      ? get(pth, [ proto, sha ])
      : init())
      .then(({ met, unmet }) => {
        if (unmet.length) process.exit(1);
      })
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  });

program
  .command('resolve <link> <proto>')
  .alias('link')
  .description('resolve a dodgy import with its correct link')
  .option('-s, --sha <sha>', 'sha of the github proto to use')
  .action((link, proto, { sha }) => {
    resolve(link, proto, sha)
      .then(() => log(`${chalk.green('✓')} ${chalk.bold(link)}\n  -> ${proto}${sha ? `@${chalk.italic(sha)}` : ''}\n`))
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  });

program
  .command('cache <cmd>')
  .description(`manage the cache that sits behind ${pkg.name}`)
  .action(cmd => {
    if (cmd !== 'clear') return log('unknown command');
    clear()
      .then(() => log(`${chalk.green('✓')} successfully cleared the cache\n`))
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  })

program
  .command('login')
  .description(`login to github`)
  .option('-u, --username <username>', 'your github login')
  .option('-p, --password <password>', 'your github password or a personal access token')
  .action(({ username, password }) => {
    login(username, password)
      .then(() => log(`${chalk.green('✓')} successfully logged in\n`))
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  })

program
  .command('logout')
  .description(`logout of github`)
  .action(() => {
    logout()
      .then(() => log(`${chalk.green('✓')} successfully logged out\n`))
      .catch(err => log(`${chalk.red('✘')} ${err.message}\n`));
  });

program.parse(process.argv);
