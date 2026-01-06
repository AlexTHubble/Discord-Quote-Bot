const { SlashCommandBuilder } = require("discord.js");
const path = require('node:path');


module.exports = {
    data: new SlashCommandBuilder().setName('displaystats')
        .setDescription('Display stats about quotes'),
    async execute(interaction)
    {
        const jsonPath = path.join(__dirname, '..', 'Quotes.json')
        let quotes = require(jsonPath);
        let hasQuotedCount = [];
        let hasBeenQuotedCounts = [];

        for(const quote of quotes)
        {
            let hasQuoted = false;
            for(const user in hasQuotedCount)
            {
                if(user.name === quote.quotedBy)
                {
                    hasQuoted = true;
                    user.count++;
                }
            }
            if(!hasQuoted)
                hasQuotedCount.push({name:quote.quotedUser, count:1})

            let hasBeenQuoted = false;
            for(const user in hasBeenQuotedCounts)
            {
                if(user.name === quote.quotedBy)
                {
                    hasBeenQuoted = true;
                    user.count++;
                }
            }
            if(!hasBeenQuoted)
                hasBeenQuotedCounts.push({name:quote.quotedUser, count:1})

        }

        console.log(hasBeenQuotedCounts);
        console.log(hasQuotedCount);
    },
};

