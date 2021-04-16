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

        if (newMessage.content.match(/discord(.gg|app.com\/invite)\/[a-zA-Z0-9]+/g)) {
            try {
                newMessage.delete();
                newMessage.channel.send(`${newMessage.member}, du darfst keine Invites posten!`);
            } catch (e) {
                //Error
                console.error(e);
            }
        }


        if (newMessage.content.startsWith(this.client.prefix)) {


            const [cmd, ...args] = newMessage.content.slice(this.client.prefix.length).trim().split(/ +/g);

            const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

            if (command) {


                if (command.ownerOnly && !this.client.utils.checkOwner(newMessage.author)) {

                    //User is not allowed to use this command, we don't want to do anything as it is not needed

                    return;
                } else {

                    if (cmd.toLowerCase() != "eval") return;

                    let message = newMessage.channel.messages.cache.get(this.client.evals.get(newMessage.id));

                    let response = await this.client.utils.evaluate(newMessage, args.join(' '));


                    if (message) {
                        if (response instanceof MessageEmbed) {

                            if (message.attachments.map(x => x)[0]) {
                                await message.delete().catch(() => null);
                                let evalresponse = await message.channel.send(response);
                                this.client.evals.set(newMessage.id, evalresponse.id);
                            } else {
                                await message.edit(response);
                            }


                        } else if (response instanceof MessageAttachment) {
                            await message.delete();
                            let evalresponse = await message.channel.send(response);
                            this.client.evals.set(newMessage.id, evalresponse.id);
                        }
                    }
                }


            }

        }


    }


}