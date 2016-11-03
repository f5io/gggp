const { parse, join } = require('path');
const all = require('./utils/all');
const { symlink, mkdir, copyFile } = require('./utils/fs');
const { contents } = require('./utils/git');
const { log } = require('./utils/log');
const { paths, localConfig } = require('./utils/config');
const { has, set, get } = require('./utils/cache');
const chalk = require('chalk');

const uniq = x => [ ...new Set(x) ];

const createResultLog = ({ met, unmet }) => {
  log(`${chalk.green('✓')} ${met.length}/${chalk.bold(met.length + unmet.length)} dependencies were successfully resolved:

${met.map(x => `  - ${x}`).join('\n')}\n`);
  if (unmet.length) {
    log(`${chalk.red('✘')} ${unmet.length}/${chalk.bold(met.length + unmet.length)} dependencies were unable to be resolved:

${unmet.map(x => `  - ${x}`).join('\n')}\n
  try resolving these dependencies and running this command again.
`)
  }
}

const createSuccessLog = ({ proto, sha, link }) => link
  ? log(`${chalk.green('✓')} ${chalk.blue('⚭')} ${link}
    -> ${proto}
       - ${chalk.underline('sha')}: ${chalk.italic.bold(sha)}
  `)
  : log(`${chalk.green('✓')} ${proto}
  - ${chalk.underline('sha')}: ${chalk.italic.bold(sha)}
  `);

const getProtos = (protoPath, ...protos) => {
  const K = x => y => (x(y), y);

  const attempts = {};

  const met = [];
  const unmet = [];

  const saveDependencies = ({ links, dependencies }) =>
    localConfig.get()
      .then(config => localConfig.set({
        dependencies: Object.assign({}, config.dependencies, dependencies),
        links: Object.assign({}, config.links, links),
        path: protoPath,
      }));

  const resolver = ([ proto, sha, branch = 'master' ]) => {
    if (attempts[proto])
      return () => Promise.resolve({});
    const isLatest = sha ? false : true;
    attempts[proto] = true;
    return () => (has(proto, sha)
      ? get(proto, sha)
      : contents(proto, sha, branch)
        .then(({ proto, content, encoding, sha }) =>
          set(proto, content, encoding, sha, isLatest)))
      .then(K(createSuccessLog))
      .then(K(proto => met.push(proto)))
      .then(pconf => {
        const deps = ({ [proto]: pconf });
        return all(...pconf.deps
          .map(x => [ x ])
          .map(x => () => resolver(x)().catch(err => {
            log(err.message);
            unmet.push(err.dep);
          }).then(x => x || {})))
          .then(xs => Object.assign({}, deps, ...xs))

      }); 
  }

  const retrievers = protos.map(resolver);
  
  return all(...retrievers)
    .then(x => Object.assign({}, ...x))
    .then(deps => {
      const kvs = Object.keys(deps).map(k => [ k, deps[k] ]);

      const dependencies = Object.assign({}, ...kvs.map(([ k, { proto, sha }]) =>
        ({ [proto]: sha ? sha : 'latest' })));
      
      const links = Object.assign({}, ...kvs
        .filter(([ k, { proto } ]) => k !== proto)
        .map(([ k, { proto }]) => ({ [k]: proto })));
      
      return saveDependencies({ links, dependencies }).then(() => deps);
    })
    .then(res => {
      const fns = Object.keys(res)
        .map(k => [ k, res[k] ])
        .reduce((acc, [ mk, { sha, proto, file } ]) => {
          const shouldSym = mk !== proto;
          const { dir } = parse(proto);
          acc.push(
            () => mkdir(join(protoPath, dir))
              .then(() => copyFile(join(paths.cache, proto, sha, file), join(protoPath, proto)))
              .then(() => {
                if (!shouldSym) return;
                const { dir } = parse(mk);
                const dots = dir.split('/').map(x => '..').join('/');
                return mkdir(join(protoPath, dir))
                  .then(() => symlink(join(dots, proto), join(protoPath, mk)))
              })
          );
          return acc;
        }, []);
      return all(...fns);
    })
    .then(() => {
      createResultLog({ met: uniq(met.map(({ proto }) => proto)), unmet });
    })
    .then(() => ({ met, unmet }));
}

module.exports = getProtos;