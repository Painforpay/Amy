const {Permissions} = require('discord.js');

module.exports = class SubCommand {

    constructor(client, name, options = {}) {
        this.client = client;
        this.name = options.name || name;
        this.description = options.description || 'Keine Beschreibung gegeben.';
        this.category = options.category || 'General';
        this.userPerms = new Permissions(options.userPerms).freeze();
        this.botPerms = new Permissions(options.botPerms).freeze();
        this.parent = options.parent || '';
        this.minArgs = options.minArgs || 0;
        this.argsDef = options.argsDef || [];

    }

    async run(message, args) {
        throw new Error(`Command ${this.name} doesn't provide a run method!`);
    }

};