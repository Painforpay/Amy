const Command = require("../Structure/Command");

module.exports = class extends Command {


    constructor(...args) {
        super(...args, {
            aliases: ["exp"],
            description: 'Administrationsfunktion des Levelsystems',
            category: 'administration',
            usage: 'set/add/remove/levelup [<User>] [<Menge>]',
            userPerms: ["ADMINISTRATOR"],
            guildOnly: true,
            ownerOnly: false,
            nsfw: false,
            args: true
        });
    }

    async run(message, args) {
        let client = this.client;

        if (args[1]) {
            let value = 0;
            let user = message.mentions.users.first();
            if (!user.id) {
                user = await message.guild.members.fetch(args[1], true);
            }
            message.channel.send("Versuche XP anzupassen!").then(m => {
                try {
                    m.delete({timeout: 3000});
                } catch (e) {
                    //Error
                    console.error(e);
                }
            })

            if(args[2]) {
                value = Math.abs(args[2]);
            }

            switch (args[0]) {
                case "set": {
                    this.client.con.query(`UPDATE users SET \`xp\` = '${value}' WHERE id = "${user.id}";`, function (err) {
                        if (err) throw err;
                        client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${user.tag}\` auf \`${value}\` angepasst!`);
                        message.channel.send(`Erfahrungspunkte für \`${user.tag}\` wurden auf \`${value}\` angepasst!`).then(m => {
                            try {
                                m.delete({timeout: 3000});
                            } catch (e) {
                                //Error
                                console.error(e);
                            }
                        })
                        try {
                            message.delete();
                        } catch (e) {
                            //Error
                            console.error(e);
                        }
                    });
                }
                break;
                case "add": {
                        let member = await message.guild.members.fetch(user.id);
                        await client.utils.xpadd(member, value, false);
                        client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${user.tag}\` um \`${value}\` erhöht!`);


                        message.channel.send(`Erfahrungspunkte für \`${user.tag}\` wurden um \`${value}\` erhöht!`).then(m => {
                            try {
                                m.delete({timeout: 3000});
                            } catch (e) {
                                //Error
                                console.error(e);
                            }
                        })
                        try {
                            message.delete();
                        } catch (e) {
                            //Error
                            console.error(e);
                        }



                }
                    break;
                case "remove": {

                    this.client.con.query(`SELECT * FROM users WHERE id = "${user.id}";`, function (err, result) {
                        if (err) throw err;
                        let userxp;
                        if (result[0]) {
                            userxp = result[0].xp;
                        }

                        let toremove;
                        if (userxp < value) {
                            toremove = userxp;
                            message.channel.send("User hat weniger als " + args[2] + " Erfahrung! Ich entferne daher " + userxp + " Erfahrung und somit alles!").then(m => {
                                try {
                                    m.delete({timeout: 3000});
                                } catch (e) {
                                    //Error
                                    console.error(e);
                                }
                            })
                        } else {
                            toremove = args[2];
                        }

                        client.con.query(`UPDATE users SET \`xp\` = \`xp\` - '${toremove}' WHERE id = "${user.id}";`, function (err) {
                            if (err) throw err;
                            client.utils.log(`${message.author} hat die Erfahrungspunkte für \`${user.tag}\` um \`${toremove}\` verringert!`);
                            message.channel.send(`Erfahrungspunkte für \`${user.tag}\` wurden um \`${toremove}\` verringert!`).then(m => {
                                try {
                                    m.delete({timeout: 3000});
                                } catch (e) {
                                    //Error
                                    console.error(e);
                                }
                            })
                            try {
                                message.delete();
                            } catch (e) {
                                //Error
                                console.error(e);
                            }
                        });

                    });
                }
                    break;
                case "levelup": {

                    this.client.con.query(`SELECT * FROM users WHERE id = "${user.id}";`, async function (err, result) {
                        if (err) throw err;
                        if(result) {
                            let xp = result[0].xp;
                            let levelup;
                            levelup = value || 1;
                            let currentLevel = await client.utils.getLevelforXp(xp);
                            let nextLevel = currentLevel+levelup
                            let nextLevelXP = await client.utils.getLevelXp(nextLevel);

                            let required = nextLevelXP - xp;

                            let member = await message.guild.members.fetch(user.id);
                            await client.utils.xpadd(member, required, false);

                            client.utils.log(`${message.author} hat das Level von \`${user.tag}\` um \`${levelup}\` erhöht! [${currentLevel} -> ${nextLevel}]`);


                            message.channel.send(`Level für \`${user.tag}\` wurde um \`${levelup}\` erhöht!  [${currentLevel} -> ${nextLevel}]`).then(m => {
                                try {
                                    m.delete({timeout: 3000});
                                } catch (e) {
                                    //Error
                                    console.error(e);
                                }
                            })
                            try {
                                message.delete();
                            } catch (e) {
                                //Error
                                console.error(e);
                            }


                        }

                    });









                }
                break;
                default: {
                    message.channel.send("Bitte erneut versuchen!").then(m => {
                        try {
                            m.delete({timeout: 3000});
                        } catch (e) {
                            //Error
                            console.error(e);
                        }
                    });
                    message.delete();
                }
                    break;
            }
        }


    }
}