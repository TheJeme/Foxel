const Discord = require("discord.js");

module.exports = {
  name: "serverinfo",
  description: "Shows server info.",
  execute(msg, args) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in server!");
      return;
    }
    let embed = new Discord.MessageEmbed()
      .setTitle("Server Information")
      .setColor(0xf66464)
      .setThumbnail(msg.guild.iconURL())
      .addField("Server Name", msg.guild.name)
      .addField("Created on", msg.guild.createdAt)
      .addField("You joined", msg.guild.joinedAt)
      .addField("Total members", msg.guild.memberCount);
    msg.channel.send(embed);
  },
};
