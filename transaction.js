const Base = require('./base');
const Entry = require('./entry');
const LedgerError = require('./error');

/**
 * Transaction
 * Signature: { date, note, entries: [ Entry ] }
 */
class Transaction extends Base {
  get balance () {
    return this.entries.reduce((result, entry) => {
      let { debit = 0, credit = 0 } = entry;
      result += debit - credit;
      return result;
    }, 0);
  }

  sync (row = {}) {
    let { entries = [] } = row;
    delete row.entries;

    super.sync(row);

    this.entries = entries.map(entry => new Entry(this.$ledger, entry));
  }

  lock () {
    return Promise.all(this.entries.map(entry => entry.lock()));
  }

  unlock () {
    return Promise.all(this.entries.map(entry => entry.unlock()));
  }

  async persist () {
    let collection = this.$ledger._rawFind('transaction');

    let now = new Date();

    this.entries.forEach(entry => {
      Object.assign(entry, {
        date: this.date,
        created_time: now,
      });
      collection = collection.insert(entry);
    });

    await collection.save();
  }

  async save () {
    if (!this.date) {
      throw new LedgerError('Value date not found');
    }

    if (!this.entries || !this.entries.length) {
      throw new LedgerError('Empty entries');
    }

    if (this.balance) {
      throw new LedgerError('Transaction is imbalance');
    }

    try {
      await this.lock();
      await this.persist();
      await this.unlock();

      return this;
    } catch (err) {
      try {
        await this.unlock();
      } catch (err) {
        console.error(err);
      }
      throw err;
    }
  }
}

module.exports = Transaction;
