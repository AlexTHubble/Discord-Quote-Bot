const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);
let quoteJson = require(path.join(dataPath, 'Quotes.json'));
let userJson = require(path.join(dataPath, 'UserStats.json'));

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
            let btnID = interaction.customId;

            //Checks to see if either of the buttons are a rank button
            if(btnID.includes('FRank'))
            {
                const rank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                castFunnyVote(interaction, rank, quote)
                console.log(`Quote: ${quote} ranked at funny ${rank}`);
            }
            else
            {
                switch(btnID){
                    case "beginVotingBtn":
                        await beginVoting(interaction);
                        break;
                    case "cancelVotingStartupBtn":
                        console.log('Cancel voting...');
                        interaction.reply({content: `Aborting process`})
                        break;
                }
            }

        }
	},
};

//Button functions
async function beginVoting(interaction)
{
    /* STEPS
    *  1: Get user stats
    *  2: Acquire random quote unvoted quote & display
    *  3: Display three action rows
    *       row1: funny rank
    *       row2: cringe rank
    *       row3: options (skip, mark as not quote, display stats)
    *  4: Update both user stats & quote stats
    *  5: Ask to vote again (Separate function)
    * */

    let userStats = userJson.users[interaction.user.globalName]; //TODO: init users who aren't already in stats

    let quoteKeys = Object.keys(quoteJson.quotes);
    let randomQuote = quoteJson.quotes[quoteKeys[Math.floor(Math.random() * quoteKeys.length)]]; //Grabs a random key & puts it into quotes to display

    console.log(randomQuote);
    console.log('Begin voting...');

    //Funny action row
    const btn_FunnyRank1 = new ButtonBuilder().setCustomId(`FRank 1:${randomQuote.quote}`).setLabel('1').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank2 = new ButtonBuilder().setCustomId(`FRank 2:${randomQuote.quote}`).setLabel('2').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank3 = new ButtonBuilder().setCustomId(`FRank 3:${randomQuote.quote}`).setLabel('3').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank4 = new ButtonBuilder().setCustomId(`FRank 4:${randomQuote.quote}`).setLabel('4').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank5 = new ButtonBuilder().setCustomId(`FRank 5:${randomQuote.quote}`).setLabel('5').setStyle(ButtonStyle.Primary);
    const actRow_FunnyRank = new ActionRowBuilder().addComponents(btn_FunnyRank1, btn_FunnyRank2, btn_FunnyRank3, btn_FunnyRank4, btn_FunnyRank5)

    //Cringe action row

    interaction.reply({content: `You should receive a message shortly`})
    await interaction.user.send({
        content: `Voting on quote: ${randomQuote.quote}`,
        components: [actRow_FunnyRank],
        withResponse: true
    });
}

async function castFunnyVote(interaction, funnyRank, quoteKey)
{
    const quote = quoteJson.quotes[quoteKey];
    quote.funnyRank += funnyRank;
    interaction.reply(`Thank you for voting on ${quote.quote} \n Said by ${quote.mentionedUser} \n Quoted by ${quote.sentBy} \n funny rank is now ${quote.funnyRank}`);
    await updateQuotesJsonFile();
}

async function updateQuotesJsonFile()
{

}