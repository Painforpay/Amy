const Event = require('../Structure/Event');
const {MessageEmbed} = require("discord.js");
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


        console.log([
            `[${this.client.utils.getDateTime()}]`,
            `Logged in as ${this.client.user.tag}`,
            `Loaded ${this.client.commands.size} commands!`,
            `Loaded ${this.client.events.size} events!`
        ].join('\n'));




        let charlie = await this.client.users.cache.find(u => u.id === "795406184177860628");

        setInterval(async () => this.client.user.setActivity(`${(charlie.presence.status === "online") ? `${this.client.prefix}help | ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} usern zu!` : "wo Charlie hin ist :("}`, {type: 'WATCHING'}), 15000);

        let client = this.client;

        //Fetch Invites for Invitetracking
        setInterval(async function () {

            client.invites = await client.guilds.cache.get((client.dev ? "800110137544146954" : "793944435809189919")).fetchInvites();

        }, 4000);

        //Cache Reactionroles and Messages
        console.log("Caching reactionroles...")


        //Get all Messages in #steckbriefrollen
        let steckbriefrollen = await this.client.channels.fetch(client.dev ? "800110137820971047" : "797833037022363659", true, true);
        await steckbriefrollen.messages.fetch();


        const guild = this.client.guilds.cache.get(this.client.dev ? "800110137544146954" : "793944435809189919")

        const VoiceChannels = guild.channels.cache.filter(c => c.type === 'voice');

        for (const [channelID, channel] of VoiceChannels) {
            if (channel.parentID === (this.client.dev ? "804440107754192987" : "804456045481164810")) {
                if (channel.id !== (client.dev ? "804744090637959178" : "804684722763595777")) {
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
            console.log(`Found ${this.client.VoiceUsers.size} User${this.client.VoiceUsers.size > 1 ? "s" : ""} in Voice Channels`);
        }


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

        //React to the messages
        /*this.client.con.query(`SELECT * FROM rroles;`, function(err, result) {
            if(err) throw err;

            result.forEach(r => {
               await steckbriefrollen.messages.fetch(r.messageid).then(m => m.react(r.emoji));

            })

        }); // */


        let teammemberembed = await (await this.client.channels.fetch(client.dev ? "800110138924466191" : "795804770178039808", true)).messages.fetch(client.dev ? "802569631238717490" : "795806452039811073", true);
        await (await this.client.channels.fetch(client.dev ? "800110137820971042" : "794175100118499379")).messages.fetch();
        await (await this.client.channels.fetch(client.dev ? "800110137820971040" : "796119563803689050", true)).messages.fetch(client.dev ? "800111566459764737" : "796203324410953808", true);


        let botlogs = await this.client.channels.fetch(client.dev ? "803530075571224627" : "803530018369830922", true);
        console.log(colors.green("Done caching Messages / Channels."));
        (!this.client.dev ? botlogs.send(`[${this.client.utils.getDateTime()}] Status: Back Online!`) : null);

        schedule.scheduleJob('0 0 * * *', () => {
            //Increment daily for all
            //UPDATE `users` SET `inactive` = `inactive` + 1 WHERE 1
            console.log(colors.yellow(`\nStart of XPloss at [${this.client.utils.getDateTime()}]`));
            this.client.con.query(`UPDATE \`users\` SET \`inactive\` = \`inactive\` + 1 WHERE 1`, function (err) {
                if (err) throw err;
            })

            this.client.con.query(`SELECT * FROM users WHERE inactive >= 30`, function (err, result) {
                if (err) throw err;
                if (result[0]) {
                    result.forEach(async r => {
                        let xp = r.xp;



                        if (xp === 0) return;
                        let days = r.inactive - 30;

                        let xploss = 0.5 * (days / 100);
                        let originxp = r.originxp == null ? xp : r.originxp; //ist standartmäßig 0
                        let xptoloose = originxp * xploss;

                        let currentlevel = await client.utils.getLevelforXp(xp);
                        let leveluserhastoget = await client.utils.getLevelforXp(originxp - xptoloose);


                        //update xp for user
                        client.con.query(`UPDATE users SET \`xp\` = \`originxp\` - ${xptoloose} ${days === 0 || days === 100 ? `,\`originxp\` = ` + xp : ""} WHERE id = ${r.id};`, function (err) {
                            if (err) throw err;
                            console.log(`[MySQL] Successfully Updated Entry for User with ID '${r.id}' in users [Query: Affecting XP (${xp} -> ${originxp - xptoloose}${currentlevel !== leveluserhastoget ? ` | New Level ${leveluserhastoget}` : ""})]`);
                        });


                        let guild = await client.guilds.cache.find(g => g.id === (client.dev ? "800110137544146954" : "793944435809189919"))

                        //Tryblock #1
                        try {
                            let member = await client.utils.getGuildMember(r.id);
                            if(member.user.bot) return;
                            let inactive = 0;
                            if (days >= 14) {
                                inactive = 1;
                            }

                            if(currentlevel === leveluserhastoget) return;
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
                        } catch (e) {
                            console.log(colors.red(`\n-- Start of Error --`));
                            console.log(colors.red(`User: ${r.id}\n\nThrown while in Tryblock #1`));
                            console.error(colors.red(e));
                            console.log(colors.red(`--- End of Error ---\n`));

                            if(e.httpStatus === "404") {
                                client.con.query(`DELETE FROM users WHERE id = ${r.id};`, function (err) {
                                    if (err) throw err;
                                    console.log(`[MySQL] Successfully Deleted Entry for User with ID '${r.id}' in users`);
                                });

                            }
                        }


                    })
                }

            })


        });


        //Update Teamlist
        schedule.scheduleJob('0 0 1 * *', () => {
            let member = "";
            let guild = client.guilds.cache.get(client.dev ? "800110137544146954" : "793944435809189919")
            guild.members.cache.filter(member => member.hasPermission("KICK_MEMBERS")).forEach(m => {
                if (m.user.bot || guild.ownerID === m.id) return;
                member += `${m}\n`
            })

            let embed = new MessageEmbed()
                .setTitle("💎 Unser Team 💎")
                .setDescription(`Hier seht ihr alle Nutzer mit Moderationsrechten!\nBitte beachtet, dass ihr euch zuerst an den <#796119563803689050> wenden solltet!\n\n${member}`)
                .setTimestamp();

            teammemberembed.edit({embed: embed});
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
        let general = await this.client.channels.fetch(this.client.dev ? "800110138027409501" : "793944435809189921", true);
        schedule.scheduleJob('0 0 * * *', async () => {
            let today = new Date();

            //Remove Geburtstagskind Role from everyone who has it
            let birthday_role = await general.guild.roles.fetch(this.client.dev ? "815864639279202365" : "813853716691025960", true)

            let members = birthday_role.members;

            await members.forEach(member => {
                member.roles.remove(this.client.dev ? "815864639279202365" : "813853716691025960");
            })


            client.con.query(`SELECT * FROM users WHERE bmonth = ${today.getMonth() + 1} && bday = ${today.getDate()}`, function (err, results) {
                if (err) throw err;

                if (results.length > 0) {
                    general.send(`<@&${client.dev ? "800110137553453109" : "796053373820207164"}>`)
                    results.forEach(async r => {
                        let user = await client.users.cache.find(u => u.id === r.id);
                        let member = await general.guild.members.fetch(user.id);
                        await member.roles.add(client.dev ? "815864639279202365" : "813853716691025960");
                        let embed = new MessageEmbed()
                            .setTitle("Birthday Reminder!")
                            .setDescription(`Herzlichen Glückwunsch zum Geburtstag, ${user}`)
                            .setTimestamp();
                        general.send(`${user}`).then(m => m.delete({timeout: 1000}));
                        general.send({embed: embed});
                        await client.utils.xpadd(member, 500);

                    });

                }


            });

        });


        /*schedule.scheduleJob('1 18 * * *', async () => {
            let freegameschan = await client.channels.fetch(this.client.dev ? "800110899565690900" : "797531759159803944");

            let messages;
            messages = await freegameschan.messages.fetch({limit: 3});
            await fetch("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=de&country=DE&allowCountries=DE", {
                "credentials": "omit",
                "referrer": "https://www.epicgames.com/store/de/free-games",
                "method": "GET"
            }).then(res => res.json().then(result => result.data.Catalog.searchStore.elements.forEach(game => {
                if (game.promotions && game.promotions.promotionalOffers && game.promotions.promotionalOffers.length > 0) {

                    messages = messages.filter(message => message.author.id === this.client.user.id)

                    if (!messages.first() || !messages.first().embeds[0] || messages.first().embeds[0].title !== game.title) {
                        //game was not announced yet
                        console.log(`(${new Date().toLocaleString('de-DE', {timeZone: 'UTC'})})\n[Free Games] Found new game! Trying to add...`)
                        let embed = new MessageEmbed()
                            .setTitle(game.title)
                            .setURL(`https://www.epicgames.com/store/de/product/${game.productSlug}`)
                            .setThumbnail(game.keyImages[1] ? game.keyImages[1].url : null)
                            .setFooter("Das nächste Spiel gibt es nächsten Donnerstag um 17:00 Uhr!")
                            .addField("Preis:", `~~${game.price.totalPrice.fmtPrice.originalPrice}~~ -> ${game.price.totalPrice.fmtPrice.intermediatePrice} €`)
                            .addField("Angebotsbeginn: (UTC)", new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].startDate).toLocaleString('de-DE', {timeZone: 'UTC'}))
                            .addField("Angebot gilt bis: (UTC)", new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate).toLocaleString('de-DE', {timeZone: 'UTC'}));

                        if (game.productSlug) {
                            fetch(`https://store-content.ak.epicgames.com/api/de/content/products/${game.productSlug}`, {
                                "credentials": "omit",
                                "referrer": `https://www.epicgames.com/store/de/product/${game.productSlug}/home`,
                                "method": "GET",
                                "mode": "cors"
                            }).then(res => res.json().then(result => result.pages.forEach(p => {

                                if (p.type === "productHome") {

                                    embed.setDescription(p.data.about.shortDescription);
                                    freegameschan.send(`<@&${client.dev ? "800110137553453106" : "797552685103710218"}>`, {embed: embed}).then(m => m.crosspost())
                                    console.log(`(${new Date().toLocaleString('de-DE', {timeZone: 'UTC'})})\n[Free Games] Posted new Game "${p.data.about.title}"`)
                                }

                            })))
                        } else {
                            freegameschan.send(`<@&${client.dev ? "800110137553453106" : "797552685103710218"}>`, {embed: embed}).then(m => m.crosspost())
                            console.log(`(${new Date().toLocaleString('de-DE', {timeZone: 'UTC'})})\n[Free Games] Posted new Game "${game.title}"`)
                        }
                    } else {

                        console.log(`(${new Date().toLocaleString('de-DE', {timeZone: 'UTC'})})\n[Free Games] No free games available.`)
                    }
                }
            })))
        });*/


        setInterval(async function () {
            client.con.query(`SHOW VARIABLES LIKE '%version%';`, function (err, result) {
                if (err) client.utils.log(`Heartbeat failed...`)
            })
        }, 14400000);


        setInterval(async function () {
            let categoryid = client.dev ? "804440107754192987" : "804456045481164810";
            const VoiceChannels = guild.channels.cache.filter(c => c.type === 'voice' && c.parentID === categoryid);
            for (const [channelID, channel] of VoiceChannels) {
                if (channel.id === (client.dev ? "804732009426452511" : "804684722763595777")) return;
                if ((Date.parse(new Date()) - channel.createdTimestamp) > 11000) {
                    if (channel.members.size === 0) {
                        await client.utils.deletePVoice(channel);
                    }
                }
            }
        }, 10000)


    }


}

