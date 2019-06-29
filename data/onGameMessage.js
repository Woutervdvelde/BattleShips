const vars = require('./variables');
const functions = require('./functions');

vars.playerDMEmmiter.on('playerSubmit', (gameGuild, player) => {playerSubmit(gameGuild, player)});

async function playerSubmit(gameGuild, player) {
    gameGuild.playersReady.push(player.user.id);
    if (gameGuild.playersReady.length > 1) {
        player.turn = true;
        gameGuild.channels.game.send(
            `<@${gameGuild.playersReady[0]}>, <@${gameGuild.playersReady[1]}> you are both ready now`
        ).then(msg => gameGuild.deletables.push(msg));

        players = vars.globalChannels[gameGuild.channels.game.id];
        gameGuild.gameState = 'in progress';

        let responseP1 = {attachment, canvas} = await functions.getGameCanvas();
        let responseP2 = {attachment, canvas} = await functions.getGameCanvas();
        gameGuild.player1.canvas = responseP1.canvas;
        gameGuild.player1.attachment = responseP1.attachment;
        gameGuild.player2.canvas = responseP2.canvas;
        gameGuild.player2.attachment = responseP2.attachment;

        //getGameMessage(color, playerId, attachment)
        let color = player.playerObject === 'player1' ? 'blue' : 'red';
        let message = functions.getGameMessage(color, player.user.id, player.attachment);
        gameGuild.channels.game.send(message).then(msg => gameGuild.deletables.push(msg));
    }
}

vars.playerDMEmmiter.on('gameMessage', (message, players) => {gameMessage(message, players)});

async function gameMessage(message, players) {
        var gameGuild = vars.games[message.guild.id];
        var currentPlayer;
        var otherPlayer;
        players.forEach(player => {player.turn ? currentPlayer = player : otherPlayer = player});

        if (message.author.id === currentPlayer.user.id) {
            gameGuild.deletables.push(message);

            let coordinate = functions.getCoordinate(message.content);
            if (!coordinate)
                return message.reply("Please say a valid coordinate").then(msg => gameGuild.deletables.push(msg));

            let result = otherPlayer.field[coordinate.x][coordinate.y];

            if (result === undefined) {
                //if there is no ship placed 
                otherPlayer.field[coordinate.x][coordinate.y] = {type: 'water', hit: true}
                result = {type: 'water', hit: false}
            }

            var hit = false;

            if (result.type === 'ship') {
                if (!result.hit) {
                    //if ship hit
                    hit = true;
                    otherPlayer.field[coordinate.x][coordinate.y].hit = true;
                    message.reply("hit!").then(msg => gameGuild.deletables.push(msg));
                    gameGuild.player1.turn = false;
                    gameGuild.player2.turn = false;    
                } else {
                    //if ship is already hit
                    hit = true;
                    message.reply("Why would you shoot at the same place again?").then(msg => gameGuild.deletables.push(msg));
                    gameGuild.player1.turn = false;
                    gameGuild.player2.turn = false;
                    
                }
            } else {
                //miss
                message.reply("miss").then(msg => gameGuild.deletables.push(msg));
                gameGuild.player1.turn = false;
                gameGuild.player2.turn = false;
            }
            vars.globalChannels[gameGuild.channels.game.id] = [gameGuild.player1, gameGuild.player2];

            let response = {attachment, canvas} = await functions.getGameCanvas(coordinate.x, coordinate.y, result, otherPlayer.canvas);
            otherPlayer.canvas = response.canvas;
            let color = currentPlayer.playerObject === 'player1' ? 'blue' : 'red';
            let embed = functions.getGameMessage(color, currentPlayer.user.id, response.attachment);
            gameGuild.deletables.forEach(item => {item.deleted ? null : item.delete()});
            gameGuild.deletables = [];
            gameGuild.channels.game.send(embed).then(msg => gameGuild.deletables.push(msg))

            let endCheck = functions.checkPlayerFinished(otherPlayer);

            if (endCheck) {
                gameGuild.channels.game.send(`<@${currentPlayer.user.id}> IS THE WINNER!\n ${vars.victoryGifs[Math.floor(Math.random() * vars.victoryGifs.length)]}`);
                setTimeout(() => {
                    let id = gameGuild.id;
                    gameGuild.player1.removeRole(gameGuild.player1.roles.find(role => role.name === 'bsPlayer1'));
                    gameGuild.player2.removeRole(gameGuild.player2.roles.find(role => role.name === 'bsPlayer2'));

                    delete vars.globalChannels[gameGuild.channels.game.id];
                    delete vars.globalPlayers[gameGuild.player1.user.id];
                    delete vars.globalPlayers[gameGuild.player2.user.id];
                    gameGuild.channels.game.delete();
                    gameGuild = {};
                    gameGuild.gameState = false;
                    gameGuild.id = id;
                    gameGuild.playersReady = [];
                    gameGuild.deletables = [];
                    vars.games[id] = gameGuild;
                }, 10000)


            } else {
                setTimeout(async () => {
                    let response = {attachment, canvas} = await functions.getGameCanvas(null, null, null, currentPlayer.canvas);
                    currentPlayer.canvas = response.canvas;
                    let color = otherPlayer.playerObject === 'player1' ? 'blue' : 'red';
                    let embed = functions.getGameMessage(color, otherPlayer.user.id, response.attachment);
                    gameGuild.deletables.forEach(item => {item.deleted ? null : item.delete()});
                    gameGuild.deletables = [];
                    gameGuild.channels.game.send(embed).then(msg => gameGuild.deletables.push(msg));
                    otherPlayer.turn = true;
                    otherPlayer.playerObject === 'player1' ? gameGuild.player1.turn = true : gameGuild.player2.turn = true;
                }, 5000);
            }
    }
}