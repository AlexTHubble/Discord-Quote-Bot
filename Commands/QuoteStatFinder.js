const { SlashCommandBuilder, ChannelType} = require("discord.js");
const path = require('node:path');
const fs = require("node:fs");

const dataPath = path.join(__dirname, '..', 'Data',);

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
        let quoteJson = require(path.join(dataPath, 'Quotes.json'));
        const statsJson = require(path.join(dataPath, 'UserStats.json'));
        let hasQuotedCounts = [];
        let hasBeenQuotedCounts = [];

        for(const key in quoteJson.quotes)
        {
            let userMentioned = false;
            let userSent = false;
            for(const user in statsJson.users)
            {
                //Sent by
                if(user === quoteJson.quotes[key].sentBy)
                {
                    statsJson.users[user].sentByCount++;
                    userSent = true;
                }

                if(user === quoteJson.quotes[key].mentionedUser)
                {
                    statsJson.users[user].quotedCount++;
                    userMentioned = true;
                }
            }
            //Checks to see if a new user was found, if so initializes that user
            if(!userSent)
            {
                statsJson.users[quoteJson.quotes[key].sentBy] =
                    {
                        sentByCount: 1,
                        quotedCount: 0,
                        rankedQuotes: {}
                    }
            }
            else if(!userMentioned)
            {
                statsJson.users[quoteJson.quotes[key].mentionedUser] =
                    {
                        sentByCount: 0,
                        quotedCount: 1,
                        rankedQuotes: {}
                    }
            }
        }

        console.log("Gathered stats, pushing to json")
        let userOutput = {"users": statsJson};

        fs.writeFile(path.join(dataPath, 'UserStats.json'), JSON.stringify(userOutput, null, '\t'), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Successfully written UserStats.json');
        });

       /* hasBeenQuotedCounts.sort((a, b) => b.count - a.count)
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
        console.log(hasQuotedCounts);*/
    },
};

