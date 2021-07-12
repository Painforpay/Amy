const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Fährt Amy herunter.',
            category: 'administration',
            userPerms: ['ADMINISTRATOR'],
            guildOnly: true,
            ownerOnly: true
        });
    }


    async run(message) {

        message.channel.send("Willst du wirklich herunterfahren?").then(async m => {
            await m.react("✅");
            await m.react("❌");
            const collector = m.createReactionCollector((reaction, user) => user.id === message.author.id, {time: 15000});
            collector.on('collect', async r => {
                if (r.emoji.name === "✅") {


                    try {
                        this.client.serverChannels.get("botlogs").send(`Status: Shutting Down...`);
                        await this.client.utils.giveRemaining();
                        await message.delete().catch(err => this.client.console.reportError(err.stack));
                        await m.delete().catch(err => this.client.console.reportError(err.stack));
                        this.client.destroy()
                        return process.exit();
                    } catch (e) {
                        //Error
                        console.error(e);
                    }


                } else {
                    try {
                        message.delete().catch(err => this.client.console.reportError(err.stack));
                        return m.delete().catch(err => this.client.console.reportError(err.stack));
                    } catch (e) {
                        //Error
                        console.error(e);
                    }


                }
            });

        })
    }


};
