const Event = require('../Structure/Event');
const { MessageEmbed } = require('discord.js');
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(reaction, user) {

        if (user.bot) return;
        const client = this.client;
        // When we receive a reaction we check if the reaction is partial or not
        if (reaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {

                await reaction.fetch();

            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        //Check if reaction happened in #support
        let member = reaction.message.guild.members.cache.get(user.id);
        if (reaction.message.channel.id === (this.client.dev ? "800110137820971040" : "796119563803689050")) {

            await this.client.utils.createTicket(reaction, user);


        }

        if (reaction.message.channel.id === (this.client.dev ? "800110137820971042" : "794175100118499379")) {

            if (reaction.emoji.name === "🗣️" && member.roles.cache.get(this.client.dev ? "800110137649135632" : "794154756179623936")) {
                await this.client.utils.createDiscussion(reaction.message);
            }

            if (reaction.emoji.name === "🗣️" && !member.roles.cache.get(this.client.dev ? "800110137649135632" : "794154756179623936")) {
                await reaction.users.remove(user);
            }
        }

        if (reaction.message.channel.parentID === (this.client.dev ? "800110137820971041" : "794175912026701850")) {
            if (reaction.emoji.name === "❌" && member.roles.cache.get(this.client.dev ? "800110137649135632" : "794154756179623936")) {
                await this.client.utils.archiveDiscussion(reaction, user);
            }

            if (reaction.emoji.name === "❌" && !member.roles.cache.get(this.client.dev ? "800110137649135632" : "794154756179623936")) {
                await reaction.users.remove(user);
            }
        }

        if(reaction.message.reactions.cache.has("⭐")) {
            if(reaction.message.reactions.cache.get("⭐").count < this.client.starBoardMinReactions) return;
            let starboard = await this.client.channels.fetch(this.client.dev ? "850824322523332619" : "850824438991683584")

            await reaction.message.fetch();
            let description = `\n\n[Link](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`;

            if(this.client.starredMessages.has(reaction.message.id)) {

                let starboardMsg = await this.client.starredMessages.get(reaction.message.id)

                let embed = starboardMsg.embeds[0];

                starboardMsg.edit(`${reaction.message.reactions.cache.get("⭐").count} ⭐ | ${reaction.message.channel}`, embed)

            } else {
                //create Message

                let embed = new MessageEmbed()
                    .setColor("#ffd700")
                    .setAuthor(`${reaction.message.author.tag}`, reaction.message.author.displayAvatarURL({dynamic: true}));

                if(reaction.message.content.length > 0) {
                    description = `${reaction.message.content}` + description;
                }
                embed.setDescription(description);

                if(reaction.message.attachments.size > 0) {
                    embed.setImage(reaction.message.attachments.firstKey().proxyURL);
                }

                let starboardMsg = starboard.send(`${reaction.message.reactions.cache.get("⭐").count} ⭐ | ${reaction.message.channel}`,embed)

                this.client.starredMessages.set(reaction.message.id, starboardMsg);

            }

        }


        this.client.con.query(`SELECT * FROM rroles WHERE messageid = '${reaction.message.id}'`, function (err, result) {
            if (err) return console.error(err);


            result.forEach(async r => {

                if (r.emoji === reaction.emoji.name) {

                    try {
                        await member.roles.add(r.roleid);
                        if (!member.roles.cache.has(r.categoryid)) {
                            await member.roles.add(r.categoryid);
                        }
                    } catch (e) {
                        client.utils.log(`\nError while adding Reactionrole\nRoleID: ${r.roleid}\nCategoryID: ${r.categoryid}\n${e.stack}`)
                    }
                }

            });

        });


    }
}
