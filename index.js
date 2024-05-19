const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const wordlistMgr = require("./wordlist_mgr");
const config = require("./config.json");
const path = require("path");
const fs = require("fs");

// probably bad
global.wordlists = wordlistMgr.wordlists;

var client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (var file of commandFiles)
{
    var filePath = path.join(commandsPath, file);
    var command = require(filePath);

    if ("data" in command && "execute" in command)
    {
        client.commands.set(command.data.name, command);
    }
    else
    {
        throw new Error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

console.log("Loaded commands");

client.once(Events.ClientReady, readyClient =>
{
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction =>
{
    if (!interaction.isChatInputCommand()) return;

    var command = client.commands.get(interaction.commandName);

    if (!command)
    {
        console.error(`No such command ${interaction.commandName}`);
        return;
    }

    try
    {
        await command.execute(interaction);
    }
    catch (err)
    {
        console.error(err);

        if (interaction.replied || interaction.deferred)
        {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        }
        else
        {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    }
});

client.login(config.token);