# node-ledger

## Norm configuration

```javascript
{
  connections: [
    {
      ...
      schemas: [
        {
          name: 'account',
          fields: [
            new NString('code').filter('required'),
            new NString('name').filter('required'),
            new NString('cname').filter('required'),
            new NString('kind').filter('required'),
            new NString('parent').filter('required'),
            new NInteger('debit').filter('required'),
            new NInteger('credit').filter('required'),
          ],
        },
        {
          name: 'transaction',
          fields: [
            new NString('code').filter('required'),
            new NString('date').filter('required'),
            new NDatetime('created_time').filter('required'),
            new NInteger('debit').filter('required'),
            new NInteger('credit').filter('required'),
          ],
        },
      ],
    },
  ],
}
```

## API

### #initAccounts(coa)

Arguments:

- CoA `[ { code, name, cname, kind, parent? } ]`

### #getAccounts()

### #getAccount(code)

Arguments:

- code `string`

### #newAccount(row)

Arguments:

- row `{ code, name, cname, kind, parent? }`

### #newTransaction(row)

Arguments:

- row `object`

### post(row)

Arguments:

- row `object`

### getTransactions(code)

Arguments:

- code `string`
