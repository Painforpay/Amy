const SubCommand = require('../../../Structure/SubCommand');



module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Zeigt alle Geburtstage an, welche zur Zeit eingetragen sind!',
            category: 'users',
            guildOnly: true,
            parent: __dirname.substring(require('path').resolve(__dirname, '..').length+1)
        });
    }

    async run(message) {
        return this.client.utils.birthdayembed(message);
    }
}


