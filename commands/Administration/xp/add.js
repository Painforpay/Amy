const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Erhöht die XP für einen Nutzer',
            category: 'users',
            guildOnly: true,
            parent: 'xp',
            minArgs: 2,
            argsDef: ["<User>", "<Menge>"]
        });
    }

    async run(message, args) {
        const client = this.client;

        let memberID = message.mentions.members.first() || args[0];

        let user = await this.client.users.fetch(memberID.id ? memberID.id : memberID).catch(err => {
            this.client.utils.log(`Fehler beim Fetchen des Nutzers.\n\`\`\`${err}\`\`\``)
            message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)

        });
        if (!user) return;
        let member = message.guild.member(user);
        let value = args.pop();

        await client.utils.xpadd(member, value, false);
        client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${member.user.tag}\` um \`${value}\` erhöht!`);


        message.channel.send(`Erfahrungspunkte für \`${member.user.tag}\` wurden um \`${value}\` erhöht!`).then(m => {
            m.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
        })
        message.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))

    }

};
