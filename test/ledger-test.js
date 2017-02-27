/* globals describe it beforeEach */

const assert = require('assert');
const Ledger = require('../');
const Account = require('../account');
const Transaction = require('../transaction');
const simple = require('../coa/simple.json');

describe('Ledger', () => {
  describe('=> before initialized', () => {
    describe('constructor', () => {
      it('set prefix and manager from config', () => {
        let prefix = 'foo_';
        let connections = [ { name: 'foo' } ];
        let ledger = new Ledger({ connections, prefix });
        assert.strictEqual(ledger.manager.main, 'foo');
        assert.strictEqual(ledger.prefix, 'foo_');
      });
    });

    describe('#initAccounts()', () => {
      it('init tree accounts', async () => {
        let ledger = new Ledger();
        let { manager } = ledger;
        await ledger.initAccounts(simple);
        let accounts = await manager.factory('account').all();

        assert.strictEqual(accounts.find(account => account.code === '1000').name, 'Aktiva');
        assert.strictEqual(accounts.find(account => account.code === '1002').parent, '1000');
        assert.strictEqual(accounts.find(account => account.code === '4000').cname, 'income');
      });
    });
  });

  describe('=> after initialized', () => {
    let ledger;

    beforeEach(async () => {
      ledger = new Ledger();
      await ledger.initAccounts(simple);
    });

    describe('#getAccounts()', () => {
      it('get all accounts', async () => {
        let accounts = await ledger.getAccounts();
        assert.strictEqual(accounts.length, 7);
      });
    });

    describe('#getAccount()', () => {
      it('get account by its code', async () => {
        let account = await ledger.getAccount('5000');
        assert.strictEqual(account.name, 'Beban');
      });
    });

    describe('#kindOf()', () => {
      it('get kind of default class name', () => {
        assert.strictEqual(ledger.kindOf('asset'), 'debit');
        assert.strictEqual(ledger.kindOf('liability'), 'credit');
        assert.strictEqual(ledger.kindOf('equity'), 'credit');
        assert.strictEqual(ledger.kindOf('income'), 'credit');
        assert.strictEqual(ledger.kindOf('expense'), 'debit');
      });
    });

    describe('#newAccount()', () => {
      it('return new detached account instance', () => {
        let account = ledger.newAccount();
        assert(account instanceof Account);
      });
    });

    describe('#newTransaction()', () => {
      it('return new detached transaction instance', () => {
        let transaction = ledger.newTransaction();
        assert(transaction instanceof Transaction);
      });
    });

    describe('#post()', () => {
      it('save new transaction', async () => {
        let oldSave = Transaction.prototype.save;
        Transaction.prototype.save = () => 'mocked';
        let result = await ledger.post();
        assert.strictEqual(result, 'mocked');
        Transaction.prototype.save = oldSave;
      });

      it('post new transaction', async () => {
        let tx = await ledger.post({
          date: new Date(),
          entries: [
            { code: '1001', debit: 10000 },
            { code: '3000', credit: 10000 },
          ],
        });

        assert(tx instanceof Transaction);

        let transactions = await ledger.manager.factory('transaction').all();
        assert.strictEqual(transactions.find(tx => tx.code === '1001').debit, 10000);
        assert.strictEqual(transactions.find(tx => tx.code === '3000').credit, 10000);
      });
    });
  });
});
