const vars = require('../variables');
const functions = require('../functions');

module.exports = function getGameMessage(color, playerId, attachment) {
    var embedColor;
    //13632027 = red, 4886754 = blue
    color.toLowerCase() === 'blue' ? embedColor = 4886754 : embedColor = 13632027;

    var description = 
    `Ready for war?!
    It's <@${playerId}>'s turn
    Type a coordinate you want to fire at like \`A1\`
    `

    let embed = new vars.Discord.RichEmbed()
        .setDescription(description)
        .setColor(embedColor)
        .attachFile(attachment)
        .setImage('attachment://gameBoard.png')

    return embed; 
}