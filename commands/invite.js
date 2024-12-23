const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "invite",
  description: "Sends an invitation link for this bot with the right permissions.",
  execute(msg, args, bot) {
    let embed = new EmbedBuilder()
      .setAuthor({ name: "Foxel Invitation Link", iconURL: bot.user.displayAvatarURL() })
      .setColor(0xf66464)
      .setDescription(
        "https://discord.com/api/oauth2/authorize?client_id=855042237687791646&permissions=2048&scope=bot"
      );
    msg.channel.send({ embeds: [embed] });
  },
};