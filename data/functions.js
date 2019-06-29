var getSelectMessage = require('./messages/playerselect');
var getGameMessage = require('./messages/gameMessage');
var drawBoardCoordinates = require('./messages/DMcanvas');
var getGameCanvas = require('./messages/gameCanvas');

function appendRoles(guild, gameGuild) {
    return new Promise(resolve => {
        if (!guild.available) return;
        //check if the role 'bsPlayer1' or 'bsPlayer2' already exists in the guild
        var roleP1 = guild.roles.find(role => role.name === 'bsPlayer1');
        var roleP2 = guild.roles.find(role => role.name === 'bsPlayer2');

        //if the role doesn't exists yet it is being created and appended to the player
        var roles = [];
        if (!roleP1 || !roleP2) {
            guild.createRole({name: 'bsPlayer1', color: 'BLUE'}).then(role => {gameGuild.player1.addRole(role.id); roles.push(role)});
            guild.createRole({name: 'bsPlayer2', color: 'RED'}).then(role => {gameGuild.player2.addRole(role.id); roles.push(role); resolve(roles)});
        } else {
            gameGuild.player1.addRole(roleP1.id);
            gameGuild.player2.addRole(roleP2.id);
            resolve([roleP1, roleP2]);
        }
    });
}

function createTextChannels(guild, roles, gameGuild) {
    return new Promise(revoke => {
    if (!guild.available) return;

    vars.games[guild.id].channels = {};

    var ready = 0;
    function Ready() {
        ready += 1;
        if (ready > 2) {
            revoke();
        }
    };

    function createChannel(guild, name = "Game", parentId) {
        guild.createChannel(name, 'text')
        .then(channel => {
            channel.setParent(parentId)
                .then(channel => {
                    channel.overwritePermissions(guild.roles.find(role => role.name === '@everyone'), {
                        'VIEW_CHANNEL': false,
                    });
                    channel.overwritePermissions(roles[0], {
                    'VIEW_CHANNEL': true,
                    });
                    channel.overwritePermissions(roles[1], {
                    'VIEW_CHANNEL': true,
                    });
                    vars.games[guild.id].channels.game = channel;
                    vars.globalChannels[channel.id] = [gameGuild.player1, gameGuild.player2];
                    Ready();
                })
        });
    }

    var chBattleShips = guild.channels.find(ch => {ch.name === "BattleShips" && ch.category === 'category'});

    if (chBattleShips) {
        createChannel(guild, 'Game', chBattleShips.id);
    } else {
        try {
            guild.createChannel("BattleShips", 'category')
            .then(category => {
                    createChannel(guild, 'Game', category.id);
            });
        }catch (error) {
            console.log(error);
        }
    }
    
    gameGuild.player1.createDM().then(ch => {gameGuild.channels.player1 = ch; Ready()});
    gameGuild.player2.createDM().then(ch => {gameGuild.channels.player2 = ch; Ready()});

    })
}

async function sendSelectMessagePlayer(gameGuild, player, attachment, canvas) {
    if (!player) {
        let player1C = {attachment, canvas} = await drawBoardCoordinates();

        gameGuild.player1.canvas = player1C.canvas;
        let message = getSelectMessage('blue', gameGuild.player1.placed, player1C.attachment);
        gameGuild.channels.player1.send(message);

        let player2C = {attachment, canvas} = await drawBoardCoordinates();

        gameGuild.player2.canvas = player2C.canvas;
        message = getSelectMessage('red', gameGuild.player2.placed, player2C.attachment);
        gameGuild.channels.player2.send(message);
    } else {
        var color = gameGuild.player1.user.id === player.user.id ? 'blue' : 'red';
        let message = getSelectMessage(color, player.placed, attachment);
        player.send(message);
    }
}

function createPlayerField(gameGuild) {
    //creating placement ships
    gameGuild.player1.field = [];
    gameGuild.player1.placed = 0;
    gameGuild.player1.fired = 0;
    for (let i = 0; i < 10; i++) {
        gameGuild.player1.field[i]=[];
    }

    gameGuild.player2.field = [];
    gameGuild.player2.placed = 0;
    gameGuild.player2.fired = 0;
    for (let i = 0; i < 10; i++) {
        gameGuild.player2.field[i]=[];
    }
}

function getCoordinate(coordinates) {
    //for example coordinates = 'A1'
    let y = vars.coordinatesY.indexOf(coordinates.slice(0, 1).toUpperCase())-1;
    let x = parseInt(coordinates.slice(1,coordinates.length))-1;

    if (x < 0 || x > 9 || y > 9 || y < 0) return false;

    //get X and Y through var {x, y} = getCoordinates(coordinates);
    return {x: x, y: y};
}

function getCoordinates(coordinates) {
    //for example coordinates = 'A1 A2 A3'
    let coordinatesArray = coordinates.split(' ');
    let responseArray = [];
    let errorCoordinate = false;
    coordinatesArray.forEach(coordinate => {
        if (!errorCoordinate) {
            let {x, y} = getCoordinate(coordinate);
            if (isNaN(x) || isNaN(y) || x === undefined || y === undefined) {
                errorCoordinate = true;
            };
            responseArray.push({x: x, y: y});
        }
    })
    return errorCoordinate ? false : responseArray;
}

function checkPlayerFinished(player) {
    var count = 0;
    player.field.forEach((item, index) => {
        for (let i = 0; i < 10; i++) {
            if (player.field[index][i] !== undefined)
                if (player.field[index][i].hit === true && player.field[index][i].type === 'ship')
                    count++;
        }
    });

    if (count >= 17) {
        return true;
    } else {
        return false;
    }
} 

module.exports = {
    appendRoles,
    createTextChannels,
    sendSelectMessagePlayer,
    createPlayerField,
    getCoordinate,
    getCoordinates,
    drawBoardCoordinates,
    getGameCanvas,
    getGameMessage,
    checkPlayerFinished,
}

const vars = require('./variables');