const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Erhöht das Level für einen User',
            category: 'users',
            guildOnly: true,
            parent: 'xp',
            minArgs: 2,
            argsDef: ["User", "Menge"]
        });
    }

    async run(message, args) {
        const client = this.client;



        let member;
        try {
            member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        } catch(e) {
            client.utils.log(`Fehler bein fetchen eines Nutzers!\n\`\`\`${e}\`\`\``)
            return message.channel.send(`Der Nutzer konnte nicht gefunden werden.`);
        }
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
