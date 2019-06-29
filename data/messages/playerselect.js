const vars = require('../variables');
const functions = require('../functions');

module.exports = function getSelectMessage(color, placed, attachment) {
    var embedColor;
    //13632027 = red, 4886754 = blue
    color.toLowerCase() === 'blue' ? embedColor = 4886754 : embedColor = 13632027;

    var ship = vars.ships[placed];

    var description = `Here you have to layout your ships, we'll go through all 5 ships one by one.
    To select your coordinates please write all the coordinates the ship should cover.
    For example if you need to place a 3 long ship you type: \`A1 A2 A3\`.
    Under this message you'll see what ship we are going to place.
     `

    let embed = new vars.Discord.RichEmbed()
        .setDescription(description)
        .setColor(embedColor)
        .addField(`name: ${ship.name}`, `this ship needs ${ship.size} coordinates`)
        .attachFile(attachment)
        .setImage('attachment://bsBoard.png')

    return embed; 
}