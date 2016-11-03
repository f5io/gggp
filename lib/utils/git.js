const { parse } = require('path');
const config = require('./config');
const { log } = require('./log');
const UnmetError = require('./error');
const github = require('octonode');
const chalk = require('chalk');

const parseProto = proto => {
  const { dir, base: file } = parse(proto);
  const [ host, owner, repo, ...p ] = dir.split('/');
  const folder = p.join('/');
  return {
    folder, file,
    host, owner, repo,
    repoPath: `${owner}/${repo}`,
    filePath: `${folder}/${file}`,
  }
}

const createUnknownError = proto =>
  `${chalk.red('✘')} ${chalk.blue('⚭')} ${proto}
  - doesn\'t look like a github url, try resolving the import with:
    
    $ gggp link ${proto} (-s <sha>) <github url>
`;

const createGithubError = (err, proto, sha) =>
  `${proto}${sha ? `
    - ${chalk.underline('sha')}: ${chalk.italic(sha)}`: ''}

  github responded with: ${err.statusCode} - ${err.message.toLowerCase()}

  please check that the url supplied is correct${err.statusCode !== 404 ? '.' : `, if the repo is private,
  try logging in with:

  $ gggp login -u <username> -p <password>`}
  `;

const verify = (username, password) =>
  new Promise((resolve, reject) => {
    github.client({ username, password })
      .get('/user', (err, status) => {
        if (err) return reject(err);
        return resolve({ username, password });
      });
  });

const login = (username, password) =>
  config.rootConfig.get()
    .then(({ username, password }) => {
      if (username && password) throw new Error('already logged in');
      return;
    })
    .then(() => verify(username, password))
    .then(conf => config.rootConfig.set(conf));

exports.login = login;

const logout = () =>
  config.rootConfig.get()
    .then(({ username, password }) => {
      if (!username && !password) throw new Error('not logged in');
      return;
    })
    .then(() => config.rootConfig.unset('username', 'password'));

exports.logout = logout;

const client = () =>
  config.rootConfig.get()
    .then(({ username, password }) => {
      return username && password
        ? github.client({ username, password })
        : github.client();
    });

exports.client = client;

const getBySHA = (repoPath, sha) =>
  new Promise((resolve, reject) => {
    client()
      .then(cl => {
        cl.repo(repoPath)
          .blob(sha, (err, file) => {
            if (err) return reject(err);
            const { sha, content, encoding } = file;
            return resolve({ sha, content, encoding });
          })
      })
  });

const getByFilePath = (repoPath, filePath, branch) =>
  new Promise((resolve, reject) =>
    client()
      .then(cl => {
        cl.repo(repoPath)
          .contents(filePath, branch, (err, file) => {
            if (err) return reject(err);
            if (Array.isArray(file)) return reject(new Error('supplied proto path is folder'));
            const { sha, content, encoding } = file;
            return resolve({ sha, content, encoding });
          })
      })) 

const contents = (proto, sha, branch) => {
  return new Promise((resolve, reject) => {
    const {
      folder, file,
      host, owner, repo,
      repoPath, filePath,
    } = parseProto(proto);

    // console.log('branch'branch);

    if (host !== 'github.com') {
      return reject(new UnmetError(createUnknownError(proto), proto));
    }

    return (sha
      ? getBySHA(repoPath, sha)
      : getByFilePath(repoPath, filePath, branch))
      .then(({ sha, content, encoding }) => ({
        sha, content, encoding, proto, file, 
      }))
      .then(resolve)
      .catch(err => {
        if (err.statusCode)
          return reject(new Error(createGithubError(err, proto, sha)));
        return reject(err);
      });
      
  });
}

exports.contents = contents;
