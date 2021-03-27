const Command = require("../../Structure/Command");
const {MessageEmbed} = require('discord.js');
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Zeigt diese Hilfeseite an',
            category: 'utilities',
            minArgs: 0,
            argsDef: ['Befehlsname']
        });
    }

    async run(message, args) {

        if(!args.length) {


            let embed = new MessageEmbed()
                .setAuthor("Hier findest du eine Liste mit allen wichtigen Befehlen.")
                .setColor("#FFD700");

            let accessibleCommands = [];

            this.client.commands.map(x => {

                if(message.member.hasPermission(x.userPerms)) {

                    accessibleCommands.push(x);

                }

            })


            for await (let command of accessibleCommands) {

                embed.addField(`${this.client.prefix}${command.name}`, `${command.description}`);

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

            const command = this.client.commands.get(searchedCommand.toLowerCase());


            if (command) {

                let embed = new MessageEmbed()
                    .setTitle(command.name);


                let description = [`**${command.description}**`]

                if(command.children.size > 0) {
                    description.push(`Unterbefehle:`)
                    for await (const SubCommand of command.children) {

                        description.push(`${this.client.prefix}${command.name} ${SubCommand[1].name}${SubCommand[1].argsDef ? " " + SubCommand[1].argsDef.join(" ") : ""}`)
                        console.log(SubCommand[1])

                    }
                } else {
                    description.push(`Dieser Befehl besitzt keine Unterbefehle.`)
                }




                embed.setDescription(description.join("\n"))


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
