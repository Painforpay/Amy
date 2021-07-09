const Event = require('../Structure/Event');
let compliments = ['https://tenor.com/view/thank-you-so-much-hearts-pink-than-yyou-thanks-thank-you-gif-12086415', 'https://tenor.com/view/cute-bear-thank-you-thanks-gif-14105969', 'https://tenor.com/view/thank-you-alice-in-wonderland-thanks-gif-9790628', 'https://tenor.com/view/jonah-hill-yay-african-child-screaming-shouting-gif-7212866', 'https://tenor.com/view/cute-comfort-massage-gif-15134902', 'https://tenor.com/view/peach-cat-hug-hug-up-love-mochi-mochi-peach-cat-gif-16334628', 'https://tenor.com/view/hug-virtual-hug-hug-sent-gif-5026057']
const {Collection} = require('discord.js')

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
        if(message.author.id === "302050872383242240") {

            if(message.embeds) {
                if(message.embeds[0].description.search(/👍/)) {
                    setTimeout(async () => {

                        message.channel.send(`Serverbumping ist wieder verfügbar! Nutze \`!d bump\` um uns zu unterstützen!`)

                    }, 7200000)
                }

            }

        }
        if (message.author.bot) return;
        if (message.channel.type === "dm") {

            if (message.content.toLowerCase().match(/.*(danke\n*.*amy).*/g)) {
                let gif = this.client.utils.getRandom(compliments)
                return message.channel.send(gif).then(m => {

                        m.delete({timeout: 3600000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));


                });
            }

            return; //await this.client.utils.DeeptalkSender(message);
        }




        if (this.client.setAfkUsers.has(message.member.id)) {
            let afkRole = this.client.serverRoles.get("afk")
            this.client.setAfkUsers.delete(message.member.id);
            if (message.member.roles.cache.has(afkRole.id)) {

                await message.member.roles.remove(afkRole);
            }
            message.channel.send(`${message.member}, du bist nun nicht mehr als Afk Markiert!`).then(m => m.delete({timeout: 10000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)))
        }

        if (message.mentions.members.size > 0) {
            let list = new Collection();
            message.mentions.members.forEach(m => {
                if (this.client.setAfkUsers.has(m.user.id)) {
                    let userinfo = this.client.setAfkUsers.get(m.user.id);
                    list.set(m.user.id, {
                        member: m,
                        reason: userinfo.reason
                    });
                }
            })

            if (list.size > 0) {
                let message1 = `${message.author}\nGepingte User sind AFK:\n`;
                let list2 = [];
                list.forEach(u => {

                    list2.push(`${u.member.nickname ? u.member.nickname : u.member.user.tag}: **${u.reason}**`);
                })
                message.channel.send(message1 + list2.join("\n")).then(m => m.delete({timeout: 60000}).catch(() => null));
            }
        }

        //MasspingProtection
        if (message.mentions.members.size > 8) {
            return this.client.utils.muteMember(message.member, 60, this.client.user, "Masspinging");
        }


        if (message.content.match(mentionRegex)) message.channel.send(`Mein prefix ist \`${this.client.prefix}\`.`);

        const prefix = message.content.match(mentionRegexPrefix) ?
            message.content.match(mentionRegexPrefix)[0] : this.client.prefix;

        if (message.content.match(/discord(.gg|app.com\/invite)\/[a-zA-Z0-9]+/g) && !message.member.hasPermission("MANAGE_MESSAGES")) {

                message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                message.channel.send(`${message.member}, du darfst keine Invites posten!`);

                if((Date.parse(new Date()) - message.member.joinedTimestamp) < 604800000) {
                    let userData = {xp: "Unbekannt"};
                    let reason = "Senden von einem Invitelink"
                    if(message.member) {
                        userData = await this.client.utils.getUserData(message.author.id);

                        if (!this.client.utils.comparePerms(message.guild.member(this.client.user), message.member)) {
                            return message.channel.send(`Ich kann diesen Nutzer nicht kicken!`)
                        }
                        await message.author.send(`Du wurdest vom Wohnzimmer gekickt. Grund: \`${reason}\``).catch(() => null);
                    }



                    //ARMED
                    await message.member.kick(reason);

                    let internerModlog = this.client.serverChannels.get("internalModlog");
                    let Modlog = this.client.serverChannels.get("modlog");


                    internerModlog.send(`🥾 ${message.author.tag} [${message.author.id}] wurde von ${this.client.user.username} wegen \`${reason}\` gekickt! XP: ${userData.xp}`);
                    Modlog.send(`🥾 ${message.author.tag} [${message.author.id}] wurde gekickt!`);
                    return;
                }
        }

        if (message.channel.id === (this.client.dev ? "800110137820971047" : "797833037022363659")) {

            await this.client.utils.colorgiver(message);

        }

        //Spamprotection
        if(this.client.antispam.has(message.author.id) && message.channel.parentID !== this.client.serverChannels.get("minigamesbotCategory")) {

            let messageCount = this.client.antispam.get(message.author.id).messageCount;

            let newMessageCount = messageCount + 1;

            if(messageCount >= this.client.messagesPerSecond) {




                    await this.client.utils.muteMember(message.member, this.client.spamMuteTime, this.client.user, "Spamming in " + message.channel.name);
                    await message.channel.send(`${message.author}\nHör auf zu Spammen! Du kannst für ${this.client.spamMuteTime} Minuten keine Nachrichten mehr senden!`)

                message.delete();
                this.client.antispam.set(message.author.id, { GuildMember: message.member, messageCount: this.client.spamMuteTime*60});
            }

            this.client.antispam.set(message.author.id, { GuildMember: message.member, messageCount: newMessageCount});

        } else {

            this.client.antispam.set(message.author.id, { GuildMember: message.member, messageCount: 1});

        }


        if (message.channel === this.client.serverChannels.get("general") && !message.member.permissions.has("MANAGE_MESSAGES")) {
            if (message.attachments.size || message.content.includes("cdn.discordapp.com/attachments/") || message.content.includes("tenor.com")) {
                if (this.client.picCooldown.has(message.author.id)) {

                     let timespentmills = Date.parse(new Date()) - this.client.picCooldown.get(message.author.id);

                    message.channel.send(`Du darfst noch kein neues Bild reinschicken! Bitte warte noch ${Math.floor(-timespentmills/1000)} Sekunden!`).then(m => m.delete({timeout: 5000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));

                    message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

                } else {
                    let timeout = this.client.picCooldownSecs * (message.attachments.size == 0 ? 1 : message.attachments.size) * 1000
                    this.client.picCooldown.set(message.author.id, Date.parse(new Date().toString()) + timeout);
                    setTimeout(() => {
                        // Removes the User from the set after a certain amount of minutes
                        this.client.picCooldown.delete(message.author.id);
                    }, (timeout));


                }

            }


        }


        if (!message.content.startsWith(prefix || "+")) {

            if (message.channel.parentID === this.client.serverChannels.get("supportarchiveCATEGORY").channelID) {

                await message.channel.setParent(this.client.serverChannels.get("supportCATEGORY"));
                let mod = this.client.serverRoles.get("moderator");
                let user = await message.guild.members.fetch(`${message.channel.topic}`, true, true);
                await message.channel.overwritePermissions([{id: message.guild.id, deny: "VIEW_CHANNEL"}, {
                    id: user.id,
                    allow: "VIEW_CHANNEL"
                }, {id: mod.id, allow: "VIEW_CHANNEL"}])
                message.channel.send(`${user}, dein Ticket wurde erneut geöffnet von ${message.member}!`);

            }


            await this.client.utils.xpadd(message.member, this.client.xpMessages);

            if(this.client.msgAck.has(message.member.id)) {

                let { today, weekly, monthly } = this.client.msgAck.get(message.member.id);


                this.client.msgAck.set(message.member.id, {
                    today: today + 1,
                    weekly: weekly + 1,
                    monthly: monthly + 1
                })

            } else {
                this.client.msgAck.set(message.member.id, {
                    today: 1,
                    weekly: 1,
                    monthly: 1
                })
            }

            this.client.utils.addUserMessages(message.member.id, 1);

            switch (message.channel.name) {
                case "ideen": {
                    return message.client.utils.reactvoting(message);
                }

                case "voice-kontext": {

                        message.delete({timeout: 3600000}).catch(() => null);

                }
                break;

            }

            if (message.content.toLowerCase().match(/.*(script\n*.*kiddie).*/g) && message.channel.name !== "ideen") {
                await message.react("✅");
                message.channel.send("Echt So, Pain!").then(m => {

                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        return m.delete({timeout: 120000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

                });
            }

        } else {

            if (message.guild && !this.client.cmdAllowedChannels.find(c => c === message.channel.id) && !this.client.dev && !message.member.permissions.has("ADMINISTRATOR")) {

                if(message.channel === this.client.serverChannels.get("bumpchannel")) return;

                await message.channel.send("Befehle sind hier deaktviert!").then(m => {

                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        return m.delete({timeout: 5000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

                });
            } else {
                const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

                const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
                if (command) {

                    if (command.ownerOnly && !this.client.utils.checkOwner(message.author)) {

                        //User is not allowed to use this command, we don't want to do anything as it is not needed

                        return message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                    }


                    //Check if this command is guildOnly. This will never be true as the Bot skips DMs
                    if (command.guildOnly && !message.guild) {

                        //We cannot delete Messages in DMs other than ours so we skip deleting the message
                        return message.channel.send('Entschuldige, aber dieser Befehl kann nicht im Privatchat ausgeführt werden.').then(m => m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));
                    }


                    //Check if the Command is a NSFW Type Command and skip if the Channels is not suited for it.
                    if (command.nsfw && !message.channel.nsfw) {
                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        return message.channel.send((await this.client.utils.NSFWEmbed(message, command))).then(m => m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)))

                    }

                    // Check if the Command has a specified minimal Number of Args and then check if the message contains the right amount
                    if (command.minArgs && args.length < command.minArgs) {
                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        return message.channel.send(`Entschuldige, aber es werden mehr Argumente benötigt - Angegeben: ${args.length}, Benötigt: ${command.minArgs}\nNutzung: \`${this.client.prefix}${command.name} ${command.argsDef.join(" ")}\``).then(m => {
                            m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                        });

                    }

                    //Check if the Message was sent to a Guild - Always true
                    if (message.guild) {


                        const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;

                        //Check if the Command needs special Permissions
                        if (userPermCheck) {

                            //Check if the Member has missing Permissions
                            const missing = message.channel.permissionsFor(message.member).missing(userPermCheck);
                            if (missing.length) {
                                message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                                return message.channel.send(`Entschuldige, aber dir fehlt die folgende Berechtigung für diesen Befehl: \`${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))}\`.`).then(m => m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));

                            }
                        }

                        //Lastly - Check if Command was Disabled
                        if (this.client.disabledCommands.find(element => element === command.name) && command.name !== "eval") {
                            message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));
                            return message.channel.send(`Entschuldige, aber dieser Befehl ist gegenwärtig deaktiviert!`).then(m => m.delete({timeout: 60000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));

                        }


                    }

                    if (command.cooldown > 0 && command.cooldownPeople.has(message.author.id) && !message.member.hasPermission("ADMINISTRATOR")) {
                        message.delete().catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``));

                        let timespentmills = Date.parse(new Date().toString()) - command.cooldownPeople.get(message.author.id);

                        let duration = await this.client.utils.duration(-timespentmills)
                        return message.channel.send(`Entschuldige, aber du hast noch einen Cooldown auf dem \`${command.name}\` Befehl! Bitte warte noch \`${duration}\`!`).then(m => m.delete({timeout: 5000}).catch(err => this.client.utils.log(`Nachricht konnte nicht gelöscht werden!\n\`\`\`${err.stack}\`\`\``)));


                    }
                    if (command.cooldown > 0) {
                        command.cooldownPeople.set(message.author.id, Date.parse(new Date().toString())+command.cooldown);

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
