const Command = require('../../Structure/Command');
const Discord = require('discord.js')
let test = new Discord.Collection();

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Aktiviert den Slowmode in einem Channel für bestimmte Zeit',
            category: 'Utilities',
            aliases: ["sm", "slow"],
            argsDef: [`<Zeit in Sekunden>`,`<Sekunden pro Nachricht>`],
            userPerms: ['MANAGE_CHANNELS'],
            guildOnly: true,
            minArgs: 0
        });
    }


    async run(message, args) {
        message.delete();



        if(isNaN(args[0])) return message.channel.send("Bitte gib eine Zahl als Parameter an!").then(m => {
            try {
                m.delete({timeout: 5000})
            } catch (e) {
                //Error
                console.error(e);
            }
        });


        let channel = message.channel;
        if(test.get(channel.id)) return message.channel.send("Dieser Channel befindet sich bereits im Slowmode! Gesetzt für "+ test.get(channel.id) + " Sekunden").then(m => {
            try {
                m.delete({timeout: 5000})
            } catch (e) {
                //Error
                console.error(e);
            }
        });

        let time = (Math.abs(args[0]));
        let limit = (Math.abs((args[1] ? args[1] : 5)));
        let original = channel.rateLimitPerUser || 0;
        if(time > 120 || time <= 0) time = 120;
        if(limit > 30) {
            limit = 30;
        } else if(limit <= 0) {
            limit = 2;
        }
        await channel.setRateLimitPerUser(limit, `Executed by ${message.author.tag} for ${time} Seconds`);
        this.client.utils.log(`Slowmode in ${channel} aktiviert von ${message.author} für ${time} Sekunden ${args[1] ? (`(${limit} Sekunden pro Nachricht)`) : ""}`)

        test.set(channel.id, time.toString());
        setTimeout(() => {
            // Removes the User from the set after a minute
            this.client.picCooldown.delete(message.author.id);
        }, 10000);

        message.channel.send(`Der Channel wurde für ${time} Sekunden in den Slowmode versetzt! ${args[1] ? (`(${limit} Sekunden pro Nachricht)`) : ""}`).then(m => {
            try {
                m.delete({timeout: 15000})
            } catch (e) {
                //Error
                console.error(e);
            }
        })

        setTimeout(() => {
            test.delete(channel.id);
            channel.setRateLimitPerUser(original, `[Reverted to Original] Executed by ${message.author.tag} for ${time} Seconds`);
            this.client.utils.log(`Slowmode in ${channel} deaktiviert`)

        }, time * 1000)




    }


};
