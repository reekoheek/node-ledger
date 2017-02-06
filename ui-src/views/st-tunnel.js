import xin from 'xin';
import View from 'xin/components/view';
import html from './st-tunnel.html';
import UISnackbar from 'xin-ui/ui-snackbar';
import Tunnel from '../lib/tunnel';
import Server from '../lib/server';

import 'xin-ui/ui-form';
import 'xin-ui/ui-textfield';
import 'xin-ui/ui-selectfield';

class StTunnel extends View {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      tunnel: {
        type: Array,
      },

      serverOptions: {
        type: Array,
      },
    });
  }

  focused () {
    super.focused();

    (async () => {
      let [ servers, tunnel ] = await Promise.all([
        Server.all(),
        this.parameters.id ? Tunnel.get(this.parameters.id) : {},
      ]);

      if (tunnel.withStatus) {
        await tunnel.withStatus();
      }

      this.set('tunnel', tunnel);
      this.set('serverOptions', servers.map(server => ({ label: server.name, value: server.id })));
    })();
  }

  computeServerUrl (id) {
    return `#!/tunnel/${id}`;
  }

  async submitted (evt) {
    evt.preventDefault();

    let body = JSON.stringify(this.tunnel);
    let url = '/tunnel';
    let method = 'POST';
    if (this.parameters.id) {
      url = `/tunnel/${this.parameters.id}`;
      method = 'PUT';
    }

    const response = await window.pool.fetch(url, { method, body });
    if (!response.ok) {
      await UISnackbar.show({ message: 'Error on saving record' });
      return;
    }

    await UISnackbar.show({ message: 'Record saved' });
    this.__app.navigate('/');
  }

  async deleteClicked (evt) {
    try {
      await this.tunnel.delete();

      await UISnackbar.show({ message: 'Record deleted' });
      this.__app.navigate('/');
    } catch (err) {
      console.error(err);
      await UISnackbar.show({ message: err.message });
    }
  }

  async startClicked (evt) {
    try {
      await this.tunnel.start();

      this.notify('tunnel');

      await UISnackbar.show({ message: 'Record started' });
    } catch (err) {
      console.error(err);
      await UISnackbar.show({ message: err.message });
    }
  }

  async stopClicked (evt) {
    try {
      await this.tunnel.stop();

      this.notify('tunnel');

      await UISnackbar.show({ message: 'Record stopped' });
    } catch (err) {
      console.error(err);
      await UISnackbar.show({ message: err.message });
    }
  }
}

xin.define('st-tunnel', StTunnel);
