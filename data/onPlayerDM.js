const vars = require('./variables');
const functions = require('./functions');

vars.playerDMEmmiter.on('message', (message) => {
    var guildId = vars.globalPlayers[message.author.id];
    var gameGuild = vars.games[guildId];
    let player = gameGuild.player1.user.id === message.author.id ? gameGuild.player1 : gameGuild.player2;
    if (gameGuild.gameState === 'setting up' && player.placed < 5) {
        playerSelection(gameGuild, message);
    } else {
        return message.reply("I'm sorry but the game you're in has already started");   
    }
});

async function playerSelection(gameGuild, message) {
    var player = gameGuild.player1.user.id === message.author.id ? gameGuild.player1 : gameGuild.player2;
    var coordinates = functions.getCoordinates(message.content);
    var ship = vars.ships[player.placed];

    if (!coordinates) 
        return message.reply(`Please fill in the coordinates as shown above`);

    if (coordinates.length < message.content.split(' ').length)
        return message.reply(`The coordinates \`${message.content}\`are invalid. Please follow the instructions on how to select the right coordinates`);

    if (coordinates.length !== ship.size)
        return message.reply(`The amount of coordinates you provided is incorect. There should be \`${ship.size}\` coordinates provided`)
    
    var errorTaken = false;
    coordinates.forEach(coordinate => {
        if (player.field[coordinate.x][coordinate.y] && errorTaken === false) {
            errorTaken = `${vars.coordinatesY[coordinate.y + 1]}${coordinate.x + 1}`;
        }
    })
    if (errorTaken)
        return message.reply(`There is already a ship part on \`${errorTaken}\``);

    //get dirrection
    var direction;
    coordinate1 = coordinates[0];
    coordinate2 = coordinates[1];
    if (coordinate1.x === coordinate2.x && coordinate1.y === coordinate2.y)
        return message.reply(`Your first and second coordinate are the same`);
    if (coordinate1.x < coordinate2.x) direction = 'right'
    if (coordinate1.x > coordinate2.x) direction = 'left'
    if (coordinate1.y < coordinate2.y) direction = 'down'
    if (coordinate1.y > coordinate2.y) direction = 'up'

    var errorPlacement = false;
    coordinates.forEach((coordinate, i) => {
        if (i === 0) return;
        switch (direction) {
            case 'up':
                if (coordinates[i - 1].y !== coordinate.y + 1) errorPlacement = true;
                break;
            case 'down':
                if (coordinates[i - 1].y !== coordinate.y - 1) errorPlacement = true;
                break;
            case 'left':
                if (coordinates[i - 1].x !== coordinate.x + 1) errorPlacement = true;
                break;
            case 'right':
                if (coordinates[i - 1].x !== coordinate.x - 1) errorPlacement = true;
                break;
        }
    })

    if (errorPlacement)
        return message.reply(`The coordinates you provided arent in the correct order`);
    
    coordinates.forEach(coordinate => {
        player.field[coordinate.x][coordinate.y] = {type: 'ship', hit: false};
    });

    if (player.placed < 4) {
        player.placed++;
        let {attachment} = await functions.drawBoardCoordinates(coordinates, player.canvas);
        functions.sendSelectMessagePlayer(gameGuild, player, attachment);
    } else {
        player.placed++;
        let {attachment} = await functions.drawBoardCoordinates(coordinates, player.canvas);    
        message.reply("You have successfully chosen your ships. Go to the `game` channel in your selected server\n" + 
        "If it's not your turn you won't be able to type in the channel \n final board:", attachment)
        vars.playerDMEmmiter.emit('playerSubmit', gameGuild, player)
    }
}