module.exports = {
    name: 'start',
    deleteMessage: false,
    aliases: ['begin'],
    description: 'starts the game',
    args: false,
    async execute(message, args) {
        if (message.channel.type === 'dm') return message.reply("Sorry, you can't do that in DM");

        var gameGuild = vars.games[message.guild.id];

        switch (gameGuild.gameState) {
            case 'searching':
                if (gameGuild.player1 === message.member) return message.reply("You played yourself, wait you can't");

                vars.globalPlayers[message.author.id] = message.guild.id;
                gameGuild.player2 = message.member;
                gameGuild.player2.playerObject = 'player2';
                gameGuild.gameState = 'setting up';
                message.reply("Woop woop, we're now ready to start! Please check your DM");
                break;
                
            case 'setting up':
            case 'in progress':
                return message.reply("I'm sorry but there is currently a game in progress");
            
            case false:
                gameGuild.gameState = 'searching';
                vars.globalPlayers[message.author.id] = message.guild.id;
                gameGuild.player1 = message.member;
                gameGuild.player1.playerObject = 'player1';
                return message.reply("I'm still searching for a worthy aponent. Anybody wants to join this person in his quest for destruction\n Type `!bs start` to join");
        }

        const roles = await functions.appendRoles(message.guild, gameGuild);
        await functions.createTextChannels(message.guild, roles, gameGuild);
        

        functions.createPlayerField(gameGuild);
        functions.sendSelectMessagePlayer(gameGuild, false);
    },
};
const vars = require('../data/variables');
const functions = require('../data/functions');