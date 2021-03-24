const Command = require("../Structure/Command");
const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['bd', 'birthday', 'geburtstag'],
            description: 'setzt den Geburtstag des Users',
            category: 'Utility',
            usage: `[<set> TT/MM] | [<delete>]`,
            guildOnly: false,
            ownerOnly: false,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {

        if (!args.length) return message.channel.send(`Bitte gib deinen Geburtstag im Format TT.MM ein!`);

        message.delete();
        switch (args[0]) {
            case "list": {
                return this.client.utils.birthdayembed(message);
            }
            case "set": {
                if (!args[1] || !args[1].match(/\d{1,2}\.\d{1,2}/)) {

                    return message.channel.send((args[1] ? `Du hast einen Formatierungsfehler gemacht!` : `Ohne deinen Geburtstag zu kennen, kann ich leider nichts einspeichern ^^`) + `\nBitte gib deinen Geburtstag im Folgendem Format an: \`!bday set 30.01\``).then(m => {
                        try {
                            m.delete({timeout: 10000});
                        } catch (e) {
                            //Error
                            console.error(e);
                        }
                    });
                }

                let split = args[1].split(".");
                let day = parseInt(split[0])

                let month = parseInt(split[1]);
                if (day > 31 || month > 12) {
                    return message.channel.send(`Uhm... Ein ${day > 31 ? "Monat" : (month > 12 ? "Jahr" : "")} hat nur maximal ${day > 31 ? "31 Tage" : (month > 12 ? "12 Monate" : "")}. Bitte versuche es erneut.`).then(m => {
                        try {
                            m.delete({timeout: 10000});
                        } catch (e) {
                            //Error
                            console.error(e);
                        }
                    });

                }


                if (month === 2 && day === 29) {
                    month = 3;
                    day = 1;
                    await message.channel.send("Für diesen ungewöhnlichen Tag muss ich das Datum auf den **ersten März** setzen. Ich hoffe das ist Okay!").then(m => {
                        try {
                            m.delete({timeout: 10000});
                        } catch (e) {
                            //Error
                            console.error(e);
                        }
                    });
                }

                switch (month) {
                    case 4:
                    case 6:
                    case 9:
                    case 11: {
                        return message.channel.send("Uhm... Der " + months[month - 1] + " hat nur maximal 30 Tage. Bitte versuch es erneut.").then(m => {
                            try {
                                m.delete({timeout: 10000});
                            } catch (e) {
                                //Error
                                console.error(e);
                            }
                        });
                    }
                }
                await this.client.utils.setBirthday(message, day, month);


            }
                break;
            default: {
                return message.channel.send("Dieser Unterbefehl existiert nicht. Bitte nutze \`!bd list\` oder \`!bday set\`").then(m => {
                    try {
                        m.delete({timeout: 10000});
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });
            }
        }
    }
}