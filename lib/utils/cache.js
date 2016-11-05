const { join, parse } = require('path');
const { writeFile, readFile, exists, mkdir, symlink, rmrf } = require('./fs');
const { paths } = require('./config');

const writePconf = (proto, sha) => pconf =>
  Promise.resolve(pconf)
    .then(JSON.stringify)
    .then(str => writeFile(join(paths.cache, proto, sha, 'pconf'), str, 'utf8'))
    .then(() => pconf);

const linkPconf = (proto, sha, isLatest) => pconf => {
  if (!isLatest) return pconf;
  const linkTo = join(paths.cache, proto, 'pconf');
  const link = join(sha, 'pconf');
  return symlink(link, linkTo)
    .then(() => pconf);
}

const parseImports = contents => {
  const res = [];
  const re = /^(?:import\s+"(.+)")/gm;
  let match = re.exec(contents);
  while (match && match[1] != null) {
    res.push(match[1]);
    match = re.exec(contents);
  }
  return res;
}

const clear = () =>
  exists(paths.cache)
    ? rmrf(paths.cache)
    : Promise.reject(new Error(`there is nothing in the cache`));

const has = (proto, sha) => {
  const { base: file } = parse(proto);
  const path = sha
    ? join(paths.cache, proto, sha, 'pconf')
    : join(paths.cache, proto, 'pconf');
  return exists(path);
}

const get = (proto, sha) => {
  const path = sha
    ? join(paths.cache, proto, sha, 'pconf')
    : join(paths.cache, proto, 'pconf');
  return readFile(path, 'utf8')
    .then(JSON.parse)
    .then(p => Object.assign({}, p, (p.proto !== proto ? { link: proto } : {})));
}

const set = (proto, content, encoding, sha, isLatest = false) => {
  if (has(proto, sha)) return get(proto, sha);
  const buffer = new Buffer(content, encoding);
  const { base: file } = parse(proto);
  const path = join(paths.cache, proto, sha);
  const filepath = join(path, file);
  return mkdir(path)
    .then(() => writeFile(filepath, buffer))
    .then(() => buffer.toString())
    .then(parseImports)
    .then(deps => ({ sha, deps, proto, file }))
    .then(writePconf(proto, sha))
    .then(linkPconf(proto, sha, isLatest));
}

exports.clear = clear;
exports.has = has;
exports.get = get;
exports.set = set;
