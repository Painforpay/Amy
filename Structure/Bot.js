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

        this.aliases = new Collection();

        this.dev = options.dev;

        this.datetimeformat = {  year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone: 'CET' }

        this.categories = new Collection();

        this.verbose = options.verbose;

        this.evals = new Collection();

        this.events = new Collection();

        this.subCommands = new Collection();

        this.utils = new Util(this);

        this.owners = options.owners;

        this.maxChanSize = 4;

        this.con = new MySQL(options.host, options.username, options.password).createConnection();

        this.invites = {};

        this.prefix = options.prefix;

        this.raidCounter = 0;

        this.PVoices = new Collection(); //List of Current Private Channels

        this.spamCollection = new Collection();

        this.raidMode = false;

        this.disabledCommands = [];

        this.conceptDevelopment = false;

        this.deletedAudits = new Collection();

        this.lounges = [];

        this.cmdAllowedChannels = ['796157701062524929', '800110138433601546']

        this.xpMessages = 1;    //XP pro Nachricht

        this.xpVoice = 2;   //XP pro Minute

        this.messagesPerSecond = 3; //Nachrichten erlaubt pro Sekunde

        this.VoiceUsers = new Collection();

        this.picCooldown = new Collection();

        this.currentMaxLevel = 6;
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
