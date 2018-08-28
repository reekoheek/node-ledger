
class Memory {
  constructor () {
    this.accounts = [];
    this.entries = [];
  }

  _connect ({ code, name, currency, parent }) {
    this.accounts.push({ code, name, currency, parent });
  }

  _disconnect ({ code }) {
    let index = this.accounts.findIndex(account => account.code === code);
    if (index === -1) {
      return;
    }

    this.accounts.splice(index, 1);
  }

  _get (code) {
    return this.accounts.find(account => account.code === code);
  }

  _findByParent (parent) {
    return this.accounts.filter(account => account.parent === parent);
  }

  _post ({ trace, posted, date, desc, entries }) {
    entries.forEach(({ code, db, cr }) => {
      this.entries.push({ trace, posted, date, desc, code, db, cr });
    });
    return trace;
  }

  _entries ({ code } = {}) {
    let entries = [];
    this.entries.forEach(entry => {
      if (code && entry.code !== code) {
        return;
      }

      entries.push(entry);
    });

    return entries;
  }

  _balance (code) {
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
