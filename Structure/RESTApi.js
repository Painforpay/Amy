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
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());


        app.post('/xp', async (req, res) => {
            const body = req.body;

            console.log(body)

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
            amount = (await this.client.utils.getGuildMember(body.id)).roles.cache.find(r => r.name === "Unterstützer") ? amount * 1.02 : amount;


            return res.json({
                "status": 200,
                "id": body.id,
                "xp": amount
            })


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