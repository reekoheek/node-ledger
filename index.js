const Manager = require('node-norm');
const Account = require('./account');
const Transaction = require('./transaction');

class Ledger {
  constructor ({ manager, connections, prefix = '', classes } = {}) {
    this.prefix = prefix;
    this.manager = manager || new Manager({ connections });
    this.classes = Object.assign({
      asset: 'debit',
      liability: 'credit',
      equity: 'credit',
      income: 'credit',
      expense: 'debit',
    }, classes);
  }

  async initAccounts (coa) {
    await this._rawFind('account').delete();

    await Promise.all(coa.map(account => this._populateAccount(account)));
  }

  async getAccounts () {
    let rows = await this._rawFind('account').sort({ code: 1 }).all();
    return rows.map(row => new Account(this, row));
  }

  async getAccount (code) {
    let row = await this._rawFind('account', { code }).single();
    if (!row) {
      return;
    }

    return new Account(this, row);
  }

  kindOf (key) {
    let kind = this.classes[key];
    if (!kind) {
      throw new Error(`Unknown account class '$key'`);
    }
    return kind;
  }

  newAccount (row) {
    return new Account(this, row);
  }

  newTransaction (row) {
    return new Transaction(this, row);
  }

  async post (row) {
    let tx = this.newTransaction(row);

    return await tx.save();
  }

  async getTransactions (code) {
    let txs;
    if (code) {
      txs = await this._rawFind('transaction', { code }).all();
    } else {
      txs = await this._rawFind('transaction').all();
    }

    return txs;
  }

  async _populateAccount (account, parentAccount) {
    let { code, cname = parentAccount.cname, name, children = [] } = account;
    let parent = parentAccount ? parentAccount.code : null;
    let [ insertedAccount ] = await this._rawFind('account').insert({ code, cname, name, parent }).save();

    await Promise.all(children.map(childAccount => this._populateAccount(childAccount, insertedAccount)));
  }

  _rawFind (name, opts) {
    return this.manager.find(`${this.prefix}${name}`, opts);
  }
}

module.exports = Ledger;
