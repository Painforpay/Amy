const Discord = require('discord.js');
const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["lvl", "l"],
            description: 'Zeigt dir Informationen zu deinem Level an!',
            category: 'user',
            guildOnly: true,
            cooldown: 60,
            argsDef: ["<userping>"]
        });
    }


    async run(message, args) {
        return;
        message.delete();
        let member = message.member;

        let client = this.client;
        if(args.length > 0) {
            let UserID = message.mentions.members.first() || args[0];

            let user = await this.client.users.fetch(UserID.id ? UserID.id : UserID).catch(err => {
                return message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)
            });
            if (user) {
                member = await message.guild.member(user);
            }
        }




        let result = await this.client.utils.getUserData(member.id);



        if (result && !member.user.bot) {
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
                .setTitle(`Level ${currentLevel} [${Math.floor(progress)}%]`)
                .setColor("#FFD700")
                .setTimestamp()
                .setDescription(`
                ${currentXP > 0 ? `🏁 ${result.id === message.member.id ? `Du belegst` : `${member.nickname || member.user.username} belegt`} den **${placement}.** Platz aller User`: ""}
                
                ✨ **${(Math.round(currentXP * 100) / 100).toFixed(0)} Erfahrungspunkte**
                
                Es fehlen:
                **${(Math.round(remainingXP * 100) / 100).toFixed(0)} Erfahrungspunkte** für das nächste Level! 
                
               
                ${currentLevelMinXP}${progressbar}${nextLevelMinXP}
                `)
                .setAuthor(member.nickname || member.user.username);

            //set Placement if User has more than 0 xp
            //currentXP > 0 ? embed.setDescription(`🏁 ${result.id == message.member.id ? `Du belegst`: `${member.nickname || member.user.username} belegt`} den **${placement}.** Platz aller User`) : null;

            if(result.id !== message.member.id) {
                embed.setFooter(`Abgefragt von ${message.member.nickname || member.user.username}`, message.member.user.displayAvatarURL)
            }

            message.channel.send({embed: embed}).then(m => {

                    m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))


            })

        } else {
            message.channel.send(`Keine Nutzerdaten für ${member.nickname || member.user.username} gefunden!`).then(m => {
                m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))
            })
        }


    }
};
