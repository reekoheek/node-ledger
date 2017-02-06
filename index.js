const Manager = require('node-norm');

class Ledger {
  constructor ({ manager, connections }) {
    this.manager = manager || new Manager({ connections });
  }

  async all () {
    return await this.manager.find('account').sort({ code: 1 }).all();
  }

  async init (coa) {
    await this.manager.find('account').delete();

    await Promise.all(coa.map(account => this._populateAccount(account)));
  }

  async post ({ date, note = '', entries = [] }) {
    if (!date) {
      throw new Error('Value date not found');
    }

    if (!entries.length) {
      throw new Error('Empty entries');
    }

    let imbalance = entries.reduce((result, entry) => {
      let { debit = 0, credit = 0 } = entry;
      result += debit - credit;
      return result;
    }, 0);

    let postedTime = new Date();

    if (imbalance) {
      throw new Error('Transaction is imbalance');
    }

    let collection = this.manager.find('transaction');

    entries.forEach(entry => {
      let { code, debit, credit, ref } = entry;
      let row = { note, code, debit, credit, ref };
      row.value_date = date;
      row.posted_time = postedTime;
      collection = collection.insert(row);
    });

    await collection.save();
  }

  async getTransactions (code) {
    let txs;
    if (code) {
      txs = await this.manager.find('transaction', { code }).all();
    } else {
      txs = await this.manager.find('transaction').all();
    }

    return txs;
  }

  async _populateAccount (account, parentAccount) {
    let { code, cname = parentAccount.cname, name, children = [] } = account;
    let parent = parentAccount ? parentAccount.id : null;
    let [ insertedAccount ] = await this.manager.find('account').insert({ code, cname, name, parent }).save();

    await Promise.all(children.map(childAccount => this._populateAccount(childAccount, insertedAccount)));
  }
}

module.exports = Ledger;
