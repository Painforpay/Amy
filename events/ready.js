const Event = require('../Structure/Event');
const {MessageEmbed, Collection} = require("discord.js");
const schedule = require("node-schedule");
const colors = require('colors/safe');
require("node-fetch");
// noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: true
        });
    }

    // noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols

    async run() {
        //Log Bot Stats
        await this.client.utils.loadRolesAndChannels();


        console.log([
            `[${this.client.utils.getDateTime()}]`,
            `Logged in as ${this.client.user.tag}`,
            `Loaded ${this.client.commands.size} commands!`,
            `Loaded ${this.client.events.size} events!`
        ].join('\n'));


        let charlie = await this.client.users.fetch("795406184177860628");
        //${this.client.prefix}help
        setInterval(async () => {
            let memberCount = this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

            if(client.dev) return this.client.user.setActivity(`DevMode`, {type: "LISTENING"});

            if(!client.isBeta) {
                if(charlie.presence.status === "online") {
                    this.client.user.setActivity(`${memberCount} Nutzern`, {type: "LISTENING"});
                } else {
                    this.client.user.setActivity(`wo Charlie hin ist :(`, {type: "WATCHING"});
                }
            } else {
                this.client.user.setActivity(`Betatest für v${client.version}`, {type: "WATCHING"});
            }

        }, 15000);

        let client = this.client;



        //Fetch Invites for Invitetracking
        setInterval(async function () {

            client.invites = await client.guild.fetchInvites();

        }, 1000);

        //Cache Reactionroles and Messages
        console.log(colors.gray("Caching reactionroles..."))


        //Get all Messages in #steckbriefrollen
        await this.client.serverChannels.get("reactionroles").messages.fetch();


        const guild = this.client.guild;

        const VoiceChannels = guild.channels.cache.filter(c => c.type === 'voice');

        for (const [channelID, channel] of VoiceChannels) {
            let category = this.client.serverChannels.get("userchannelCATEGORY").id;
            if (channel.parentID === category) {
                if (channel !== this.client.serverChannels.get("createuserchanchannel")) {
                    let channelauthor = channel.permissionOverwrites.map(permission => permission.id)[0]
                    this.client.PVoices.set(channelauthor, {
                        channelid: channel.id,
                        userid: channelauthor,
                        timestamp: Date.parse(new Date())
                    })

                    this.client.PVoices.set(channel.id, {
                        channelid: channel.id,
                        userid: channelauthor,
                        timestamp: Date.parse(new Date())
                    })
                }


            } else {
                for (const [memberID, member] of channel.members) {

                    this.client.VoiceUsers.set(member.id, {user: member.id, time: Date.parse(new Date().toString())});
                }
            }


        }
        if (this.client.VoiceUsers.size > 0) {
            console.log(colors.yellow(`Found ${this.client.VoiceUsers.size} User${this.client.VoiceUsers.size > 1 ? "s" : ""} in Voice Channels`));
        }

        //Fetch StarboardMessages

        this.client.serverChannels.get("starboard").messages.fetch().then(messages => {
            messages.forEach(message => {
                if(message.mentions.channels) {
                    if(message.embeds.length === 1) {
                        if(!message.embeds[0].footer) return;
                        this.client.starredMessages.set(message.embeds[0].footer.text.substr(14, 100), message);

                    }
                }

            })

        })



        if (this.client.verbose) {

            setInterval(() => {

                const VoiceChannels = guild.channels.cache.filter(c => c.type === 'voice');

                for (const [channelID, channel] of VoiceChannels) {


                    for (const [memberID, member] of channel.members) {

                        if (this.client.VoiceUsers.has(member.id)) {

                            let timespentmills = Date.parse(new Date) - this.client.VoiceUsers.get(member.id).time;

                            console.log(`${member.user.tag} gets ${this.client.xpVoice * ((timespentmills / 1000) / 60)} XP now.`);

                        }

                    }
                }

            }, 15000);


        }


        //Unmute all Members currently muted as there is no unmute Timeout Anymore
        {   //brackets so the muterole variable is available out of scope
            let muterole = this.client.serverRoles.get("muted");
            let muteMembersSize = muterole.members.size
            muterole.members.forEach(m => {
                try {
                    m.roles.remove(muterole);
                } catch (e) {
                    console.error(e);
                }
            })
            if (muteMembersSize > 0) {
                console.log(colors.yellow(`Removed the Muted Role from ${muteMembersSize} Member${muteMembersSize > 1 ? "s" : ""}`))
            }

        }

        //Remove AFK Role from every Member that has it
        {   //brackets so the afkrole variable is available out of scope
            let afkrole = this.client.serverRoles.get("afk");
            let AfkMembersSize = afkrole.members.size
            afkrole.members.forEach(m => {
                try {
                    m.roles.remove(afkrole);
                } catch (e) {
                    console.error(e);
                }
            })
            if (AfkMembersSize > 0) {
                console.log(colors.yellow(`Removed the AFK Role from ${AfkMembersSize} Member${AfkMembersSize > 1 ? "s" : ""}`))
            }

        }


        await this.client.serverChannels.get("ideen").messages.fetch();
        await this.client.serverChannels.get("support").messages.fetch();


        let botlogs = this.client.serverChannels.get("botlogs");
        console.log(colors.green("Done caching Messages / Channels."));

        setInterval(() => {

            this.client.antispam.forEach((v, k) => {

                let newMessageCount = v.messageCount - 1 <= 0 ? 0 : v.messageCount - 1;

                this.client.antispam.set(k, {GuildMember: v.GuildMember, messageCount: newMessageCount});
            })

        }, 1000)

        setInterval(async () => {
            if (this.client.fullMutes.size > 0 && this.client.fullMuteAFK) {
                this.client.fullMutes.forEach((v, k) => {
                    if ((Date.parse(new Date()) - v.timestamp) > ((this.client.fullMuteAFKTime * 60) * 1000)) {

                        if (v.member.voice.channelID !== v.member.guild.afkChannelID) {
                            v.member.voice.setChannel(v.member.guild.afkChannelID);
                        }


                    }
                })
            }

        }, 60000)


        schedule.scheduleJob('0 0 * * *', async () => {
            //Increment daily for all

            console.log(colors.yellow(`\nStart of XPloss [${this.client.utils.getDateTime()}]`));

            let builderData1 = {
                table: "users",
                params: new Collection(),
                sqlType: "UPDATE"
            }

            builderData1.params.set("inactive", {operator: "+", value: 1});

            let sqlIncrementQuery = await this.client.con.buildQuery(builderData1);

            await this.client.con.executeQuery(sqlIncrementQuery);


            let builderData2 = {
                table: "users",
                sqlType: "SELECT",
                params: ["*"],
                conditions: new Collection()
            }

            builderData2.conditions.set("inactive", {operator: ">=", value: 30});
            let sqlQuery = await this.client.con.buildQuery(builderData2);

            let results = await this.client.con.executeQuery(sqlQuery).catch(err => this.client.console.reportError(err.stack));

            if (results[0]) {
                    results.forEach(async r => {
                        let member = this.client.guild.members.resolve(r.id);

                        if (!member || member.user.bot) return;
                        let xp = r.xp;


                        if (xp === 0) return;
                        let days = r.inactive - 30;
                        if(days < 0) days = 0;


                        let originxp = r.originxp == null ? xp : r.originxp; //ist standartmäßig 0
                        let toget = originxp - (originxp * (0.5 * (days / 100)))
                        let newXP = toget <= 0 ? 0 : toget
                        let currentlevel = await this.client.utils.getLevelforXp(xp);
                        let leveluserhastoget = await this.client.utils.getLevelforXp(newXP);


                        //Update xp for User
                        let builderData3 = new Collection()

                        if(days === 0) {
                            builderData3.set("originxp", xp);
                        } else {
                            builderData3.set("xp", newXP);
                        }

                        let result = await this.client.con.updateUser(member.id, builderData3);
                        this.client.console.reportLog(`[MySQL] Successfully Updated Entry for User with ID '${r.id}' in users [Query: Affecting XP (${xp} -> ${newXP}${currentlevel !== leveluserhastoget ? ` | New Level ${leveluserhastoget}` : ""})]`);

                        

                            let inactive = 0;
                            if (days >= 14) {
                                inactive = 1;
                            }

                            if (currentlevel === leveluserhastoget) return;
                            let roletogive = await member.guild.roles.fetch((await client.utils.checkLevelRole(leveluserhastoget)))


                            let rolestoremove = await client.utils.getRolestoRemove();

                            rolestoremove.forEach(async r => {

                                if (member.roles.cache.find(role => r === role.id)) {

                                    let roler = member.roles.cache.find(role => r === role.id)

                                    if (roler !== roletogive) {
                                        await member.roles.remove(roler);
                                    }

                                }

                            })

                            if (inactive === 1) {
                                //member.roles.remove(client.dev ? '800110137632882778' : '794158777435029535');
                            }
                            await member.roles.add(roletogive);
                        


                    })
                }

        });



        setInterval(async function () {

            if (client.raidCounter > 0) {
                client.raidCounter = client.raidCounter - 1;
            } else {
                client.raidCounter = 0;
            }

        }, 2500);//


        setInterval(async function () {
            if (client.raidCounter >= 3) {
                if (client.raidMode === false) {
                    botlogs.send("🔹 RAID PROTECTION AKTIV 🔹");
                }
                client.raidMode = true;
            } else {
                if (client.raidMode === true) {
                    botlogs.send("🔹 RAID PROTECTION INAKTIV 🔹");
                }
                client.raidMode = false;
            }
        }, 500);//

        //Birthday Feature
        let general = this.client.serverChannels.get("general");
        schedule.scheduleJob('0 0 * * *', async () => {
            let today = new Date();

            //Remove Geburtstagskind Role from everyone who has it
            let birthday_role = this.client.serverRoles.get("userBirthday");

            let members = birthday_role.members;

            await members.forEach(member => {
                member.roles.remove(birthday_role);
            })


            client.con.query(`SELECT * FROM users WHERE bmonth = ${today.getMonth() + 1} && bday = ${today.getDate()}`, function (err, results) {
                if (err) throw err;

                if (results.length > 0) {
                    general.send(`${client.serverRoles.get("birthdayPing")}`)
                    results.forEach(async r => {


                        let dateString = "";

                        let age = ""
                        if(r.byear != null) {
                            dateString = `${r.byear}, ${r.bmonth - 1}, ${r.bday}`;
                            age = ` **${(client.utils.getAge(dateString)+1)}**ten`
                        }

                        let user = await client.users.cache.find(u => u.id === r.id);
                        let member = await general.guild.members.fetch(user.id);
                        await member.roles.add(birthday_role);
                        let embed = new MessageEmbed()
                            .setTitle("Birthday Reminder!")
                            .setColor("#ffd900")
                            .setDescription(`Herzlichen Glückwunsch zum${age} Geburtstag, ${user}\nEin tolles Jahr wünscht dir ${general.guild.name}`)
                            .setFooter(`Das Servergeschenk von ${client.birthdayReward}xp wurde dir gutgeschrieben!`)
                            .setTimestamp();
                        general.send(embed).catch(e => console.log());
                        general.send(`${user}`).then(m => m.delete({timeout: 1000}).catch(err => this.client.console.reportError(err.stack)));

                        await client.utils.xpAdd(member, client.birthdayReward);

                    });

                }


            });

        });


        //Activityresets

        //Daily
        schedule.scheduleJob('0 0 * * *', () => {

            this.client.vcAck.forEach((v, k) => {
                v.today = 0
            })

            this.client.msgAck.forEach((v, k) => {
                v.today = 0
            })

            this.client.dailyCooldown.clear();

        });

        //Weekly
        schedule.scheduleJob('0 0 * * 1', () => {

            this.client.vcAck.forEach((v, k) => {
                v.weekly = 0
            })

            this.client.msgAck.forEach((v, k) => {
                v.weekly = 0
            })

        });

        //Monthly
        schedule.scheduleJob('0 0 1 * *', async () => {

            this.client.vcAck.forEach((v, k) => {
                v.monthly = 0
            })

            this.client.msgAck.forEach((v, k) => {
                v.monthly = 0
            })

            await this.client.con.clearDB();

        });


        setInterval(async function () {
            client.con.executeQuery(`SHOW VARIABLES LIKE '%version%';`).catch(err => this.client.console.reportError(`Heartbeat failed:\n` + err.stack));
        }, 14400000);


        setInterval(async function () {
            let categoryid = client.serverChannels.get("userchannelCATEGORY").id;
            const VoiceChannels = guild.channels.cache.filter(c => c.type === 'voice' && c.parentID === categoryid);
            for (const [channelID, channel] of VoiceChannels) {
                if (channel === client.serverChannels.get("createuserchanchannel")) return;
                if ((Date.parse(new Date()) - channel.createdTimestamp) > 11000) {
                    if (channel.members.size === 0) {
                        await client.utils.deletePVoice(channel);
                    }
                }
            }
        }, 10000)

        !this.client.dev ? botlogs.send(`[${this.client.utils.getDateTime()}] Status: Back Online!`) : null;
        this.client.console.reportLog(colors.green(`Bot fully ready and Operational`))

    }


}

