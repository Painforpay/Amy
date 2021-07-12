const SubCommand = require('../../../Structure/SubCommand');



module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Zeigt alle Geburtstage an, welche zur Zeit eingetragen sind!',
            category: 'users',
            guildOnly: true,
            parent: __dirname.split(require('path').sep).pop()
        });
    }

    async run(message) {
        message.delete();
        return this.client.utils.birthdayembed(message);
    }
}


