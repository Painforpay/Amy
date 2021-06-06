const path = require('path');
const {promisify} = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const SubCommand = require('./SubCommand.js');
const Event = require('./Event.js');
const {MessageEmbed, Collection, MessageAttachment, TextChannel} = require('discord.js');
const {inspect} = require('util');
const {Type} = require('@anishshobith/deeptype')
const fetch = require('node-fetch')
const ms = require("ms");


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

    async reactvoting(message) {

        await message.react("🔺");
        await message.react("🔻");

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

    async getUserData(id) {
        let client = this.client;
        return new Promise((resolve, reject) => {

            client.con.query(`SELECT * FROM users WHERE id = ${id}`, function (err, result) {
                if (err) reject(err.name);

                if (result[0]) {
                    resolve(result[0]);
                }

            })

        })

    }

    async loadCategories() {
        let test = require("../JSON/categories.json");


        test.forEach(i => {

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

    async logToGeneral(messageString) {
        let general = this.client.guilds.cache.get(this.client.dev ? "800110137544146954" : "793944435809189919").channels.cache.get(this.client.dev ? "800110138027409501" : "793944435809189921");

        try {
            general.send(messageString);

        } catch (e) {
            console.log(e);
        }

    }

    async muteMember(member, time, mod, reason) {
        if (member.voice) {
            member.voice.kick();
        }
        let internerModlog = this.client.guilds.cache.get(this.client.dev ? "800110137544146954" : "793944435809189919").channels.cache.get(this.client.dev ? "800110138924466195" : "795773658916061264");
        try {


            member.roles.add(this.client.dev ? "828709057103003678" : "828708084674199632");
            internerModlog.send(`🙊 ${member.user.tag} [${member.user.id}] wurde von ${mod} für \`${time}\` Minute${time < 1 || time > 1 ? "n" : ""}${reason ? ` wegen \`${reason}\`` : ""} gemuted!`)
            let m = await member.user.send(`Du wurdest im Wohnzimmer für \`${time}\` Minute${time < 1 || time > 1 ? "n" : ""}${reason ? ` wegen \`${reason}\`` : ""} gemuted. Du kannst im Support einen Antrag auf frühzeitige Entmutung stellen.`)

            m.delete({timeout: (time * 60000) + 1000}).catch(() => null)
        } catch (e) {
            console.error(e);
        }

        setTimeout(async () => {
            try {
                member.roles.remove(this.client.dev ? "828709057103003678" : "828708084674199632");
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
            .setTitle(`🔞 NSFW-Channel Only`);


        //Check if the member has rights to change the NSFW Option to tell him how to enable it
        if (message.member.hasPermission('MANAGE_CHANNELS')) {

            //Set the Description and set a Image
            embed.setDescription(`The \`${this.capitalise(cmdFile.name)}\` command is a NSFW-tagged Command.\nPlease enable NSFW-Mode on this Channel to use it!`)
                .setImage(`https://cdn.discordapp.com/attachments/821157975246241822/821158154447355964/ChannelNSFWEnable.gif`)
        } else {

            //Set the Description and set a Image
            embed.setDescription(`The \`${this.capitalise(cmdFile.name)}\` command is a NSFW-tagged Command.\nPlease use it in a NSFW Channel!`)
        }

        //return the embed
        return embed;

    }

    //This creates an Embed if a Search Query for AdultContent was executed in a non NSFW Channel
    async MediaNSFW(message, title) {

        //create a base Embed
        let embed = new MessageEmbed()
            .setTimestamp()
            .setColor("#D12D42")
            .setTitle(`🔞 NSFW-Content`);


        //Check if the member has rights to change the NSFW Option to tell him how to enable it
        if (message.member.hasPermission('MANAGE_CHANNELS')) {

            //Set the Description and set a Image
            embed.setDescription(`The Content (\`${this.capitalise(title)}\`) you were trying to access is tagged as Adult Content.\nPlease enable NSFW-Mode on this Channel to use it!`)

                .setImage(`https://cdn.discordapp.com/attachments/821157975246241822/821158154447355964/ChannelNSFWEnable.gif`)
        } else {

            //Set the Description and set a Image
            embed.setDescription(`The Content (\`${this.capitalise(title)}\`) you were trying to access is tagged as Adult Content.\nPlease use it in a NSFW Channel!`)
        }

        //return the embed
        message.channel.send(embed).then(m => m.delete({timeout: 60000}).catch(() => null));

    }

    async evaluate(message, code) {


        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        let evaled;


        try {

            const start = process.hrtime();
            evaled = eval(code);
            if (evaled instanceof Promise) {
                evaled = await evaled;
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
                .addField(`📤 **Output:**`, `${this.client.utils.trimString(`\`\`\`js\n${e.stack}\n\`\`\``)}`)
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

        let category = reaction.message.guild.channels.cache.get(this.client.dev ? "800110137820971039" : "796198520616517652");
        if (reaction.message.guild.channels.cache.find(channel => channel.topic === user.id && channel.parentID === category.id)) return reaction.message.channel.send(`Du hast bereits ein offenes Ticket! ${user}`).then(m => {
            try {
                m.delete({timeout: 15000})
            } catch (e) {
                //Error
                console.error(e);
            }
        });
        let senior = reaction.message.guild.roles.cache.get(this.client.dev ? "800110137649135632" : "794154756179623936");
        let mod = reaction.message.guild.roles.cache.get(this.client.dev ? "800110137632882781" : "798293308937863219");
        let supportchan = await reaction.message.guild.channels.create(user.tag, {
            type: "text",
            topic: user.id,
            parent: category,
            permissionOverwrites: [{id: reaction.message.guild.id, deny: "VIEW_CHANNEL"}, {
                id: user.id,
                allow: "VIEW_CHANNEL"
            }, {id: senior.id, allow: "VIEW_CHANNEL"}]
        });

        supportchan.send(`${user}; <@&${senior.id}>; <@${mod.id}>`).then(m => {
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

    async getGuildMember(id) {

        let guild;
        guild = this.client.guilds.fetch(this.client.dev ? "800110137544146954" : "793944435809189919");

        let member;
        member = await guild.members.cache.find(m => m.id === id);

        return member;

    }


    async VoiceUserChannelChangeXP(oldState) {
        if (oldState.channel.id === oldState.channel.guild.afkChannelID) {
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, Date.parse(new Date()));
        } else if (this.client.VoiceUsers.has(oldState.member.id)) {

            let timespentmills = Date.parse(new Date()) - this.client.VoiceUsers.get(oldState.member.id).time;

            if (oldState.channel.members.size > 1) {
                let amount = this.client.xpVoice * ((timespentmills / 1000) / 60);

                await this.client.utils.xpadd(oldState.member, amount);
            }
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, {
                user: oldState.member.id,
                time: Date.parse(new Date())
            });

        }
    }

    async VoiceUserDisconnectXP(oldState, override = false) {
        if (oldState.channel.id === oldState.channel.guild.afkChannelID) {
            this.client.VoiceUsers.delete(oldState.member.id);
            this.client.VoiceUsers.set(oldState.member.id, Date.parse(new Date()));
        } else if (this.client.VoiceUsers.has(oldState.member.id)) {

            let timespentmills = Date.parse(new Date()) - this.client.VoiceUsers.get(oldState.member.id).time;

            if (oldState.channel.members.size > 0 || override) {
                let amount = this.client.xpVoice * ((timespentmills / 1000) / 60);

                await this.client.utils.xpadd(oldState.member, amount);
            }
            this.client.VoiceUsers.delete(oldState.member.id);


        }
    }


    async birthdayembed(message) {
        let client = this.client;
        let birthdaylist = new Collection();
        let embedwaiting = await message.channel.send("Embed wird geladen...");

        await this.client.con.query(`SELECT * FROM users WHERE bday > 0 ORDER BY bmonth ASC, bday ASC`, async function (err, result) {
            if (err) throw err;
            for (const r of result) {
                let user = await client.users.fetch(`${r.id}`, true, true);
                if (message.guild.members.cache.get(user.id)) {
                    await client.users.fetch(`${user.id}`, false, false);
                    birthdaylist.set(user.id, {id: user.id, day: `${r.bday}`, month: `${r.bmonth}`});
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

                usermonth = months[b.month - 1]


                if (embed.fields.find(f => f.name === usermonth)) {
                    let fieldcontent = embed.fields.find(f => f.name === usermonth).value;

                    fieldcontent += `${userday}.\t${user}\n`;

                    embed.fields.find(f => f.name === usermonth).value = fieldcontent;
                } else {
                    embed.addField(usermonth, `${userday}.\t${user}\n`)
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


        });

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

            let UserData = await this.client.utils.getUserData(newState.member.id);

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

    async getPlacementforUser(id, xp) {
        let client = this.client;
        return new Promise((resolve) => {

            client.con.query(`SELECT xp FROM users WHERE xp >= ${xp};`, function (err, results) {
                if (results) {
                    resolve(results.length);
                }
            });
        });

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


    async xpadd(member, amount, giveboost = true) {
        let unwashed = amount;
        if (!amount) return;
        if (member.user.bot) return;
        amount = parseInt(amount);
        amount = Math.abs(amount);
        amount = member.roles.cache.find(r => r.name === "Unterstützer") && giveboost ? (amount * 1.02) : amount;
        if (isNaN(amount)) {
            console.error(`${this.client.utils.getDateTime()} Error while giving ${amount} (Unwashed: ${unwashed}) to ${member.id} - Section 1`)
            return;
        }

        let client = this.client
        this.client.con.query(`SELECT * FROM users WHERE id = ${member.user.id};`, async function (err, result) {
            if (err) throw err;

            if (result[0]) {

                let currentlevel = await client.utils.getLevelforXp(result[0].xp);
                let leveluserhastoget = await client.utils.getLevelforXp(result[0].xp + amount);

                let nextlevel = await client.utils.getLevelXp(leveluserhastoget + 1);
                if (client.verbose) {
                    console.log(`Current Level: ${currentlevel}
                                 Old Xp: ${result[0].xp}
                                 Amount to add: ${amount}
                                 New Xp: ${result[0].xp + amount}
                                 Level to Give: ${leveluserhastoget}\n`);
                }



                let togive = result[0].xp + amount;


                if (currentlevel !== leveluserhastoget) {
                    let embed = new MessageEmbed()
                        .setTitle("**Levelup!**")
                        .setColor("#FFD700")
                        .setFooter(`Du benötigst nun ${(Math.round((nextlevel - (togive)) * 100) / 100).toFixed(0)} Erfahrungspunkte für Level ${leveluserhastoget + 1}!`)
                        .setDescription(`Du bist jetzt Level ${leveluserhastoget}!`);

                    try {
                        member.send({embed: embed}).then(m => m.delete({timeout: 3600000}));
                    } catch (e) {

                        // Der Bot kann dem User keine DMs schicken!
                    }

                }


                let roletogive = await member.guild.roles.fetch((await client.utils.checkLevelRole(leveluserhastoget)))


                try {
                    let rolestoremove = await client.utils.getRolestoRemove();

                    rolestoremove.forEach(r => {

                        if (member.roles.cache.find(role => r === role.id)) {

                            let roler = member.roles.cache.find(role => r === role.id)

                            if (roler !== roletogive) {
                                member.roles.remove(roler);
                            }

                        }

                    })
                } catch (e) {
                    //Error
                    console.error(e);
                }


                try {
                    member.roles.add(roletogive);
                } catch (e) {
                    //Error
                    console.error(e);
                }
                if (isNaN(togive)) {
                    console.error(`${client.utils.getDateTime()} Error while giving ${amount} to ${member.id} - Section 2`)
                    return;
                }

                client.con.query(`UPDATE users SET xp = '${togive}', inactive = 0, originxp = NULL WHERE id = ${member.user.id}`, function (err) {
                    if (err) throw err;

                });
            } else {
                client.con.query(`INSERT INTO \`users\` (\`id\`, \`xp\`, \`originxp\`,\`bday\`, \`bmonth\`) VALUES ('${member.id}', '0', NULL, NULL, NULL);`, function (err) {
                    if (err) throw err;

                    console.log(`[MySQL] Successfully created Entry for User with ID '${member.id}' in users`);

                });
            }


        });
    }

    // noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
    async giveRemaining(message) {

        const VoiceChannels = message.guild.channels.cache.filter(c => c.type === 'voice');

        for (const [channelID, channel] of VoiceChannels) {
            for (const [memberID, member] of channel.members) {
                if (channel.members.size > 0) {
                    if (this.client.VoiceUsers.has(member.id)) {

                        let timespentmills = Date.parse(new Date()) - this.client.VoiceUsers.get(member.id).time;

                        let amount = this.client.xpVoice * ((timespentmills / 1000) / 60)

                        await this.client.utils.xpadd(member, amount);

                    }
                }
            }
        }

    }

    log(message) {

        let botlogs = this.client.channels.cache.get(this.client.dev ? "803530075571224627" : "803530018369830922");
        try {
            botlogs.send(message);
        } catch (e) {
            //Error
            console.error(`Logging to Serverlogs failed:\n${e.stack}`);
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


                    console.log(`[${this.getDateTime()}] Trying to add "${role.name}" to "${message.member.user.tag} [${message.member.user.id}]"`);

                    colors.forEach(color => {

                        if (message.member.roles.cache.find(role => role.id === color)) {
                            message.member.roles.remove(message.member.roles.cache.find(role => role.id === color));
                        }

                    })
                    message.member.roles.add(role).catch(err => this.client.utils.log(`Error while giving ${member} the ${role.name} Role:\n${err.stack}`));


                } catch (e) {
                    //Error
                    console.error(e);

                }

            }

            try {
                message.delete();
            } catch (e) {
                //Error
                console.error(e);
            }


        } catch (e) {
            //Error
            console.error(e);
        }


    }


    async createDiscussion(message) {

        let category = message.guild.channels.cache.get(this.client.dev ? "800110137820971041" : "794175912026701850");

        let concept;
        concept = message.guild.roles.cache.get(this.client.dev ? "800110137632882782" : "798294227968458752");

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
                //Error
                console.error(e);
            }

        });

    }

    async archiveDiscussion(reaction) {

        await reaction.message.channel.setParent(this.client.dev ? "803231244670205953" : "803231120090988594");
        reaction.message.channel.send(`Channel wurde archiviert!`);
        await reaction.users.fetch();
        reaction.users.cache.forEach(user => {
            setTimeout(function () {
                reaction.users.remove(user);
            }, 2000);

        })


    }

    async getLevelforXp(xp) {
        let i = 1;
        if (xp < 10) return 0;
        while (xp + 1 > this.getLevelXp(i)) {
            i += 1;
        }
        return i - 1;
    }


    async setBirthday(message, day, month) {

        message.channel.send(`Ich versuche den ${day}.${month} als deinen Geburtstag einzutragen...`).then(m => {
            this.client.con.query(`UPDATE \`users\` SET \`bday\` = ${day}, \`bmonth\` = ${month} WHERE \`id\` = ${message.author.id};`, function (err, result) {
                if (err) throw err;

                if (result) {
                    // noinspection JSUnresolvedVariable
                    console.log(`[MySQL] Successfully Updated Entry for User with ID '${message.author.id}' in users [Query: Affecting bday, bmonth]`);

                    try {
                        m.delete({timeout: 3000});
                        return message.channel.send(`Eintragung erfolgreich!`).then(m => m.delete({timeout: 6000}));

                    } catch (e) {
                        //Error
                        console.error(e);
                    }

                }

            });

        })


    }

}