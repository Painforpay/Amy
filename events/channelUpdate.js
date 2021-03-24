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
                newChannel.setUserLimit(this.client.maxChanSize);
            }
        }


    }


}