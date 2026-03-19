const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, Message} = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);
const fs = require('node:fs');

const QuoteVoting = require("../QuoteVoting.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction)
    {
        console.log('message create event fired')
    },
};
