const Event = require('../Structure/Event');


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

            let starboard = this.client.serverChannels.get("starboard");

            if(reaction.message.channel === starboard) return;


            if(this.client.starredMessages.has(reaction.message.id)) {

                let starboardMsg = await this.client.starredMessages.get(reaction.message.id)
                if(!reaction.message.reactions.cache.get("⭐") || reaction.message.reactions.cache.get("⭐").count < this.client.starBoardMinReactions) {
                    //delete Message
                    starboardMsg.delete();
                    this.client.starredMessages.delete(reaction.message.id);
                } else {
                    //update Message
                    let embed = starboardMsg.embeds[0];


                    starboardMsg.edit(`${reaction.message.reactions.cache.get("⭐").count} ⭐ | ${reaction.message.channel}`, embed)

                }



            }





        let member = reaction.message.guild.members.cache.get(user.id);
        await member.fetch();

        this.client.con.query(`SELECT * FROM rroles WHERE messageid = '${reaction.message.id}'`, function (err, result) {
            if (err) throw err;


            if (member) {
                result.forEach(async r => {

                    if (r.emoji === reaction.emoji.name) {
                        try {
                            await member.roles.remove(r.roleid);
                        } catch (e) {
                            client.utils.log(`\nError while removing Reactionrole\nRoleID: ${r.roleid}\n${e.stack}`)
                        }

                    }

                })
            }


        });


    }


}
