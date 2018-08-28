const assert = require('assert');
const { Ledger } = require('../ledger');
const Memory = require('../adapters/memory');

describe('Ledger', () => {
  describe('constructor', () => {
    it('create ledger with default adapter', () => {
      let ledger = new Ledger();
      assert(ledger.adapter instanceof Memory);
    });
  });

  describe('#populate()', () => {
    it('populate with chart of accounts', async () => {
      let ledger = new Ledger();
      await ledger.populate([
        {
          code: 'assets',
          children: [
            { code: 'assets:cash', currency: 'IDR' },
            { code: 'assets:bank', currency: 'IDR' },
          ],
        },
        { code: 'equity' },
      ]);

      let account = await ledger.getAccount('assets');
      assert.strictEqual(account.name, 'assets');
    });
  });

  // describe('#destroy()', () => {
  //   it('destroy root account', async () => {
  //     let ledger = new Ledger();
  //     await ledger.populate();

  //     await ledger.destroy();
  //     assert(!ledger.initialized);
  //   });
  // });

  describe('#post()', () => {
    it('post new transaction', async () => {
      let ledger = new Ledger();
      await ledger.populate([
        { code: 'cash' },
        { code: 'equity' },
      ]);

      await ledger.post({
        entries: [
          { code: 'cash', db: 100 },
          { code: 'equity', cr: 100 },
        ],
      });

      assert.strictEqual(ledger.adapter.entries.length, 2);
    });
  });

  describe('#getAccount()', () => {
    it('return account by code', async () => {
      let ledger = new Ledger();

      await ledger.populate([
        { code: 'asset', children: [ { code: 'bank' } ] },
        { code: 'equity' },
        { code: 'expenses' },
      ]);

      let bankAccount = await ledger.getAccount('bank');
      assert.strictEqual(bankAccount.code, 'bank');
    });
  });

  describe('#getTransactions()', () => {
    it('return all transactions', async () => {
      let ledger = new Ledger();

      await ledger.populate([
        { code: 'cash' },
        { code: 'equity' },
        { code: 'expenses' },
      ]);

      await ledger.post({
        date: new Date('2018-06-23T14:38:10.614Z'),
        entries: [
          { code: 'cash', db: 100 },
          { code: 'equity', cr: 100 },
        ],
      });

      await ledger.post({
        date: new Date('2018-06-24T14:38:10.614Z'),
        entries: [
          { code: 'cash', cr: 5 },
          { code: 'expenses', db: 5 },
        ],
      });

      await ledger.post({
        date: new Date('2018-06-25T14:38:10.614Z'),
        entries: [
          { code: 'cash', cr: 10 },
          { code: 'expenses', db: 10 },
        ],
      });

      let entries = await ledger.getEntries();
      assert.strictEqual(entries.length, 6);
    });
  });
});
