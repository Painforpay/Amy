const Command = require('../Structure/Command');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch')


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['evaluate', 'botexec'],
            description: 'Evaluiert einen Command',
            category: 'Utilities',
            usage: `[code]`,
            userPerms: ['ADMINISTRATOR'],
            guildOnly: true,
            ownerOnly: true,
            nsfw: false,
            args: false
        });
    }


    async run(message, args) {
        let attachments = message.attachments.map(x => x)
        let code;
        if(attachments[0]) {

            if(!attachments[0].name.endsWith(`.txt`)) return message.reply(` ich Akzeptiere nur Textdateien mit \`.txt\` Endung`);

            code = new Promise((resolve) => {
                fetch(attachments[0].url).then(data => data.text().then(toExceute => resolve(toExceute)))

            })

        } else {

            if(!args[0]) return message.reply(` bitte gib weitere Argumente an. Nutzung des Befehls: \`!eval [code]\``)
            code = args.join(' ');
        }



        let m = await message.channel.send(`Processing...`);
       let response = await this.client.utils.evaluate(message, (await code));
       let evalresponse;
       if(response instanceof MessageEmbed) {

           evalresponse = await message.channel.send(response)
           m.delete().catch(() => null)
       } else if (response instanceof MessageAttachment) {

           evalresponse = await message.channel.send(response);
           m.delete().catch(() => null)
       }
       this.client.evals.set(message.id, evalresponse.id);

    }


    
};
