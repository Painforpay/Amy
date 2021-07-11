let {red, yellow} = require("colors");

module.exports = class Command {

    constructor(client) {
        this.client = client;

    }

    reportError(err) {


        this.client.serverChannels.get("botlogs").send(`\`\`\`${err}\`\`\``)

        if(err.code !== 10008) console.error(red(err));


    }

    reportLog(log, important = false, timestamp = false) {
        if(important) {
            this.client.serverChannels.get("botlogs").send(`**Logging:**\n\`\`\`${log}\`\`\``)
            console.log(yellow(`${timestamp ? `[${this.client.utils.getDateTime()}]\n` : ""}`+ log));
        } else {
            console.log(log);
        }
    }

};