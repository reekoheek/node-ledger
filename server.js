const http = require('http');
const Bundle = require('bono/bundle');
const AccountBundle = require('./bundles/account');
const TransactionBundle = require('./bundles/transaction');
const config = require('./config')();
const Ledger = require('./');

const PORT = process.env.PORT || 3000;

const app = new Bundle();

const ledger = new Ledger(config);

app.use(require('kcors')());
// app.use(require('../middlewares/ping')());
// app.use(require('koa-jwt')(config.secret));
app.use(require('bono/middlewares/json')());

app.bundle('/api/account', new AccountBundle({ ledger }));
app.bundle('/api/transaction', new TransactionBundle({ ledger }));

app.get('/', ctx => ctx.redirect('/ui/'));

const server = http.Server(app.callback());
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
