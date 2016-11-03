class UnmetError extends Error {
  constructor(msg, dep) {
    super(msg);
    this.dep = dep;
  }
}

module.exports = UnmetError;