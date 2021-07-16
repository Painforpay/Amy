const Event = require('../Structure/Event');
const { Collection } = require('discord.js');

module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldPresence, newPresence) {
        if (newPresence.user.bot) return;
        let client = this.client;
        if (newPresence.member.roles.cache.has(this.client.serverRoles.get("streamer").id)) {

            if (newPresence.activities.length > 0) {

                if (this.isStreaming(newPresence)) {

                    if (!this.streamUpdated(oldPresence, newPresence) && this.isStreaming(newPresence)) {


                        await this.client.serverChannels.get("streamAnnouncement").send(`${newPresence.member} hat angefangen zu Streamen! Schaut doch vorbei?\n${newPresence.activities.find(activity => activity.type === "STREAMING").url} ${this.client.serverRoles.get("streamingPing")}`)

                    }

                    await newPresence.member.roles.add(this.client.serverRoles.get("streamerIsStreaming"));
                } else {
                    await newPresence.member.roles.remove(this.client.serverRoles.get("streamerIsStreaming"));
                }

            } else {
                await newPresence.member.roles.remove(this.client.serverRoles.get("streamerIsStreaming"));
            }
        }


        let activities = newPresence.activities.filter(a => a.type === "PLAYING")

        for(const activity of activities) {

            let rolename = activity.name.replace('\'', "_")

            let rolestoAdd = await this.client.con.getActivity(rolename, true);
            let rolestoRemove = await this.client.con.getActivity(rolename, false);
            if(rolestoAdd != null && rolestoAdd > 1) {
                if(this.client.gameActivity.has(newPresence.member.id)) {
                    let UserActivity = this.client.gameActivity.get(newPresence.member.id);

                        UserActivity.set(rolename, {timestamp: Date.parse(new Date().toString())})


                } else {
                    this.client.gameActivity.set(newPresence.member.id, new Collection())
                    this.client.gameActivity.get(newPresence.member.id).set(rolename, {timestamp: Date.parse(new Date().toString())})


                }

                    if(rolestoRemove != null) {
                        newPresence.member.roles.remove(rolestoRemove[0]).catch(err => console.log(err));
                    }
                    for (const role of rolestoAdd) {
                        newPresence.member.roles.add(role).catch(err => console.log(err));
                    }

            }

        }


    }

    isStreaming(newP) {

        return newP.activities.find(a => a.type === "STREAMING");

    }

    streamUpdated(oldP, newP) {
        if (!oldP) return false;
        return (oldP.activities.find(a => a.type === "STREAMING") && newP.activities.find(a => a.type === "STREAMING"));

    }

}
