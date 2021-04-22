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
                        (await this.client.channels.fetch(this.client.dev ? "803530075571224627" : "803530018369830922", true)).send(`Status: Shutting Down...`);
                        await this.client.utils.giveRemaining(message)
                        await message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        await m.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        this.client.destroy()
                        return process.exit();
                    } catch (e) {
                        //Error
                        console.error(e);
                    }


                } else {
                    try {
                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        return m.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                    } catch (e) {
                        //Error
                        console.error(e);
                    }


                }
            });

        })
    }


};
