const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Setzt die XP für einen User',
            category: 'users',
            guildOnly: true,
            parent: 'xp',
            minArgs: 2,
            argsDef: ["UserPing", "Menge"]
        });
    }

    async run(message, args) {
        const client = this.client;

        let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]) || args[0];

        if(!member) {
            return message.channel.send(`Der Nutzer konnte nicht gefunden werden.`);
        }


        let value = args.pop();


        this.client.con.query(`UPDATE users SET \`xp\` = '${value}' WHERE id = "${member.id}";`, function (err) {
            if(err) {
                client.utils.log(e.stack);
                return message.channel.send(`Es gab einen Fehler bei der Ausführung des Befehls!`)
            }

            client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${member.user.tag}\` auf \`${value}\` angepasst!`);

            message.channel.send(`Erfahrungspunkte für \`${member.user.tag}\` wurden auf \`${value}\` angepasst!`).then(m => {
                m.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
            })

            message.delete({timeout: 15000}).catch( err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))

        });
    }

};