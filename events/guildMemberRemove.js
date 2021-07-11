const Event = require('../Structure/Event');
const { Collection } = require('discord.js');
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(member) {
        if (member.bot) return;
        const client = this.client;

        let builderData = {
            sqlType: "DELETE",
            table: "users",
            conditions: new Collection()
        }

        builderData.conditions.set('id', {operator: "=", value: member.id});

        let sqlQuery = await this.client.con.buildQuery(builderData);

        let result = await this.client.con.executeQuery(sqlQuery).catch(err => this.client.console.reportError(err.stack));

        if(result.affectedRows > 0) {
            this.client.console.reportLog(`[${client.utils.getDateTime()}] [MySQL] Successfully deleted Entry for User with ID '${member.id}' from the Database!`)
        }

        if (this.client.dev) return;
        try {

            this.client.serverChannels.get("joinlogs").send(`${member.user.tag} hat den Server verlassen.`);
        } catch (e) {
            console.error(e);
        }
    }


}