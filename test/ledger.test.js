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

  describe('#init()', () => {
    it('initialize with empty chart of accounts', async () => {
      let ledger = new Ledger();
      await ledger.init();

      assert(ledger.initialized);
      let children = await ledger.getChildren();
      assert.equal(children.length, 0);
    });

    it('initialize with chart of accounts', async () => {
      let ledger = new Ledger();
      await ledger.init([
        {
          code: 'assets',
          children: [
            { code: 'assets:cash', currency: 'IDR' },
            { code: 'assets:bank', currency: 'IDR' },
          ],
        },
        { code: 'equity' },
      ]);

      let children = await ledger.getChildren();
      assert.equal(children.length, 4);
    });
  });

  describe('#destroy()', () => {
    it('destroy root account', async () => {
      let ledger = new Ledger();
      await ledger.init();

      await ledger.destroy();
      assert(!ledger.initialized);
    });
  });

  describe('#post()', () => {
    it('post new transaction', async () => {
      let ledger = new Ledger();
      await ledger.init([
        { code: 'cash' },
        { code: 'equity' },
      ]);

      await ledger.post({
        entries: [
          { code: 'cash', db: 100 },
          { code: 'equity', cr: 100 },
        ],
      });

      assert.equal(ledger.adapter.txs.length, 1);
      assert.equal(ledger.adapter.entries.length, 2);
    });
  });

  describe('#getAccount()', () => {
    it('return account by code', async () => {
      let ledger = new Ledger();

      await ledger.init([
        { code: 'asset', children: [ { code: 'bank' } ] },
        { code: 'equity' },
        { code: 'expenses' },
      ]);

      let bankAccount = await ledger.getAccount('bank');
      assert.equal(bankAccount.code, 'bank');
    });
  });

  describe('#getTransactions()', () => {
    it('return all transactions', async () => {
      let ledger = new Ledger();

      await ledger.init([
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

      let txs = await ledger.getTransactions();
      assert.equal(txs.length, 3);
      assert.equal(txs[0].entries.length, 2);
    });
  });
});
