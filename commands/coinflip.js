const Discord = require("discord.js");

module.exports = {
  name: "coinflip",
  description: "Flips a coin.",
  execute(msg, args) {
    let embed = new Discord.MessageEmbed()
      .setAuthor(
        `${msg.author.username}#${msg.author.discriminator}`,
        msg.author.displayAvatarURL()
      )
      .setColor(0xf66464);

    if (Math.random() < 0.5) {
      embed.setDescription(`Coin landed on heads`);
    } else {
      embed.setDescription(`Coin landed on tails`);
    }
    msg.channel.send(embed);
  },
};
