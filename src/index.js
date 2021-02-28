const { Client, Collection } = require("discord.js");
const config = require("./config.json");
const path = require('path');
const glob = require('glob');

const client = new Client();

// Create two Collections where we can store our commands and aliases in.
// Store these collections on the client object so we can access them inside commands etc.
client.commands = new Collection();
client.aliases = new Collection();

// Function that will load all commands from the given directory.
function loadCommands(cmdDir) {
    // Create an empty array that will store all the file paths for the commands,
    // and push all files to the array.
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, cmdDir)}/**/*.js`));

    // Iterate through each element of the items array and add the commands / aliases
    // to their respective Collection.
    for (const item of items) {
        // Remove any cached commands
        if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

        // Store the command and aliases (if it has any) in their Collection.
        const command = require(item);
        client.commands.set(command.name, command);
        if (command.aliases) {
            for (const alias of command.aliases) {
                client.aliases.set(alias, command.name);
            }
        }
    }
    console.log('Commands were loaded...');
}

// Run function and pass the relative path to the 'commands' folder.
loadCommands('commands');

client.on("message", function(message) {
    // Check the message author isn't a bot.
    if (message.author.bot) return;

    // Check if the message wasn't a @all message
    if (message.content.includes("@here") || message.content.includes("@everyone")) return false;

    // Make sure the channel the command is called in is a text channel.
    if (message.channel.type !== 'text') return;

    // Check if the bot was mentioned
    if (message.mentions.has(client.user.id)) {
        const commandBody = message.content;
        const args = commandBody.split(' ');

        if (typeof args[1] == 'undefined') {
            message.reply("Hello there!");
            return;
        } else {
            const cmd = args[1];

            try {
                // Check if the command called exists in either the commands Collection
                // or the aliases Collection.
                let command;
                if (client.commands.has(cmd)) {
                    command = client.commands.get(cmd);
                } else if (client.aliases.has(cmd)) {
                    command = client.commands.get(client.aliases.get(cmd));
                }

                // Make sure command is defined.
                if (!command) return;

                // If the command exists then run the execute function inside the command file.
                command.execute(client, message, args);

                // Print the command that was executed.
                console.log(`Ran command: ${command.name}`);
            } catch (error) {
                console.error(error);
            }
        }
    };
});

// Client ready event
client.on('ready', () => {
    console.log('Bot is ready...');
});

client.login(config.BOT_TOKEN);