const Event = require('../Structure/Event');
const { Collection } = require('discord.js');

// noinspection EqualityComparisonWithCoercionJS
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldChannel, newChannel) {

        if (this.client.PVoices.has(newChannel.id)) {
            if (newChannel.userLimit > this.client.maxChanSize || newChannel.userLimit == 0) {
                await newChannel.setUserLimit(this.client.maxChanSize);
            }
            if (newChannel.name != oldChannel.name && this.client.savePChannelNames){
                let fResult = await this.client.utils.profanityFilter(newChannel.name)

                if (fResult["is-bad"]) {
                    let user = this.client.users.resolve(this.client.PVoices.get(newChannel.id).userid);
                    user.send(`Dieser Channelname enthält Wörter die ich nicht nutzen kann!`).then(m => m.delete({timeout: 10000}).catch(err => this.client.console.reportError(err.stack)));
                    await newChannel.setName(oldChannel.name);
                    return;

                }

                let data = new Collection().set("pChannelName", newChannel.name);


                await this.client.con.updateUser(this.client.PVoices.get(newChannel.id).userid, data).catch(err => this.client.console.reportError(err.stack));


            }
        }


    }


}