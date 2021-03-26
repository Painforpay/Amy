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
        if (newPresence.member.roles.cache.find(r => r.id === (client.dev ? "800110137628557361" : "794155349665120306"))) {

            if (newPresence.activities.length > 0) {

                if (this.isStreaming(newPresence)) {

                    if (!this.streamUpdated(oldPresence, newPresence) && this.isStreaming(newPresence)) {

                        let streamschan = await newPresence.member.guild.channels.cache.find(c => c.id === (client.dev ? "800110138027409507" : "794685217872543774"))
                        await streamschan.send(`${newPresence.member} hat angefangen zu Streamen! Schaut doch vorbei?\n${newPresence.activities.find(activity => activity.type === "STREAMING").url} <@&${client.dev ? "800110137553453107" : "794685489889804308"}>`)

                    }

                    await newPresence.member.roles.add(client.dev ? "800110137649135630" : "794685963229069392");
                } else {
                    await newPresence.member.roles.remove(client.dev ? "800110137649135630" : "794685963229069392");
                }

            } else {
                await newPresence.member.roles.remove(client.dev ? "800110137649135630" : "794685963229069392");
            }
        }


        let activities = newPresence.activities.filter(a => a.type === "PLAYING")

        activities.forEach(activity => {

            let rolename = activity.name.replace('\'', "_")

            this.client.con.query(`SELECT * FROM \`activityroles\` WHERE \`name\` = '${rolename}'`, async function (err, result) {
                //Error
                if(client.dev) return;

                if (err) return console.error(err);
                if(result[0]) {
                    const { roleid } = result[0];

                    try {
                        await newPresence.member.roles.add(`${roleid}`);
                    } catch (e) {
                        console.log(newPresence.member.username)
                        console.error(e)
                        console.log(rolename)
                    }

                    await newPresence.member.roles.add(client.dev ? "800110137582026757" : "795692239263105056");

                }

            });
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
