const Event = require('../Structure/Event');
const { Collection } = require('discord.js');

// noinspection EqualityComparisonWithCoercionJS
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(error) {
        this.client.console.reportError(error.stackTrace);
    }


}