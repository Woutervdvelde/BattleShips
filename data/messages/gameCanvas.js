const functions = require('../functions');
const vars = require('../variables');

module.exports = async function getCanvas(x, y, result, canvas = false) {
    return new Promise(async function(resolve) {
        const Canvas = canvas ? canvas : vars.Canvas.createCanvas(1100, 1100);
        const ctx = Canvas.getContext('2d');
        if (!canvas) {
            const board = await vars.Canvas.loadImage('./data/images/backgroundGrid.png');
            ctx.drawImage(board, 0, 0, 1100, 1100);
        }

        if (result) {
            if (result.type === 'ship') {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(x * 100 + 133, y * 100 + 133, 50, 50);
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(x * 100 + 133, y * 100 + 133, 50, 50);
            }
        };

        let attachment = new vars.Discord.Attachment(Canvas.toBuffer(), 'gameBoard.png');
        resolve({attachment: attachment, canvas: Canvas});
    })
};