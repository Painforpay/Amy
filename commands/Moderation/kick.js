const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Kickt einen User',
            category: 'moderation',
            userPerms: ['KICK_MEMBERS'],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            minArgs: 1,
            argsDef: ["<id/ping>", "<grund>"]
        });
    }


    async run(message, args) {

        message.delete();
        let BanmemberID = message.mentions.members.first() || args[0];

        let user = await this.client.users.fetch(BanmemberID.id ? BanmemberID.id : BanmemberID).catch(err => {
            this.client.console.reportError(err.stack)
            message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)

        });
        if (!user) return;
        let member = message.guild.member(user);

        await args.shift();

        let reason = args.join(" ") || '[Kein Grund angegeben]'
        if (!member) {
            return message.channel.send("User nicht gefunden");
        }
        if (message.member.id === user.id) return message.channel.send(`Du kannst dich nicht selbst kicken!`)

        let userData = {xp: "Unbekannt"};

        if(member) {
            userData = await this.client.utils.getUserData(user.id);
            if (!this.client.utils.comparePerms(message.member, member)) {
                return message.channel.send(`Du kannst diesen Nutzer nicht kicken!`)
            }

            if (!this.client.utils.comparePerms(message.guild.member(this.client.user), member)) {
                return message.channel.send(`Ich kann diesen Nutzer nicht kicken!`)
            }
            await user.send(`Du wurdest vom Wohnzimmer gekickt. Grund: \`${reason}\``).catch(() => null);
        }



        //ARMED
        await member.kick(reason);

        let internerModlog = this.client.serverChannels.get("internalModLog");
        let Modlog = this.client.serverChannels.get("modlog");


        internerModlog.send(`🥾 ${member.user.tag} [${user.id}] wurde von ${message.author} wegen \`${reason}\` gekickt! XP: ${userData.xp}`);
        Modlog.send(`🥾 ${member.user.tag} [${user.id}] wurde gekickt!`);

    }


};

