const { SlashCommandBuilder } = require("discord.js");
const wordlistMgr = require("../wordlist_mgr");

var specialCases = {
    user: async interaction =>
    {
        // update member cache
        await interaction.guild.members.fetch();

        var user = interaction.guild.members.cache.random().user;
        return user.globalName ?? user.username;
    }
};

function pushbold(arr)
{
    if (arr[arr.length - 1] === "**")
    {
        arr.pop();
    }
    else
    {
        arr.push("**");
    }
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

        var output = [];
        var inKeyword = false;
        var keyword = "";

        // TODO: process longer keywords first somehow
        for (var i of text)
        {
            if (i === "$")
            {
                if (inKeyword)
                {
                    // invalid keyword, leaving as is
                    output.push("$");
                    output.push(keyword);
                }

                inKeyword = true;
                keyword = "";
            }
            else if (inKeyword)
            {
                keyword += i;

                if (specialCases.hasOwnProperty(keyword))
                {
                    var word = await specialCases[keyword](interaction);

                    pushbold(output);
                    output.push(word);
                    pushbold(output);
                    inKeyword = false;
                }
                else if (wordlistMgr.wordlists.has(keyword))
                {
                    var wordlist = wordlistMgr.wordlists.get(keyword);
                    var word = wordlist[Math.floor(Math.random() * wordlist.length)];

                    pushbold(output);
                    output.push(word);
                    pushbold(output);
                    inKeyword = false;
                }
                else if (keyword.length > wordlistMgr.maxKeywordLen)
                {
                    // invalid keyword, leaving as is
                    output.push("$");
                    output.push(keyword);
                    inKeyword = false;
                }
            }
            else
            {
                output.push(i);
            }
        }

        // in case the keyword is the last thing
        if (inKeyword)
        {
            if (specialCases.hasOwnProperty(keyword))
            {
                var word = await specialCases[keyword](interaction);

                pushbold(output);
                output.push(word);
                pushbold(output);
            }
            else if (wordlistMgr.wordlists.has(keyword))
            {
                var wordlist = wordlistMgr.wordlists.get(keyword);
                var word = wordlist[Math.floor(Math.random() * wordlist.length)];

                pushbold(output);
                output.push(word);
                pushbold(output);
            }
            else
            {
                // invalid keyword, leaving as is
                output.push("$");
                output.push(keyword);
            }
        }

        output = output.join("");

        if (output.trim().length === 0)
        {
            await interaction.reply("[empty]"); // TODO: something better
            return;
        }

        await interaction.reply(output);
    }
};