const { Entry } = require('./entry');
const uuidv1 = require('uuid/v1');

class Transaction {
  constructor ({ trace = uuidv1(), date, desc = '', entries = [], posted } = {}, adapter) {
    date = date || new Date();
    if (date instanceof Date === false) {
      date = new Date(date);
    }

    Object.defineProperties(this, {
      adapter: { get: () => adapter },
    });

    this.trace = trace;
    this.posted = posted;
    this.date = date;
    this.desc = desc;
    this.entries = entries.map(({ code, db, cr }) => new Entry({ trace, code, db, cr }, adapter));
  }

  async validate () {
    if (this.entries.length < 2) {
      throw new Error('Invalid entries');
    }

    let sums = [];
    for (let entry of this.entries) {
      await entry.validate();

      sums[entry.currency] = (sums[entry.currency] || 0) + entry.db - entry.cr;
    }

    for (let currency in sums) {
      if (sums[currency] !== 0) {
        throw new Error(`Imbalance DBCR, ${currency}`);
      }
    }
  }

  async post () {
    await this.validate();

    this.posted = new Date();

    await this.adapter.post(this);
  }
}

module.exports = { Transaction };
