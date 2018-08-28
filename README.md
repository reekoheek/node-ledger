# node-ledger

Simple library to work with accounting ledger.

## Features

- Adapters
- Double entry
- Multi currencies

## Quickstart

```js
const { Ledger } = require('node-ledger')

(async () => {
  let ledger = new Ledger(); // default using Memory adapter

  await ledger.populate([
    {
      code: 'assets',
      children: [
        { code: 'assets:cash', currency: 'USD' },
        { code: 'assets:bank', currency: 'USD' },
      ],
    },
    {
      code: 'equity',
      children: [
        { code: 'equity:initial', currency: 'USD' },
      ],
    },
    {
      code: 'liabilities',
      children: [
        { code: 'liabilities:debt', currency: 'USD' },
      ],
    },
    {
      code: 'income',
      children: [
        { code: 'income:trading', currency: 'USD' },
      ],
    },
    {
      code: 'expenses',
      children: [
        { code: 'expenses:purchasing', currency: 'USD' },
      ],
    },
  ]);

  // Got initial capital for your business
  await ledger.post({
    date: new Date(),
    desc: 'Initial capital',
    entries: [
      { code: 'assets:bank', db: 1000 },
      { code: 'equity:initial', cr: 1000 },
    ],
  });

  // Purchasing items
  await ledger.post({
    date: new Date(),
    desc: 'Purchase items',
    entries: [
      { code: 'liability:debt', cr: 150 },
      { code: 'expenses:purchasing', db: 150 },
    ],
  });

  // Get bank account
  let bank = await ledger.getAccount('assets:bank');

  // Get bank balance
  let { db, cr } = await bank.getBalance();

  // Get transactions of bank
  let entries = await bank.getEntries();

  // Get all transactions happened in your business
  let entries = await ledger.getEntries();
})();
```

## API

### Ledger

`Ledger` is the main class you would use. Ledger is a root account (extended from
`Account`), so methods apply to account are apply to this class also.

`Ledger({ adapter = new Memory() } = {})`

`async Ledger#init (coa = [])`

`async Ledger#post ({ date = new Date(), posted, desc = '', entries = [ { code, db, cr } ] })`

`async Ledger#getAccount (code)`

`async Ledger#getEntries ()`

`Ledger` implement `#getEntries()` differently from `Account`. Method will
return all entries happened.

### Account

`Account({ code, currency = '', parent } = {})`

`async Account#addChild (account)`

`async Account#removeChild (account)`

`async Account#getParent ()`

`async Account#getChild (code)`

`async Account#getChildren ()`

`async Account#getTransactions ()`

`async Account#getBalance ()`

## How to create adapter

Implement class with several methods as follow:

`#_connect ({ code, currency, parent })`

`#_disconnect ({ code })`

`#_get (code)`

`#_findByParent (parent)`

`#_post ({ trace, posted, date, desc, entries })`

`#_transactions ({ code } = {})`

`#_balance (code)`
