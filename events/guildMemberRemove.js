const Event = require('../Structure/Event');

module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(member) {
        if (member.bot) return;
        const client = this.client;

        this.client.con.query(`DELETE FROM \`users\` WHERE \`users\`.\`id\` = ${member.id};`, function (err) {
            if (err) throw err;


            console.log(`[${client.utils.getDateTime()}] [MySQL] Successfully deleted Entry for User with ID '${member.id}' from the Database!`)


        });
        if (this.client.dev) return;
        try {

            this.client.serverChannels.get("joinlogs").send(`${member.user.tag} hat den Server verlassen.`);
        } catch (e) {
            console.error(e);
        }
    }


}