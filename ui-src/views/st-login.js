import xin from 'xin';
import View from 'xin/components/view';
import html from './st-login.html';

import 'xin-ui/ui-textfield';

class StLogin extends View {
  get props () {
    return Object.assign({}, super.props, {
      form: {
        type: Object,
        value: () => ({}),
      },
    });
  }
  get template () {
    return html;
  }

  async submitted (evt) {
    evt.preventDefault();

    try {
      await window.jwt.signin(this.form);

      this.__app.navigate('/');
    } catch (err) {
      console.error(err);
    }
  }
}

xin.define('st-login', StLogin);
