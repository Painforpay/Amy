const Discord = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Zeigt jede Person an die Besagte Rolle hat.',
            aliases: ["lu"],
            category: 'roles',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<rollenname>'],
            additionalinfo: "Es kann darf keine Rolle gepingt werden - Der exakte Name reicht."
        });
    }


    async run(message, args) {
        message.delete();


        let embed = new Discord.MessageEmbed()
            .setColor("#FFD700")
            .setTimestamp();


        let role = await message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());


        if (role) {
            let members = role.members;
            let list = `User mit der Rolle ${role.name}:\nAnzahl: **${members.filter(member => !member.user.bot).size}**\n`
            if (!members) return message.channel.send("Es gibt keine Nutzer mit dieser Rolle");
            await members.forEach(member => {
                if (!member.user.bot) {
                    list += `${member}`;
                    list += "\n";
                }
            })

            await embed.setDescription(`✅\n${list}`);

        } else {

            await embed.setDescription(`❌\nDiese Rolle existiert leider nicht.`)
        }


        await message.channel.send({embed: embed}).then(m => {
            try {
                m.delete({timeout: 15000});
            } catch (e) {

            }
        });

    }
};
