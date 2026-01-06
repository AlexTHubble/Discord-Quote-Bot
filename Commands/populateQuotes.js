const { SlashCommandBuilder, ChannelType, TextBasedChannel, ChannelManager } = require("discord.js");

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


        let message = await channel.messages.fetch({limit: 1}).then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null))


        while (message) {
            await channel.messages
                .fetch({ limit: 100, before: message.id })
                .then(messagePage => {
                    messagePage.forEach(msg => messages.push(msg));

                    // Update our message pointer to be the last message on the page of messages
                    message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                });


        }

        console.log(messages);

        await interaction.reply(`Finished populating quote json`);
    },
};

