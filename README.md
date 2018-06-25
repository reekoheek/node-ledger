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

  await ledger.init([
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
  let txs = await bank.getTransactions();

  // Get all transactions happened in your business
  let txs = await ledger.getTransactions();
})();
```

## API

### Ledger

`Ledger` is the main class you would use. Ledger is a root account (extended from
`Account`), so methods apply to account are apply to this class also.

`Ledger({ adapter = new Memory() } = {})`

`async Ledger#init (coa = [])`

`async Ledger#post ({ date = new Date(), desc = '', entries = [] })`

`async Ledger#getAccount (code)`

`async Ledger#getTransactions ()`

`Ledger` implement `#getTransactions()` differently from `Account`. Method will
return all transactions happened.

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

`#connectAccount ({ code, currency, parent })`

`#disconnectAccount ({ code })`

`#getAccount (code)`

`#getAccountsByParent (parent)`

`#post ({ trace, posted, date, desc, entries })`

`#getTransactions ({ code } = {})`

`#getBalance (code)`
