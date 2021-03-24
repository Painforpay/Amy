const path = require('path');
const {promisify} = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const Event = require('./Event.js');
const Discord = require('discord.js');
const { inspect } = require('util');
const { Type } = require('@anishshobith/deeptype')
const colors = require("../JSON/colors.json");


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
        return this.client.owners.includes(target);
    }

    comparePerms(member, target) {
        return member.roles.highest.position > target.roles.highest.position;
    }

    clean(text) {
        if(typeof text === 'string') {
            text = text
                .replace(/`/g, `${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`)
                .replace(new RegExp(this.client.token, 'gi'), '***[TOKEN]***')

        }
        return text;
    }

    trimString (str) {
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


    async loadCommands() {
        return glob(`${this.directory}commands/**/*.js`).then(commands => {
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

    async evaluate(message, code) {


        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        let evaled;


        try {

            const start = process.hrtime();
            evaled = eval(code);
            if(evaled instanceof Promise) {
                evaled = await evaled;
            }
            const stop = process.hrtime(start);
            let response = [
                `📥 **Input:**`, `\`\`\`js\n${code}\n\`\`\``,
                `📤 **Output:**`, `\`\`\`js\n${this.clean(inspect(evaled, {depth: 0}))}\n\`\`\``,
                `🔎 **Typ:**`, `\`\`\`ts\n${new Type(evaled).is}\n\`\`\``,
                `⏲️ Bearbeitungszeit: ${(((stop[0]*1e9)+stop[1]))/1e6}ms`
            ]

            let embed = new Discord.MessageEmbed()
                .setTitle(`Erfolg!`)
                .setColor("#FFD700")
                .addField(response[0], response[1])
                .addField(response[2], response[3])
                .addField(response[4], response[5])
                .setFooter(response[6])
                .setTimestamp();


            if(embed.fields[0].value.length <= 256 && embed.fields[1].value.length <= 256 && embed.length <= 6000) {

                return embed;

            } else  {
                let res = response.join('\n');
                res = res
                    .replace("📥 **Input:**", "Input:")
                    .replace("📤 **Output:**", "Output:")
                    .replace("🔎 **Typ:**", "Typ:")
                return new Discord.MessageAttachment(Buffer.from(res), 'output.txt')

            }


        } catch (e) {
            //Error

            let errorEmbed = new Discord.MessageEmbed()
                .setTitle(`Fehler!`)
                .setColor("#CD322F")
                .addField(`📥 **Input:**`, `\`\`\`js\n${code}\n\nCleaned: ${code}\`\`\``)
                .addField(`📤 **Output:**`, `${this.client.utils.trimString(`\`\`\`js\n${e.stack}\n\`\`\``)}`)
                .setTimestamp();


            if(errorEmbed.fields[0].value.length <= 256 && errorEmbed.fields[1].value.length <= 256 && errorEmbed.length <= 6000) {

                return errorEmbed;


            } else  {

                let response = [
                    `Input:`, `${code}\n\nCleaned: ${code}\n\n`,
                    `Output:`, `${e.stack}`
                ]
                let res = response.join('\n');

                return new Discord.MessageAttachment(Buffer.from(res), 'output.txt')

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
            } catch(e) {
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
        guild = this.client.guilds.cache.get(this.client.dev ? "800110137544146954" : "793944435809189919");

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
        let birthdaylist = new Discord.Collection();
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

            let embed = new Discord.MessageEmbed()
                .setTimestamp()
                .setColor("#ffdab9")
                .setTitle("Geburtstagsliste")
                .setFooter("Made by me, Amy!");

            let months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            await birthdaylist.forEach(b => {

                let usermonth;
                let userday = b.day;
                let user = client.users.cache.get(b.id);

                usermonth = months[b.month-1]


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

        // level -> current (newest) Level user has
        //let levels = [0, 2, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]


        if(level >= 2 && level < 10) {
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
            return ['800110137544146962', '824240839139655691','800110137544146961', '800110137544146960', '800110137544146959', '800110137544146958', '800110137544146957', '800110137544146956', '800110137544146955'];
        } else {
            return ['803039995342225429', '824242651321991218','795733030051512371', '795733038968602673', '795733033150840914', '795733036313870367', '795733048205246464', '795733050772291615', '795735445169897543'];

        }

    }

    async createPVoice(newState, count) {
        if (this.client.PVoices.has(newState.member.user.id)) {
            try {

                let chan = await this.client.channels.fetch(this.client.PVoices.get(newState.member.user.id).channelid, true)
                newState.setChannel(chan);
            } catch (e) {
                // Der Bot kann den User nicht moven
            }

        } else {
            let name = `${newState.member.nickname != null ? newState.member.nickname : newState.member.user.username}s Sprachkanal`;
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
                newState.member.send(`Dein Sprachkanal wurde erstellt und steht bereit!`).then(m => m.delete({timeout: 6000}));
            } catch (e) {
                // Der Bot kann dem User keine DMs schicken!
            }

            newState.setChannel(chan);


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

                    console.log(`Current Level: ${currentlevel}`);
                    console.log(`Old Xp: ${result[0].xp}`);
                    console.log(`Amount to add: ${amount}`);
                    console.log(`New Xp: ${result[0].xp + amount}`);
                    console.log(`Level to Give: ${leveluserhastoget}\n`);
                }

                //*/

                let togive = result[0].xp + amount;


                if (currentlevel !== leveluserhastoget) {
                    let embed = new Discord.MessageEmbed()
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
            console.error(e);
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
            if (isNaN(message.content) || message.content > 18 || message.content < 1) {
                message.channel.send("Bitte nur eine Nummer kleinergleich 18 angeben!").then(m => {
                    try {
                        m.delete({timeout: 3000})
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });

            } else if (!message.content) {
                message.channel.send("Bitte nur eine Nummer kleinergleich 18 angeben!").then(m => {
                    try {
                        m.delete({timeout: 3000})
                    } catch (e) {
                        //Error
                        console.error(e);
                    }
                });

            } else {
                try {




                    let role = message.guild.roles.cache.find(role => role.name === colors[(message.content) - 1].name);

                    console.log(`[${this.getDateTime()}] Trying to add "${role.name}" to "${message.member.user.tag}"`);

                    colors.forEach(color => {

                        if (message.member.roles.cache.find(role => role.name === color.name)) {

                            message.member.roles.remove(message.member.roles.cache.find(role => role.name === color.name));
                        }

                    })

                    await message.member.roles.add(role);


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


        let embed = new Discord.MessageEmbed()
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
            setTimeout(function() {
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

    async purgeMessagesforMember(member) {

        let lol = new Discord.Collection();

        member.guild.channels.cache.forEach(async channel => {
            let message_cache = await channel.messages.fetch({ limit: 100 });
            let filter = message_cache.filter(m => m.author.id === (message.mentions.users.first()).id);
            lol = lol.concat((await message.channel.bulkDelete(filter, true)));
        })

        return lol;
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