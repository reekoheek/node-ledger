const { Entry } = require('./entry');
const uuidv1 = require('uuid/v1');

class Transaction {
  constructor ({ trace = uuidv1(), date, posted, desc = '', entries = [] } = {}, adapter) {
    date = date || new Date();
    if (date instanceof Date === false) {
      date = new Date(date);
    }

    Object.defineProperties(this, {
      adapter: { get: () => adapter },
    });

    this.trace = trace;
    this.posted = posted || date;
    this.date = date;
    this.desc = desc;
    this.entries = entries.map(({ code, db, cr, param1, param2, param3 }) => {
      return new Entry({ trace, code, db, cr, param1, param2, param3 }, adapter);
    });
  }

  async validate (options) {
    if (this.entries.length < 2) {
      throw new Error('Invalid entries');
    }

    let sums = [];
    for (let entry of this.entries) {
      await entry.validate(options);

      sums[entry.currency] = (sums[entry.currency] || 0) + entry.db - entry.cr;
    }

    for (let currency in sums) {
      if (sums[currency] !== 0) {
        throw new Error(`Imbalance DBCR, ${currency}`);
      }
    }
  }
}

module.exports = { Transaction };
