const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["top10", "t", "top"],
            description: 'Zeigt das Leaderboard für Erfahrungspunkte an!',
            category: 'user',
            guildOnly: true,
            cooldown: 60
        });
    }


    async run(message) {

        let client = this.client;
        //`SELECT * FROM users WHERE xp > 1 ORDER BY xp DESC LIMIT 10;`

        let builderData = {
            table: "users",
            sqlType: "SELECT",
            params: ["*"],
            conditions: new Discord.Collection(),
            limit: 10,
            orderBy: {value: "xp", key: "DESC"}
        }

        builderData.conditions.set("xp", {operator: ">", value: 1})

        let sqlQuery = await this.client.con.buildQuery(builderData);

        let results = await this.client.con.executeQuery(sqlQuery).catch(err => {
            client.console.reportError(err.stack);
            return message.channel.send(`Es gab einen Fehler bei der Ausführung des Befehls!`)
        });

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

               m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))


            })

            message.delete().catch(err => client.console.reportError(err.stack))






    }
};
