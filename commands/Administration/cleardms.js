const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Löscht alle DM Nachrichten die Amy gesendet hat.',
            category: 'administration',
            userPerms: ['ADMINISTRATOR'],
            guildOnly: true,
            ownerOnly: true
        });
    }


    async run(message) {

        let dms = this.client.channels.cache.filter( c => c.type === "dm");
        let amount = 0;
        for await (const dm of dms) {
            await dm.messages.fetch();
            let own = dm.messages.filter(dm => dm.author === this.client.user);

            amount += own.size;
        }

        console.log(amount);

    }


};
