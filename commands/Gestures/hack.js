const Command = require('../../Structure/Command');
const {User, MessageEmbed} = require('discord.js');
const commandname = __filename.split("").slice(__dirname.length + 1);
commandname.splice(commandname.length - 3, 3)
const json = require(`../../images-gifs/${commandname.join("")}.json`);
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: `${json[1]}`,
            category: 'gesten',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<ping>'],
            cooldown: 5
        });
    }


    async run(message, args) {


        let target = message.mentions.users.first() || message.guild.members.cache.find(u => u.user.username === args[0] || u.nickname === args[0]);

        if (target) {
            //if(target.bot) return;
            let embed = new MessageEmbed()
                .setTitle(`${json[0][0]}!`)
                .setColor(`#FFD700`)
                .setDescription(`${message.author} ${json[0][1]} ${target == message.author ? "sich Selbst" : target}! ${await this.client.utils.getRandom(json[3])}`)
                .setImage(await this.client.utils.getRandom(json[2]))
            message.channel.send(embed)
        } else {
            message.channel.send(`Leider existiert kein Nutzer mit diesem Namen!`)
        }
    }


};
