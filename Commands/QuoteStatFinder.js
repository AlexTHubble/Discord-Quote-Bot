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
        const statsJson = { users: {}}

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
        fs.writeFile(path.join(dataPath, 'UserStats.json'), JSON.stringify(statsJson, null, '\t'), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Successfully written UserStats.json');
        });
    },
};

