const assert = require('assert');
const { Transaction } = require('../transaction');
const Memory = require('../adapters/memory');

describe('Transaction', () => {
  let adapter;
  beforeEach(() => {
    adapter = new Memory();
  });

  describe('constructor', () => {
    it('define default date as now and empty desc', () => {
      let now = new Date();
      let tx = new Transaction();

      assert(tx.date instanceof Date);
      assert(Math.abs(tx.date - now) <= 1);
    });

    it('define data from specified object', () => {
      let date = new Date();
      let desc = 'foo';
      let tx = new Transaction({ date, desc });
      assert.strictEqual(date, tx.date);
      assert.strictEqual(desc, tx.desc);
    });
  });

  describe('#validate()', () => {
    it('validate has entries', async () => {
      let tx = new Transaction();

      try {
        await tx.validate();
        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/Invalid entries/)) {
          throw err;
        }
      }
    });

    it('validate each entry has valid account', async () => {
      let tx = new Transaction({
        entries: [
          { code: 'cash', db: 100 },
          { code: 'income', cr: 100 },
        ],
      }, adapter);

      try {
        await tx.validate();

        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/Invalid account/)) {
          throw err;
        }
      }
    });

    it('validate entries balance', async () => {
      adapter.accounts.push({ code: 'cash', currency: 'IDR' });
      adapter.accounts.push({ code: 'income', currency: 'IDR' });

      let tx = new Transaction({
        entries: [
          { code: 'cash', db: 100 },
          { code: 'income', cr: 10 },
        ],
      }, adapter);

      try {
        await tx.validate();
        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/Imbalance DBCR/)) {
          throw err;
        }
      }
    });
  });
});
