const Event = require('../Structure/Event');
const { MessageEmbed, Collection } = require('discord.js');
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
        await member.fetch();
        if (reaction.message.channel === this.client.serverChannels.get("support")) {

            await this.client.utils.createTicket(reaction, user);


        }

        if (reaction.message.channel === this.client.serverChannels.get("ideen")) {

            if (reaction.emoji.name === "🗣️" && member.roles.cache.has(this.client.serverRoles.get("senior").id)) {
                await this.client.utils.createDiscussion(reaction.message);
            }

            if (reaction.emoji.name === "🗣️" && !member.roles.cache.has(this.client.serverRoles.get("senior").id)) {
                await reaction.users.remove(user);
            }
        }

        if (reaction.message.channel.parentID === this.client.serverChannels.get("serverentwicklung").id) {
            if (reaction.emoji.name === "❌" && member.roles.cache.get(this.client.serverRoles.get("senior").id)) {
                await this.client.utils.archiveDiscussion(reaction, user);
            }

            if (reaction.emoji.name === "❌" && !member.roles.cache.get(this.client.serverRoles.get("senior").id)) {
                await reaction.users.remove(user);
            }
        }

        if(reaction.message.reactions.cache.has("⭐")) {
            if(reaction.message.reactions.cache.get("⭐").count < this.client.starBoardMinReactions) return;
            let starboard = this.client.serverChannels.get("starboard");

            await reaction.message.fetch();
            let description = `\n\n[Link](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`;

            if(this.client.starredMessages.has(reaction.message.id)) {
                //Update Message
                let starboardMsg = await this.client.starredMessages.get(reaction.message.id)

                let embed = starboardMsg.embeds[0];


                starboardMsg.edit(`${reaction.message.reactions.cache.get("⭐").count} ⭐ | ${reaction.message.channel}`, embed)

            } else {
                //create Message

                let embed = new MessageEmbed()
                    .setColor("#ffd700")
                    .setFooter(`Reference ID: ${reaction.message.id}`)
                    .setAuthor(`${reaction.message.author.tag}`, reaction.message.author.displayAvatarURL({dynamic: true}));

                if(reaction.message.content.length > 0) {
                    description = `${reaction.message.content}` + description;
                }
                embed.setDescription(description);
                let starboardMsg;
                if(reaction.message.attachments.size > 0) {
                    let attachment = reaction.message.attachments.first();

                    embed.setImage(attachment.proxyURL);


                }

                starboardMsg = await starboard.send(`${reaction.message.reactions.cache.get("⭐").count} ⭐ | ${reaction.message.channel}`, embed)

                this.client.starredMessages.set(reaction.message.id, starboardMsg);

            }

        }

        let builderData = {
            sqlType: "SELECT",
            table: "rroles",
            conditions: new Collection(),
            params: ["roleid", "categoryid", "emoji"]
        }

        builderData.conditions.set("messageid", {operator: "=", value: reaction.message.id})

        let sqlQuery = await this.client.con.buildQuery(builderData);

        let result = await this.client.con.executeQuery(sqlQuery).catch(err => this.client.console.reportError(err.stack));

        if(result.length > 0) {
            result.forEach(async r => {

                if (r.emoji === reaction.emoji.name) {
                    try {
                        await member.roles.add(r.roleid);
                        if (!member.roles.cache.has(r.categoryid)) {
                            await member.roles.add(r.categoryid);
                        }
                        let gameRole = await this.removeGameRole(r.roleid);

                        await member.roles.remove(gameRole).catch(() => null);
                    } catch (e) {
                        client.console.reportLog(`\nError while removing Reactionrole\nRoleID: ${r.roleid}\n${e.stack}`, true, true)
                    }

                }

            })
        }


    }

    async removeGameRole(roleid) {

        let role = this.client.guild.roles.cache.get(roleid);

        let rolename = role.name.replace('\'', "_")

        let rolestoRemove = await this.client.con.getActivity(rolename, true);
        if(rolestoRemove != null) {
            return rolestoRemove[0]
        } else {
            return null
        }




    }
}
