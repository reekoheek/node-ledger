class Account {
  constructor ({ code, name, currency = '', parent }, adapter) {
    if (!code) {
      throw new Error('Undefined code');
    }

    this.code = code;
    this.name = name || code;
    this.currency = currency;
    this.parent = parent;

    this._attach(adapter);
  }

  get attached () {
    return Boolean(this.adapter);
  }

  /**
   * Add child account
   * @param {Account} account
   * @param {object} options
   */
  async addChild (account, options) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    if (account instanceof Account === false) {
      throw new Error('Account to add is not an account');
    }

    if (account.parent) {
      throw new Error('Account to add is a child of other account');
    }

    account._attach(this.adapter);

    await account.setParent(this, options);
  }

  async removeChild (account, options) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    if (account instanceof Account === false) {
      throw new Error('Child is not an account');
    }

    if (account.parent !== this.code) {
      throw new Error('Account to remove is not a child of account');
    }

    await account.removeParent(options);
  }

  getParent (options) {
    if (!this.parent || !this.attached) {
      return;
    }

    return this.adapter._get(this.parent, options);
  }

  async getChild (code, options) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    let rawAccount = await this.adapter._get(code, options);
    if (!rawAccount || rawAccount.parent !== this.code) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  async getChildren (options) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    let rawAccounts = await this.adapter._findByParent(this.code, options);
    return rawAccounts.map(a => new Account(a, this.adapter));
  }

  getEntries (criteria, options) {
    criteria = Object.assign({}, criteria, { code: this.code });
    return this.adapter._entries(criteria, options);
  }

  getBalance (options) {
    return this.adapter._balance(this.code, options);
  }

  async setParent (parent, options) {
    this.parent = parent.code;
    await this.adapter._connect(this, options);
  }

  async removeParent (options) {
    await this.adapter._disconnect(this, options);
    this.parent = undefined;
  }

  _attach (adapter) {
    Object.defineProperty(this, 'adapter', {
      configurable: true,
      get: () => adapter,
    });
  }
}

module.exports = { Account };
