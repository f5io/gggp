const promisify = (fn) => (...x) =>
  new Promise((resolve, reject) => {
    fn(...x, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    })
  });

const promisifyAll = (o) =>
  Object.entries(o).reduce((acc, [ k, v ]) => {
    acc[k] = typeof v === 'function' && k[0] === k[0].toLowerCase()
      ? promisify(v)
      : v;
    return acc;
  }, {});

exports.promisifyAll = promisifyAll;
module.exports = promisify;
