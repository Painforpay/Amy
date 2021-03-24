const Event = require('../Structure/Event');

module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldMember, newMember) {

        let roles = oldMember.roles.cache.difference(newMember.roles.cache);

        roles.forEach(r => {
            let roleAdded = !oldMember.roles.cache.has(r.id);
            console.log(r.name, roleAdded ? "got added" : "got removed");
        })


    }


}