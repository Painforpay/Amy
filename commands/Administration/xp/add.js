const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Erhöht die XP für einen User',
            category: 'users',
            guildOnly: true,
            parent: 'xp',
            minArgs: 2,
            argsDef: ["User", "Menge"]
        });
    }

    async run(message, args) {
        const client = this.client;



        let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]) || args[0];

        if(!member) {
            return message.channel.send(`Der Nutzer konnte nicht gefunden werden.`);
        }
        let value = args.pop();

        await client.utils.xpadd(member, value, false);
        client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${member.user.tag}\` um \`${value}\` erhöht!`);


        message.channel.send(`Erfahrungspunkte für \`${member.user.tag}\` wurden um \`${value}\` erhöht!`).then(m => {
            m.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
        })
        message.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))

    }

};
