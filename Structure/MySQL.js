const mysql = require('mysql');
const colors = require('colors/safe');
const Discord = require('discord.js');

module.exports = class MySQL {

    constructor(host, username, password, client) {
        this.host = host;

        this.username = username;

        this.password = password;

        this.con = null;

        this.client = client;

    }

    createConnection() {
        let con = mysql.createConnection({
            host: this.host,
            user: this.username,
            password: this.password,
            database: "amyandcharlie",
            charset: "utf8mb4"
        });

        con.connect(function (err) {
            if (err) {
                console.error(colors.red(`Error while connecting to Database: \n${err.code === "ECONNREFUSED" ? "Connection Refused (DB not running?)" : err}`));
                return;
            }

            console.log(colors.green('Connected to MySQL Server! Thread ID: ' + con.threadId));

        });

        this.con = con;
        return this;
    }

    async getUserData(id) {
        return new Promise((resolve, reject) => {

            this.con.query(`SELECT * FROM users WHERE id = ${id}`, function (err, result) {
                if (err) resolve(null);

                if (result[0]) {
                    resolve(result[0]);
                }

            })

        })
    }

    async getPlacementforUser(id, xp) {
        let client = this.client;
        return new Promise((resolve) => {

            this.con.query(`SELECT * FROM users WHERE xp >= ${xp-1};`, function (err, results) {
                if (results) {
                    resolve(results.length);
                }
            });
        });

    }

    async getServerRoles() {
        return new Promise((resolve, reject) => {
            let client = this.client;
            let resultC = new Discord.Collection();
            this.con.query(`SELECT * FROM roles WHERE onDev = ${this.client.dev ? 1 : 0}`, async function (err, results) {
                if (err) reject(colors.red(`No Roles found!`));

                if (results) {
                    let guild = client.guild;
                    await results.forEach(async result => {

                        let roleObj = await client.guild.roles.fetch(result.roleID);
                        resultC.set(result.roleName, roleObj);

                    })

                    resolve(resultC);
                } else {
                    reject(colors.red(`No Roles found!`));
                }

            })

        })
    }

    async getServerChannels() {
        return new Promise((resolve, reject) => {
            let resultC = new Discord.Collection();
            let client = this.client;
            this.con.query(`SELECT * FROM channels WHERE onDev = ${this.client.dev ? 1 : 0}`, async function (err, results) {
                if (err) reject(colors.red(`No Channels found!`));

                if (results) {

                    await results.forEach(async result => {

                        let channelObj = await client.guild.channels.cache.get(result.channelID);
                        resultC.set(result.channelName, channelObj);

                    })

                    resolve(resultC);
                } else {
                    reject(colors.red(`No Channels found!`));
                }

            })

        })
    }

    async getAwards() {

        return new Promise((resolve, reject) => {
            this.con.query(`SELECT * FROM awards ORDER BY \`id\` ASC;`, function (err, results) {
                if (results) {
                    resolve(results);
                } else {
                    resolve([]);
                }
            })

        })
    }

    async getActivity(activityname) {

        return new Promise((resolve) => {
            let client = this.client;
            this.con.query(`SELECT * FROM \`activityroles\` WHERE \`name\` = '${activityname}'`, async function (err, result) {

                if (result[0]) {
                    let roles = []
                    roles.push(result[0].roleid);
                    roles.push(client.serverRoles.get("gamesSpacer"));
                    resolve(roles)
                } else {
                    resolve(null);
                }

            });


        })
    }

    async getUserAwards(userid) {
        let client = this.client;
        return [`Dieses Feature befindet sich im Aufbau!`];

        return new Promise((resolve) => {
            let awards = [];
            client.con.query(`SELECT * FROM userawards WHERE userID = \"${userid}\";`, async function (err, results) {

                if (results) {
                    await results.forEach(r => {
                        let awardData = client.awards.get(r.awardID);
                        if(awardData.type.includes("total")) {
                            awards.push(`${awardData.name}`)
                        } else {
                            awards.push(`${r.amount}x ${awardData.name}`)
                        }
                    })
                    resolve(awards);
                }
            });
        });
    }


}