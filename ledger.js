const assert = require('assert');
const Memory = require('./adapters/memory');
const { Account } = require('./account');
const { Transaction } = require('./transaction');

class Ledger extends Account {
  constructor (adapter = new Memory()) {
    super({ code: 'root' }, adapter);

    this.initialized = false;
  }

  async init (coa = []) {
    assert(!this.initialized, 'Already initialized');

    this.initialized = true;
    await this.adapter.connectAccount(this);
    await this._insertAccounts(this, coa);
  }

  async destroy () {
    assert(this.initialized, 'Uninitialized');
    await this.adapter.disconnectAccount(this);
    this.initialized = false;
  }

  async post (tx) {
    if (tx instanceof Transaction === false) {
      tx = new Transaction(tx, this.adapter);
    }
    await tx.validate();
    await this.adapter.post(tx);
  }

  async getAccount (code) {
    let rawAccount = await this.adapter.getAccount(code);
    if (!rawAccount) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  async getTransactions () {
    let txs = await this.adapter.getTransactions();
    return Promise.all(txs.map(tx => new Transaction(tx, this.adapter)));
  }

  async _insertAccounts (parent, accounts) {
    if (!accounts.length) {
      return;
    }

    for (let def of accounts) {
      let account = new Account(def);
      await this.addChild(account);
      if (def.children && def.children.length) {
        await this._insertAccounts(account, def.children);
      }
    }
  }
}

module.exports = { Ledger };
