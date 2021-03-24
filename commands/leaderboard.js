const Discord = require('discord.js');
const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["lvltop", "top", "ranktop", "leveltop"],
            description: 'Zeigt das Leaderboard für Erfahrungspunkte an! TOP 10',
            category: 'roles',
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            args: false
        });
    }


    async run(message) {

        let client = this.client;

        this.client.con.query(`SELECT * FROM users WHERE xp > 1 ORDER BY xp DESC LIMIT 10;`, async function (err, results) {
            if (err) throw err;


            let embed = new Discord.MessageEmbed()
                .setColor("#ffdab9")
                .setTitle('Rangliste - Erfahrungspunkte');

            let desc = "*Die 10 Mitglieder mit den meisten Erfahrungspunkten:*\n\n";

            for (let i = 0; i < results.length; i++) {
                let placement = i + 1;
                let user = await client.users.fetch(`${results[i].id}`, false, false);

                if (placement <= 3) {
                    switch (placement) {
                        case 1: {
                            desc += `🥇 Platz 1\n${user}\n**${(Math.round(parseInt(results[i].xp) * 100) / 100).toFixed(0)} xp** (Level **${(await client.utils.getLevelforXp(results[i].xp))}**)\n\n`
                        }
                            break;
                        case 2: {
                            desc += `🥈 Platz 2\n${user}\n**${(Math.round(parseInt(results[i].xp) * 100) / 100).toFixed(0)} xp** (Level **${(await client.utils.getLevelforXp(results[i].xp))}**)\n\n`
                        }
                            break;
                        case 3: {
                            desc += `🥉 Platz 3\n${user}\n**${(Math.round(parseInt(results[i].xp) * 100) / 100).toFixed(0)} xp** (Level **${(await client.utils.getLevelforXp(results[i].xp))}**)\n\n`
                        }
                            break;


                    }
                } else {

                    desc += `${placement}. ${user} **${(Math.round(parseInt(results[i].xp) * 100) / 100).toFixed(0)} xp** (Level **${(await client.utils.getLevelforXp(results[i].xp))}**)\n`

                }
            }


            embed.setDescription(desc)

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


        });


    }
};
