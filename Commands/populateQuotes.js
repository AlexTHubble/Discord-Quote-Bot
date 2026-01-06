const { SlashCommandBuilder, ChannelType, TextBasedChannel, ChannelManager } = require("discord.js");
const { quotes } = require(`../Quotes.json`);
const fs = require('node:fs');


module.exports = {
    data: new SlashCommandBuilder().setName('populatequotejson')
        .setDescription('Populates the quote json with all existing quotes.')
        .addStringOption((option) =>
            option.setName('proceedcommand')
                .setDescription('WARNING: this will wipe the previous data, proceed?')
                .setRequired(true)
                .addChoices({ name: 'yes', value: 'yes'}, { name: 'no', value: 'no'}))
        .addChannelOption((option) =>
            option.setName('setchannel')
                .setDescription('Choose a channel to scrub')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction)
    {
        const proceedConformation = interaction.options.getString('proceedcommand');
        const targetChannel = interaction.options.getChannel('setchannel');
        let channel = await interaction.client.channels.fetch(targetChannel.id)

        let messages = [];
        let chatQuotes = []

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

        for(const message of messages) {
            if(message.content.includes('"') && message.mentions.users.size > 0)
            {
                let outPut = {
                    quotedUser: "",
                    quote: "",
                    quotedBy: ""
                }

                outPut.quotedUser = message.mentions.users.entries().next().value[1].username
                outPut.quotedBy = message.author.globalName;
                outPut.quote = message.content;


                quotes.push(outPut);

                let quoteOutput = {"quotes": quotes};

                fs.writeFile('Quotes.json', JSON.stringify(quoteOutput), 'utf8', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Successfully written Quotes.json');
                });            }

        }
        await interaction.reply(`Finished populating quote json`);
    },
};

