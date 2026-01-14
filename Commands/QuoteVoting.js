const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
//NOTE: most of the voting logic exists within interactionCreate.js within the Events folder.
//That's where the bulk of the button logic lives and ergo most of our functionality for voting!

module.exports = {
    data: new SlashCommandBuilder().setName('startvoting').setDescription('Begin voting!'),
    async execute(interaction)
    {
        const btn_BeginVoting = new ButtonBuilder().setCustomId('beginVotingBtn').setLabel('Yes').setStyle(ButtonStyle.Primary);
        const btn_CancelStartup = new ButtonBuilder().setCustomId('cancelVotingStartupBtn').setLabel('No').setStyle(ButtonStyle.Secondary);
        const actRow_BeginVoting = new ActionRowBuilder().addComponents(btn_BeginVoting, btn_CancelStartup);

        await interaction.reply({
            content: 'Would you like to begin voting? This will send you a private DM',
            components: [actRow_BeginVoting],
            withResponse: true
        });
    },
};

