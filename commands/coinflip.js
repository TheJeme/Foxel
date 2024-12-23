const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "coinflip",
  description: "Flips a coin.",
  execute(msg, args) {
    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${msg.author.username}`,
        iconURL: msg.author.displayAvatarURL(),
      })
      .setColor(0xf66464);

    if (Math.random() < 0.5) {
      embed.setDescription(`Coin landed on **heads**`);
    } else {
      embed.setDescription(`Coin landed on **tails**`);
    }
    msg.channel.send({ embeds: [embed] });
  },
};