const pluck = require('./pluck');
const toArray = require('./toArray');

const omit = (props, x) => {
  const ps = toArray(props);
  return pluck(Object.keys(x).filter(k =>
    typeof ps.find(p => p === k) === 'undefined'), x);
};

module.exports = omit;