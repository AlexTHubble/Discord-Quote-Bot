const { Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const path = require("node:path");
const dataPath = path.join(__dirname, '..', 'Data',);
const fs = require('node:fs');

const QuoteVoting = require("../QuoteVoting.js")

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
                await QuoteVoting.castVote(interaction, funnyRank, 0, quote)
                console.log(`Quote: ${quote} ranked at funny ${funnyRank}`);
            }
            else if(btnID.includes('showCursedLeaderboardBtn'))
            {
                const amountToShow = parseInt(btnID.slice(25));
                await QuoteVoting.displayTopQuoteLeaderboard(interaction, 'cursed', amountToShow);
            }
            else if(btnID.includes('showFunnyLeaderboardBtn'))
            {
                const amountToShow = parseInt(btnID.slice(24));
                await QuoteVoting.displayTopQuoteLeaderboard(interaction, 'funny', amountToShow);
            }
            else if(btnID.includes('CRank'))
            {
                const cursedRank = parseInt(btnID[6])
                const quote = btnID.slice(8)
                await QuoteVoting.castVote(interaction, 0, cursedRank, quote)
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
                        await QuoteVoting.sendQuoteVote(interaction);
                        break;
                    case "cancelVotingStartupBtn":
                        interaction.reply({content: `Aborting process`, flags: MessageFlags.Ephemeral })
                        break;
                    case "nextQuoteBtn":
                        await QuoteVoting.sendQuoteVote(interaction);
                        break;
                    case "showUserStatsBtn":
                        await QuoteVoting.showUserStats(interaction);
                        break;
                    case "showLeaderboardBtn":
                        await QuoteVoting.showLeaderboardMenu(interaction, "Main");
                        break;
                    case"userLeaderboardsBtn":
                        await QuoteVoting.showLeaderboardMenu(interaction, "Users");
                        break;
                    case "quoteLeaderboardsBtn":
                        await QuoteVoting.showLeaderboardMenu(interaction, "Quotes");
                        break;
                    case"showFunnyLeaderboardMenuBtn":
                        await QuoteVoting.showLeaderboardMenu(interaction, "FunnyNumber");
                        break;
                    case"showCursedLeaderboardMenuBtn":
                        await QuoteVoting.showLeaderboardMenu(interaction, "CursedNumber");
                        break;
                    case "closeMenuBtn":
                        await QuoteVoting.closeMenu(interaction);
                        break;
                    case "showTimesQuotedLeaderboardBtn":
                        await QuoteVoting.showUserLeaderboards(interaction, "quotedCount");
                        break;
                    case "showRecorderLeaderboardBtn":
                        await QuoteVoting.showUserLeaderboards(interaction, "sentByCount");
                        break;
                    case "showUserFunnyLeaderboardBtn":
                        await QuoteVoting.showUserLeaderboards(interaction, "funnyRank");
                        break;
                    case "showUserCursedLeaderboardBtn":
                        await QuoteVoting.showUserLeaderboards(interaction, "cursedRank");
                        break;
                }
            }
        }
	},
};
