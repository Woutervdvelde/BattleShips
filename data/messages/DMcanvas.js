const functions = require('../functions');
const vars = require('../variables');

module.exports = async function getCanvas(coordinates = [], canvas = false) {
    return new Promise(async function(resolve) {
        const Canvas = canvas ? canvas : vars.Canvas.createCanvas(1100, 1100);
        const ctx = Canvas.getContext('2d');
        if (!canvas) {
            const board = await vars.Canvas.loadImage('./data/images/backgroundGrid.png');
            ctx.drawImage(board, 0, 0, 1100, 1100);
        }

        coordinates.forEach(coordinate => {
            ctx.fillRect(coordinate.x * 100 + 100, coordinate.y * 100 + 100, 100, 100);
        });

        let attachment = new vars.Discord.Attachment(Canvas.toBuffer(), 'bsBoard.png');
        resolve({attachment: attachment, canvas: Canvas});
    })
};