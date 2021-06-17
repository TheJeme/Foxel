const Discord = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Shows bot info.",
  execute(msg, args) {
    const embed = new Discord.RichEmbed()
      .setTitle("Foxel Information")
      .setColor(0xf66464)
      .setThumbnail("https://i.imgur.com/TibvXvx.jpg")
      .setDescription(
        `Version: **1.0**\nCreated on: **17.6.2021**\nCreated by: **Jeme#2039**`
      );
    msg.channel.send(embed);
  },
};
