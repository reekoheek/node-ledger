const assert = require('assert');
const { Transaction } = require('./transaction');

class Account {
  constructor ({ code, currency = '', parent }, adapter) {
    assert(code, 'Undefined code');

    this.code = code;
    this.currency = currency;
    this.parent = parent;

    this._attachAdapter(adapter);
  }

  get attached () {
    return Boolean(this.adapter);
  }

  async addChild (account) {
    assert(this.attached, 'Detached from adapter');
    assert(account instanceof Account);

    account._attachAdapter(this.adapter);

    await account._disconnect();
    await account._connect(this);
  }

  async removeChild (account) {
    assert(this.attached, 'Detached from adapter');
    assert(account instanceof Account);
    assert.equal(account.parent, this.code);

    await account._disconnect();
  }

  getParent () {
    if (!this.parent || !this.attached) {
      return;
    }

    return this.adapter.getAccount(this.parent);
  }

  async getChild (code) {
    assert(this.attached, 'Detached from adapter');

    let rawAccount = await this.adapter.getAccount(code);
    if (!rawAccount || rawAccount.parent !== this.code) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  async getChildren () {
    assert(this.attached, 'Detached from adapter');

    let rawAccounts = await this.adapter.getAccountsByParent(this.code);
    return rawAccounts.map(a => new Account(a, this.adapter));
  }

  async getTransactions () {
    let { code } = this;
    let txs = await this.adapter.getTransactions({ code });
    return Promise.all(txs.map(tx => new Transaction(tx, this.adapter)));
  }

  getBalance () {
    return this.adapter.getBalance(this.code);
  }

  async _connect (parent) {
    this.parent = parent.code;
    await this.adapter.connectAccount(this);
  }

  async _disconnect () {
    if (this.parent) {
      await this.adapter.disconnectAccount(this);
    }
  }

  _attachAdapter (adapter) {
    Object.defineProperty(this, 'adapter', {
      configurable: true,
      get: () => adapter,
    });
  }
}

module.exports = { Account };
