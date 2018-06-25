const assert = require('assert');
const { Account } = require('../account');
const { Ledger } = require('../ledger');
const Memory = require('../adapters/memory');

describe('Account', () => {
  let adapter;
  beforeEach(() => {
    adapter = new Memory();
  });

  async function createAccount (code) {
    let parent = new Account({ code }, adapter);
    await adapter.connectAccount(parent);
    return parent;
  }

  describe('constructor', () => {
    it('define code', () => {
      let account = new Account({ code: 'asset' });
      assert.equal(account.code, 'asset');
    });
  });

  describe('#addChild()', () => {
    it('add new child account', async () => {
      let parent = await createAccount('asset');
      let child = new Account({ code: 'asset:cash' });

      await parent.addChild(child);

      assert.equal(adapter.accounts.length, 2);
    });

    it('disconnect account from earlier parent first', () => {

    });

    it('throw error on duplicate code', () => {

    });
  });

  describe('#removeChild()', () => {
    it('remove account as child', async () => {
      let parent = await createAccount('asset');
      let child = new Account({ code: 'asset:cash' });

      await parent.addChild(child);
      await parent.removeChild(child);

      assert.equal(adapter.accounts.length, 1);
    });
  });

  describe('#getParent()', () => {
    it('return null parent for stale account', async () => {
      let account = new Account({ code: 'assets' });
      account.parent = 'notfound';
      let parent = await account.getParent();
      assert(!parent);
    });
  });

  describe('#getChild()', () => {
    it('return child with code', async () => {
      let parent = await createAccount('asset');
      let child = new Account({ code: 'asset:cash' });
      await parent.addChild(child);

      let child2 = new Account({ code: 'asset:bank' });
      await parent.addChild(child2);

      let cashAccount = await parent.getChild('asset:cash');
      assert(cashAccount instanceof Account);
      assert.equal(cashAccount.code, child.code);
      assert.equal(cashAccount.parent, 'asset');

      let bankAccount = await parent.getChild('asset:bank');
      assert(bankAccount instanceof Account);
      assert.equal(bankAccount.code, child2.code);
      assert.equal(bankAccount.parent, 'asset');
    });
  });

  describe('#getChildren()', () => {
    it('return accounts', async () => {
      let parent = await createAccount('asset');
      await parent.addChild(new Account({ code: 'asset:cash' }));
      await parent.addChild(new Account({ code: 'asset:bank' }));

      let accounts = await parent.getChildren();
      assert.equal(accounts.length, 2);
    });
  });

  describe('#getTransactions()', () => {
    it('return all account transactions', async () => {
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

      let account = await ledger.getChild('equity');
      let txs = await account.getTransactions();
      assert.equal(txs.length, 1);
      assert.equal(txs[0].entries.length, 1);
    });
  });

  describe('#getBalance()', () => {
    it('return balance amount', async () => {
      adapter.entries = [
        { code: 'asset:cash', db: 100 },
        { code: 'asset:bank', db: 100 },
        { code: 'asset:bank', db: 50 },
      ];

      let parent = await createAccount('asset');
      let cash = new Account({ code: 'asset:cash' });
      await parent.addChild(cash);

      let bank = new Account({ code: 'asset:bank' });
      await parent.addChild(bank);

      assert.equal((await cash.getBalance()).db, 100);
      assert.equal((await bank.getBalance()).db, 150);
    });
  });
});
