const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Verbietet einem User Temporär das sprechen!',
            category: 'moderation',
            userPerms: ['MANAGE_ROLES'],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            minArgs: 1,
            argsDef: ["<id/ping>", "<Zeit in Min>"],
            additionalinfo: "Es können mit einem Punkt (.) als seperator auch bruchteile von Minuten angegeben werden."
        });
    }


    async run(message, args) {

        let BanmemberID = message.mentions.members.first() || args[0];

        let user = await this.client.users.fetch(BanmemberID.id ? BanmemberID.id : BanmemberID).catch(err => {
            this.client.console.reportError(err.stack)
            message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)

        });
        if (!user) return;
        let member = message.guild.member(user);
        if (message.member.id === user.id && !this.client.dev) return message.channel.send(`Du kannst dich nicht selbst muten!`)

        if (member && !this.client.utils.comparePerms(message.member, member) && message.guild.ownerID != message.member.id) {
            return message.channel.send(`Du kannst diesen Nutzer nicht muten!`)
        }

        if (!this.client.utils.comparePerms(message.guild.member(this.client.user), member)) {
            return message.channel.send(`Ich kann diesen Nutzer nicht muten!`)
        }
        if (!member) return message.channel.send("Fehler beim Muten des Nutzers!")
        await args.shift();

        let time = parseInt(args[0]) || 1;


        //ARMED

        if (member) {

            await this.client.utils.muteMember(member, time, message.member)

        }


    }


};
