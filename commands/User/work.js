const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["w", "arbeit"],
            description: '**WIP:** Arbeite um Geld zu verdienen',
            category: 'user',
            guildOnly: true,
            additionalinfo: "WIP"
        });
    }


    async run(message) {

       return;

       //Arbeitsname, Länge, Pausenzeit, Verdienst, Wertereq


        if(!this.client.workCooldown.has(message.member.id)) {

            message.channel.send(`Dir wurden deine Täglichen Coins und XP gutgeschrieben!`)

            this.client.workCooldown.set(message.member.id, {timestamp: Date.parse(new Date().toString())})

            await this.client.utils.xpAdd(message.member, this.client.dailyRewardXP, false);
            await this.client.utils.coinsAdd(message.member, this.client.dailyRewardCoins, false);

        } else {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0,0,0,0);
            let timestamp = Date.parse(tomorrow.toString()) - Date.parse(new Date().toString());
            let remainingTime = await this.client.utils.duration(timestamp);

            return message.channel.send(`Du kannst noch nicht wieder Arbeiten! Bitte warte noch **${remainingTime}**.`);
        }
    }
};
