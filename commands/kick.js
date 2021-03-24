const Command = require('../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['kick', 'softban'],
            description: 'Kickt einen User',
            category: 'Utilities',
            usage: `[<User>] [<Grund>]`,
            userPerms: ['KICK_MEMBERS'],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member) {
            message.channel.send("User nicht gefunden");
        } else {
            let modlog = message.guild.channels.cache.get(this.client.dev ? "800110139155546203" : "795773686064873542");
            let internallog = message.guild.channels.cache.get(this.client.dev ? "800110138924466195" : "795773658916061264");

            await args.shift()

            let reason = args.length < 1 ? "[Kein Grund angegeben]" : args.join(' ');


            if (this.client.utils.comparePerms(message.member, member)) {
                await this.client.utils.purgeMessagesforMember(member);
                await member.kick(reason);
                try {
                    message.delete()
                } catch (e) {
                    //Error
                    console.error(e);
                }
                message.delete();
                modlog.send(`🥾 ${member.user.tag} [${user.id}] wurde gekickt!`);
                internallog.send(`🥾 ${member.user.tag} [${user.id}] wurde von ${message.author} wegen \`${reason}\` gekickt!`);

            } else {


                try {
                    message.delete({timeout: 500})
                } catch (e) {
                    //Error
                    console.error(e);
                }

                message.channel.send("Du kannst diesen User nicht kicken!")
            }


        }


    }


};
