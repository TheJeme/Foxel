const Discord = require("discord.js");

module.exports = {
  name: "weather",
  description: "Shows weather in given place.",
  execute(msg, args, bot) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Weather")
      .setColor(0xf66464)
      .setThumbnail(bot.user.displayAvatarURL());
    msg.channel.send(embed);
  },
};
