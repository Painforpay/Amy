const Command = require('../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['cacheadd', 'getmessage'],
            description: 'Bannt einen User',
            category: 'Utilities',
            usage: `[<User>] [<Grund>]`,
            userPerms: ['ADMINISTRATOR'],
            guildOnly: true,
            ownerOnly: true,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {
        message.delete();
        try {
            let fetched = await message.channel.messages.fetch(args[0], true);

            message.channel.send(`Nachricht mit der ID: ${fetched.id} - Author: ${fetched.author} wurde erfolgreich in den Cache geladen!`).then(m => {
                try {
                    m.delete({timeout: 10000});
                } catch (e) {
                    //Error
                    console.error(e);
                }
            });



        } catch (e) {
            //Error
            message.channel.send(`Es gab einen Fehler beim Cachen der Nachricht! ID: ${args[0]}${e.httpStatus === 404 ? "\nNachricht konnte nicht gefunden werden. (404 Not Found)" : e.httpStatus}`).then(m => {
                try {
                    m.delete({timeout: 10000});
                } catch (e) {
                    //Error
                    console.error(e);
                }
            });

        }





    }


};
