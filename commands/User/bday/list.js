
const SubCommand = require('../../../Structure/SubCommand');


module.exports = class extends SubCommand {

    constructor(...args) {
        super(...args, {
            description: 'Zeigt alle Geburtstage, welche zur Zeit eingetragen sind!',
            category: 'users',
            guildOnly: true,
            parent: 'bd'
        });
    }

    async run(message) {
        return this.client.utils.birthdayembed(message);
    }
}


