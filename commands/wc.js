const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "wc",
  description: "Shows Word and Character count",
  execute(msg, args, bot) {
    if (args.length === 0) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >wc Hello this is Foxel bot!"
      );
      return;
    }
    let fullMessage = args.join(" ");

    // Trim the message to remove leading/trailing spaces and split by spaces
    const words = fullMessage.trim().split(/\s+/);
    const wordCount = words.length;
    const charCountWithSpaces = fullMessage.length;
    const charCountWithoutSpaces = fullMessage.replace(/\s/g, "").length;

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Text Statistics", iconURL: bot.user.displayAvatarURL() })
      .setColor(0xf66464)
      .addFields(
        { name: "Word Count", value: wordCount.toString(), inline: true },
        { name: "Character Count (with spaces)", value: charCountWithSpaces.toString(), inline: true },
        { name: "Character Count (without spaces)", value: charCountWithoutSpaces.toString(), inline: true }
      );
    msg.channel.send({ embeds: [embed] });
  },
};