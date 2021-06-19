const Discord = require("discord.js");

module.exports = {
  name: "coinflip",
  description: "Flips a coin.",
  execute(msg, args) {
    if (Math.random() < 0.5) {
      let embed = new Discord.RichEmbed()
        .setAuthor(
          `${msg.author.username}#${msg.author.discriminator}`,
          msg.author.avatarURL
        )
        .setColor(0xf66464)
        .setDescription(`Heads`);
      msg.channel.send(embed);
    } else {
      let embed = new Discord.RichEmbed()
        .setAuthor(
          `${msg.author.username}#${msg.author.discriminator}`,
          msg.author.avatarURL
        )
        .setColor(0xf66464)
        .setDescription(`Tails`);
      msg.channel.send(embed);
    }
  },
};
