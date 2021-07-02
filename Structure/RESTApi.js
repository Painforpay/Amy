const express = require('express');
const bodyParser = require('body-parser');
const colors = require('colors/safe');
const app = express();
const port = 3000;

module.exports = class RESTApi {

    constructor(client) {

        this.client = client;

    }

    createServer() {
        let ClientBot = this.client;
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());


        app.post('/xp', async (req, res) => {
            const body = req.body;

            if(!ClientBot.enableAPIXP) return;

            let ref;
            switch (body.auth) {
                case "TVKpT8SZZu": {
                    ref = "Charlie [BOT]";
                }
                break;
                default: {
                    res.status(401)


                    console.error(colors.yellow(`Denied Request\n${JSON.stringify(body)}`))
                    return res.json({
                        "status": 401,
                        "response": "Authorization Failed"
                    })
                }
            }

            await this.addUserXP(body.id, body.xp, ref)

            res.status(200);

            let amount = Math.abs(body.xp);
            amount = (await ClientBot.utils.getGuildMember(body.id)).roles.cache.find(r => r.name === "Unterstützer") ? amount * 1.02 : amount;


            return res.json({
                "status": 200,
                "id": body.id,
                "xp": amount
            })


        });



        let ThisClass = this;

        app.post('/dblwebhook', async function (req, res) {

            if(req.headers.authorization !== ClientBot.topggtoken) return;
            let vote = req.body;

            if(ClientBot.dev) {
                console.log(vote)
            } else {
                if(vote.type !== "upvote") return;
            }

            ClientBot.channels.fetch(ClientBot.dev ? "836203865929023518": "823910154449846292").then(c => {

                c.send(`<@${vote.user}> hat erfolgreich für unseren Server gevoted und ${ClientBot.voteReward} xp erhalten!\nVote auch du jetzt: https://top.gg/servers/793944435809189919/vote`)

            })
            await ThisClass.addUserXP(vote.user, ClientBot.voteReward, "Voting")

            res.sendStatus(200);
            res.end();
        });


        app.listen(port, () => console.log(colors.green(`App listening on Port ${port}!`)))


    }


    async addUserXP(id, xp, ref) {
        await this.client.utils.xpadd((await this.client.utils.getGuildMember(id)), xp)

        let amount = Math.abs(xp);
        amount = (await this.client.utils.getGuildMember(id)).roles.cache.find(r => r.name === "Unterstützer") ? amount * 1.02 : amount;

        this.client.utils.log(`${ref ? "**" + ref + ":**" : "**Quelle Unbekannt!**"} \`${(await this.client.utils.getGuildMember(id)).user.tag}\` wurden \`${amount}\` Erfahrungspunkte über die API hinzugefügt!`)
        console.log(colors.green(`${ref ? ref + ":" : "Quelle Unbekannt!"} ${(await this.client.utils.getGuildMember(id)).user.tag} wurden ${amount} Erfahrungspunkte über die API hinzugefügt!`))
    }

}