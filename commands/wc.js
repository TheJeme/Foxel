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
    var fullMessage = args.join(" ");
    console.log(fullMessage);
    const embed = new Discord.MessageEmbed()
      .setAuthor("Text Statistics", bot.user.displayAvatarURL())
      .setColor(0xf66464)
      .addField("Word Count", fullMessage.split(" ").length)
      .addField("Character Count (with spaces)", fullMessage.length)
      .addField(
        "Character Count (without spaces)",
        fullMessage.replace(/\s/g, "").length
      );
    msg.channel.send(embed);
  },
};
