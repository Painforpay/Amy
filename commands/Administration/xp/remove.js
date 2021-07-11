const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Verringert die XP für einen Nutzer',
            category: 'users',
            guildOnly: true,
            parent: __dirname.split(require('path').sep).pop(),
            minArgs: 2,
            argsDef: ["<User>", "<Menge>"]
        });
    }

    async run(message, args) {
        const client = this.client;

        let memberID = message.mentions.members.first() || args[0];

        let user = await this.client.users.fetch(memberID.id ? memberID.id : memberID).catch(err => {
            this.client.console.reportError(err.stack)
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

        let valueToTake = value;
        const UserData = this.client.utils.getUserData(member.id);

        let currentXP = UserData.xp;
        let toMuch = false;
        if (value > currentXP) {
            toMuch = true;
            valueToTake = currentXP;

        }

        client.con.query(`UPDATE users SET \`xp\` = \`xp\` - \`${valueToTake}\` WHERE id = ${member.id};`, function (err) {
            if (err) {
                client.console.reportError(err.stack);
                return message.channel.send(`Es gab einen Fehler bei der Ausführung des Befehls!`)
            }

            message.channel.send(`${toMuch ? `${member.user.tag} hat weniger als ${value} Erfahrung! Ich entferne daher ${valueToTake} Erfahrung und somit alles!\n\n` : ""}Erfahrungspunkte für \`${member.user.tag}\` wurden um \`${valueToTake}\` verringert!`).then(m => {
                m.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))
            })


            client.console.reportLog(`${message.author} hat die Erfahrungspunkte für \`${member.user.tag}\` um \`${value}\` verringert!`, true, true);
            message.delete({timeout: 15000}).catch(err => client.console.reportError(err.stack))


        })

    }

};