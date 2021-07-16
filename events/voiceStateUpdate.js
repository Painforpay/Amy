const Event = require('../Structure/Event');


// noinspection EqualityComparisonWithCoercionJS
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            once: false
        });
    }

    async run(oldState, newState) {

        let voicecontext = this.client.serverRoles.get("voicecontext");

        if (!oldState.selfDeaf && newState.selfDeaf) {
            //User selfdeafened

            if (!this.client.fullMutes.has(newState.member.id)) {

                this.client.fullMutes.set(newState.member.id, {
                    member: newState.member,
                    timestamp: Date.parse(new Date().toString())
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
                time: Date.parse(new Date().toString())
            });

            // await this.client.utils.createLounge();

            if (newState.channel.members.size == 2) {

                let member = newState.channel.members.filter(member => member.id !== newState.member.id);

                if (!this.client.VoiceUsers.has(member.map(x => x)[0].id)) {
                    this.client.VoiceUsers.set(member.map(x => x)[0].id, {
                        user: member.map(x => x)[0].id,
                        time: Date.parse(new Date().toString())
                    });
                }

            }


            await newState.member.roles.add(voicecontext.id);

            if (newState.channel == this.client.serverChannels.get("createuserchanchannel")) await this.client.utils.createPVoice(newState, this.client.maxChanSize)


            if(newState.channel.userLimit > 0 && (newState.channel.members.size > newState.channel.userLimit) && !this.client.allowFullChannelJoin){
                if(newState.member.user.bot) return;
                let actualUsers = newState.channel.members.filter(member => !member.user.bot && !member.roles.cache.has(this.client.serverRoles.get("altAccount").id))
                if(newState.member.roles.cache.has(this.client.serverRoles.get("altAccount").id)) actualUsers++;
                if(actualUsers.size <= newState.channel.userLimit) return;
                newState.setChannel(oldState.channel, `Tried joining a full Channel`);
                try {
                    newState.member.user.send(`Du kannst diesem Channel nicht betreten, da er voll ist!`).then(m => m.delete({timeout:20000}))
                } catch (e) {
                    //Can't send Messages to User
                }
            }
        } else if (!newState.channel && oldState.channel) {
            //User left a Channel
            if(!oldState.member) return;
            if(!oldState.channel) return;
            //User left Server and thus left channel


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
                if(!oldState.member || !oldState.channel) return;
                let member = oldState.channel.members.filter(member => member.id !== oldState.member.id);

                await this.client.utils.VoiceUserDisconnectXP(member.map(x => x)[0].voice, true);


            }

            if (oldState.channel.members.size < 1) await this.client.utils.deletePVoice(oldState.channel);
            if (newState.channel == this.client.serverChannels.get("createuserchanchannel")) await this.client.utils.createPVoice(newState, this.client.maxChanSize)



            if(newState.channel.userLimit > 0 && (newState.channel.members.size > newState.channel.userLimit) && !this.client.allowFullChannelJoin){
                if(newState.member.user.bot) return;
                let actualUsers = newState.channel.members.filter(member => !member.user.bot && !member.roles.cache.has(this.client.serverRoles.get("altAccount").id))
                if(newState.member.roles.cache.has(this.client.serverRoles.get("altAccount").id)) actualUsers++;
                if(actualUsers.size <= newState.channel.userLimit) return;
                newState.setChannel(oldState.channel, `Tried joining a full Channel`);
                try {
                    newState.member.user.send(`Du kannst diesem Channel nicht betreten, da er voll ist!`).then(m => m.delete({timeout:20000}))
                } catch (e) {
                    //Can't send Messages to User
                }
            }

        }


    }


}