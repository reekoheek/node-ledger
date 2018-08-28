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

  async addChild (account) {
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

    await account.setParent(this);
  }

  async removeChild (account) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    if (account instanceof Account === false) {
      throw new Error('Child is not an account');
    }

    if (account.parent !== this.code) {
      throw new Error('Account to remove is not a child of account');
    }

    await account.removeParent();
  }

  getParent () {
    if (!this.parent || !this.attached) {
      return;
    }

    return this.adapter._get(this.parent);
  }

  async getChild (code) {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    let rawAccount = await this.adapter._get(code);
    if (!rawAccount || rawAccount.parent !== this.code) {
      return;
    }

    return new Account(rawAccount, this.adapter);
  }

  async getChildren () {
    if (!this.attached) {
      throw new Error('Detached from adapter');
    }

    let rawAccounts = await this.adapter._findByParent(this.code);
    return rawAccounts.map(a => new Account(a, this.adapter));
  }

  getEntries () {
    return this.adapter._entries({ code: this.code });
  }

  getBalance () {
    return this.adapter._balance(this.code);
  }

  async setParent (parent) {
    this.parent = parent.code;
    await this.adapter._connect(this);
  }

  async removeParent () {
    await this.adapter._disconnect(this);
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
