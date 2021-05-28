const {Client, Collection, Permissions} = require('discord.js');
const Util = require('./Utils.js');
const MySQL = require('./MySQL.js');
const RESTApi = require('./RESTApi.js');

module.exports = class Bot extends Client {


    constructor(options = {}) {
        super({
            disableMentions: 'everyone',
            partials: ["REACTION", "MESSAGE"]
        });
        this.validate(options);

        this.commands = new Collection();

        this.version = options.version;

        this.isBeta = options.isBeta;

        this.aliases = new Collection();

        this.dev = options.dev;

        this.datetimeformat = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'CET'
        }

        this.categories = new Collection();

        this.verbose = options.verbose;

        this.neutrinoapi = [options.neutrinoapiuid, options.neutrinoapikey];

        this.setAfkUsers = new Collection(); //Collection aus Usern die AFK gesetzt sind.

        this.evals = new Collection();

        this.events = new Collection();

        this.subCommands = new Collection();

        this.utils = new Util(this);

        this.owners = options.owners;

        this.topggtoken = options.topggAuth;

        this.maxChanSize = 4;  //Maximale Größe von UserChanneln

        this.con = new MySQL(options.host, options.username, options.password).createConnection();

        this.invites = {};

        this.prefix = options.prefix;

        this.raidCounter = 0;

        this.fullMutes = new Collection(); //List of Fullmute Members

        this.PVoices = new Collection(); //List of Current Private Channels

        this.antispam = new Collection();

        this.raidMode = false;  //Automatisch vom Bot verwaltet - Wenn wahr wird jeder neue User welcher joined gekickt

        this.disabledCommands = [];

        this.conceptDevelopment = false; //Wenn wahr: Nur User mit der Konzeptentwicklungsrolle können in Diskussionen mitreden

        this.deletedAudits = new Collection();

        this.lounges = [];

        this.cmdAllowedChannels = ['796157701062524929', '800110138433601546']

        this.xpMessages = 1;    //XP pro Nachricht

        this.xpVoice = 2;   //XP pro Minute

        this.messagesPerSecond = 3; //Nachrichten erlaubt pro Sekunde

        this.VoiceUsers = new Collection();

        this.picCooldown = new Collection();

        this.currentMaxLevel = 6; //Gegenwärtig höchste Levelrolle. Plus eins und dann Mal 10 zu nehmen. 6 = Level 70

        this.savePChannelNames = true; //Autosave the Channel Name if it gets updated.

        this.fullMuteAFK = true; //Wenn Wahr werden User nach einer Speziellen Zeit im FullMute in den AFK gemoved

        this.fullMuteAFKTime = 5; //Zeit in minuten nach denen ein User im fullmute in den Afk gemoved wird.

        this.picCooldownSecs = 10; //Zeit in Sekunden die man Zwischen bildern warten muss!

        this.birthdayReward = 500; //Anzahl an XP die der User an seinem Geburtstag geschenkt bekommt

        this.voteReward = 50; //Anzahl xp welche man für topgg Votes bekommt!

        this.enableAPIXP = false; //Wenn wahr, werden API Anfragen für XP angenommen!

        this.allowFullChannelJoin = false; //Wenn wahr, dürfen User mit Move rechten einem vollem Channel joinen!

        this.spamMuteTime = 2; //Zeit in Minuten für welche man gemuted wird, wenn man spammt!

    }

    validate(options) {
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');


        if (options.dev) {
            if (!options.tokendev) throw new Error('You must pass the Dev-token for the client.');
            this.token = options.tokendev;
        } else {
            if (!options.token) throw new Error('You must pass the token for the client.');
            this.token = options.token;
        }


        if (!options.prefix) throw new Error('You must pass a prefix for the client.');
        if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
        this.prefix = options.prefix;

        if (!options.defaultPerms) throw new Error('You must pass default perm(s) for the Client.');
        this.defaultPerms = new Permissions(options.defaultPerms).freeze();
    }

    async start(token = this.token) {

        this.owners = await this.utils.getOwners(this.owners);
        new RESTApi(this).createServer();

        await this.utils.loadCategories();
        await this.utils.loadSubCommands();
        await this.utils.loadCommands();
        await this.utils.loadEvents();
        await super.login(token);

    }

};
