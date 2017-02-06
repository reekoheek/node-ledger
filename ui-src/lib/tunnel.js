class Tunnel {
  static async get (id) {
    const response = await window.pool.fetch(`/tunnel/${id}`);
    if (!response.ok) {
      throw new Error('Response from server is not ok');
    }

    const result = await response.json();
    return new Tunnel(result.entry);
  }

  constructor (row) {
    Object.assign(this, row);
  }

  async withStatus () {
    const response = await window.pool.fetch(`/tunnel/${this.id}/status`);
    if (!response.ok) {
      throw new Error('Response from server is not ok');
    }

    const result = await response.json();
    this.status = result.status;
  }

  async start () {
    const response = await window.pool.fetch(`/tunnel/${this.id}/start`);
    if (!response.ok) {
      throw new Error('Error on starting tunnel');
    }

    this.status = true;
  }

  async stop () {
    const response = await window.pool.fetch(`/tunnel/${this.id}/stop`);
    if (!response.ok) {
      throw new Error('Error on stopping tunnel');
    }

    this.status = false;
  }

  async delete () {
    await this.withStatus();

    if (this.status) {
      throw new Error('Failed to delete running tunnel');
    }

    const response = await window.pool.fetch(`/tunnel/${this.id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Error on deleting tunnel');
    }
  }
}

export default Tunnel;
