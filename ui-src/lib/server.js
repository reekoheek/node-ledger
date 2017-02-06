class Server {
  static async all () {
    if (!Server.cache) {
      const response = await window.pool.fetch(`/server`);
      if (!response.ok) {
        throw new Error('Error response from server');
      }

      const result = await response.json();
      Server.cache = result.entries.map(server => new Server(server));
    }

    return Server.cache;
  }

  constructor (row) {
    Object.assign(this, row);
  }
}

export default Server;
