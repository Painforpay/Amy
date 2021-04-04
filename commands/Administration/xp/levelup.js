const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Erhöht das Level für einen Nutzer',
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

        let UserData = await this.client.utils.getUserData(member.id);

                let xp = UserData.xp;
                let levelup = value;
                let currentLevel = await client.utils.getLevelforXp(xp);
                let nextLevel = currentLevel+levelup
                let nextLevelXP = await client.utils.getLevelXp(nextLevel);

                let required = nextLevelXP - xp;

                await client.utils.xpadd(member, required, false);

                client.utils.log(`${message.author} hat das Level von \`${member.user.tag}\` um \`${levelup}\` erhöht! [${currentLevel} -> ${nextLevel}]`);


        message.channel.send(`Level für \`${member.user.tag}\` wurde um \`${value}\` erhöht!`).then(m => {
            m.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
        })
        message.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))



    }

};
