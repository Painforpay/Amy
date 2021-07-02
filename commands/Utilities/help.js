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


            message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));


        if (!args.length) {


            let embed = new MessageEmbed()
                .setColor("#FFD700")
                .setTitle(`:question: Hilfe`)
                .setDescription(`Hier findest du eine Liste aller Befehlskategorien!\nGebe \`${this.client.prefix}${this.name} <kategorie>\` ein um alle Befehle dieser Kategorie zu sehen!\n**Alternativ** kannst du mit \`${this.client.prefix}${this.name} <befehl>\` mehr Informationen zu einem Befehl erhalten.`);

            for await (let category of this.client.categories) {
                embed.addField(`${category[1].emoji} ${this.client.utils.capitalise(category[1].name)}`, `**${category[1].description}**`)
            }

            embed.setFooter(`Beispiel: !help ${this.client.categories.first().name} bzw. !help ${this.client.commands.last().name} ${this.client.isBeta ? `| Beta v${this.client.version}` : ""}`);

            message.channel.send(embed).then(m => m.delete({timeout: 30000})).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));


        } else {


            let searchQuery = args[0];

            const result = this.client.categories.get(searchQuery.toLowerCase()) || this.client.commands.get(searchQuery.toLowerCase()) || this.client.commands.get(this.client.aliases.get(searchQuery.toLowerCase()));

            if (!result) return message.channel.send(`Diese Suche hat kein Ergebnis geliefert!`).then(m => m.delete({timeout: 30000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));

            if (result instanceof Command) {


                if (result) {

                    let embed = new MessageEmbed()
                        .setColor("#FFD700")
                        .setTitle(this.client.utils.capitalise(result.name));


                    let description = `${result.description}`

                    embed.addField(`**Kategorie:**`, `${this.client.utils.capitalise(result.category)}`)

                    if (result.aliases.length > 0) {
                        embed.addField(`**Alternative Namen:**`, `${result.name}, ${result.aliases.join(", ")}`)
                    }


                    embed.addField(`**Nutzung:**`, `${this.client.prefix}${args[0]} ${result.argsDef.length > 0 ? " " + result.argsDef.join(" ") : ""}`)

                    let subcommands = [];
                    if (result.children.size > 0) {

                        for await (const SubCommand of result.children) {
                            subcommands.push(`${this.client.prefix}${args[0]} ${SubCommand[1].name}${SubCommand[1].argsDef ? " " + SubCommand[1].argsDef.join(" ") : ""}`);

                        }


                    }

                    if(subcommands.length > 0) {
                        embed.addField(`Unterbefehle: `, subcommands.join("\n"));
                    }

                    if (result.additionalinfo.length > 0) {

                        embed.setFooter(`Achtung: ` + result.additionalinfo);

                    }

                    embed.setDescription(description)


                    message.channel.send(embed).then(m => m.delete({timeout: 30000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));

                }


            } else {
                //Category searched

                let embed = new MessageEmbed()
                    .setTitle(`${result.emoji} ${this.client.utils.capitalise(result.name)}`)
                    .setColor("#FFD700")
                    .setDescription(result.description);


                let accessibleCommands = [];

                this.client.commands.map(x => {

                    if (message.member.hasPermission(x.userPerms)) {
                        if (x.category !== result.name) return; //TODO

                        if (!x.ownerOnly) {
                            return accessibleCommands.push(x);
                        } else {
                            if (!this.client.utils.checkOwner(message.author)) return;
                            return accessibleCommands.push(x);
                        }
                    }

                })


                if (!accessibleCommands.length > 0) {

                    embed.addField("Fehler!", "Es gibt keine Befehle für diese Kategorie oder du kannst keine von ihnen nutzen!")


                }

                for await (let command of accessibleCommands) {
                    let name = `${this.client.prefix}${command.name}`;

                    embed.addField(name, `${command.description}`);

                }


                message.channel.send({embed: embed}).then(m => {

                        m.delete({timeout: (30000)}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));


                })


            }
        }


    }
}
