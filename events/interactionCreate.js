const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, quote} = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);
const fs = require('node:fs');

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

            //Checks to see if the button uses a dynamic Unique ID to transfer specific data, if not move to the switchboard
            if(btnID.includes('FRank'))
            {
                const funnyRank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                await castVote(interaction, funnyRank, 0, quote)
                console.log(`Quote: ${quote} ranked at funny ${funnyRank}`);
            }
            else if(btnID.includes('showCursedLeaderboardBtn'))
            {
                const amountToShow = parseInt(btnID.slice(25));
                await displayTopQuoteLeaderboard(interaction, 'cursed', amountToShow);
            }
            else if(btnID.includes('showFunnyLeaderboardBtn'))
            {
                const amountToShow = parseInt(btnID.slice(24));
                await displayTopQuoteLeaderboard(interaction, 'funny', amountToShow);
            }
            else if(btnID.includes('CRank'))
            {
                const cursedRank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                await castVote(interaction, 0, cursedRank, quote)
                console.log(`Quote: ${quote} ranked at cursed ${cursedRank}`);
            }
          /*  else if(btnID.includes('nextQuoteBtn'))
            {
                const quote = btnID.slice(13)
                await markQuoteError(interaction, quote);
            }*/
            else //Non quote specific buttons
            {
                switch(btnID){
                    case "beginVotingBtn":
                        await sendQuoteVote(interaction);
                        break;
                    case "cancelVotingStartupBtn":
                        interaction.reply({content: `Aborting process`, flags: MessageFlags.Ephemeral })
                        break;
                    case "nextQuoteBtn":
                        await sendQuoteVote(interaction);
                        break;
                    case "showUserStatsBtn":
                        await showUserStats(interaction);
                        break;
                    case "showLeaderboardBtn":
                        await showLeaderboardMenu(interaction, "Main");
                        break;
                    case"userLeaderboardsBtn":
                        await showLeaderboardMenu(interaction, "Users");
                        break;
                    case "quoteLeaderboardsBtn":
                        await showLeaderboardMenu(interaction, "Quotes");
                        break;
                    case"showFunnyLeaderboardMenuBtn":
                        await showLeaderboardMenu(interaction, "FunnyNumber");
                        break;
                    case"showCursedLeaderboardMenuBtn":
                        await showLeaderboardMenu(interaction, "CursedNumber");
                        break;
                    case "closeMenuBtn":
                        await closeMenu(interaction);
                        break;
                    case "showTimesQuotedLeaderboardBtn":
                        await showUserLeaderboards(interaction, "quotedCount");
                        break;
                    case "showRecorderLeaderboardBtn":
                        await showUserLeaderboards(interaction, "sentByCount");
                        break;
                    case "showUserFunnyLeaderboardBtn":
                        await showUserLeaderboards(interaction, "funnyRank");
                        break;
                    case "showUserCursedLeaderboardBtn":
                        await showUserLeaderboards(interaction, "cursedRank");
                        break;
                }
            }
        }
	},
};

//Button functions
async function sendQuoteVote(interaction)
{
    /* STEPS
    *  1: Get user stats
    *  2: Acquire random quote unvoted quote & display
    *  3: Display three action rows
    *       row1: funny rank
    *       row2: cursed rank
    *       row3: options (skip, mark as not quote, display stats)
    *  4: Update both user stats & quote stats
    *  5: Ask to vote again
    * */

    let quoteJson = require(path.join(dataPath, 'Quotes.json'));
    let userJson = require(path.join(dataPath, 'UserStats.json'));

    let userStats = await initUserStats(interaction.user.globalName)

    //Checks to see if the user has a quote list, if not initialize it
    if(userStats.quoteOrder.length <= 0)
    {
        let quoteKeys = Object.keys(quoteJson.quotes);
        await shuffle(quoteKeys);
        userStats.quoteOrder = quoteKeys;
    }

    let currentQuote = userStats.quoteOrder[userStats.lastQuote]; //Grabs the next key from the shuffled list
    userStats.lastQuote++;

    const quotesLength = Object.keys(quoteJson.quotes).length
    if(userStats.lastQuote >= quotesLength)
    {
        //TODO: Do end of list functionality
        userStats.lastQuote = 0; //Placeholder functionality, reset the quote list to beginning
    }

    userJson.users[interaction.user.globalName] = userStats; //Updates the core json after all is done
    //Updates UserStats.json with the update
    await writeToJsonFile("UserStats.json", userJson);

    console.log('Begin voting...');

    //Options action row
    const btn_NextQuote = new ButtonBuilder().setCustomId(`beginVotingBtn`).setLabel('Next Quote').setStyle(ButtonStyle.Primary);
    //TODO: Uncomment when done testing & error functionality is implemented
    //const btn_MarkError = new ButtonBuilder().setCustomId('markErrorBtn').setLabel('Mark Error').setStyle(ButtonStyle.Danger);
    const btn_ShowUserStats = new ButtonBuilder().setCustomId('showUserStatsBtn').setLabel('Show User Stats').setStyle(ButtonStyle.Secondary);
    const btn_ShowLeaderBoard = new ButtonBuilder().setCustomId('showLeaderboardBtn').setLabel('Leaderboards').setStyle(ButtonStyle.Secondary);
    const actRow_Options = new ActionRowBuilder().addComponents(btn_NextQuote, btn_ShowUserStats, btn_ShowLeaderBoard);

    //Funny action row
    const btn_FunnyRank1 = new ButtonBuilder().setCustomId(`FRank 0:${currentQuote}`).setLabel('0').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank2 = new ButtonBuilder().setCustomId(`FRank 1:${currentQuote}`).setLabel('1').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank3 = new ButtonBuilder().setCustomId(`FRank 2:${currentQuote}`).setLabel('2').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank4 = new ButtonBuilder().setCustomId(`FRank 3:${currentQuote}`).setLabel('3').setStyle(ButtonStyle.Primary);
    const btn_FunnyRank5 = new ButtonBuilder().setCustomId(`FRank 4:${currentQuote}`).setLabel('4').setStyle(ButtonStyle.Primary);
    const actRow_FunnyRank = new ActionRowBuilder().addComponents(btn_FunnyRank1, btn_FunnyRank2, btn_FunnyRank3, btn_FunnyRank4, btn_FunnyRank5)

    //Cursed action row
    const btn_CursedRank1 = new ButtonBuilder().setCustomId(`CRank 0:${currentQuote}`).setLabel('0').setStyle(ButtonStyle.Danger);
    const btn_CursedRank2 = new ButtonBuilder().setCustomId(`CRank 1:${currentQuote}`).setLabel('1').setStyle(ButtonStyle.Danger);
    const btn_CursedRank3 = new ButtonBuilder().setCustomId(`CRank 2:${currentQuote}`).setLabel('2').setStyle(ButtonStyle.Danger);
    const btn_CursedRank4 = new ButtonBuilder().setCustomId(`CRank 3:${currentQuote}`).setLabel('3').setStyle(ButtonStyle.Danger);
    const btn_CursedRank5 = new ButtonBuilder().setCustomId(`CRank 4:${currentQuote}`).setLabel('4').setStyle(ButtonStyle.Danger);
    const actRow_CursedRank = new ActionRowBuilder().addComponents(btn_CursedRank1, btn_CursedRank2, btn_CursedRank3, btn_CursedRank4, btn_CursedRank5)

    interaction.deferReply({content: `Sending new quote in DM`})
    //Quote and options
    await interaction.user.send({
        content: `**Voting on quote:** "${quoteJson.quotes[currentQuote].quote}"`,
        components: [actRow_Options],
    });
    //Funny rank action row
    await interaction.user.send({
        content: `**Funny Rank**`,
        components: [actRow_FunnyRank]
    });
    //Cursed rank action row
    await interaction.user.send({
        content: `**Cursed Rank**`,
        components: [actRow_CursedRank]
    });
    interaction.deleteReply()
}

async function castVote(interaction, funnyRank, cursedRank, quoteKey)
{
    let quoteJson = require(path.join(dataPath, 'Quotes.json'));

    //Potential optimization, don't write to json every vote (time based backup?)
    if(funnyRank !== cursedRank) //If they're equal then 0 was pressed, delete the message without adjusting scores
    {
        const quote = quoteJson.quotes[quoteKey];

        interaction.reply(`Thank you for voting on "${quote.quote}"
        **Said by:** ${quote.mentionedUser} 
        **Quoted by:** ${quote.sentBy} 
        ${(funnyRank > cursedRank) ? 'funny' : 'cursed'} rank is now ${(funnyRank > cursedRank) ? quote.funnyRank : quote.cursedRank}`);

        //Checks if the quote is already on the list, if not push it
        //Grabs the length of the larger of the two leaderboards
        let length = ((quoteJson.cursedLeader.length > quoteJson.funnyLeader.length) ? quoteJson.cursedLeader.length : quoteJson.funnyLeader.length);
        let cursedFound = false;
        let funnyFound = false;

        //Iterates through the leaderboards to check for duplicates
        for(let i = 0; i < length; i++)
        {
            if(i < quoteJson.cursedLeader.length)
            {
                if(quoteJson.cursedLeader[i].quote === quote.quote)
                    cursedFound = true;
            }
            if(i < quoteJson.funnyLeader.length)
            {
                if(quoteJson.funnyLeader[i].quote === quote.quote)
                    funnyFound = true;
            }
        }

        //Adds to the end of the leaderboard if not found already within
        if(!cursedFound)
            quoteJson.cursedLeader.push(quote)
        if(!funnyFound)
            quoteJson.funnyLeader.push(quote)

        quote.funnyRank += funnyRank;
        quote.cursedRank += cursedRank;

        //Sorts the leader boards by respective rank
        quoteJson.funnyLeader.sort((a, b) => b.funnyRank - a.funnyRank);
        quoteJson.cursedLeader.sort((a, b) => b.cursedRank - a.cursedRank);

        //Checks to see if the object is at it's max length, if it is remove the bottom quote
        if(quoteJson.funnyLeader.length > 100)
            quoteJson.funnyLeader.pop();
        if(quoteJson.cursedLeader.length > 100)
            quoteJson.cursedLeader.pop();


        await writeToJsonFile('Quotes.json', quoteJson);

        //Updates the user stats with the new ranks (based on quote.mentionedUser)
        let userJson = require(path.join(dataPath, 'UserStats.json'));
        let userStats = await initUserStats(quote.mentionedUser)

        userStats.funnyRank += funnyRank;
        userStats.cursedRank += cursedRank;

        userJson.users[quote.mentionedUser] = userStats;
        //Updates UserStats.json with the update
        await writeToJsonFile("UserStats.json", userJson);
    }

    //Loads the channel into the cache, prevents crash on user interacting with buttons after re launch of the bot
    await interaction.client.channels.fetch(interaction.message.channelId)
    await interaction.message.delete(); //This will delete the original action row, preventing multi voting
}

async function writeToJsonFile(jsonFile, jsonToWrite)
{
    fs.writeFile(path.join(dataPath, jsonFile), JSON.stringify(jsonToWrite, null, '\t'), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Successfully written ${jsonFile}`);
    });
}

//Quick shuffle function using Fisher-Yates algorithm, got from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
async function shuffle(array)
{
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

async function markQuoteError(interaction, quote)
{
    //TODO: Stub, add functionality

    //TODO: BUTTONS TO ADD: Confirm / cancel
}

async function showUserLeaderboards(interaction, statToShow)
{
    /* STEPS
    * 1: Gather user stats
    * 2: set sort parameters
    * 3: Sort user stats
    * 4: Display
    */
    interaction.deferReply({content: `Gathering leaderboard...`});

    //Acquire the data and sort it accordingly
    let userStats = require(path.join(dataPath, 'UserStats.json'));
    let leaderboard = Object.values(userStats.users);
    switch(statToShow)
    {
        case 'funnyRank':
            leaderboard.sort((a, b) => b.funnyRank - a.funnyRank);
            break;
        case 'cursedRank':
            leaderboard.sort((a, b) => b.cursedRank - a.cursedRank);
            break;
        case 'sentByCount':
            leaderboard.sort((a, b) => b.sentByCount - a.sentByCount);
            break;
        case 'quotedCount':
            leaderboard.sort((a, b) => b.quotedCount - a.quotedCount);
            break;
    }

    //Display the message to the user
    let messages = [""]
    for(let i = 0; i < leaderboard.length; i++)
    {
        let message = `\n${i + 1}: ${leaderboard[i].userName}
         ${statToShow} score: ${leaderboard[i][statToShow]}`;

        //Checks the length of the last message sent, if it's over the maximum add to a new entry instead
        if(messages[messages.length - 1].length + message.length >= 2000)
        {
            messages.push(message);
        }
        else
        {
            messages[messages.length - 1] += message;
        }
    }

    //Send the message
    const btn_HideMessage = new ButtonBuilder().setCustomId(`closeMenuBtn`).setLabel('Hide').setStyle(ButtonStyle.Danger);
    const actRow_LeaderBoard = new ActionRowBuilder().addComponents(btn_HideMessage)
    await interaction.client.channels.fetch(interaction.message.channelId)

    for(let i = 0; i < messages.length; i++)
    {
        await interaction.user.send({
            content: `${messages[i]}`,
            components: [actRow_LeaderBoard]
        })
    }
    await closeMenu(interaction); //Closes the previous menu
    interaction.deleteReply(); //Removes the thinking message
}

//Controls the leaderboard menu
async function showLeaderboardMenu(interaction, selection)
{
    let reply = "";
    let actRowButtons = []

    switch (selection){
        case "Main":
            reply = "Select what leaderboard to display";
            const btn_UserLeaderboards = new ButtonBuilder().setCustomId(`userLeaderboardsBtn`).setLabel('User Leaderboards').setStyle(ButtonStyle.Primary);
            const btn_QuoteLeaderboards = new ButtonBuilder().setCustomId(`quoteLeaderboardsBtn`).setLabel('Quote Leaderboards').setStyle(ButtonStyle.Primary);
            actRowButtons.push(btn_UserLeaderboards, btn_QuoteLeaderboards);
            break;
        case "Users":
            reply = "What User stat do you want the leaderboard for?"
            const btn_TimesQuoted = new ButtonBuilder().setCustomId(`showTimesQuotedLeaderboardBtn`).setLabel('Times quoted Leaderboard').setStyle(ButtonStyle.Primary);
            const btn_Recorder = new ButtonBuilder().setCustomId(`showRecorderLeaderboardBtn`).setLabel('Recorder Leaderboards').setStyle(ButtonStyle.Primary);
            const btn_UserTotalFunny = new ButtonBuilder().setCustomId(`showUserFunnyLeaderboardBtn`).setLabel('Funniest User Leaderboard').setStyle(ButtonStyle.Primary);
            const btn_UserTotalCursed = new ButtonBuilder().setCustomId(`showUserCursedLeaderboardBtn`).setLabel('Most Cursed User Leaderboard').setStyle(ButtonStyle.Primary);
            actRowButtons.push(btn_TimesQuoted, btn_Recorder, btn_UserTotalFunny, btn_UserTotalCursed);
            break;
        case "Quotes":
            reply = "What Quote leaderboard do you want to see?"
            const btn_FunnyLeaderboard = new ButtonBuilder().setCustomId(`showFunnyLeaderboardMenuBtn`).setLabel('Funniest Quotes').setStyle(ButtonStyle.Primary);
            const btn_CursedLeaderboard = new ButtonBuilder().setCustomId(`showCursedLeaderboardMenuBtn`).setLabel('Cursed Quotes').setStyle(ButtonStyle.Primary);
            actRowButtons.push(btn_FunnyLeaderboard, btn_CursedLeaderboard);
            break;
        case "CursedNumber":
            reply = "How many of the top 100 would you like to see?"
            const btn_Cursed5 = new ButtonBuilder().setCustomId(`showCursedLeaderboardBtn 5`).setLabel('5').setStyle(ButtonStyle.Primary);
            const btn_Cursed10 = new ButtonBuilder().setCustomId(`showCursedLeaderboardBtn 10`).setLabel('10').setStyle(ButtonStyle.Primary);
            const btn_Cursed50 = new ButtonBuilder().setCustomId(`showCursedLeaderboardBtn 50`).setLabel('50').setStyle(ButtonStyle.Primary);
            const btn_Cursed100 = new ButtonBuilder().setCustomId(`showCursedLeaderboardBtn 100`).setLabel('100').setStyle(ButtonStyle.Primary);
            actRowButtons.push(btn_Cursed5, btn_Cursed10, btn_Cursed50, btn_Cursed100);
            break;
        case "FunnyNumber":
            reply = "How many of the top 100 would you like to see?"
            const btn_Funny5 = new ButtonBuilder().setCustomId(`showFunnyLeaderboardBtn 5`).setLabel('5').setStyle(ButtonStyle.Primary);
            const btn_Funny10 = new ButtonBuilder().setCustomId(`showFunnyLeaderboardBtn 10`).setLabel('10').setStyle(ButtonStyle.Primary);
            const btn_Funny50 = new ButtonBuilder().setCustomId(`showFunnyLeaderboardBtn 50`).setLabel('50').setStyle(ButtonStyle.Primary);
            const btn_Funny100 = new ButtonBuilder().setCustomId(`showFunnyLeaderboardBtn 100`).setLabel('100').setStyle(ButtonStyle.Primary);
            actRowButtons.push(btn_Funny5, btn_Funny10, btn_Funny50, btn_Funny100);
            break;
        default:
            reply = "An error has occurred"
    }

    //All menus will have the close button
    const btn_HideMessage = new ButtonBuilder().setCustomId(`closeMenuBtn`).setLabel('Hide Menu').setStyle(ButtonStyle.Danger);
    actRowButtons.push(btn_HideMessage);

    const actRow_LeaderBoardMenu = new ActionRowBuilder().addComponents(actRowButtons)

    //Quote and options
    await interaction.reply({
        content: reply,
        components: [actRow_LeaderBoardMenu],
    });

    //Closes the previous menu as long as it doesn't close the vote menu
    if(selection !== "Main")
        await closeMenu(interaction);
}

async function closeMenu(interaction)
{
    await interaction.client.channels.fetch(interaction.message.channelId); //Loads the channel into the cache, prevents crash on user interacting with buttons after re launch of the bot
    await interaction.message.delete(); //This will delete the original action row, preventing multi voting
}

async function displayTopQuoteLeaderboard(interaction, leaderboardToUse, numberToShow)
{
    let quoteJson = require(path.join(dataPath, 'Quotes.json'));
    let messages = [``];
    let leaderboard = [];

    interaction.deferReply({content: `Gathering leaderboard...`});

    if(leaderboardToUse === 'funny')
        leaderboard = quoteJson.funnyLeader;
    else if(leaderboardToUse === 'cursed')
        leaderboard = quoteJson.cursedLeader;

    if(numberToShow > leaderboard.length)
        numberToShow = leaderboard.length;

    for(let i = 0; i < numberToShow; i++)
    {
        let quoteStatDisplay = `\n\n**${i + 1})** "${leaderboard[i].quote}"
         *said by:* ${leaderboard[i].mentionedUser} 
         *quoted by:* ${leaderboard[i].sentBy} 
         *funny rank:* ${leaderboard[i].funnyRank} 
         *cursed rank* ${leaderboard[i].cursedRank}`;

        //Checks the length of the last message sent, if it's over the maximum add to a new entry instead
        if(messages[messages.length - 1].length + quoteStatDisplay.length >= 2000)
        {
            messages.push(quoteStatDisplay);
        }
        else
        {
            messages[messages.length - 1] += quoteStatDisplay;
        }
    }

    const btn_HideMessage = new ButtonBuilder().setCustomId(`closeMenuBtn`).setLabel('Hide').setStyle(ButtonStyle.Danger);
    const actRow_LeaderBoard = new ActionRowBuilder().addComponents(btn_HideMessage)
    await interaction.client.channels.fetch(interaction.message.channelId)

    //Send all the messages
    for(let i = 0; i < messages.length; i++)
    {
        await interaction.user.send({
            content: `${messages[i]}`,
            components: [actRow_LeaderBoard]
        })
    }
    await closeMenu(interaction); //Closes the previous menu
    interaction.deleteReply(); //Removes the thinking message
}

//Ensures user has been initialized before use, returns the js object
async function initUserStats(user)
{
    let userJson = require(path.join(dataPath, 'UserStats.json'));
    let userStats = {};

    //Inits user json if undefined
    if(typeof userJson.users === 'undefined') //inits users if needed
    {
        userJson.users = {};
    }

    //Inits specific user if they're undefined
    if(typeof userJson.users[user] === 'undefined') //inits userStats if needed, otherwise grab stats from JSON
    {
        userStats =  {
            userName: user,
            sentByCount: 0,
            quotedCount: 0,
            funnyRank: 0,
            cursedRank: 0,
            quoteOrder: [],
            lastQuote: 0
        }
    }
    else
    {
        userStats = userJson.users[user];
    }

    return userStats;
}

async function showUserStats(interaction)
{
    let userStatJson = require(path.join(dataPath, 'UserStats.json'));
    let stats = userStatJson.users[interaction.user.globalName];

    let message = `\nStats for user ${stats.userName}
    Times ${stats.userName} has been quoted: ${stats.quotedCount}
    Times ${stats.userName} has quoted others: ${stats.sentByCount}
    ${stats.userName} funny rank: ${stats.funnyRank}
    ${stats.userName} cursed rank: ${stats.cursedRank}
    ${stats.userName} has voted on ${stats.lastQuote + 1} quotes!`;

    //Sets up the reply
    const btn_HideMessage = new ButtonBuilder().setCustomId(`closeMenuBtn`).setLabel('Hide').setStyle(ButtonStyle.Danger);
    const actRow_Stats = new ActionRowBuilder().addComponents(btn_HideMessage)
    await interaction.client.channels.fetch(interaction.message.channelId)

    await interaction.reply({
        content: `${message}`,
        components: [actRow_Stats]
    })

}