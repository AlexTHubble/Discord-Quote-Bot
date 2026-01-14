const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isButton()) {
            // respond to the button
            console.log(`Button: ${interaction.customId} pressed`)

            switch(interaction.customId){
                case "beginVotingBtn":
                    await beginVoting(interaction);
                    break;
                case "cancelVotingStartupBtn":
                    console.log('Cancel voting...');
                    interaction.reply({content: `Aborting process`})
                    break;
            }
        }
	},
};

//Button functions
async function beginVoting(interaction)
{
    console.log('Begin voting...');

    const btn_test1 = new ButtonBuilder().setCustomId('test1').setLabel('test1').setStyle(ButtonStyle.Primary);
    const btn_test2 = new ButtonBuilder().setCustomId('test2').setLabel('test2').setStyle(ButtonStyle.Secondary);
    const actRow_test = new ActionRowBuilder().addComponents(btn_test1, btn_test2);

    interaction.reply({content: `You should receive a message shortly`})
    await interaction.user.send({
        content: 'This is a test dont mind me',
        components: [actRow_test],
        withResponse: true
    });

}