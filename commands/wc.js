const Discord = require("discord.js");

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

    const embed = new Discord.MessageEmbed()
      .setAuthor("Text Statistics", bot.user.displayAvatarURL())
      .setColor(0xf66464)
      .addField("Word Count", wordCount)
      .addField("Character Count (with spaces)", charCountWithSpaces)
      .addField("Character Count (without spaces)", charCountWithoutSpaces);
    msg.channel.send(embed);
  },
};