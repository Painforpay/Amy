const Command = require("../../Structure/Command");


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Setze deinen AFKStatus',
            aliases: ["afk"],
            category: 'User',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<Grund>']
        });
    }


    async run(message, args) {
        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
        let reason = args.join(" ");

        reason = reason.replace(/(<.*:.+:.+>)|(:.*:)/gi, "")

        let fResult = await this.client.utils.profanityFilter(reason)

        if (fResult["is-bad"]) {
            message.member.send(`Liste der Wörter:\n**${fResult["bad-words-list"].join(`, `)}**`).catch(() => null);
            message.channel.send(`Dieser Grund enthält Wörter die ich nicht nutzen kann!`).then(m => m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));
            return;
        }

        if(reason.split("").length === 0) {
            reason = "Kein Nutzbarer Grund angegeben";
        }

        this.client.setAfkUsers.set(message.author.id, {
            reason: reason,
            timestamp: Date.parse(new Date()),
            uid: message.author.id
        })


        if (!message.member.roles.cache.has(this.client.dev ? "831069345860943904" : "831069006759854150")) {
            await message.member.roles.add(this.client.dev ? "831069345860943904" : "831069006759854150");
        }

        message.channel.send(`${message.member}\nDu wurdest nun als Afk markiert. Wenn du eine Nachricht schreibst, wird dir der Status wieder entfernt!\nWir empfehlen dass du dich auf Nicht Stören stellst, da du immernoch gepingt werden kannst.`).then(m => m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)))

    }
};
