const Command = require("../../Structure/Command");
const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Verwaltet deinen Geburtstag',
            category: 'user',
            minArgs: 1,

        });
    }


    async run(message, args) {




        let subCommand = args[0];
        const command = this.client.subCommands.get(subCommand.toLowerCase());


        if (command) {
            let cutArgs = args.slice(1);
            if (command.minArgs && cutArgs < command.minArgs) {
                message.channel.send(`Entschuldige, aber es werden mehr Argumente benötigt - Angegeben: ${args.length}, Benötigt: ${command.minArgs+1}\nNutzung: \`${this.client.prefix}${this.name} ${command.name} ${command.argsDef.join(" ")}\``).then(m => {
                    m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                });
                return message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            }
            command.run(message, cutArgs);
        } else {
            return message.channel.send((await this.client.utils.handleWrongInput(args[0], this)))
        }












        if (!args.length) return message.channel.send(`Bitte gib deinen Geburtstag im Format TT.MM ein!`);

        message.delete();
        switch (args[0]) {
            case "list": {
                return this.client.utils.birthdayembed(message);
            }
            case "set": {

            }
                break;
            default: {
                return message.channel.send("Dieser Unterbefehl existiert nicht. Bitte nutze \`!bd list\` oder \`!bday set\`").then(m => {
                    try {
                        m.delete({timeout: 10000});
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });
            }
        }
    }
}