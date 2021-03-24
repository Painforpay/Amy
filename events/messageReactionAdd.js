const Event = require('../Structure/Event');

module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(reaction, user) {

        if (user.bot) return;

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


        this.client.con.query(`SELECT * FROM rroles WHERE messageid = '${reaction.message.id}'`, function (err, result) {
            if (err) return console.error(err);


            result.forEach(r => {

                if (r.emoji === reaction.emoji.name) {

                    member.roles.add(r.roleid);
                    member.roles.add(r.categoryid);
                }

            });

        });


    }
}
