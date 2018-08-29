class Entry {
  constructor ({ trace, code, db = 0, cr = 0, param1, param2, param3 }, adapter) {
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
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
  }

  get currency () {
    if (!this.account) {
      throw new Error('Not validate yet');
    }

    return this.account.currency;
  }

  async validate (options) {
    let account = await this.getAccount(options);
    if (!account) {
      throw new Error(`Invalid account, ${this.code}`);
    }
  }

  async getAccount (options) {
    this.account = await this.adapter._get(this.code, options);
    return this.account;
  }
}

module.exports = { Entry };
