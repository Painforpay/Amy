const Command = require('../../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            description: 'Bannt einen User vom Server',
            category: 'moderation',
            userPerms: ['BAN_MEMBERS'],
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
            this.client.utils.log(`Fehler beim Fetchen des Nutzers.\n\`\`\`${err}\`\`\``)
            message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)

        });
        if (!user) return;
        let member = message.guild.member(user);

        await args.shift();

        let reason = args.join(" ") || '[Kein Grund angegeben]'

        if (message.member.id === user.id) return message.channel.send(`Du kannst dich nicht selbst bannen!`)

        let userData = {xp: "Unbekannt"};

        if(member) {
            userData = await this.client.utils.getUserData(user.id);
            if (member && !this.client.utils.comparePerms(message.member, member)) {
                return message.channel.send(`Du kannst diesen Nutzer nicht bannen!`)
            }

            if (!this.client.utils.comparePerms(message.guild.member(this.client.user), member)) {
                return message.channel.send(`Ich kann diesen Nutzer nicht bannen!`)
            }
            await user.send(`Du wurdest vom Wohnzimmer gebannt. \nGrund: \`${reason}\`\nBans sind permanent. Sollte ein Missverständnis vorliegen, melde dich bitte bei einem Owner! ${this.client.owners.join(" ")}`).catch(() => null);

        }



        //ARMED
        await message.guild.members.ban(user.id, {reason: reason, days: 7});

        let internerModlog = await this.client.channels.fetch(this.client.dev ? "800110138924466195" : "795773658916061264");
        let Modlog = await this.client.channels.fetch(this.client.dev ? "800110139155546203" : "795773686064873542");


        internerModlog.send(`:octagonal_sign: ${user.tag} [${user.id}] wurde von ${message.member} wegen \`${reason}\` gebannt!  XP: ${userData.xp}`)
        Modlog.send(`:octagonal_sign: ${user.tag} [${user.id}] gebannt!`)

    }


};
