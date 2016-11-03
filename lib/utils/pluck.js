const toArray = require('./toArray');

const pluck = (props, x) =>
  toArray(props).reduce((acc, prop) => {
    if (typeof x[prop] !== 'undefined') acc[prop] = x[prop];
    return acc;
  }, {});

module.exports = pluck;
