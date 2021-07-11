const Command = require("../../Structure/Command");


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Setze deine Biographie',
            aliases: ["bio"],
            category: 'User',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<Biographie>'],
            additionalinfo: `Die Biographie kann eine Maximale Länge von 190 Zeichen haben`
        });
    }


    async run(message, args) {
        message.delete().catch(err => this.client.console.reportError(err.stack));
        let reason = args.join(" ");
        let bio = reason;
        reason = reason.replace(/(<.*:.+:.+>)|(:.*:)/gi, "");

        let fResult = await this.client.utils.profanityFilter(reason)

        if (fResult["is-bad"]) {

            message.channel.send(`Diese Biographie enthält Wörter die ich nicht nutzen kann!`).then(m => m.delete({timeout: 10000}).catch(err => this.client.console.reportError(err.stack)));
            return;
        }
        if(bio.length > 190) {
            bio = `${bio.slice(0, 190 - 3)}...`
        }
        await this.client.utils.setBiography(message, bio);

    }
};
