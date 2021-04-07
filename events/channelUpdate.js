const Event = require('../Structure/Event');


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
            if (newChannel.name != oldChannel.name && this.client.savePChannelNames) {
                this.client.con.query(`UPDATE \`users\` SET \`pChannelName\` = '${newChannel.name}' WHERE \`users\`.\`id\` = '${this.client.PVoices.get(newChannel.id).userid}';`)
            }
        }


    }


}