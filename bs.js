//https://discordapp.com/oauth2/authorize?client_id=592695530258169869&scope=bot

const vars = require('./data/variables');
const Discord = vars.Discord;
const config = vars.config;
const prefix = vars.prefix;
const client = vars.client;
require('./data/onPlayerDM');
require('./data/onGameMessage');

client.commands = new Discord.Collection();
const commandFiles = vars.fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    vars.client.guilds.forEach((guild) => {
        vars.games[guild.id] = {};
        vars.games[guild.id].id = guild.id;
        vars.games[guild.id].gameState = false;
        vars.games[guild.id].playersReady = [];
        vars.games[guild.id].deletables = [];
    });
    console.log('Ready!');
    vars.client.user.setActivity(`with some boats in ${Object.keys(vars.games).length} servers`);
});

client.on("guildCreate", guild => {
    vars.games[guild.id] = {};
    vars.games[guild.id].id = guild.id;
    vars.games[guild.id].gameState = false;
    vars.games[guild.id].playersReady = [];
    vars.games[guild.id].deletables = [];
    vars.client.user.setActivity(`with some boats in ${Object.keys(vars.games).length} servers`);
});

client.on("guildDelete", guild => {
    delete vars.games[guild.id];
    vars.client.user.setActivity(`with some boats in ${Object.keys(vars.games).length} servers`);
});

client.on('message', message => {

    if (Object.keys(vars.globalPlayers).includes(message.author.id) && message.channel.type === 'dm') {
        return vars.playerDMEmmiter.emit('message', message);
    };

    if (Object.keys(vars.globalChannels).includes(message.channel.id)) {
        let players = vars.globalChannels[message.channel.id];
        if (!message.author.bot) {
            let noPermission = 2;
            let noTurn = 1;
            
            players.forEach(player => {
                if (player.user.id !== message.author.id)
                    noPermission--;
                if (player.user.id === message.author.id && player.turn === false)
                    noTurn--;
            });

            if (!(noPermission)) {
                return (message.author.send("Please do not obstruct the gameplay"), message.delete().then().catch(err => {}));
            }

            if (!(noTurn))
                return message.delete().then().catch(err => {});;

            if (noTurn) {
                return vars.playerDMEmmiter.emit('gameMessage', message, players);
            }
        }
    }
    
    var taggedUser = message.mentions.users.last();
    if (!message.content.startsWith(prefix) || message.author.bot) {
        if (taggedUser === undefined || taggedUser.id !== vars.botId)
            return;
    }

    var args;
    var commandName;

    if (taggedUser === undefined)
        args = message.content.slice(prefix.length).split(/ + /);
    else if (taggedUser.id === vars.botId) {
        args = message.content.slice(message.content.indexOf(">") + 1).split(/ +/);
        args.shift();
    } else
        console.log('error');
    if (args.length === 0)
        return message.channel.send('I couldn\'t find your command, please try again');
    commandName = args.shift().toLowerCase().trim();

    console.log(message.content);

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command || message.author.bot) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    try {
        command.execute(message, args);
        if (command.deleteMessage)
            message.delete();
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(config.token);
