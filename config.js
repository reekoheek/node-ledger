const NString = require('node-norm/schema/nstring');
const NReference = require('node-norm/schema/nreference');
const NInteger = require('node-norm/schema/ninteger');
const NBoolean = require('node-norm/schema/nboolean');

const conf = {
  development: {
    secret: 'please replace this',
    connections: [
      {
        name: 'default',
        adapter: 'disk',
        file: process.env.ACCOUNT_DB,
        schemas: [
          {
            name: 'account',
            fields: {
              name: new NString('name').filter('required'),
              server: new NReference('server').to('server').filter('required'),
              port: new NInteger('port'),
              bind: new NString('bind'),
              autostart: new NBoolean('autostart'),
            },
          },
        ],
      },
    ],
  },
};

module.exports = function () {
  return conf[process.env.BONO_ENV || 'development'];
};
