const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Verringert die XP für einen Nutzer',
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
        let valueToTake = value;
        const UserData = this.client.utils.getUserData(member.id);

        let currentXP = UserData.xp;
        let toMuch = false;
        if(value > currentXP) {
            toMuch = true;
            valueToTake = currentXP;

        }

        client.con.query(`UPDATE users SET \`xp\` = \`xp\` - \`${valueToTake}\` WHERE id = ${member.id};`,function (err,result) {
            if(err) {
                client.utils.log(e.stack);
                return message.channel.send(`Es gab einen Fehler bei der Ausführung des Befehls!`)
            }

            message.channel.send(`${toMuch ? `${member.user.tag} hat weniger als ${value} Erfahrung! Ich entferne daher ${valueToTake} Erfahrung und somit alles!\n\n`: ""}Erfahrungspunkte für \`${member.user.tag}\` wurden um \`${valueToTake}\` verringert!`).then(m => {
                m.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
            })


            client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${member.user.tag}\` um \`${value}\` verringert!`);
            message.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))


        })

    }

};