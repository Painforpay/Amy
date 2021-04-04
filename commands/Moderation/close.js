const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Schließt ein Ticket',
            category: 'moderation',
            userPerms: ['KICK_MEMBERS'],
            additionalinfo: "Kann nur in der Supportkategorie genutzt werden!",
            guildOnly: true
        });
    }


    async run(message) {

        if (message.channel.id !== (this.client.dev ? "800110137820971040" : "796119563803689050") && message.channel.parentID === (this.client.dev ? "800110137820971039" : "796198520616517652")) {
            await message.channel.send(`Dieses Ticket wurde von ${message.author} geschlossen!`);
            await message.channel.setParent(this.client.dev ? "800110139155546210" : "796204539911864340");
            let category = message.channel.guild.channels.cache.get(this.client.dev ? "800110139155546210" : "796204539911864340");

            await message.channel.overwritePermissions(category.permissionOverwrites, "Channel ins Archiv verschoben")

            try {
                return message.delete()

            } catch (e) {
                //Error
                console.error(e);
            }
        } else {

            message.channel.send("Dies ist kein Supportticket!")
        }

    }


};
