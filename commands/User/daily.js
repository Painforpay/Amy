const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["d", "streak"],
            description: 'Hole deine Täglichen Coins und XP ab!',
            category: 'user',
            guildOnly: true
        });
    }


    async run(message) {

        if(!this.client.dailyCooldown.has(message.member.id)) {

            message.channel.send(`Dir wurden deine Täglichen Coins und XP gutgeschrieben!`)

            this.client.dailyCooldown.set(message.member.id, {timestamp: Date.parse(new Date())})

            await this.client.utils.xpadd(message.member, this.client.dailyRewardXP, false);
            await this.client.utils.coinsadd(message.member, this.client.dailyRewardCoins, false);

        } else {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0,0,0,0);
            let timestamp = Date.parse(tomorrow) - Date.parse(new Date());
            let remainingTime = await this.client.utils.duration(timestamp);

           return message.channel.send(`Du kannst deine Täglichen Coins und XP noch nicht abholen! Bitte warte noch ${remainingTime}.`);
        }


    }
};
