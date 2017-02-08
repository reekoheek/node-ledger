class Base {
  constructor (ledger, row) {
    this.set('$ledger', ledger);
    this.sync(row);
  }

  sync (row) {
    Object.assign(this, row);
  }

  set (key, value) {
    if (key.startsWith('$')) {
      Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: value,
      });
    } else {
      this[key] = value;
    }
  }
}

module.exports = Base;
