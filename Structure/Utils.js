const path = require('path');
const {promisify} = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const SubCommand = require('./SubCommand.js');
const Event = require('./Event.js');
const {MessageEmbed, Collection, MessageAttachment, TextChannel} = require('discord.js');
const Discord = require('discord.js');
const {inspect} = require('util');
const {Type} = require('@anishshobith/deeptype')
const fetch = require('node-fetch')


module.exports = class Util {

    constructor(client) {
        this.client = client;
    }


    getDateTime(ms = new Date()) {

        const date = new Date(ms);

        return date.toLocaleString('de-DE', this.client.datetimeformat);

    }

    isClass(input) {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    }

    get directory() {
        return `${path.dirname(require.main.filename)}${path.sep}`;
    }

    trimArray(arr, maxLen = 10) {
        if (arr.length > maxLen) {
            const len = arr.length - maxLen;
            arr = arr.slice(0, maxLen);
            arr.push(`${len} more...`);
        }
        return arr;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }

    removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    capitalise(string) {
        return string.split(' ').map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(' ');
    }

    checkOwner(target) {
        return this.client.owners.find(t => t === target);
    }

    getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async getOwners(ArrOwners) {
        let OwnerObj = [];
        for (const id of ArrOwners) {
            OwnerObj.push(await this.client.users.fetch(id))
        }
        return OwnerObj;
    }

    comparePerms(member, target) {
        return member.roles.highest.position > target.roles.highest.position;
    }

    getSubCommands(cmd) {
        return this.client.subCommands.filter((v) => v.parent === cmd);
    }

    clean(text) {
        if (typeof text === 'string') {
            text = text
                .replace(/`/g, `${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`)
                .replace(new RegExp(this.client.token, 'gi'), '***[TOKEN]***')

        }
        return text;
    }

    trimString(str) {
        return ((str.length > 1024) ? `${str.slice(0, 1024 - 7)}...\n\`\`\`` : str);
    }


    formatPerms(perm) {
        return perm
            .toLowerCase()
            .replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
            .replace(/_/g, ' ')
            .replace(/Guild/g, 'Server')
            .replace(/Use Vad/g, 'Use Voice Activity');
    }

    formatArray(array, type = 'conjunction') {
        return new Intl.ListFormat('en-GB', {style: 'short', type: type}).format(array);
    }

    async duration(ms) {
        const sec = Math.floor((ms / 1000) % 60).toString()
        const min = Math.floor((ms / (1000 * 60)) % 60).toString()
        const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
        const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString()
        const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 30)) % 60).toString()
        const years = Math.floor((ms / (1000 * 60 * 60 * 24 * 365.25)) % 60).toString()
        return `${years > 0 ? years.padStart(1, '0')+ `Jahr${years > 1 ? "e": ""} `: ""}${days > 0 ? days.padStart(1, '0')+` Tag${days > 1 ? "e": ""} `: ""}${hrs > 0 ? hrs.padStart(2, '0')+` Stunde${hrs > 1 ? "n": ""} `: ""}${min > 0 ? min.padStart(2, '0')+` Minute${min > 1 ? "n": ""} `: ""}${sec > 0 ? sec.padStart(2, '0')+` Sekunde${sec > 1 ? "n": ""}`: ""}`
    }

    async loadAwards() {

        let results = await this.client.con.getAwards();
        results.forEach(result => {
            this.client.awards.set(result.id, {
                type: result.type,
                name: result.name,
                requirements: result.requirements
            })
        });
    }

    async loadCategories() {
        let categories = require("../JSON/categories.json");


        categories.forEach(i => {

            this.client.categories.set(i.name, i);
        })


    }

    async loadCommands() {
        return glob(`${this.directory}commands/*/*.js`).then(commands => {
            for (const commandFile of commands) {
                delete require.cache[commandFile];
                const {name} = path.parse(commandFile);
                const File = require(commandFile);
                if (!this.isClass(File)) throw new TypeError(`Der Befehl ${name} exportiert keine Klasse.`);
                const command = new File(this.client, name.toLowerCase());
                if (!(command instanceof Command)) throw new TypeError(`Der Befehl ${name} ist keine Instanz von Command.`);
                this.client.commands.set(command.name, command);
                if (command.aliases.length) {
                    for (const alias of command.aliases) {
                        this.client.aliases.set(alias, command.name);
                    }
                }
            }
        });
    }


    async loadSubCommands() {
        return glob(`${this.directory}commands/*/*/*.js`).then(subCommands => {
            for (const commandFile of subCommands) {
                delete require.cache[commandFile];
                const {name} = path.parse(commandFile);
                const File = require(commandFile);
                if (!this.isClass(File)) throw new TypeError(`Der Befehl ${name} exportiert keine Klasse.`);
                const command = new File(this.client, name.toLowerCase());
                if (!(command instanceof SubCommand)) throw new TypeError(`Der Befehl ${name} ist keine Instanz von SubCommand.`);
                this.client.subCommands.set(command.parent ? `${command.parent}_${command.name}` : command.name, command);
            }
        });
    }

    async loadEvents() {
        return glob(`${this.directory}events/**/*.js`).then(events => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const {name} = path.parse(eventFile);
                const File = require(eventFile);
                if (!this.isClass(File)) throw new TypeError(`Das Event ${name} exportiert keine Klasse.`);
                const event = new File(this.client, name);
                if (!(event instanceof Event)) throw new TypeError(`Das Event ${name} ist keine Instanz von Event.`);
                this.client.events.set(event.name, event);
                event.emitter[event.type](name, (...args) => event.run(...args));
            }
        });
    }

    async loadRolesAndChannels() {
        this.client.guild = await this.client.guilds.fetch(this.client.guild);
        this.client.serverRoles = await this.client.con.getServerRoles().catch(e => {
            console.log(e)
            return process.exit(1);
        });
        this.client.serverChannels = await this.client.con.getServerChannels().catch(e => {
            console.log(e)
            return process.exit(1);
        });
    }

    async handleWrongInput(args, cmdFile) {


        let embed = new MessageEmbed()
            .setTitle(`Oh, oh!`)
            .setColor("#FFD700")
            .setFooter(`Gebe ${this.client.prefix}help ${cmdFile.name} ein um weitere Informationen zu erhalten!`);


        let desc = `Leider gibt es keinen \`${args}\` Unterbefehl für den \`${cmdFile.name}\` Befehl!`;

        if (cmdFile.children.size > 0) {
            desc += `\nMögliche Unterbefehle sind:`
            cmdFile.children.forEach(child => {
                embed.addField(`${this.client.prefix}${cmdFile.name} ${child.name}`, `${child.description}`);
            })
        }

        embed.setDescription(desc)

        return embed;

    }

    async muteMember(member, time, mod, reason) {
        if (member.voice) {
            await member.voice.kick();
        }
        let internerModlog = this.client.serverChannels.get("internalModLog");
        try {


            member.roles.add(this.client.serverRoles.get("muted"));
            internerModlog.send(`🙊 ${member.user.tag} [${member.user.id}] wurde von ${mod} für \`${time}\` Minute${time < 1 || time > 1 ? "n" : ""}${reason ? ` wegen \`${reason}\`` : ""} gemuted!`)
            let m = await member.user.send(`Du wurdest im Wohnzimmer für \`${time}\` Minute${time < 1 || time > 1 ? "n" : ""}${reason ? ` wegen \`${reason}\`` : ""} gemuted. Du kannst im Support einen Antrag auf frühzeitige Entmutung stellen.`).catch(() => null)

            m.delete({timeout: (time * 60000) + 1000}).catch(() => null)
        } catch (e) {
            this.client.console.reportError(e);
        }

        setTimeout(async () => {
            try {
                member.roles.remove(this.client.serverRoles.get("muted"));
                internerModlog.send(`🙉 ${member.user.tag} [${member.user.id}] wurde Automatisch entmuted!`)
                let m = await member.user.send(`Du wurdest im Wohnzimmer automatisch entmuted.`);
                m.delete({timeout: (time * 60000) * 3}).catch(() => null)

            } catch (e) {
                null;
            }

        }, time * 60000);
    }

    //This creates an Embed if a NSFW Command was executed in a non NSFW Channel
    async NSFWEmbed(message, cmdFile) {

        //create a base Embed
        let embed = new MessageEmbed()
            .setTimestamp()
            .setColor("#D12D42")
            .setTitle(`🔞 NSFW-Channel Benötigt`);


        //Check if the member has rights to change the NSFW Option to tell him how to enable it
        if (message.member.hasPermission('MANAGE_CHANNELS')) {

            //Set the Description and set a Image
            embed.setDescription(`Der Befehl \`${this.capitalise(cmdFile.name)}\` kann hier nicht genutzt werden!.\nBitte den Channel NSFW Status anschalten oder den Befehl in einem NSFW Channel ausführen!`)
                .setImage(`https://cdn.discordapp.com/attachments/821157975246241822/821158154447355964/ChannelNSFWEnable.gif`)
        } else {

            //Set the Description and set a Image
            embed.setDescription(`Der Befehl \`${this.capitalise(cmdFile.name)}\` kann hier nicht genutzt werden!.\nBitte den Befehl in einem NSFW Channel ausführen!`)
        }

        //return the embed
        return embed;

    }

    async evaluate(message, code) {


        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        let evaled;


        try {

            const start = process.hrtime();
            evaled = eval(code);
            if (evaled instanceof Promise) {
                evaled = evaled;
            }
            const stop = process.hrtime(start);
            let response = [
                `📥 **Input:**`, `\`\`\`js\n${code}\n\`\`\``,
                `📤 **Output:**`, `\`\`\`js\n${this.clean(inspect(evaled, {depth: 0}))}\n\`\`\``,
                `🔎 **Typ:**`, `\`\`\`ts\n${new Type(evaled).is}\n\`\`\``,
                `⏲️ Bearbeitungszeit: ${(((stop[0] * 1e9) + stop[1])) / 1e6}ms`
            ]

            let embed = new MessageEmbed()
                .setTitle(`Erfolg!`)
                .setColor("#FFD700")
                .addField(response[0], response[1])
                .addField(response[2], response[3])
                .addField(response[4], response[5])
                .setFooter(response[6])
                .setTimestamp();


            if (embed.fields[0].value.length <= 256 && embed.fields[1].value.length <= 256 && embed.length <= 6000) {

                return embed;

            } else {
                let res = response.join('\n');
                res = res
                    .replace("📥 **Input:**", "Input:")
                    .replace("📤 **Output:**", "Output:")
                    .replace("🔎 **Typ:**", "Typ:")
                return new MessageAttachment(Buffer.from(res), 'output.txt')

            }


        } catch (e) {
            //Error

            let errorEmbed = new MessageEmbed()
                .setTitle(`Fehler!`)
                .setColor("#CD322F")
                .addField(`📥 **Input:**`, `\`\`\`js\n${code}\n\nCleaned: ${code}\`\`\``)
                .addField(`📤 **Output:**`, `${this.client.utils.trimString(`\`\`\`js\n${e.stack}\n\`\`\``, 1024)}`)
                .setTimestamp();


            if (errorEmbed.fields[0].value.length <= 256 && errorEmbed.fields[1].value.length <= 256 && errorEmbed.length <= 6000) {

                return errorEmbed;


            } else {

                let response = [
                    `Input:`, `${code}\n\nCleaned: ${code}\n\n`,
                    `Output:`, `${e.stack}`
                ]
                let res = response.join('\n');

                return new MessageAttachment(Buffer.from(res), 'output.txt')

            }


        }

    }


    async createTicket(reaction, user) {

        await reaction.users.remove(user);

        let category = this.client.serverChannels.get("supportCATEGORY");
        if (reaction.message.guild.channels.cache.find(channel => channel.topic === user.id && channel.parentID === category.id)) return reaction.message.channel.send(`Du hast bereits ein offenes Ticket! ${user}`).then(m => {
            try {
                m.delete({timeout: 15000})
            } catch (e) {
                //Error
                this.client.console.reportError(e.stack);
            }
        });
        let senior = this.client.serverRoles.get("senior");
        let mod = this.client.serverRoles.get("moderator");
        let supportchan = await reaction.message.guild.channels.create(user.tag, {
            type: "text",
            topic: user.id,
            parent: category,
            permissionOverwrites: [{id: reaction.message.guild.id, deny: "VIEW_CHANNEL"}, {
                id: user.id,
                allow: "VIEW_CHANNEL"
            }, {id: senior.id, allow: "VIEW_CHANNEL"}]
        });

        supportchan.send(`${user}; ${senior}; ${mod}`).then(m => {
            try {
                m.delete({timeout: 300});
            } catch (e) {
                //Error
                console.error(e);
            }

        });


    }

    async createLounge(newState) {
        let client = this.client;
        if (newState.channel.members.size === 1) {
            if (client.lounges.find(l => l.id === newState.channel.id)) {

                if (client.lounges.some(async l => {
                    let channel = await client.channels.fetch(l.id, true, true);
                    return channel.members.size < 1;
                })) {

                    let newchannel = await newState.channel.clone();
                    newchannel.setPosition(newState.channel.position + 1);

                    client.lounges.push({
                        name: newchannel.name,
                        id: newchannel.id,
                        isRoot: false
                    });


                }


            }
        }

    }

    async deleteLounge(oldState) {
        let client = this.client;
        if (oldState.channel.members.size === 0) {
            if (client.lounges.find(l => l.id === oldState.channel.id)) {

                if (client.lounges.find(l => l.id === oldState.channel.id)) {


                    for (let i = 0; i < client.lounges.length; i++) {
                        let f = client.lounges[i];
                        let channel = await client.channels.fetch(f.id, true, true);

                        if (channel.members.size < 1) {

                            if (!f.isRoot) {

                                channel.delete('Autodelete - User Left the Channel');


                                client.lounges = client.lounges.filter(function (value) {
                                    return value.id !== f.id;

                                });
                            }

                        }

                    }


                }

            }
        }

    }



    async VoiceUserChannelChangeXP(oldState) {
        if (oldState.channel.id === oldState.channel.guild.afkChannelID) {
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, {
                user: oldState.member.id,
                time: Date.parse(new Date().toString())
            });
        } else if (this.client.VoiceUsers.has(oldState.member.id)) {

            if (oldState.channel.members.size > 1) {
               await this.rewardUserMinutes(oldState.member);
            }
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, {
                user: oldState.member.id,
                time: Date.parse(new Date().toString())
            });

        }
    }

    async rewardUserMinutes(member) {
        let timespan = Date.parse(new Date().toString()) - this.client.VoiceUsers.get(member.id).time;
        let amount = this.client.xpVoice * ((timespan / 1000) / 60);
        let amountMinutes = (timespan / 1000) / 60;
        if (!amount) return;
        amount = Math.abs(amount);
        if (isNaN(amount)) return;
        await this.client.utils.xpAdd(member, amount);
        await this.addUserMinutes(member.id, amountMinutes);

    }

    async VoiceUserDisconnectXP(oldState, override = false) {
        if (oldState.channel.id === oldState.channel.guild.afkChannelID) {
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, {
                user: oldState.member.id,
                time: Date.parse(new Date().toString())
            });
        } else if (this.client.VoiceUsers.has(oldState.member.id)) {



            if (oldState.channel.members.size > 0 || override) {
                await this.rewardUserMinutes(oldState.member);
            }
            this.client.VoiceUsers.delete(oldState.member.id);

        }
    }


    async birthdayembed(message) {
        let client = this.client;
        let birthdaylist = new Collection();
        let embedwaiting = await message.channel.send("Embed wird geladen...");


        let result = await this.client.con.executeQuery(`SELECT * FROM users WHERE bday > 0 ORDER BY bmonth ASC, bday ASC`).catch(err => this.client.console.reportError(err.stack));

        if(!result) return message.channel.send(`Es gab einen Fehler bei der Anfrage der Nutzerdaten!`).then(m => m.delete({timeout: 5000})).catch(() => null);
            for (const r of result) {
                let user = await client.users.fetch(`${r.id}`, true, true);
                if (message.guild.members.cache.get(user.id) || client.dev) {
                    await client.users.fetch(`${user.id}`, false, false);
                    birthdaylist.set(user.id, {id: user.id, day: `${r.bday}`, month: `${r.bmonth}`, year: `${r.byear ? r.byear : ""}`});
                }
            }

            let embed = new MessageEmbed()
                .setTimestamp()
                .setColor("#ffdab9")
                .setTitle("Geburtstagsliste")
                .setFooter("Made by me, Amy!");

            let months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            await birthdaylist.forEach(b => {

                let usermonth;
                let userday = b.day;
                let user = client.users.cache.get(b.id);
                let useryear = b.year.length > 0 ? b.year : null;

                let dateString = "";

                usermonth = months[b.month - 1]
                if(useryear) {
                    dateString = `${useryear}, ${b.month}, ${userday}`;
                } else {
                    dateString = `0000, ${b.month}, ${userday}`
                }
                let remainingDays = client.utils.getRemainingDays(dateString);

                if (embed.fields.find(f => f.name === usermonth)) {
                    let fieldcontent = embed.fields.find(f => f.name === usermonth).value;

                    fieldcontent += `${userday}.\t${user} ${useryear ? `[${client.utils.getAge(dateString)+1}.]` : ""}  *noch ${remainingDays} Tag${remainingDays == 1 ? "" : "e"}...*\n`;

                    embed.fields.find(f => f.name === usermonth).value = fieldcontent;
                } else {
                    embed.addField(usermonth, `${userday}.\t${user} ${useryear ? `[${client.utils.getAge(dateString)+1}.]` : ""}  *noch ${remainingDays} Tag${remainingDays == 1 ? "" : "e"}...*\n`)
                }

            })


            message.channel.send({embed: embed}).then(m => {
                try {
                    embedwaiting.delete();
                    m.delete({timeout: 60000})
                } catch (e) {
                    //Error
                    console.error(e);
                }
            })




    }

    async checkLevelRole(level) {

        // level -> current (newest) Level User has
        //let levels = [0, 2, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]


        if (level >= 2 && level < 10) {
            return this.client.dev ? '824240839139655691' : '824242651321991218';
        } else {
            let levelIDs = ['803039995342225429', '795733030051512371', '795733038968602673', '795733033150840914', '795733036313870367', '795733048205246464', '795733050772291615', '795735445169897543', '810590641745821727', '810590795836686356', '810590814710530098'];
            let devlevelIDs = ['800110137544146962', '800110137544146961', '800110137544146960', '800110137544146959', '800110137544146958', '800110137544146957', '800110137544146956', '800110137544146955', '810591297442283530', '810591409328881715', '810591471144009758'];

            let cut = (Math.floor(level / 10)).toFixed(0)

            let currentMaxLevel = this.client.currentMaxLevel;


            if (cut > currentMaxLevel) {
                return this.client.dev ? devlevelIDs[currentMaxLevel] : levelIDs[currentMaxLevel];
            } else {
                return this.client.dev ? devlevelIDs[cut] : levelIDs[cut];
            }
        }


    }

    async getRolestoRemove() {

        if (this.client.dev) {
            return ['800110137544146962', '824240839139655691', '800110137544146961', '800110137544146960', '800110137544146959', '800110137544146958', '800110137544146957', '800110137544146956', '800110137544146955'];
        } else {
            return ['803039995342225429', '824242651321991218', '795733030051512371', '795733038968602673', '795733033150840914', '795733036313870367', '795733048205246464', '795733050772291615', '795735445169897543'];

        }

    }

    async createPVoice(newState, count) {
        if (this.client.PVoices.has(newState.member.user.id)) {
            try {

                let chan = await this.client.channels.fetch(this.client.PVoices.get(newState.member.user.id).channelid, true)
                await newState.setChannel(chan);
            } catch (e) {
                // Der Bot kann den User nicht moven
            }


        } else {

            let UserData = await this.client.con.getUserData(newState.member.id);

            let name = UserData.pChannelName == null ? `${newState.member.nickname != null ? newState.member.nickname : newState.member.user.username}s Sprachkanal` : UserData.pChannelName;
            if (name.length > 32) {
                name = 'Neuer Privater Sprachkanal'

            }
            let chan = await newState.channel.guild.channels.create(name, {
                type: "voice",
                topic: newState.member.user.id,
                userLimit: count,
                parent: newState.channel.parentID,
                permissionOverwrites: [{id: newState.member.user.id, allow: ["MOVE_MEMBERS", "MANAGE_CHANNELS"]}]
            });

            try {
                newState.member.send(`Dein Sprachkanal wurde erstellt und steht bereit!`).then(m => m.delete({timeout: 300000}));
            } catch (e) {
                // Der Bot kann dem User keine DMs schicken!
            }

            await newState.setChannel(chan);


            this.client.PVoices.set(newState.member.user.id, {
                channelid: chan.id,
                userid: newState.member.user.id,
                timestamp: Date.parse(new Date())
            })

            this.client.PVoices.set(chan.id, {
                channelid: chan.id,
                userid: newState.member.user.id,
                timestamp: Date.parse(new Date())
            })


        }
    }

    async deletePVoice(channel) {
        if (this.client.PVoices.has(channel.id)) {
            let user = this.client.PVoices.get(channel.id).userid;
            this.client.PVoices.delete(user)
            this.client.PVoices.delete(channel.id)
            channel.delete();
        }
    }



    async profanityFilter(string) {

        let data = {
            "user-id": this.client.neutrinoapi[0],
            "api-key": this.client.neutrinoapi[1],
            "content": string,
            "catalog": "obscene"
        }

        return fetch('https://neutrinoapi.net/bad-word-filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
        }).then(res => res.json().then(body => {

            return body;

        }));
    }


    async xpAdd(member, amount, giveboost = true) {
        let unwashed = amount;
        amount = parseInt(amount)
        if (member.user.bot) return;

        amount = member.roles.cache.has(this.client.serverRoles.get("booster").id) && giveboost ? (amount * 1.02) : amount;
        if (isNaN(amount)) {
            console.error(`${this.client.utils.getDateTime()} Error while giving ${amount} XP (Unwashed: ${unwashed}) to ${member.id} - Section 1`)
            return;
        }

        let data = new Collection().set("xp", {operator: "+", value: amount}).set("inactive", 0).set("originxp", "NULL");

        let result = await this.client.con.updateUser(member.id, data);

                let currentlevel = await this.client.utils.getLevelforXp(result.old ? result.old.xp : 0);
                let leveluserhastoget = await this.client.utils.getLevelforXp(result.new.xp);

                let nextlevel = await this.client.utils.getLevelXp(leveluserhastoget + 1);



                if (currentlevel !== leveluserhastoget) {
                    this.sendLevelupEmbed({
                        member: member,
                        currentLevel: leveluserhastoget,
                        remainingXP: nextlevel - (result.new.xp)
                    });
                }



                let roletogive = await member.guild.roles.fetch((await this.client.utils.checkLevelRole(leveluserhastoget)))
                try {
                    let rolestoremove = await this.client.utils.getRolestoRemove();

                    rolestoremove.forEach(r => {

                        if (member.roles.cache.find(role => r === role.id)) {

                            let roler = member.roles.cache.find(role => r === role.id)

                            if (roler !== roletogive) {
                                member.roles.remove(roler);
                            }

                        }

                    })
                    member.roles.add(roletogive);
                } catch (e) {
                    //Error
                    console.error(e);
                }
    }

    sendLevelupEmbed(data) {
        let embed = new MessageEmbed()
        .setTitle("**Levelup!**")
        .setColor("#FFD700")
        .setFooter(`Du benötigst nun ${(Math.round((data.remainingXP) * 100) / 100).toFixed(0)} Erfahrungspunkte für Level ${data.currentLevel + 1}!`)
        .setDescription(`Du bist jetzt Level ${data.currentLevel}!`);
        data.member.send({embed: embed}).then(m => m.delete({timeout: 3600000})).catch(() => null);
    }

    async coinsAdd(member, amount, giveboost = true) {
        let unwashed = amount;
        if (!amount) return;
        if (member.user.bot) return;
        amount = parseInt(amount);
        amount = Math.abs(amount);
        amount = member.roles.cache.has(this.client.serverRoles.get("booster").id) && giveboost ? (amount * 1.02) : amount;
        if (isNaN(amount)) {
            console.error(`${this.client.utils.getDateTime()} Error while giving ${amount} Coins (Unwashed: ${unwashed}) to ${member.id} - Section 1`)
            return;
        }

        let client = this.client


            let data = new Collection().set("balance", amount)
            await this.client.con.updateUser(member.id, data).catch(err => this.client.console.reportError(err.stack));


    }

    // noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
    async giveRemaining(message) {

        const VoiceChannels = this.client.guild.channels.cache.filter(c => c.type === 'voice');

        for (const [channelID, channel] of VoiceChannels) {
            for (const [memberID, member] of channel.members) {
                if (channel.members.size > 0) {
                    if (this.client.VoiceUsers.has(member.id)) {

                        let timespentmills = Date.parse(new Date().toString()) - this.client.VoiceUsers.get(member.id).time;

                        let amount = this.client.xpVoice * ((timespentmills / 1000) / 60)

                        await this.client.utils.xpAdd(member, amount);

                    }
                }
            }
        }

    }


    getLevelGrowth(level) {

        if (level === 1) return 0;

        return this.client.utils.getLevelGrowth(level - 1) + 2 + 1.54518 * level
    }

    getLevelXp(level) {
        if (level === 0) return 0;
        return Math.round(10 + 25 * this.client.utils.getLevelGrowth(level));

    }

    async removeInactiveGameRoles() {

        let builderData = {
            sqlType: "SELECT",
            table: "activityroles",
            params: ["*"]
        }

        let sqlQuery = await this.client.con.buildQuery(builderData);

        let results = await this.client.con.executeQuery(sqlQuery).catch(err => this.client.con.reportError(err));

        for (const role of results) {

            if(role.roleidActive != null || role.roleidInactive != null) {
                let ActiveRole = await this.client.guild.roles.fetch(role.roleidActive).catch(() => null);

                let InactiveRole = await this.client.guild.roles.fetch(role.roleidInactive).catch(() => null);
                if(!ActiveRole.id || !InactiveRole.id) return;
                for await (const [snowflake, member] of ActiveRole.members) {

                    member.roles.remove(ActiveRole);
                    member.roles.add(InactiveRole);
                }
            }


        }

    }


    async colorgiver(message) {
        try {
            if ( isNaN(message.content) || message.content > 19 || message.content < 1 || !message.content ) {
                message.channel.send("Bitte eine Nummer im Bereich 1 bis 19 angeben!").then(m => {
                    try {
                        m.delete({timeout: 3000})
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });

            } else {
                try {
                    //let colorsDev = ["800110137649135629", "800110137649135628", "800110137649135627"]
                    let colors = ["794575425975877641", "794575395033710622", "794575441355603968", "794575390822891530", "794575442539577395", "794575472901226516", "794575427132719144", "794575387405058078", "794575436289671169", "794575456875577364", "794575415204773898", "794575406723760129", "794575447081091072", "794575460902240276", "794575399895957514", "794575400692219914", "794575472037331034", "794575421610000394", "834828722308644894"]
                    let role = message.guild.roles.cache.find(role => role.id === colors[(message.content) - 1]);


                    this.client.console.reportLog(`[${this.getDateTime()}] Trying to add "${role.name}" to "${message.member.user.tag} [${message.member.user.id}]"`);

                    colors.forEach(color => {

                        if (message.member.roles.cache.find(role => role.id === color)) {
                            message.member.roles.remove(message.member.roles.cache.find(role => role.id === color));
                        }

                    })
                    message.member.roles.add(role).catch(err => this.client.console.reportError(err.stack));


                } catch (e) {
                    //Error
                    this.client.console.reportError(e);

                }

            }

            try {
                message.delete();
            } catch (e) {
                //Error
                this.client.console.reportError(e);
            }


        } catch (e) {
            //Error
            this.client.console.reportError(e);
        }


    }


    async createDiscussion(message) {

        let category = this.client.serverChannels.get("serverentwicklung");

        let concept;
        concept = this.client.serverRoles.get("konzeptentwicklung");

        let ideen = await message.guild.channels.create(message.content.split("\n")[1] ? (message.content.split("\n")[0].split(" ").join("-").length > 32 ? `Vorschlag von: ${message.author.tag}` : message.content.split("\n")[0]) : `Vorschlag von: ${message.author.tag}`, {
            type: "text",
            topic: message.content,
            parent: category,
            permissionOverwrites: [{id: message.author.id, allow: "SEND_MESSAGES"}]
        });


        if (this.client.conceptDevelopment) {
            await ideen.overwritePermissions([{id: message.guild.id, deny: "SEND_MESSAGES"}, {
                id: concept,
                allow: "SEND_MESSAGES"
            }])
        }


        let embed = new MessageEmbed()
            .setColor("RANDOM")
            .setFooter(`Vorgeschlagen von ${message.author.username} [${message.author.id}]`)
            .setTimestamp();

        message.content.split("\n")[1] ? embed.setTitle(message.content.split("\n")[0]) : null
        if (message.content.split("\n")[1]) {
            let msgc = message.content.split("\n")
            await msgc.shift();
            let desc = msgc.join("\n");
            embed.setDescription(desc);
        } else {
            embed.setDescription(message.content);
        }

        ideen.send({embed: embed}).then(m => m.react("❌"));

        return ideen.send(`${message.author}; ${concept}`).then(m => {
            try {
                m.delete({timeout: 1000});
            } catch (e) {
                this.client.console.reportError(e);
            }

        });

    }

    async archiveDiscussion(reaction) {

        await reaction.message.channel.setParent(this.client.serverChannels.get("ideenarchiveCATEGORY"));
        reaction.message.channel.send(`Channel wurde archiviert!`);
        await reaction.users.fetch();
        reaction.users.removeAll();


    }

    async getLevelforXp(xp) {
        let i = 1;
        if (xp < 10) return 0;
        while (xp + 1 > this.getLevelXp(i)) {
            i += 1;
        }
        return i - 1;
    }


    async setBirthday(message, day, month, year) {

        let m = await message.channel.send(`Ich versuche den ${day}.${month}.${year} als deinen Geburtstag einzutragen...`);

        let data = new Collection().set("bday", day).set("bmonth", month).set("byear", year);

        let result = await this.client.con.updateUser(message.member.id, data).catch(err => this.client.console.reportError(err.stack));

        if (result) {
            m.edit(`Erfolgreich eingetragen!`).then(m => m.delete({timeout: 5000})).catch(() => null);
        } else {
            m.edit(`Es gab einen Fehler beim updaten!`).then(m => m.delete({timeout: 5000})).catch(() => null);
        }

    }

    async addUserMessages(userID, amount) {
        let data = new Collection().set("totalMessagesSent", amount);
        return await this.client.con.updateUser(userID, data).catch(err => this.client.console.reportError(err.stack));
    }

    async addUserMinutes(userID, amount) {
        if(this.client.vcAck.has(userID)) {
            let { today, weekly, monthly } = this.client.vcAck.get(userID);
            this.client.vcAck.set(userID, {
                today: today + amount,
                weekly: weekly + amount,
                monthly: monthly + amount
            })

        } else {
            this.client.vcAck.set(userID, {
                today: amount,
                weekly: amount,
                monthly: amount
            })
        }
        let data = new Collection().set("totalVoiceMinsSpent", amount);
        return await this.client.con.updateUser(userID, data).catch(err => this.client.console.reportError(err.stack));


    }

    async setBiography(message, biography) {
        let m = await message.channel.send(`Ich versuche deine Biographie einzutragen...`);

        let data = new Collection().set("userBio", biography);


        let result = await this.client.con.updateUser(message.author.id, data).catch(err => this.client.console.reportError(err.stack));
        if (result) {
            m.edit(`Deine Biographie wurde erfolgreich angepasst zu:\n\`${biography}\``).then(m => m.delete({timeout: 5000})).catch(err => this.client.console.reportError(err.stack));
        } else {
            m.edit(`Es gab einen Fehler beim eintragen deiner Biographie!`).then(m => m.delete({timeout: 5000})).catch(err => this.client.console.reportError(err.stack));
        }
    }



    getAge(dateString) {
        let today = new Date();
        let birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
        {
            age--;
        }
        return age;
    }

    getRemainingDays(dateString) {
        let today = new Date();
        let birthDate = new Date(dateString);
        let m = today.getMonth() - birthDate.getMonth();
        let isNextYear;
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
        {
            isNextYear = false;
        } else {
            isNextYear = true;
        }


        let dateStringArr = dateString.split(",");
        let year = today.getFullYear();
        if(isNextYear) {
            year += 1;
        }
        dateString = `${year}, ${dateStringArr[1]}, ${dateStringArr[2]}`;


        let nextBirthday = new Date(dateString);
        let remainingTime = nextBirthday - today;

        let days = (((remainingTime / 1000) / 60) / 60) / 24;
        return Math.floor(days+1);
    }

    getRemainingTime(dateString) {
        let today = new Date();
        let birthDate = new Date(dateString);
        let m = today.getMonth() - birthDate.getMonth();
        let isNextYear;
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
        {
            isNextYear = false;
        } else {
            isNextYear = true;
        }

        let dateStringArr = dateString.split(",");
        let year = today.getFullYear();
        if(isNextYear) {
            year += 1;
        }
        dateString = `${year}, ${dateStringArr[1]}, ${dateStringArr[2]}`;


        let nextBirthday = Date.parse(new Date(dateString));
        return nextBirthday/1000;
    }



}