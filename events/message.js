const Event = require('../Structure/Event');
let compliments = ['https://tenor.com/view/thank-you-so-much-hearts-pink-than-yyou-thanks-thank-you-gif-12086415', 'https://tenor.com/view/cute-bear-thank-you-thanks-gif-14105969', 'https://tenor.com/view/thank-you-alice-in-wonderland-thanks-gif-9790628', 'https://tenor.com/view/jonah-hill-yay-african-child-screaming-shouting-gif-7212866', 'https://tenor.com/view/cute-comfort-massage-gif-15134902', 'https://tenor.com/view/peach-cat-hug-hug-up-love-mochi-mochi-peach-cat-gif-16334628', 'https://tenor.com/view/hug-virtual-hug-hug-sent-gif-5026057']

module.exports = class extends Event {

    async run(message) {

        if (message.partial) {

            try {

                await message.fetch();

            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);

                return;
            }
        }




        const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);
        const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}> `);

        if (message.type !== "DEFAULT") return;
        if (message.system === true) return;
        if (message.author.bot) return;
        if (message.channel.type === "dm") {

            if (message.content.toLowerCase().match(/.*(danke\n*.*amy).*/g)) {
                let gif = this.client.utils.getRandom(compliments)
                return message.channel.send(gif).then(m => {
                    try {
                        m.delete({timeout: 3600000})
                    } catch (e) {
                        //Error
                        console.error(e);
                    }

                });
            }

            return; //await this.client.utils.DeeptalkSender(message);
        }//*/

        if(this.client.ChatHookChan != "") {
            if(message.channel.id === this.client.ChatHookChan) {


                let hookEndPointChan = await this.client.channels.fetch(this.client.hookEndPoint);

                hookEndPointChan.send(`${this.client.utils.getDateTime()}\n**${message.author.tag}:**\n${message.content}`);


            }
        }

        if(this.client.hookEndPoint != "") {
            if(message.channel.id === this.client.hookEndPoint) {


                let ChatHookChan = await this.client.channels.fetch(this.client.ChatHookChan);

                ChatHookChan.send(`${message.content}`);


            }
        }



        //Selfbot detection
        if (message.embeds.length > 0) {
            message.delete().catch(() => null);
            this.client.utils.log(`[SelfBot Detected] Der Nutzer ${message.member} hat ein Embed gepostet obwohl er dies nicht ohne ein Selfbotting kann. Er wurde deswegen für 24h gemuted. Bitte in Diskurs treten!\n<@&798293308937863219>`)
            await this.client.utils.muteMember(message.member, 1440, message.guild.me)
        }


        if (message.content.match(mentionRegex)) message.channel.send(`Mein prefix ist \`${this.client.prefix}\`.`);

        const prefix = message.content.match(mentionRegexPrefix) ?
            message.content.match(mentionRegexPrefix)[0] : this.client.prefix;

        if (message.content.match(/discord(.gg|app.com\/invite)\/[a-zA-Z0-9]+/g)) {
            try {
                message.delete();
                message.channel.send(`${message.member}, du darfst keine Invites posten!`);
            } catch (e) {
                //Error
                console.error(e);
            }
        }

        if (message.channel.id === (this.client.dev ? "800110137820971047" : "797833037022363659")) {

            await this.client.utils.colorgiver(message);

        }

        if (this.client.spamCollection.has(message.member.id)) {
            if (this.client.spamCollection.get(message.member.id) > 2) {
                message.channel.send(`Bitte Spam nicht!`)
                message.delete();
                if (this.client.spamCollection.get(message.member.id) > 6) {
                    this.client.utils.muteMember(message.member, 2, message.guild.me);
                }
            }
            let currentCount = this.client.spamCollection.get(message.member.id) ? this.client.spamCollection.get(message.member.id) : 0;

            this.client.spamCollection.set(message.member.id, currentCount + 1)

        } else {

            this.client.spamCollection.set(message.member.id, 1)
        }


        if (message.channel.id === (this.client.dev ? "800110138027409501" : "793944435809189921") && !message.member.permissions.has("MANAGE_MESSAGES")) {
            if (message.attachments.size || message.content.includes("cdn.discordapp.com/attachments/")) {
                if (this.client.picCooldown.has(message.author.id)) {

                    // let timespentmills = Date.parse(new Date()) - this.client.picCooldown.get(message.author.id);

                    //message.channel.send(`Du darfst noch kein neues Bild reinschicken! Bitte warte noch ${Math.floor(10-timespentmills/1000)} Sekunden!`);
                    try {
                        message.delete()
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                } else {

                    this.client.picCooldown.set(message.author.id, Date.parse(new Date().toString()));
                    setTimeout(() => {
                        // Removes the User from the set after a minute
                        this.client.picCooldown.delete(message.author.id);
                    }, 10000);


                }

            }


        }


        if (!message.content.startsWith(prefix || "+")) {

            if (message.channel.parentID === (this.client.dev ? "800110139155546210" : "796204539911864340")) {

                await message.channel.setParent(message.guild.channels.cache.get(this.client.dev ? "800110137820971039" : "796198520616517652"));
                let mod = message.guild.roles.cache.get(this.client.dev ? "800110137632882781" : "798293308937863219")
                let user = await message.guild.members.fetch(`${message.channel.topic}`, true, true);
                await message.channel.overwritePermissions([{id: message.guild.id, deny: "VIEW_CHANNEL"}, {
                    id: user.id,
                    allow: "VIEW_CHANNEL"
                }, {id: mod.id, allow: "VIEW_CHANNEL"}])
                message.channel.send(`${user}, dein Ticket wurde neu eröffnet von ${message.member}!`);

            }


            await this.client.utils.xpadd(message.member, this.client.xpMessages);
            switch (message.channel.name) {
                case "ideen": {
                    return message.client.utils.reactvoting(message);
                }

                case "voice-kontext": {
                    try {
                        message.delete({timeout: 3600000});
                    } catch (e) {
                        console.error(e);
                    }
                }
                break;
            }

            if (message.content.toLowerCase().match(/.*(script\n*.*kiddie).*/g) && message.channel.name !== "ideen") {
                await message.react("✅");
                message.channel.send("Echt So, Pain!").then(m => {
                    try {
                        message.delete();
                        return m.delete({timeout: 120000});
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });
            }

        } else {

            if (message.guild && !this.client.cmdAllowedChannels.find(c => c === message.channel.id) && !this.client.dev && !message.member.permissions.has("ADMINISTRATOR")) {
                await message.channel.send("Befehle sind hier deaktviert!").then(m => {
                    try {
                        message.delete();
                        return m.delete({timeout: 5000});
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });
            } else {
                const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

                const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
                if (command) {

                    if (command.ownerOnly && !this.client.utils.checkOwner(message.author)) {

                        //User is not allowed to use this command, we don't want to do anything as it is not needed

                        return message.delete().catch(() => null);
                    }


                    //Check if this command is guildOnly. This will never be true as the Bot skips DMs
                    if (command.guildOnly && !message.guild) {

                        //We cannot delete Messages in DMs other than ours so we skip deleting the message
                        return message.channel.send('Entschuldige, aber dieser Befehl kann nicht im Privatchat ausgeführt werden.').then(m => m.delete({timeout: 60000}).catch(() => null));
                    }


                    //Check if the Command is a NSFW Type Command and skip if the Channels is not suited for it.
                    if (command.nsfw && !message.channel.nsfw) {
                        message.delete().catch(() => null);
                        return message.channel.send((await this.client.utils.NSFWEmbed(message, command))).then(m => m.delete({timeout: 60000}).catch(() => null))

                    }

                    // Check if the Command has a specified minimal Number of Args and then check if the message contains the right amount
                    if (command.minArgs && args.length < command.minArgs) {
                        message.delete().catch(() => null);
                        return message.channel.send(`Entschuldige, aber es werden mehr Argumente benötigt - Abgegeben: ${args.length}, Benötigt: ${command.minArgs}`).then(m => m.delete({timeout: 60000}).catch(() => null));
                    }

                    //Check if the Message was sent to a Guild - Always true
                    if (message.guild) {


                        const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;

                        //Check if the Command needs special Permissions
                        if (userPermCheck) {

                            //Check if the Member has missing Permissions
                            const missing = message.channel.permissionsFor(message.member).missing(userPermCheck);
                            if (missing.length) {
                                message.delete();
                                return message.channel.send(`Entschuldige, aber dir fehlt die folgende Berechtigung für diesen Befehl: \`${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))}\`.`).then(m => m.delete({timeout: 60000}).catch(() => null));

                            }
                        }

                        //Lastly - Check if Command was Disabled
                        if (this.client.disabledCommands.find(element => element === command.name) && command.name !== "eval") {
                            message.delete();
                            return message.channel.send(`Entschuldige, aber dieser Befehl ist gegenwärtig deaktiviert!`).then(m => m.delete({timeout: 60000}).catch(() => null));

                        }


                    }

                    if (command.cooldown > 0 && command.cooldownPeople.has(message.author.id) && !message.member.hasPermission("ADMINISTRATOR")) {
                        message.delete();
                        return message.channel.send(`Entschuldige, aber du hast noch einen Cooldown auf diesem Befehl!`).then(m => m.delete({timeout: 60000}).catch(() => null));


                    }
                    if (command.cooldown > 0) {
                        command.cooldownPeople.set(message.author.id, command.cooldown);

                        setTimeout(async () => {
                            command.cooldownPeople.delete(message.author.id);
                        }, command.cooldown)

                    }


                    /*
                    * Everything went fine:
                    * Call the Command file and run the message
                    */
                    command.run(message, args);
                }
            }


        }


    }

};
