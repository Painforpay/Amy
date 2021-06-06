const Event = require('../Structure/Event');
const {MessageAttachment, MessageEmbed} = require('discord.js');

// noinspection EqualityComparisonWithCoercionJS
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldMessage, newMessage) {

        if (oldMessage.partial || newMessage.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await oldMessage.fetch();
                await newMessage.fetch();

            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        if (!oldMessage.guild || newMessage.author.bot) return;

        if (newMessage.content.match(/discord(.gg|app.com\/invite)\/[a-zA-Z0-9]+/g) && !newMessage.member.hasPermission("MANAGE_MESSAGES")) {

            message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
            newMessage.channel.send(`${newMessage.member}, du darfst keine Invites posten!`);

            if((Date.parse(new Date()) - newMessage.member.joinedTimestamp) < 604800000) {
                let userData = {xp: "Unbekannt"};
                let reason = "Senden von Invitelinks"
                if(newMessage.member) {
                    userData = await this.client.utils.getUserData(newMessage.author.id);

                    if (!this.client.utils.comparePerms(newMessage.guild.member(this.client.user), newMessage.member)) {
                        return newMessage.channel.send(`Ich kann diesen Nutzer nicht kicken!`)
                    }
                    await message.author.send(`Du wurdest vom Wohnzimmer gekickt. Grund: \`${reason}\``).catch(() => null);
                }



                //ARMED
                await newMessage.member.kick(reason);

                let internerModlog = await this.client.channels.fetch(this.client.dev ? "800110138924466195" : "795773658916061264");
                let Modlog = await this.client.channels.fetch(this.client.dev ? "800110139155546203" : "795773686064873542");


                internerModlog.send(`🥾 ${newMessage.author.tag} [${newMessage.author.id}] wurde von ${this.client.user.username} wegen \`${reason}\` gekickt! XP: ${userData.xp}`);
                Modlog.send(`🥾 ${newMessage.author.tag} [${newMessage.author.id}] wurde gekickt!`);
                return;
            }
        }


        if (newMessage.content.startsWith(this.client.prefix)) {


            const [cmd, ...args] = newMessage.content.slice(this.client.prefix.length).trim().split(/ +/g);

            const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

            if (command) {


                if (command.ownerOnly && !this.client.utils.checkOwner(newMessage.author)) {

                    //User is not allowed to use this command, we don't want to do anything as it is not needed

                } else {

                    if (cmd.toLowerCase() != "eval") return;

                    let message = newMessage.channel.messages.cache.get(this.client.evals.get(newMessage.id));

                    let response = await this.client.utils.evaluate(newMessage, args.join(' '));


                    if (newMessage) {
                        if (response instanceof MessageEmbed) {

                            if (newMessage.attachments.map(x => x)[0]) {
                                await message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                                let evalresponse = await newMessage.channel.send(response);
                                this.client.evals.set(newMessage.id, evalresponse.id);
                            } else {
                                await newMessage.edit(response);
                            }


                        } else if (response instanceof MessageAttachment) {
                            await message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                            let evalresponse = await newMessage.channel.send(response);
                            this.client.evals.set(newMessage.id, evalresponse.id);
                        }
                    }
                }


            }

        }


    }


}