window.xin = {
  'customElements.version': 'v0',
  'viewLoaders': [
    { test: /^app-/, load: view => System.import('./views/' + view.name) },
  ],
};

require('xin-ui/scss/ui-reset.scss');
require('xin-ui/scss/ui-typography.scss');
require('xin-ui/scss/ui-layout.scss');
require('xin-ui/scss/ui-header.scss');
require('xin-ui/scss/ui-button.scss');
require('xin-ui/scss/ui-list.scss');

require('xin/css/layout.css');
require('material-design-icons/iconfont/material-icons.css');

require('./css/theme.css');

require('xin/components/pager');
require('xin/components/repeat');

System.import('./components/app-app');
