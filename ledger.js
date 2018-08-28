const Memory = require('./adapters/memory');
const { Account } = require('./account');
const { Transaction } = require('./transaction');

class Ledger {
  constructor ({ adapter = new Memory() } = {}) {
    Object.defineProperty(this, 'adapter', {
      configurable: true,
      get: () => adapter,
    });
  }

  async populate (accounts = []) {
    // await this.adapter._connect(this);
    await this.insertAccounts(this, accounts);
  }

  async post (tx) {
    if (tx instanceof Transaction === false) {
      tx = new Transaction(tx, this.adapter);
    }
    await tx.validate();
    await this.adapter._post(tx);
  }

  async getAccount (code) {
    let rawAccount = await this.adapter._get(code);
    if (!rawAccount) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  getEntries () {
    return this.adapter._entries();
  }

  async insertAccounts (parent, accounts = []) {
    for (let def of accounts) {
      let account = new Account(def);

      account.parent = parent.code || '';
      await this.adapter._connect(account);

      if (def.children && def.children.length) {
        await this.insertAccounts(account, def.children);
      }
    }
  }
}

module.exports = { Ledger };
