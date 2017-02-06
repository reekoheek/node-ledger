import xin from 'xin';
import View from 'xin/components/view';

import html from './st-servers.html';

class StServers extends View {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      servers: {
        type: Array,
      },
    });
  }

  focused () {
    super.focused();

    (async () => {
      const response = await window.pool.fetch('/server');
      if (!response.ok) {
        console.error('Response from server is not ok');
        return;
      }

      const data = await response.json();
      console.log(data);
      this.set('servers', data.entries);
    })();
  }

  computeServerUrl (id) {
    return `#!/server/${id}`;
  }
}

xin.define('st-servers', StServers);
