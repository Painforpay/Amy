const Command = require('../../Structure/Command');
const { MessageEmbed } = require("discord.js");
const packageJson = require("../../package.json");
const os = require("os-utils");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Verwaltung von Amy\'s internen Variablen.',
            category: 'administration',
            userPerms: ['ADMINISTRATOR'],
            minArgs: 0,
            argsDef: ['<settingName>', '<newValue>'],
            guildOnly: true,
            ownerOnly: true
        });
    }


    async run(message, args) {

        let pages = [`Discord.js Version: **v${packageJson.dependencies["discord.js"].replace("^", "")}**
            Node.js Version: **${process.version}**
            
            Process Uptime: ${Math.floor(process.uptime())} seconds
            Discord Client Uptime: ${Math.floor(this.client.uptime / 1000)} seconds   
            
            Current Memory in Use: **${Math.round(100 - (100 * os.freememPercentage()))}%**
            **${Math.floor(os.totalmem()-os.freemem())/1000} GB / ${Math.floor(os.totalmem())/1000} GB**
            Current CPU Usage: **${Math.round(100 * (await new Promise(resolve => os.cpuUsage(resolve))))}%**
            `, `
            \*\***General**\*\*
            [isBeta] Bot in Beta: ${this.client.isBeta ? "yes" : "no"}
            [dev] Bot in Devmode: ${this.client.dev ? "yes" : "no"}
            [maxChanSize] Maximum Private Channel size: ${this.client.maxChanSize} users
            [starBoardMinReactions] Starboard Acceptance Reaction Count: ${this.client.starBoardMinReactions}   
            [fullMuteAFK] Fullmute AFK Move Status: ${this.client.fullMuteAFK ? "Active": "Inactive"}
               
               
            \*\***Level System**\*\*
            [xpMessages] XP for Sending One Message: ${this.client.xpMessages} XP
            [xpVoice] XP for being one Minute in Voice: ${this.client.xpVoice} XP
            [birthdayReward] Birthday Reward: ${this.client.birthdayReward} XP
            
            \*\***AutoModeration**\*\*
            [messagesPerSecond] AntiSpam - Messages per Second allowed: <${this.client.messagesPerSecond}
            [spamMuteTime] AntiSpam - Spam Punishment Mute Time: ${this.client.spamMuteTime} minutes
            [picCooldownSecs] Picture Cooldown - Timeout for Pictures in #general: ${this.client.picCooldownSecs} seconds
            [fullMuteAFKTime] AFK - FullMute AFK Move Time: ${this.client.fullMuteAFKTime} minutes
            `];



        let embed = await this.generateEmbed(0, pages);

        message.channel.send(embed).then(async message => {
            // exit if there is only one index of guilds (no need for all of this)
            if (pages.length <= 1) return;
            // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
            await message.react('➡️')
            const collector = message.createReactionCollector(
                // only collect left and right arrow reactions from the message author
                (reaction, user) => ['➡️'].includes(reaction.emoji.name) && user.id !== this.client.user.id,
                // time out after a minute
                {time: 60000}
            )

            let index = 0

            collector.on('collect', async (reaction, user) => {
                // remove the existing reactions

                // increase/decrease index

                switch (reaction.emoji.name) {
                    case '➡️': {
                        index + 1 >= pages.length ? index = 0 : index += 1;
                        // edit message with new embed
                        let newEmbed = await this.generateEmbed(index, pages);

                        message.edit(newEmbed)

                        await reaction.users.remove(user);
                    }
                    break;
                }

            })
        })
            

    }

    async generateEmbed(index, array) {
        let pages = Math.ceil(array.length / 15);

        let page = Math.ceil(index / 15)+1;
        let embed = new MessageEmbed()
            .setTitle(`Amy Control Panel`)
            .setColor("#a40909")
            .setDescription(array[index])
        if(pages > 1) {
            embed.setFooter(`Seite ${page} von ${pages}`)
        }
        return embed;

    }
};
