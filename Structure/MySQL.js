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
                if (err) reject(err);

                if (result !== undefined) {
                    resolve(result[0]);
                } else {
                    resolve(null);
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

    async getActivity(activityname, active = true) {

        return new Promise((resolve) => {
            let client = this.client;
            this.con.query(`SELECT * FROM \`activityroles\` WHERE \`name\` = '${activityname}'`, async function (err, result) {

                if (result[0]) {
                    let roles = []
                    let role = await client.guild.roles.fetch(result[0][`${active ? 'roleidActive' : 'roleidInactive'}`])
                    roles.push(role);
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
            this.con.query(`SELECT * FROM userawards WHERE userID = \"${userid}\";`, async function (err, results) {

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

    async buildQuery(data){
        let sqlQuery = ``;
        let { table, params, sqlType, conditions, orderBy, limit } = data;

        let keys = [];
        let values = [];
        let updateData = [];


        switch(sqlType.toLowerCase()) {

            case "insert": {
                params.forEach((v, k) => {
                    keys.push(k);
                    values.push(v);
                })
                sqlQuery = `INSERT INTO \`${table}\` (\`${keys.join("\`, \`")}\`) VALUES ('${values.join("', '")}')`;
            }
            break;
            case "update": {
                params.forEach((v, k) => {
                    if(v.operator) {
                        updateData.push(`\`${k}\` = \`${k}\` ${v.operator} ${v.value}`);
                    } else {
                        updateData.push(`\`${k}\` = ${v == "NULL" ? "NULL": `'${v}'`}`);
                    }

                    keys.push(k);
                })
                let condition = [];
                if(conditions) {
                    conditions.forEach((v, k) => {
                        condition.push(`\`${k}\` ${v.operator} '${v.value}'`);
                    })
                } else {
                    condition.push("1");
                }
                sqlQuery = `UPDATE \`${table}\` SET ${updateData.join(", ")} WHERE ${condition.join(" && ")};`;
            }
            break;
            case "select": {
                let condition = [];
                if(conditions) {
                    conditions.forEach((v, k) => {
                        condition.push(`\`${k}\` ${v.operator} '${v.value}'`);
                    })
                } else {
                    condition.push("1");
                }

                sqlQuery = `SELECT ${params.join(", ")} FROM \`${table}\` WHERE ${condition.join(" && ")}${orderBy ? ` ORDER BY ${orderBy.value} ${orderBy.key}` : ""}${limit ? ` LIMIT ${limit}` : ""};`;
            }
            break;
            case "delete": {
                let condition = [];
                if(conditions) {
                    conditions.forEach((v, k) => {
                        condition.push(`\`${k}\` ${v.operator} '${v.value}'`);
                    })
                } else {
                    condition.push("1");
                }
                sqlQuery = `DELETE FROM \`${table}\` WHERE ${condition.join(" && ")};`;
            }
            break;


        }

        return sqlQuery;

    }

    async updateUser(userid, data = {}) {
        let client = this.client;
        let UserData = await this.getUserData(userid);

        let sqlQuery;
        let keys = [];

        let builderData = {
            table: "users",
            sqlType: "unknown",
            conditions: new Discord.Collection(),
            params: new Discord.Collection()
        }
        if(UserData) {
            builderData.sqlType = "UPDATE";
            if(data.size > 0) {
                data.forEach((v, k) => {
                    keys.push(k);
                    builderData.params.set(k, v);
                })
            }


            builderData.conditions.set("id", {operator: "=", value: userid})

        } else if(!UserData) {

            builderData.sqlType = "INSERT";
            builderData.params.set("id", userid);
            keys.push("id");
            if(data.size > 0) {
                data.forEach((v, k) => {
                    builderData.params.set(k, v.value ? v.value : v);
                    keys.push(k);
                })
            }

        }

        sqlQuery = await this.buildQuery(builderData);

        return new Promise((resolve, reject) => {
            this.con.query(sqlQuery, async function (err, result) {

                if(err) {
                    client.console.reportLog(`[MySQL] Error while ${UserData ? "Updating" : "Creating"} Entry for UserID '${userid}' in users [Query: Affecting ${keys.join(", ")}]`, true, true)
                    reject(err);
                }

                if(!UserData) {
                    client.console.reportLog(`[MySQL] Successfully ${UserData ? "Updated" : "Created"} Entry for UserID '${userid}' in users [Query: Affecting ${keys.join(", ")}]`, false, true);
                }
                let resultNew = await client.con.getUserData(userid);
                resolve({old:UserData, new: resultNew});

            });
        });

    }

    async executeQuery(sqlQuery) {
        let client = this.client;
        return new Promise((resolve, reject) => {
            this.con.query(sqlQuery, async function (err, data) {

                if(err) {
                    return reject(err);
                }
                resolve(data);

            });
        });

    }

    async clearDB() {

        let builderData = {
            sqlType: "SELECT",
            table: "users",
            params: ["*"]
        }

        let sqlQuery = await this.buildQuery(builderData);

        let results = await this.executeQuery(sqlQuery);

        for await (const rowData of results) {

            let member = this.client.guild.members.resolve(rowData.id);

            if(!member) {
                this.client.console.reportLog(`${rowData.id} has left the Server! Deleting Row...`);

                let builderData = {
                    sqlType: "DELETE",
                    table: "users",
                    conditions: new Discord.Collection()
                }

                builderData.conditions.set("id", {operator: "=", value: rowData.id});

                let sqlQuery = await this.buildQuery(builderData);

                await this.executeQuery(sqlQuery);
            }

        }

    }

    async resetInactivity() {
        let builderData = {
            sqlType: "UPDATE",
            table: "users",
            params: new Discord.Collection()
        }

        builderData.params.set("inactive", 0);

        let sqlQuery = await this.buildQuery(builderData);

        return (await this.executeQuery(sqlQuery));
    }

}