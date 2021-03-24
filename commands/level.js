const Discord = require('discord.js');
const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["lvl", "xp", "rank"],
            description: 'Informationen zu deinem Level!',
            category: 'roles',
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            args: false
        });
    }


    async run(message) {

        let member = message.member;
        let client = this.client;

        this.client.con.query(`SELECT * FROM users WHERE id = ${member.user.id};`, async function (err, result) {
            if (err) throw err;

            if (result[0]) {
                let current = await client.utils.getLevelforXp(result[0].xp)
                let nextlevel = current + 1;
                let currentminxp = await client.utils.getLevelXp(current);
                let nextminxp = await client.utils.getLevelXp(nextlevel);

                let xp = result[0].xp;


                let progress = ((xp - currentminxp > 0 ? xp - currentminxp : 0) / (nextminxp - currentminxp)) * 100;

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

                let placement = await client.utils.getPlacementforUser(message.author.id, xp)

                let embed = new Discord.MessageEmbed()
                    .setTitle(`**Level ${current}**`)
                    .setColor("#FFD700")
                    .setTimestamp()
                    .addField("Du hast", `✨ **${(Math.round(xp * 100) / 100).toFixed(0)} Erfahrungspunkte**`)
                    .addField(`Dein Levelfortschritt liegt bei`, `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**${Math.floor(progress)}%**\n${currentminxp}${progressbar}${nextminxp}\n`)
                    .setAuthor(message.author.tag);

                //set Placement if user has more than 0 xp
                xp > 0 ? embed.setDescription(`🏁 Du belegst den **${placement}.** Platz aller User`) : null;


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
        });


    }
};
