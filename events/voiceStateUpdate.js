const Event = require('../Structure/Event');


// noinspection EqualityComparisonWithCoercionJS
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldState, newState) {

        let voicecontext = oldState.member.guild.roles.cache.get(this.client.dev ? "800110137553453112" : "795075741955653652")

        if (!oldState.selfDeaf && newState.selfDeaf) {
            //User selfdeafened

            if (!this.client.fullMutes.has(newState.member.id)) {

                this.client.fullMutes.set(newState.member.id, {
                    member: newState.member,
                    timestamp: Date.parse(new Date())
                });

            }
        } else if (oldState.selfDeaf && !newState.selfDeaf) {

            if (this.client.fullMutes.has(newState.member.id)) {

                this.client.fullMutes.delete(newState.member.id);

            }


        }


        if (newState.channel && !oldState.channel) {
            //User Joined a Channel

            this.client.VoiceUsers.set(newState.member.id, {
                user: newState.member.id,
                time: Date.parse(new Date())
            });

            // await this.client.utils.createLounge();

            if (newState.channel.members.size == 2) {

                let member = newState.channel.members.filter(member => member.id !== newState.member.id);

                if (!this.client.VoiceUsers.has(member.map(x => x)[0].id)) {
                    this.client.VoiceUsers.set(member.map(x => x)[0].id, {
                        user: member.map(x => x)[0].id,
                        time: Date.parse(new Date())
                    });
                }

            }


            await newState.member.roles.add(voicecontext.id);

            if (newState.channel.id == (this.client.dev ? "804744090637959178" : "804684722763595777")) await this.client.utils.createPVoice(newState, this.client.maxChanSize)


            if(this.client.allowFullChannelJoin) return;
            if(newState.channel.userLimit == 0) return;
            if(newState.channel.userLimit < newState.channel.members.size){
                if(newState.member.user.bot) return;
                newState.kick(`Tried to join a full Channel!`);
                newState.member.user.send(`Du darfst keinen vollen Channeln beitreten!`).then(m => m.delete({timeout:20000}))
            }
        } else if (!newState.channel && oldState.channel) {
            //User left a Channel

            // If necessary - Delete Lounge User was in.
            // await this.client.utils.deleteLounge(oldState);

            //Remove VoiceKontext Role
            await oldState.member.roles.remove(voicecontext.id);

            //give User XP
            await this.client.utils.VoiceUserDisconnectXP(oldState);

            if (oldState.channel.members.size == 1) {

                let member = oldState.channel.members.filter(member => member.id !== oldState.member.id);

                await this.client.utils.VoiceUserDisconnectXP(member.map(x => x)[0].voice, true);


            }

            if (this.client.fullMutes.has(oldState.member.id)) {

                this.client.fullMutes.delete(oldState.member.id);

            }

            if (oldState.channel.members.size < 1) await this.client.utils.deletePVoice(oldState.channel);

        } else if (newState.channel && oldState.channel) {
            if (newState.channel == oldState.channel) return;
            //User changed the channel
            //As the User only changed the channel, removing/adding VoiceKontext is not necessary

            //give User XP
            await this.client.utils.VoiceUserChannelChangeXP(oldState);


            if (oldState.channel.members.size == 1) {

                let member = oldState.channel.members.filter(member => member.id !== oldState.member.id);

                await this.client.utils.VoiceUserDisconnectXP(member.map(x => x)[0].voice, true);


            }

            if (oldState.channel.members.size < 1) await this.client.utils.deletePVoice(oldState.channel);
            if (newState.channel.id == (this.client.dev ? "804744090637959178" : "804684722763595777")) await this.client.utils.createPVoice(newState, this.client.maxChanSize)

            if(this.client.allowFullChannelJoin) return;
            if(newState.channel.userLimit == 0) return;
            if(newState.channel.userLimit < newState.channel.members.size){
                if(newState.member.user.bot) return;
                newState.setChannel(oldState.channel, `Tried joining a full Channel`);
                newState.member.user.send(`Du darfst keinen vollen Channeln beitreten!`).then(m => m.delete({timeout:20000}))
            }

        }


    }


}