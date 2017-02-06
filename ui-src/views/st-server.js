import xin from 'xin';
import View from 'xin/components/view';
import html from './st-server.html';
import UISnackbar from 'xin-ui/ui-snackbar';

import 'xin-ui/ui-form';
import 'xin-ui/ui-textfield';

class StServer extends View {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      server: {
        type: Array,
      },
    });
  }

  focused () {
    super.focused();

    if (!this.parameters.id) {
      this.set('server', {});
      return;
    }

    (async () => {
      const response = await window.pool.fetch(`/server/${this.parameters.id}`);
      if (!response.ok) {
        console.error('Response from server is not ok');
        return;
      }

      const result = await response.json();
      this.set('server', result.entry);
    })();
  }

  computeServerUrl (id) {
    return `#!/server/${id}`;
  }

  async submitted (evt) {
    evt.preventDefault();

    let body = JSON.stringify(this.server);
    let url = '/server';
    let method = 'POST';
    if (this.parameters.id) {
      url = `/server/${this.parameters.id}`;
      method = 'PUT';
    }

    const response = await window.pool.fetch(url, { method, body });
    if (!response.ok) {
      await UISnackbar.show({ message: 'Error on saving record' });
      return;
    }

    await UISnackbar.show({ message: 'Record saved' });
    this.__app.navigate('/server');
  }

  async deleteClicked (evt) {
    const response = await window.pool.fetch(`/server/${this.parameters.id}`, { method: 'DELETE' });
    if (!response.ok) {
      await UISnackbar.show({ message: 'Error on deleting record' });
      return;
    }

    await UISnackbar.show({ message: 'Record deleted' });
    this.__app.navigate('/server');
  }
}

xin.define('st-server', StServer);
