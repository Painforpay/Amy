const express = require('express');
const bodyParser = require('body-parser');
const colors = require('colors/safe');
const app = express();
const port = 3000;

const path = require('path');

module.exports = class RESTApi {

    constructor(client) {

        this.client = client;

    }

    createServer() {
        let client = this.client;
        const RESTApi = this;
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());


        app.post('/xp', async (req, res) => {
            const { auth, id, xp } = req.body;

            if(!client.enableAPIXP) return;

            let ref;
            switch (auth) {
                case "aUnGH5aUi": {
                    ref = "Charlie [BOT]";
                }
                break;
                default: {
                    res.status(401)


                    this.client.console.reportError(colors.yellow(`Denied Request:\n${JSON.stringify(req.body)}`))
                    return res.json({
                        "status": 401,
                        "response": "Authorization Failed"
                    })
                }
            }

            await this.addUserXP(id, xp, ref)

            res.status(200);

            let amount = Math.abs(xp);
            amount = (await this.client.guild.member(await this.client.users.fetch(id))).roles.cache.has(client.serverRoles.get("booster").id) ? amount * 1.02 : amount;


            return res.json({
                "status": 200,
                "id": id,
                "xp": amount
            })


        });



        

        app.post('/dblwebhook', async function (req, res) {

            if(req.headers.authorization !== client.topggtoken) return;
            const {type, user} = req.body;

            if(client.dev) {
                console.log(req.body);
            } else {
                if(type !== "upvote") return;
            }

            client.channels.fetch(client.serverChannels.get("bumpchannel")).then(c => {

                c.send(`<@${user}> hat erfolgreich für unseren Server gevoted und ${client.voteReward} xp erhalten!\nVote auch du jetzt: https://top.gg/servers/793944435809189919/vote`)

            })
            await RESTApi.addUserXP(user, client.voteReward, "Voting")

            res.sendStatus(200);
            res.end();
        });


        app.listen(port, () => console.log(colors.green(`App listening on Port ${port}!`)))


    }


    async addUserXP(id, xp, ref) {
        const guildMember = (await this.client.guild.member(await this.client.users.fetch(id)))
        await this.client.utils.xpAdd(guildMember, xp)

        let amount = Math.abs(xp);
        amount = guildMember.roles.cache.has(this.client.serverRoles.get("booster").id) ? amount * 1.02 : amount;

        this.client.console.reportLog(`${ref ? ref : "**Quelle Unbekannt!**"} \`${guildMember.user.tag}\` wurden \`${amount}\` Erfahrungspunkte über die API hinzugefügt!`, true, true)
    }

}