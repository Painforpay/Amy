const Command = require('../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['react'],
            description: 'reagiert mit einem emoji auf eine Nachricht',
            category: 'Utilities',
            usage: `[<MessageID>] [<Emoji>]`,
            userPerms: ['MANAGE_MESSAGES'],
            guildOnly: true,
            ownerOnly: true,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {

        if (!args) return message.delete();

        let Rmessage = await message.channel.messages.fetch(args[0], true, true);
        let emoji = args[1];
        message.delete();
        await Rmessage.react(emoji);


    }


};
