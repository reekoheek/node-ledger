const BaseBundle = require('./base');

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
    const tx = await ctx.parse();

    return this.ledger.post(tx);
  }
}

module.exports = TransactionBundle;
