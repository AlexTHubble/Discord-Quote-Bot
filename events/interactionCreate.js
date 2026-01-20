const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, quote} = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);

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
            let btnID = interaction.customId;

            //Checks to see if either of the buttons are a rank button, this is needed because of the dynamic ID used to transfer data between events
            if(btnID.includes('FRank'))
            {
                const funnyRank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                await castVote(interaction, funnyRank, 0, quote)
                console.log(`Quote: ${quote} ranked at funny ${funnyRank}`);
            }
            else if(btnID.includes('CRank'))
            {
                const cursedRank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                await castVote(interaction, 0, cursedRank, quote)
                console.log(`Quote: ${quote} ranked at cursed ${cursedRank}`);
            }
            else //Non quote specific buttons
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
    let quoteJson = require(path.join(dataPath, 'Quotes.json'));
    let userJson = require(path.join(dataPath, 'UserStats.json'));
    /* STEPS
    *  1: Get user stats
    *  2: Acquire random quote unvoted quote & display
    *  3: Display three action rows
    *       row1: funny rank
    *       row2: cursed rank
    *       row3: options (skip, mark as not quote, display stats)
    *  4: Update both user stats & quote stats
    *  5: Ask to vote again (Separate function)
    * */
    //TODO: init users who aren't already in stats
    //TODO: Check if user has already voted on random quote, maybe generate seed?
    //TODO: Options menu. Skip, mark 'not a quote', exit, display stats, display ranks

    let userStats = userJson.users[interaction.user.globalName];

    let quoteKeys = Object.keys(quoteJson.quotes);
    let randomQuote = quoteJson.quotes[quoteKeys[Math.floor(Math.random() * quoteKeys.length)]]; //Grabs a random key & puts it into quotes to display

    console.log(randomQuote);
    console.log('Begin voting...');

    //Funny action row
    const btn_FunnyRank1 = new ButtonBuilder().setCustomId(`FRank 0:${randomQuote.quote}`).setLabel('0').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank2 = new ButtonBuilder().setCustomId(`FRank 1:${randomQuote.quote}`).setLabel('1').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank3 = new ButtonBuilder().setCustomId(`FRank 2:${randomQuote.quote}`).setLabel('2').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank4 = new ButtonBuilder().setCustomId(`FRank 3:${randomQuote.quote}`).setLabel('3').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank5 = new ButtonBuilder().setCustomId(`FRank 4:${randomQuote.quote}`).setLabel('4').setStyle(ButtonStyle.Primary);
    const actRow_FunnyRank = new ActionRowBuilder().addComponents(btn_FunnyRank1, btn_FunnyRank2, btn_FunnyRank3, btn_FunnyRank4, btn_FunnyRank5)

    //Cursed action row
    const btn_CursedRank1 = new ButtonBuilder().setCustomId(`CRank 0:${randomQuote.quote}`).setLabel('0').setStyle(ButtonStyle.Danger);
    const btn_CursedRank2 = new ButtonBuilder().setCustomId(`CRank 1:${randomQuote.quote}`).setLabel('1').setStyle(ButtonStyle.Danger);
    const btn_CursedRank3 = new ButtonBuilder().setCustomId(`CRank 2:${randomQuote.quote}`).setLabel('2').setStyle(ButtonStyle.Danger);
    const btn_CursedRank4 = new ButtonBuilder().setCustomId(`CRank 3:${randomQuote.quote}`).setLabel('3').setStyle(ButtonStyle.Danger);
    const btn_CursedRank5 = new ButtonBuilder().setCustomId(`CRank 4:${randomQuote.quote}`).setLabel('4').setStyle(ButtonStyle.Danger);
    const actRow_CursedRank = new ActionRowBuilder().addComponents(btn_CursedRank1, btn_CursedRank2, btn_CursedRank3, btn_CursedRank4, btn_CursedRank5)


    interaction.reply({content: `You should receive a message shortly`})
    //Quote and options
    await interaction.user.send({
        content: `Voting on quote: ${randomQuote.quote}`,
        //TODO: Add options action row here
    });
    //Funny rank action row
    await interaction.user.send({
        content: `Funny Rank`,
        components: [actRow_FunnyRank]
    });
    //Cursed rank action row
    await interaction.user.send({
        content: `Cursed Rank`,
        components: [actRow_CursedRank]
    });
}

async function castVote(interaction, funnyRank, cursedRank, quoteKey)
{
    let quoteJson = require(path.join(dataPath, 'Quotes.json'));

    if(funnyRank !== cursedRank) //If they're equal then 0 was pressed, delete the message without adjusting scores
    {
        const quote = quoteJson.quotes[quoteKey];
        quote.funnyRank += funnyRank;
        quote.cursedRank += cursedRank;

        interaction.reply(`Thank you for voting on ${quote.quote} \n 
        Said by ${quote.mentionedUser} \n 
        Quoted by ${quote.sentBy} \n 
        ${(funnyRank > cursedRank) ? 'funny' : 'cursed'} rank is now ${(funnyRank > cursedRank) ? quote.funnyRank : quote.cursedRank}`);

        await updateQuotesJsonFile();
    }

    await interaction.message.delete(); //This will delete the original action row, preventing multi voting
}

async function updateQuotesJsonFile()
{
    //TODO: Write the quote JSON file
}