const Base = require('./base');
const assert = require('assert');

/**
 * Account
 * Signature: [ { code, cname, name, kind, parent? } ]
 */
class Account extends Base {
  get balance () {
    return this[this.kind] | 0;
  }

  async save () {
    if (this.parent) {
      let parent = await this.$ledger._rawFind('account', { code: this.parent }).single();
      if (parent) {
        this.cname = parent.cname;
      } else {
        this.parent = undefined;
      }
    }

    assert(this.code, 'Code is required');
    assert(this.name, 'Name is required');
    assert(this.cname, 'CName is required');

    this.kind = this.$ledger.kindOf(this.cname);

    if (!this.id) {
      let [ result ] = await this.$ledger._rawFind('account').insert(this).save();

      this.sync(result);
    } else {
      await this.$ledger._rawFind('account', { id: this.id }).set(this).save();
    }
  }

  putEntry (entry) {
    if (this.kind === 'credit') {
      this[this.kind] = this.balance + (entry.credit | 0) - (entry.debit | 0);
    } else {
      this[this.kind] = this.balance + (entry.debit | 0) - (entry.credit | 0);
    }

    return this;
  }
}

module.exports = Account;
