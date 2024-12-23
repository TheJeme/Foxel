const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "serverinfo",
  description: "Shows server info.",
  execute(msg, args) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in a server!");
      return;
    }
    let embed = new EmbedBuilder()
      .setTitle("Server Information")
      .setColor(0xf66464)
      .setThumbnail(msg.guild.iconURL())
      .addFields(
        { name: "Server Name", value: msg.guild.name, inline: true },
        { name: "Created on", value: msg.guild.createdAt.toDateString(), inline: true },
        { name: "You joined", value: msg.member.joinedAt.toDateString(), inline: true },
        { name: "Total members", value: msg.guild.memberCount.toString(), inline: true }
      );
    msg.channel.send({ embeds: [embed] });
  },
};