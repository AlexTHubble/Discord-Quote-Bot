const { SlashCommandBuilder, ChannelType} = require("discord.js");
const fs = require('node:fs');
const path = require("node:path");

const dataPath = path.join(__dirname, '..', 'Data',);
const quoteJson  = require(path.join(dataPath, 'Quotes.json'));

module.exports = {
    data: new SlashCommandBuilder().setName('populatequotejson')
        .setDescription('Populates the quote json with all existing quotes.')
        .addChannelOption((option) =>
            option.setName('setchannel')
                .setDescription('Choose a channel to scrub')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction)
    {
        const targetChannel = interaction.options.getChannel('setchannel');
        let channel = await interaction.client.channels.fetch(targetChannel.id)

        await interaction.reply('Working, this may take a moment')

        if(typeof quoteJson.quotes  === 'undefined')
            quoteJson.quotes = {};

        console.log("Starting scrub")
        let messages = [];

        let message = await channel.messages.fetch({limit: 1}).then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null))

        while (message) {
            await channel.messages
                .fetch({ limit: 100, before: message.id })
                .then(messagePage => {
                    messagePage.forEach(
                        msg => messages.push(msg));

                    // Update our message pointer to be the last message on the page of messages
                    message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                });
        }
        console.log("Acquired messages, sorting for quotes")
        for(const message of messages) {
            if(message.content.includes('"') && message.mentions.users.size > 0)
            {
                let outPut = {
                    mentionedUser: "",
                    quote: "",
                    sentBy: "",
                    cursedRank: 0,
                    funnyRank: 0
                }

                let quote = message.content;
                quote = quote.substring(quote.indexOf('"'), quote.indexOf('<'))
                quote = quote.replaceAll('"', '');

                outPut.quote = quote;
                outPut.mentionedUser = message.mentions.users.entries().next().value[1].globalName
                outPut.sentBy = message.author.globalName;


                //Checks if we're redefining a quote, if we are take the existing rankings
                if(typeof quoteJson.quotes[outPut.quote] !== "undefined")
                {
                    outPut.cursedRank = quoteJson.quotes[outPut.quote].cursedRank
                    outPut.funnyRank = quoteJson.quotes[outPut.quote].funnyRank
                }

                quoteJson.quotes[outPut.quote] = outPut;
            }

        }

        console.log("Sorted quotes, pushing to json")
        //let quoteOutput = {quoteJson};

        fs.writeFile( path.join(dataPath, 'Quotes.json'), JSON.stringify(quoteJson, null, '\t'), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Successfully written Quotes.json');
        });
        await interaction.followUp('Finished');
    },
};

