const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName('populatequotejson').setDescription('Populates the quote json with all existing quotes'),
    async execute(interaction)
    {
        await interaction.reply('pong!')
    },
};
