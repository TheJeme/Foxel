const Discord = require("discord.js");

module.exports = {
  name: "dice",
  description: "Rolls a dice.",
  execute(msg, args, bot) {
    let embed = new Discord.RichEmbed()
      .setAuthor(
        `${msg.author.username}#${msg.author.discriminator}`,
        msg.author.avatarURL
      )
      .setColor(0xf66464)
      .setDescription(`You rolled ${Math.floor(Math.random() * 6) + 1}.`);
    msg.channel.send(embed);
  },
};
