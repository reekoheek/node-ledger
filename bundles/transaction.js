const BaseBundle = require('./base');
const parse = require('co-body');

class TransactionBundle extends BaseBundle {
  constructor (config) {
    super(config);

    this.get('/', this.index.bind(this));
    this.post('/', this.create.bind(this));
  }

  async index (ctx) {
    return await this.ledger.getTransactions();
  }

  async create (ctx) {
    const tx = await parse.json(ctx);

    return this.ledger.post(tx);
  }
}

module.exports = TransactionBundle;
