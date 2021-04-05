const {Permissions, Collection} = require('discord.js');

module.exports = class Command {

    constructor(client, name, options = {}) {
        this.client = client;
        this.aliases = options.aliases || [];
        this.name = options.name || name;
        this.description = options.description || 'No description given';
        this.category = options.category || 'users';
        this.userPerms = new Permissions(options.userPerms).freeze();
        this.botPerms = new Permissions(options.botPerms).freeze();
        this.guildOnly = options.guildOnly || false;
        this.ownerOnly = options.ownerOnly || false;
        this.nsfw = options.nsfw || false;
        this.minArgs = options.minArgs || 0;
        this.argsDef = options.argsDef || [];
        this.additionalinfo = options.additionalinfo || "";
        this.children = client.utils.getSubCommands(name);
        this.cooldown = options.cooldown * 1000 || 0;
        this.cooldownPeople = new Collection();
    }

    async run(message, args) {
        throw new Error(`Command ${this.name} doesn't provide a run method!`);
    }

};