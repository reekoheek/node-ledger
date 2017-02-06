const Bundle = require('bono/bundle');
const Ledger = require('../');

class BaseBundle extends Bundle {
  constructor ({ ledger, connections } = {}) {
    super();

    this.ledger = ledger || new Ledger({ connections });
  }
}

module.exports = BaseBundle;
