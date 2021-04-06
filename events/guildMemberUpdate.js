const Event = require('../Structure/Event');
const colors = require('colors/safe');
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldMember, newMember) {


        if (oldMember.premiumSinceTimestamp != newMember.premiumSinceTimestamp) {
            if (oldMember.premiumSinceTimestamp == null) {
                //Member boosted the Server

                this.client.utils.logTogeneral(`${newMember} hat gerade den Server geboosted! Vielen Dank! Derzeitige Booster: ${newMember.guild.premiumSubscriptionCount}`)
            }
        }


    }

}
