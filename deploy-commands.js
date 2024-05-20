const { REST, Routes } = require("discord.js");
const config = require("./config.json");
const path = require("path");
const fs = require("fs");

if (process.argv.length !== 3 || (process.argv[2] !== "test" && process.argv[2] !== "global"))
{
    console.log("Usage:\nnode deploy-commands.js test   - deploy commands to test guild\nnode deploy-commands.js global - deploy commands globally")
    process.exit(0);
}

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
var cmds;

if (process.argv[2] === "test")
{
    cmds = Routes.applicationGuildCommands(config.clientId, config.testGuildId);
}
else
{
    cmds = Routes.applicationCommands(config.clientId);
}

(async () =>
{
    console.log(`Reloading ${commands.length} slash commands...`);

    await rest.put(
        cmds,
        { body: commands }
    );

    console.log("Done!");
})();