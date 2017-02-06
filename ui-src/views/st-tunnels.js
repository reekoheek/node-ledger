import xin from 'xin';
import View from 'xin/components/view';

import html from './st-tunnels.html';

class StTunnels extends View {
  get template () {
    return html;
  }

  focused () {
    super.focused();

    (async () => {
      const response = await window.pool.fetch('/tunnel');
      if (!response.ok) {
        console.error('Response from server is not ok');
        return;
      }

      const data = await response.json();
      console.log(data);
      this.set('tunnels', data.entries);
    })();
  }

  computeTunnelUrl (id) {
    return `#!/tunnel/${id}`;
  }
}

xin.define('st-tunnels', StTunnels);
