// noinspection JSUnusedLocalSymbols
module.exports = class Event {

    constructor(client, name, options = {}) {
        this.name = name;
        this.client = client;
        this.type = options.once ? 'once' : 'on';
        this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;
        this.con = client.con;

    }

    // eslint-disable-next-line no-unused-vars
    async run(...args) {
        throw new Error(`Die run Methode wurde in ${this.name} noch nicht implementiert.`);
    }

};
