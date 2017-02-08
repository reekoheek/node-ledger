const Base = require('./base');

class Entry extends Base {
  async lock () {
    let account = await this.$ledger.getAccount(this.code);
    if (!account) {
      throw new Error(`Account '${this.code}' not found`);
    }
  }

  async unlock () {
    let account = await this.$ledger.getAccount(this.code);

    await account.putEntry(this).save();

    this.balance = account.balance;
  }
}

module.exports = Entry;
