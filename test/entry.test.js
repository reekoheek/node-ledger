const assert = require('assert');
const { Entry } = require('../entry');
const Memory = require('../adapters/memory');

describe('Entry', () => {
  let adapter;
  beforeEach(() => {
    adapter = new Memory();
  });

  describe('constructor', () => {
    it('define account code', () => {
      try {
        let entry = new Entry({ db: 100 });
        assert(entry instanceof Entry);
        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/Undefined account/)) {
          throw err;
        }
      }
    });

    it('define db or cr only', () => {
      let entry;

      try {
        entry = new Entry({ code: 'notfound', db: 0, cr: 0 });
        entry = new Entry({ code: 'notfound', db: 10, cr: 10 });
        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/DBCR must be exclusive/)) {
          throw err;
        }
      }

      entry = new Entry({ code: 'notfound', db: 10 });
      entry = new Entry({ code: 'notfound', cr: 10 });
      entry = new Entry({ code: 'notfound', db: 10, cr: 0 });
      assert(entry instanceof Entry);
    });
  });

  describe('#validate()', () => {
    it('validate has valid account', async () => {
      adapter.accounts.push({ code: 'bank' });

      let entry = new Entry({ code: 'cash', db: 10 }, adapter);
      try {
        await entry.validate();
        throw new Error('Assert error: No error');
      } catch (err) {
        if (!err.message.match(/Invalid account/)) {
          throw err;
        }
      }

      entry = new Entry({ code: 'bank', db: 10 }, adapter);
      await entry.validate();
    });
  });
});
