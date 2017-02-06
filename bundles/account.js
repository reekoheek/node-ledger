const BaseBundle = require('./base');
const parse = require('co-body');

class AccountBundle extends BaseBundle {
  constructor (config) {
    super(config);

    this.get('/', this.index.bind(this));
    this.get('/{id}/transaction', this.transaction.bind(this));
    this.post('/null/init', this.init.bind(this));
  }

  index (ctx) {
    return this.ledger.all();
  }

  async transaction (ctx) {
    return await this.ledger.getTransactions(ctx.parameters.id);
  }

  async init (ctx) {
    const coa = await parse.json(ctx);
    return this.ledger.init(coa);
  }
}

module.exports = AccountBundle;
