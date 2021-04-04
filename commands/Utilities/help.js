const Command = require("../../Structure/Command");
const {MessageEmbed} = require('discord.js');
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["cmds", "hilfe"],
            description: 'Zeigt die Hilfeseite an',
            category: 'utilities',
            minArgs: 0,
            argsDef: ['<befehlsname>']
        });
    }

    async run(message, args) {

        if (!args.length) {


            let embed = new MessageEmbed()
                .setAuthor("Hier findest du eine Liste mit allen wichtigen Befehlen.")
                .setDescription(`Mit ${this.client.prefix}${this.name} ${this.argsDef.join(" ")} kann mehr Information angezeigt werden!`)
                .setColor("#FFD700");

            let accessibleCommands = [];

            this.client.commands.map(x => {

                if (message.member.hasPermission(x.userPerms)) {
                    if (!x.ownerOnly) {
                        return accessibleCommands.push(x);
                    } else {
                        if (!this.client.utils.checkOwner(message.author)) return;
                        return accessibleCommands.push(x);
                    }
                }

            })


            for await (let command of accessibleCommands) {
                let name = `${this.client.prefix}${command.name}`;

                embed.addField(name, `${command.description}`);

            }


            message.channel.send({embed: embed}).then(m => {
                try {
                    m.delete({timeout: (accessibleCommands.length * 3000)})
                } catch (e) {
                    //Error
                    console.error(e);
                }

            })


        } else {


            let searchedCommand = args[0];

            const command = this.client.commands.get(searchedCommand.toLowerCase()) || this.client.commands.get(this.client.aliases.get(searchedCommand.toLowerCase()));


            if (command) {

                let embed = new MessageEmbed()
                    .setColor("#FFD700")
                    .setTitle(this.client.utils.capitalise(command.name));


                let description = `${command.description}`

                if (command.aliases.length > 0) {
                    embed.addField(`\n\n**Alternative Namen:**`, `${command.name}, ${command.aliases.join(", ")}`)
                }


                embed.addField(`**Nutzung:**`, `${this.client.prefix}${args[0]} ${command.argsDef.length > 0 ? " " + command.argsDef.join(" ") : ""}`)

                let subcommands = [];
                if (command.children.size > 0) {

                    for await (const SubCommand of command.children) {
                        subcommands.push(`${this.client.prefix}${args[0]} ${SubCommand[1].name}${SubCommand[1].argsDef ? " " + SubCommand[1].argsDef.join(" ") : ""}`);

                    }


                }

                embed.addField(`Unterbefehle: `, subcommands.join("\n") || `Dieser Befehl besitzt keine Unterbefehle.`)

                if (command.additionalinfo.length > 0) {

                    embed.setFooter(`Achtung: ` + command.additionalinfo);
                }

                embed.setDescription(description)


                message.channel.send(embed).then(m => m.delete({timeout: 15000}).catch(() => null));

            } else {
                message.channel.send(`Dieser Befehl konnte nicht gefunden werden!`).then(m => m.delete({timeout: 15000}).catch(() => null));
            }

        }

        try {
            message.delete({timeout: 15000})
        } catch (e) {
            //Error
            console.error(e);
        }

    }
}
