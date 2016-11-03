const sequence = (...fns) =>
  fns.reduce((acc, fn) => acc.then(fn), Promise.resolve());

module.exports = sequence;
