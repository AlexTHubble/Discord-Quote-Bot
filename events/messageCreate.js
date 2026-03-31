const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, Message} = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);
const fs = require('node:fs');

const QuoteVoting = require("../QuoteVoting.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction)
    {
        //April fools' prank 2026, remove when finished
        await censorFromList(interaction);
    },
};


async function censorFromList(interaction)
{
    let config = require('../Config.json');


    //TODO: Delete when ready to unleash on gamer time
    if(interaction.guildId === config['provingGroundID'])
    {
        let censorListJson = require(path.join(dataPath, 'censorList.json'));

        let words = interaction.content.split(" ");
        let updatedMessage = interaction.content;
        let foundWords = [];
        for (let word of words)
        {
            if(censorListJson[word[0]].includes(word))
            {
                foundWords.push(word);
            }
        }

        if(foundWords.length > 0)
        {
            const replies = [``]

        }
    }
}