const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Zeigt jede Person an die Besagte Rolle hat.',
            aliases: ["lu"],
            category: 'user',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<rollenname>'],
            cooldown: 60,
            additionalinfo: "Es kann darf keine Rolle gepingt werden - Der exakte Name reicht."
        });
    }


    async run(message, args) {
        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

        let role = await message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());
        let memberSize = 0;
        let list;
        if (role) {
            let members = role.members;
            list = []
            await members.forEach(member => {
                if (!member.user.bot) {
                    list.push(member);
                    memberSize += 1;
                }
            })
            if (list.length == 0) list.push(`Niemand besitzt diese Rolle!`);

        } else {

            list = [`Die Rolle Existiert nicht!`]
        }

        message.channel.send(await this.generateEmbed(`[${memberSize}] ${role ? role.name : args.join(" ")}:`, 0, list)).then(async message => {
            // exit if there is only one index of guilds (no need for all of this)
            if (list.length <= this.client.pageSize) return;
            // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
            await message.react('⬅️')
            await message.react('➡️')
            const collector = message.createReactionCollector(

                reaction => ['⬅️', '➡️'].includes(reaction.emoji.name),

                {time: 500000}
            )
            let index = 0

            collector.on('collect', async (reaction, user) => {
                // remove the existing reactions

                // increase/decrease index

                switch (reaction.emoji.name) {
                    case '⬅️': {
                        index == 0 ? (index = (list.length - (list.length % this.client.pageSize)) ) : index -= this.client.pageSize;

                    }
                        break;
                    case '➡️': {
                        index + this.client.pageSize >= list.length ? index = 0 : index += this.client.pageSize;
                    }
                        break;
                }
                // edit message with new embed
                let newEmbed = await this.generateEmbed(`[${memberSize}] ${role ? role.name : args.join(" ")}:`, index, list);

                message.edit(newEmbed)

                await reaction.users.remove(user);
            })

            collector.on("end", async () => {
                let newEmbed = await this.generateEmbed(`[${memberSize}] ${role ? role.name : args.join(" ")}:`, 0, list);

                message.edit(newEmbed.setFooter(newEmbed.footer.text + " | Inaktiv"))
                message.reactions.removeAll();
            })



        })






    }

    async generateEmbed(title, index, array) {
        let currentPageInfo = array.slice(index, index + this.client.pageSize);

        let pages = Math.ceil(array.length / this.client.pageSize);

        let page = Math.ceil(index / this.client.pageSize)+1;
        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor("#a40909")
            .setDescription(currentPageInfo.join(`\n`))
        if(pages > 1) {
            embed.setFooter(`${page}/${pages}`)
        }
        return embed;

    }

};

