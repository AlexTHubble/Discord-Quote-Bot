const { SlashCommandBuilder, ChannelType} = require("discord.js");
const path = require('node:path');


module.exports = {
    data: new SlashCommandBuilder().setName('displaystats')
        .setDescription('Display stats about quotes')
        .addChannelOption(option =>
            option.setName('outputchannel')
                .setDescription('What channel should be the data be output to?')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction)
    {
        await interaction.reply('Working, this may take a moment')

        const outPutChannelOption = interaction.options.getChannel('outputchannel');
        const outPutChannel = await interaction.client.channels.fetch(outPutChannelOption.id)
        const jsonPath = path.join(__dirname, '..', 'Data', 'Quotes.json')
        let quoteJson = require(jsonPath);
        let hasQuotedCounts = [];
        let hasBeenQuotedCounts = [];

        for(const key in quoteJson.quotes)
        {
            let hasQuoted = false;
            hasQuotedCounts.forEach(count => {
                if(count.name === quoteJson.quotes[key].sentBy)
                {
                    hasQuoted = true;
                    count.count++;
                }

            })
            if(!hasQuoted)
                hasQuotedCounts.push({name:quoteJson.quotes[key].sentBy, count:1})
            let hasBeenQuoted = false;

            hasBeenQuotedCounts.forEach(count => {
                if(count.name === quoteJson.quotes[key].mentionedUser)
                {
                    hasBeenQuoted = true;
                    count.count++;
                }

            })
            if(!hasBeenQuoted)
                hasBeenQuotedCounts.push({name:quoteJson.quotes[key].mentionedUser, count:1})

        }


        hasBeenQuotedCounts.sort((a, b) => b.count - a.count)
        hasQuotedCounts.sort((a, b) => b.count - a.count)

        outPutChannel.send('**SPAMMING CHANNEL WITH QUOTE STATS PLEASE HOLD**')

        outPutChannel.send('------------QUOTED COUNTS------------')
        hasBeenQuotedCounts.forEach(count => {
            outPutChannel.send(`User: **${count.name}** | Times user has been quoted: *${count.count}*`)
        })

        outPutChannel.send('------------HAS QUOTED COUNTS------------')
        hasQuotedCounts.forEach(count => {
            outPutChannel.send(`User: **${count.name}** | Times user has quoted others: *${count.count}*`)
        })

        outPutChannel.send('**ITS SAFE TO TALK AGAIN**')


        console.log(hasBeenQuotedCounts);
        console.log(hasQuotedCounts);
    },
};

