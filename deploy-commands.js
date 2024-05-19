const { REST, Routes } = require("discord.js");
const config = require("./config.json");
const path = require("path");
const fs = require("fs");

var commands = [];
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (var file of commandFiles)
{
    var filePath = path.join(commandsPath, file);
    var command = require(filePath);

    if ("data" in command && "execute" in command)
    {
        commands.push(command.data.toJSON());
    }
    else
    {
        throw new Error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

var rest = new REST().setToken(config.token);

(async () =>
{
    console.log(`Reloading ${commands.length} slash commands...`);

    await rest.put(
        // Routes.applicationCommands(config.clientId),
        Routes.applicationGuildCommands(config.clientId, config.testGuildId),
        { body: commands }
    );

    console.log("Done!");
})();