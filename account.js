const Base = require('./base');
const LedgerError = require('./error');

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

    if (!this.code) throw new LedgerError('Code is required');
    if (!this.name) throw new LedgerError('Name is required');
    if (!this.cname) throw new LedgerError('CName is required');

    this.kind = this.$ledger.kindOf(this.cname);

    if (this.id) {
      let { affected } = await this.$ledger._rawFind('account', { id: this.id }).set(this).save();
      return affected > 0;
    }

    let { inserted, rows: [ row ] } = await this.$ledger._rawFind('account').insert(this).save();
    if (inserted > 0) {
      this.sync(row);
      return true;
    }

    return false;
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
