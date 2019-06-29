module.exports = {
    name: 'stop',
    deleteMessage: false,
    aliases: ['cancel'],
    description: 'stops the game',
    args: false,
    async execute(message, args) {
        if (message.channel.type === 'dm') return message.reply("Sorry, you can't do that in DM");
        var gameGuild = vars.games[message.guild.id];

        if (gameGuild.gameState) {
            let id = gameGuild.id;
            if (gameGuild.player2) {
                gameGuild.player1.removeRole(gameGuild.player1.roles.find(role => role.name === 'bsPlayer1'));
                gameGuild.player2.removeRole(gameGuild.player2.roles.find(role => role.name === 'bsPlayer2'));
                delete vars.globalPlayers[gameGuild.player2.user.id];
                delete vars.globalChannels[gameGuild.channels.game.id];
                gameGuild.channels.game.delete();
            }
                    
            delete vars.globalPlayers[gameGuild.player1.user.id];
            gameGuild = {};
            gameGuild.gameState = false;
            gameGuild.id = id;
            gameGuild.playersReady = [];
            gameGuild.deletables = [];
            vars.games[id] = gameGuild;
            return message.reply("Game successfully stopped");
        } else {
            return message.reply("There is no game to stop...?");
        }
    },
};
const vars = require('../data/variables');
const functions = require('../data/functions');