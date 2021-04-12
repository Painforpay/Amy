
const Command = require("../../Structure/Command");
const fetch = require("node-fetch");


module.exports = class extends Command {


    constructor(...args) {
        super(...args, {

            description: 'Suche nach Videos auf Youtube.',
            aliases: ["yt-search", "yt"],
            category: 'User',
            guildOnly: true,
            minArgs: 1,
            argsDef: ['<Suchbegriff>'],
            additionalinfo: "Es wird nur nach Videos gesucht."
        });
    }


    async run(message, args) {

        fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(args.join(" "))}&type=video&key=AIzaSyCyJb47XDKt8CFswb_mg6kgOsy1t8fMBBY`, {
            method: 'GET',
            Accept: 'application/json'


        }).then(res => {

            res.json().then(async body => {

                if (body.items.length === 0) return message.channel.send("Es wurde kein Ergebnis gefunden!")

                let datetime = Date.parse(new Date(body.items[0].snippet.publishedAt))

                let formattedDate = await this.client.utils.getDateTime(datetime);
                let vidID = body.items[0].id.videoId;
                if (vidID === undefined) return message.channel.send("Fehler bei der Suche! Bitte anderen Suchbegriff nutzen!")
                return message.channel.send(`Suchergebnis:\n[${formattedDate}]\n${body.items[0].snippet.title} von ${body.items[0].snippet.channelTitle}\nhttps://www.youtube.com/watch?v=${vidID}`)
            })


        })


    }
};
