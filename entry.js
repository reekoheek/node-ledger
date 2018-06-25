class Entry {
  constructor ({ trace, code, db = 0, cr = 0 }, adapter) {
    if (!code) {
      throw new Error('Undefined account');
    }

    if ((db <= 0 && cr <= 0) || !((db <= 0 && cr > 0) || (cr <= 0 && db > 0))) {
      throw new Error('DBCR must be exclusive');
    }

    Object.defineProperties(this, {
      adapter: {
        get: () => adapter,
      },
    });

    this.trace = trace;
    this.code = code;
    this.db = db;
    this.cr = cr;
  }

  get currency () {
    if (!this.account) {
      throw new Error('Not validate yet');
    }

    return this.account.currency;
  }

  async validate () {
    let account = await this.getAccount();
    if (!account) {
      throw new Error('Invalid account');
    }
  }

  async getAccount () {
    this.account = await this.adapter.getAccount(this.code);
    return this.account;
  }
}

module.exports = { Entry };
