const BotClient = require('./Structure/Bot');
const config = require('./JSON/config.json');

const client = new BotClient(config);
client.start().then(() => console.log(""));
