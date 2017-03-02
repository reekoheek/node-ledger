class Base {
  constructor (ledger, row) {
    this.set('$ledger', ledger);
    this.sync(row);
  }

  sync (row) {
    Object.assign(this, row);
  }

  set (key, value) {
    if (typeof key === 'object') {
      for (let i in key) {
        this.set(i, key[i]);
      }
    } else if (key.startsWith('$')) {
      Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: value,
      });
    } else if (this[key] !== value) {
      this[key] = value;
    }
  }
}

module.exports = Base;
