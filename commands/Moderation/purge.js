const Command = require('../../Structure/Command');
module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Löscht eine bestimmte Anzahl an Nachrichten',
            category: 'moderation',
            userPerms: ['MANAGE_MESSAGES'],
            aliases: ["clearchat", "clear"],
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<anzahl/ping>'],
            additionalinfo: "Es kann die Anzahl der Nachrichten spezifiziert werden, oder der Nutzer gepingt."
        });
    }


    async run(message, args) {

        await message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

        const deleteCount = Math.abs(args[0]);
        const user = message.mentions.users.first();

        if (!user && !deleteCount) return message.channel.send("Bitte gib einen User oder die Anzahl der zu löschenden Nachrichten an, nach welchen gefiltert werden soll.");

        const fetchedMessages = await message.channel.messages.fetch({limit: 100, before: message.id});
        let filteredMessages = fetchedMessages;

        if (user) filteredMessages = fetchedMessages.filter(msg => msg.author.id === user.id);
        else filteredMessages = filteredMessages.array().slice(0, deleteCount);

        const deletedMessages = await message.channel.bulkDelete(filteredMessages, true).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
        if (!deletedMessages) return message.channel.send("Ein Fehler ist aufgetreten, bitte versuche es nochmal!");

        const deletedCount = deletedMessages.size;
        message.channel.send(`${deletedCount} Nachricht${deletedCount === 1 ? "" : "en"} wurden gelöscht.`).then(m => m.delete({timeout: 5000}).catch(() => null));


    }


};
