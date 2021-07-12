const Event = require('../Structure/Event');
const colors = require('colors/safe');
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(member) {
        if (member.user.bot) return;
        const client = this.client;
        this.client.raidCounter += 1;

        const logChannel = this.client.serverChannels.get("joinlogs");

        // To compare, we need to load the current invite list.
        member.guild.fetchInvites().then(guildInvites => {
            // This is the *existing* invites for the guild.


            const ei = this.client.invites;
            // Update the cached invites for the guild.

            // Look through the invites, find the one for which the uses went up.
            const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);

            if (invite) {
                client.invites = guildInvites;
                const inviter = client.users.cache.get(invite.inviter.id);
                // Get the log channel (change to your liking)
                const logChannel = this.client.serverChannels.get("joinlogs");
                // A real basic message with the information we need.
                logChannel.send(`${member} wurde von ${inviter} mit dem Code \`${invite.code}\` eingeladen. \`${invite.uses}\` Nutzungen seit seiner Erstellung. ${member.guild.memberCount} Mitglieder.`);

            } else {
                // A real basic message with the information we need.

                //Trying to get the inviter by finding the code that has been deleted:
                let msg;
                ei.forEach(async ei => {

                    if (!guildInvites.find(i => i.code === ei.code)) {
                        const inviter = client.users.cache.get(ei.inviter.id);
                        // Get the log channel (change to your liking)
                        client.invites = guildInvites;
                        //Dieser Invite wurde genutzt
                        msg = await logChannel.send(`${member} wurde von ${inviter} mit dem Code \`${ei.code}\` eingeladen. \`${ei.uses + 1}\` Nutzungen seit seiner Erstellung. - ${member.guild.memberCount} Mitglieder.`);
                    }
                });


            }


        });

        if (this.client.raidMode) {

                await member.send("Sorry, die **Raid Protection** ist aktiv. Bitte versuche es später nochmal!").catch(() => null);


            return member.kick();
        } else {

            if ((Date.parse(new Date()) - member.user.createdTimestamp) < 604800000) {
                //let vor = Date.parse(new Date()) - member.user.createdTimestamp;
                logChannel.send(`${this.client.serverRoles.get("moderator")}\nAchtung: Der Account von ${member} ist ziemlich jung. Erstellt am: ${await this.client.utils.getDateTime(member.user.createdTimestamp)}`);
            }


            try {
                this.client.serverChannels.get("general").send(`Willkommen ${member} auf ${member.guild.name}! Wir hoffen, dass du dich hier wohlfühlst. ${this.client.serverRoles.get("userjoinPing")}`);
            } catch (e) {
                console.error(e);
            }

            try {
                if (this.client.dev) {
                    let array = ["800110137632882778", "800110137544146962"];
                    for (const roleid of array) {
                        let role = member.guild.roles.cache.get(roleid);
                        await member.roles.add(role);
                    }

                } else {
                    let array = ["794158777435029535", "794154048827031583", "794154237273309194", "803039995342225429", "795398801551786025", "795419668067516417", "795692239263105056", "794685546307256370"];
                    for (const roleid of array) {
                        let role = member.guild.roles.cache.get(roleid);
                        await member.roles.add(role);
                    }
                }
            } catch (e) {
                //Error
                console.error(e);
            }

           await this.client.con.updateUser(member.id)
        }


    }

}
