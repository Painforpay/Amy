const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["lvl", "l"],
            description: 'Zeigt dir Informationen zu deinem Level an!',
            category: 'user',
            guildOnly: true,
            cooldown: 60
        });
    }


    async run(message) {


        let client = this.client;
        let result = await this.client.utils.getUserData(message.author.id);

        if (result) {
            let currentLevel = await client.utils.getLevelforXp(result.xp)
            let nextLevelValue = currentLevel + 1;
            let currentLevelMinXP = await client.utils.getLevelXp(currentLevel);
            let nextLevelMinXP = await client.utils.getLevelXp(nextLevelValue);

            let currentXP = result.xp;


            let progress = ((currentXP - currentLevelMinXP > 0 ? currentXP - currentLevelMinXP : 0) / (nextLevelMinXP - currentLevelMinXP)) * 100;
            let remainingXP = nextLevelMinXP - currentXP;
            //console.log(progress);
            //console.log(xp)
            //console.log(currentminxp+nextminxp)

            let anzahl = Math.floor(progress / 5);
            //console.log(anzahl);

            let progressbar = "▕**";

            for (let i = 0; i < anzahl; i++) {

                progressbar += "█";
            }
            let fill = 20 - anzahl;
            for (let i = 0; i < fill; i++) {

                progressbar += "░";
            }
            progressbar += "**▏";

            let placement = await client.utils.getPlacementforUser(message.author.id, currentXP)

            let embed = new Discord.MessageEmbed()
                .setTitle(`**Level ${currentLevel}**`)
                .setColor("#FFD700")
                .setTimestamp()
                .addField("Du hast", `✨ **${(Math.round(currentXP * 100) / 100).toFixed(0)} Erfahrungspunkte**`)
                .addField(`Dir fehlen`, `**${(Math.round(remainingXP * 100) / 100).toFixed(0)} Erfahrungspunkte** für das nächste Level!`)
                .addField(`Dein Levelfortschritt liegt bei`, `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**${Math.floor(progress)}%**\n${currentLevelMinXP}${progressbar}${nextLevelMinXP}\n`)
                .setAuthor(message.author.tag);

            //set Placement if User has more than 0 xp
            currentXP > 0 ? embed.setDescription(`🏁 Du belegst den **${placement}.** Platz aller User`) : null;


            message.channel.send({embed: embed}).then(m => {
                try {
                    m.delete({timeout: 15000})
                } catch (e) {
                    //Error
                    console.error(e);
                }

            })
            try {
                message.delete()
            } catch (e) {
                //Error
                console.error(e);
            }


        }


    }
};
