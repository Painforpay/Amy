const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['rl'],
            description: 'lädt einen Command neu',
            category: 'Debug',
            usage: `[cmdName]`,
            userPerms: ['ADMINISTRATOR'],
            guildOnly: false,
            ownerOnly: true,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {

        if (!args.length) return message.channel.send(`Bitte gib einen Befehl zum neuladen ein!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`Es gibt keinen Befehl mit dem Namen \`${commandName}\`!`);
        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`Der Befehl wurde neu geladen.`);
        } catch (error) {
            console.error(error);
            message.channel.send(`Es gab einen Fehler beim reloaded von \`${command.name}\`:\n\`${error.message}\``);
        }

    }

};
