const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: `Lässt Amy auf eine Nachricht reagieren`,
            category: 'utilities',
            userPerms: ['MANAGE_MESSAGES'],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            argsDef: ["MessageID", "Emoji"],
            minArgs: 2
        });
    }


    async run(message, args) {

        let reactionTargetMessage = await message.channel.messages.fetch(args[0], true, true);
        let emoji = args[1];
        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
        await reactionTargetMessage.react(emoji).catch(err => this.client.utils.log(`Es konnte nicht auf Nachricht reagiert werden!\n\`\`\`${err.stack}\`\`\``))


    }


};
