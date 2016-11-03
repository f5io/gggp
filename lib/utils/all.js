const all = (...fns) => Promise.all(fns.map(f => f()));

module.exports = all;
