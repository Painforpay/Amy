const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Lädt einen Befehl neu in den Speicher',
            category: 'administration',
            userPerms: ['ADMINISTRATOR'],
            ownerOnly: true,
            minArgs: 1,
            argsDef: ['<befehlsname>']
        });
    }


    async run(message) { //, args) {

        //TODO
        /*const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`Es gibt keinen Befehl mit dem Namen \`${commandName}\`!`);
        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`Der Befehl wurde neu geladen.`);
        } catch (error) {
            console.error(error);
            message.channel.send(`Es gab einen Fehler beim neueinlesen von \`${command.name}\`:\n\`${error.message}\``);
        }//*/

    }

};
