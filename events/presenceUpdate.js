const Event = require('../Structure/Event');

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

                        let streamschan = this.client.serverChannels.get("streamAnnouncement")
                        await streamschan.send(`${newPresence.member} hat angefangen zu Streamen! Schaut doch vorbei?\n${newPresence.activities.find(activity => activity.type === "STREAMING").url} ${this.client.serverRoles.get("streamingPing")}`)

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

        activities.forEach(activity => {

            let rolename = activity.name.replace('\'', "_")

            let roles = this.client.con.getActivity(rolename);

            if(roles.length > 0) {
                newPresence.member.roles.add(roles);
            }

        })


    }

    isStreaming(newP) {

        return newP.activities.find(a => a.type === "STREAMING");

    }

    streamUpdated(oldP, newP) {
        if (!oldP) return false;
        return (oldP.activities.find(a => a.type === "STREAMING") && newP.activities.find(a => a.type === "STREAMING"));

    }

}
