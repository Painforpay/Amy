const Command = require('../Structure/Command');


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ['hardkick', 'bann'],
            description: 'Bannt einen User',
            category: 'Utilities',
            usage: `[<User>] [<Grund>]`,
            userPerms: ['BAN_MEMBERS'],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            args: true
        });
    }


    async run(message, args) {

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) ? message.guild.members.cache.get(args[0]) : args[0];

        if (!member) {

            message.channel.send("User nicht gefunden");


        } else {
            let modlog = message.guild.channels.cache.get(this.client.dev ? "800110139155546203" : "795773686064873542");
            let internallog = message.guild.channels.cache.get(this.client.dev ? "800110138924466195" : "795773658916061264");

            let user = await this.client.users.fetch(`${args[0]}`, true);
            await args.shift()


            let reason = args.length < 1 ? "[Kein Grund angegeben]" : args.join(' ');


            if (member.guild) {

                if (member === message.member) return message.channel.send("Du kannst dich nicht selbst bannen!")
                if (this.client.utils.comparePerms(message.member, member)) {
                    await this.client.utils.purgeMessagesforMember(member);
                    await member.ban(member, {reason: reason});
                    try {
                        message.delete();
                        modlog.send(`🛑 ${member.user.tag} [${user.id}] wurde gebannt!`);
                        internallog.send(`🛑 ${member.user.tag} [${user.id}] wurde von ${message.author} wegen \`${reason}\` gebannt!`);

                    } catch (e) {
                        //Error
                        console.error(e);
                    }

                } else {

                    try {
                        message.delete()
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                    message.channel.send("Du kannst diesen User nicht bannen!")
                }
            } else {
                await message.guild.members.ban(member, {reason: reason});

                try {
                    message.delete();
                    modlog.send(`🛑 ${user} [${user.id}] wurde geghostbannt!`);
                    internallog.send(`🛑 ${user} [${user.id}] wurde von ${message.author} wegen \`${reason}\` geghostbannt!`);
                } catch (e) {
                    //Error
                    console.error(e);
                }

            }


        }


    }


};
