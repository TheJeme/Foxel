const Discord = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Shows user info.",
  execute(msg, args, bot) {
    if (args.length !== 1) {
      msg.channel.send("Incorrect use.\n**Example:** >userinfo @foxel#4142");
      return;
    }

    let embed = new Discord.RichEmbed()
      .setTitle(`${args[0]} Information`)
      .setThumbnail(bot.user.avatarURL)
      .setColor(0xf66464)
      .addField("Server Name", msg.guild.name)
      .addField("Total members", msg.guild.memberCount);
    msg.channel.send(embed);
  },
};
