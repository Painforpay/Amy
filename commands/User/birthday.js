const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["bday", "bd", "gb"],
            description: 'Verwaltet deinen Geburtstag',
            category: 'user',
            minArgs: 1,

        });
    }


    async run(message, args) {
        let subCommand = args[0];
        const command = this.client.subCommands.get(subCommand.toLowerCase());


        if (command && command.parent === this.name) {
            let cutArgs = args.slice(1);
            if (command.minArgs && cutArgs < command.minArgs) {
                message.channel.send(`Entschuldige, aber es werden mehr Argumente benötigt - Angegeben: ${args.length}, Benötigt: ${command.minArgs + 1}\nNutzung: \`${this.client.prefix}${this.name} ${command.name} ${command.argsDef.join(" ")}\``).then(m => {
                    m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                });
                return message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            }
            command.run(message, cutArgs);
        } else {
            return message.channel.send((await this.client.utils.handleWrongInput(args[0], this)))
        }

    }
}