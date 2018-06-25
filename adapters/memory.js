
class Memory {
  constructor () {
    this.accounts = [];
    this.txs = [];
    this.entries = [];
  }

  connectAccount ({ code, currency, parent }) {
    this.accounts.push({ code, currency, parent });
  }

  disconnectAccount ({ code }) {
    let index = this.accounts.findIndex(account => account.code === code);
    if (index === -1) {
      return;
    }

    this.accounts.splice(index, 1);
  }

  getAccount (code) {
    return this.accounts.find(account => account.code === code);
  }

  getAccountsByParent (parent) {
    return this.accounts.filter(account => account.parent === parent);
  }

  post ({ trace, posted, date, desc, entries }) {
    entries.forEach(({ code, db, cr }) => {
      this.entries.push({ trace, code, db, cr });
    });
    this.txs.push({ trace, posted, date, desc });
    return trace;
  }

  getTransactions ({ code } = {}) {
    let txs = [];
    this.entries.forEach(entry => {
      if (code && entry.code !== code) {
        return;
      }

      let tx = txs.find(tx => tx.trace === entry.trace);
      if (!tx) {
        let { trace, posted, date, desc } = this.txs.find(tx => tx.trace === entry.trace);
        tx = { trace, posted, date, desc, entries: [] };
        txs.push(tx);
      }

      tx.entries.push(entry);
    });

    return txs;
  }

  getBalance (code) {
    let db = 0;
    let cr = 0;
    this.entries.forEach(entry => {
      if (entry.code === code) {
        db += entry.db || 0;
        cr += entry.cr || 0;
      }
    });

    if (db < cr) {
      return { db: 0, cr: cr - db };
    } else {
      return { db: db - cr, cr: 0 };
    }
  }
}

module.exports = Memory;
