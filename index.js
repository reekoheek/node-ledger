const Manager = require('node-norm');
const Account = require('./account');
const Transaction = require('./transaction');

/**
 * Ledger
 */
class Ledger {
  constructor ({ manager, connections, prefix = '', classes } = {}) {
    this.prefix = prefix;
    this.manager = manager || new Manager({ connections });
    this.classes = Object.assign({
      asset: 'debit',
      liability: 'credit',
      equity: 'credit',
      income: 'credit',
      expense: 'debit',
    }, classes);
  }

  /**
   * Initialize all accounts
   * CoA signature: [ { code, name, cname, kind, parent? } ]
   * @param {object} coa  Nested list of accounts
   * @return {Promise<void>}
   */
  async initAccounts (coa) {
    await this._rawFind('account').delete();

    await Promise.all(coa.map(account => this._populateAccount(account)));
  }

  /**
   * Get all accounts
   * @return {Promise<array>} List of accounts
   */
  async getAccounts () {
    let rows = await this._rawFind('account').sort({ code: 1 }).all();
    return rows.map(row => new Account(this, row));
  }

  /**
   * Get account by its code
   * @param  {string} code      Account code
   * @return {Promise<Account>} Instance of account
   */
  async getAccount (code) {
    let row = await this._rawFind('account', { code }).single();
    if (!row) {
      return;
    }

    return new Account(this, row);
  }

  /**
   * Get kind value of class name
   * @param   {string} className  Class name
   * @return  {string}            Kind value
   *
   */
  kindOf (className) {
    let kind = this.classes[className];
    if (!kind) {
      throw new Error(`Unknown account class '$className'`);
    }
    return kind;
  }

  /**
   * Create new account
   * Row signature: { code, name, cname, kind, parent? }
   * @param   {object} row  Initial object to populate
   * @return  {Account}     New account
   */
  newAccount (row) {
    return new Account(this, row);
  }

  /**
   * Create new transaction
   * Row signature: { }
   * @param   {object} row  Initial object to populate
   * @return  {Transaction} New transaction
   */
  newTransaction (row) {
    return new Transaction(this, row);
  }

  /**
   * Post new transaction by initial object to populate as transaction
   * @param   {object} row            Initial object to populate
   * @return  {Promise<Transaction>}  Transaction saved
   */
  async post (row) {
    let tx = this.newTransaction(row);

    return await tx.save();
  }

  /**
   * Get all transactions
   * @param   {string} code     Account code
   * @return  {Promise<array>}  List of transactions
   */
  async getTransactions (code) {
    let txs;
    if (code) {
      txs = await this._rawFind('transaction', { code }).all();
    } else {
      txs = await this._rawFind('transaction').all();
    }

    return txs;
  }

  async _populateAccount (account, parentAccount) {
    let { code, cname = parentAccount.cname, name, children = [] } = account;
    let parent = parentAccount ? parentAccount.code : null;
    let [ insertedAccount ] = await this._rawFind('account').insert({ code, cname, name, parent }).save();

    await Promise.all(children.map(childAccount => this._populateAccount(childAccount, insertedAccount)));
  }

  _rawFind (name, opts) {
    return this.manager.factory(`${this.prefix}${name}`).find(opts);
  }
}

module.exports = Ledger;
