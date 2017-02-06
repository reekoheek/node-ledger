import xin from 'xin';
import App from 'xin/components/app';
import html from './st-app.html';

import 'xin-ui/ui-drawer';
import 'xin-connect/connect-pool';
import 'xin-connect/connect-fetch';
import 'xin-jwt/jwt-middleware';
import 'xin/middlewares/lazy-view';

class StApp extends App {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      jwtToken: {
        type: String,
        value: '',
        observer: 'jwtTokenChanged(jwtToken)',
      },
    });
  }

  jwtTokenChanged (jwtToken) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (jwtToken) {
      headers.Authorization = `Bearer ${jwtToken}`;
    }

    this.set('headers', headers);
  }

  async logoutClicked (evt) {
    evt.preventDefault();

    await window.drawer.close();

    window.jwt.signout();
  }
}

xin.define('st-app', StApp);
