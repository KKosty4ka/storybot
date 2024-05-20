const { SlashCommandBuilder } = require("discord.js");

var specialCases = {
    user: async interaction =>
    {
        // BUG: only gets online users for some reason
        var user = interaction.guild.members.cache.random().user;
        return user.globalName ?? user.username;
    }
};

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

        var output = "";
        var inKeyword = false;
        var keyword = "";

        // TODO: process longer keywords first somehow
        for (var i of text)
        {
            if (inKeyword)
            {
                keyword += i;

                if (specialCases.hasOwnProperty(keyword))
                {
                    var word = await specialCases[keyword](interaction);

                    output += `**${word}**`;
                    inKeyword = false;
                    keyword = "";
                }
                else if (wordlistMgr.wordlists.has(keyword))
                {
                    var wordlist = wordlistMgr.wordlists.get(keyword);
                    var word = wordlist[Math.floor(Math.random() * wordlist.length)];

                    output += `**${word}**`;
                    inKeyword = false;
                    keyword = "";
                }
                else if (keyword.length > wordlistMgr.maxKeywordLen)
                {
                    // invalid keyword, leaving as is
                    output += "$" + keyword;
                    inKeyword = false;
                    keyword = "";
                }
            }
            else if (i === "$")
            {
                inKeyword = true;
            }
            else
            {
                output += i;
            }
        }

        // in case the keyword is the last thing
        if (inKeyword)
        {
            if (specialCases.hasOwnProperty(keyword))
            {
                var word = await specialCases[keyword](interaction);
                
                output += `**${word}**`;
            }
            else if (wordlistMgr.wordlists.has(keyword))
            {
                var wordlist = wordlistMgr.wordlists.get(keyword);
                var word = wordlist[Math.floor(Math.random() * wordlist.length)];

                output += `**${word}**`;
            }
            else
            {
                // invalid keyword, leaving as is
                output += "$" + keyword;
            }
        }

        await interaction.reply(output);
    }
};