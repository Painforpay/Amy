const Event = require('../Structure/Event');


const ignorelist = ["📩post-your-project", "cmds", "steckbriefrollen", "messagelog"];


module.exports = class extends Event {

    async run(message) {

        if (this.client.evals.has(message.id)) {

            if (message.channel) {
                const messageembed = await (this.client.channels.cache.get(message.channel.id)).messages.fetch((this.client.evals.get(message.id)));
                messageembed.delete().catch(() => null);
            }
            return this.client.evals.delete(message.id);
        }


        if (message.partial || !message.guild || message.author.bot || message.system || ignorelist.find(ch => ch === message.channel.name) || message.content.startsWith(this.client.prefix)) return;


        const audits = await message.guild.fetchAuditLogs({type: 72});
        const entries = audits.entries.first(5);
        const isNewEntry = Date.now() - entries[0].createdTimestamp < 500;
        let moderator = isNewEntry ? entries[0].executor : null;

        if (!moderator) {
            for (const entry of entries) {
                const oldCount = this.client.deletedAudits.get(entry.id);
                this.client.deletedAudits.set(entry.id, entry.extra.count);
                if (oldCount && oldCount < entry.extra.count) {
                    moderator = entry.executor;
                    break;
                }
            }
        }

        const attachments = message.attachments.size ? message.attachments.map(attachment => attachment.proxyURL) : "";
        const messagecheck = message.content ? message.content : "siehe attachments";
        const nachricht = `\`${messagecheck}\` von '${message.author.tag}' in ${message.channel} wurde von '${moderator ? moderator.tag : message.author.tag}' gelöscht.\n`;

        const channel = message.guild.channels.cache.get(this.client.dev ? "800110139155546208" : "795041075583516702");
        if (channel) channel.send(nachricht, attachments ? {files: attachments} : null);


    }

};
