const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "dice",
  description: "Rolls a dice.",
  execute(msg, args, bot) {
    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${msg.author.username}`,
        iconURL: msg.author.displayAvatarURL(),
      })
      .setColor(0xf66464)
      .setDescription(`You rolled **${Math.floor(Math.random() * 6) + 1}**.`);
    msg.channel.send({ embeds: [embed] });
  },
};