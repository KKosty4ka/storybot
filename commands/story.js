const { SlashCommandBuilder } = require("discord.js");

function replaceFunc(str, pattern, func)
{
    while (str.includes(pattern))
    {
        str = str.replace(pattern, func());
    }

    return str;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("story")
        .setDescription("Make a story!")
        .addStringOption(option =>
            option
                .setName("text")
                .setDescription("For example: $user is very $adjective")
                .setRequired(true)
        ),

    execute: async interaction =>
    {
        var text = interaction.options.getString("text");

        text = replaceFunc(text, "$user", () =>
        {
            // BUG: only gets online users for some reason
            var user = interaction.guild.members.cache.random().user;
            user = user.globalName ?? user.username;
            return "**" + user + "**";
        });

        // TODO: process longer keywords first
        // TODO: don't go through every fucking keyword
        for (var keyword of wordlists.keys())
        {
            var wordlist = wordlists.get(keyword);

            text = replaceFunc(text, "$" + keyword, () =>
            {
                var word = wordlist[Math.floor(Math.random() * wordlist.length)];
                return "**" + word + "**";
            });
        }

        await interaction.reply(text);
    }
};