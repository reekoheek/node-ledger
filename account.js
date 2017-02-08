const Base = require('./base');

/**
 * Account
 *
 * Properties:
 * - code
 * - cname
 * - name
 * - parent
 */
class Account extends Base {
  get balance () {
    return this[this.kind] | 0;
  }

  async save () {
    if (!this.id) {
      if (this.parent) {
        let parent = await this.$ledger._rawFind('account', { code: this.parent }).single();
        if (parent) {
          this.cname = parent.cname;
        } else {
          this.parent = undefined;
        }
      }

      this.kind = this.$ledger.kindOf(this.cname);

      let [ result ] = await this.$ledger._rawFind('account').insert(this).save();

      this.sync(result);
    } else {
      let [ result ] = await this.$ledger._rawFind('account', { id: this.id }).set(this).save();

      this.sync(result);
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
