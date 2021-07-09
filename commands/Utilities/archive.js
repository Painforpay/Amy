const Command = require("../../Structure/Command");

// noinspection JSUnresolvedVariable
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["archivechannel"],
            description: 'Archiviert Textkanäle',
            category: 'utilities',
            userPerms: ["MANAGE_CHANNELS"],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false
        });
    }

    async run(message) {

        //TODO - Wie archiviert man was wohin?


        message.channel.send("Willst du diesen Channel wirklich archivieren?").then(async m => {
            await m.react("✅");
            await m.react("❌");
            const collector = m.createReactionCollector((reaction, user) => user.id === message.author.id, {time: 15000});
            collector.on('collect', r => {
                if (r.emoji.name === "✅") {
                    r.message.channel.setParent(this.client.serverChannels.get("channelarchive"));
                    let category = this.client.serverChannels.get("channelarchive");
                    r.message.channel.overwritePermissions(category.permissionOverwrites, "Channel ins Archiv verschoben")
                    r.message.channel.send(`Channel wurde von ${message.author} archiviert!`);


                }

                    message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                    return m.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            });

        })


    }
}