const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Erhöht das Level für einen Nutzer',
            category: 'users',
            guildOnly: true,
            parent: __dirname.split(require('path').sep).pop(),
            minArgs: 2,
            argsDef: ["<User>", "<Menge>"]
        });
    }

    async run(message, args) {
        message.delete();
        const client = this.client;

        let memberID = message.mentions.members.first() || args[0];

        let user = await this.client.users.fetch(memberID.id ? memberID.id : memberID).catch(err => {
            this.client.console.reportError(err.stack);
            message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)

        });
        if (!user) return;
        let member = message.guild.member(user);
        let value = args.pop();
        if(isNaN(value)) {
            return message.channel.send(`Bitte einen numerischen Wert für die Menge angeben`).then(m => {
                m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))
            })
        }

        let UserData = await this.client.utils.getUserData(member.id);

        let xp = UserData.xp;
        let levelup = value;
        let currentLevel = await client.utils.getLevelforXp(xp);
        let nextLevel = parseInt(currentLevel) + parseInt(levelup)
        let nextLevelXP = await client.utils.getLevelXp(nextLevel);

        let required = nextLevelXP - xp;

        await client.utils.xpAdd(member, required, false);

        client.console.reportLog(`${message.author} hat das Level von \`${member.user.tag}\` um \`${levelup}\` erhöht! [${currentLevel} -> ${nextLevel}]`, true, true, false);


        message.channel.send(`Level für \`${member.user.tag}\` wurde um \`${value}\` erhöht!`).then(m => {
            m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))
        })


    }

};
