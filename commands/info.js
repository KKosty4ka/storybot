const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Info about the bot"),

    execute: async interaction =>
    {
        var embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("StoryBot")
            .addFields({
                name: "Current keywords are:",
                value: "$user\n" + [...wordlists.keys()].map(i => "$" + i).join("\n")
            })
            .setFooter({ text: "Made by KKosty4ka" });
        
        var github = new ButtonBuilder()
            .setLabel("GitHub")
            .setURL("https://github.com/KKosty4ka/storybot")
            .setStyle(ButtonStyle.Link);

        var row = new ActionRowBuilder()
	        .addComponents(github);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};