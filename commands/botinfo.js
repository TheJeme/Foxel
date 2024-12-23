const Discord = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Shows bot info.",
  execute(msg, args, bot) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Foxel Information")
      .setColor(0xf66464)
      .setThumbnail(bot.user.displayAvatarURL())
      .setDescription(
        `Version: **1.1**\nCreated on: **17.6.2021**\nCreated by: **thejeme**`
      );
    msg.channel.send(embed);
  },
};
