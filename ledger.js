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

  async populate (accounts = [], options) {
    // await this.adapter._connect(this);
    await this.insertAccounts(this, accounts, options);
  }

  async post (tx, options) {
    if (tx instanceof Transaction === false) {
      tx = new Transaction(tx, this.adapter);
    }

    await tx.validate(options);
    await this.adapter._post(tx, options);
    return tx.trace;
  }

  /**
   * Get account by code
   *
   * @param {string} code
   */
  async getAccount (code, options) {
    let rawAccount = await this.adapter._get(code, options);
    if (!rawAccount) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  getEntries (criteria, options) {
    return this.adapter._entries(criteria, options);
  }

  async insertAccounts (parent, accounts = [], options) {
    for (let def of accounts) {
      let account = new Account(def);

      account.parent = parent.code || '';
      await this.adapter._connect(account, options);

      if (def.children && def.children.length) {
        await this.insertAccounts(account, def.children, options);
      }
    }
  }
}

module.exports = { Ledger };
