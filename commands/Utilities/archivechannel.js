const Command = require("../../Structure/Command");

// noinspection JSUnresolvedVariable
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
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
                    r.message.channel.setParent(this.client.dev ? "800110139155546212" : "796511159779065886");
                    let category = r.message.channel.guild.channels.cache.get(this.client.dev ? "800110139155546212" : "796511159779065886");
                    r.message.channel.overwritePermissions(category.permissionOverwrites, "Channel ins Archiv verschoben")
                    r.message.channel.send(`Channel wurde von ${message.author} archiviert!`);


                }
                try {
                    message.delete();
                    return m.delete();
                } catch (e) {
                    //Error
                    console.error(e);
                }
            });

        })


    }
}