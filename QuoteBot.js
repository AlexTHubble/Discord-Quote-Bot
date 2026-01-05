//https://discordjs.guide/legacy - Guide followed for using Discord.js
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./Config.json');

//Client Instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Runs once the client is ready
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Client ready: ${readyClient.user.tag}`);
});

client.login(token);