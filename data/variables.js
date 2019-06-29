const Discord = require('discord.js');
const config = require('../config.json');
const prefix = config.prefix;
const file = require('file-system');
const fs = require('fs');
const client = new Discord.Client();
const Canvas = require('canvas');

var events = require('events');
var playerDMEmmiter = new events.EventEmitter();

let botId = "592695530258169869";
let botOwnerId = "357180880709484546";

const fetch = require('node-fetch');

var games = [];
var globalPlayers = {};
var globalChannels = {};
const coordinatesY = ['dummy', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ships = [{name: 'Carrier', size: 5},{name: 'Battleship', size: 4},{name: 'Cruiser', size: 3},{name: 'Submarine', size: 3}, {name: 'Destroyer', size: 2}]

const victoryGifs = ['https://tenor.com/3gD7.gif', 'https://tenor.com/s6bL.gif', 'https://tenor.com/s7QH.gif'];

module.exports = {
    Discord,
    config,
    prefix,
    file,
    fs,
    client,

    Canvas,

    events,
    playerDMEmmiter,

    botId,
    botOwnerId,

    fetch,

    games,
    globalPlayers,
    globalChannels,
    coordinatesY,
    ships,

    victoryGifs,
}