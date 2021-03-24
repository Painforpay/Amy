const Command = require("../Structure/Command");
const {MessageEmbed} = require('discord.js');
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["hilfe", "guide"],
            description: 'zeigt die Hilfeseite an',
            category: 'utility',
            usage: '[cmdName]',
            guildOnly: false,
            ownerOnly: false,
            nsfw: false,
            args: false
        });
    }

    async run(message) {


        let embed = new MessageEmbed()
            .setAuthor("Hier findest du eine Liste mit allen wichtigen Befehlen.")
            .setColor("#ff5858")
            .addField("!cmds", "Rufe diese Befehlsliste auf.")
            .addField("!bd list", "Sieh dir unseren Server-Geburtstagskalender an.", true)
            .addField("!bd set [TT.MM]", "Trage deinen Geburtstag in den Geburtstagskalender ein.", true)
            .addField("!help / +help", "Erhalte eine Liste von Befehlen zum Musikbot.", true)
            .addField("!lvl", "Rufe deinen Fortschritt im Levelsystem auf.", true)
            .addField("!top", "Sieh dir unsere Server XP Rangliste an.", true)

        message.channel.send({embed: embed}).then(m => {
            try {
                m.delete({timeout: 15000})
            } catch (e) {
                //Error
                console.error(e);
            }

        })

        try {
            message.delete({timeout: 15000})
        } catch (e) {
            //Error
            console.error(e);
        }


    }
}
