const SubCommand = require('../../../Structure/SubCommand');
const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Setzt den Geburtstag eines Users',
            category: 'users',
            guildOnly: true,
            parent: __dirname.split(require('path').sep).pop(),
            minArgs: 1,
            argsDef: ["<TT.MM>"]
        });
    }

    async run(message, args) {

        if (!args[0] || !args[0].match(/\d{1,2}\.\d{1,2}/)) {

            return message.channel.send((args[0] ? `Du hast einen Formatierungsfehler gemacht!` : `Ohne deinen Geburtstag zu kennen, kann ich leider nichts einspeichern ^^`) + `\nBitte gib deinen Geburtstag im Folgendem Format an: \`!bday set 30.01\``).then(m => {

                    m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            });
        }

        let split = args[0].split(".");
        let day = parseInt(split[0])

        let month = parseInt(split[1]);
        if (day > 31 || month > 12) {
            return message.channel.send(`Uhm... Ein ${day > 31 ? "Monat" : (month > 12 ? "Jahr" : "")} hat nur maximal ${day > 31 ? "31 Tage" : (month > 12 ? "12 Monate" : "")}. Bitte versuche es erneut.`).then(m => {

                    m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            });

        }


        if (month === 2 && day === 29) {
            month = 3;
            day = 1;
            await message.channel.send("Für diesen ungewöhnlichen Tag muss ich das Datum auf den **ersten März** setzen. Ich hoffe das ist Okay!").then(m => {

                    m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

            });
        }

        switch (month) {
            case 4:
            case 6:
            case 9:
            case 11: {

                if (month > 30) {
                    return message.channel.send("Uhm... Der " + months[month - 1] + " hat nur maximal 30 Tage. Bitte versuch es erneut.").then(m => {

                            m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

                    });
                }
            }
        }
        await this.client.utils.setBirthday(message, day, month);

    }
}