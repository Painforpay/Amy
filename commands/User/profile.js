const { MessageEmbed } = require('discord.js');
const Command = require("../../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["p", "profil"],
            description: 'Zeigt dir dein Profil!',
            category: 'user',
            guildOnly: true,
            cooldown: 60,
            argsDef: ["<userping>"]
        });
    }


    async run(message, args) {
        message.delete();
        let member = message.member;

        let client = this.client;
        if(args.length > 0) {
            let UserID = message.mentions.members.first() || args[0];

            let user = await this.client.users.fetch(UserID.id ? UserID.id : UserID).catch(err => {
                return message.channel.send(`Es gab einen Fehler beim erkennen des Nutzers.`)
            });
            if (user) {
                member = await message.guild.member(user);
            }
        }




        let result = await this.client.utils.getUserData(member.id);



        if (result && !member.user.bot) {
            let currentLevel = await client.utils.getLevelforXp(result.xp)
            let nextLevelValue = currentLevel + 1;
            let currentLevelMinXP = await client.utils.getLevelXp(currentLevel);
            let nextLevelMinXP = await client.utils.getLevelXp(nextLevelValue);

            let currentXP = result.xp;


            let progress = ((currentXP - currentLevelMinXP > 0 ? currentXP - currentLevelMinXP : 0) / (nextLevelMinXP - currentLevelMinXP)) * 100;
            let remainingXP = nextLevelMinXP - currentXP;
            let anzahl = Math.floor(progress / 5);


            let progressbar = "▕**";

            for (let i = 0; i < anzahl; i++) {

                progressbar += "█";
            }
            let fill = 20 - anzahl;
            for (let i = 0; i < fill; i++) {

                progressbar += "░";
            }

            progressbar += "**▏";

            let placement = await client.utils.getPlacementforUser(member.id, currentXP)

            let userAwards = await this.client.utils.getUserAwards(member.id);

            let sonstiges = [];

            let vcAck = {
                today: 0,
                weekly: 0,
                monthly: 0
            }

            if(this.client.vcAck.has(member.id)) {
                vcAck = this.client.vcAck.get(member.id);
            }

            let msgAck = {
                today: 0,
                weekly: 0,
                monthly: 0
            }

            if(this.client.msgAck.has(member.id)) {
                msgAck = this.client.msgAck.get(member.id);
            }

            let isAFK = false;
            let reasonAFK;
            if(this.client.setAfkUsers.has(member.id)) {
                let userinfoAFK = this.client.setAfkUsers.get(member.id);
                isAFK = true;
                reasonAFK = userinfoAFK.reason;
            }

            //fill sonstiges
            if(this.client.owners.includes(member.user)) {
                sonstiges.push(`Amys Developer`)
            }

            if(isAFK) {
                sonstiges.push(`AFK:\n**${reasonAFK}**`)
            }

            if(member.voice.channel) {
                sonstiges.push(`Aktuell im Voice:\n${member.voice.channel}`)
            }
            if(result.inactive > 30) {
                sonstiges.push(`Inaktiv:\nSeit **${result.inactive}** Tagen!`)
            }
            sonstiges.push(`Account erstellt am:\n**${this.client.utils.getDateTime(member.user.createdTimestamp)}**`)
            sonstiges.push(`Beigetreten am:\n**${this.client.utils.getDateTime(member.joinedTimestamp)}**`)


            let embed = new MessageEmbed()
                .setColor("#ffd900")
                .setThumbnail(member.user.displayAvatarURL({dynamic: true, size: 2048}))
                .setTitle(`Nutzerprofil von ${member.nickname || member.user.username}${isAFK ? " [AFK]" : ""}`)
                .setDescription(`
                ${currentXP > 0 ? (placement < 4 ? `🏆 ` : `🏁 `) +`**Platz ${placement}**` : ""}
                ✨ LEVEL **${currentLevel}** [${Math.floor(progress)}%] ✨
                **${(Math.round(result.xp * 100) / 100).toFixed(0)} Erfahrungspunkte**
                **${(Math.round(remainingXP * 100) / 100).toFixed(0)} Erfahrungspunkte** für Level **${nextLevelValue}**
                
                ${currentLevelMinXP}${progressbar}${nextLevelMinXP}
                
                ✍ **Biographie** ✍
                \`${result.userBio ? `${result.userBio}`: "Keine Bio verfügbar!"}\`
                
                💸 **Guthaben** 💸
                ${result.balance ? result.balance : 0} 🪙
                
                🎉 *Erfolge* 🎉
                ${userAwards.length > 0 ? userAwards.join("\n") : "Leider keine Erfolge vorhanden! "}
                `)
                .addField("Aktivität", `
                *VoiceChat:*
                Heute: ${this.timeConvert(Math.floor(vcAck.today))}
                Diese Woche: ${this.timeConvert(Math.floor(vcAck.weekly))}
                Diesen Monat: ${this.timeConvert(Math.floor(vcAck.monthly))}
                
                *Nachrichten:*
                Heute: **${msgAck.today}**
                Diese Woche: **${msgAck.weekly}**
                Diesen Monat: **${msgAck.monthly}**
                `, true)
                .setTimestamp();



            if(sonstiges.length > 0) {
                embed.addField(`Sonstiges`, sonstiges.join("\n"), true);
            }

            message.channel.send({embed: embed}).then(m => {
                m.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
            })

        } else {
            message.channel.send(`Keine Nutzerdaten für ${member.nickname || member.user.username} gefunden!`).then(m => {
                m.delete({timeout: 15000}).catch(err => client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``))
            })
        }


    }

    timeConvert(n) {
        let num = n;
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);

        let returnvalue = "**";

        if(rhours > 0) {
            returnvalue += rhours + `** *Stunde${rhours === 1 ? "" : "n"}* und **`;
        }
        return returnvalue + rminutes + `** *Minute${rminutes === 1 ? "" : "n"}*.`;
    }

};
