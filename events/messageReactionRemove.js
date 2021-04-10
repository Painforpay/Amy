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
        let member = reaction.message.guild.members.cache.get(user.id);

        this.client.con.query(`SELECT * FROM rroles WHERE messageid = '${reaction.message.id}'`, function (err, result) {
            if (err) throw err;



            if(member) {
                result.forEach(async r => {

                    if (r.emoji === reaction.emoji.name) {
                        try {
                            await member.roles.remove(r.roleid);
                        } catch (e) {
                            console.error(`\nError while removing Reactionrole\nRoleID: ${r.roleid}\n${e.stack}`)
                        }

                    }

                })
            }



        });


    }


}
